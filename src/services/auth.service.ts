import { compare, hash } from "bcrypt";
import jwt from "jsonwebtoken";
import { SECRET_KEY } from "@config";
import DB from "@databases";
import { RegisterUserDto } from "@dtos/users.dto";
import { HttpException } from "@exceptions/HttpException";
import { TokenData } from "@interfaces/auth.interface";
import { User } from "@interfaces/users.interface";
import { isEmpty } from "@utils/util";

class AuthService {
  public users = DB.User;
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

    const createUserData: User = await this.users.create(userData);

    return {
      user: {
        id: createUserData.id,
        fullName: createUserData.fullName,
        firstName: createUserData.firstName,
        lastName: createUserData.lastName,
        email: createUserData.email,
        isEmailVerified: createUserData.isEmailVerified,
        date_of_birth: createUserData.date_of_birth,
        role: createUserData.role,
      },
    };
  }

  public async login(userData): Promise<{ cookie: string; findUser: User }> {
    let refreshTokenData = userData?.cookie || null;

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
    if (!isPasswordMatching)
      throw new HttpException(409, "Password not matching");
    const token = jwt.sign({ id: findUser.id }, SECRET_KEY, {
      expiresIn: 3600,
    });
    if (!refreshTokenData) {
      refreshTokenData = await this.refreshToken.createToken(findUser);
    }

    return {
      accessToke: token,
      refreshTokenData,
      refreshTokenData,
      findUser,
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

  public createCookie(tokenData: TokenData): string {
    return tokenData;
  }
}

export default AuthService;
