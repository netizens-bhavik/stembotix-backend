import DB from '@databases';
import { HttpException } from '@exceptions/HttpException';
import { isEmpty } from '@utils/util';
import { Course } from '@/interfaces/course.interface';
import { API_BASE } from '@config';

class CourseService {
  public course = DB.Course;
  public trainer = DB.Trainer;
  public user = DB.User;
  public coursesTrainers = DB.CoursesTrainers;

  public isTrainer(user): boolean {
    return user.role === 'trainer';
  }
  public async viewCourses(queryObject): Promise<(Course | undefined)[]> {
    // sorting
    const sortBy = queryObject.sortBy ? queryObject.sortBy : 'createdAt';
    const order = queryObject.order === 'DESC' ? 'DESC' : 'ASC';
    // pagination
    const pageSize = queryObject.pageRecord ? queryObject.pageRecord : 10;
    const pageNo = queryObject.pageNo ? (queryObject.pageNo - 1) * pageSize : 0;

    // Search
    const [search, searchCondition] = queryObject.search
      ? [`%${queryObject.search}%`, DB.Sequelize.Op.like]
      : ['', DB.Sequelize.Op.ne];

    const data: (Course | undefined)[] = await this.course.findAll({
      where: DB.Sequelize.and(
        { status: 'Published' },
        {
          title: {
            [searchCondition]: search,
          },
        }
      ),
      include: [
        {
          model: this.trainer,
          include: [
            {
              model: this.user,
            },
          ],
        },
      ],

      limit: pageSize,
      offset: pageNo,
      order: [[`${sortBy}`, `${order}`]],
    });
    return data;
  }
  public async addCourse({ courseDetails, file, trainer }): Promise<Course> {
    if (!this.isTrainer(trainer)) {
      throw new HttpException(403, 'Forbidden Resource');
    }

    const trainerRecord = await this.trainer.findOne({
      where: {
        user_id: trainer.id,
      },
    });

    if (!trainerRecord)
      throw new HttpException(404, 'Requested trainer details do not exist');

    const filePath = `${API_BASE}/media/${file.path
      .split('/')
      .splice(-2)
      .join('/')}`;

    const newCourse = await this.course.create({
      ...courseDetails,
      thumbnail: filePath,
    });

    newCourse.addTrainer(trainerRecord);

    return {
      id: newCourse.id,
      status: newCourse.status,
      title: newCourse.title,
      level: newCourse.level,
      price: newCourse.price,
      language: newCourse.language,
      description: newCourse.description,
      thumbnail: `${API_BASE}/media/${newCourse.thumbnail}`,
      // @ts-ignore
      updatedAt: newCourse.updateAt,
      createdAt: newCourse.createdAt,
      deletedAt: newCourse.deletedAt,
    };
  }
  public async getCourseById(courseId: string): Promise<Course> {
    const response: Course = await this.course.findOne({
      where: {
        id: courseId,
      },
      include: [
        {
          model: this.trainer,
          through: [],
          include: [
            {
              model: this.user,
            },
          ],
        },
      ],
    });
    return response;
  }
  public async updateCourse({
    courseDetails,
    file,
    trainer,
  }): Promise<{ count: number; rows: Course[] }> {
    if (!this.isTrainer(trainer) || !trainer.isEmailVerified)
      throw new HttpException(403, 'Forbidden Resource');
    const record = await this.trainer.findOne({
      include: {
        model: this.course,
        where: {
          id: courseDetails.id,
        },
      },
      where: {
        user_id: trainer.id,
      },
    });
    if (!record) throw new HttpException(403, 'Forbidden Resource');

    const filePath = file?.path.split('/').splice(-2).join('/');
    if (filePath) courseDetails.thumbnail = `${API_BASE}/media/${filePath}`;
    const updateCourse = await this.course.update(
      {
        ...courseDetails,
      },
      {
        where: {
          id: courseDetails.id,
        },
        returning: true,
      }
    );
    return { count: updateCourse[0], rows: updateCourse[1] };
  }
  public async deleteCourse({ trainer, courseId }): Promise<{ count: number }> {
    if (!this.isTrainer(trainer)) throw new HttpException(401, 'Unauthorized');
    const courseRecord: Course = await this.course.findOne({
      where: { id: courseId },
      include: [
        {
          model: this.trainer,
          where: {
            user_id: trainer.id,
          },
        },
      ],
    });
    if (!courseRecord) throw new HttpException(403, 'Forbidden Resource');
    if (courseRecord.status === 'Published')
      throw new HttpException(
        400,
        'This course is published and can not be deleted. First unpublish this course and then delete it.'
      );
    const res: number = await this.course.destroy({
      where: {
        id: courseId,
      },
    });

    return { count: res };
  }
  public async listCourses({
    trainer,
    queryObject,
  }): Promise<(Course | undefined)[]> {
    if (isEmpty(trainer) || !this.isTrainer(trainer))
      throw new HttpException(401, 'Unauthorized');

    // sorting
    const sortBy = queryObject.sortBy ? queryObject.sortBy : 'createdAt';
    const order = queryObject.order === 'DESC' ? 'DESC' : 'ASC';
    // pagination
    const pageSize = queryObject.pageRecord ? queryObject.pageRecord : 10;
    const pageNo = queryObject.pageNo ? (queryObject.pageNo - 1) * pageSize : 0;

    // Search
    const [search, searchCondition] = queryObject.search
      ? [`%${queryObject.search}%`, DB.Sequelize.Op.like]
      : ['', DB.Sequelize.Op.ne];

    const trainerRecord = await this.trainer.findOne({
      where: { user_id: trainer.id },
    });
    if (!trainerRecord) throw new HttpException(404, 'Invalid Request');
    const courses = this.course.findAll({
      where: { title: { [searchCondition]: search } },
      limit: pageSize,
      offset: pageNo,
      order: [[`${sortBy}`, `${order}`]],
      include: [
        {
          model: this.trainer,
          through: [],
          where: {
            trainer_id: trainerRecord.trainer_id,
          },
        },
      ],
    });
    return courses;
  }
  public async togglePublish({
    trainer,
    courseId,
  }): Promise<{ count: number }> {
    if (!this.isTrainer(trainer))
      throw new HttpException(403, 'Forbidden Resource');
    const courseRecord = await this.course.findOne({
      where: {
        id: courseId,
      },
      include: [
        {
          model: this.trainer,
          through: [],
          where: { user_id: trainer.id },
        },
      ],
    });
    if (!courseRecord) throw new HttpException(403, 'Forbidden Resource');
    const status = courseRecord.status === 'Drafted' ? 'Published' : 'Drafted';
    await courseRecord.update({ status });
    return { count: 1 };
  }
}
export default CourseService;
