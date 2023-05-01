import DB from '@databases';
import { HttpException } from '@/exceptions/HttpException';

class AllCourseForInstituteService {
  public course = DB.Course;
  public user = DB.User;
  public instituteInstructor = DB.InstituteInstructor;
  public trainer = DB.Trainer;
  public courseType = DB.CourseType;
  public review = DB.Review;

  public isInstitute(user): boolean {
    return user.role === 'Institute';
  }

  public async getAllCourseForInstitute(loggedUser) {
    const instituteRecord = await this.instituteInstructor.findAndCountAll({
      where: {
        institute_id: loggedUser.id,
        isAccepted: 'Accepted',
      },
      include: {
        model: this.user,
        as: 'Institute',
        attributes: ['id', 'firstName', 'lastName', 'fullName'],
      },
      attributes: ['instructorId', 'instituteId'],
    });
    if (instituteRecord.count > 0) {
      const data = await this.user.findAndCountAll({
        where: {
          id: instituteRecord.rows[0].instructorId,
        },
        include: {
          model: this.trainer,
          include: {
            model: this.course,
            where: {
              status: 'Published',
            },
            through: { attributes: [] },
            include: [
              {
                model: this.courseType,
              },
              {
                model: this.review,
              },
            ],
          },
        },
      });
      const res = [];
      data.rows.map(function (trainers) {
        trainers.Trainer.Courses.map(function (coursedetails) {
          let customData = {
            trainerName: trainers.fullName,
            role: trainers.role,
            Courses: coursedetails,
          };
          res.push(customData);
        });
      });
      return {
        totalCount: data.count,
        records: res,
        instituteRecord: instituteRecord.rows[0],
      };
    } else {
      return {
        totalCount: instituteRecord.count,
        records: instituteRecord.rows,
        instituteRecord: instituteRecord.count,
      };
    }
  }
  public async getAllCoursebyInstitute(
    loggedUser,
    queryObject
  ): Promise<{ totalCount: number; records: object; instituteRecord: object }> {
    if (!this.isInstitute(loggedUser)) {
      throw new HttpException(403, 'Forbidden Resource');
    }

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

    const response = await this.instituteInstructor.findAndCountAll({
      where: {
        institute_id: loggedUser.id,
        isAccepted: 'Accepted',
      },
      include: {
        model: this.user,
        as: 'Institute',
        attributes: ['id', 'firstName', 'lastName', 'fullName'],
      },
      attributes: ['instructorId', 'instituteId'],
    });
    if (response.count > 0) {
      const data = await this.user.findAndCountAll({
        where: {
          id: response.rows[0].instructorId,
        },
        include: {
          model: this.trainer,
          include: {
            model: this.course,
            where: DB.Sequelize.and(
              { title: { [searchCondition]: search } },
              {
                status: 'Published',
              }
            ),
            through: { attributes: [] },
            include: [
              {
                model: this.courseType,
              },
              {
                model: this.review,
              },
            ],
          },
        },
        limit: pageSize,
        offset: pageNo,
        order: [[`${sortBy}`, `${order}`]],
      });

      const res = [];
      data.rows.map(function (trainers) {
        trainers.Trainer.Courses.map(function (coursedetails) {
          let customData = {
            trainerName: trainers.fullName,
            Courses: coursedetails,
          };
          res.push(customData);
        });
      });

      return {
        totalCount: data.count,
        records: res,
        instituteRecord: response.rows,
      };
    } else {
      return {
        totalCount: response.count,
        records: response.rows,
        instituteRecord: response.count,
      };
    }
  }
}
export default AllCourseForInstituteService;
