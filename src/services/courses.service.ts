import DB from '@databases';
import { HttpException } from '@exceptions/HttpException';
import { isEmpty } from '@utils/util';
import { Course } from '@/interfaces/course.interface';
import { API_BASE, API_SECURE_BASE } from '@config';
import { makeValidator } from 'envalid';

class CourseService {
  public course = DB.Course;
  public trainer = DB.Trainer;
  public user = DB.User;
  public coursesTrainers = DB.CoursesTrainers;

  public isTrainer(user): boolean {
    return user.role === 'trainer' || user.role === 'admin';
  }
  public async viewCourses(
    queryObject
  ): Promise<{ totalCount: number; records: (Course | undefined)[] }> {
    // sorting
    const sortBy = queryObject.sortBy ? queryObject.sortBy : 'createdAt';
    const order = queryObject.order === 'DESC' ? 'DESC' : 'ASC';
    // pagination
    const pageSize = queryObject.pageRecord ? queryObject.pageRecord : 10;
    const pageNo = queryObject.pageNo ? (queryObject.pageNo - 1) * pageSize : 0;
    // Search
    const [search, searchCondition] = queryObject.search
      ? [`%${queryObject.search}%`, DB.Sequelize.Op.iLike]
      : ['', DB.Sequelize.Op.ne];

    const courseData = await this.course.findAndCountAll({
      where: { status: 'Published' },
    });
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
    return { totalCount: courseData.count, records: data };
  }
  public async addCourse({ courseDetails, file, user }): Promise<Course> {
    if (!this.isTrainer(user)) {
      throw new HttpException(403, 'Forbidden Resource');
    }

    const trainerRecord = await this.trainer.findOne({
      where: {
        user_id: user.id,
      },
    });

    if (!trainerRecord)
      throw new HttpException(404, 'Requested trainer details do not exist');

    const { trailer, thumbnail } = file;
    const trailerPath = `${API_BASE}/media/${trailer[0].path
      .split('/')
      .splice(-2)
      .join('/')}`;
    const thumbnailPath = `${API_BASE}/media/${thumbnail[0].path
      .split('/')
      .splice(-2)
      .join('/')}`;

    const newCourse = await this.course.create({
      ...courseDetails,
      trailer: trailerPath,
      thumbnail: thumbnailPath,
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
      trailer: `${API_BASE}/media/${newCourse.trailer}`,
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
        {
          model: DB.CurriculumSection,
          include: {
            model: DB.CurriCulumVideo,
          },
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

    const { trailer, thumbnail } = file;
    if (trailer) {
      const trailerPath = `${API_BASE}/media/${trailer[0].path
        .split('/')
        .splice(-2)
        .join('/')}`;
      courseDetails.trailer = trailerPath;
    }
    if (thumbnail) {
      const thumbnailPath = `${API_BASE}/media/${thumbnail[0].path
        .split('/')
        .splice(-2)
        .join('/')}`;
      courseDetails.thumbnail = thumbnailPath;
    }
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
        'This course is published and can not be deleted. First unpublish this course and then delete it'
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
  }): Promise<{ totalCount: number; records: (Course | undefined)[] }> {
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
      ? [`%${queryObject.search}%`, DB.Sequelize.Op.iLike]
      : ['', DB.Sequelize.Op.ne];

    const trainerRecord = await this.trainer.findOne({
      where: { user_id: trainer.id },
    });
    if (!trainerRecord) throw new HttpException(404, 'Invalid Request');
    const coursesCount = await this.course.findAndCountAll({
      include: [
        {
          model: this.trainer,
          where: {
            trainer_id: trainerRecord.trainer_id,
          },
        },
      ],
    });
    const courses = await this.course.findAll({
      where: DB.Sequelize.or(
        { title: { [searchCondition]: search } },
        { language: { [searchCondition]: search } }
      ),
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
    return { totalCount: coursesCount.count, records: courses };
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
