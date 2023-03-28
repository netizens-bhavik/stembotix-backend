import { Router } from 'express';
import { Routes } from '@interfaces/routes.interface';
import passport from 'passport';
import passportConfig from '@/config/passportConfig';
import validationMiddleware from '@/middlewares/validation.middleware';
import { AddOrderDto, VerifyOrderDto } from '@/dtos/subscribeLiveEvent.dto';
import SubscriptionController from '@/controllers/subscriptionLiveEvent.controller';

class SubscripeLiveStreamRoute implements Routes {
  public path = '/subscribe';
  public router = Router();
  public passport = passportConfig(passport);
  public subscribeController = new SubscriptionController();

  constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.post(
      `${this.path}/:liveStreamId`,
      passport.authenticate('jwt', { session: false }),
      validationMiddleware(AddOrderDto, 'body'),
      this.subscribeController.addSubscription
    );
    this.router.get(
      `${this.path}/getbookedevent`,
      passport.authenticate('jwt', { session: false }),
      this.subscribeController.getAllBookedEventByUserId
    );
    this.router.post(
      `${this.path}/verify/:subscriptionId`,
      passport.authenticate('jwt', { session: false }),
      validationMiddleware(VerifyOrderDto, 'body'),
      this.subscribeController.verifySubscription
    );

    this.router.get(
      `${this.path}/:livestreamId`,
      passport.authenticate('jwt', { session: false }),
      this.subscribeController.getVerifiedSubscriptionUser
    );
  }
}

export default SubscripeLiveStreamRoute;
