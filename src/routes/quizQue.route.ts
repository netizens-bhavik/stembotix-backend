import { Router } from 'express';
import validationMiddleware from '@middlewares/validation.middleware';
import { Routes } from '@interfaces/routes.interface';
import passport from 'passport';
import passportConfig from '@/config/passportConfig';
import QuizQueController from '@/controllers/quizQue.controller';
import { QuizQueDto } from '@/dtos/quizQue.dto';
import { QuizOptionDto } from '@/dtos/quizOption.dto';

class QuizQueRoute implements Routes {
  public path = '/quizQue';
  public router = Router();
  public quizQueController = new QuizQueController();
  public passport = passportConfig(passport);

  constructor() {
    this.initializeRoutes();
  }
  private initializeRoutes() {
    this.router.post(
      `${this.path}`,
      passport.authenticate('jwt', { session: false }),
      validationMiddleware(QuizQueDto, 'body'),
      this.quizQueController.createQuizQue
    );
    this.router.post(
      `${this.path}/option`,
      passport.authenticate('jwt', { session: false }),
      validationMiddleware(QuizOptionDto, 'body'),
      this.quizQueController.createQuizOption
    );
    // this.router.get(
    //   `${this.path}/:quizQueId`,
    //   this.quizQueController.getQuizQueById
    // );

    this.router.get(
      `${this.path}/option/:quizAnsId`,
      this.quizQueController.getQuizOptionById
    );

    this.router.put(
      `${this.path}/:quizQueId`,

      passport.authenticate('jwt', { session: false }),

      validationMiddleware(QuizQueDto, 'body'),

      this.quizQueController.updateQuizQues
    );

    this.router.put(
      `${this.path}/option/:quizAnsId`,

      passport.authenticate('jwt', { session: false }),

      validationMiddleware(QuizOptionDto, 'body'),

      this.quizQueController.updateQuizAns
    );

    this.router.delete(
      `${this.path}/:quizQueId`,
      passport.authenticate('jwt', { session: false }),
      this.quizQueController.deleteQuizQue
    );

    this.router.delete(
      `${this.path}/option/:quizAnsId`,
      passport.authenticate('jwt', { session: false }),
      this.quizQueController.deleteQuizOption
    );
  }
}
export default QuizQueRoute;
