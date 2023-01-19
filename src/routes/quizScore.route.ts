import { Router } from 'express';
import validationMiddleware from '@middlewares/validation.middleware';
import passport from 'passport';
import passportConfig from '@/config/passportConfig';
import { Routes } from '@/interfaces/routes.interface';
import QuizScoreController from '@/controllers/quizScore.controller';
import { validate } from 'class-validator';
import { QuizScoreDTO } from '@/dtos/quizScore.dto';

class QuizScoreRoute implements Routes {
  public path = '/score';
  public router = Router();
  public quizScoreController = new QuizScoreController();
  public passport = passportConfig(passport);

  constructor() {
    this.initializeRoutes();
  }

  public initializeRoutes() {
    this.router.post(
      `${this.path}`,
      passport.authenticate('jwt', { session: false }),
    //   validationMiddleware(QuizScoreDTO, 'body'),
      this.quizScoreController.addScore
    );
  }
}
export default QuizScoreRoute;
