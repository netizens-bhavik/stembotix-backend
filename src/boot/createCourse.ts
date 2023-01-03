import DB from '@/databases';
import { AddCourseDTO } from '@/dtos/cart.dto';
import CourseService from '@/services/courses.service';
import courseData from './data/course';

class CreateCourses {
  public course = DB.Course;
  public CourseService = new CourseService();

  public init = async () => {
    try {
      const res = await this.course.count();
      if (res !== 0) return;

      let courseInstance: AddCourseDTO;

      courseInstance = await this.course.create(courseData);
    } catch (error) {
      return error;
    }
  };
}
export default CreateCourses;
