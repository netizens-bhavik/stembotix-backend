import DB from '@databases';
import { HttpException } from '@/exceptions/HttpException';
import { Product } from '@/interfaces/product.interface';
import { Op } from 'sequelize';
import { Course } from '@/interfaces/course.interface';
import sequelize from 'sequelize';
import moment from 'moment';

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
  public isInstitute(user): boolean {
    return user.role === 'Institute';
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

    const orderDate = queryObject.orderDate
      ? moment(queryObject.orderDate, 'DD-MM-YYYY')
      : null;

    const response = await this.orderitem.findAndCountAll({
      where: {
        [DB.Sequelize.Op.and]: [
          { ProductId: { [DB.Sequelize.Op.ne]: null } },
          orderDate
            ? {
                createdAt: {
                  [DB.Sequelize.Op.gte]: orderDate,
                },
              }
            : {},
        ],
      },
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
      limit: pageSize,
      offset: pageNo,
      order: [[`${sortBy}`, `${order}`]],
    });
    let data = [];
    data = response.rows.filter((record) => {
      if (orderDate) {
        const date = new Date(record.createdAt);
        if (moment(date).format('L') === moment(orderDate).format('L')) {
          return true;
        }
      } else {
        return true;
      }
    });

    return { totalCount: data.length, records: data };
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

    const orderDate = queryObject.orderDate
      ? moment(queryObject.orderDate, 'DD-MM-YYYY')
      : null;

    const response = await this.orderitem.findAndCountAll({
      where: {
        [DB.Sequelize.Op.and]: [
          { CourseId: { [DB.Sequelize.Op.ne]: null } },
          orderDate ? { createdAt: { [DB.Sequelize.Op.gte]: orderDate } } : {},
        ],
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

    let data = [];
    data = response.rows.filter((record) => {
      if (orderDate) {
        const date = new Date(record.createdAt);
        if (moment(date).format('L') === moment(orderDate).format('L')) {
          return true;
        }
      } else {
        return true;
      }
    });

    return { totalCount: data.length, records: data };
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

  public async getOrderCourseDataByInstructor(
    user,
    queryObject
  ): Promise<{ totalCount: number; records: (Course | undefined)[] }> {
    if (!this.isInstructor(user))
      throw new HttpException(403, 'Forbidden Resource');

    const sortBy = queryObject.sortBy ? queryObject.sortBy : 'createdAt';
    const order = queryObject.order || 'DESC';
    // pagination
    const pageSize = queryObject.pageRecord ? queryObject.pageRecord : 10;
    const pageNo = queryObject.pageNo ? (queryObject.pageNo - 1) * pageSize : 0;
    // Search
    const [search, searchCondition] = queryObject.search
      ? [`%${queryObject.search}%`, DB.Sequelize.Op.iLike]
      : ['', DB.Sequelize.Op.ne];
    const orderDate = queryObject.orderDate
      ? moment(queryObject.orderDate, 'DD-MM-YYYY')
      : null;

    const response = await this.orderitem.findAndCountAll({
      where: {
        [DB.Sequelize.Op.and]: [
          { CourseId: { [DB.Sequelize.Op.ne]: null } },
          orderDate ? { createdAt: { [DB.Sequelize.Op.gte]: orderDate } } : {},
        ],
      },
      include: [
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
        {
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
      ],
      limit: pageSize,
      offset: pageNo,
      order: [[`${sortBy}`, `${order}`]],
    });
    let data = [];
    data = response.rows.filter((record) => {
      if (orderDate) {
        const date = new Date(record.createdAt);
        if (moment(date).format('L') === moment(orderDate).format('L')) {
          return true;
        }
      } else {
        return true;
      }
    });
    if (!data) throw new HttpException(409, 'No data found');
    return { totalCount: data.length, records: data };
  }
  public async getOrderProductDataByInstructor(
    user,
    queryObject
  ): Promise<{ totalCount: number; records: (Course | undefined)[] }> {
    if (!this.isInstructor(user))
      throw new HttpException(403, 'Forbidden Resource');

    const sortBy = queryObject.sortBy ? queryObject.sortBy : 'createdAt';
    const order = queryObject.order || 'DESC';
    // pagination
    const pageSize = queryObject.pageRecord ? queryObject.pageRecord : 10;
    const pageNo = queryObject.pageNo ? (queryObject.pageNo - 1) * pageSize : 0;
    // Search
    const [search, searchCondition] = queryObject.search
      ? [`%${queryObject.search}%`, DB.Sequelize.Op.iLike]
      : ['', DB.Sequelize.Op.ne];
    const orderDate = queryObject.orderDate
      ? moment(queryObject.orderDate, 'DD-MM-YYYY')
      : null;

    const response = await this.orderitem.findAndCountAll({
      where: {
        [DB.Sequelize.Op.and]: [
          orderDate ? { createdAt: { [DB.Sequelize.Op.gte]: orderDate } } : {},
        ],
      },
      include: [
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
    let data = [];
    data = response.rows.filter((record) => {
      if (orderDate) {
        const date = new Date(record.createdAt);
        if (moment(date).format('L') === moment(orderDate).format('L')) {
          return true;
        }
      } else {
        return true;
      }
    });
    return { totalCount: data.length, records: data };
  }

  public async getOrderDataofProductByInstitute(
    user,
    queryObject
  ): Promise<{ totalCount: number; records: (Course | undefined)[] }> {
    if (!this.isInstitute(user))
      throw new HttpException(403, 'Forbidden Resource');

    const sortBy = queryObject.sortBy ? queryObject.sortBy : 'createdAt';
    const order = queryObject.order || 'DESC';
    // pagination
    const pageSize = queryObject.pageRecord ? queryObject.pageRecord : 10;
    const pageNo = queryObject.pageNo ? (queryObject.pageNo - 1) * pageSize : 0;
    // Search
    const [search, searchCondition] = queryObject.search
      ? [`%${queryObject.search}%`, DB.Sequelize.Op.iLike]
      : ['', DB.Sequelize.Op.ne];

    const orderDate = queryObject.orderDate
      ? moment(queryObject.orderDate, 'DD-MM-YYYY')
      : null;

    const response = await this.orderitem.findAndCountAll({
      where: {
        [DB.Sequelize.Op.and]: [
          orderDate ? { createdAt: { [DB.Sequelize.Op.gte]: orderDate } } : {},
        ],
      },
      include: [
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

    let data = [];
    data = response.rows.filter((record) => {
      if (orderDate) {
        const date = new Date(record.createdAt);
        if (moment(date).format('L') === moment(orderDate).format('L')) {
          return true;
        }
      } else {
        return true;
      }
    });

    return { totalCount: data.length, records: data };
  }
}
export default AllOrderService;
