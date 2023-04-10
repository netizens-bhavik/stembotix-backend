import DB from '@databases';

class UniversalSearchService {
  public course = DB.Course;
  public product = DB.Product;

  public async universalSearch(
    queryObject
  ): Promise<{ courseRes: object; productRes: object }> {
    // Search
    const [search, searchCondition] = queryObject.search
      ? [`%${queryObject.search}%`, DB.Sequelize.Op.iLike]
      : ['', DB.Sequelize.Op.ne];

    const courseRes = await this.course.findAll({
      where: DB.Sequelize.and(
        { status: 'Published' },
        { title: { [searchCondition]: search } }
      ),
    });

    const productRes = await this.product.findAll({
      where: DB.Sequelize.and(
        { status: 'Published' },
        { title: { [searchCondition]: search } }
      ),
    });
    return { courseRes: courseRes, productRes: productRes };
  }
}
export default UniversalSearchService;
