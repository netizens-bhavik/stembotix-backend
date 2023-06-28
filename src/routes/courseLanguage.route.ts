import { Routes } from '@interfaces/routes.interface';
import { Router } from 'express';
import passport from 'passport';
import validationMiddleware from '@middlewares/validation.middleware';
import CourseLanguageController from '@/controllers/courseLanguage.controller';
import { CourseLanguageDto } from '@/dtos/courseLanguage.dto';

class CourseLangugeRoute implements Routes {
  public path = '/course-language';
  public router = Router();
  public courseLanguageController = new CourseLanguageController();

  constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.post(
      `${this.path}`,
      passport.authenticate('jwt', { session: false }),
      validationMiddleware(CourseLanguageDto, 'body'),
      this.courseLanguageController.addCourseLanguage
    );
    this.router.get(
      `${this.path}`,
      passport.authenticate('jwt', { session: false }),
      this.courseLanguageController.viewAllCourseLanguage
    );
    this.router.get(
      `${this.path}/list`,
      passport.authenticate('jwt', { session: false }),
      this.courseLanguageController.listCourseLanguage
    );
    this.router.put(
      `${this.path}/:languageId`,
      [
        passport.authenticate('jwt', { session: false }),
        validationMiddleware(CourseLanguageDto, 'body'),
      ],
      this.courseLanguageController.updateCourseLanguage
    );
    this.router.delete(
      `${this.path}/:languageId`,
      passport.authenticate('jwt', { session: false }),
      this.courseLanguageController.deleteCourseLevel
    );
  }
}
export default CourseLangugeRoute;
