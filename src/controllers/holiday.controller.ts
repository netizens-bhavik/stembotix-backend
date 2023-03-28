import HolidayService from '@/services/holiday.service';
import { NextFunction, Request, Response } from 'express';
class HolidayController {
  public holidayService = new HolidayService();

  public getHoliday = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const loggedUser = req.user;
      const { search, pageRecord, pageNo, sortBy, order } = req.query;
      const queryObject = { search, pageRecord, pageNo, sortBy, order };

      const holidayList = await this.holidayService.getHolidays({
        loggedUser,
        queryObject,
      });

      res.status(200).send(holidayList);
    } catch (error) {
      next(error);
    }
  };

  public getAllHolidays = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const loggedUser = req.user;
      const holidayList = await this.holidayService.getAllHolidays({
        loggedUser,
      });

      res.status(200).send(holidayList);
    } catch (error) {
      next(error);
    }
  };

  public createHoliday = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const loggedUser = req.user;
      const holidayData = req.body;
      const holidayList = await this.holidayService.createHoliday(
        loggedUser,
        holidayData
      );

      res.status(200).send(holidayList);
    } catch (error) {
      next(error);
    }
  };

  public updateHoliday = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const loggedUser = req.user;
      const { holidayId } = req.params;
      const holidayData = req.body;
      const holidayInfo = await this.holidayService.updateHoliday({
        loggedUser,
        holidayId,
        holidayData,
      });

      res.status(200).send(holidayInfo);
    } catch (error) {
      next(error);
    }
  };

  public deleteHoliday = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const loggedUser = req.user;
      const { holidayId } = req.params;
      const holidayList: { count: number } =
        await this.holidayService.deleteHoliday({
          loggedUser,
          holidayId,
        });

      res.status(200).send(holidayList);
    } catch (error) {
      next(error);
    }
  };
}
export default HolidayController;
