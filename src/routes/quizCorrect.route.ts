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
      `${this.path}/correctAns`,
      validationMiddleware(QuizCorrectDto, 'body'),

      this.createCorrectAns.CorrectAns
    );
  }
}
export default AnswerRoute;
