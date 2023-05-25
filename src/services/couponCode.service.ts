import DB from '@/databases';
import { HttpException } from '@/exceptions/HttpException';
import Razorpay from 'razorpay';
import { RAZORPAY_KEY_ID, RAZORPAY_KEY_SECRET } from '@config';
import crypto from 'crypto';
import { RedisFunctions } from '@/redis';

function generateCouponCode(length: number): string {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let code = '';
  for (let i = 0; i < length; i++) {
    code += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return code;
}

function generatePaymentIdAndSignature() {
  // Generate a random amount between 1000 and 100000 paise (Rs. 10 to Rs. 1000)
  const amount = Math.floor(Math.random() * 99000) + 1000;

  // Generate a random order ID
  const orderId =
    Math.random().toString(36).substring(2, 15) +
    Math.random().toString(36).substring(2, 15);

  // Generate a random key and secret
  const key =
    Math.random().toString(36).substring(2, 15) +
    Math.random().toString(36).substring(2, 15);
  const secret =
    Math.random().toString(36).substring(2, 15) +
    Math.random().toString(36).substring(2, 15);

  // Generate a random payment ID
  const paymentId =
    Math.random().toString(36).substring(2, 15) +
    Math.random().toString(36).substring(2, 15);

  // Generate the signature using the random key and secret
  const hmac = crypto.createHmac('sha256', secret);
  hmac.update(orderId + '|' + amount);
  const signature = hmac.digest('hex');

  // Return the payment ID and signature as an object
  return {
    amount: amount,
    orderId: orderId,
    key: key,
    secret: secret,
    paymentId: paymentId,
    signature: signature,
  };
}

class CouponCodeService {
  public user = DB.User;
  public course = DB.Course;
  public couponCode = DB.CouponCode;
  public order = DB.Order;
  public discountCode = DB.DiscountCode;
  public cart = DB.Cart;
  public cartItem = DB.CartItem;
  public discount = DB.Discount;
  public discountCouponMap = DB.DiscountCouponMap;
  public orderItem = DB.OrderItem;
  public product = DB.Product;
  private redisFunctions = new RedisFunctions();

  public isTrainer(user): boolean {
    return user.role === 'Instructor' || user.role === 'Institute';
  }

  public isAdmin(user): boolean {
    return user.role === 'SuperAdmin';
  }
  public isInstructor(user): boolean {
    return user.role === 'Instructor';
  }
  public isInstitute(user): boolean {
    return user.role === 'Institute';
  }
  public async createCouponCode({ couponDetail, loggedUser }) {
    if (!this.isTrainer(loggedUser)) {
      throw new HttpException(403, 'Forbidden Resource');
    }

    const res = await this.user.findOne({
      where: {
        id: loggedUser.id,
        role: 'Instructor',
      },
      as: 'InstructorCoupon',
    });
    const response = await this.user.findOne({
      where: {
        id: loggedUser.id,
        role: 'Institute',
      },
      as: 'InstituteCoupon',
    });

    let couponCode = generateCouponCode(8);
    let data = await this.couponCode.findOne({
      where: {
        couponCode: couponCode,
      },
    });
    while (data) {
      couponCode = generateCouponCode(8);
      data = await this.couponCode.findOne({
        where: {
          couponCode: couponCode,
        },
      });
    }

    const createCoupon = await this.couponCode.create({
      ...couponDetail,
      couponCode: couponCode,
      instructorId: res?.id,
      instituteId: response?.id,
    });
    const course = await this.course.findOne({
      where: { id: couponDetail.course_id },
    });
    if (course) {
      const instance = new Razorpay({
        key_id: RAZORPAY_KEY_ID,
        key_secret: RAZORPAY_KEY_SECRET,
      });
      const price = course.price;
      const priceInPaise = Math.round(parseFloat(price) * 100);

      const paymentDetails = generatePaymentIdAndSignature();
      const paymentId = paymentDetails.paymentId;
      const signature = paymentDetails.signature;

      const orderResposne = await instance.orders.create({
        amount: priceInPaise,
        currency: 'INR',
        receipt: paymentId,
        payment_capture: '1',
      });

      const orderData = {
        amount: orderResposne.amount,
        razorpay_order_id: orderResposne.id,
        payment_id: `pay_${paymentId}`,
        razorpay_signature: signature,
        couponCodeId: createCoupon.id,
      };

      const order = await this.order.create(orderData);
      const items = await this.order.findAll({
        where: {
          id: order.id,
        },
      });
      const res = await this.course.findOne({
        where: {
          id: couponDetail.course_id,
        },
      });

      const orderItems = [];
      items.forEach((item) => {
        const obj = {
          item_type: 'Course',
          quantity: item.quantity,
          CourseId: res?.id,
          OrderId: order.id,
        };
        orderItems.push(obj);
      });
      const orderCartItems = await this.orderItem.bulkCreate(orderItems);

      const orderRecord = await this.orderItem.findOne({
        where: DB.Sequelize.and({ order_id: order.id }),
        include: [{ model: this.course }, { model: this.product }],
      });

      let isProduct = true;
      if (orderRecord.CourseId) {
        isProduct = false;
      }
      await this.redisFunctions.removeDataFromRedis();
      return orderRecord;
    } else {
      throw new HttpException(404, 'Course not found');
    }
  }
  public async updateCouponOnApply({ couponDetail, user }) {
    const response = await this.couponCode.findOne({
      where: {
        couponCode: couponDetail.couponCode,
      },
    });
    const record = await this.order.findOne({
      where: {
        couponCodeId: response.id,
      },
    });
    if (record.userId === user.id) {
      throw new HttpException(409, 'You already used this coupon');
    }
    const now = new Date();
    const update = await this.order.update(
      { userId: user.id },
      {
        where: {
          couponCodeId: record.couponCodeId,
        },
        returning: true,
      }
    );
    const expirationTime = new Date(
      update[1][0].updatedAt.getTime() + 2 * 60000
    ); // 2 minutes from updatedAt

    if (update[1][0].updatedAt > expirationTime) {
      throw new HttpException(400, 'Coupon has already expired');
    }
    await this.redisFunctions.removeDataFromRedis();
    return update[1][0];
  }
  public async getCouponCodebyCourseIdbyInstitute({ courseId, user }) {
    if (!this.isInstitute(user)) {
      throw new HttpException(403, 'Forbidden Resource');
    }
    const cacheKey = `coupon:${courseId}:${user.id}`;
    const ifCacheKeyAlreadyExists = await this.redisFunctions.checkIfKeyExists(
      cacheKey
    );
    if (ifCacheKeyAlreadyExists) {
      return await this.redisFunctions.getRedisKey(cacheKey);
    }

    const response = await this.couponCode.findAll({
      where: {
        course_id: courseId,
        instituteId: user.id,
      },
    });
    if (!ifCacheKeyAlreadyExists) {
      await this.redisFunctions.setKey(cacheKey, JSON.stringify(response));
    }
    return response;
  }

  public async getCouponCodebyCourseIdbyInstructor({ courseId, user }) {
    if (!this.isInstructor(user)) {
      throw new HttpException(403, 'Forbidden Resource');
    }
    const cacheKey = `coupon:${courseId}:${user.id}`;
    const ifCacheKeyAlreadyExists = await this.redisFunctions.checkIfKeyExists(
      cacheKey
    );
    if (ifCacheKeyAlreadyExists) {
      return await this.redisFunctions.getRedisKey(cacheKey);
    }

    const response = await this.couponCode.findAll({
      where: {
        course_id: courseId,
        instructorId: user.id,
      },
    });

    if (!ifCacheKeyAlreadyExists) {
      await this.redisFunctions.setKey(cacheKey, JSON.stringify(response));
    }
    return response;
  }

  public async createCouponByAdmin({ couponDetail, user }) {
    if (!this.isAdmin(user)) {
      throw new HttpException(403, 'Forbidden Resource');
    }

    let couponCode = generateCouponCode(8);
    let data = await this.discountCode.findOne({
      where: {
        couponCode: couponCode,
      },
    });
    while (data) {
      couponCode = generateCouponCode(8);
      data = await this.discountCode.findOne({
        where: {
          couponCode: couponCode,
        },
      });
    }
    const expirationTime = new Date();
    expirationTime.setHours(expirationTime.getHours() + 12);
    const createCoupon = await this.discountCode.create({
      ...couponDetail,
      couponCode: couponCode,
      expirationTime: expirationTime,
    });
    await this.redisFunctions.removeDataFromRedis();
    return createCoupon;
  }
  public async applyFlatCode({ user, couponDetail }) {
    const coupon = couponDetail.couponCode;

    const userRecord = await this.user.findOne({
      where: {
        id: user.id,
      },
    });
    const data = await this.couponCode.findOne({
      where: {
        couponCode: coupon,
      },
    });
    if (data === null) throw new HttpException(409, 'Invalid coupon');
    const existingUser = await this.couponCode.findOne({
      where: {
        couponCode: coupon,
      },
      include: {
        model: this.user,
        attributes: ['fullName', 'firstName', 'lastName', 'id'],
        through: { attributes: [] },
      },
    });
    existingUser.Users.map((elem) => {
      if (elem.id === userRecord.id) {
        throw new HttpException(409, 'You already used this coupon');
      }
    });
    await userRecord.addCouponCodes(data);
    await this.redisFunctions.removeDataFromRedis();

    return { rows: existingUser };
  }

  public async getDiscountCoupon({
    user,
    queryObject,
  }): Promise<{ totalCount: number; records: object }> {
    if (!this.isAdmin(user)) {
      throw new HttpException(403, 'Forbidden Resource');
    }

    const sortBy = queryObject.sortBy ? queryObject.sortBy : 'createdAt';
    const order = queryObject.order || 'DESC';
    // pagination
    const pageSize = queryObject.pageRecord ? queryObject.pageRecord : 10;
    const pageNo = queryObject.pageNo ? (queryObject.pageNo - 1) * pageSize : 0;
    // Search
    const [search, searchCondition] = queryObject.search
      ? [`%${queryObject.search}%`, DB.Sequelize.Op.iLike]
      : ['', DB.Sequelize.Op.ne];

    const cacheKey = `discountCoupon:${sortBy}:${order}:${pageSize}:${pageNo}:${search}`;
    const cachedData = await this.redisFunctions.getRedisKey(cacheKey);
    if (cachedData) {
      return cachedData;
    }

    const data = await this.discountCode.findAndCountAll({
      where: {
        discount: {
          [searchCondition]: search,
        },
      },
      limit: pageSize,
      offset: pageNo,
      order: [[`${sortBy}`, `${order}`]],
    });
    await this.redisFunctions.setKey(
      cacheKey,
      JSON.stringify({
        totalCount: data.count,
        records: data.rows,
      })
    );

    return { totalCount: data.count, records: data.rows };
  }

  public async updateDiscountCoupon({
    user,
    discountDetail,
    discountId,
  }): Promise<{ totalCount: number; records: object }> {
    if (!this.isAdmin(user)) {
      throw new HttpException(403, 'Forbidden Resource');
    }

    const record = await this.discountCode.findOne({
      where: {
        id: discountId,
      },
    });
    if (!record) throw new HttpException(404, 'No Data Found');
    const data = await this.discountCode.update(
      {
        ...discountDetail,
      },
      {
        where: {
          id: discountId,
        },
        returning: true,
      }
    );
    await this.redisFunctions.removeDataFromRedis();
    return { totalCount: data[0], records: data[1] };
  }

  public async deleteDiscountCoupon({
    user,
    discountId,
  }): Promise<{ count: number }> {
    if (!this.isAdmin(user)) {
      throw new HttpException(403, 'Forbidden Resource');
    }
    const record = await this.discountCode.findOne({
      where: {
        id: discountId,
      },
    });
    if (!record) throw new HttpException(404, 'No Data Found');
    const data = await this.discountCode.destroy({
      where: {
        id: discountId,
      },
    });
    await this.redisFunctions.removeDataFromRedis();
    return { count: data };
  }
  public async deleteDiscountCouponUser({
    user,
    cartId,
  }): Promise<{ count: number }> {
    const record = await this.discountCouponMap.findOne({
      where: {
        cart_id: cartId,
      },
    });
    if (!record) throw new HttpException(404, 'No Data Found');

    const data = await this.discountCouponMap.destroy({
      where: {
        cart_id: cartId,
      },
    });
    await this.redisFunctions.removeDataFromRedis();
    return { count: data };
  }

  public async getCouponcode({
    couponDetail,
    cartId,
  }): Promise<{ rows: object }> {
    const coupon = couponDetail.couponCode;
    const cacheKey = `getAllCouponCode:${cartId}`;
    const cachedData = await this.redisFunctions.getRedisKey(cacheKey);
    if (cachedData) {
      return cachedData;
    }
    const data = await this.discountCode.findOne({
      where: {
        couponCode: coupon,
      },
    });
    if (data === null) throw new HttpException(409, 'Invalid coupon');
    const existingCart = await this.discountCouponMap.findAndCountAll({
      where: {
        cart_id: cartId,
        discountCouponId: data.id,
      },
    });
    if (existingCart.count > 0) {
      throw new HttpException(409, 'You have already user this coupon');
    }
    const newRecord = await this.discountCouponMap.create({
      cart_id: cartId,
      discountCouponId: data.id,
    });
    await this.redisFunctions.setKey(cacheKey, JSON.stringify(data));
    return { rows: data };
  }

  public async getAllUserAppliedCoupon({ user }) {
    const cacheKey = `userAppliedCoupon:${user.id}`;
    const cachedData = await this.redisFunctions.getRedisKey(cacheKey);
    if (cachedData) {
      return cachedData;
    }
    const record = await this.couponCode.findAndCountAll({
      where: DB.Sequelize.or(
        { instructorId: user.id },
        {
          instituteId: user.id,
        }
      ),
    });
    const data = [];
    await Promise.all(
      record.rows.map(async (elem) => {
        const response = await this.order.findAll({
          where: {
            couponCodeId: elem.id,
          },
          attributes: ['id', 'CouponCodeId'],
          include: {
            model: this.user,
            attributes: ['id', 'fullName', 'firstName', 'lastName'],
          },
        });
        data.push(...response);
      })
    );
    await this.redisFunctions.setKey(cacheKey, JSON.stringify(data));
    return data;
  }
}
export default CouponCodeService;
