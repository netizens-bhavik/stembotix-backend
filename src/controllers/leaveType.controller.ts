import { InstructorInstitute } from '@/interfaces/instructorInstitute.interface';
import { LeaveTypeDTO } from '@/dtos/leaveType.dto';
import LeaveTypeService from '@/services/leaveType.service';
import { NextFunction, Request, Response } from 'express';
import { clearConfigCache } from 'prettier';
import { LeaveType, AddLeaveType } from '@/interfaces/leaveType.interface';

class LeaveTypeController {
  public leaveTypeService = new LeaveTypeService();

  public getLeaveType = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const loggedUser = req.user;
      const { search, pageRecord, pageNo, sortBy, order } = req.query;
      const queryObject = { search, pageRecord, pageNo, sortBy, order };

      const leaveTypes = await this.leaveTypeService.getLeaveType({
        loggedUser,
        queryObject,
      });

      res.status(200).send(leaveTypes);
    } catch (error) {
      next(error);
    }
  };

  public addLeaveType = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const loggedUser = req.user;
      const leaveTypeData: LeaveTypeDTO = req.body;

      const addLeave = await this.leaveTypeService.addLeaveType({
        loggedUser,
        leaveTypeData,
      });

      res.status(200).send(addLeave);
    } catch (error) {
      next(error);
    }
  };

  public updateLeaveType = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const loggedUser = req.user;
      const leaveTypeData: LeaveTypeDTO = req.body;
      const leaveTypeId = req.params.id;

      const updateLeave = await this.leaveTypeService.updateLeaveType({
        loggedUser,
        leaveTypeData,
        leaveTypeId,
      });

      res.status(200).send(updateLeave);
    } catch (error) {
      next(error);
    }
  };

  public deleteLeaveType = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const loggedUser = req.user;
      const leaveTypeId = req.params.id;

      const deleteLeave = await this.leaveTypeService.deleteLeaveType({
        loggedUser,
        leaveTypeId,
      });

      res.status(200).send(deleteLeave);
    } catch (error) {
      next(error);
    }
  };

  // public toggleLeaveType = async (
  //   req: Request,
  //   res: Response,
  //   next: NextFunction
  // ) => {
  //   try {
  //     const loggedUser = req.user;
  //     const leaveTypeId = req.params.id;

  //     const toggleLeave = await this.leaveTypeService.toggleLeaveType({
  //       loggedUser,
  //       leaveTypeId,
  //     });

  //     res.status(200).send(toggleLeave);
  //   } catch (error) {
  //     next(error);
  //   }
  // };
}
export default LeaveTypeController;
