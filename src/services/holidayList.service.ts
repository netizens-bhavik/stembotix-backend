import DB from '@databases';
import { HttpException } from '@exceptions/HttpException';
import {
  AllHolidayList,
  HolidayList,
} from '@/interfaces/holidayList.interface';
import { RedisFunctions } from '@/redis';

class HolidayListService {
  public user = DB.User;
  public instructor = DB.Instructor;
  public livestream = DB.LiveStream;
  public manageLeave = DB.ManageLeaves;
  public instituteInstructor = DB.InstituteInstructor;
  public instructorHasLeave = DB.InstructorHasLeave;
  public holidayList = DB.HolidayList;
  public leaveType = DB.LeaveTypes;
  public redisFunctions = new RedisFunctions();

  public isInstitute(loggedUser): boolean {
    return (
      loggedUser.role === 'Institute' ||
      loggedUser.role === 'Admin' ||
      loggedUser.role === 'SuperAdmin'
    );
  }

  public async getHolidayList({
    loggedUser,
    queryObject,
  }): Promise<AllHolidayList> {
    const sortBy = queryObject.sortBy ? queryObject.sortBy : 'createdAt';
    const order = queryObject.order === 'ASC' ? 'ASC' : 'DESC';
    // pagination
    const pageSize = queryObject.pageRecord ? queryObject.pageRecord : 10;
    const pageNo = queryObject.pageNo ? (queryObject.pageNo - 1) * pageSize : 0;
    // Search
    const [search, searchCondition] = queryObject.search
      ? [`%${queryObject.search}%`, DB.Sequelize.Op.iLike]
      : ['', DB.Sequelize.Op.ne];

    const cacheKey = `getAllHolidayList:${sortBy}:${order}:${pageSize}:${pageNo}`;
    const cachedData = await this.redisFunctions.getRedisKey(cacheKey);
    if (cachedData) {
      return cachedData;
    }

    const findLeave = await this.holidayList.findAndCountAll({
      attributes: ['id', 'name', 'description', 'type'],
      where: DB.Sequelize.or(
        { name: { [searchCondition]: search } },
        { description: { [searchCondition]: search } }
      ),
      limit: pageSize,
      offset: pageNo,
      order: [[`${sortBy}`, `${order}`]],
    });
    await this.redisFunctions.setKey(
      cacheKey,
      JSON.stringify({
        totalCount: findLeave.count,
        records: findLeave.rows,
      })
    );

    return { totalCount: findLeave.count, records: findLeave.rows };
  }

  public async getAllHolidayList({ loggedUser }) {
    const cacheKey = `getHolidayList:${loggedUser.id}`;
    const cachedData = await this.redisFunctions.getRedisKey(cacheKey);
    if (cachedData) {
      return cachedData;
    }
    const findLeave = await this.holidayList.findAll({
      attributes: ['id', 'name', 'description', 'type'],
    });
    await this.redisFunctions.setKey(cacheKey, JSON.stringify(findLeave));

    return findLeave;
  }

  public async createHolidayList({
    loggedUser,
    holidayListData,
  }): Promise<HolidayList> {
    if (!this.isInstitute(loggedUser)) {
      throw new HttpException(403, 'Forbidden Resource');
    }
    const findHolidayList: HolidayList = await this.holidayList.findOne({
      where: { name: holidayListData.name },
    });
    if (findHolidayList)
      throw new HttpException(409, `Holiday List already exists`);

    const createHolidayListData: HolidayList = await this.holidayList.create({
      ...holidayListData,
    });
    await this.redisFunctions.removeDataFromRedis();
    return createHolidayListData;
  }

  public async updateHolidayList({
    loggedUser,
    holidayListId,
    holidayListData,
  }): Promise<{ count: number; rows: HolidayList[] }> {
    if (!this.isInstitute(loggedUser)) {
      throw new HttpException(403, 'Forbidden Resource');
    }
    const findHolidayList: HolidayList = await this.holidayList.findByPk(
      holidayListId
    );
    if (!findHolidayList)
      throw new HttpException(409, `Holiday List not found`);

    const updateHolidayList = await this.holidayList.update(
      { ...holidayListData },
      { where: { id: holidayListId }, returning: true }
    );
    await this.redisFunctions.removeDataFromRedis();
    return { count: updateHolidayList[0], rows: updateHolidayList[1] };
  }

  public async deleteHolidayList({
    loggedUser,
    holidayListId,
  }): Promise<{ count: number }> {
    if (!this.isInstitute(loggedUser)) {
      throw new HttpException(403, 'Forbidden Resource');
    }
    const findHolidayList: HolidayList = await this.holidayList.findByPk(
      holidayListId
    );
    if (!findHolidayList)
      throw new HttpException(409, `Holiday List not found`);

    const res = await this.holidayList.destroy({
      where: { id: holidayListId },
    });
    await this.redisFunctions.removeDataFromRedis();
    if (res === 1) {
      throw new HttpException(200, 'Holiday List has been deleted');
    }
    return { count: res };
  }
}
export default HolidayListService;
