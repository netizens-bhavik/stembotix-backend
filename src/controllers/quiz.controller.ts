import { NextFunction, Request, Response } from 'express';
import { Quiz } from '@/interfaces/quiz.interface';
import QuizService from '@/services/quiz.service';
import { QuizDto } from '@/dtos/quiz.dto';
import { QuizQue } from '@/interfaces/quizQue.interface';

class QuizController {
  public quizService = new QuizService();

  public createQuiz = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const quizData = req.body;
      // const users = req.user
      const quizData2 = {
        ...quizData,
        CurriculumSectionId: req.body.curriculum_id,
      };
      const response = await this.quizService.createQuiz(quizData2);
      res.status(200).send(response);
    } catch (err) {
      next(err);
    }
  };
  public createQuizQueAns = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const quizQueAnsData = req.body;
      // const users = req.user
      const quizQueAnsData2 = {
        ...quizQueAnsData,
        quiz_id: req.body.quiz_id,
      };
      const response = await this.quizService.createQuizQue(quizQueAnsData2);
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
      // console.log("first",quizId)
      const response: Quiz = await this.quizService.getQuizById(quizId);
      res.status(200).send(response);
    } catch (err) {
      next(err);
    }
  };
  public getQuizQueAnsById = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const { quizQueId } = req.params;
      const response: QuizQue = await this.quizService.getQuizQueAnsById(
        quizQueId
      );
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
      quizDetail['id'] = quizId;

      const update = await this.quizService.updateQuiz(quizDetail);
      res.status(200).send(update);
    } catch (err) {
      next(err);
    }
  };

  public updateQuizQueAns = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const { quizQueId } = req.params;
      const quizQueAnsDetail = req.body;
      quizQueAnsDetail['id'] = quizQueId;

      const update = await this.quizService.updateQuizQueAns(quizQueAnsDetail);
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
      const response: { count: number } = await this.quizService.deleteQuiz({
        quizId,
      });
      res.sendStatus(200).send(response);
    } catch (error) {
      next(error);
    }
  };
  public deleteQuizqueAns = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const { quizQueId } = req.params;
      const response: { count: number } =
        await this.quizService.deleteQuizQueAns({
          quizQueId,
        });
      res.sendStatus(200).send(response);
    } catch (error) {
      next(error);
    }
  };
  public listQuiz = async (req: Request, res: Response, next: NextFunction) => {
    try {
     
      // const user = req.user;
      // const { search, pageRecord, pageNo, sortBy, order } = req.query;
      // const queryObject = { search, pageRecord, pageNo, sortBy, order };
      // const response ={ totalCount: number; records: (QuizQue | undefined)[] } =
      //   await this.quizService.listQuiz({ user, queryObject });
      // res.status(200).send(response);




      // const user =req.user;
      // const { search, pageRecord, pageNo, sortBy, order } = req.query;
      // const queryobject = { search, pageRecord, pageNo, sortBy, order };
      // const response: { totalCount: number; records: (QuizQue | undefined)[] } =
      //   await this.quizService.listQuiz({ user, queryobject });
      // res.status(200).send(response);
    } catch (error) {
      next(error);
    }
  };
}
export default QuizController;
