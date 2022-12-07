import { compare } from "bcrypt";
import crypto from "crypto";
import jwt from "jsonwebtoken";
import { SECRET_KEY, CLIENT_URL } from "@config";
import DB from "@databases";
import { RegisterUserDto, LoginUserDto } from "@dtos/users.dto";
import { HttpException } from "@exceptions/HttpException";
import { User } from "@interfaces/users.interface";
import { Role } from "@/interfaces/role.instance";
import { isEmpty } from "@utils/util";
import EmailService from "./email.service";
import { MailPayload } from "@/interfaces/mailPayload.interface";
class AuthService {
  public users = DB.User;
  public roles = DB.Role;
  public refreshToken = DB.RefreshToken;
  public accountHash = DB.AccountVerification;
  public trainers = DB.Trainer;
  public emailService = new EmailService();
  private accessTokenExpiry: number = 60;

  public async signup(
    userData: RegisterUserDto
  ): Promise<{ accessToken: string; user: User }> {
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
    if (userData.role.match(/trainer/i)) {
      await this.trainers.create({
        user_id: createUserData.id,
      });
    }
    const token = crypto.randomBytes(20).toString("hex");
    await this.accountHash.create({
      hash: token,
      user_id: createUserData.id,
    });
    const mailData: MailPayload = {
      templateData: {
        firstName: createUserData.firstName,
        link: `${CLIENT_URL}/verifyRegisters/${token}`,
      },
      mailerData: {
        to: createUserData.email,
      },
    };
    this.emailService.accountVerification(mailData);

    const accessToken = jwt.sign({ id: createUserData.id }, SECRET_KEY, {
      expiresIn: this.accessTokenExpiry,
    });
    return {
      accessToken,
      user: {
        id: createUserData.id,
        fullName: createUserData.fullName,
        firstName: createUserData.firstName,
        lastName: createUserData.lastName,
        email: createUserData.email,
        isEmailVerified: createUserData.isEmailVerified,
        date_of_birth: createUserData.date_of_birth,
        role: createUserData.role,
        role_id: createUserData.role_id,
      },
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
      expiresIn: this.accessTokenExpiry,
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

  public async verifyEmail(hash: string): Promise<{
    message: string;
  }> {
    const findRecord = await this.accountHash.findOne({
      where: { hash },
    });
    if (!findRecord) {
      throw new HttpException(404, "Token Expired");
    }
    const userUpdate = await this.users.update(
      { isEmailVerified: true },
      { where: { id: findRecord.user_id } }
    );
    if (!userUpdate) throw new HttpException(500, "Please try again");
    await this.accountHash.destroy({ where: { hash } });

    return {
      message: "Email verified successfully",
    };
  }
  public async resendMail(id: string): Promise<{ message: string }> {
    let user = await this.users.findOne({ where: { id: id } });
    if (!user) throw new HttpException(404, "User not found");
    let token = await this.accountHash.findOne({
      where: {
        user_id: id,
      },
    });
    if (!token) {
      token = crypto.randomBytes(20).toString("hex");
      await this.accountHash.create({
        hash: token,
        user_id: id,
      });
    }
    const mailData: MailPayload = {
      templateData: {
        firstName: user.firstName,
        link: `${CLIENT_URL}/verifyRegisters/${token}`,
      },
      mailerData: {
        to: user.email,
      },
    };
    this.emailService.accountVerification(mailData);

    return { message: "Email sent successfully" };
  }

  public createCookie(tokenData: string) {
    return tokenData;
  }
}

export default AuthService;
