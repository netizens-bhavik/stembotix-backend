import DB from '@databases';
import Razorpay from 'razorpay';
import { HttpException } from '@exceptions/HttpException';
import { RAZORPAY_KEY_ID, RAZORPAY_KEY_SECRET } from '@config';
import { VerifyOrderDTO } from '@/dtos/order.dto';
import crypto from 'crypto';
import { OrderData } from '../utils/ruleEngine/orderData.rule';
class OrderService {
  public user = DB.User;
  public order = DB.Order;
  public orderItem = DB.OrderItem;
  public cartItem = DB.CartItem;
  public cart = DB.Cart;
  public course = DB.Course;
  public product = DB.Product;
  public review = DB.Review;
  public trainer = DB.Trainer;
  public coursetype = DB.CourseType;

  public orderData = new OrderData();

  public isTrainer(user): boolean {
    return user.role === 'Admin';
  }
  public async listOrdersByAdmin({ trainer, queryObject }) {
    const OrderData = await this.orderData.getOrderData({
      trainer,
      queryObject,
    });
    return OrderData;
  }
  public async listOrders(userId: string) {
    const data = await this.order.findAll({
      where: { user_id: userId },
      include: {
        model: this.orderItem,
        include: [
          {
            model: this.product,
            include: [
              {
                model: this.user,
                through: { attributes: [] },
              },
              {
                model: this.review,
              },
            ],
          },
          {
            model: this.course,
            include: [
              {
                model: this.coursetype,
              },
              {
                model: this.trainer,
                through: { attributes: [] },
                include: { model: this.user },
              },
              {
                model: this.review,
              },
            ],
          },
        ],
      },
      order: [['createdAt', 'DESC']],
    });
    if (!data) throw new HttpException(404, 'No order exist');
    return data;
  }

  public async addOrder(user, amount) {
    // Razorpay Instance
    const instance = new Razorpay({
      key_id: RAZORPAY_KEY_ID,
      key_secret: RAZORPAY_KEY_SECRET,
    });
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
    // Call to order endpoint
    const responseFromOrderAPI = await instance.orders.create({
      amount,
      currency: 'INR',
    });
    const orderData = {
      amount,
      razorpay_order_id: responseFromOrderAPI.id,
      userId: user.id,
    };
    // Generating order
    const order = await this.order.create(orderData);
    return order;
  }
  public async verifyOrder(userId: string, orderBody: VerifyOrderDTO) {
    const orderRecord = await this.order.findOne({
      where: { user_id: userId },
    });
    if (!orderRecord) throw new HttpException(403, 'Resource Forbidden');

    const {
      orderId: order_id,
      paymentId: payment_id,
      razorpayOrderId: razorpay_order_id,
      razorpaySignature: razorpay_signature,
      cartItems,
    } = orderBody;
    // Verify Signature
    const keySecret = RAZORPAY_KEY_SECRET;
    const hmac = crypto.createHmac('sha256', keySecret);
    hmac.update(razorpay_order_id + '|' + payment_id);
    // const digest = hmac.digest('hex');

    // if (digest !== razorpay_signature)
    //   throw new HttpException(400, 'Transaction is not legit');

    // If payment is verified
    const paymentData = {
      payment_id,
      razorpay_order_id,
      razorpay_signature,
    };

    const verification = await this.order.update(paymentData, {
      where: { id: order_id },
    });
    if (!verification) {
      throw new HttpException(500, 'Payment failed');
    }

    // Generating order and cart item mapping

    const items = await this.cartItem.findAll({
      where: { id: cartItems },
      include: {
        model: this.cart,
        include: { model: this.user },
      },
    });
    // if (!items) throw new HttpException(404, 'Cart Items not found');
    const isOwnItems = items.every((item) => item.Cart.User.id === userId);
    if (!isOwnItems) throw new HttpException(403, 'Invalid Cart Items');

    const orderItems = [];
    items.forEach((item) => {
      const obj = {
        item_type: item.item_type,
        quantity: item.quantity,
        ProductId: item.product_id,
        CourseId: item.course_id,
        OrderId: order_id,
      };
      orderItems.push(obj);
    });

    const orderCartItems = await this.orderItem.bulkCreate(orderItems);
    if (orderCartItems) {
      await this.cartItem.destroy({
        where: { id: cartItems },
      });
    }

    return orderCartItems;
  }
}
export default OrderService;
