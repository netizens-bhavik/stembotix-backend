import { HttpException } from '@/exceptions/HttpException';
import { HolidayType } from '@/interfaces/holidayType.interface';
import { RedisFunctions } from '@/redis';
import DB from '@databases';

class HolidayTypeService {
  public holidayType = DB.HolidayType;
  public redisFunctions = new RedisFunctions();

  public isTrainer(user): boolean {
    return user.role === 'SuperAdmin';
  }

  public async addHolidayType(type, user): Promise<HolidayType> {
    if (!this.isTrainer(user)) {
      throw new HttpException(403, 'Forbidden Resource');
    }
    const response = await this.holidayType.findOne({
      where: {
        type: type,
      },
    });
    if (response) throw new HttpException(409, 'Already exist');
    const holidayTypeData = await this.holidayType.create({
      type: type,
    });
    await this.redisFunctions.removeDataFromRedis();
    return holidayTypeData;
  }
  public async viewAllHolidayType(
    user,
    queryObject
  ): Promise<{ totalCount: number; records: (HolidayType | undefined)[] }> {
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

    const cacheKey = `viewAllHolidayType:${sortBy}:${order}:${pageSize}:${pageNo}:${search}`;
    const ifCacheKeyAlreadyExists = await this.redisFunctions.checkIfKeyExists(
      cacheKey
    );
    if (ifCacheKeyAlreadyExists) {
      return await this.redisFunctions.getRedisKey(cacheKey);
    }
    const holidayTypeData = await this.holidayType.findAndCountAll({
      where: {
        type: {
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
        totalCount: holidayTypeData.count,
        records: holidayTypeData.rows,
      })
    );
    return { totalCount: holidayTypeData.count, records: holidayTypeData.rows };
  }
  public async listHolidayType(user) {
    const cacheKey = `listHolidayType:${user.id}`;
    const ifCacheKeyAlreadyExists = await this.redisFunctions.checkIfKeyExists(
      cacheKey
    );
    if (ifCacheKeyAlreadyExists) {
      return await this.redisFunctions.getRedisKey(cacheKey);
    }
    const holidayTypeData = await this.holidayType.findAll();
    await this.redisFunctions.setKey(cacheKey, JSON.stringify(holidayTypeData));
    return holidayTypeData;
  }
  public async updateHolidayType(
    user,
    holidayTypeId,
    holidayTypeDetails
  ): Promise<{ count: number; rows: HolidayType[] }> {
    if (!this.isTrainer(user)) {
      throw new HttpException(403, 'Forbidden Resource');
    }
    const response = await this.holidayType.findOne({
      where: {
        id: holidayTypeId,
      },
    });
    if (!response) throw new HttpException(400, 'No data found');

    const updateHolidayType = await this.holidayType.update(
      { ...holidayTypeDetails },
      {
        where: {
          id: holidayTypeId,
        },
        returning: true,
      }
    );
    await this.redisFunctions.removeDataFromRedis();
    return { count: updateHolidayType[0], rows: updateHolidayType[1] };
  }
  public async deleteHolidayType(
    holidayTypeId,
    user
  ): Promise<{ count: number }> {
    if (!this.isTrainer(user)) {
      throw new HttpException(403, 'Forbidden Resource');
    }

    const res: number = await this.holidayType.destroy({
      where: {
        id: holidayTypeId,
      },
    });
    await this.redisFunctions.removeDataFromRedis();
    if (res === 1)
      throw new HttpException(200, 'Holiday Type Deleted Successfully');
    if (res === 0) throw new HttpException(404, 'No data found');

    return { count: res };
  }
}
export default HolidayTypeService;
