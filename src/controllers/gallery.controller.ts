import { NextFunction, Request, Response } from 'express';
import GalleryService from '@/services/gallery.service';

class GalleryController {
  public galleryService = new GalleryService();
  public createGallery = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const user = req.user;
      const file = req.file;
      const response = await this.galleryService.createGallery({
        file,
        user,
      });
      res
        .status(200)
        .send({ response: response, message: 'Image added successfully' });
    } catch (error) {
      next(error);
    }
  };

  public getGallerybyUser = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const data = await this.galleryService.getGallerybyUser();
      res.status(200).send(data);
    } catch (error) {
      next(error);
    }
  };
  public getGallerybyId = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const { galleryId } = req.params;
      const user = req.user;

      const data = await this.galleryService.getGallerybyId({
        user,
        galleryId,
      });
      res.status(200).send(data);
    } catch (error) {
      next(error);
    }
  };
  public getGallerybyAdmin = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const { pageRecord, pageNo, sortBy, order } = req.query;
      const queryObject = { pageRecord, pageNo, sortBy, order };
      const user = req.user;
      const data: {
        totalCount: number;
        records: object;
      } = await this.galleryService.getGallerybyAdmin({
        user,
        queryObject,
      });
      res.status(200).send(data);
    } catch (error) {
      next(error);
    }
  };
  public updateGallery = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const { galleryId } = req.params;
      const file = req.file;
      const user = req.user;
      const response = await this.galleryService.updateGallery({
        file,
        user,
        galleryId,
      });
      res
        .status(200)
        .send({ response: response, message: 'Image Updated Successfully' });
    } catch (error) {
      next(error);
    }
  };

  public deleteGalleryImage = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const user = req.user;
      const { galleryId } = req.params;
      const response: { count: number } =
        await this.galleryService.deleteGalleryImage({
          user,
          galleryId,
        });
      res
        .status(200)
        .send({ response: response, message: 'Image deleted successfullyi' });
    } catch (error) {
      next(error);
    }
  };
}
export default GalleryController;
