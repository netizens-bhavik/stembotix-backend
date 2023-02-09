import { Router } from 'express';
import validationMiddleware from '@middlewares/validation.middleware';
import { Routes } from '@interfaces/routes.interface';
import passport from 'passport';
import passportConfig from '@/config/passportConfig';
import QuizController from '@/controllers/quiz.controller';
import { QuizQueDTO } from '@/dtos/quiz.dto';
import QuizQueAnsController from '@/controllers/quizQue.controller';

class QuizQueRoute implements Routes {
  public path = '/quiz';
  public router = Router();
  public quizController = new QuizController();
  public quizQueAnsController = new QuizQueAnsController();
  public passport = passportConfig(passport);

  constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes() {
    //create question and answer
    this.router.post(
      `${this.path}/que-ans`,
      passport.authenticate('jwt', { session: false }),
      this.quizQueAnsController.createQuizQueAns
    );

    //get a single quetion-answer by id

    // this.router.get(
    //   `${this.path}/que-ans/:quizQueId`,
    //   this.quizQueAnsController.getQuizQueAnsById
    // );
    this.router.get(
      `/admin${this.path}/que-ans/:quizId`,
      passport.authenticate('jwt', { session: false }),
      this.quizQueAnsController.getQuizQueAnsByIdAdmin
    );

    //update quetion-answer
    this.router.put(
      `${this.path}/que-ans/:quizQueId`,

      passport.authenticate('jwt', { session: false }),

      validationMiddleware(QuizQueDTO, 'body'),

      this.quizQueAnsController.updateQuizQueAns
    );

    //delete quetion-answer
    this.router.delete(
      `${this.path}/que-ans/:quizQueId`,
      passport.authenticate('jwt', { session: false }),
      this.quizQueAnsController.deleteQuizqueAns
    );
  }
}

export default QuizQueRoute;
