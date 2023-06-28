import { Routes } from '@interfaces/routes.interface';
import { Router } from 'express';
import passport from 'passport';
import validationMiddleware from '@middlewares/validation.middleware';
import HolidayTypeController from '@/controllers/holidayType.controller';
import { HolidayTypeDto } from '@/dtos/holidayType.dto';

class HolidayTypeRoute implements Routes {
  public path = '/holiday-type';
  public router = Router();
  public holidayTypeController = new HolidayTypeController();

  constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.post(
      `${this.path}`,
      passport.authenticate('jwt', { session: false }),
      validationMiddleware(HolidayTypeDto, 'body'),
      this.holidayTypeController.addHolidayType
    );
    this.router.get(
      `${this.path}`,
      passport.authenticate('jwt', { session: false }),
      this.holidayTypeController.viewAllHolidayType
    );
    this.router.get(
      `${this.path}/list`,
      passport.authenticate('jwt', { session: false }),
      this.holidayTypeController.listHolidayType
    );
    this.router.put(
      `${this.path}/:holidayTypeId`,
      [
        passport.authenticate('jwt', { session: false }),
        validationMiddleware(HolidayTypeDto, 'body'),
      ],
      this.holidayTypeController.updateHolidayType
    );
    this.router.delete(
      `${this.path}/:holidayTypeId`,
      passport.authenticate('jwt', { session: false }),
      this.holidayTypeController.deleteHolidayType
    );
  }
}
export default HolidayTypeRoute;
