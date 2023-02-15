import DB from '@databases';
import { HttpException } from '@exceptions/HttpException';
import { isEmpty } from '@utils/util';
import { Course } from '@/interfaces/course.interface';
import { API_BASE, API_SECURE_BASE } from '@config';
import { makeValidator } from 'envalid';
import sequelize from 'sequelize';
import { uploadFileS3 } from '@/utils/s3/s3Uploads';

class CourseService {
  public course = DB.Course;
  public trainer = DB.Trainer;
  public user = DB.User;
  public coursesTrainers = DB.CoursesTrainers;
  public comment = DB.Comment;
  public reply = DB.Reply;
  public likedislike = DB.LikeDislike;
  public review = DB.Review;
  public orderitem = DB.OrderItem;
  public cartitem = DB.CartItem;

  public isTrainer(user): boolean {
    return user.role === 'Instructor' || user.role === 'Admin';
  }
  public async viewCourses(
    queryObject
  ): Promise<{ totalCount: number; records: (Course | undefined)[] }> {
    // sorting
    const sortBy = queryObject.sortBy ? queryObject.sortBy : 'createdAt';
    const order = queryObject.order || 'DESC';
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
      where: DB.Sequelize.and({
        status: 'Published',
        title: {
          [searchCondition]: search,
        },
      }),
      include: [
        {
          model: this.trainer,
          include: [
            {
              model: this.user,
            },
          ],
        },
        {
          model: DB.CurriculumSection,
          include: [
            {
              model: DB.CurriCulumVideo,
            },
            {
              model: DB.Quiz,
            },
          ],
        },
        {
          model: this.review,
          attributes: ['id', 'rating', 'userId'],
        },
      ],

      limit: pageSize,
      offset: pageNo,
      order: [[`${sortBy}`, `${order}`]],
    });
    return { totalCount: courseData.count, records: data };
  }
  public async viewCoursesAdmin(
    queryObject
  ): Promise<{ totalCount: number; records: (Course | undefined)[] }> {
    // sorting
    const sortBy = queryObject.sortBy ? queryObject.sortBy : 'createdAt';
    const order = queryObject.order || 'DESC';
    // pagination
    const pageSize = queryObject.pageRecord ? queryObject.pageRecord : 10;
    const pageNo = queryObject.pageNo ? (queryObject.pageNo - 1) * pageSize : 0;
    // Search
    const [search, searchCondition] = queryObject.search
      ? [`%${queryObject.search}%`, DB.Sequelize.Op.iLike]
      : ['', DB.Sequelize.Op.ne];

    const courseData = await this.course.findAndCountAll({
      where: DB.Sequelize.and({ deletedAt: null }),
    });
    const data: (Course | undefined)[] = await this.course.findAll({
      where: DB.Sequelize.and({
        deletedAt: null,
        title: {
          [searchCondition]: search,
        },
      }),
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
    const ab = { trailer, thumbnail };
    const trailerPath = `${API_BASE}/media/${trailer[0].path
      .split('/')
      .splice(-2)
      .join('/')}`;
    const thumbnailPath = `${API_BASE}/media/${thumbnail[0].path
      .split('/')
      .splice(-2)
      .join('/')}`;
    console.log(file);

    const uploadedFile = await uploadFileS3(ab); // Upload of s3
    console.log('bvdhsgfh', uploadedFile);

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
          include: [
            {
              model: DB.CurriCulumVideo,
            },
            {
              model: DB.Quiz,
            },
          ],
        },
        {
          model: this.comment,
          include: [
            {
              model: this.reply,
            },
          ],
        },
      ],
    });
    return response;
  }
  public async getCommentByCourseIdAdmin(
    courseId,
    queryObject
  ): Promise<{ totalCount: number; records: (Course | undefined)[] }> {
    //sorting
    const sortBy = queryObject.sortBy ? queryObject.sortBy : 'createdAt';
    const order = queryObject.order || 'DESC';
    // pagination
    const pageSize = queryObject.pageRecord ? queryObject.pageRecord : 10;
    const pageNo = queryObject.pageNo ? (queryObject.pageNo - 1) * pageSize : 0;
    // Search
    const [search, searchCondition] = queryObject.search
      ? [`%${queryObject.search}%`, DB.Sequelize.Op.iLike]
      : ['', DB.Sequelize.Op.ne];

    const response = await this.comment.findAndCountAll({
      where: DB.Sequelize.and(
        { course_id: courseId },
        {
          title: {
            [searchCondition]: search,
          },
        }
      ),

      include: [
        {
          model: this.user,
        },
        {
          model: this.likedislike,
        },
        {
          model: this.reply,
          separate: true,
          include: [
            {
              model: this.user,
            },
            {
              model: this.likedislike,
            },
          ],
        },
      ],
      limit: pageSize,
      offset: pageNo,
      order: [[`${sortBy}`, `${order}`]],
    });
    return { totalCount: response.count, records: response.rows };
  }
  public async getCommentByCourseId(
    courseId
  ): Promise<{ totalCount: number; records: (Course | undefined)[] }> {
    const response = await this.comment.findAndCountAll({
      where: { course_id: courseId },

      include: [
        {
          model: this.user,
        },
        {
          model: this.likedislike,
        },
        {
          model: this.reply,
          separate: true,
          include: [
            {
              model: this.user,
            },
            {
              model: this.likedislike,
            },
          ],
          order: [['createdAt', 'DESC']],
        },
      ],
      order: [['createdAt', 'DESC']],
    });
    return { totalCount: response.count, records: response.rows };
  }
  public async getReplyByCommentIdAdmin(
    commentId,
    queryObject
  ): Promise<{
    totalCount: number;
    records: (Course | undefined)[];
  }> {
    //sorting
    const sortBy = queryObject.sortBy ? queryObject.sortBy : 'createdAt';
    const order = queryObject.order || 'DESC';
    // pagination
    const pageSize = queryObject.pageRecord ? queryObject.pageRecord : 10;
    const pageNo = queryObject.pageNo ? (queryObject.pageNo - 1) * pageSize : 0;
    // Search
    const [search, searchCondition] = queryObject.search
      ? [`%${queryObject.search}%`, DB.Sequelize.Op.iLike]
      : ['', DB.Sequelize.Op.ne];

    const response = await this.reply.findAndCountAll({
      where: DB.Sequelize.and(
        {
          comment_id: commentId,
        },
        {
          reply: {
            [searchCondition]: search,
          },
        }
      ),

      include: [
        {
          model: this.user,
        },
        {
          model: this.likedislike,
        },
      ],
      limit: pageSize,
      offset: pageNo,
      order: [[`${sortBy}`, `${order}`]],
    });

    return { totalCount: response.count, records: response.rows };
  }

  public async getReplyByCommentId(commentId): Promise<{
    totalCount: number;
    records: (Course | undefined)[];
  }> {
    const response = await this.reply.findAndCountAll({
      where: {
        comment_id: commentId,
      },

      include: [
        {
          model: this.user,
        },
        {
          model: this.likedislike,
        },
      ],
      order: [['createdAt', 'DESC']],
    });

    return { totalCount: response.count, records: response.rows };
  }
  public async updateCourse({
    courseDetails,
    file,
    trainer,
    courseId,
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
        },
      ],
    });

    if (!courseRecord) throw new HttpException(403, 'Forbidden Resource');
    if (courseRecord.status === 'Published')
    
      throw new HttpException(
        400,
        'This course is published and can not be deleted. First unpublish this course and then delete it'
      );
    const res = await this.course.destroy({
      where: {
        id: courseId,
      },
    });
    await this.orderitem.destroy({
      where: {
        course_id: courseId,
      },
    });
    await this.cartitem.destroy({
      where: {
        course_id: courseId,
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
    const order = queryObject.order || 'DESC';
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
          include: [
            {
              model: this.user,
            },
          ],
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
        },
      ],
    });
    if (!courseRecord) throw new HttpException(403, 'Forbidden Resource');
    const status = courseRecord.status === 'Drafted' ? 'Published' : 'Drafted';
    const res = await courseRecord.update({ status });
    let count = courseRecord.status === 'Drafted' ? 0 : 1;
    return { count };
  }
}
export default CourseService;
