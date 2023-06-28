import { LivestreamCategory } from '@/interfaces/liveStreamCat.interface';
import LiveStreamCatService from '@/services/liveStreamCat.service';
import DB from '@databases';
import { NextFunction, Request, Response } from 'express';

class LiveStreamCatController {
  public liveStreamCatService = new LiveStreamCatService();
  public user = DB.User;
  public coursetype = DB.CourseType;

  public addLiveStreamCat = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const user = req.user;
      const { category } = req.body;
      const response = await this.liveStreamCatService.addLiveStreamCat(
        category,
        user
      );
      res.status(200).send({
        response: response,
        message: 'Live stream category Added Successfully',
      });
    } catch (err) {
      next(err);
    }
  };
  public viewAllLiveStreamCat = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const user = req.user;
      const { search, pageRecord, pageNo, sortBy, order } = req.query;
      const queryObject = { search, pageRecord, pageNo, sortBy, order };
      const response: {
        totalCount: number;
        records: (LivestreamCategory | undefined)[];
      } = await this.liveStreamCatService.viewAllLiveStreamCat(
        user,
        queryObject
      );
      res.status(200).send(response);
    } catch (err) {
      next(err);
    }
  };
  public listLiveStreamCat = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const user = req.user;
      const response: {
        totalCount: number;
        records: (LivestreamCategory | undefined)[];
      } = await this.liveStreamCatService.listLiveStreamCat(user);
      res.status(200).send(response);
    } catch (err) {
      next(err);
    }
  };
  public updateLiveStreamCat = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const user = req.user;
      const { catId } = req.params;
      const catDetail = req.body;

      const updateProductCat =
        await this.liveStreamCatService.updateLiveStreamCat(
          user,
          catId,
          catDetail
        );
      res.status(200).send(updateProductCat);
    } catch (error) {
      next(error);
    }
  };
  public deleteLiveStreamCat = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const { catId } = req.params;
      const user = req.user;
      const response: { count: number } =
        await this.liveStreamCatService.deleteLiveStreamCat(catId, user);
      res.status(200).send(response);
    } catch (error) {
      next(error);
    }
  };
}
export default LiveStreamCatController;
