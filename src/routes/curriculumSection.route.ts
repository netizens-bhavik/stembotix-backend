import { Router } from 'express';
import validationMiddleware from '@middlewares/validation.middleware';
import { Routes } from '@interfaces/routes.interface';
import passport from 'passport';
import passportConfig from '@/config/passportConfig';
import { CurriculumSectionDto } from '@/dtos/curriculumSection.dto';
import CurriculumSectionController from '@/controllers/courseCurriculum.controller';

class CurriculumSectionRoute implements Routes {
  public path = '/courses';
  public router = Router();
  public curriculumSectionController = new CurriculumSectionController();
  public passport = passportConfig(passport);

  constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.post(
      `${this.path}/section`,
      passport.authenticate('jwt', { session: false }),
      this.curriculumSectionController.addCurriculum
    );

    this.router.get(
      `${this.path}/:courseId/section`,
      passport.authenticate('jwt', { session: false }),
      this.curriculumSectionController.viewCurriculum
    );

    this.router.put(
      `${this.path}/section/:curriculumId`,
      passport.authenticate('jwt', { session: false }),
      this.curriculumSectionController.updateCurriculum
    );

    this.router.delete(
      `${this.path}/section/:curriculumId`,
      passport.authenticate('jwt', { session: false }),
      this.curriculumSectionController.deleteCurriculum
    );
  }
}
export default CurriculumSectionRoute;
