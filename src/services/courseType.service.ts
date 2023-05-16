import { HttpException } from '@/exceptions/HttpException';
import { Coursetype } from '@/interfaces/courseType.interface';
import { RedisFunctions } from '@/redis';
import DB from '@databases';

class CourseTypeService {
  public coursetype = DB.CourseType;
  public user = DB.User;
  public course = DB.Course;
  public redisFunctions = new RedisFunctions();

  public isTrainer(user): boolean {
    return user.role === 'SuperAdmin';
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
    if (response) throw new HttpException(409, 'Type already exist');
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

    const cacheKey = `viewAllCourseType:${sortBy}:${order}:${pageSize}:${pageNo}:${search}`;
    const ifCacheKeyAlreadyExists = await this.redisFunctions.checkIfKeyExists(
      cacheKey
    );
    if (ifCacheKeyAlreadyExists) {
      return await this.redisFunctions.getRedisKey(cacheKey);
    }
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
    await this.redisFunctions.setKey(
      cacheKey,
      JSON.stringify({
        totalCount: courseType.count,
        records: courseType.rows,
      })
    );
    return { totalCount: courseType.count, records: courseType.rows };
  }
  public async listCourseType(user) {
    const cacheKey = `listCourseType:${user.id}`;
    const ifCacheKeyAlreadyExists = await this.redisFunctions.checkIfKeyExists(
      cacheKey
    );
    if (ifCacheKeyAlreadyExists) {
      return await this.redisFunctions.getRedisKey(cacheKey);
    }
    const courseType = await this.coursetype.findAll();
    await this.redisFunctions.setKey(cacheKey, JSON.stringify(courseType));
    return courseType;
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
    const data = await this.course.findAndCountAll({
      where: {
        coursetypeId: courseTypeId,
      },
    });
    if (data.count !== 0) {
      throw new HttpException(
        409,
        'Course Type is already in used please change course type in course and try again'
      );
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

  public async viewCourseByCourseTypeIdByAdmin({
    courseTypeId,
    user,
    queryObject,
  }): Promise<{
    totalCount: number;
    records: (Coursetype | undefined)[];
  }> {
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

    const cacheKey = `viewCourseByCourseTypeIdByAdmin:${courseTypeId}:${sortBy}:${order}:${pageSize}:${pageNo}:${search}`;
    const ifCacheKeyAlreadyExists = await this.redisFunctions.checkIfKeyExists(
      cacheKey
    );
    if (ifCacheKeyAlreadyExists) {
      return await this.redisFunctions.getRedisKey(cacheKey);
    }

    const response = await this.coursetype.findAndCountAll({
      where: {
        id: courseTypeId,
      },
      include: [
        {
          model: this.course,
          where: DB.Sequelize.and({
            title: {
              [searchCondition]: search,
            },
          }),
        },
      ],
      limit: pageSize,
      offset: pageNo,
      order: [[`${sortBy}`, `${order}`]],
    });
    await this.redisFunctions.setKey(cacheKey, JSON.stringify(response));
    return response;
  }

  public async viewCourseByCourseTypeId(coursetypeId): Promise<{
    totalCount: number;
    records: (Coursetype | undefined)[];
  }> {
    const cacheKey = `viewCourseByCourseTypeId:${coursetypeId}`;
    const ifCacheKeyAlreadyExists = await this.redisFunctions.checkIfKeyExists(
      cacheKey
    );
    if (ifCacheKeyAlreadyExists) {
      return await this.redisFunctions.getRedisKey(cacheKey);
    }

    const response = await this.coursetype.findAndCountAll({
      where: {
        id: coursetypeId,
      },
      include: {
        model: this.course,
      },
    });
    await this.redisFunctions.setKey(
      cacheKey,
      JSON.stringify({
        totalCount: response.count,
        records: response.rows,
      })
    );
    return { totalCount: response.count, records: response.rows };
  }
}
export default CourseTypeService;
