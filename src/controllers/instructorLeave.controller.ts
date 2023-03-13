import { InstructorInstitute } from '@/interfaces/instructorInstitute.interface';
import { LeaveTypeDTO } from '@/dtos/leaveType.dto';
import InstructorLeaveService from '@/services/instructorLeave.service';
import { NextFunction, Request, Response } from 'express';
import { clearConfigCache } from 'prettier';
import { LeaveType, AddLeaveType } from '@/interfaces/leaveType.interface';

class InstructorLeaveController {
  public instructorLeaveService = new InstructorLeaveService();

  public getInstructorLeave = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const loggedUser = req.user;
      const { search, pageRecord, pageNo, sortBy, order } = req.query;
      const queryObject = { search, pageRecord, pageNo, sortBy, order };

      const instructorLeaves =
        await this.instructorLeaveService.getInstructorLeave({
          loggedUser,
          queryObject,
        });

      res.status(200).send(instructorLeaves);
    } catch (error) {
      next(error);
    }
  };

  public addInstructorLeave = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const loggedUser = req.user;
      const leaveData = req.body;

      const instructorLeaves =
        await this.instructorLeaveService.addInstructorLeave({
          loggedUser,
          leaveData,
        });

      res.status(200).send(instructorLeaves);
    } catch (error) {
      next(error);
    }
  };

  public updateInstructorLeave = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const loggedUser = req.user;
      const leaveData = req.body;
      const intructorLeaveId = req.params.id;
      const instructorLeaves =
        await this.instructorLeaveService.updateInstructorLeave({
          loggedUser,
          leaveData,
          intructorLeaveId,
        });

      res.status(200).send(instructorLeaves);
    } catch (error) {
      next(error);
    }
  };

  public deleteInstructorLeave = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const loggedUser = req.user;
      const intructorLeaveId = req.params.id;

      const instructorLeaves =
        await this.instructorLeaveService.deleteInstructorLeave({
          loggedUser,
          intructorLeaveId,
        });

      res.status(200).send(instructorLeaves);
    } catch (error) {
      next(error);
    }
  };

  public getInstructorsList = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const loggedUser = req.user;

      const instructorList =
        await this.instructorLeaveService.getInstructorsList({
          loggedUser,
        });

      res.status(200).send(instructorList);
    } catch (error) {
      next(error);
    }
  };
}
export default InstructorLeaveController;
