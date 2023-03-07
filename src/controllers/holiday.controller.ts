import { InstructorInstitute } from '@/interfaces/instructorInstitute.interface';
import { LeaveTypeDTO } from '@/dtos/leaveType.dto';
import HolidayService from '@/services/holiday.service';
import { NextFunction, Request, Response } from 'express';
import { clearConfigCache } from 'prettier';
import {
  HolidayList,
  Holiday,
  HolidaywithDetails,
  AllHolidaywithDetails,
} from '@/interfaces/holiday.interface';

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
      const holidayList = await this.holidayService.createHoliday({
        loggedUser,
        holidayData,
      });

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
      const holidayId = req.params.id;
      const holidayData: any = req.body;
      const holidayInfo: any = await this.holidayService.updateHoliday({
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
      const holidayId = req.params.id;
      const holidayList: HolidayList = await this.holidayService.deleteHoliday({
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
