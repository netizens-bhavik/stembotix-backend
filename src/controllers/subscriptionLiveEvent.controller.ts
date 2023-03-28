import { NextFunction, Request, Response } from 'express';
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
      const { subscriptionPrice } = req.body;
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
      const subscribeEventData: Subscribe =
        await this.subscriptionService.getVerifiedSubscriptionUser(
          livestreamId
        );
      res.status(200).send(subscribeEventData);
    } catch (error) {
      next(error);
    }
  };
  public getAllBookedEventByUserId = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const user = req.user;
      const { search } = req.query;
      const queryObject = { search };
      const getAllBookedEventByUserId =
        await this.subscriptionService.getAllBookedEventByUserId(
          user,
          queryObject
        );
      res.status(200).send(getAllBookedEventByUserId);
    } catch (err) {
      next(err);
    }
  };
}
export default SubscriptionController;
