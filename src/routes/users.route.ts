import { Router } from "express";
import UsersController from "@controllers/users.controller";
import { RegisterUserDto } from "@dtos/users.dto";
import { Routes } from "@interfaces/routes.interface";
import validationMiddleware from "@middlewares/validation.middleware";
import passport from "passport";
import passportConfig from "@/config/passportConfig";
class UsersRoute implements Routes {
  public path = "/users";
  public router = Router();
  public usersController = new UsersController();
  public passport = passportConfig(passport);

  constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.get(`${this.path}`, this.usersController.getUsers);
    this.router.get(
      `${this.path}/:id`,
      passport.authenticate("jwt", { session: false }),
      this.usersController.getUserById
    );
    this.router.post(
      `${this.path}`,
      validationMiddleware(RegisterUserDto, "body"),
      this.usersController.createUser
    );
    this.router.put(
      `${this.path}/:id`,
      validationMiddleware(RegisterUserDto, "body", true),
      this.usersController.updateUser
    );
    this.router.delete(`${this.path}/:id`, this.usersController.deleteUser);
  }
}

export default UsersRoute;
