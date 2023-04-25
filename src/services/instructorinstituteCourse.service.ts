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
    const response = await this.instituteInstructor.findAll({
      where: {
        institute_id: loggedUser.id,
        isAccepted: 'Accepted',
      },
    });
    if (response.length > 0) {
      const data = await this.user.findAll({
        where: {
          id: response[0].instructorId,
        },
        include: [
          {
            model: this.trainer,
            include: [
              {
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
            ],
          },
        ],
      });
      // const res = [];
      // data.map(function (trainers) {
      //   trainers.Trainer.Courses.map(function (coursedetails) {
      //     res.push(coursedetails);
      //   });
      // });
      return data;
    } else {
      return response;
    }
  }
  public async getAllCoursebyInstitute(
    loggedUser,
    queryObject
  ): Promise<{ totalCount: number; record: object }> {
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
      return { totalCount: data.count, record: data.rows };
    } else {
      return response;
    }
  }
}
export default AllCourseForInstituteService;
