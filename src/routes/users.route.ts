import { Router } from 'express';
import UsersController from '@controllers/users.controller';
import { Routes } from '@interfaces/routes.interface';
import passport from 'passport';
import passportConfig from '@/config/passportConfig';
import validationMiddleware from '@/middlewares/validation.middleware';
import { CreateAdminDto } from '@/dtos/users.dto';
class UsersRoute implements Routes {
  public path = '/users';
  public router = Router();
  public usersController = new UsersController();
  public passport = passportConfig(passport);

  constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.get(
      `${this.path}/home-count`,
      this.usersController.homeCounter
    );
    this.router.post(
      `${this.path}/createUser`,
      passport.authenticate('jwt', { session: false }),
      validationMiddleware(CreateAdminDto, 'body'),
      this.usersController.createUserbySuperAdmin
    );
    this.router.put(
      `${this.path}/updateUser/:userId`,
      passport.authenticate('jwt', { session: false }),
      validationMiddleware(CreateAdminDto, 'body'),
      this.usersController.updateUserDetailBySuperAdmin
    );

    this.router.get(
      `${this.path}`,
      passport.authenticate('jwt', { session: false }),
      this.usersController.getUsers
    );

    this.router.get(
      `${this.path}/monthWiseUsers`,
      passport.authenticate('jwt', { session: false }),
      this.usersController.getAllUserMonthWise
    );
    this.router.get(
      `${this.path}/:id`,
      passport.authenticate('jwt', { session: false }),
      this.usersController.getUserById
    );

    this.router.put(
      `${this.path}/:id`,
      passport.authenticate('jwt', { session: false }),
      this.usersController.updateUser
    );
    this.router.delete(
      `${this.path}/:id`,
      passport.authenticate('jwt', { session: false }),
      this.usersController.deleteUser
    );
  }
}

export default UsersRoute;
