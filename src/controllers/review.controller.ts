import { Review } from '@/interfaces/review.interface';
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
  public getReview = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const id = req.params.id;
      const { search, pageRecord, pageNo, sortBy, order } = req.query;
      const queryObject = { search, pageRecord, pageNo, sortBy, order };
      const response: {
        totalCount: number;
        review: (Review | undefined)[];
      } = await this.reviewSevice.getReview(queryObject, id);
      res.status(200).send(response);
    } catch (error) {
      next(error);
    }
  };

  public updateReview = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const {review_id} = req.params;
      const reviewDetail = req.body;
      const response = await this.reviewSevice.updateReview(reviewDetail, review_id);
      res
        .status(200)
        .send({ response: response, message: 'Review update Successfully' });
    } catch (error) {
      console.log(error);
    }
  };
  public deleteReview = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const {review_id} = req.params;
      const response: { count: number } = await this.reviewSevice.deleteReview(
        review_id
      );
      res
        .status(200)
        .send({ response: response, message: 'Review Deleted Successfully' });
    } catch (error) {
      next(error);
    }
  };
}
export default ReviewController;
