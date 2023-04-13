import { Router } from 'express';
import validationMiddleware from '@middlewares/validation.middleware';
import { Routes } from '@interfaces/routes.interface';
import passport from 'passport';
import passportConfig from '@/config/passportConfig';
import CurriculumVideoController from '@/controllers/curriculumVideo.controller';
import { uploadFiles } from '@/rest/fileUpload';
import { CurriCulumVideoDto } from '@/dtos/curriculumVideo.dto';
import { imageUpload } from '@/middlewares/imageUpload.middleware';

class CurriculumVideoRoute implements Routes {
  public path = '/courses/section';
  public router = Router();
  public curriculumVideoController = new CurriculumVideoController();
  public passport = passportConfig(passport);

  constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.post(
      `${this.path}/:curriculumId/video`,
      [
        passport.authenticate('jwt', { session: false }),
        uploadFiles.single('tutorial'),
        (req, res, next) => {
          req.body.video_url = String(req.body.video_url);
          next();
        },
        imageUpload,
      ],
      this.curriculumVideoController.addVideo
    );

    this.router.get(
      `${this.path}/:sectionId/video`,
      this.curriculumVideoController.listVideo
    );

    this.router.put(
      `${this.path}/video/:videoId`,
      [
        passport.authenticate('jwt', { session: false }),
        uploadFiles.single('tutorial'),
        imageUpload,
        validationMiddleware(CurriCulumVideoDto, 'body', true),
      ],
      this.curriculumVideoController.updateVideo
    );

    this.router.delete(
      `${this.path}/video/:videoId`,
      passport.authenticate('jwt', { session: false }),
      this.curriculumVideoController.deleteVideo
    );
  }
}
export default CurriculumVideoRoute;
