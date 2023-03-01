import { InstructorInstitute } from '@/interfaces/instructorInstitute.interface';
import {
  leaveManagementRequestDTO,
  leaveManagementApproveRequestDTO,
} from '@/dtos/leaveManagement.dto';
import LeaveManagementService from '@/services/leaveManagement.service';
import { NextFunction, Request, Response } from 'express';

class LeaveManagementController {
  public leaveManagementService = new LeaveManagementService();

  public getLeave = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const loggedUser = req.user;
      const findLeave = await this.leaveManagementService.getLeave(loggedUser);
      res.status(200).send({ leaveData: findLeave, message: 'Leave found' });
    } catch (error) {
      next(error);
    }
  };

  public createLeave = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const loggedUser = req.user;
      const reqBody: leaveManagementRequestDTO = req.body;
      const createLeaveStatus = await this.leaveManagementService.createLeave(
        loggedUser,
        reqBody
      );
      res.status(200).send({ ...createLeaveStatus, message: 'Leave created' });
    } catch (error) {
      next(error);
    }
  };

  public createBulkLeave = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    res.sendStatus(200);
  };

  public getLeaveById = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const loggedUser = req.user;
      const leaveId = req.params.id;
      // console.log(leaveId);
      const findLeave = await this.leaveManagementService.getLeaveById(
        loggedUser,
        leaveId
      );
      res.status(200).send({ leaveData: findLeave, message: 'Leave found' });
    } catch (error) {
      next(error);
    }
  };

  public updateLeaveById = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const loggedUser = req.user;
      const leaveId = req.params.id;
      const reqBody: leaveManagementRequestDTO = req.body;

      const updateLeaveStatus =
        await this.leaveManagementService.updateLeaveById(
          loggedUser,
          leaveId,
          reqBody
        );
      res
        .status(200)
        .send({ status: updateLeaveStatus, message: 'Leave updated' });
    } catch (error) {
      next(error);
    }
  };

  public deleteLeaveById = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const loggedUser = req.user;
      const leaveId = req.params.id;
      const deleteLeaveStatus =
        await this.leaveManagementService.deleteLeaveById(loggedUser, leaveId);
      res.status(200).send({ ...deleteLeaveStatus, message: 'Leave deleted' });
    } catch (error) {
      next(error);
    }
  };

  public approveLeaveById = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const loggedUser = req.user;
      const leaveId = req.params.id;
      const isApproved: leaveManagementApproveRequestDTO = req.body;
      const approveLeaveStatus =
        await this.leaveManagementService.approveLeaveById(
          loggedUser,
          leaveId,
          isApproved
        );
      res.status(200).send({
        status: approveLeaveStatus,
        message: `Leave ${
          isApproved.isApproved === 'Approved' ? 'Approved' : 'Rejected'
        }`,
      });
    } catch (error) {
      next(error);
    }
  };
}
export default LeaveManagementController;
