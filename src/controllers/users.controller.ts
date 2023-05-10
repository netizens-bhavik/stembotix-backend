import { NextFunction, Request, Response } from 'express';
import { User } from '@interfaces/users.interface';
import UserService from '@services/users.service';

class UsersController {
  public userService = new UserService();
  public createUserbySuperAdmin = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const adminDetail = req.body;
      const user = req.user;
      const record = await this.userService.createUserbySuperAdmin({
        adminDetail,
        user,
      });
      res
        .status(200)
        .send({ record: record, message: 'User created successfully' });
    } catch (err) {
      next(err);
    }
  };
  public updateUserDetailBySuperAdmin = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const user = req.user;
      const { userId } = req.params;
      const userDetail = req.body;
      const response = await this.userService.updateUserDetailBySuperAdmin({
        user,
        userId,
        userDetail,
      });
      res.status(200).send(response);
    } catch (err) {
      next(err);
    }
  };
  public getUsers = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const loggedUser = req.user;
      const { search, pageRecord, pageNo, sortBy, order, role } = req.query;
      const queryObject = { search, pageRecord, pageNo, sortBy, order, role };
      const findAllUsersData: { totalCount: number; records: User[] } =
        await this.userService.findAllUser(loggedUser, queryObject);
      res.status(200).send(findAllUsersData);
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
      const { id: userId } = req.params;
      const deleteUserData: User = await this.userService.deleteUser(
        loggedUser,
        userId
      );

      res.status(200).json({ data: deleteUserData, message: 'deleted' });
    } catch (error) {
      next(error);
    }
  };

  public getAllUserMonthWise = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const user = req.user;
      const response = await this.userService.getAllUserMonthWise(user);
      res.status(200).send(response);
    } catch (err) {
      next(err);
    }
  };
}

export default UsersController;
