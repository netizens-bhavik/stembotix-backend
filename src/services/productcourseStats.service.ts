import DB from '@/databases';
import { HttpException } from '@/exceptions/HttpException';
import { RedisFunctions } from '@/redis';
import moment from 'moment';
import { Op } from 'sequelize';

class CourseProductStatsService {
  public course = DB.Course;
  public product = DB.Product;
  public redisFunctions = new RedisFunctions();

  public isInstructor(user): boolean {
    return user.role === 'Instructor';
  }
  public isInstitute(user): boolean {
    return user.role === 'Institute';
  }

  public async courseStatsforInstructor(user) {
    const cacheKey = 'courseStatsforInstructor';
    const cachedData = await this.redisFunctions.getRedisKey(cacheKey);
    if (cachedData) {
      return cachedData;
    }
    if (!this.isInstructor(user)) throw new HttpException(401, 'Unauthorized');
    const months = [];
    for (let i = 1; i <= 12; i++) {
      const courseRecordsPerMonth = await this.course.findAndCountAll({
        where: DB.sequelize.and(
          { deletedAt: null },
          {
            createdAt: {
              [Op.gte]: moment()
                .month(i - 1)
                .startOf('month')
                .year(moment().year())
                .toDate(),

              [Op.lt]: moment()
                .month(i - 1)
                .endOf('month')
                .year(moment().year())
                .toDate(),
            },
          }
        ),
      });
      months.push(courseRecordsPerMonth);
    }
    await this.redisFunctions.setKey(cacheKey, JSON.stringify(months));
    return months;
  }
  public async productStatsforInstructor(user) {
    const cacheKey = 'productStatsforInstructor';
    const cachedData = await this.redisFunctions.getRedisKey(cacheKey);
    if (cachedData) {
      return cachedData;
    }
    if (!this.isInstructor(user)) throw new HttpException(401, 'Unauthorized');
    const months = [];
    for (let i = 1; i <= 12; i++) {
      const productRecordsPerMonth = await this.product.findAndCountAll({
        where: DB.sequelize.and(
          { deletedAt: null },
          {
            createdAt: {
              [Op.gte]: moment()
                .month(i - 1)
                .startOf('month')
                .year(moment().year())
                .toDate(),

              [Op.lt]: moment()
                .month(i - 1)
                .endOf('month')
                .year(moment().year())
                .toDate(),
            },
          }
        ),
      });
      months.push(productRecordsPerMonth);
    }
    await this.redisFunctions.setKey(cacheKey, JSON.stringify(months));
    return months;
  }

  public async getProductStatsPerMonths(user) {
    const cacheKey = 'getProductStatsPerMonths';
    const cachedData = await this.redisFunctions.getRedisKey(cacheKey);
    if (cachedData) {
      return cachedData;
    }
    if (!this.isInstitute(user)) throw new HttpException(401, 'Unauthorized');
    const months = [];
    for (let i = 1; i <= 12; i++) {
      const recordsPerMonth = await this.product.findAndCountAll({
        where: DB.sequelize.and(
          { deletedAt: null },
          {
            createdAt: {
              [Op.gte]: moment()
                .month(i - 1)
                .startOf('month')
                .year(moment().year())
                .toDate(),

              [Op.lt]: moment()
                .month(i - 1)
                .endOf('month')
                .year(moment().year())
                .toDate(),
            },
          }
        ),
      });
      months.push(recordsPerMonth);
    }
    await this.redisFunctions.setKey(cacheKey, JSON.stringify(months));
    return months;
  }
}
export default CourseProductStatsService;
