import { Router } from 'express';
import validationMiddleware from '@middlewares/validation.middleware';
import { Routes } from '@interfaces/routes.interface';
import passport from 'passport';
import passportConfig from '@/config/passportConfig';
import InstituteInstructorController from '@controllers/instituteInstructor.controller';
import {
  AcceptProposalDTO,
  InstituteInstructorIdDto,
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
    //to view request for institute by instructor
    this.router.get(
      `${this.path}/institute-hire-status-list`,
      [passport.authenticate('jwt', { session: false })],
      this.instituteInstuctorController.getInstitueRequest
    );

    //for institute
    this.router.post(
      `${this.path}/request-instructor`,

      passport.authenticate('jwt', { session: false }),
      validationMiddleware(RequestProposalDTO, 'body'),
      this.instituteInstuctorController.createInstructorRequest
    );

    //for instructor to approve
    this.router.put(
      `${this.path}/request-instructor/:offerId`,
      passport.authenticate('jwt', { session: false }),
      validationMiddleware(AcceptProposalDTO, 'body'),
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

    // get all req by Instrutor Id
    this.router.get(
      `${this.path}/instructor-hire-status-list`,
      passport.authenticate('jwt', { session: false }),
      this.instituteInstuctorController.getReqByInstructor
    );

    // get all request by Admin
    this.router.get(
      `/admin${this.path}/hire-status-list`,
      passport.authenticate('jwt', { session: false }),
      this.instituteInstuctorController.getDataByAdmin
    );
    this.router.get(
      `${this.path}/hire-status`,
      passport.authenticate('jwt', { session: false }),
      this.instituteInstuctorController.viewRequest
    );
    this.router.get(
      `/instructor${this.path}/allInstitute`,
      passport.authenticate('jwt', { session: false }),
      this.instituteInstuctorController.viewInstituteByInstructor
    );
  }
}

export default InstituteInstroctorRoute;
