import { Router } from 'express';
import validationMiddleware from '@middlewares/validation.middleware';
import { Routes } from '@interfaces/routes.interface';
import passport from 'passport';
import passportConfig from '@/config/passportConfig';
import QuizController from '@/controllers/quiz.controller';
import { QuizDto, UpdateQuizDto } from '@/dtos/quiz.dto';
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
    //create quiz
    this.router.post(
      `${this.path}`,
      passport.authenticate('jwt', { session: false }),
      validationMiddleware(QuizDto, 'body'),
      this.quizController.createQuiz
    );

    //get single quiz by curriculumId
    this.router.get(
      `${this.path}/section/:curriculumId`,
      this.quizController.getQuizBycurriculumId
    );
    //get single quiz by curriculumId
    this.router.get(`${this.path}/:quizId`, this.quizController.getQuizById);

    //get all quiz
    this.router.get(
      `${this.path}`,
      passport.authenticate('jwt', { session: false }),
      this.quizController.viewQuiz
    );

    //update quiz
    this.router.put(
      `${this.path}/:quizId`,

      passport.authenticate('jwt', { session: false }),

      validationMiddleware(UpdateQuizDto, 'body'),

      this.quizController.updateQuiz
    );

    this.router.get(
      `${this.path}/answer/:quizId`,
      passport.authenticate('jwt', { session: false }),
      this.quizController.AnswerQuiz
    );

    //delete quiz
    this.router.delete(
      `${this.path}/:quizId`,
      passport.authenticate('jwt', { session: false }),
      this.quizController.deleteQuiz
    );
  }
}

export default QuizRoute;
