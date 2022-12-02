import { NextFunction, Request, Response } from "express";
import { Role } from "@/interfaces/role.instance";
import { RoleDto } from "@/dtos/role.dto";
import RoleService from "@/services/role.service";

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

      res
        .status(200)
        .json({
          data: createRoleData,
          messages: "Role created successfully!!",
        });
    } catch (error) {
      next(error);
    }
  };
}
export default RoleController;
