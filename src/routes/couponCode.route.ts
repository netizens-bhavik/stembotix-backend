import { Router } from 'express';
import validationMiddleware from '@/middlewares/validation.middleware';
import { Routes } from '@interfaces/routes.interface';
import passport from 'passport';
import passportConfig from '@/config/passportConfig';
import CouponCodeController from '@/controllers/couponCode.controller';
import {
  ApplyCouponDto,
  CouponCodeDto,
  DiscountCodeDto,
} from '@/dtos/couponCode.dto';

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
      passport.authenticate('jwt', { session: false }),
      validationMiddleware(CouponCodeDto, 'body'),

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
      passport.authenticate('jwt', { session: false }),
      validationMiddleware(DiscountCodeDto, 'body'),
      this.couponcodeController.createCouponByAdmin
    );
    this.router.get(
      `/coupon`,
      passport.authenticate('jwt', { session: false }),
      this.couponcodeController.getDiscountCoupon
    );
    this.router.post(
      `/applyFlatCouponCode`,
      passport.authenticate('jwt', { session: false }),
      validationMiddleware(ApplyCouponDto, 'body'),
      this.couponcodeController.applyFlatCode
    );

    this.router.put(
      `/coupon/:id`,
      passport.authenticate('jwt', { session: false }),
      validationMiddleware(DiscountCodeDto, 'body'),
      this.couponcodeController.updateDiscountCoupon
    );
    this.router.delete(
      `/coupon/:id`,
      passport.authenticate('jwt', { session: false }),
      this.couponcodeController.deleteDiscountCoupon
    );

    this.router.delete(
      `/couponCode/:cartId`,
      passport.authenticate('jwt', { session: false }),
      this.couponcodeController.deleteDiscountCouponUser
    );

    this.router.post(
      `/applyCoupon/:cartId`,
      passport.authenticate('jwt', { session: false }),
      this.couponcodeController.getCouponcode
    );
    this.router.put(
      `/couponCode`,
      passport.authenticate('jwt', { session: false }),
      this.couponcodeController.updateCouponOnApply
    );

    this.router.get(
      `/allUserAppliedCoupon`,
      passport.authenticate('jwt', { session: false }),
      this.couponcodeController.getAllUserAppliedCoupon
    );
  }
}
export default CouponCodeRoute;
