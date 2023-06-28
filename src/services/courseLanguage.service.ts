import { HttpException } from '@/exceptions/HttpException';
import { CourseLanguage } from '@/interfaces/courseLanguage.interface';
import { RedisFunctions } from '@/redis';
import DB from '@databases';

class CourseLanguageService {
  public courselanguage = DB.CourseLanguage;
  public course = DB.Course;
  public redisFunctions = new RedisFunctions();

  public isTrainer(user): boolean {
    return user.role === 'SuperAdmin' || user.role === 'Instructor';
  }

  public async addCourseLanguage(language, user): Promise<CourseLanguage> {
    if (!this.isTrainer(user)) {
      throw new HttpException(403, 'Forbidden Resource');
    }
    const response = await this.courselanguage.findOne({
      where: {
        language: language,
      },
    });
    if (response) throw new HttpException(409, 'Already exist');
    const courseLanguage = await this.courselanguage.create({
      language: language,
    });
    await this.redisFunctions.removeDataFromRedis();
    return courseLanguage;
  }
  public async viewAllCourseLanguage(
    user,
    queryObject
  ): Promise<{ totalCount: number; records: (CourseLanguage | undefined)[] }> {
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

    const cacheKey = `viewAllCourseLanguage:${sortBy}:${order}:${pageSize}:${pageNo}:${search}`;
    const ifCacheKeyAlreadyExists = await this.redisFunctions.checkIfKeyExists(
      cacheKey
    );
    if (ifCacheKeyAlreadyExists) {
      return await this.redisFunctions.getRedisKey(cacheKey);
    }
    const courseLanguage = await this.courselanguage.findAndCountAll({
      where: {
        language: {
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
        totalCount: courseLanguage.count,
        records: courseLanguage.rows,
      })
    );
    return { totalCount: courseLanguage.count, records: courseLanguage.rows };
  }
  public async listCourseLanguage(user) {
    const cacheKey = `listCourseLanguage:${user.id}`;
    const ifCacheKeyAlreadyExists = await this.redisFunctions.checkIfKeyExists(
      cacheKey
    );
    if (ifCacheKeyAlreadyExists) {
      return await this.redisFunctions.getRedisKey(cacheKey);
    }
    const courseLanguage = await this.courselanguage.findAll();
    await this.redisFunctions.setKey(cacheKey, JSON.stringify(courseLanguage));
    return courseLanguage;
  }
  public async updateCourseLanguage(
    user,
    languageId,
    languageDetails
  ): Promise<{ count: number; rows: CourseLanguage[] }> {
    if (!this.isTrainer(user)) {
      throw new HttpException(403, 'Forbidden Resource');
    }
    const response = await this.courselanguage.findOne({
      where: {
        id: languageId,
      },
    });
    if (!response) throw new HttpException(400, 'No data found');

    const updateCourseLanguage = await this.courselanguage.update(
      { ...languageDetails },
      {
        where: {
          id: languageId,
        },
        returning: true,
      }
    );
    await this.redisFunctions.removeDataFromRedis();
    return { count: updateCourseLanguage[0], rows: updateCourseLanguage[1] };
  }
  public async deleteCourseLanguage(
    languageId,
    user
  ): Promise<{ count: number }> {
    if (!this.isTrainer(user)) {
      throw new HttpException(403, 'Forbidden Resource');
    }

    const res: number = await this.courselanguage.destroy({
      where: {
        id: languageId,
      },
    });
    await this.redisFunctions.removeDataFromRedis();
    if (res === 1)
      throw new HttpException(200, 'Course Language Deleted Successfully');
    if (res === 0) throw new HttpException(404, 'No data found');

    return { count: res };
  }
}
export default CourseLanguageService;
