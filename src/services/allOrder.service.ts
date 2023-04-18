import DB from '@databases';
import { HttpException } from '@/exceptions/HttpException';
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

    // const startDate = queryObject.startDate
    //   ? new Date(queryObject.startDate)
    //   : new Date(0);
    // const endDate = queryObject.endDate
    //   ? new Date(queryObject.endDate)
    //   : new Date();

    const response = await this.orderitem.findAndCountAll({
      where: DB.Sequelize.or(
        {
          CourseId: { [Op.ne]: null },
        }
        // {
        //   createdAt: {
        //     [Op.between]: [startDate, endDate],
        //   },
        // }
      ),
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

  public async getOrderDataByInstructor(
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
    const data = [];
    const response = await this.orderitem.findAndCountAll({
      include: {
        model: this.product,
        where: {
          title: { [searchCondition]: search },
        },
        include: {
          model: this.user,
          where: DB.Sequelize.or({
            id: user.id,
          }),
          through: {},
        },
      },
      limit: pageSize,
      offset: pageNo,
      order: [[`${sortBy}`, `${order}`]],
    });
    data.push(...response.rows);

    const res = await this.orderitem.findAndCountAll({
      include: {
        model: this.course,
        where: {
          title: { [searchCondition]: search },
        },
        include: [
          {
            model: this.trainer,
            where: DB.Sequelize.or({
              userId: user.id,
            }),
            include: {
              model: this.user,
            },
          },
        ],
      },
      limit: pageSize,
      offset: pageNo,
      order: [[`${sortBy}`, `${order}`]],
    });
    data.push(...res.rows);
    return { totalCount: data.length, records: data };
  }

  public async getOrderDataofProductByInstitute(
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

    const response = await this.orderitem.findAndCountAll({
      include: [
        {
          model: this.product,
          where: {
            title: { [searchCondition]: search },
          },
          include: {
            model: this.user,
            where: DB.Sequelize.or({
              id: user.id,
            }),
            through: {},
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
