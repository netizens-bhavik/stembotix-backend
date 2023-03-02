import { HttpException } from '@/exceptions/HttpException';
import { Coursetype } from '@/interfaces/courseType.interface';
import DB from '@databases';

class CourseTypeService {
  public coursetype = DB.CourseType;
  public user = DB.User;

  public isTrainer(user): boolean {
    return user.role === 'Admin';
  }
  public async addCourseType(coursetype, user): Promise<Coursetype> {
    if (!this.isTrainer(user)) {
      throw new HttpException(403, 'Forbidden Resource');
    }
    const response = await this.coursetype.findOne({
      where: {
        course_type: coursetype.course_type,
      },
    });
    if (response) throw new HttpException(402, 'Type Already Exist');
    const courseType = await this.coursetype.create({
      ...coursetype,
      userId: user.id,
    });
    return courseType;
  }
  public async viewAllCourseType( user): Promise<any> {
    if (!this.isTrainer(user)) {
      throw new HttpException(403, 'Forbidden Resource');
    }
    const courseType = await this.coursetype.findAndCountAll({
      userId: user.id,
    });
    return courseType;
  }
}
export default CourseTypeService;
