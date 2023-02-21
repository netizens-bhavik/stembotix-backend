import { NextFunction, Request, Response } from 'express';
import { AddOrderDto, VerifyOrderDto } from '@/dtos/subscribeLiveEvent.dto';
import SubscriptionService from '@/services/subscribeLiveEvent.service';
import { Subscribe } from '@/interfaces/liveStream.interface';

class SubscriptionController {
  public subscriptionService = new SubscriptionService();

  public addSubscription = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const user = req.user;
      const { liveStreamId } = req.params;
      const { subscriptionPrice }: AddOrderDto = req.body;
      const response = await this.subscriptionService.addSubscription(
        user,
        subscriptionPrice,
        liveStreamId
      );
      res.status(200).send(response);
    } catch (err) {
      next(err);
    }
  };
  public verifySubscription = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      //@ts-ignore
      const { id: userId } = req.user;
      const { subscriptionId } = req.params;
      const orderBody = req.body;
      const response = await this.subscriptionService.verifysubscription(
        userId,
        orderBody,
        subscriptionId
      );
      res.status(200).send(response);
    } catch (error) {
      next(error);
    }
  };
  public getVerifiedSubscriptionUser = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const { livestreamId } = req.params;
      const coursesData: Subscribe =
        await this.subscriptionService.getVerifiedSubscriptionUser(
          livestreamId
        );
      res.status(200).send(coursesData);
    } catch (error) {
      next(error);
    }
  };
}
export default SubscriptionController;
