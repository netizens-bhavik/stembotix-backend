import QuizScoreService from '@/services/quizScore.service';
import { NextFunction, Request, Response } from 'express';

class QuizScoreController {
  public quizScoreService = new QuizScoreService();

  public addScore = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const user = req.user;
      const quizDetail = req.body;
      const response = await this.quizScoreService.addScore(user, quizDetail);
      res.status(200).send(response);
    } catch (err) {
      next(err);
    }
  };
}
export default QuizScoreController;
