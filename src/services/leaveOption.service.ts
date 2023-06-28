import { HttpException } from '@/exceptions/HttpException';
import { LeaveOption } from '@/interfaces/leaveOption.interface';
import { RedisFunctions } from '@/redis';
import DB from '@databases';

class LeaveOptionService {
  public leaveOption = DB.LeaveOption;
  public redisFunctions = new RedisFunctions();

  public isTrainer(user): boolean {
    return user.role === 'SuperAdmin';
  }

  public async addLeaveOption(option, user): Promise<LeaveOption> {
    if (!this.isTrainer(user)) {
      throw new HttpException(403, 'Forbidden Resource');
    }
    const response = await this.leaveOption.findOne({
      where: {
        option: option,
      },
    });
    if (response) throw new HttpException(409, 'Already exist');
    const leaveOptionData = await this.leaveOption.create({
      option: option,
    });
    await this.redisFunctions.removeDataFromRedis();
    return leaveOptionData;
  }
  public async viewAllLeaveOption(
    user,
    queryObject
  ): Promise<{ totalCount: number; records: (LeaveOption | undefined)[] }> {
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

    const cacheKey = `viewAllLeaveOption:${sortBy}:${order}:${pageSize}:${pageNo}:${search}`;
    const ifCacheKeyAlreadyExists = await this.redisFunctions.checkIfKeyExists(
      cacheKey
    );
    if (ifCacheKeyAlreadyExists) {
      return await this.redisFunctions.getRedisKey(cacheKey);
    }
    const leaveOptionData = await this.leaveOption.findAndCountAll({
      where: {
        option: {
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
        totalCount: leaveOptionData.count,
        records: leaveOptionData.rows,
      })
    );
    return { totalCount: leaveOptionData.count, records: leaveOptionData.rows };
  }
  public async listLeaveOption(user) {
    const cacheKey = `listLeaveOption:${user.id}`;
    const ifCacheKeyAlreadyExists = await this.redisFunctions.checkIfKeyExists(
      cacheKey
    );
    if (ifCacheKeyAlreadyExists) {
      return await this.redisFunctions.getRedisKey(cacheKey);
    }
    const leaveOptionData = await this.leaveOption.findAll();
    await this.redisFunctions.setKey(cacheKey, JSON.stringify(leaveOptionData));
    return leaveOptionData;
  }
  public async updateLeaveOption(
    user,
    leaveOptionId,
    optionDetails
  ): Promise<{ count: number; rows: LeaveOption[] }> {
    if (!this.isTrainer(user)) {
      throw new HttpException(403, 'Forbidden Resource');
    }
    const response = await this.leaveOption.findOne({
      where: {
        id: leaveOptionId,
      },
    });
    if (!response) throw new HttpException(400, 'No data found');

    const updateLeaveOption = await this.leaveOption.update(
      { ...optionDetails },
      {
        where: {
          id: leaveOptionId,
        },
        returning: true,
      }
    );
    await this.redisFunctions.removeDataFromRedis();
    return { count: updateLeaveOption[0], rows: updateLeaveOption[1] };
  }
  public async deleteLeaveOption(
    leaveOptionId,
    user
  ): Promise<{ count: number }> {
    if (!this.isTrainer(user)) {
      throw new HttpException(403, 'Forbidden Resource');
    }

    const res: number = await this.leaveOption.destroy({
      where: {
        id: leaveOptionId,
      },
    });
    await this.redisFunctions.removeDataFromRedis();
    if (res === 1)
      throw new HttpException(200, 'Leave Option Deleted Successfully');
    if (res === 0) throw new HttpException(404, 'No data found');

    return { count: res };
  }
}
export default LeaveOptionService;
