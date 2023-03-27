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
      const optiondetail = req.body;
      const { quizId } = req.params;
      const user = req.user;
      const response = await this.quizcorrectService.CorrectAns(
        optiondetail,
        quizId,
        user
      );
      res.status(200).send(response);
    } catch (error) {
      next(error);
    }
  };

  public getScorebyQuizId = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const { quizId } = req.params;
      const response = await this.quizcorrectService.getScoreByQuizId(quizId);
      res.status(200).send({
        response: response,
        message: 'This is your final Score',
      });
    } catch (error) {
      next(error);
    }
  };
}
export default QuizCorrectController;
