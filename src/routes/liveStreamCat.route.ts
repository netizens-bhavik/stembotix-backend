import { Routes } from '@interfaces/routes.interface';
import { Router } from 'express';
import passport from 'passport';
import validationMiddleware from '@middlewares/validation.middleware';
import LiveStreamCatController from '@/controllers/liveStreamCat.controller';

import { LiveStreamCatDto } from '@/dtos/liveStreamCat.dto';

class LiveStreamCatRoute implements Routes {
  public path = '/event-cat';
  public router = Router();
  public liveStreamCatController = new LiveStreamCatController();

  constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.post(
      `${this.path}`,
      passport.authenticate('jwt', { session: false }),
      validationMiddleware(LiveStreamCatDto, 'body'),
      this.liveStreamCatController.addLiveStreamCat
    );
    this.router.get(
      `${this.path}`,
      passport.authenticate('jwt', { session: false }),
      this.liveStreamCatController.viewAllLiveStreamCat
    );
    this.router.get(
      `${this.path}/list`,
      passport.authenticate('jwt', { session: false }),
      this.liveStreamCatController.listLiveStreamCat
    );
    this.router.put(
      `${this.path}/:catId`,
      [
        passport.authenticate('jwt', { session: false }),
        validationMiddleware(LiveStreamCatDto, 'body'),
      ],
      this.liveStreamCatController.updateLiveStreamCat
    );
    this.router.delete(
      `${this.path}/:catId`,
      passport.authenticate('jwt', { session: false }),
      this.liveStreamCatController.deleteLiveStreamCat
    );
  }
}
export default LiveStreamCatRoute;
