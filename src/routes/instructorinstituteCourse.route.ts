import { Router } from 'express';
import validationMiddleware from '@middlewares/validation.middleware';
import { Routes } from '@interfaces/routes.interface';
import passport from 'passport';
import passportConfig from '@/config/passportConfig';
import AllCourseForInstituteController from '@/controllers/instructorinstituteCourse.controller';

class AllCourseForInstituteRoute implements Routes {
  public path = '/institute-instructor-courses';
  public passport = passportConfig(passport);
  public router = Router();
  public allcourseforInstituteController =
    new AllCourseForInstituteController();

  constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes() {
    //to view request for institute by instructor
    this.router.get(
      `${this.path}`,
      [passport.authenticate('jwt', { session: false })],
      this.allcourseforInstituteController.getAllCourseForInstitute
    );
    this.router.get(
      `/admin${this.path}`,
      [passport.authenticate('jwt', { session: false })],
      this.allcourseforInstituteController.getAllCourseForInstitutebyAdmin
    );
  }
}
export default AllCourseForInstituteRoute;
