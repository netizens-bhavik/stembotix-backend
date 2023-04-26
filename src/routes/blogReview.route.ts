import { Router } from 'express';
import BlogReviewController from '@/controllers/blogReview.controller';
import validationMiddleware from '@middlewares/validation.middleware';
import { Routes } from '@interfaces/routes.interface';
import passport from 'passport';
import passportConfig from '@/config/passportConfig';
import { BlogReviewDto } from '@/dtos/blogReview.dto';

class BlogReviewRoute {
  public path = '/blog-review';
  public router = Router();
  public blogReview = new BlogReviewController();
  public passport = passportConfig(passport);

  constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.post(
      `${this.path}/:blogId`,
      passport.authenticate('jwt', { session: false }),
      this.blogReview.addBlogReview
    );
    this.router.get(
      `${this.path}/:blogId`,
      passport.authenticate('jwt', { session: false }),
      this.blogReview.getBlogReview
    );
    this.router.put(
      `${this.path}/:reviewId`,
      passport.authenticate('jwt', { session: false }),
      this.blogReview.updateBlogReview
    );
    this.router.delete(
      `${this.path}/:reviewId`,
      passport.authenticate('jwt', { session: false }),
      this.blogReview.deleteBlogReview
    );
  }
}
export default BlogReviewRoute;
