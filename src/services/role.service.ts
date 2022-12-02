import DB from "@databases";
import { HttpException } from "@exceptions/HttpException";
import { isEmpty } from "@utils/util";
import { Role } from "@/interfaces/role.instance";
import { RoleDto } from "@/dtos/role.dto";

class RoleService {
  public role = DB.Role;

  public async addRole(roleData: RoleDto): Promise<Role> {
    if (isEmpty(roleData)) throw new HttpException(400, "roleData is empty");

    const role: Role = await this.role.create(roleData);
    return role;
  }
}
export default RoleService;
