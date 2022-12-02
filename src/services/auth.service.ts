import { compare } from "bcrypt";
import jwt from "jsonwebtoken";
import { SECRET_KEY } from "@config";
import DB from "@databases";
import { RegisterUserDto, LoginUserDto } from "@dtos/users.dto";
import { HttpException } from "@exceptions/HttpException";
import { User } from "@interfaces/users.interface";
import { Role } from "@/interfaces/role.instance";
import { isEmpty } from "@utils/util";

class AuthService {
  public users = DB.User;
  public roles = DB.Role;
  public refreshToken = DB.RefreshToken;

  public async signup(userData: RegisterUserDto): Promise<User> {
    if (isEmpty(userData)) throw new HttpException(400, "userData is empty");

    const findUser: User = await this.users.findOne({
      where: { email: userData.email },
    });
    if (findUser)
      throw new HttpException(
        409,
        `This email ${userData.email} already exists`
      );

    const roleData: Role = await this.roles.findOne({
      where: { role_name: userData.role },
    });
    const createUserData: User = await this.users.create({
      ...userData,
      role_id: roleData.id,
    });

    return {
      id: createUserData.id,
      fullName: createUserData.fullName,
      firstName: createUserData.firstName,
      lastName: createUserData.lastName,
      email: createUserData.email,
      isEmailVerified: createUserData.isEmailVerified,
      date_of_birth: createUserData.date_of_birth,
      role: createUserData.role,
      role_id: createUserData.role_id,
    };
  }

  public async login(userData: LoginUserDto): Promise<{
    accessToken: string;
    refreshToken: string;
    user: User;
  }> {
    let refreshToken = userData?.cookie || null;

    if (isEmpty(userData)) throw new HttpException(400, "userData is empty");

    const findUser: User = await this.users.findOne({
      where: { email: userData.email },
    });
    if (!findUser)
      throw new HttpException(
        409,
        `This email ${userData.email} was not found`
      );

    const isPasswordMatching: boolean = await compare(
      userData.password,
      findUser.password
    );
    if (!isPasswordMatching) throw new HttpException(409, "Wrong Password");

    const token = jwt.sign({ id: findUser.id }, SECRET_KEY, {
      expiresIn: 3600,
    });
    if (!refreshToken) {
      refreshToken = await this.refreshToken.createToken(findUser);
    }

    return {
      accessToken: token,
      refreshToken,
      user: findUser,
    };
  }

  public async logout(userData: User): Promise<User> {
    if (isEmpty(userData)) throw new HttpException(400, "userData is empty");

    const findUser: User = await this.users.findOne({
      where: { email: userData.email, password: userData.password },
    });
    if (!findUser) throw new HttpException(409, "User doesn't exist");

    return findUser;
  }

  public createCookie(tokenData: string) {
    return tokenData;
  }
}

export default AuthService;
