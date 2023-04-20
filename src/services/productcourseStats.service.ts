import DB from '@/databases';
import { HttpException } from '@/exceptions/HttpException';
import moment from 'moment';
import { Op } from 'sequelize';

class CourseProductStatsService {
  public course = DB.Course;
  public product = DB.Product;

  public isInstructor(user): boolean {
    return user.role === 'Instructor';
  }
  public isInstitute(user): boolean {
    return user.role === 'Institute' || user.role === 'Admin';
  }

  public async courseProductStats(user) {
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
    return months;
  }

  public async getProductStatsPerMonths(user) {
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
    return months;
  }
}
export default CourseProductStatsService;
