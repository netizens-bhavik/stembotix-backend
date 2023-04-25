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

  public isTrainer(user): boolean {
    return user.role === 'Instructor' || user.role === 'Institute';
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
      console.log(order);
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

        const paymentData = {
          payment_id: order.payment_id,
          razorpay_order_id: order.razorpay_order_id,
          razorpay_signature: order.razorpay_signature,
        };
        console.log(paymentData);
        const verification = await this.order.update(paymentData, {
          where: { id: order.id },
        });
        console.log(verification);
        if (!verification) {
          throw new HttpException(500, 'Payment failed');
        }

        return order;
      } else {
        throw new HttpException(400, 'Payment verification failed');
      }
    } else {
      throw new HttpException(404, 'Course not found');
    }
  }
  public async getCouponCodebyCourseId({ courseId }) {
    const response = await this.couponCode.findAll({
      where: {
        course_id: courseId,
      },
    });
    return response;
  }
}
export default CouponCodeService;
