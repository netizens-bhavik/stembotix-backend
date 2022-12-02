import { Router } from "express";
import RoleController from "@/controllers/role.controller";
import validationMiddleware from "@middlewares/validation.middleware";
import { Routes } from "@interfaces/routes.interface";
import { RoleDto } from "@/dtos/role.dto";

class RoleRoute implements Routes {
  public path = "/role";
  public router = Router();
  public roleController = new RoleController();

  constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.post(
      `${this.path}`,
      validationMiddleware(RoleDto, "body"),
      this.roleController.createRole
    );
  }
}
export default RoleRoute;
