import { Router } from 'express';
import validationMiddleware from '@middlewares/validation.middleware';
import { Routes } from '@interfaces/routes.interface';
import passport from 'passport';
import passportConfig from '@/config/passportConfig';
import InstituteInstructorController from '@controllers/instituteInstructor.controller';
import {
  InstituteInstructorIdDto,
  InstituteInstructorIdDTO,
  RequestProposalDTO,
} from '@/dtos/instituteInstructor.dto';
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

    //to view request for institute by instructor
    // this.router.get(
    //   `${this.path}/institute`,
    //   [passport.authenticate('jwt', { session: false })],
    //   this.instituteInstuctorController.getInstitueRequest
    // );

    //get all instructors
    // this.router.get(
    //   `${this.path}/instructors`,
    //   [passport.authenticate('jwt', { session: false })],
    //   this.instituteInstuctorController.fetchInstructors
    // );

    //for institute
    this.router.post(
      `${this.path}/request-instructor`,
      [
        passport.authenticate('jwt', { session: false }),
        validationMiddleware(RequestProposalDTO, 'body'),
      ],
      this.instituteInstuctorController.createInstructorRequest
    );

    //for instructor to approve
    this.router.put(
      `${this.path}/request-instructor/:offerId`,
      [
        passport.authenticate('jwt', { session: false }),
        validationMiddleware(InstituteInstructorIdDTO, 'body'),
      ],
      this.instituteInstuctorController.acceptInstructorRequest
    );

    // for instructor, institute, admin
    this.router.delete(
      `${this.path}/request-instructor/:offerId`,
      [
        passport.authenticate('jwt', { session: false }),
        validationMiddleware(InstituteInstructorIdDto, 'params'),
      ],
      this.instituteInstuctorController.deleteInstructorRequest
    );
    this.router.get(
      `${this.path}/instructor`,
      passport.authenticate('jwt', { session: false }),
      this.instituteInstuctorController.getReqByInstructorId
    );
    this.router.get(
      `${this.path}/list`,
      passport.authenticate('jwt', { session: false }),
      this.instituteInstuctorController.getDataByAdmin
    );

  }
}

export default InstituteInstroctorRoute;
