import { NextFunction, Request, Response } from 'express';
import { PaymentGateway } from '@/interfaces/paymentGateway.interface';
import PaymentGatewayService from '@/services/paymentGateway.service';

class PaymentGatewayController {
  public paymentGatewayService = new PaymentGatewayService();

  public addPaymentGateway = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const gatewayDetails: Request = req.body;
      const user = req.user;
      const file = req.file;
      const response: PaymentGateway =
        await this.paymentGatewayService.addPaymentGateWay(
          gatewayDetails,
          user,
          file
        );
      res.status(200).send({
        response: response,
        message: 'Payment gateway Added Successfully',
      });
    } catch (error) {
      next(error);
    }
  };

  public getActivePaymentGateways = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const user = req.user;
      const response: PaymentGateway =
        await this.paymentGatewayService.getActivePaymentGateways(user);
      res.status(200).send(response);
    } catch (error) {
      next(error);
    }
  };

  public getPaymentGateways = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const user = req.user;
      const response: PaymentGateway =
        await this.paymentGatewayService.getPaymentGateways(user);
      res.status(200).send(response);
    } catch (error) {
      next(error);
    }
  };
  public getPaymentGatewayById = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const user = req.user;
      const { gatewayId } = req.params;
      const response: PaymentGateway =
        await this.paymentGatewayService.getPaymentGatewayById(user, gatewayId);
      res.status(200).send(response);
    } catch (error) {
      next(error);
    }
  };

  public updatePaymentGateways = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const gatewayDetails: Request = req.body;
      const { gatewayId } = req.params;
      const user = req.user;
      const file = req.file;
      const response = await this.paymentGatewayService.updatePaymentGateways({
        gatewayId,
        gatewayDetails,
        file,
        user,
      });
      res.status(200).send({
        response: response,
        message: 'Payment gateway update successfully',
      });
    } catch (error) {
      next(error);
    }
  };

  public deletePaymentGateway = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const user = req.user;
      const { gatewayId } = req.params;
      const response: { count: number } =
        await this.paymentGatewayService.deletePaymentGateway({
          gatewayId,
          user,
        });
      res.status(200).send({
        response: response,
        message: 'Payment gateway Deleted Successfully',
      });
    } catch (error) {
      next(error);
    }
  };
}
export default PaymentGatewayController;
