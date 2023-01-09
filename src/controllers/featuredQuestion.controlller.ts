import { NextFunction, Request, Response } from 'express';
import { featQuestion } from '@/interfaces/Q&A.interface';
import FeatQuestionService from '@/services/featuredQuestion.service';

class FeatQuestionController {
  public featQuestionService = new FeatQuestionService();

  public createFeatQuestion = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const questionData: Request = req.body;
      const user = req.user;

      const response: featQuestion =
        await this.featQuestionService.addFeatQuestion({
          questionData,
          user,
        });
      res.status(200).send({
        data: response,
        message: 'Featured question created successfully',
      });
    } catch (error) {
      next(error);
    }
  };
}
export default FeatQuestionController;
