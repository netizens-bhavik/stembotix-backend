import { Router } from 'express';
import validationMiddleware from '@middlewares/validation.middleware';
import { Routes } from '@interfaces/routes.interface';
import passport from 'passport';
import passportConfig from '@/config/passportConfig';
import QuizController from '@/controllers/quiz.controller';
import { QuizDto } from '@/dtos/quiz.dto';
import { QuizQueDto } from '@/dtos/quizQue.dto';

class QuizRoute implements Routes {
  public path = '/quiz';
  public router = Router();
  public quizController = new QuizController();
  public passport = passportConfig(passport);

  constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.post(
      `${this.path}`,
      passport.authenticate('jwt', { session: false }),
      validationMiddleware(QuizDto, 'body'),
      this.quizController.createQuiz
    );

    this.router.get(`${this.path}/:quizId`, this.quizController.getQuizById);


    this.router.get(
      `${this.path}`,
      passport.authenticate('jwt', { session: false }),
      this.quizController.viewQuiz
    );

    this.router.put(
      `${this.path}/:quizId`,

      passport.authenticate('jwt', { session: false }),

      validationMiddleware(QuizDto, 'body'),

      this.quizController.updateQuiz
    );



    this.router.delete(
      `${this.path}/:quizId`,
      passport.authenticate('jwt', { session: false }),
      this.quizController.deleteQuiz
    );


  }
}

export default QuizRoute;
