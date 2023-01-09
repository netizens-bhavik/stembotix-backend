import { NextFunction, Request, Response } from 'express';
import { QuizQue } from '@/interfaces/quizQue.interface';
import QuizQueAnsService from '@/services/quizQue.service';

class QuizQueAnsController {
  public quizQueAnsService = new QuizQueAnsService();

  public createQuizQueAns = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const quizQueAnsData = req.body;
      const trainer = req.user;

      const quizQueAnsData2 = {
        ...quizQueAnsData,
        quiz_id: req.body.quiz_id,
      };
      const response = await this.quizQueAnsService.createQuizQue(
        quizQueAnsData2,
        trainer
      );
      res
        .status(200)
        .send({ data: response, message: 'Quiz created successfully' });
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
      const response: QuizQue = await this.quizQueAnsService.getQuizQueAnsById(
        quizQueId
      );
      res.status(200).send(response);
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
      const trainer = req.user;
      const quizQueAnsDetail = req.body;
      quizQueAnsDetail['id'] = quizQueId;

      const update = await this.quizQueAnsService.updateQuizQueAns(
        quizQueAnsDetail,
        trainer
      );
      res
        .status(200)
        .send({ data: update, message: 'Quiz updated successfully' });
    } catch (err) {
      next(err);
    }
  };
  public deleteQuizqueAns = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const { quizQueId } = req.params;
      console.log(quizQueId);

      const trainer = req.user;

      const response: { count: number } =
        await this.quizQueAnsService.deleteQuizQueAns({
          quizQueId,
          trainer,
        });
      res.sendStatus(200).send(response);
    } catch (error) {
      next(error);
    }
  };
}
export default QuizQueAnsController;
