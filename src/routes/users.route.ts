import { Router } from 'express';
import UsersController from '@controllers/users.controller';
import { Routes } from '@interfaces/routes.interface';
import passport from 'passport';
import passportConfig from '@/config/passportConfig';
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
      `${this.path}`,
      passport.authenticate('jwt', { session: false }),
      this.usersController.getUsers
    );

    this.router.get(
      `${this.path}/allUser`,
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
