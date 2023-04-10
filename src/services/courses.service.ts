import DB from '@databases';
import { HttpException } from '@exceptions/HttpException';
import { isEmpty } from '@utils/util';
import { Course } from '@/interfaces/course.interface';
import { API_BASE } from '@config';
import EmailService from './email.service';
import { Mail, MailPayloads } from '@/interfaces/mailPayload.interface';
import _ from 'lodash';
import { deleteFromS3 } from '@/utils/s3/s3Uploads';

// const sgMail = require('@sendgrid/mail');
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
  public cart = DB.Cart;
  public order = DB.Order;
  public coursetype = DB.CourseType;
  public instituteinstructor = DB.InstituteInstructor;
  public quizScore = DB.QuizScore;
  public quizQue = DB.QuizQue;
  public emailService = new EmailService();

  public isTrainer(user): boolean {
    return user.role === 'Instructor' || user.role === 'Admin';
  }
  public isAdmin(user): boolean {
    return user.role === 'Admin';
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
          model: this.coursetype,
        },
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
          model: this.coursetype,
        },
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
    const adminRecord = await this.user.findAll({
      where: { role: 'Admin' },
    });
    const trainerRecord = await this.trainer.findOne({
      where: {
        user_id: user.id,
      },
    });
    if (!trainerRecord)
      throw new HttpException(404, 'Requested trainer details do not exist');

    const newCourse = await this.course.create({
      ...courseDetails,
      trailer: file['trailer'][0].path,
      thumbnail: file['thumbnail'][0].path,
    });

    newCourse.addTrainer(trainerRecord);
    if (newCourse) {
      const mailData: Mail = {
        templateData: {
          courseTitle: newCourse.title,
          courseDescription: newCourse.description,
          courseId: newCourse.id,
        },
        mailData: {
          from: user.email,
          to: adminRecord[0].email,
        },
      };
      this.emailService.sendMailPublishCourse(mailData);
    }
    return {
      id: newCourse.id,
      status: newCourse.status,
      title: newCourse.title,
      level: newCourse.level,
      price: newCourse.price,
      language: newCourse.language,
      description: newCourse.description,
      thumbnail: file['thumbnail'][0].path,
      // @ts-ignore
      trailer: file['trailer'][0].path,
      coursetypeId: newCourse.coursetypeId,
      updatedAt: newCourse.updateAt,
      createdAt: newCourse.createdAt,
      deletedAt: newCourse.deletedAt,
    };
  }
  public async getCourseById(courseId: string): Promise<Course> {
    const response = await this.course.findOne({
      where: {
        id: courseId,
      },
      include: [
        {
          model: this.coursetype,
        },
        {
          model: this.trainer,
          through: { attributes: [] },
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
              include: [
                { model: this.quizQue },
                {
                  model: this.quizScore,
                },
              ],
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
          id: courseId,
        },
      },
    });
    if (file) {
      const thumbnailLink = record.Courses[0].thumbnail;
      const fileName = thumbnailLink.split('/');
      await deleteFromS3(fileName[3]);
      const trailerlLink = record.Courses[0].trailer;
      const trailerName = trailerlLink.split('/');
      await deleteFromS3(trailerName[3]);
    }
    if (!record) throw new HttpException(404, 'No Data Found');
    if (trainer.id !== record.user_id && trainer.role !== 'Admin')
      throw new HttpException(403, "You don't have Authority to Update Course");

    // const { trailer, thumbnail } = file;

    // if (trailer) {
    //   const trailerPath = `${API_BASE}/media/${trailer[0].path
    //     .split('/')
    //     .splice(-2)
    //     .join('/')}`;
    //   courseDetails.trailer = trailerPath;
    // }
    // if (thumbnail) {
    //   const thumbnailPath = `${API_BASE}/media/${thumbnail[0].path
    //     .split('/')
    //     .splice(-2)
    //     .join('/')}`;
    //   courseDetails.thumbnail = thumbnailPath;
    // }

    const updateCourse = await this.course.update(
      {
        ...courseDetails,
        trailer: file['trailer'][0].path,
        thumbnail: file['thumbnail'][0].path,
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
    const adminRecord = await this.user.findAll({
      where: { role: 'Admin' },
    });
    if (!courseRecord) throw new HttpException(403, 'Forbidden Resource');
    if (courseRecord.status === 'Published') {
      const mailData: Mail = {
        templateData: {
          courseTitle: courseRecord.title,
        },
        mailData: {
          from: trainer.email,
          to: adminRecord[0].email,
        },
      };
      this.emailService.sendMailunPublishcourse(mailData);

      throw new HttpException(
        400,
        'This course is published and can not be deleted. Please unpublished this course first with the help of Admin'
      );
    }
    if (
      trainer.id !== courseRecord.Trainers[0].UserId &&
      trainer.role !== 'Admin'
    )
      throw new HttpException(403, "You don't have Authority to Delete Course");

    const responses = await this.orderitem.findAll({
      where: {
        course_id: courseId,
      },
      include: [
        {
          model: this.order,
          include: {
            model: this.user,
            attributes: ['email'],
          },
        },
      ],
    });
    let users: string[] = [];
    await responses.map((index) => {
      users.push(index.Order.User.email as string);
    });

    const thumbnailLink = courseRecord.thumbnail;
    const fileName = thumbnailLink.split('/');
    await deleteFromS3(fileName[3]);
    const trailerlLink = courseRecord.trailer;
    const trailerName = trailerlLink.split('/');
    await deleteFromS3(trailerName[3]);

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
    if (res === 1) {
      const mailerData: MailPayloads = {
        templateData: {
          courseTitle: courseRecord.title,
        },
        mailerData: {
          to: users,
        },
      };
      this.emailService.sendMailDeleteCourse(mailerData);
    }
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
          model: this.coursetype,
        },
        {
          model: this.trainer,
          through: { attributes: [] },
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

  public async getTrainerDetails(
    trainer,
    queryObject
  ): Promise<{
    totalCount: number;
    records: (Course | undefined)[];
  }> {
    if (trainer.Role.roleName === 'Student')
      throw new HttpException(401, 'Unauthorized');
    const order = queryObject.order || 'DESC';
    // pagination
    const pageSize = queryObject.pageRecord ? queryObject.pageRecord : 10;
    const pageNo = queryObject.pageNo ? (queryObject.pageNo - 1) * pageSize : 0;
    // Search
    const [search, searchCondition] = queryObject.search
      ? [`%${queryObject.search}%`, DB.Sequelize.Op.iLike]
      : ['', DB.Sequelize.Op.ne];

    const trainerRecord = await this.trainer.findAll();
    if (!trainerRecord) throw new HttpException(404, 'Invalid Request');

    const approvalCheck = await this.instituteinstructor.findAll({
      where: DB.Sequelize.and({
        institute_id: trainer.id,
      }),
    });
    const trainerData = await this.trainer.findAndCountAll({
      include: [
        {
          model: this.user,
          attributes: ['firstName', 'lastName', 'fullName', 'role'],

          where: {
            role: {
              [DB.Sequelize.Op.not]: 'Admin',
            },
            [DB.Sequelize.Op.or]: [
              {
                firstName: { [searchCondition]: search },
              },
              {
                lastName: { [searchCondition]: search },
              },
            ],
          },
          subQuery: false,
        },
        {
          model: this.course,
          attributes: ['id', 'title'],
          where: {
            status: 'Published',
          },
          include: [
            {
              model: this.review,
              attributes: ['rating'],
              separate: true,
            },
            {
              model: this.orderitem,
              separate: true,
              include: {
                model: this.order,
              },
            },
          ],
        },
      ],
      limit: pageSize,
      offset: pageNo,
      order: [
        [{ model: this.user }, 'firstName', order],
        [{ model: this.user }, 'lastName', order],
      ],
    });

    let allRating = [];
    let allUser = [];
    const allUserResponse = [];
    const avgRatingResponse = [];
    trainerData.rows.forEach((row, index) => {
      allRating = [];
      allUser = [];
      row.Courses.forEach((course) => {
        let user = course.OrderItems;
        user.forEach((user) => {
          allUser.push(user);
        });

        let ratings = course.Reviews;
        ratings.forEach((rating) => {
          allRating.push(rating.rating);
        });
      });
      let allAvgRatingLenth = allRating.length;
      let sumOfAllRatings = allRating.reduce((acc, curr) => acc + curr, 0);
      let avgRating = sumOfAllRatings / allAvgRatingLenth;
      const rating = avgRating
        ? Number.parseFloat(avgRating as unknown as string).toFixed(1)
        : '0';
      row.setDataValue('avgRating', rating);
      let allUserLength = allUser.length;
      row.setDataValue('allUserCount', allUserLength);
      avgRatingResponse.push(row);
      allUserResponse.push(row);
    });

    const trainerDataWithRequestStatus = trainerData.rows.map((row) => {
      const userId = row.userId;
      const hasRequest = approvalCheck.some(
        (approval) => approval.instructorId === userId
      );
      const approvalStatus = approvalCheck.find(
        (approval) => approval.instructorId === userId
      );
      const isAcceptedStatus = approvalStatus
        ? approvalStatus.isAccepted
        : 'notRequested';

      return {
        ...row.toJSON(),
        isRequested: hasRequest,
        isAcceptedStatus: isAcceptedStatus,
      };
    });

    return {
      totalCount: trainerData.rows.length,
      records: trainerDataWithRequestStatus,
    };
  }

  public async togglePublish({
    trainer,
    courseId,
  }): Promise<{ count: number }> {
    if (!this.isAdmin(trainer))
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
    let count = res.status === 'Drafted' ? 0 : 1;
    return { count };
  }
}
export default CourseService;
