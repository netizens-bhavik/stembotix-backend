import { LiveStreamChat } from '@/interfaces/liveStramChat.interface';
import InstituteInstructorService from '@/services/instituteInstructor.service';
import { NextFunction, Request, Response } from 'express';

class InstituteInstructorController {
  public instituteInstructionService = new InstituteInstructorService();

  public fetchInstructors = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const allInstructors =
        await this.instituteInstructionService.fetchInstructors();

      res.status(200).json({
        message: 'All instructors',
        data: allInstructors,
      });
    } catch (err) {
      next(err);
    }
  };

  public createInstructorRequest = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const loggedUser = req.user;
      const { instructorId } = req.body;

      const createInstructorRequestResponse =
        await this.instituteInstructionService.createInstructorRequest(
          loggedUser,
          instructorId
        );

      res.status(200).json({
        message: 'Request sent successfully',
        data: createInstructorRequestResponse,
      });
    } catch (err) {
      next(err);
    }
  };

  //   public accseptInstructorRequest = async (
  //     req: Request,
  //     res: Response,
  //     next: NextFunction
  //   ) => {
  //     try {
  //       const { livestreamId } = req.params;
  //       const { message } = req.body;
  //       const loggedUser = req.user;

  //       const liveStreamChatResponse: LiveStreamChat =
  //         await this.instituteInstructionService.sendLiveStreamChat(
  //           livestreamId,
  //           message,
  //           loggedUser
  //         );

  //       res.status(200).json({
  //         message: 'Message sent successfully',
  //         data: liveStreamChatResponse,
  //       });
  //     } catch (err) {
  //       next(err);
  //     }
  //   };

  //   public deleteInstructorRequest = async (
  //     req: Request,
  //     res: Response,
  //     next: NextFunction
  //   ) => {
  //     try {
  //       const { message_id } = req.params;
  //       const loggedUser = req.user;

  //       const liveStreamChatResponse: LiveStreamChat =
  //         await this.instituteInstructionService.sendLiveStreamChat(
  //             livestreamId,
  //             message,
  //             loggedUser
  //         );

  //       res.status(200).json({
  //         message: 'Message deleted successfully',
  //         data: liveStreamChatResponse,
  //       });
  //     } catch (err) {
  //       next(err);
  //     }
  //   };
}
export default InstituteInstructorController;
