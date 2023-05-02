import DB from '@/databases';
import { CourseTypeDto } from '@/dtos/courseType.dto';
import CourseTypeService from '@/services/courseType.service';
import courseType from './data/courseType';

class CreateCourseType {
  public courseType = DB.CourseType;
  public user = DB.User;
  public CourseTypeService = new CourseTypeService();

  public init = async () => {
    try {
      const data = await this.user.findOne({
        where: {
          role: 'SuperAdmin',
        },
      });
      const res = await this.courseType.count();
      if (res !== 0) return;
      let courseTypeInstance: CourseTypeDto;
      courseTypeInstance = await this.courseType.create({
        ...courseType,
        userId: data.id,
      });
    } catch (error) {
      return error;
    }
  };
}
export default CreateCourseType;
