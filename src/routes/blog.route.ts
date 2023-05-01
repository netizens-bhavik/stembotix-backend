import { Router } from 'express';
import BlogController from '@/controllers/blog.controller';
import validationMiddleware from '@middlewares/validation.middleware';
import { Routes } from '@interfaces/routes.interface';
import passport from 'passport';
import passportConfig from '@/config/passportConfig';
import { BlogDto } from '@/dtos/blog.dto';
import { uploadFiles } from '@/rest/fileUpload';
import { imageUpload } from '@/middlewares/imageUpload.middleware';

class BlogRoute implements Routes {
  public path = '/blog';
  public router = Router();
  public blogController = new BlogController();
  public passport = passportConfig(passport);

  constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.post(
      `${this.path}`,
      passport.authenticate('jwt', { session: false }),
      [
        uploadFiles.single('thumbnail'),
        (req, res, next) => {
          req.body.meta = Object(req.body.price);
          next();
        },
        imageUpload,
        // validationMiddleware(BlogDto, 'body'),
      ],
      this.blogController.addBlog
    );
    this.router.get(
      `${this.path}`,
      passport.authenticate('jwt', { session: false }),
      this.blogController.getBlog
    );
    this.router.get(
      `${this.path}/admin`,
      passport.authenticate('jwt', { session: false }),
      this.blogController.getBlogAdmin
    );
    this.router.get(
      `${this.path}/:blogId`,
      passport.authenticate('jwt', { session: false }),
      this.blogController.getBlogbyId
    );
    this.router.put(
      `${this.path}/:blogId`,
      passport.authenticate('jwt', { session: false }),
      [
        uploadFiles.single('thumbnail'),
        (req, res, next) => {
          req.body.meta = Object(req.body.price);
          next();
        },
        imageUpload,
        // validationMiddleware(BlogDto, 'body'),
      ],
      this.blogController.updateBlog
    );

    this.router.delete(
      `${this.path}/:blogId`,
      passport.authenticate('jwt', { session: false }),
      this.blogController.deleteCourse
    );
  }
}
export default BlogRoute;
