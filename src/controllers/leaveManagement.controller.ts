import { InstructorInstitute } from '@/interfaces/instructorInstitute.interface';
import {
  leaveManagementRequestDTO,
  leaveManagementApproveRequestDTO,
} from '@/dtos/leaveManagement.dto';
import LeaveManagementService from '@/services/leaveManagement.service';
import { NextFunction, Request, Response } from 'express';
import { clearConfigCache } from 'prettier';
import { LeaveData, AddLeaveData } from '@/interfaces/leaveData.interface';

class LeaveManagementController {
  public leaveManagementService = new LeaveManagementService();

  public getLeaveByAdmin = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const loggedUser = req.user;
      const { search, pageRecord, pageNo, sortBy, order } = req.query;
      const queryObject = { search, pageRecord, pageNo, sortBy, order };
      const findLeave: {
        totalCount: number;
        records: (LeaveData | undefined)[];
      } = await this.leaveManagementService.getLeaveByAdmin({
        loggedUser,
        queryObject,
      });
      res.status(200).send(findLeave);
    } catch (error) {
      next(error);
    }
  };

  public getEventsByDate = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const loggedUser = req.user;
      const { Date } = req.body;
      const getEventData = await this.leaveManagementService.getEventsByDate(
        loggedUser,
        Date
      );
      res.status(200).send({ EventData: getEventData, message: 'Events List' });
    } catch (error) {
      next(error);
    }
  };

  public getLeaveByInstructor = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const loggedUser = req.user;
      const { search, pageRecord, pageNo, sortBy, order } = req.query;
      const queryObject = { search, pageRecord, pageNo, sortBy, order };
      const findLeave = await this.leaveManagementService.getLeaveByInstructor({
        loggedUser,
        queryObject,
      });
      res.status(200).send(findLeave);
    } catch (error) {
      next(error);
    }
  };

  public getLeaveViewbyInstructor = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const loggedUser = req.user;
      const { search, pageRecord, pageNo, sortBy, order, role } = req.query;
      const queryObject = { search, pageRecord, pageNo, sortBy, order, role };
      const findLeave =
        await this.leaveManagementService.getLeaveViewbyInstructor({
          loggedUser,
          queryObject,
        });
      res.status(200).send(findLeave);
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
      res
        .status(200)
        .send({ response: createLeaveStatus, message: 'Leave created' });
    } catch (error) {
      next(error);
    }
  };

  public createBulkLeave = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      res.sendStatus(200);
    } catch (error) {
      next(error);
    }
  };

  public getLeaveById = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const loggedUser = req.user;
      const leaveId = req.params.id;
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
        .send({ response: updateLeaveStatus, message: 'Leave updated' });
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
      res
        .status(200)
        .send({ response: deleteLeaveStatus, message: 'Leave deleted' });
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
        response: approveLeaveStatus,
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
