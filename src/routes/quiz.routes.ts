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
      this.router.post(
        `${this.path}/que-ans`,
        passport.authenticate('jwt', { session: false }),
        validationMiddleware(QuizQueDto, 'body'),
        this.quizController.createQuizQueAns
      );
      this.router.get(`${this.path}/:quizId`, this.quizController.getQuizById);

    
      this.router.get(`${this.path}/que-ans/:quizQueId`, this.quizController.getQuizQueAnsById);


      this.router.put(
      `${this.path}/:quizId`,

      passport.authenticate('jwt', { session: false }),

      validationMiddleware(QuizDto, 'body'),

      this.quizController.updateQuiz
    );

    this.router.put(
      `${this.path}/que-ans/:quizQueId`,

      passport.authenticate('jwt', { session: false }),

      validationMiddleware(QuizQueDto, 'body'),

      this.quizController.updateQuizQueAns
    );




    this.router.delete(
      `${this.path}/:quizId`,
      passport.authenticate('jwt', { session: false }),
      this.quizController.deleteQuiz
    );

    this.router.delete(
      `${this.path}/que-ans/:quizQueId`,
      passport.authenticate('jwt', { session: false }),
      this.quizController.deleteQuizqueAns
    );
  }
}

export default QuizRoute;
