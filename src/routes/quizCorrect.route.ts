import { Router } from 'express';
import { Routes } from '@interfaces/routes.interface';
import passport from 'passport';
import passportConfig from '@/config/passportConfig';
import QuizCorrectController from '@/controllers/quizCorrect.controller';
import validationMiddleware from '@/middlewares/validation.middleware';
import { QuizCorrectDto } from '@/dtos/quizCorrect.dto';

class AnswerRoute implements Routes {
  public path = '/quiz';
  public router = Router();
  public passport = passportConfig(passport);
  public createCorrectAns = new QuizCorrectController();

  constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.post(
      `${this.path}/correctAns/:quizId`,
      passport.authenticate('jwt', { session: false }),
      validationMiddleware(QuizCorrectDto, 'body'),

      this.createCorrectAns.CorrectAns
    );
    this.router.post(
      `${this.path}/score/:quizId`,
      passport.authenticate('jwt', { session: false }),
      validationMiddleware(QuizCorrectDto, 'body'),

      this.createCorrectAns.addScore
    );
    this.router.get(
      `${this.path}/totalScore/:quizId`,
      passport.authenticate('jwt', { session: false }),
      this.createCorrectAns.getScorebyQuizId
    );
  }
}
export default AnswerRoute;
