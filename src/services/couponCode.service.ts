import DB from '@/databases';
import { HttpException } from '@/exceptions/HttpException';
import Razorpay from 'razorpay';
import { RAZORPAY_KEY_ID, RAZORPAY_KEY_SECRET } from '@config';
import crypto from 'crypto';

function generateCouponCode(length: number): string {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let code = '';
  for (let i = 0; i < length; i++) {
    code += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return code;
}

class CouponCodeService {
  public user = DB.User;
  public course = DB.Course;
  public couponCode = DB.CouponCode;
  public order = DB.Order;
  public discountCode = DB.DiscountCode;
  public cart = DB.Cart;
  public cartItem = DB.CartItem;

  public isTrainer(user): boolean {
    return user.role === 'Instructor' || user.role === 'Institute';
  }

  public isAdmin(user): boolean {
    return user.role === 'Admin';
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
    const expirationTime = new Date();
    expirationTime.setHours(expirationTime.getHours() + 12);

    const createCoupon = await this.couponCode.create({
      ...couponDetail,
      couponCode: couponCode,
      instructorId: res?.id,
      instituteId: response?.id,
      expirationTime: expirationTime,
    });
    const course = await this.course.findOne({
      where: { id: couponDetail.course_id },
    });
    const instance = new Razorpay({
      key_id: RAZORPAY_KEY_ID,
      key_secret: RAZORPAY_KEY_SECRET,
    });
    const price = course.price;
    const priceInPaise = Math.round(parseFloat(price) * 100);
    if (course.dataValues) {
      const responseFromOrderAPI = await instance.orders.create({
        amount: priceInPaise,
        currency: 'INR',
      });
      const orderData = {
        amount: responseFromOrderAPI.amount,
        razorpay_order_id: responseFromOrderAPI.id,
      };
      const order = await this.order.create(orderData);
      const responseFromFetchAPI = await instance.orders.fetch(
        order.razorpay_order_id
      );

      if (
        responseFromFetchAPI.status === 'created' &&
        responseFromFetchAPI.amount === order.amount
      ) {
        const keySecret = RAZORPAY_KEY_SECRET;
        const hmac = crypto.createHmac('sha256', keySecret);
        hmac.update(order.razorpay_order_id + '|' + order.payment_id);

        return createCoupon;
      } else {
        throw new HttpException(400, 'Payment verification failed');
      }
    } else {
      throw new HttpException(404, 'Course not found');
    }
  }
  public async getCouponCodebyCourseIdbyInstitute({ courseId, user }) {
    const response = await this.couponCode.findAll({
      where: {
        course_id: courseId,
        instituteId: user.id,
      },
    });
    return response;
  }
  public async getCouponCodebyCourseIdbyInstructor({ courseId, user }) {
    const response = await this.couponCode.findAll({
      where: {
        course_id: courseId,
        instructorId: user.id,
      },
    });
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
    return createCoupon;
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
    return { count: data };
  }
  public async getCoupon({ user, couponDetail }) {
    const coupon = couponDetail.couponCode;
    const userRecord = await this.user.findOne({
      where: {
        id: user.id,
      },
    });
    const data = await this.discountCode.findOne({
      where: {
        couponCode: coupon,
      },
      attributes: ['couponCode', 'discount'],
    });
    const record = await this.discountCode.update(
      {
        userId: user.id,
      },
      {
        where: {
          couponCode: coupon,
        },
      }
    );
    // record.addDiscountUser(userRecord);
    if (data === null) throw new HttpException(409, 'Invalid coupon');
    return data;
  }
  public async getCouponcode({
    user,
    couponDetail,
  }): Promise<{ rows: object }> {
    const coupon = couponDetail.couponCode;
    const userRecord = await this.user.findOne({
      where: {
        id: user.id,
      },
    });
    const data = await this.discountCode.findOne({
      where: {
        couponCode: coupon,
      },
    });
    const record = await this.discountCode.update(
      {
        userId: user.id,
      },
      {
        where: {
          id: data.id,
        },
      }
    );
    record.addDiscount(userRecord);
    if (data === null) throw new HttpException(409, 'Invalid coupon');

    return { rows: data };
  }
}
export default CouponCodeService;
