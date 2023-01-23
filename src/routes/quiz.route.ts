import { Router } from 'express';
import validationMiddleware from '@middlewares/validation.middleware';
import { Routes } from '@interfaces/routes.interface';
import passport, { authenticate } from 'passport';
import passportConfig from '@/config/passportConfig';
import QuizController from '@/controllers/quiz.controller';
import { QuizDto, UpdateQuizDto } from '@/dtos/quiz.dto';
import { QuizQueDTO } from '@/dtos/quiz.dto';

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
    //get single quiz by quizId admin
    this.router.get(`${this.path}/admin/:quizId`,passport.authenticate('jwt', { session: false }), this.quizController.getQuizByIdAdmin);

    //get single quiz by quizId
    this.router.get(`${this.path}/:quizId`,passport.authenticate('jwt', { session: false }), this.quizController.getQuizById);

        //get single quiz by quizId
        // this.router.get(`${this.path}/protected/:quizId`,passport.authenticate('jwt', { session: false }), this.quizController.getQuizBy);

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
    this.router.post(
      `${this.path}/copmleteQuiz/:quizId`,
      passport.authenticate('jwt',{session:false}),
      this.quizController.completeQuiz
    )
    // 
  }
}

export default QuizRoute;
