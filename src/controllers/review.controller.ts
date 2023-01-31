import ReviewService from '@/services/review.service';
import { NextFunction, Request, Response } from 'express';

class ReviewController {
  public reviewSevice = new ReviewService();

  public addReview = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const reviewDetail = req.body;
      const user = req.user;
      const response = await this.reviewSevice.createReview(reviewDetail, user);
      res
        .status(200)
        .send({ response: response, message: 'Review added Successfully' });
    } catch (error) {
      next(error);
    }
  };
}
export default ReviewController;
