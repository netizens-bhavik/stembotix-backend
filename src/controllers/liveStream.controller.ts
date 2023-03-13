import {
  LiveStream,
  LiveStreamUserRecord,
} from '@/interfaces/liveStream.interface';
import LiveStreamService from '@/services/liveStream.service';
import { NextFunction, Request, Response } from 'express';

class LiveStreamController {
  public liveStreamService = new LiveStreamService();
  public createLiveStream = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const liveStreamDetails = req.body;
      const trainer = req.user;
      const file = req.file;
      const response = await this.liveStreamService.createLiveStream({
        liveStreamDetails,
        user: trainer,
        file,
      });
      res.status(200).send(response);
    } catch (err) {
      next(err);
    }
  };
  public viewLiveStream = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const user = req.user;

      const coursesData: {
        totalCount: number;
        records: (LiveStream | undefined)[];
      } = await this.liveStreamService.viewLiveStream(user);
      res.status(200).send(coursesData);
    } catch (error) {
      next(error);
    }
  };
  public viewLiveStreamById = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const { livestreamId } = req.params;
      const coursesData = await this.liveStreamService.viewLiveStreambyId(
        livestreamId
      );
      res.status(200).send(coursesData);
    } catch (error) {
      next(error);
    }
  };
  public updateLiveStream = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const { livestreamId } = req.params;
      const livestreamDetails = req.body;
      const file = req.file;
      const user = req.user;
      // livestreamDetails['id'] = livestreamId;
      const response = await this.liveStreamService.updateLiveStream({
        livestreamDetails,
        file,
        user,
        livestreamId,
      });
      res.status(200).send(response);
    } catch (error) {
      next(error);
    }
  };
  public deleteLivestream = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const user = req.user;
      const { livestreamId } = req.params;
      const response: { count: number } =
        await this.liveStreamService.deleteLiveStream({
          user,
          livestreamId,
        });
      res.status(200).send(response);
    } catch (error) {
      next(error);
    }
  };
  public viewLiveStreamAdmin = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const { search, pageRecord, pageNo, sortBy, order } = req.query;
      const liveStreamData: {
        totalCount: number;
        records: (LiveStream | undefined)[];
      } = await this.liveStreamService.viewLiveStreamByAdmin({
        search,
        pageRecord,
        pageNo,
        sortBy,
        order,
      });
      res.status(200).send(liveStreamData);
    } catch (error) {
      next(error);
    }
  };
  public listLiveEvent = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const trainer = req.user;
      const { search, pageRecord, pageNo, sortBy, order } = req.query;
      const queryObject = { search, pageRecord, pageNo, sortBy, order };
      const response: {
        totalCount: number;
        records: (LiveStream | undefined)[];
      } = await this.liveStreamService.listLiveEvent(trainer, queryObject);
      res.status(200).send(response);
    } catch (error) {
      next(error);
    }
  };
  public getUserTimeLogByEventId = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const { search, pageRecord, pageNo, sortBy, order } = req.query;
      const queryObject = { search, pageRecord, pageNo, sortBy, order };
      const { livestreamId } = req.params;
      const trainer = req.user;
      const response: {
        totalCount: number;
        records: LiveStreamUserRecord[];
      } = await this.liveStreamService.getUserTimeLogByEventId(
        livestreamId,
        queryObject,
        trainer
      );
      res.status(200).send(response);
    } catch (error) {
      next(error);
    }
  };
  public deleteUserAttendance = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const { livestreamchatlogsId } = req.params;
      const trainer = req.user;
      const response: { count: number } =
        await this.liveStreamService.deleteUserAttendance(
          livestreamchatlogsId,
          trainer
        );
      res.status(200).send(response);
    } catch (err) {
      next(err);
    }
  };
}
export default LiveStreamController;
