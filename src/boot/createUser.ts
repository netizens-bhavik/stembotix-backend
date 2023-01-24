import DB from '@/databases';
import userData from './data/user';
import UserService from '@/services/users.service';
import { RegisterUserDto } from '@dtos/users.dto';
import { User } from '@/interfaces/users.interface';

class CreateUser {
  public users = DB.User;
  public roles = DB.Role;
  public trainers = DB.Trainer;

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
        const userInstance: User = await this.users.create({
          ...userData,
          role_id: roleRes.id,
        });
        if (userData.role.match(/admin/i)) {
          await this.trainers.create({
            user_id: userInstance.id,
          });
        }
      }
    } catch (error) {
      return error;
    }
  };
}
export default CreateUser;
