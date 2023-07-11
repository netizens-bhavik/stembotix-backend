import { compare } from 'bcrypt';
import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import { SECRET_KEY, CLIENT_URL } from '@config';
import DB from '@databases';
import { RegisterUserDto, LoginUserDto } from '@dtos/users.dto';
import { HttpException } from '@exceptions/HttpException';
import { User } from '@interfaces/users.interface';
import { Role } from '@/interfaces/role.instance';
import { isEmpty } from '@utils/util';
import EmailService from './email.service';
import { MailPayload } from '@/interfaces/mailPayload.interface';
class AuthService {
  public users = DB.User;
  public roles = DB.Role;
  public refreshToken = DB.RefreshToken;
  public user = DB.User;
  public accountHash = DB.AccountVerification;
  public trainers = DB.Trainer;
  public emailService = new EmailService();
  private accessTokenExpiry: number = 60 * 60 * 24;
  public passwordToken = DB.ResetPasswordToken;
  public attempts: number = 0;
  public ATTEMPTS_LIMIT: number = 5;

  public async signup(
    userData: RegisterUserDto
  ): Promise<{ accessToken: string; refreshToken; user: User }> {
    if (isEmpty(userData)) throw new HttpException(400, 'userData is empty');

    const findUser: User = await this.users.findOne({
      where: DB.Sequelize.and({ email: userData.email }),
    });
    if (findUser)
      throw new HttpException(
        409,
        `This email ${userData.email} already exists`
      );

    const roleData: Role = await this.roles.findOne({
      where: { id: userData.role },
    });
    const createUserData: User = await this.users.create({
      ...userData,
      role_id: roleData.id,
      role: roleData.roleName,
    });
    if (roleData.roleName.match(/Instructor/i)) {
      await this.trainers.create({
        user_id: createUserData.id,
      });
    }
    const token = crypto.randomBytes(20).toString('hex');
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
    const refreshToken = await this.refreshToken.createToken(createUserData);
    return {
      accessToken,
      refreshToken,
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

    if (isEmpty(userData)) throw new HttpException(400, 'userData is empty');

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
    if (!isPasswordMatching) {
      this.attempts++;
      if (this.attempts >= this.ATTEMPTS_LIMIT) {
        setTimeout(() => {
          this.attempts = 0;
        }, 300000);

        throw new HttpException(
          429,
          'Your account has been temporary disable because of too many wrong attempt please try again after sometime or click on forgotten password to reset password'
        );
      }
      throw new HttpException(409, 'Wrong Password');
    }

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
    accessToken: string;
    refreshToken: string;
  }> {
    const findRecord = await this.accountHash.findOne({
      where: { hash },
    });
    if (!findRecord) {
      throw new HttpException(404, 'Token Expired');
    }
    const userUpdate = await this.users.update(
      { isEmailVerified: true },
      { where: { id: findRecord.user_id }, returning: true }
    );
    if (!userUpdate) throw new HttpException(500, 'Please try again');
    await this.accountHash.destroy({ where: { hash } });

    const user = userUpdate[1][0];
    const token = jwt.sign({ id: user.id }, SECRET_KEY, {
      expiresIn: this.accessTokenExpiry,
    });
    const refreshToken = await this.refreshToken.createToken(user);
    const response = {
      message: 'Email verified successfully',
      accessToken: token,
      refreshToken: refreshToken,
    };
    return response;
  }
  public async resendMail(id): Promise<{ message }> {
    let user = await this.users.findOne({ where: { id: id } });
    if (!user) throw new HttpException(404, 'User not found');
    let token = await this.accountHash.findOne({
      where: {
        user_id: id,
      },
    });
    if (!token) {
      token = crypto.randomBytes(20).toString('hex');
      await this.accountHash.create({
        hash: token,
        user_id: id,
      });
    }
    const mailData: MailPayload = {
      templateData: {
        firstName: user.firstName,
        link: `${CLIENT_URL}/verifyRegisters/${token.hash}`,
      },
      mailerData: {
        to: user.email,
      },
    };
    this.emailService.accountVerification(mailData);

    return { message: 'Email sent successfully' };
  }

  public async forgotPassword(email: string) {
    const emailRecord = await this.users.findOne({
      where: { email },
    });
    if (!emailRecord) throw new HttpException(400, 'Account not found');
    const token = crypto.randomBytes(20).toString('hex');
    await this.passwordToken.createToken(token, emailRecord);

    const mailData: MailPayload = {
      templateData: {
        firstName: emailRecord.firstName,
        link: `${CLIENT_URL}/verify-password/${token}`,
      },
      mailerData: {
        to: email,
      },
    };
    await this.emailService.forgotPassword(mailData);
    return { message: 'Reset password mail sent successfully' };
  }
  public async verifyPasswordtoken(token: string) {
    const record = await this.passwordToken.findOne({
      where: { hash: token },
    });
    if (!record) throw new HttpException(404, 'Invalid token');
    const isInvalid = await this.passwordToken.verifyToken(record);
    if (isInvalid) throw new HttpException(400, 'Token is Expired');
    return { message: 'Valid Token' };
  }

  public async resetPassword(
    token: string,
    newPassword: string,
    confirmPassword: string
  ) {
    const record = await this.passwordToken.findOne({
      where: { hash: token },
    });
    if (!record) throw new HttpException(401, 'link has been expired');
    if (newPassword !== confirmPassword)
      throw new HttpException(400, 'Passwords do not match');
    const userRecord = await this.users.update(
      { password: newPassword },
      { where: { id: record.user_id } }
    );
    if (!userRecord) throw new HttpException(500, 'Error occurred try again');
    record.destroy();
    return { message: 'Password reset successfully' };
  }
}

export default AuthService;
