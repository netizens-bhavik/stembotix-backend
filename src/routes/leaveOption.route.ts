import { Routes } from '@interfaces/routes.interface';
import { Router } from 'express';
import passport from 'passport';
import validationMiddleware from '@middlewares/validation.middleware';
import LeaveOptionController from '@/controllers/leaveOption.controller';
import { LeaveOptionDto } from '@/dtos/leaveOption.dto';

class LeaveOptionRoute implements Routes {
  public path = '/leave-option';
  public router = Router();
  public leaveOptionController = new LeaveOptionController();

  constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.post(
      `${this.path}`,
      passport.authenticate('jwt', { session: false }),
      validationMiddleware(LeaveOptionDto, 'body'),
      this.leaveOptionController.addLeaveOption
    );
    this.router.get(
      `${this.path}`,
      passport.authenticate('jwt', { session: false }),
      this.leaveOptionController.viewAllLeaveOption
    );
    this.router.get(
      `${this.path}/list`,
      passport.authenticate('jwt', { session: false }),
      this.leaveOptionController.listLeaveOption
    );
    this.router.put(
      `${this.path}/:leaveOptionId`,
      [
        passport.authenticate('jwt', { session: false }),
        validationMiddleware(LeaveOptionDto, 'body'),
      ],
      this.leaveOptionController.updateLeaveOption
    );
    this.router.delete(
      `${this.path}/:leaveOptionId`,
      passport.authenticate('jwt', { session: false }),
      this.leaveOptionController.deleteLeaveOption
    );
  }
}
export default LeaveOptionRoute;
