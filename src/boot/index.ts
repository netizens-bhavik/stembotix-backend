import CreateUser from './createUser';
import CreateRole from './createRoles';
import CreateCourses from './createCourse';
import CreateProduct from './createProduct';

class BootFiles {
  public createRole = new CreateRole();
  public createUser = new CreateUser();
  public createCourses = new CreateCourses();
  public createProduct = new CreateProduct();

  public async init() {
    await this.createRole.init();
    await this.createUser.init();
    await this.createCourses.init();
    await this.createProduct.init();
  }
}
export default BootFiles;
