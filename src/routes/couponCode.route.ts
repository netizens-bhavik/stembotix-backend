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
    this.router.get(
      `/institute${this.path}/:courseId`,
      passport.authenticate('jwt', { session: false }),

      this.couponcodeController.getCouponCodebyCourseIdbyInstitute
    );
    this.router.get(
      `/instructor${this.path}/:courseId`,
      passport.authenticate('jwt', { session: false }),

      this.couponcodeController.getCouponCodebyCourseIdbyInstructor
    );
    this.router.post(
      `/coupon`,
      [passport.authenticate('jwt', { session: false })],
      this.couponcodeController.createCouponByAdmin
    );
    this.router.get(
      `/coupon`,
      passport.authenticate('jwt', { session: false }),

      this.couponcodeController.getDiscountCoupon
    );
    this.router.put(
      `/coupon/:id`,
      passport.authenticate('jwt', { session: false }),

      this.couponcodeController.updateDiscountCoupon
    );
    this.router.delete(
      `/coupon/:id`,
      passport.authenticate('jwt', { session: false }),

      this.couponcodeController.deleteDiscountCoupon
    );
    this.router.post(
      `/applyCoupon`,
      [passport.authenticate('jwt', { session: false })],
      this.couponcodeController.getCoupon
    );
    this.router.post(
      `/applyCouponCode`,
      [passport.authenticate('jwt', { session: false })],
      this.couponcodeController.getCouponcode
    );
  }
}
export default CouponCodeRoute;
