import { NextFunction, Request, Response } from 'express';
import OrderService from '@/services/order.service';
import { AddOrderDTO, VerifyOrderDTO } from '@/dtos/order.dto';

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
  public addOrder = async (req: Request, res: Response, next: NextFunction) => {
    try {
      //@ts-ignore
      const { id: userId } = req.user;
      const { amount }: AddOrderDTO = req.body;
      const response = await this.orderService.addOrder(userId, amount);
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
