import CreateUser from "./createUser";
class BootFiles {
  public createUser = new CreateUser();
  public async init() {
    await this.createUser.init();
  }
}
export default BootFiles;
