import CreateUser from "./createUser";
import CreateRole from "./createRoles";
class BootFiles {
  public createRole = new CreateRole();
  public createUser = new CreateUser();
  public async init() {
    await this.createRole.init();
    await this.createUser.init();
  }
}
export default BootFiles;
