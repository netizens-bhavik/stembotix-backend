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
  public getCouponCodebyCourseIdbyInstitute = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const { courseId } = req.params;
      const user = req.user;
      const createCoupon =
        await this.couponCodeService.getCouponCodebyCourseIdbyInstitute({
          courseId,
          user,
        });
      res.status(200).send(createCoupon);
    } catch (err) {
      next(err);
    }
  };

  public getCouponCodebyCourseIdbyInstructor = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const { courseId } = req.params;
      const user = req.user;
      const createCoupon =
        await this.couponCodeService.getCouponCodebyCourseIdbyInstructor({
          courseId,
          user,
        });
      res.status(200).send(createCoupon);
    } catch (err) {
      next(err);
    }
  };
  public createCouponByAdmin = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const user = req.user;
      const couponDetail = req.body;
      const createCoupon = await this.couponCodeService.createCouponByAdmin({
        user,
        couponDetail,
      });
      res.status(200).send(createCoupon);
    } catch (err) {
      next(err);
    }
  };
  public getDiscountCoupon = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const { search, pageRecord, pageNo, sortBy, order } = req.query;
      const queryObject = { search, pageRecord, pageNo, sortBy, order };
      const user = req.user;
      const createCoupon = await this.couponCodeService.getDiscountCoupon({
        user,
        queryObject,
      });
      res.status(200).send(createCoupon);
    } catch (err) {
      next(err);
    }
  };
  public updateDiscountCoupon = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const { id: discountId } = req.params;
      const discountDetail = req.body;
      const user = req.user;
      const createCoupon = await this.couponCodeService.updateDiscountCoupon({
        user,
        discountId,
        discountDetail,
      });
      res.status(200).send(createCoupon);
    } catch (err) {
      next(err);
    }
  };
  public deleteDiscountCoupon = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const { id: discountId } = req.params;
      const user = req.user;
      const createCoupon = await this.couponCodeService.deleteDiscountCoupon({
        user,
        discountId,
      });
      res.status(200).send(createCoupon);
    } catch (err) {
      next(err);
    }
  };
  public getCoupon = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const couponDetail = req.body;
      const user = req.user;
      const createCoupon = await this.couponCodeService.getCoupon({
        user,
        couponDetail,
      });
      res.status(200).send(createCoupon);
    } catch (err) {
      next(err);
    }
  };
  public getCouponcode = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const couponDetail = req.body;
      const user = req.user;
      const createCoupon = await this.couponCodeService.getCouponcode({
        user,
        couponDetail,
      });
      res.status(200).send(createCoupon);
    } catch (err) {
      next(err);
    }
  };
}
export default CouponCodeController;
