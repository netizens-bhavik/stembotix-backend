import { HttpException } from '@/exceptions/HttpException';
import { CourseLevel } from '@/interfaces/courseLevel.interface';
import { RedisFunctions } from '@/redis';
import DB from '@databases';

class CourseLevelService {
  public courselevel = DB.CourseLevel;
  public course = DB.Course;
  public redisFunctions = new RedisFunctions();

  public isTrainer(user): boolean {
    return user.role === 'SuperAdmin' || user.role === 'Instructor';
  }

  public async addCourseLevel(level, user): Promise<CourseLevel> {
    if (!this.isTrainer(user)) {
      throw new HttpException(403, 'Forbidden Resource');
    }
    const response = await this.courselevel.findOne({
      where: {
        level: level,
      },
    });
    if (response) throw new HttpException(409, 'Already exist');
    const courseLevel = await this.courselevel.create({
      level: level,
    });
    await this.redisFunctions.removeDataFromRedis();
    return courseLevel;
  }
  public async viewAllCourseLevel(
    user,
    queryObject
  ): Promise<{ totalCount: number; records: (CourseLevel | undefined)[] }> {
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

    const cacheKey = `viewAllCourseLevel:${sortBy}:${order}:${pageSize}:${pageNo}:${search}`;
    const ifCacheKeyAlreadyExists = await this.redisFunctions.checkIfKeyExists(
      cacheKey
    );
    if (ifCacheKeyAlreadyExists) {
      return await this.redisFunctions.getRedisKey(cacheKey);
    }
    const courseLevel = await this.courselevel.findAndCountAll({
      where: {
        level: {
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
        totalCount: courseLevel.count,
        records: courseLevel.rows,
      })
    );
    return { totalCount: courseLevel.count, records: courseLevel.rows };
  }
  public async listCourseLevel(user) {
    const cacheKey = `listCourseLevel:${user.id}`;
    const ifCacheKeyAlreadyExists = await this.redisFunctions.checkIfKeyExists(
      cacheKey
    );
    if (ifCacheKeyAlreadyExists) {
      return await this.redisFunctions.getRedisKey(cacheKey);
    }
    const courseLevel = await this.courselevel.findAll();
    await this.redisFunctions.setKey(cacheKey, JSON.stringify(courseLevel));
    return courseLevel;
  }
  public async updateCourseLevel(
    user,
    levelId,
    levelDetails
  ): Promise<{ count: number; rows: CourseLevel[] }> {
    if (!this.isTrainer(user)) {
      throw new HttpException(403, 'Forbidden Resource');
    }
    const response = await this.courselevel.findOne({
      where: {
        id: levelId,
      },
    });
    if (!response) throw new HttpException(400, 'No data found');

    const updateCourseLevel = await this.courselevel.update(
      { ...levelDetails },
      {
        where: {
          id: levelId,
        },
        returning: true,
      }
    );
    await this.redisFunctions.removeDataFromRedis();
    return { count: updateCourseLevel[0], rows: updateCourseLevel[1] };
  }
  public async deleteCourseLevel(levelId, user): Promise<{ count: number }> {
    if (!this.isTrainer(user)) {
      throw new HttpException(403, 'Forbidden Resource');
    }
    const data = await this.course.findAndCountAll({
      where: {
        courseLevelId: levelId,
      },
    });
    if (data.count !== 0) {
      throw new HttpException(
        409,
        'Course level is already in used please change course level in course and try again'
      );
    }
    const res: number = await this.courselevel.destroy({
      where: {
        id: levelId,
      },
    });
    await this.redisFunctions.removeDataFromRedis();
    if (res === 1)
      throw new HttpException(200, 'CourseLevel Deleted Successfully');
    if (res === 0) throw new HttpException(404, 'No data found');

    return { count: res };
  }
}
export default CourseLevelService;
