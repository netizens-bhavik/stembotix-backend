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
      const { quiz_id } = req.body;
      const user = req.user;
      const response = await this.completeQuizService.createCompleteQuiz(
        quiz_id,
        user
      );
      res.status(200).send(response);
    } catch (error) {
      console.log(error);
    }
  };
}
export default CompleteQuizController;
