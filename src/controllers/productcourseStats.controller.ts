import CourseProductStatsService from '@/services/productcourseStats.service';
import { NextFunction, Request, Response } from 'express';

class CourseProductStatsController {
  public statsService = new CourseProductStatsService();

  public courseStatsforInstructor = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const user = req.user;
      const response = await this.statsService.courseStatsforInstructor(user);
      res.status(200).send(response);
    } catch (err) {
      next(err);
    }
  };
  public productStatsforInstructor = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const user = req.user;
      const response = await this.statsService.productStatsforInstructor(user);
      res.status(200).send(response);
    } catch (err) {
      next(err);
    }
  };

  public getProductStatsPerMonths = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const user = req.user;
      const response = await this.statsService.getProductStatsPerMonths(user);
      res.status(200).send(response);
    } catch (err) {
      next(err);
    }
  };
}
export default CourseProductStatsController;
