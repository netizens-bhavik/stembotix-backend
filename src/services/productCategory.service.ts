import { HttpException } from '@/exceptions/HttpException';
import { ProductCategory } from '@/interfaces/productCate.interface';
import { RedisFunctions } from '@/redis';
import DB from '@databases';

class ProductcCatService {
  public productCat = DB.ProductCategory;
  public redisFunctions = new RedisFunctions();

  public isTrainer(user): boolean {
    return user.role === 'SuperAdmin';
  }
  public isUser(user): boolean {
    return user.role === 'Instructor';
  }

  public async addProductCat(category, user): Promise<ProductCategory> {
    if (!this.isTrainer(user)) {
      throw new HttpException(403, 'Forbidden Resource');
    }
    const response = await this.productCat.findOne({
      where: {
        category: category,
      },
    });
    if (response) throw new HttpException(409, 'Already exist');
    const productCatData = await this.productCat.create({
      category: category,
    });
    await this.redisFunctions.removeDataFromRedis();
    return productCatData;
  }
  public async viewAllProductCat(
    user,
    queryObject
  ): Promise<{ totalCount: number; records: (ProductCategory | undefined)[] }> {
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

    const cacheKey = `viewAllProductCat:${sortBy}:${order}:${pageSize}:${pageNo}:${search}`;
    const ifCacheKeyAlreadyExists = await this.redisFunctions.checkIfKeyExists(
      cacheKey
    );
    if (ifCacheKeyAlreadyExists) {
      return await this.redisFunctions.getRedisKey(cacheKey);
    }
    const productCatData = await this.productCat.findAndCountAll({
      where: {
        category: {
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
        totalCount: productCatData.count,
        records: productCatData.rows,
      })
    );
    return { totalCount: productCatData.count, records: productCatData.rows };
  }
  public async listProductCat(user) {
    const cacheKey = `listProductCat:${user.id}`;
    const ifCacheKeyAlreadyExists = await this.redisFunctions.checkIfKeyExists(
      cacheKey
    );
    if (ifCacheKeyAlreadyExists) {
      return await this.redisFunctions.getRedisKey(cacheKey);
    }
    const productCatData = await this.productCat.findAll();
    await this.redisFunctions.setKey(cacheKey, JSON.stringify(productCatData));
    return productCatData;
  }
  public async updateProductCat(
    user,
    catId,
    catDetails
  ): Promise<{ count: number; rows: ProductCategory[] }> {
    if (!this.isTrainer(user)) {
      throw new HttpException(403, 'Forbidden Resource');
    }
    const response = await this.productCat.findOne({
      where: {
        id: catId,
      },
    });
    if (!response) throw new HttpException(400, 'No data found');

    const updateProductCat = await this.productCat.update(
      { ...catDetails },
      {
        where: {
          id: catId,
        },
        returning: true,
      }
    );
    await this.redisFunctions.removeDataFromRedis();
    return { count: updateProductCat[0], rows: updateProductCat[1] };
  }
  public async deleteProductCat(catId, user): Promise<{ count: number }> {
    if (!this.isTrainer(user)) {
      throw new HttpException(403, 'Forbidden Resource');
    }

    const res: number = await this.productCat.destroy({
      where: {
        id: catId,
      },
    });
    await this.redisFunctions.removeDataFromRedis();
    if (res === 1)
      throw new HttpException(200, 'Product Category Deleted Successfully');
    if (res === 0) throw new HttpException(404, 'No data found');

    return { count: res };
  }
}
export default ProductcCatService;
