import { NextFunction, Request, Response } from 'express';
import { BlogReview } from '@interfaces/blogReview.interface';
import BlogReviewService from '@/services/blogReview.service';

class BlogReviewController {
  public blogReviewService = new BlogReviewService();

  public addBlogReview = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const reviewDetails: Request = req.body;
      const user = req.user;
      const { blogId } = req.params;
      const response: BlogReview = await this.blogReviewService.addReview({
        reviewDetails,
        user,
        blogId,
      });
      res
        .status(200)
        .send({ response: response, message: 'Review Added Successfully' });
    } catch (error) {
      next(error);
    }
  };
  public getBlogReview = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const { blogId } = req.params;
      const response: BlogReview[] = await this.blogReviewService.getBlogReview(
        {
          blogId,
        }
      );
      res.status(200).send(response);
    } catch (error) {
      next(error);
    }
  };
  public updateBlogReview = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const reviewDetails = req.body;
      const { reviewId } = req.params;
      const response = await this.blogReviewService.updateBlogReviews({
        reviewId,
        reviewDetails,
      });
      res
        .status(200)
        .send({ response: response, message: 'Review updated successfully' });
    } catch (error) {
      next(error);
    }
  };
  public deleteBlogReview = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const { reviewId } = req.params;
      const response: { count: number } =
        await this.blogReviewService.deleteBlogReviews({ reviewId });
      res.status(200).send(response);
    } catch (error) {
      next(error);
    }
  };
}
export default BlogReviewController;
