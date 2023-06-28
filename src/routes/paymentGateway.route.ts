import { Router } from 'express';
import PaymentGatewayController from '@/controllers/paymentGateway.controller';
import validationMiddleware from '@middlewares/validation.middleware';
import { Routes } from '@interfaces/routes.interface';
import passport from 'passport';
import passportConfig from '@/config/passportConfig';
import { PaymentGatewayDto } from '@/dtos/paymentGateway.dto';
import { uploadFiles } from '@/rest/fileUpload';
import { imageUpload } from '@/middlewares/imageUpload.middleware';

class PaymentGatewayRoute implements Routes {
  public path = '/payment-gateway';
  public router = Router();
  public paymentGatewayController = new PaymentGatewayController();
  public passport = passportConfig(passport);

  constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.post(
      `${this.path}`,
      passport.authenticate('jwt', { session: false }),
      [
        uploadFiles.single('logo'),
        (req, res, next) => {
          req.body.meta = Object(req.body.meta);
          next();
        },
        imageUpload,
        // validationMiddleware(PaymentGatewayDto, 'body'),
      ],
      this.paymentGatewayController.addPaymentGateway
    );
    this.router.get(
      `${this.path}/active`,
      passport.authenticate('jwt', { session: false }),
      this.paymentGatewayController.getActivePaymentGateways
    );
    this.router.get(
      `${this.path}`,
      passport.authenticate('jwt', { session: false }),
      this.paymentGatewayController.getPaymentGateways
    );
    this.router.get(
      `${this.path}/:gatewayId`,
      passport.authenticate('jwt', { session: false }),
      this.paymentGatewayController.getPaymentGatewayById
    );
    this.router.put(
      `${this.path}/:gatewayId`,
      passport.authenticate('jwt', { session: false }),
      [
        uploadFiles.single('logo'),
        (req, res, next) => {
          req.body.meta = Object(req.body.meta);
          next();
        },
        imageUpload,
        // validationMiddleware(BlogDto, 'body'),
      ],
      this.paymentGatewayController.updatePaymentGateways
    );
    this.router.delete(
      `${this.path}/:gatewayId`,
      passport.authenticate('jwt', { session: false }),
      this.paymentGatewayController.deletePaymentGateway
    );
  }
}
export default PaymentGatewayRoute;
