import { NextFunction, Request, Response } from 'express';
import { Role } from '@/interfaces/role.instance';
import { RoleDto } from '@/dtos/role.dto';
import RoleService from '@/services/role.service';

class RoleController {
  public roleService = new RoleService();

  public createRole = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const roleData: RoleDto = req.body;
      const createRoleData: Role = await this.roleService.addRole(roleData);

      res.status(200).json({
        data: createRoleData,
        messages: 'Role created successfully!!',
      });
    } catch (error) {
      next(error);
    }
  };
  public viewAllRoles = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const user = req.user;
      const { search, pageRecord, pageNo, sortBy, order } = req.query;
      const queryObject = { search, pageRecord, pageNo, sortBy, order };
      const response: {
        totalCount: number;
        records: (Role | undefined)[];
      } = await this.roleService.viewAllRoles(user, queryObject);
      res.status(200).send(response);
    } catch (err) {
      next(err);
    }
  };
  public listRoles = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const response: {
        totalCount: number;
        records: (Role | undefined)[];
      } = await this.roleService.listRoles();
      res.status(200).send(response);
    } catch (err) {
      next(err);
    }
  };
  public updateRole = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const user = req.user;
      const { roleId } = req.params;
      const roleDetails = req.body;

      const updateRole = await this.roleService.updateRole(
        user,
        roleId,
        roleDetails
      );
      res.status(200).send(updateRole);
    } catch (error) {
      next(error);
    }
  };
  public deleteRole = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const { roleId } = req.params;
      const user = req.user;
      const response: { count: number } = await this.roleService.deleteRole(
        roleId,
        user
      );
      res.status(200).send(response);
    } catch (error) {
      next(error);
    }
  };
}
export default RoleController;
