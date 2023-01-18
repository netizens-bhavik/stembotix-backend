import QuizCorrectService from '@/services/quizCorrect.service';
import { NextFunction, Request, Response } from 'express';

class QuizCorrectController {
  public quizcorrectService = new QuizCorrectService();

  public getAnsById = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const { quizQueId } = req.params;
      const response = await this.quizcorrectService.getAnsById(quizQueId);
      res.status(200).send(response);
    } catch (error) {
      console.log(error);
    }
  };
}
export default QuizCorrectController;
