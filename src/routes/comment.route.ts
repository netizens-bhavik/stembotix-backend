import { Router } from 'express';
import validationMiddleware from '@middlewares/validation.middleware';
import { Routes } from '@interfaces/routes.interface';
import passport from 'passport';
import passportConfig from '@/config/passportConfig';
import CommentController from '@/controllers/comment.controller';
import { CommentDto } from '@/dtos/comment.dto';
import uploadFiles from '@/rest/fileUpload';

class CommentRoute implements Routes {
  public path = '/comment';
  public router = Router();
  public commentController = new CommentController();
  public passport = passportConfig(passport);

  constructor() {
    this.initializeRoutes();
  }
  private initializeRoutes() {
    this.router.post(
      `${this.path}/:courseId`,
      [
        passport.authenticate('jwt', { session: false }),
        uploadFiles.fields([{ name: 'thumbnail', maxCount: 1 }]),
      ],
      this.commentController.addComment
    );

    this.router.get(
      `${this.path}/:commentId`,
      passport.authenticate('jwt', { session: false }),
      this.commentController.getCommentById
    );

    this.router.get(
      `${this.path}`,
      passport.authenticate('jwt', { session: false }),
      this.commentController.viewComment
    );

    this.router.put(
      `${this.path}/:commentId`,
      [
        passport.authenticate('jwt', { session: false }),
        uploadFiles.fields([{ name: 'thumbnail', maxCount: 1 }]),

        validationMiddleware(CommentDto, 'body'),
      ],

      this.commentController.updateComment
    );

    this.router.delete(
      `${this.path}/:commentId`,
      passport.authenticate('jwt', { session: false }),
      this.commentController.deleteComment
    );
  }
}
export default CommentRoute;
