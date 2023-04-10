import Db from '@/databases';
import { CourseTypeDto } from '@/dtos/courseType.dto';
import CourseTypeService from '@/services/courseType.service';
import courseType from './data/courseType';

class CreateCourseType {
  public courseType = Db.CourseType;
  public CourseTypeService = new CourseTypeService();

  public init = async () => {
    try {
      const res = await this.courseType.count();
      if (res !== 0) return;
      let courseTypeInstance: CourseTypeDto;
      courseTypeInstance = await this.courseType.create(courseType);
    } catch (error) {
      return error;
    }
  };
}
export default CreateCourseType;
