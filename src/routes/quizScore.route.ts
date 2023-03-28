import { Router } from 'express';
import passport from 'passport';
import passportConfig from '@/config/passportConfig';
import { Routes } from '@/interfaces/routes.interface';
import QuizScoreController from '@/controllers/quizScore.controller';

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
      this.quizScoreController.addScore
    );
  }
}
export default QuizScoreRoute;
