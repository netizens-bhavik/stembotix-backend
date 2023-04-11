import DB from '@/databases';
import { AddCourseDTO } from '@/dtos/cart.dto';
import CourseService from '@/services/courses.service';
import courseData from './data/course';

class CreateCourses {
  public course = DB.Course;
  public CourseService = new CourseService();
  public user = DB.User;
  public courseType = DB.CourseType;
  public trainer = DB.Trainer;

  public init = async () => {
    try {
      const data = await this.courseType.findAll({
        limit: 1,

        order: [['createdAt', 'DESC']],
      });
      const userData = await this.user.findOne({
        where: {
          role: 'Admin',
        },
      });

      const trainerRecord = await this.trainer.findOne({
        where: {
          userId: userData.id,
        },
      });
      const res = await this.course.count();
      if (res !== 0) return;
      let courseInstance = await this.course.create({
        ...courseData,
        coursetypeId: data.id,
      });
      courseInstance.addTrainer(trainerRecord);
    } catch (error) {
      return error;
    }
  };
}
export default CreateCourses;
