import DB from '@databases';
import Razorpay from 'razorpay';
import { HttpException } from '@exceptions/HttpException';
import { RAZORPAY_KEY_ID, RAZORPAY_KEY_SECRET } from '@config';
import crypto from 'crypto';
import { MailPayloads } from '@/interfaces/mailPayload.interface';
import EmailService from './email.service';
import { Op } from 'sequelize';
import { Subscribe } from '@/interfaces/liveStream.interface';

class SubscriptionService {
  public user = DB.User;
  public livestream = DB.LiveStream;
  public subscribelivestream = DB.SubscribeEvent;
  public instituteinstructor = DB.InstituteInstructor;
  public emailService = new EmailService();

  public async addSubscription(user, subscriptionPrice, liveStreamId) {
    const instance = new Razorpay({
      key_id: RAZORPAY_KEY_ID,
      key_secret: RAZORPAY_KEY_SECRET,
    });

    const checkLivestream = await this.livestream.findByPk(liveStreamId);
    const sortBy = 'updatedAt';
    const orderBy = 'DESC';

    if (!checkLivestream) {
      throw new HttpException(404, 'Event Not Found');
    }
    const restrictedUser = await this.user.findOne({
      where: DB.Sequelize.and(
        {
          id: user.id,
        },
        {
          is_email_verified: false,
        }
      ),
    });
    if (restrictedUser) throw new HttpException(403, 'Forbidden Recources');
    const response = await this.subscribelivestream.findOne({
      where: DB.Sequelize.and(
        {
          user_id: user.id,
        },
        { livestream_id: liveStreamId }
      ),
      order: [[`${sortBy}`, `${orderBy}`]],
    });
    if (response?.payment_id && response?.razorpay_signature)
      throw new HttpException(400, 'Your Event is Already Booked');
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
    const response = await this.subscribelivestream.findOne({
      where: {
        id: subscriptionId,
      },
    });
    if (response.payment_id || response.razorpay_signature) {
      throw new HttpException(400, 'Your Event is Already Booked');
    }
    const res = await this.livestream.findOne({
      where: { id: response.livestreamId },
    });
    const subscriptionRecord = await this.subscribelivestream.findAll({
      where: {
        id: subscriptionId,
      },
      include: [
        {
          model: this.user,
        },
      ],
    });
    let users: string[] = [];
    await subscriptionRecord.map((index) => {
      users.push(index.User.email as string);
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
    const digest = hmac.digest('hex');

    if (digest !== razorpay_signature)
      throw new HttpException(400, 'Transaction is not legit');

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
      const mailerData: MailPayloads = {
        templateData: {
          Title: res.title,
          StartingTime: res.startTime,
          StartingDate: res.date,
        },
        mailerData: {
          to: users,
        },
      };
      this.emailService.sendEventstartMail(mailerData);
      throw new HttpException(200, 'Payment successfull');
    }
  }
  public async getVerifiedSubscriptionUser(livestreamId): Promise<Subscribe> {
    const response = await this.subscribelivestream.findAll({
      where: {
        livestream_id: livestreamId,
        [Op.and]: [
          {
            payment_id: {
              [Op.not]: null,
            },
          },
          {
            razorpay_signature: {
              [Op.not]: null,
            },
          },
        ],
      },
    });
    return response;
  }
  public async getAllBookedEventByUserId(
    user,
    queryObject
  ): Promise<{ totalCount: number; records: string }> {
    // Search
    const [search, searchCondition] = queryObject.search
      ? [`%${queryObject.search}%`, DB.Sequelize.Op.iLike]
      : ['', DB.Sequelize.Op.ne];

    const response = await this.subscribelivestream.findAndCountAll({
      where: DB.Sequelize.and({
        [Op.and]: [
          { payment_id: { [Op.ne]: null } },
          { razorpay_order_id: { [Op.ne]: null } },
          { razorpay_signature: { [Op.ne]: null } },
          { user_id: user.id },
        ],
      }),
      include: {
        model: this.livestream,
        where: {
          title: { [searchCondition]: search },
        },
        include: [
          {
            model: this.user,
          },
          {
            model: this.user,
            as: 'Institute',
          },
        ],
      },
    });
    return response;
  }
}
export default SubscriptionService;
