import { NextFunction, Request, Response } from 'express';
import { CurriCulumVideo } from '@/interfaces/curriculumVideo.interface';
import CurriculumVideoService from '@/services/curriculumVideo.service';

class CurriculumVideoController {
  public curriculumVideoService = new CurriculumVideoService();

  public addVideo = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const curriculumVideoDetails = req.body;
      const trainer = req.user;
      const file = req.file;
      const curriculumId = req.params;

      const response: CurriCulumVideo =
        await this.curriculumVideoService.addVideo({
          curriculumVideoDetails,
          file,
          trainer,
          curriculumId,
        });
      res.status(200).send(response);
    } catch (error) {
      next(error);
    }
  };

  public listVideo = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const { search, pageRecord, pageNo, sortBy, order } = req.query;
      const { sectionId } = req.params;
      const queryObject = { search, pageRecord, pageNo, sortBy, order };
      const response: {
        totalCount: number;
        records: (CurriCulumVideo | undefined)[];
      } = await this.curriculumVideoService.listVideos(queryObject, sectionId);
      res.status(200).send(response);
    } catch (error) {
      next(error);
    }
  };

  public updateVideo = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const { videoId } = req.params;
      const curriculumVideoDetails = req.body;
      const file = req.file;
      const trainer = req.user
      const response = await this.curriculumVideoService.updatevideo({
        curriculumVideoDetails,
        file,
        trainer,
        videoId
      });
      res.status(200).send(response);
    } catch (error) {
      next(error);
    }
  };

  public deleteVideo = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const trainerData = req.user;
      const { videoId } = req.params;
      const response: { count: number } =
        await this.curriculumVideoService.deleteVideo({
          trainer: trainerData,
          videoId,
        });
      res.status(200).send(response);
    } catch (error) {
      next(error);
    }
  };

}
export default CurriculumVideoController;
