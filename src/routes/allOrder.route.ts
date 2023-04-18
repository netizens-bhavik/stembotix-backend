import { Router } from 'express';
import { Routes } from '@interfaces/routes.interface';
import passport from 'passport';
import passportConfig from '@/config/passportConfig';

import AllOrderController from '@/controllers/allOrder.controller';

class AllOrderRoute implements Routes {
  public path = '/allorder';
  public router = Router();
  public passport = passportConfig(passport);
  public allOrderController = new AllOrderController();

  constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.get(
      `${this.path}/product/get-all-order`,
      passport.authenticate('jwt', { session: false }),
      this.allOrderController.getAllDataOfProductOrder
    );

    this.router.get(
      `${this.path}/course/get-all-order`,
      passport.authenticate('jwt', { session: false }),
      this.allOrderController.getAllDataOfCourseOrder
    );
    this.router.delete(
      `/admin${this.path}/deleteorder/:orderId`,
      passport.authenticate('jwt', { session: false }),
      this.allOrderController.deleteOrderDatabyAdmin
    );
    this.router.get(
      `/instructor${this.path}/get-all-order`,
      passport.authenticate('jwt', { session: false }),
      this.allOrderController.getOrderDataofCourseByInstructor
    );
    this.router.get(
      `/instructor${this.path}/product/get-all-order`,
      passport.authenticate('jwt', { session: false }),
      this.allOrderController.getOrderDataofProductByInstructor
    );
  }
}
export default AllOrderRoute;
