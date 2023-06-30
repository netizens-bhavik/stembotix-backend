import { Router } from 'express';
import UserSubscribeController from '@/controllers/userSubscrib.controller';
import validationMiddleware from '@middlewares/validation.middleware';
import { Routes } from '@interfaces/routes.interface';
import passport from 'passport';
import passportConfig from '@/config/passportConfig';
import { UserSubscribeDto } from '@/dtos/userSubscribe.dto';

class UserSubscribeRoute implements Routes {
  public path = '/subscribe';
  public router = Router();
  public userSubscribeController = new UserSubscribeController();
  public passport = passportConfig(passport);

  constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.post(
      `${this.path}`,
      passport.authenticate('jwt', { session: false }),
      validationMiddleware(UserSubscribeDto, 'body'),
      this.userSubscribeController.addUserSubcribe
    );
  }
}

export default UserSubscribeRoute;
