import { QuizCorrect } from '@/interfaces/quizCorrect.interface';
import QuizCorrectService from '@/services/quizCorrect.service';
import { NextFunction, Request, Response } from 'express';
class QuizCorrectController {
  public quizcorrectService = new QuizCorrectService();

  public CorrectAns = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const  optiondetail  = req.body;
      const {quizId} = req.params
      const user = req.user
      const response = await this.quizcorrectService.CorrectAns(
        optiondetail,
        quizId,
      );
      res.status(200).send(response);
    } catch (error) {
      next(error);
    }
  };
}
export default QuizCorrectController;
