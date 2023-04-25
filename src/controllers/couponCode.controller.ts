import CouponCodeService from '@/services/couponCode.service';
import { NextFunction, Request, Response } from 'express';

class CouponCodeController {
  public couponCodeService = new CouponCodeService();

  public createCouponCode = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const loggedUser = req.user;
      const couponDetail = req.body;
      const createCoupon = await this.couponCodeService.createCouponCode({
        loggedUser,
        couponDetail,
      });
      res.status(200).send(createCoupon);
    } catch (err) {
      next(err);
    }
  };
  public getCouponCodebyCourseId = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const { courseId } = req.params;
      const createCoupon = await this.couponCodeService.getCouponCodebyCourseId(
        { courseId }
      );
      res.status(200).send(createCoupon);
    } catch (err) {
      next(err);
    }
  };
}
export default CouponCodeController;
