import HolidayListService from '@/services/holidayList.service';
import { NextFunction, Request, Response } from 'express';
import {
  HolidayList,
  AllHolidayList,
} from '@/interfaces/holidayList.interface';

class HolidayListController {
  public holidayListService = new HolidayListService();

  public getHolidayList = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const loggedUser = req.user;
      const { search, pageRecord, pageNo, sortBy, order } = req.query;
      const queryObject = { search, pageRecord, pageNo, sortBy, order };

      const holidayList: AllHolidayList =
        await this.holidayListService.getHolidayList({
          queryObject,
        });

      res.status(200).send(holidayList);
    } catch (error) {
      next(error);
    }
  };

  public getAllHolidayList = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const loggedUser = req.user;
      const holidayList = await this.holidayListService.getAllHolidayList({
        loggedUser,
      });

      res.status(200).send(holidayList);
    } catch (error) {
      next(error);
    }
  };

  public createHolidayList = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const loggedUser = req.user;
      const holidayListData: HolidayList = req.body;
      const holidayList: HolidayList =
        await this.holidayListService.createHolidayList({
          loggedUser,
          holidayListData,
        });

      res.status(200).send(holidayList);
    } catch (error) {
      next(error);
    }
  };

  public updateHolidayList = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const loggedUser = req.user;
      const holidayListId = req.params.id;
      const holidayListData: HolidayList = req.body;
      const holidayList = await this.holidayListService.updateHolidayList({
        loggedUser,
        holidayListId,
        holidayListData,
      });

      res.status(200).send(holidayList);
    } catch (error) {
      next(error);
    }
  };

  public deleteHolidayList = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const loggedUser = req.user;
      const holidayListId = req.params.id;
      const holidayList: { count: number } =
        await this.holidayListService.deleteHolidayList({
          loggedUser,
          holidayListId,
        });

      res.status(200).send(holidayList);
    } catch (error) {
      next(error);
    }
  };
}
export default HolidayListController;
