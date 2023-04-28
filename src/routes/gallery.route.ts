import { Router } from 'express';
import validationMiddleware from '@middlewares/validation.middleware';
import { Routes } from '@interfaces/routes.interface';
import passport from 'passport';
import passportConfig from '@/config/passportConfig';
import { uploadFiles } from '@/rest/fileUpload';
import { imageUpload } from '@/middlewares/imageUpload.middleware';
import GalleryController from '@/controllers/gallery.controller';

class GalleryRoute implements Routes {
  public path = '/gallery';
  public router = Router();
  public passport = passportConfig(passport);
  public galleryController = new GalleryController();

  constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.post(
      `${this.path}`,
      passport.authenticate('jwt', { session: false }),
      [
        uploadFiles.single('galleryImage'),
        (req, res, next) => {
          req.body.price = Number(req.body.price);
          next();
        },
        imageUpload,
      ],
      this.galleryController.createGallery
    );

    this.router.get(`${this.path}`, this.galleryController.getGallerybyUser);
    this.router.get(
      `${this.path}/:galleryId`,
      passport.authenticate('jwt', { session: false }),
      this.galleryController.getGallerybyId
    );
    this.router.get(
      `/admin${this.path}`,
      passport.authenticate('jwt', { session: false }),
      this.galleryController.getGallerybyAdmin
    );

    this.router.put(
      `${this.path}/:galleryId`,
      [
        passport.authenticate('jwt', { session: false }),
        uploadFiles.single('galleryImage'),
        (req, res, next) => {
          req.body.price = Number(req.body.price);
          next();
        },
        imageUpload,
      ],
      this.galleryController.updateGallery
    );
    this.router.delete(
      `${this.path}/:galleryId`,
      passport.authenticate('jwt', { session: false }),
      this.galleryController.deleteGalleryImage
    );
  }
}
export default GalleryRoute;
