import { Routes } from '@interfaces/routes.interface';
import { Router } from 'express';
import passport from 'passport';
import validationMiddleware from '@middlewares/validation.middleware';
import CourseTypeController from '@/controllers/courseType.controller';
import { CourseTypeDto } from '@/dtos/courseType.dto';

class CourseTypeRoute implements Routes {
  public path = '/course-type';
  public router = Router();
  public courseTypeController = new CourseTypeController();

  constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.post(
      `${this.path}`,
      passport.authenticate('jwt', { session: false }),
      validationMiddleware(CourseTypeDto, 'body'),
      this.courseTypeController.addCourseType
    );
    this.router.get(
      `${this.path}`,
      passport.authenticate('jwt', { session: false }),
      this.courseTypeController.viewAllCourseType
    );
    this.router.get(
      `${this.path}/list`,
      passport.authenticate('jwt', { session: false }),
      this.courseTypeController.listCourseType
    );
    this.router.put(
      `${this.path}/:coursetypeId`,
      [
        passport.authenticate('jwt', { session: false }),
        validationMiddleware(CourseTypeDto, 'body'),
      ],
      this.courseTypeController.updateCourseType
    );
    this.router.delete(
      `${this.path}/:courseTypeId`,
      passport.authenticate('jwt', { session: false }),
      this.courseTypeController.deleteCourseType
    );
  }
}
export default CourseTypeRoute;
