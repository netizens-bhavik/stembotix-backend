import CompleteQuizService from '@/services/completeQuiz.service';
import { NextFunction, Request, Response } from 'express';
class CompleteQuizController {
  public completeQuizService = new CompleteQuizService();

  public createCompleteQuiz = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const { quizid } = req.body;
      const user = req.user;
      const response = await this.completeQuizService.createCompleteQuiz(
        quizid,
        user
      );
      res.status(200).send(response);
    } catch (error) {
      next(error);
    }
  };

  public getCompleteQuizById = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const { quizid } = req.params;
      const response = await this.completeQuizService.getCompleteQuizById(
        quizid
      );
      res.status(200).send(response);
    } catch (error) {
      next(error);
    }
  };
}
export default CompleteQuizController;
