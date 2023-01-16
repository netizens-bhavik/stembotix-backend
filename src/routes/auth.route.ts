import { Router } from 'express';
import AuthController from '@controllers/auth.controller';
import {
  LoginUserDto,
  RegisterUserDto,
  ForgotPasswordDTO,
  ResetPasswordDTO,
} from '@dtos/users.dto';
import { Routes } from '@interfaces/routes.interface';
import validationMiddleware from '@middlewares/validation.middleware';
import passport from 'passport';

class AuthRoute implements Routes {
  public path = '/auth';
  public router = Router();
  public authController = new AuthController();

  constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.post(
      `${this.path}/signup`,
      validationMiddleware(RegisterUserDto, 'body'),
      this.authController.signUp
    );
    this.router.post(
      `${this.path}/login`,
      validationMiddleware(LoginUserDto, 'body'),
      this.authController.logIn
    );
    this.router.post(
      `${this.path}/refresh-token`,
      this.authController.refreshTokenUser
    );
    this.router.post(
      `${this.path}/verify-email/:hash`,
      this.authController.verifyEmail
    );
    this.router.post(
      `${this.path}/resend-verification`,
      passport.authenticate('jwt', { session: false }),
      this.authController.resendMail
    );
    this.router.get(
      `${this.path}/get-user-data`,
      passport.authenticate('jwt', { session: false }),
      this.authController.getUserData
    );
    this.router.post(
      `${this.path}/admin-login`,
      passport.authenticate('jwt', { session: false }),
      this.authController.  loginAdmin
    );
    this.router.post(
      `${this.path}/forgot-password`,
      validationMiddleware(ForgotPasswordDTO, 'body'),
      this.authController.forgotPassword
    );
    this.router.post(
      `${this.path}/verify-reset-token/:token`,
      this.authController.verifyPasswordToken
    );
    this.router.post(
      `${this.path}/reset-password/`,
      validationMiddleware(ResetPasswordDTO, 'body'),
      this.authController.resetPassword
    );
  }
}

export default AuthRoute;
