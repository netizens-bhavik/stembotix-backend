import DB from '@databases';
import Razorpay from 'razorpay';
import { HttpException } from '@exceptions/HttpException';
import { RAZORPAY_KEY_ID, RAZORPAY_KEY_SECRET } from '@config';
import { VerifyOrderDto } from '@/dtos/subscribeLiveEvent.dto';
import crypto from 'crypto';

class SubscriptionService {
  public user = DB.User;
  public livestream = DB.Livestream;
  public subscribelivestream = DB.SubscribeEvent;

  public async addSubscription(user, subscriptionPrice, liveStreamId) {
    const instance = new Razorpay({
      key_id: RAZORPAY_KEY_ID,
      key_secret: RAZORPAY_KEY_SECRET,
    });
    const responseFromOrderAPI = await instance.orders.create({
      amount: subscriptionPrice,
      currency: 'INR',
    });
    const orderData = {
      subscriptionPrice,
      razorpay_order_id: responseFromOrderAPI.id,
      userId: user.id,
      livestreamId: liveStreamId,
    };
    const order = await this.subscribelivestream.create(orderData);
    return order;
  }

  public async verifysubscription(userId, orderBody, subscriptionId) {
    const subscriptionRecord = await this.subscribelivestream.findOne({
      where: {
        user_id: userId,
      },
    });

    if (!subscriptionRecord) throw new HttpException(403, 'Resource Forbidden');
    const {
      paymentId: payment_id,
      razorpayOrderId: razorpay_order_id,
      razorpaySignature: razorpay_signature,
    } = orderBody;

    const keySecret = RAZORPAY_KEY_SECRET;
    const hmac = crypto.createHmac('sha256', keySecret);
    hmac.update(razorpay_order_id + '|' + payment_id);
    // const digest = hmac.digest('hex');

    // if (digest !== razorpay_signature)
    //   throw new HttpException(400, 'Transaction is not legit');

    const paymentData = {
      payment_id,
      razorpay_order_id,
      razorpay_signature,
    };

    const verification = await this.subscribelivestream.update(paymentData, {
      where: { id: subscriptionId },
    });
    if (!verification) {
      throw new HttpException(500, 'Payment failed');
    }
    if (verification) {
      throw new HttpException(200, 'Payment successfull');
    }
  }
}
export default SubscriptionService;
