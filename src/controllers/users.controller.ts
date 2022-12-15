import { NextFunction, Request, Response } from 'express';
import { User } from '@interfaces/users.interface';
import userService from '@services/users.service';

class UsersController {
  public userService = new userService();

  public getUsers = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const loggedUser = req.user;
      const { search, pageRecord, pageNo, sortBy, order, role } = req.query;
      const queryObject = { search, pageRecord, pageNo, sortBy, order, role };
      const findAllUsersData: User[] = await this.userService.findAllUser(
        loggedUser,
        queryObject
      );

      res.status(200).json({ data: findAllUsersData, message: 'findAll' });
    } catch (error) {
      next(error);
    }
  };

  public getUserById = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const loggedUser = req.user;
      const userId = req.params.id;
      const findOneUserData: User = await this.userService.findUserById(
        loggedUser,
        userId
      );

      res.status(200).json({ data: findOneUserData, message: 'findOne' });
    } catch (error) {
      next(error);
    }
  };

  public updateUser = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const loggedUser = req.user;
      const userId = req.params.id;
      const userData = req.body;
      const updateUserData: User = await this.userService.updateUser(
        loggedUser,
        userId,
        userData
      );

      res.status(200).json({ data: updateUserData, message: 'updated' });
    } catch (error) {
      next(error);
    }
  };

  public deleteUser = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const loggedUser = req.user;
      const userId = req.params.id;
      const deleteUserData: User = await this.userService.deleteUser(
        loggedUser,
        userId
      );

      res.status(200).json({ data: deleteUserData, message: 'deleted' });
    } catch (error) {
      next(error);
    }
  };
}

export default UsersController;
