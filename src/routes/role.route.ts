import { Router } from 'express';
import RoleController from '@/controllers/role.controller';
import validationMiddleware from '@middlewares/validation.middleware';
import { Routes } from '@interfaces/routes.interface';
import { RoleDto } from '@/dtos/role.dto';
import passport from 'passport';

class RoleRoute implements Routes {
  public path = '/role';
  public router = Router();
  public roleController = new RoleController();

  constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.post(
      `${this.path}`,
      validationMiddleware(RoleDto, 'body'),
      this.roleController.createRole
    );
    this.router.get(
      `${this.path}`,
      passport.authenticate('jwt', { session: false }),
      this.roleController.viewAllRoles
    );
    this.router.get(`${this.path}/list`, this.roleController.listRoles);
    this.router.put(
      `${this.path}/:roleId`,
      [
        passport.authenticate('jwt', { session: false }),
        validationMiddleware(RoleDto, 'body'),
      ],
      this.roleController.updateRole
    );
    this.router.delete(
      `${this.path}/:roleId`,
      passport.authenticate('jwt', { session: false }),
      this.roleController.deleteRole
    );
  }
}
export default RoleRoute;
