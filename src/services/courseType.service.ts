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
  public async viewAllCourseType(
    user,
    queryObject
  ): Promise<{ totalCount: number; records: (Coursetype | undefined)[] }> {
    if (!this.isTrainer(user)) {
      throw new HttpException(403, 'Forbidden Resource');
    }
    const sortBy = queryObject.sortBy ? queryObject.sortBy : 'createdAt';
    const order = queryObject.order || 'DESC';
    // pagination
    const pageSize = queryObject.pageRecord ? queryObject.pageRecord : 10;
    const pageNo = queryObject.pageNo ? (queryObject.pageNo - 1) * pageSize : 0;
    // Search
    const [search, searchCondition] = queryObject.search
      ? [`%${queryObject.search}%`, DB.Sequelize.Op.iLike]
      : ['', DB.Sequelize.Op.ne];
    const courseType = await this.coursetype.findAndCountAll({
      where: {
        userId: user.id,
        course_type: {
          [searchCondition]: search,
        },
      },
      limit: pageSize,
      offset: pageNo,
      order: [[`${sortBy}`, `${order}`]],
    });
    return { totalCount: courseType.count, records: courseType.rows };
  }
  public async updateCourseType(
    user,
    coursetypeId,
    coursetypeDetail
  ): Promise<{ count: number; rows: Coursetype[] }> {
    if (!this.isTrainer(user)) {
      throw new HttpException(403, 'Forbidden Resource');
    }
    const response = await this.coursetype.findOne({
      where: {
        id: coursetypeId,
      },
    });
    if (!response) throw new HttpException(400, 'No data found');

    const updateCourseType = await this.coursetype.update(
      { ...coursetypeDetail },
      {
        where: {
          id: coursetypeId,
        },
        returning: true,
      }
    );
    return { count: updateCourseType[0], rows: updateCourseType[1] };
  }
  public async deleteCourseType(
    courseTypeId,
    user
  ): Promise<{ count: number }> {
    if (!this.isTrainer(user)) {
      throw new HttpException(403, 'Forbidden Resource');
    }
    const res: number = await this.coursetype.destroy({
      where: {
        id: courseTypeId,
      },
    });
    if (res === 1)
      throw new HttpException(200, 'CourseType Deleted Successfully');
    if (res === 0) throw new HttpException(404, 'No data found');

    return { count: res };
  }
}
export default CourseTypeService;
