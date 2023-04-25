import { Router } from 'express';
import validationMiddleware from '@/middlewares/validation.middleware';
import { Routes } from '@interfaces/routes.interface';
import passport from 'passport';
import passportConfig from '@/config/passportConfig';
import CouponCodeController from '@/controllers/couponCode.controller';

class CouponCodeRoute implements Routes {
  public path = '/couponcode';
  public passport = passportConfig(passport);
  public router = Router();
  public couponcodeController = new CouponCodeController();

  constructor() {
    this.initializeRoutes();
  }
  private initializeRoutes() {
    this.router.post(
      `${this.path}`,
      [passport.authenticate('jwt', { session: false })],
      this.couponcodeController.createCouponCode
    );
    // this.router.get(
    //   `${this.path}/:courseId`,
    //   this.couponcodeController.getCoupon
    // );
  }
}
export default CouponCodeRoute;
