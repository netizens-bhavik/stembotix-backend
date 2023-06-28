import { HolidayType } from '@/interfaces/holidayType.interface';
import HolidayTypeService from '@/services/holidayType.service';
import { NextFunction, Request, Response } from 'express';

class HolidayTypeController {
  public holidayTypeService = new HolidayTypeService();

  public addHolidayType = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const user = req.user;
      const { type } = req.body;
      const response = await this.holidayTypeService.addHolidayType(type, user);
      res.status(200).send({
        response: response,
        message: 'Holiday Type Added Successfully',
      });
    } catch (err) {
      next(err);
    }
  };
  public viewAllHolidayType = async (
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
        records: (HolidayType | undefined)[];
      } = await this.holidayTypeService.viewAllHolidayType(user, queryObject);
      res.status(200).send(response);
    } catch (err) {
      next(err);
    }
  };
  public listHolidayType = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const user = req.user;
      const response: {
        totalCount: number;
        records: (HolidayType | undefined)[];
      } = await this.holidayTypeService.listHolidayType(user);
      res.status(200).send(response);
    } catch (err) {
      next(err);
    }
  };
  public updateHolidayType = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const user = req.user;
      const { holidayTypeId } = req.params;
      const holidayTypeDetails = req.body;

      const updateHolidayType = await this.holidayTypeService.updateHolidayType(
        user,
        holidayTypeId,
        holidayTypeDetails
      );
      res.status(200).send(updateHolidayType);
    } catch (error) {
      next(error);
    }
  };
  public deleteHolidayType = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const { holidayTypeId } = req.params;
      const user = req.user;
      const response: { count: number } =
        await this.holidayTypeService.deleteHolidayType(holidayTypeId, user);
      res.status(200).send(response);
    } catch (error) {
      next(error);
    }
  };
}
export default HolidayTypeController;
