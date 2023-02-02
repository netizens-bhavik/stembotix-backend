import passportConfig from '@/config/passportConfig';
import LikeDislikeController from '@/controllers/likedislike.controller';
import { Routes } from '@/interfaces/routes.interface';
import { Router } from 'express';
import passport from 'passport';

class LikeDislikeRoute implements Routes {
  public path = '/likedislike';
  public router = Router();
  public passport = passportConfig(passport);
  public likedislikeController = new LikeDislikeController();

  constructor() {
    this.initializeRoutes();
  }
  private initializeRoutes() {
    this.router.post(
      `${this.path}/:comment_id`,
      passport.authenticate('jwt', { session: false }),
      this.likedislikeController.addLikeDislikeOnComment
    );

    this.router.post(
      `${this.path}/reply/:reply_id`,
      passport.authenticate('jwt', { session: false }),
      this.likedislikeController.addLikeDislikeOnReply
    );

    this.router.get(
      `${this.path}/:comment_id/like`,
      passport.authenticate('jwt', { session: false }),
      this.likedislikeController.  viewLikeonComment
    );

    this.router.get(
      `${this.path}/reply/:reply_id/like`,
      passport.authenticate('jwt', { session: false }),
      this.likedislikeController.viewLikeOnReply
    );
  }
}
export default LikeDislikeRoute;
