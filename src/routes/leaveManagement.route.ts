import { Router } from 'express';
import validationMiddleware from '@middlewares/validation.middleware';
import { Routes } from '@interfaces/routes.interface';
import passport from 'passport';
import passportConfig from '@/config/passportConfig';
import LeaveManagementController from '@controllers/leaveManagement.controller';
import {
  leaveManagementRequestDTO,
  leaveManagementApproveRequestDTO,
} from '@/dtos/leaveManagement.dto';
// import 'reflect-metadata';

class LeaveManagementRoute implements Routes {
  public path = '/leave';
  public passport = passportConfig(passport);
  public router = Router();
  public leaveManagementController = new LeaveManagementController();

  constructor() {
    this.initializeRoutes();
  }
  private initializeRoutes() {
    this.router.get(
      `/admin${this.path}/`,
      [passport.authenticate('jwt', { session: false })],
      this.leaveManagementController.getLeave
    );

    this.router.get(
      `${this.path}/view`,
      [passport.authenticate('jwt', { session: false })],
      this.leaveManagementController.getLeaveView
    );

    this.router.post(
      `${this.path}`,
      [
        passport.authenticate('jwt', { session: false }),
        validationMiddleware(leaveManagementRequestDTO, 'body'),
      ],
      this.leaveManagementController.createLeave
    );

    //create bulk leave
    this.router.post(
      `${this.path}/bulk`,
      [passport.authenticate('jwt', { session: false })],
      this.leaveManagementController.createBulkLeave
    );

    //get leave by id
    this.router.get(
      `${this.path}/:id`,
      [passport.authenticate('jwt', { session: false })],
      this.leaveManagementController.getLeaveById
    );

    //update leave by id
    this.router.put(
      `${this.path}/:id`,
      [
        passport.authenticate('jwt', { session: false }),
        validationMiddleware(leaveManagementRequestDTO, 'body'),
      ],
      this.leaveManagementController.updateLeaveById
    );

    //delete leave by id
    this.router.delete(
      `${this.path}/:id`,
      [passport.authenticate('jwt', { session: false })],
      this.leaveManagementController.deleteLeaveById
    );

    //approve leave by id
    this.router.put(
      `${this.path}/approve/:id`,
      [
        passport.authenticate('jwt', { session: false }),
        validationMiddleware(leaveManagementApproveRequestDTO, 'body'),
      ],
      this.leaveManagementController.approveLeaveById
    );
  }
}

export default LeaveManagementRoute;
