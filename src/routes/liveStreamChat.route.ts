import { Router } from 'express';
import validationMiddleware from '@middlewares/validation.middleware';
import { Routes } from '@interfaces/routes.interface';
import passport from 'passport';
import passportConfig from '@/config/passportConfig';
import LiveStreamChatController from '@controllers/liveStreamChat.controller';
import {
  LiveStreamChatDTO,
  LiveStreamChatGetDTO,
} from '@/dtos/livestreamchat.dto';
// import 'reflect-metadata';

class LiveStreamChatRoute implements Routes {
  public path = '/livestreamchat';
  public passport = passportConfig(passport);
  public router = Router();
  public liveStreamchatController = new LiveStreamChatController();

  constructor() {
    this.initializeRoutes();
  }
  private initializeRoutes() {
    this.router.post(
      `${this.path}/:livestreamId`,
      passport.authenticate('jwt', { session: false }),
      validationMiddleware(LiveStreamChatDTO, 'body'),
      this.liveStreamchatController.sendLiveStreamChat
    );

    this.router.delete(
      `${this.path}/:message_id`,
      [passport.authenticate('jwt', { session: false })],
      this.liveStreamchatController.deleteLiveStreamChat
    );

    this.router.get(
      `${this.path}/:livestreamId`,
      passport.authenticate('jwt', { session: false }),
      validationMiddleware(LiveStreamChatGetDTO, 'params'),
      this.liveStreamchatController.getLiveStreamChat
    );
  }
}

export default LiveStreamChatRoute;
