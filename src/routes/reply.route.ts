import { Router } from 'express';
import validationMiddleware from '@middlewares/validation.middleware';
import { Routes } from '@interfaces/routes.interface';
import passport from 'passport';
import passportConfig from '@/config/passportConfig';
import CommentController from '@/controllers/comment.controller';
import { ReplyDto } from '@dtos/reply.dto';
import uploadFiles from '@/rest/fileUpload';
import Replycontroller from '@/controllers/reply.controller';

class ReplyRoute implements Routes {
  public path = '/reply';
  public router = Router();
  public passport = passportConfig(passport);
  public replyController = new Replycontroller();

  constructor() {
    this.initializeRoutes();
  }
  private initializeRoutes() {
    this.router.post(
      `${this.path}`,
      passport.authenticate('jwt', { session: false }),

      validationMiddleware(ReplyDto, 'body'),
      this.replyController.addReply
    );
    this.router.get(
      `${this.path}/:reply_id`,
      passport.authenticate('jwt', { session: false }),
      this.replyController.getReplyById
    );


    this.router.get(
      `${this.path}`,
      passport.authenticate('jwt', { session: false }),
      this.replyController.viewReply
    );
    this.router.put(
      `${this.path}/:reply_id`,

      passport.authenticate('jwt', { session: false }),

      validationMiddleware(ReplyDto, 'body'),

      this.replyController.updateReply
    );

    this.router.delete(
      `${this.path}/:reply_id`,
      passport.authenticate('jwt', { session: false }),
      this.replyController.deleteReply
    );
  }
}
export default ReplyRoute;
