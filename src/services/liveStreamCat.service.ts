import { HttpException } from '@/exceptions/HttpException';
import { LivestreamCategory } from '@/interfaces/liveStreamCat.interface';
import { RedisFunctions } from '@/redis';
import DB from '@databases';

class LiveStreamCatService {
  public liveStreamCat = DB.LiveStreamCat;
  public redisFunctions = new RedisFunctions();

  public isTrainer(user): boolean {
    return user.role === 'SuperAdmin';
  }
  public isUser(user): boolean {
    return user.role === 'Instructor';
  }

  public async addLiveStreamCat(category, user): Promise<LivestreamCategory> {
    if (!this.isTrainer(user)) {
      throw new HttpException(403, 'Forbidden Resource');
    }
    const response = await this.liveStreamCat.findOne({
      where: {
        category: category,
      },
    });
    if (response) throw new HttpException(409, 'Already exist');
    const liveStreamCatData = await this.liveStreamCat.create({
      category: category,
    });
    await this.redisFunctions.removeDataFromRedis();
    return liveStreamCatData;
  }
  public async viewAllLiveStreamCat(
    user,
    queryObject
  ): Promise<{
    totalCount: number;
    records: (LivestreamCategory | undefined)[];
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

    const cacheKey = `viewAllLiveStreamCat:${sortBy}:${order}:${pageSize}:${pageNo}:${search}`;
    const ifCacheKeyAlreadyExists = await this.redisFunctions.checkIfKeyExists(
      cacheKey
    );
    if (ifCacheKeyAlreadyExists) {
      return await this.redisFunctions.getRedisKey(cacheKey);
    }
    const liveStreamCatData = await this.liveStreamCat.findAndCountAll({
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
        totalCount: liveStreamCatData.count,
        records: liveStreamCatData.rows,
      })
    );
    return {
      totalCount: liveStreamCatData.count,
      records: liveStreamCatData.rows,
    };
  }
  public async listLiveStreamCat(user) {
    const cacheKey = `listLiveStreamCat:${user.id}`;
    const ifCacheKeyAlreadyExists = await this.redisFunctions.checkIfKeyExists(
      cacheKey
    );
    if (ifCacheKeyAlreadyExists) {
      return await this.redisFunctions.getRedisKey(cacheKey);
    }
    const liveStreamCatData = await this.liveStreamCat.findAll();
    await this.redisFunctions.setKey(
      cacheKey,
      JSON.stringify(liveStreamCatData)
    );
    return liveStreamCatData;
  }
  public async updateLiveStreamCat(
    user,
    catId,
    catDetails
  ): Promise<{ count: number; rows: LivestreamCategory[] }> {
    if (!this.isTrainer(user)) {
      throw new HttpException(403, 'Forbidden Resource');
    }
    const response = await this.liveStreamCat.findOne({
      where: {
        id: catId,
      },
    });
    if (!response) throw new HttpException(400, 'No data found');

    const updateProductCat = await this.liveStreamCat.update(
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
  public async deleteLiveStreamCat(catId, user): Promise<{ count: number }> {
    if (!this.isTrainer(user)) {
      throw new HttpException(403, 'Forbidden Resource');
    }

    const res: number = await this.liveStreamCat.destroy({
      where: {
        id: catId,
      },
    });
    await this.redisFunctions.removeDataFromRedis();
    if (res === 1)
      throw new HttpException(200, 'LiveStream Category Deleted Successfully');
    if (res === 0) throw new HttpException(404, 'No data found');

    return { count: res };
  }
}
export default LiveStreamCatService;
