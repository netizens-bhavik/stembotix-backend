import { Router } from 'express';
import passport from 'passport';
import passportConfig from '@/config/passportConfig';
import { Routes } from '@/interfaces/routes.interface';
import ReviewController from '@/controllers/review.controller';
import validationMiddleware from '@middlewares/validation.middleware';
import { ReviewDTO } from '@/dtos/review.dto';


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
  }
}
export default ReviewRoute
