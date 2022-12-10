import { Router } from 'express';
import OrderController from '@controllers/order.controller';
import { Routes } from '@interfaces/routes.interface';
import passport from 'passport';
import passportConfig from '@/config/passportConfig';
import validationMiddleware from '@/middlewares/validation.middleware';
import { AddOrderDTO, VerifyOrderDTO } from '@/dtos/order.dto';

class OrderRoute implements Routes {
  public path = '/order';
  public router = Router();
  public orderController = new OrderController();
  public passport = passportConfig(passport);

  constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.get(
      `${this.path}`,
      passport.authenticate('jwt', { session: false }),
      this.orderController.listOrders
    );
    this.router.post(
      `${this.path}`,
      [
        passport.authenticate('jwt', { session: false }),
        validationMiddleware(AddOrderDTO, 'body'),
      ],
      this.orderController.addOrder
    );
    this.router.post(
      `${this.path}/verify`,
      [
        passport.authenticate('jwt', { session: false }),
        validationMiddleware(VerifyOrderDTO, 'body'),
      ],
      this.orderController.verifyOrder
    );
  }
}

export default OrderRoute;
