import { hashSync, genSaltSync, compareSync } from "bcrypt";
import DB from "@/databases";
import userData from "./data/user";
import UserService from "@/services/users.service";
import { RegisterUserDto } from "@dtos/users.dto";

class CreateUser {
  public users = DB.User;
  public roles = DB.Role;
  public UserService = new UserService();

  public init = async () => {
    try {
      const res = await this.users.count();
      if (res !== 0) return;

      let userInstance: RegisterUserDto;

      userInstance = await this.users.findOne({
        where: { email: userData.email },
      });
      if (!userInstance) {
        const roleRes = await this.roles.findOne({
          where: { roleName: userData.role },
        });
        userInstance = await this.users.create({
          ...userData,
          role_id: roleRes.id,
        });
      }
      
    } catch (error) {
      console.log(error);
    }
  };
}
export default CreateUser;
