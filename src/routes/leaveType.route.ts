import { Router } from 'express';
import validationMiddleware from '@middlewares/validation.middleware';
import { Routes } from '@interfaces/routes.interface';
import passport from 'passport';
import passportConfig from '@/config/passportConfig';
import LeaveTypeController from '@controllers/leaveType.controller';
import { LeaveTypeDTO } from '@/dtos/leaveType.dto';
// import 'reflect-metadata';

class LeaveTypeRoute implements Routes {
  public path = '/leave-type';
  public passport = passportConfig(passport);
  public router = Router();
  public leaveTypeController = new LeaveTypeController();

  constructor() {
    this.initializeRoutes();
  }
  private initializeRoutes() {
    this.router.get(
      `/admin${this.path}`,
      passport.authenticate('jwt', { session: false }),
      this.leaveTypeController.getLeaveType
    );
    this.router.get(
      `${this.path}/list`,
      passport.authenticate('jwt', { session: false }),
      this.leaveTypeController.getAllLeaveType
    );

    this.router.post(
      `/admin${this.path}`,
      passport.authenticate('jwt', { session: false }),
      validationMiddleware(LeaveTypeDTO, 'body'),
      this.leaveTypeController.addLeaveType
    );

    this.router.put(
      `/admin${this.path}/:leavetypeId`,
      passport.authenticate('jwt', { session: false }),
      validationMiddleware(LeaveTypeDTO, 'body', true),
      this.leaveTypeController.updateLeaveType
    );

    this.router.delete(
      `/admin${this.path}/:id`,
      passport.authenticate('jwt', { session: false }),
      this.leaveTypeController.deleteLeaveType
    );
  }
}

export default LeaveTypeRoute;
