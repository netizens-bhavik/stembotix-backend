import DB from '@databases';
import { RegisterUserDTO } from '@dtos/users.dto';
import { HttpException } from '@exceptions/HttpException';
import { User } from '@interfaces/users.interface';
import { isEmpty } from '@utils/util';
import moment from 'moment';
import sequelize, { Op } from 'sequelize';
class UserService {
  public users = DB.User;
  public course = DB.Course;
  public product = DB.Product;

  public isAdmin(userData): boolean {
    return userData.role === 'Admin';
  }

  public async findAllUser(
    loggedUser,
    queryObject
  ): Promise<{ totalCount: number; records: User[] }> {
    if (!this.isAdmin(loggedUser)) throw new HttpException(401, 'Unauthorized');
    // sorting
    const sortBy = queryObject.sortBy ? queryObject.sortBy : 'createdAt';
    const order = queryObject.order === 'DESC' ? 'DESC' : 'ASC';
    // pagination
    const pageSize = queryObject.pageRecord ? queryObject.pageRecord : 10;
    const pageNo = queryObject.pageNo ? (queryObject.pageNo - 1) * pageSize : 0;
    // Search
    const [search, searchCondition] = queryObject.search
      ? [`%${queryObject.search}%`, DB.Sequelize.Op.like]
      : ['', DB.Sequelize.Op.ne];
    // role filter
    const [role, roleCondition] = queryObject.role
      ? [`%${queryObject.role}%`, DB.Sequelize.Op.like]
      : ['', DB.Sequelize.Op.ne];

    const userCount = await this.users.findAndCountAll({
      where: { role: { [roleCondition]: role } },
    });
    const allUser: User[] = await this.users.findAll({
      where: DB.Sequelize.and(
        DB.Sequelize.or(
          { firstName: { [searchCondition]: search } },
          { lastName: { [searchCondition]: search } },
          { email: { [searchCondition]: search } }
        ),
        { role: { [roleCondition]: role } }
      ),
      limit: pageSize,
      offset: pageNo,
      order: [[`${sortBy}`, `${order}`]],
    });
    // const data = await redisFunction('allUsers',allUser)
    return { totalCount: userCount.count, records: allUser };
  }

  public async findUserById(loggedUser, userId: string): Promise<User> {
    if (!this.isAdmin(loggedUser)) throw new HttpException(401, 'Unauthorized');
    if (isEmpty(userId)) throw new HttpException(400, 'UserId is empty');

    const findUser: User = await this.users.findByPk(userId);
    if (!findUser) throw new HttpException(409, "User doesn't exist");

    return findUser;
  }

  public async updateUser(
    loggedUser,
    userId: string,
    userData: RegisterUserDTO
  ): Promise<User> {
    if (!this.isAdmin(loggedUser)) throw new HttpException(401, 'Unauthorized');
    if (!(loggedUser.id === userId || loggedUser.role === 'Admin'))
      throw new HttpException(403, 'Access Forbidden');
    if (isEmpty(userData)) throw new HttpException(400, 'userData is empty');

    const findUser: User = await this.users.findByPk(userId);
    if (!findUser) throw new HttpException(409, "User doesn't exist");

    await this.users.update(userData, { where: { id: userId } });

    const updateUser: User = await this.users.findByPk(userId);
    return updateUser;
  }

  public async deleteUser(loggedUser, userId: string): Promise<User> {
    if (!(loggedUser.id === userId || loggedUser.role === 'Admin'))
      throw new HttpException(403, 'Access Forbidden');
    if (isEmpty(userId)) throw new HttpException(400, "User doesn't existId");

    const findUser: User = await this.users.findByPk(userId);
    if (!findUser) throw new HttpException(409, "User doesn't exist");

    await this.users.destroy({ where: { id: userId } });

    return findUser;
  }
  public async getAllUserMonthWise(user) {
    if (!this.isAdmin(user)) throw new HttpException(401, 'Unauthorized');
    const month = 3;
    const recordsPerMonth = await this.users.findAll({
      attributes: [
        [
          sequelize.fn('date_trunc', 'month', sequelize.col('created_at')),
          'month',
        ],
        [sequelize.fn('count', sequelize.col('id')), 'count'],
      ],
      group: [
        sequelize.fn('date_trunc', 'day', sequelize.col('created_at')),
        sequelize.col('User.created_at'),
      ],
      where: {
        createdAt: {
          // [Op.gte]: new Date(new Date().getFullYear(), 0, 1),
          [Op.gte]: moment('0101', 'MMDD')
            .add(month - 1, 'months')
            .toDate(),
          [Op.lt]: moment('0101', 'MMDD').add(month, 'months').toDate(),
        },
      },
    });
    return recordsPerMonth;
  }
}

export default UserService;
