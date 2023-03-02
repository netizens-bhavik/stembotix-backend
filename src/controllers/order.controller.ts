import { NextFunction, Request, Response } from 'express';
import OrderService from '@/services/order.service';
import { AddOrderDTO, VerifyOrderDTO } from '@/dtos/order.dto';
import { OrderItem } from '@/interfaces/order.interface';

class OrderController {
  public orderService = new OrderService();
  public listOrders = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      //@ts-ignore
      const { id: userId } = req.user;
      const response = await this.orderService.listOrders(userId);
      res.status(200).send(response);
    } catch (error) {
      next(error);
    }
  };
  public listOrdersByAdmin = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const trainer = req.user;
      const { search, pageRecord, pageNo, sortBy, order } = req.query;
      const queryObject = { search, pageRecord, pageNo, sortBy, order };
      const response = await this.orderService.listOrdersByAdmin({
        queryObject,
        trainer,
      });
      res.status(200).send(response);
    } catch (error) {
      next(error);
    }
  };

  public addOrder = async (req: Request, res: Response, next: NextFunction) => {
    try {
      //@ts-ignore
      const user = req.user;
      const { amount }: AddOrderDTO = req.body;
      const response = await this.orderService.addOrder(user, amount);
      res.status(200).send(response);
    } catch (error) {
      next(error);
    }
  };
  public verifyOrder = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      //@ts-ignore
      const { id: userId } = req.user;
      const orderBody: VerifyOrderDTO = req.body;
      const response = await this.orderService.verifyOrder(userId, orderBody);
      res.status(200).send(response);
    } catch (error) {
      next(error);
    }
  };
}

export default OrderController;
