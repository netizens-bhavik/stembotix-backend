import { hash } from 'bcrypt';
import DB from '@databases';
import { RegisterUserDto, LoginUserDto } from '@dtos/users.dto';
import { HttpException } from '@exceptions/HttpException';
import { User } from '@interfaces/users.interface';
import { isEmpty } from '@utils/util';

class UserService {
  public users = DB.User;

  public isAdmin(userData): boolean {
    return userData.role === 'admin';
  }

  public async findAllUser(loggedUser): Promise<User[]> {
    if (!this.isAdmin(loggedUser)) throw new HttpException(401, 'Unauthorized');
    const allUser: User[] = await this.users.findAll();
    return allUser;
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
    if (!(loggedUser.id === userId || loggedUser.role === 'admin'))
      throw new HttpException(403, 'Access Forbidden');
    if (isEmpty(userData)) throw new HttpException(400, 'userData is empty');

    const findUser: User = await this.users.findByPk(userId);
    if (!findUser) throw new HttpException(409, "User doesn't exist");

    const hashedPassword = await hash(userData.password, 10);
    await this.users.update(
      { ...userData, password: hashedPassword },
      { where: { id: userId } }
    );

    const updateUser: User = await this.users.findByPk(userId);
    return updateUser;
  }

  public async deleteUser(loggedUser, userId: string): Promise<User> {
    if (!(loggedUser.id === userId || loggedUser.role === 'admin'))
      throw new HttpException(403, 'Access Forbidden');
    if (isEmpty(userId)) throw new HttpException(400, "User doesn't existId");

    const findUser: User = await this.users.findByPk(userId);
    if (!findUser) throw new HttpException(409, "User doesn't exist");

    await this.users.destroy({ where: { id: userId } });

    return findUser;
  }
}

export default UserService;
