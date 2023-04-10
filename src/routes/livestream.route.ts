import { Router } from 'express';
import validationMiddleware from '@middlewares/validation.middleware';
import { Routes } from '@interfaces/routes.interface';
import passport from 'passport';
import passportConfig from '@/config/passportConfig';
import { uploadFiles } from '@/rest/fileUpload';
import LiveStreamController from '@controllers/liveStream.controller';
import { LiveStreamDTO } from '@/dtos/liveStream.dto';
import { imageUpload } from '@/middlewares/imageUpload.middleware';

// import 'reflect-metadata';

class LiveStreamRoute implements Routes {
  public path = '/livestream';
  public passport = passportConfig(passport);
  public router = Router();
  public liveStreamController = new LiveStreamController();

  constructor() {
    this.initializeRoutes();
  }
  private initializeRoutes() {
    this.router.post(
      `${this.path}`,
      [
        passport.authenticate('jwt', { session: false }),
        uploadFiles.single('thumbnail'),
        (req, res, next) => {
          req.body.subscriptionPrice = Number(req.body.subscriptionPrice);
          next();
        },
        imageUpload,
        validationMiddleware(LiveStreamDTO, 'body'),
      ],
      this.liveStreamController.createLiveStream
    );
    this.router.get(`${this.path}`, this.liveStreamController.viewLiveStream);
    this.router.get(
      `${this.path}/todayEvent`,
      this.liveStreamController.viewTodaysEvent
    );
    this.router.get(
      `${this.path}/upCommingEvent`,
      this.liveStreamController.viewUpcommingEvent
    );
    this.router.get(
      `${this.path}/list`,
      passport.authenticate('jwt', { session: false }),
      this.liveStreamController.listLiveEvent
    );

    this.router.get(
      `${this.path}/:livestreamId`,
      this.liveStreamController.viewLiveStreamById
    );

    this.router.put(
      `${this.path}/:livestreamId`,
      [
        passport.authenticate('jwt', { session: false }),
        uploadFiles.single('thumbnail'),
        (req, res, next) => {
          req.body.subscriptionPrice = Number(req.body.subscriptionPrice);
          next();
        },
        imageUpload,
        validationMiddleware(LiveStreamDTO, 'body'),
      ],
      this.liveStreamController.updateLiveStream
    );

    this.router.delete(
      `${this.path}/:livestreamId`,
      passport.authenticate('jwt', { session: false }),
      this.liveStreamController.deleteLivestream
    );
    this.router.get(
      `/admin${this.path}`,
      passport.authenticate('jwt', { session: false }),
      this.liveStreamController.viewLiveStreamAdmin
    );
    this.router.delete(
      `/admin${this.path}/user/:livestreamchatlogsId`,
      passport.authenticate('jwt', { session: false }),
      this.liveStreamController.deleteUserAttendance
    );
    this.router.get(
      `/admin${this.path}/user/:livestreamId`,
      passport.authenticate('jwt', { session: false }),
      this.liveStreamController.getUserTimeLogByEventId
    );
  }
}
export default LiveStreamRoute;
