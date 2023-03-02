import DB from '@databases';
import Razorpay from 'razorpay';
import { HttpException } from '@exceptions/HttpException';
import { isEmpty } from '@utils/util';
import { RAZORPAY_KEY_ID, RAZORPAY_KEY_SECRET } from '@config';
import { VerifyOrderDTO } from '@/dtos/order.dto';
import crypto from 'crypto';
import { OrderItem } from '@/interfaces/order.interface';
import sequelize from 'sequelize';

export class OrderData {
  public user = DB.User;
  public order = DB.Order;
  public orderItem = DB.OrderItem;
  public cartItem = DB.CartItem;
  public cart = DB.Cart;
  public course = DB.Course;
  public product = DB.Product;

  public isTrainer(user): boolean {
    return user.role === 'Admin';
  }
  public async getOrderData({ trainer, queryObject }) {
    let recommendation = [];

    recommendation = [];
    recommendation = await this.listOrdersByAdmin({ trainer, queryObject });
    recommendation = await this.getOrdersByAdmin({ trainer, queryObject });

    return recommendation;
  }

  public async listOrdersByAdmin({
    trainer,
    queryObject,
  }){
    if (!this.isTrainer(trainer)) {
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

    // const orderData = await this.orderItem.findAndCountAll({
    //   where: { deletedAt: null },
    // });
    const recommendation = await this.order.findAll({
      include: [
        {
          model: DB.User,
          where: DB.Sequelize.or(
            {
              firstName: {
                [searchCondition]: search,
              },
            },
            {
              lastName: {
                [searchCondition]: search,
              },
            }
          ),
        },
        { model: this.orderItem },
      ],

      limit: pageSize,
      offset: pageNo,
      order: [[`${sortBy}`, `${order}`]],
    });
    return recommendation;
  }
  public async getOrdersByAdmin({
    trainer,
    queryObject,
  }){
    if (!this.isTrainer(trainer)) {
      throw new HttpException(403, 'Forbidden Resource');
    }
    // const sortBy = queryObject.sortBy ? queryObject.sortBy : 'createdAt';
    // const order = queryObject.order || 'DESC';
    // // pagination
    // const pageSize = queryObject.pageRecord ? queryObject.pageRecord : 10;
    // const pageNo = queryObject.pageNo ? (queryObject.pageNo - 1) * pageSize : 0;
    // // Search
    // const [search, searchCondition] = queryObject.search
    //   ? [`%${queryObject.search}%`, DB.Sequelize.Op.iLike]
    //   : ['', DB.Sequelize.Op.ne];

    const recommendation = await this.orderItem.findAll({
      // where: {
      //   item_type: { [searchCondition]: search },
      // },
    //   limit: pageSize,
    //   offset: pageNo,
    //   order: [[`${sortBy}`, `${order}`]],
    });
    return recommendation;
  }
}
