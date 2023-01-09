import { Router } from 'express';
import FeatQuestionController from '@/controllers/featuredQuestion.controlller';
import validationMiddleware from '@middlewares/validation.middleware';
import { Routes } from '@interfaces/routes.interface';
import passport from 'passport';
import passportConfig from '@/config/passportConfig';
import { featQuestionDto } from '@/dtos/Q&A.dto';

class FeatQuestionRoute implements Routes {
  public path = '/feat-question';
  public router = Router();
  public featQuestionController = new FeatQuestionController();
  public passport = passportConfig(passport);

  constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.post(
      `${this.path}`,
      passport.authenticate('jwt', { session: false }),
      validationMiddleware(featQuestionDto, 'body'),
      this.featQuestionController.createFeatQuestion
    );
  }
}
export default FeatQuestionRoute;
