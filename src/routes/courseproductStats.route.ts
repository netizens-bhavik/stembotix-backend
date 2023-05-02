import passportConfig from '@/config/passportConfig';
import { Routes } from '@/interfaces/routes.interface';
import { Router } from 'express';
import passport from 'passport';
import CourseProductStatsController from '@/controllers/productcourseStats.controller';

class CourseProductStatsRoute implements Routes {
  public path = '/stats';
  public router = Router();
  public courseproductStats = new CourseProductStatsController();
  public passport = passportConfig(passport);

  constructor() {
    this.initializeRoutes();
  }
  private initializeRoutes() {
    this.router.get(
      `/instructor${this.path}/monthWiseCourse`,
      passport.authenticate('jwt', { session: false }),
      this.courseproductStats.courseStatsforInstructor
    );
    this.router.get(
      `/instructor${this.path}/monthWiseProduct`,
      passport.authenticate('jwt', { session: false }),
      this.courseproductStats.productStatsforInstructor
    );

    this.router.get(
      `/institute${this.path}/monthWiseProduct`,
      passport.authenticate('jwt', { session: false }),
      this.courseproductStats.getProductStatsPerMonths
    );
  }
}
export default CourseProductStatsRoute;
