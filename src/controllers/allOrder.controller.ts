import { NextFunction, Request, Response } from 'express';
import { Product } from '@/interfaces/product.interface';
import AllOrderService from '@/services/allOrder.service';
import { Course } from '@/interfaces/course.interface';

class AllOrderController {
  public allOrderService = new AllOrderService();

  public getAllDataOfProductOrder = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const user = req.user;
      const { search, pageRecord, pageNo, sortBy, order } = req.query;
      const queryObject = { search, pageRecord, pageNo, sortBy, order };
      const response: { totalCount: number; records: (Product | undefined)[] } =
        await this.allOrderService.getAllDataOfProductOrder(user, queryObject);
      res.status(200).send(response);
    } catch (err) {
      next(err);
    }
  };

  public getAllDataOfCourseOrder = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const user = req.user;
      const { search, pageRecord, pageNo, sortBy, order, startDate } =
        req.query;
      const queryObject = {
        search,
        pageRecord,
        pageNo,
        sortBy,
        order,
        startDate,
      };
      const response: { totalCount: number; records: (Course | undefined)[] } =
        await this.allOrderService.getAllDataOfCourseOrder(user, queryObject);
      res.status(200).send(response);
    } catch (err) {
      next(err);
    }
  };
  public deleteOrderDatabyAdmin = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const { orderId } = req.params;
      const user = req.user;
      const response = await this.allOrderService.deleteOrderDatabyAdmin(
        user,
        orderId
      );
      res.status(200).send(response);
    } catch (err) {
      next(err);
    }
  };
  public getOrderDataByInstructor = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const user = req.user;
      const { search, pageRecord, pageNo, sortBy, order } = req.query;
      const queryObject = { search, pageRecord, pageNo, sortBy, order };
      const response: { totalCount: number; records: (Course | undefined)[] } =
        await this.allOrderService.getOrderDataByInstructor(user, queryObject);
      res.status(200).send(response);
    } catch (err) {
      next(err);
    }
  };
  public getOrderDataofProductByInstitute = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const user = req.user;
      const { search, pageRecord, pageNo, sortBy, order } = req.query;
      const queryObject = { search, pageRecord, pageNo, sortBy, order };
      const response: { totalCount: number; records: (Course | undefined)[] } =
        await this.allOrderService.getOrderDataofProductByInstitute(
          user,
          queryObject
        );
      res.status(200).send(response);
    } catch (err) {
      next(err);
    }
  };
}
export default AllOrderController;
