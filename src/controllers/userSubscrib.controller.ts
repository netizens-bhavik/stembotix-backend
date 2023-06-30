import { NextFunction, Request, Response } from 'express';
import { UserSubscribe } from '@/interfaces/userSubscribe.interface';
import UserSubscribeService from '@/services/userSubscribe.service';

class UserSubscribeController {
  public userSubscribeService = new UserSubscribeService();

  public addUserSubcribe = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const userSubDetails: Request = req.body;
      const user = req.user;
      const response: UserSubscribe =
        await this.userSubscribeService.addUserSubcribe(userSubDetails, user);
      res.status(200).send({
        response: response,
        message: 'Subscribed Successfully',
      });
    } catch (error) {
      next(error);
    }
  };
}
export default UserSubscribeController;
