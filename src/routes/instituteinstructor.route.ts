import { Router } from 'express';
import validationMiddleware from '@middlewares/validation.middleware';
import { Routes } from '@interfaces/routes.interface';
import passport from 'passport';
import passportConfig from '@/config/passportConfig';
import InstituteInstructorController from '@controllers/instituteInstructor.controller';
import { InstituteInstructorIdDTO } from '@/dtos/instituteInstructor.dto';
// import 'reflect-metadata';

class InstituteInstroctorRoute implements Routes {
  public path = '/institute-instructor';
  public passport = passportConfig(passport);
  public router = Router();
  public instituteInstuctorController = new InstituteInstructorController();

  constructor() {
    this.initializeRoutes();
  }
  private initializeRoutes() {
    //for admin
    // this.router.get(
    //   `admin/${this.path}`,
    //   [passport.authenticate('jwt', { session: false })],
    //   this.instituteInstuctorController.deleteInstructorRequest
    // );

    // //to view request for instructor by institute
    // this.router.get(
    //   `${this.path}/view-request-instructor`,
    //   [passport.authenticate('jwt', { session: false })],
    //   this.instituteInstuctorController.deleteInstructorRequest
    // );

    // //to view request for institute by instructor
    // this.router.get(
    //   `${this.path}/view-request-institute`,
    //   [passport.authenticate('jwt', { session: false })],
    //   this.instituteInstuctorController.deleteInstructorRequest
    // );

    //get all instructors
    this.router.get(
      `${this.path}/instructors`,
      [passport.authenticate('jwt', { session: false })],
      this.instituteInstuctorController.fetchInstructors
    );

    //for institute
    this.router.post(
      `${this.path}/request-instructor`,
      [passport.authenticate('jwt', { session: false })],
      this.instituteInstuctorController.createInstructorRequest
    );

    // //for instructor
    // this.router.put(
    //   `${this.path}/request-instructor/:id`,
    //   [
    //     passport.authenticate('jwt', { session: false }),
    //     validationMiddleware(InstituteInstructorIdDTO, 'params'),
    //   ],
    //   this.instituteInstuctorController.accseptInstructorRequest
    // );

    // // for instructor, institute, admin
    // this.router.delete(
    //   `${this.path}/request-instructor/:id`,
    //   [
    //     passport.authenticate('jwt', { session: false }),
    //     validationMiddleware(InstituteInstructorIdDTO, 'params'),
    //   ],
    //   this.instituteInstuctorController.deleteInstructorRequest
    // );
  }
}

export default InstituteInstroctorRoute;
