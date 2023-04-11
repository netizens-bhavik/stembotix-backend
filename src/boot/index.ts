import CreateUser from './createUser';
import CreateRole from './createRoles';
import CreateCourses from './createCourse';
import CreateProduct from './createProduct';
import CreateHolidayList from './createHolidayList';
import CreateCourseType from './createCourseType';

class BootFiles {
  public createRole = new CreateRole();
  public createUser = new CreateUser();
  public createCourseType = new CreateCourseType();
  public createCourses = new CreateCourses();
  public createProduct = new CreateProduct();
  public createHolidayList = new CreateHolidayList();

  public async init() {
    await this.createRole.init();
    await this.createUser.init();
    await this.createCourseType.init();
    await this.createCourses.init();
    await this.createProduct.init();
    await this.createHolidayList.init();
  }
}
export default BootFiles;
