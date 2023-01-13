import { NextFunction, Request, Response } from 'express';
import DB from '@databases';

import { Quiz } from '@/interfaces/quiz.interface';
import QuizService from '@/services/quiz.service';


class QuizController {
  public quizService = new QuizService();
  public user = DB.User;

  public createQuiz = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const quizData = req.body;
      const trainer = req.user;

      const quizData2 = {
        ...quizData,
        CurriculumSectionId: req.body.curriculum_id,
      };
      const response = await this.quizService.createQuiz(quizData2,trainer);
      res.status(200).send(response);
    } catch (err) {
      next(err);
    }
  };


  public getQuizById = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const { quizId } = req.params;
      const response: Quiz = await this.quizService.getQuizById(quizId);
      res.status(200).send(response);
    } catch (err) {
      next(err);
    }
  };


  public updateQuiz = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const { quizId } = req.params;
      const quizDetail = req.body;
      const trainer = req.user;

      quizDetail['id'] = quizId;

      const update = await this.quizService.updateQuiz(quizDetail,trainer);
      res.status(200).send(update);
    } catch (err) {
      next(err);
    }
  };


  public deleteQuiz = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const { quizId } = req.params;
      const trainer = req.user;


      const response: { count: number } = await this.quizService.deleteQuiz({
        quizId,
        trainer
      });
      res.status(200).send(response);
    } catch (error) {
      next(error);
    }
  };

  public viewQuiz = async (req: Request, res: Response, next: NextFunction) => {
    try {

      const { search, pageRecord, pageNo, sortBy, order } = req.query;
      const queryObject = { search, pageRecord, pageNo, sortBy, order };
      const response: { totalCount: number; records: (Quiz | undefined)[] } =
        await this.quizService.viewQuiz({ search, pageRecord, pageNo, sortBy, order});
      res.status(200).send(response);
    } catch (error) {
      next(error);
    }
  };
}
export default QuizController;
