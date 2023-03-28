import { InstructorInstitute } from '@/interfaces/instructorInstitute.interface';
import { LiveStreamChat } from '@/interfaces/liveStramChat.interface';
import InstituteInstructorService from '@/services/instituteInstructor.service';
import { NextFunction, Request, Response } from 'express';

class InstituteInstructorController {
  public instituteInstructionService = new InstituteInstructorService();

  public createInstructorRequest = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const loggedUser = req.user;
      const instructorDetail = req.body;
      const createInstructorRequestResponse =
        await this.instituteInstructionService.createInstructorRequest(
          loggedUser,
          instructorDetail
        );

      res.status(200).json({
        message: 'Request sent successfully',
        data: createInstructorRequestResponse,
      });
    } catch (err) {
      next(err);
    }
  };

  public acceptInstructorRequest = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const { offerId } = req.params;
      const loggedUser = req.user;
      const isAcceptedCount = req.body;
      const liveStreamChatResponse: { count: number } =
        await this.instituteInstructionService.acceptApproval(
          offerId,
          loggedUser,
          isAcceptedCount
        );

      res.status(200).send(liveStreamChatResponse);
    } catch (err) {
      next(err);
    }
  };

  public deleteInstructorRequest = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const { offerId } = req.params;
      const loggedUser = req.user;
      const liveStreamChatResponse: LiveStreamChat =
        await this.instituteInstructionService.deleteInstituteRequest(
          loggedUser,
          offerId
        );

      res.status(200).json({
        message: 'Message deleted successfully',
        data: liveStreamChatResponse,
      });
    } catch (err) {
      next(err);
    }
  };

  public getInstitueRequest = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const loggedUser = req.user;
      const { search, pageRecord, pageNo, sortBy, order } = req.query;
      const queryObject = { search, pageRecord, pageNo, sortBy, order };

      const liveStreamChatResponse: LiveStreamChat =
        await this.instituteInstructionService.getInstituteRequest(
          loggedUser,
          queryObject
        );

      res.status(200).json({
        message: 'Message deleted successfully',
        data: liveStreamChatResponse,
      });
    } catch (error) {
      next(error);
    }
  };
  public getReqByInstructorId = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const user = req.user;
      const response: {
        totalCount: number;
        records: (InstructorInstitute | undefined)[];
      } = await this.instituteInstructionService.getReqByInstructorId(user);
      res.status(200).send(response);
    } catch (error) {
      next(error);
    }
  };
  public getDataByAdmin = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const trainer = req.user;
      const { search, pageRecord, pageNo, sortBy, order } = req.query;
      const queryObject = { search, pageRecord, pageNo, sortBy, order };
      const response: {
        totalCount: number;
        records: (InstructorInstitute | undefined)[];
      } = await this.instituteInstructionService.getDataByAdmin({
        trainer,
        queryObject,
      });
      res.status(200).send(response);
    } catch (error) {
      next(error);
    }
  };
  public viewRequest = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const user = req.user;
      const instructor = req.body;
      const response = await this.instituteInstructionService.viewRequest(
        user,
        instructor
      );
      res.status(200).send(response);
    } catch (error) {
      next(error);
    }
  };
  public viewInstituteByInstructor = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const user = req.user;
      const response =
        await this.instituteInstructionService.viewInstituteByInstructor(user);
      res.status(200).send(response);
    } catch (err) {
      next(err);
    }
  };
}
export default InstituteInstructorController;
