import DB from '@databases';
import { HttpException } from '@/exceptions/HttpException';
import EmailService from './email.service';
import { Product } from '@/interfaces/product.interface';
import { Op } from 'sequelize';
import { Course } from '@/interfaces/course.interface';

class AllOrderService {
  public product = DB.Product;
  public user = DB.User;
  public orderitem = DB.OrderItem;
  public order = DB.Order;
  public course = DB.Course;
  public trainer = DB.Trainer;
  public productuser = DB.ProductUser;

  public isAdmin(user): boolean {
    return user.role === 'Admin';
  }
  public isInstructor(user): boolean {
    return user.role === 'Instructor';
  }

  public async getAllDataOfProductOrder(
    user,
    queryObject
  ): Promise<{ totalCount: number; records: (Product | undefined)[] }> {
    if (!this.isAdmin(user)) throw new HttpException(403, 'Forbidden Resource');

    const sortBy = queryObject.sortBy ? queryObject.sortBy : 'createdAt';
    const order = queryObject.order || 'DESC';
    // pagination
    const pageSize = queryObject.pageRecord ? queryObject.pageRecord : 10;
    const pageNo = queryObject.pageNo ? (queryObject.pageNo - 1) * pageSize : 0;
    // Search
    const [search, searchCondition] = queryObject.search
      ? [`%${queryObject.search}%`, DB.Sequelize.Op.iLike]
      : ['', DB.Sequelize.Op.ne];
    const response = await this.orderitem.findAndCountAll({
      where: {
        ProductId: { [Op.ne]: null },
      },
      limit: pageSize,
      offset: pageNo,
      order: [[`${sortBy}`, `${order}`]],
      include: [
        {
          model: this.product,
          where: {
            title: { [searchCondition]: search },
          },
        },
        {
          model: this.order,
          where: DB.Sequelize.and({
            [Op.and]: [
              { payment_id: { [Op.ne]: null } },
              { razorpay_order_id: { [Op.ne]: null } },
              { razorpay_signature: { [Op.ne]: null } },
            ],
          }),
          include: { model: this.user },
        },
      ],
    });
    return { totalCount: response.count, records: response.rows };
  }

  public async getAllDataOfCourseOrder(
    user,
    queryObject
  ): Promise<{ totalCount: number; records: (Course | undefined)[] }> {
    if (!this.isAdmin(user)) throw new HttpException(403, 'Forbidden Resource');

    const sortBy = queryObject.sortBy ? queryObject.sortBy : 'createdAt';
    const order = queryObject.order || 'DESC';
    // pagination
    const pageSize = queryObject.pageRecord ? queryObject.pageRecord : 10;
    const pageNo = queryObject.pageNo ? (queryObject.pageNo - 1) * pageSize : 0;
    // Search
    const [search, searchCondition] = queryObject.search
      ? [`%${queryObject.search}%`, DB.Sequelize.Op.iLike]
      : ['', DB.Sequelize.Op.ne];
    const response = await this.orderitem.findAndCountAll({
      where: {
        CourseId: { [Op.ne]: null },
      },
      include: [
        {
          model: this.course,
          where: {
            title: { [searchCondition]: search },
          },
        },
        {
          model: this.order,
          where: DB.Sequelize.and({
            [Op.and]: [
              { payment_id: { [Op.ne]: null } },
              { razorpay_order_id: { [Op.ne]: null } },
              { razorpay_signature: { [Op.ne]: null } },
            ],
          }),
          include: { model: this.user },
        },
      ],

      limit: pageSize,
      offset: pageNo,
      order: [[`${sortBy}`, `${order}`]],
    });
    return response;
  }

  public async deleteOrderDatabyAdmin(
    user,
    orderId
  ): Promise<{ orderRes: number }> {
    if (!this.isAdmin(user)) throw new HttpException(401, 'Unauthorized');
    const orderRecord = await this.orderitem.findOne({
      where: {
        id: orderId,
      },
      include: [
        {
          model: this.order,
        },
      ],
    });
    if (!orderRecord) throw new HttpException(404, 'No data found');

    const resp = await this.orderitem.destroy({
      where: {
        id: orderId,
      },
    });
    if (resp === 1) {
      throw new HttpException(200, 'Order deleted successfully');
    }
    return { orderRes: resp };
  }

  public async getOrderDataofCourseByInstructor(
    user,
    queryObject
  ): Promise<{ totalCount: number; records: (Course | undefined)[] }> {
    const sortBy = queryObject.sortBy ? queryObject.sortBy : 'createdAt';
    const order = queryObject.order || 'DESC';
    // pagination
    const pageSize = queryObject.pageRecord ? queryObject.pageRecord : 10;
    const pageNo = queryObject.pageNo ? (queryObject.pageNo - 1) * pageSize : 0;
    // Search
    const [search, searchCondition] = queryObject.search
      ? [`%${queryObject.search}%`, DB.Sequelize.Op.iLike]
      : ['', DB.Sequelize.Op.ne];

    const userId = user.id;
    const response = await this.orderitem.findAndCountAll({
      include: [
        {
          model: this.course,
          include: [
            {
              model: this.trainer,
              include: {
                model: this.user,
                where: {
                  id: userId,
                },
              },
            },
          ],
        },
        {
          model: this.product,
          include: {
            model: this.user,
            // where: {
            //   id: userId,
            // },
            through: { attributes: [] },
          },
        },
      ],

      limit: pageSize,
      offset: pageNo,
      order: [[`${sortBy}`, `${order}`]],
    });

    return { totalCount: response.count, records: response.rows };
  }
  public async getOrderDataofProductByInstructor(
    user,
    queryObject
  ): Promise<{ totalCount: number; records: (Course | undefined)[] }> {
    const sortBy = queryObject.sortBy ? queryObject.sortBy : 'createdAt';
    const order = queryObject.order || 'DESC';
    // pagination
    const pageSize = queryObject.pageRecord ? queryObject.pageRecord : 10;
    const pageNo = queryObject.pageNo ? (queryObject.pageNo - 1) * pageSize : 0;
    // Search
    const [search, searchCondition] = queryObject.search
      ? [`%${queryObject.search}%`, DB.Sequelize.Op.iLike]
      : ['', DB.Sequelize.Op.ne];

    const response = await this.user.findAndCountAll({
      where: {
        id: user.id,
      },

      include: [
        {
          model: this.product,
          where: {
            title: {
              [searchCondition]: search,
            },
          },
          include: {
            model: this.orderitem,
            include: {
              model: this.order,
              where: DB.Sequelize.and({
                [Op.and]: [
                  { payment_id: { [Op.ne]: null } },
                  { razorpay_order_id: { [Op.ne]: null } },
                  { razorpay_signature: { [Op.ne]: null } },
                  { user_id: user.id },
                ],
              }),
              include: {
                model: this.user,
              },
            },
          },
        },
      ],

      limit: pageSize,
      offset: pageNo,
      order: [[`${sortBy}`, `${order}`]],
    });
    return response;
  }
}
export default AllOrderService;
