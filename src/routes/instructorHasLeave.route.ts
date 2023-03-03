import { Router } from 'express';
import validationMiddleware from '@middlewares/validation.middleware';
import { Routes } from '@interfaces/routes.interface';
import passport from 'passport';
import passportConfig from '@/config/passportConfig';
import InstructorLeaveController from '@controllers/instructorLeave.controller';
import { InstructorLeaveCountDTO } from '@/dtos/instructorLeave.dto';
// import 'reflect-metadata';

class InstructorLeaveRoute implements Routes {
  public path = '/instructor-leaves';
  public passport = passportConfig(passport);
  public router = Router();
  public instructorLeaveController = new InstructorLeaveController();

  constructor() {
    this.initializeRoutes();
  }
  private initializeRoutes() {
    this.router.get(
      `${this.path}/`,
      [passport.authenticate('jwt', { session: false })],
      this.instructorLeaveController.getInstructorLeave
    );
    this.router.post(
      `${this.path}/`,
      [
        passport.authenticate('jwt', { session: false }),
        validationMiddleware(InstructorLeaveCountDTO, 'body'),
      ],
      this.instructorLeaveController.addInstructorLeave
    );
    this.router.put(
      `${this.path}/:id`,
      [
        passport.authenticate('jwt', { session: false }),
        validationMiddleware(InstructorLeaveCountDTO, 'body'),
      ],
      this.instructorLeaveController.updateInstructorLeave
    );
    this.router.delete(
      `${this.path}/:id`,
      [passport.authenticate('jwt', { session: false })],
      this.instructorLeaveController.deleteInstructorLeave
    );

    this.router.get(
      `${this.path}/instructors`,
      [passport.authenticate('jwt', { session: false })],
      this.instructorLeaveController.getInstructorsList
    );
  }
}

export default InstructorLeaveRoute;
