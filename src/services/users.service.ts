import { hash } from 'bcrypt';
import DB from '@databases';
import { RegisterUserDto, LoginUserDto } from '@dtos/users.dto';
import { HttpException } from '@exceptions/HttpException';
import { User } from '@interfaces/users.interface';
import { isEmpty } from '@utils/util';

class UserService {
  public users = DB.User;

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
    userData: RegisterUserDto
  ): Promise<User> {
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
}

export default UserService;
