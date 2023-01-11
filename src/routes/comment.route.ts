import { Router } from 'express';
import validationMiddleware from '@middlewares/validation.middleware';
import { Routes } from '@interfaces/routes.interface';
import passport from 'passport';
import passportConfig from '@/config/passportConfig';
import CommentController from '@/controllers/comment.controller';
import { CommentDto } from '@/dtos/comment.dto';
import { uploadFiles, uploadImage } from '@/rest/fileUpload';
import uploadMiddleware from '@/middlewares/uploadMiddleware';


  const thumbnailUploadMiddleware = uploadMiddleware(
    uploadImage.single('thumbnail')
  );

class CommentRoute implements Routes {
  public path = '/comment';
  public router = Router();
  public passport = passportConfig(passport);
  public commentController = new CommentController();

  constructor() {
    this.initializeRoutes();
  }
  private initializeRoutes() {
    this.router.post(
      `${this.path}`,
      [
        passport.authenticate('jwt', { session: false }),
        uploadFiles.fields([{ name: 'thumbnail', maxCount: 1 }]),
      ],

      validationMiddleware(CommentDto, 'body'),
      this.commentController.addComment
    );
    this.router.get(
      `${this.path}/:comment_id`,
      passport.authenticate('jwt', { session: false }),
      this.commentController.getCommentById
    );
    this.router.get(
      `${this.path}`,
      passport.authenticate('jwt', { session: false }),
      this.commentController.viewComment
    );
    this.router.put(
      `${this.path}/:comment_id`,
      [
        passport.authenticate('jwt', { session: false }),
        uploadFiles.fields([{ name: 'thumbnail', maxCount: 1 }]),

        validationMiddleware(CommentDto, 'body'),
      ],

      this.commentController.updateComment
    );
    this.router.delete(
      `${this.path}/:comment_id`,
      passport.authenticate('jwt', { session: false }),
      this.commentController.deleteComment
    );

    this.router
      .post(`${this.path}/uploadFile/:type`,
        passport.authenticate('jwt', { session: false }),
        thumbnailUploadMiddleware,
        this.commentController.uploadImage
      );
  }
}
export default CommentRoute;
