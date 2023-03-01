import { HttpException } from '@/exceptions/HttpException';
import { isEmpty } from '@/utils/util';
import DB from '@databases';

class UniversalSearchService {
  public course = DB.Course;
  public product = DB.Product;

  public async universalSearch(
    loggedUser,
    queryObject
  ): Promise<{ courseRes: object; productRes: object }> {
    if (!loggedUser) throw new HttpException(403, 'Access Forbidden');

    // Search
    const [search, searchCondition] = queryObject.search
      ? [`%${queryObject.search}%`, DB.Sequelize.Op.iLike]
      : ['', DB.Sequelize.Op.ne];

    const courseRes = await this.course.findAll({
      where: DB.Sequelize.or({ title: { [searchCondition]: search } }),
    });

    const productRes = await this.product.findAll({
      where: DB.Sequelize.or({ title: { [searchCondition]: search } }),
    });
    return { courseRes: courseRes, productRes: productRes };
  }
}
export default UniversalSearchService;
