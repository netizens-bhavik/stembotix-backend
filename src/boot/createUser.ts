import { hashSync, genSaltSync, compareSync } from "bcrypt";
import DB from "@/databases";
import userData from "./data/user";
import UserService from "@/services/users.service";
import { RegisterUserDto } from "@dtos/users.dto";

class CreateUser {
  public users = DB.User;
  public UserService = new UserService();

  public init = async () => {
    try {
      let userInstance: RegisterUserDto;

      const hashPassword = hashSync(userData.password, genSaltSync(8));
      userData.password = hashPassword;
      userInstance = await this.users.findOne({
        where: { email: userData.email },
      });
      if (!userInstance) {
        userInstance = await this.users.create(userData);
      }
    } catch (error) {
      return error;
    }
  };
}
export default CreateUser;
