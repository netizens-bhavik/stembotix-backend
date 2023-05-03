import { Router } from 'express';
import validationMiddleware from '@middlewares/validation.middleware';
import { Routes } from '@interfaces/routes.interface';
import passport from 'passport';
import passportConfig from '@/config/passportConfig';
import BlogTagController from '@/controllers/blogTag.controller';
import { BlogTagDto } from '@/dtos/blogTag.dto';

class BlogTagRoute implements Routes {
  public path = '/blog-tag';
  public router = Router();
  public blogTagController = new BlogTagController();
  public passport = passportConfig(passport);

  constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.post(
      `${this.path}/add`,
      passport.authenticate('jwt', { session: false }),
      validationMiddleware(BlogTagDto, 'body'),
      this.blogTagController.addBlogTag
    );
    this.router.get(
      `${this.path}/admin`,
      this.blogTagController.getBlogTagsAdmin
    );
    this.router.get(`${this.path}`, this.blogTagController.getBlogTags);
    this.router.put(
      `${this.path}/update/:tagId`,
      passport.authenticate('jwt', { session: false }),
      this.blogTagController.updateBlogTag
    );
    this.router.delete(
      `${this.path}/:tagId`,
      passport.authenticate('jwt', { session: false }),
      this.blogTagController.deleteBlogTag
    );
  }
}
export default BlogTagRoute;
