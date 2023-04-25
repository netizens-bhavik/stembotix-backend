import { Router } from 'express';
import validationMiddleware from '@middlewares/validation.middleware';
import { Routes } from '@interfaces/routes.interface';
import passport from 'passport';
import passportConfig from '@/config/passportConfig';
import BlogCatController from '@/controllers/blogCategory.controller';
import { BlogCategoryDto } from '@/dtos/blogCategory.dto';

class BlogCatRoute implements Routes {
  public path = '/blog-cat';
  public router = Router();
  public blogCatController = new BlogCatController();
  public passport = passportConfig(passport);

  constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.post(
      `${this.path}/add`,
      passport.authenticate('jwt', { session: false }),
      validationMiddleware(BlogCategoryDto, 'body'),
      this.blogCatController.addBlogCat
    );
    this.router.get(
      `${this.path}/admin`,
      passport.authenticate('jwt', { session: false }),
      this.blogCatController.getBlogCatAdmin
    );
    this.router.get(
      `${this.path}`,
      passport.authenticate('jwt', { session: false }),
      this.blogCatController.getBlogCat
    );
    this.router.put(
      `${this.path}/update/:catId`,
      passport.authenticate('jwt', { session: false }),
      this.blogCatController.updateBlogCat
    );
    this.router.delete(
      `${this.path}/:catId`,
      passport.authenticate('jwt', { session: false }),
      this.blogCatController.deleteBlogCat
    );
  }
}
export default BlogCatRoute;
