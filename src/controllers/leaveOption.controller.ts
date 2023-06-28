import { LeaveOption } from '@/interfaces/leaveOption.interface';
import LeaveOptionService from '@/services/leaveOption.service';
import DB from '@databases';
import { NextFunction, Request, Response } from 'express';

class LeaveOptionController {
  public leaveOptionService = new LeaveOptionService();
  public user = DB.User;
  public coursetype = DB.CourseType;

  public addLeaveOption = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const user = req.user;
      const { option } = req.body;
      const response = await this.leaveOptionService.addLeaveOption(
        option,
        user
      );
      res.status(200).send({
        response: response,
        message: 'Leave Option Added Successfully',
      });
    } catch (err) {
      next(err);
    }
  };
  public viewAllLeaveOption = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const user = req.user;
      const { search, pageRecord, pageNo, sortBy, order } = req.query;
      const queryObject = { search, pageRecord, pageNo, sortBy, order };
      const response: {
        totalCount: number;
        records: (LeaveOption | undefined)[];
      } = await this.leaveOptionService.viewAllLeaveOption(user, queryObject);
      res.status(200).send(response);
    } catch (err) {
      next(err);
    }
  };
  public listLeaveOption = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const user = req.user;
      const response: {
        totalCount: number;
        records: (LeaveOption | undefined)[];
      } = await this.leaveOptionService.listLeaveOption(user);
      res.status(200).send(response);
    } catch (err) {
      next(err);
    }
  };
  public updateLeaveOption = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const user = req.user;
      const { leaveOptionId } = req.params;
      const optionDetails = req.body;

      const updateLeaveOption = await this.leaveOptionService.updateLeaveOption(
        user,
        leaveOptionId,
        optionDetails
      );
      res.status(200).send(updateLeaveOption);
    } catch (error) {
      next(error);
    }
  };
  public deleteLeaveOption = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const { leaveOptionId } = req.params;
      const user = req.user;
      const response: { count: number } =
        await this.leaveOptionService.deleteLeaveOption(leaveOptionId, user);
      res.status(200).send(response);
    } catch (error) {
      next(error);
    }
  };
}
export default LeaveOptionController;
