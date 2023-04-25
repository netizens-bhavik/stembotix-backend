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
    const priceInt = parseInt(price);
    if (course) {
      const responseFromOrderAPI = await instance.orders.create({
        amount: priceInt,
        currency: 'INR',
      });
      const orderData = {
        amount: priceInt,
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

        return order;
      } else {
        throw new HttpException(400, 'Payment verification failed');
      }
    } else {
      throw new HttpException(404, 'Course not found');
    }
  }
}
export default CouponCodeService;
