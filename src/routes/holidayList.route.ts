import { Router } from 'express';
import validationMiddleware from '@middlewares/validation.middleware';
import { Routes } from '@interfaces/routes.interface';
import passport from 'passport';
import passportConfig from '@/config/passportConfig';
import HolidayListController from '@controllers/holidayList.controller';
import { HolidayListDTO } from '@/dtos/holidayList.dto';
// import 'reflect-metadata';

class HolidayListRoute implements Routes {
  public path = '/holiday-list';
  public passport = passportConfig(passport);
  public router = Router();
  public holidayListController = new HolidayListController();

  constructor() {
    this.initializeRoutes();
  }
  private initializeRoutes() {
    this.router.get(
      `${this.path}/`,
      [passport.authenticate('jwt', { session: false })],
      this.holidayListController.getHolidayList
    );

    this.router.get(
      `${this.path}/list`,
      [passport.authenticate('jwt', { session: false })],
      this.holidayListController.getAllHolidayList
    );

    this.router.post(
      `${this.path}/`,
      [
        passport.authenticate('jwt', { session: false }),
        validationMiddleware(HolidayListDTO, 'body'),
      ],
      this.holidayListController.createHolidayList
    );

    this.router.put(
      `${this.path}/:id`,
      [
        passport.authenticate('jwt', { session: false }),
        validationMiddleware(HolidayListDTO, 'body'),
      ],
      this.holidayListController.updateHolidayList
    );

    this.router.delete(
      `${this.path}/:id`,
      [passport.authenticate('jwt', { session: false })],
      this.holidayListController.deleteHolidayList
    );
  }
}

export default HolidayListRoute;
