import DB from "@/databases";
import roleData from "./data/role";

class CreateRole {
  public roles = DB.Role;

  public init = async () => {
    try {
      const res = await this.roles.count();
      if (res !== 0) return;
      await this.roles.bulkCreate(roleData);
    } catch (error) {
     return error;
    }
  };
}

export default CreateRole;
