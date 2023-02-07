import { Router } from 'express';
import passport from 'passport';
import passportConfig from '@/config/passportConfig';
import { Routes } from '@/interfaces/routes.interface';
import ReviewController from '@/controllers/review.controller';
import validationMiddleware from '@middlewares/validation.middleware';
import { ReviewDto, ReviewDTO } from '@/dtos/review.dto';


class ReviewRoute implements Routes {
  public path = '/review';
  public router = Router();
  public reviewController = new ReviewController();
  public passport = passportConfig(passport);

  constructor() {
    this.initializeRoutes();
  }

  public initializeRoutes() {
    this.router.post(
      `${this.path}`,
      passport.authenticate('jwt', { session: false }),
      validationMiddleware(ReviewDTO, 'body'),
      this.reviewController.addReview
    );

    this.router.get(
      `${this.path}/:postId`,
      passport.authenticate('jwt', { session: false }),
      this.reviewController.getReview
    );

    this.router.put(
      `${this.path}/:reviewId`,
      passport.authenticate('jwt', { session: false }),
      validationMiddleware(ReviewDto, 'body'),
      this.reviewController.updateReview
    );
    this.router.delete(
      `${this.path}/:reviewId`,
      passport.authenticate('jwt', { session: false }),
      this.reviewController.deleteReview
    );
  }
}
export default ReviewRoute
