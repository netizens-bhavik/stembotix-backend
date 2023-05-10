import DB from '@databases';
import { Mail } from '@/interfaces/mailPayload.interface';
import { RegisterUserDTO } from '@dtos/users.dto';
import { HttpException } from '@exceptions/HttpException';
import { User } from '@interfaces/users.interface';
import { isEmpty } from '@utils/util';
import { Op } from 'sequelize';
import EmailService from './email.service';
import moment from 'moment';
class UserService {
  public users = DB.User;
  public course = DB.Course;
  public product = DB.Product;
  public role = DB.Role;
  public emailService = new EmailService();

  public isSuperAdmin(userData): boolean {
    return userData.role === 'SuperAdmin';
  }
  public isAdmin(userData): boolean {
    return userData.role === 'SuperAdmin' || userData.role === 'Admin';
  }
  public async createUserbySuperAdmin({ adminDetail, user }) {
    if (!this.isSuperAdmin(user)) throw new HttpException(401, 'Unauthorized');
    const existEmail = await this.users.findOne({
      where: {
        email: adminDetail.email,
      },
    });
    if (existEmail) throw new HttpException(409, 'Email already exist');
    const record = await this.role.findOne({
      where: {
        role_name: adminDetail.role,
      },
    });
    const createAdmin = await this.users.create({
      ...adminDetail,
      role_id: record.id,
    });
    if (createAdmin) {
      var userUpdate = await this.users.update(
        { isEmailVerified: true },
        { where: { id: createAdmin.id }, returning: true }
      );
      if (!userUpdate) throw new HttpException(500, 'Please try again');
    }
    return {
      id: userUpdate[1][0].id,
      fullName: userUpdate[1][0].fullName,
      firstName: userUpdate[1][0].firstName,
      lastName: userUpdate[1][0].lastName,
      email: userUpdate[1][0].email,
      role: userUpdate[1][0].role,
    };
  }
  public async updateUserDetailBySuperAdmin({ user, userId, userDetail }) {
    if (!this.isSuperAdmin(user)) throw new HttpException(401, 'Unauthorized');
    const record = await this.users.findOne({
      where: {
        id: userId,
      },
    });
    if (!record) throw new HttpException(409, 'No data found');
    const data = await this.users.update(
      { ...userDetail },
      {
        where: {
          id: userId,
        },
        returning: true,
      }
    );
    return {
      id: data[1][0].id,
      fullName: data[1][0].fullName,
      firstName: data[1][0].firstName,
      lastName: data[1][0].lastName,
      email: data[1][0].email,
      role: data[1][0].role,
    };
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
    if (!this.isSuperAdmin(loggedUser))
      throw new HttpException(401, 'Unauthorized');
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
    if (!this.isSuperAdmin(loggedUser))
      throw new HttpException(401, 'Unauthorized');
    if (isEmpty(userData)) throw new HttpException(400, 'userData is empty');

    const findUser: User = await this.users.findByPk(userId);
    if (!findUser) throw new HttpException(409, "User doesn't exist");

    await this.users.update(userData, { where: { id: userId } });

    const updateUser: User = await this.users.findByPk(userId);
    return updateUser;
  }

  public async deleteUser(loggedUser, userId): Promise<User> {
    if (!this.isSuperAdmin(loggedUser))
      throw new HttpException(401, 'Unauthorized');
    if (isEmpty(userId)) throw new HttpException(400, "User doesn't existId");

    const findUser = await this.users.findOne({
      where: {
        id: userId,
      },
    });
    if (!findUser) {
      throw new HttpException(409, "User doesn't exist");
    } else {
      await this.users.destroy({ where: { id: userId } });

      const mailerData: Mail = {
        templateData: {
          email: loggedUser.email,
          user: findUser.firstName,
          name: findUser.lastName,
        },
        mailData: {
          from: loggedUser.email,
          to: findUser.email,
        },
      };
      this.emailService.sendMailtoUserforAccountDeletion(mailerData);
    }

    return findUser;
  }
  public async getAllUserMonthWise(user) {
    if (!this.isAdmin(user)) throw new HttpException(401, 'Unauthorized');
    const months = [];
    for (let i = 1; i <= 12; i++) {
      const recordsPerMonth = await this.users.findAndCountAll({
        where: {
          createdAt: {
            [Op.gte]: moment()
              .month(i - 1)
              .startOf('month')
              .year(moment().year())
              .toDate(),

            [Op.lt]: moment()
              .month(i - 1)
              .endOf('month')
              .year(moment().year())
              .toDate(),
          },
        },
      });
      months.push(recordsPerMonth);
    }
    return months;
  }
}

export default UserService;
