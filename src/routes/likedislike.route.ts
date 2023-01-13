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
      this.likedislikeController.addLike
    );
  }
}
export default LikeDislikeRoute;
