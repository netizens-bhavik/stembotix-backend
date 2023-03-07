import DB from '@databases';
import { HttpException } from '@exceptions/HttpException';
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
    let type = ['Course', 'Product','course','product'];
    if (type.includes(queryObject.search)) {
      recommendation = await this.searchByItemType({ trainer, queryObject });
    } else {
      recommendation = await this.searchByUserName({ trainer, queryObject });
    }
    return recommendation;
  }

  public async searchByUserName({ trainer, queryObject }) {
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

    const recommendation = await this.order.findAndCountAll({
      include: [
        {
          model: this.user,
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
        {
          model: this.orderItem,
        },
      ],
      limit: pageSize,
      offset: pageNo,
      order: [[`${sortBy}`, `${order}`]],
    });
    return recommendation;
  }
  public async searchByItemType({ trainer, queryObject }) {
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

    const recommendation = await this.order.findAndCountAll({
      include: [
        {
          model: this.user,
        },
        {
          model: this.orderItem,
          where: DB.Sequelize.and({
            item_type: { [searchCondition]: search },
          }),
        },
      ],

      limit: pageSize,
      offset: pageNo,
      order: [[`${sortBy}`, `${order}`]],
    });

    return recommendation;
  }
}
