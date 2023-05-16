import { Router } from 'express';
import validationMiddleware from '@middlewares/validation.middleware';
import { Routes } from '@interfaces/routes.interface';
import passport from 'passport';
import passportConfig from '@/config/passportConfig';
import HolidayController from '@controllers/holiday.controller';
import { HolidayDTO } from '@/dtos/holiday.dto';
// import 'reflect-metadata';

class HolidayRoute implements Routes {
  public path = '/holiday';
  public passport = passportConfig(passport);
  public router = Router();
  public holidayController = new HolidayController();

  constructor() {
    this.initializeRoutes();
  }
  private initializeRoutes() {
    this.router.get(
      `${this.path}`,
      passport.authenticate('jwt', { session: false }),
      this.holidayController.getHoliday
    );

    this.router.get(
      `${this.path}/list`,
      passport.authenticate('jwt', { session: false }),
      this.holidayController.getAllHolidays
    );

    this.router.post(
      `${this.path}`,
      [
        passport.authenticate('jwt', { session: false }),
        validationMiddleware(HolidayDTO, 'body'),
      ],
      this.holidayController.createHoliday
    );

    this.router.put(
      `${this.path}/:holidayId`,
      passport.authenticate('jwt', { session: false }),
      validationMiddleware(HolidayDTO, 'body'),
      this.holidayController.updateHoliday
    );

    this.router.delete(
      `${this.path}/:holidayId`,
      passport.authenticate('jwt', { session: false }),
      this.holidayController.deleteHoliday
    );
  }
}

export default HolidayRoute;
