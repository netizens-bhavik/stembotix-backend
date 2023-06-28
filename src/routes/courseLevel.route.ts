import { Routes } from '@interfaces/routes.interface';
import { Router } from 'express';
import passport from 'passport';
import validationMiddleware from '@middlewares/validation.middleware';
import CourseLevelController from '@/controllers/courseLevel.controller';
import { CourseLevelDto } from '@/dtos/courseLevel.dto';

class CourseLevelRoute implements Routes {
  public path = '/course-level';
  public router = Router();
  public courseLevelController = new CourseLevelController();

  constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.post(
      `${this.path}`,
      passport.authenticate('jwt', { session: false }),
      validationMiddleware(CourseLevelDto, 'body'),
      this.courseLevelController.addCourseLevel
    );
    this.router.get(
      `${this.path}`,
      passport.authenticate('jwt', { session: false }),
      this.courseLevelController.viewAllCourseLevel
    );
    this.router.get(
      `${this.path}/list`,
      passport.authenticate('jwt', { session: false }),
      this.courseLevelController.listCourseLevel
    );
    this.router.put(
      `${this.path}/:levelId`,
      [
        passport.authenticate('jwt', { session: false }),
        validationMiddleware(CourseLevelDto, 'body'),
      ],
      this.courseLevelController.updateCourseLevel
    );
    this.router.delete(
      `${this.path}/:levelId`,
      passport.authenticate('jwt', { session: false }),
      this.courseLevelController.deleteCourseLevel
    );
  }
}
export default CourseLevelRoute;
