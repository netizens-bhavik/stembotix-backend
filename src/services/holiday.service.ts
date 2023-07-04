import DB from '@databases';
import { HttpException } from '@exceptions/HttpException';
import EmailService from './email.service';
import {
  HolidayList,
  createHolidayData,
  AllHolidaywithDetails,
} from '@/interfaces/holiday.interface';
import { RedisFunctions } from '@/redis';

class HolidayService {
  public user = DB.User;
  public instructor = DB.Instructor;
  public livestream = DB.LiveStream;
  public manageLeave = DB.ManageLeaves;
  public instituteInstructor = DB.InstituteInstructor;
  public instructorHasLeave = DB.InstructorHasLeave;
  public holidayList = DB.HolidayList;
  public holiday = DB.Holidays;
  public leaveType = DB.LeaveTypes;
  public holidayType = DB.HolidayType;
  public emailService = new EmailService();
  public redisFunctions = new RedisFunctions();

  public isInstitute(loggedUser): boolean {
    return (
      loggedUser.role === 'Institute' ||
      loggedUser.role === 'Admin' ||
      loggedUser.role === 'SuperAdmin'
    );
  }

  public async getHolidays({
    loggedUser,
    queryObject,
  }): Promise<AllHolidaywithDetails> {
    const sortBy = queryObject.sortBy ? queryObject.sortBy : 'createdAt';
    const order = queryObject.order === 'ASC' ? 'ASC' : 'DESC';
    // pagination
    const pageSize = queryObject.pageRecord ? queryObject.pageRecord : 10;
    const pageNo = queryObject.pageNo ? (queryObject.pageNo - 1) * pageSize : 0;
    // Search
    const [search, searchCondition] = queryObject.search
      ? [`%${queryObject.search}%`, DB.Sequelize.Op.iLike]
      : ['', DB.Sequelize.Op.ne];

    const cacheKey = `getAllHoliday:${search}:${sortBy}:${order}:${pageSize}:${pageNo}`;
    const cachedData = await this.redisFunctions.getRedisKey(cacheKey);
    if (cachedData) {
      return cachedData;
    }

    const findLeave = await this.holiday.findAndCountAll({
      attributes: ['id', 'date'],
      include: [
        {
          model: this.holidayList,
          attributes: ['id', 'name', 'description'],
          as: 'holidayList',
          where: { name: { [searchCondition]: search } },
        },
        {
          model: this.holidayType,
        },
      ],

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

  public async getAllHolidays({ loggedUser }) {
    const cacheKey = `getHoliday:${loggedUser.id}`;
    const cachedData = await this.redisFunctions.getRedisKey(cacheKey);
    if (cachedData) {
      return cachedData;
    }
    const findLeave = await this.holiday.findAll({
      include: [
        {
          model: this.holidayList,
          attributes: ['id', 'name', 'description'],
          as: 'holidayList',
        },
        {
          model: this.holidayType,
        },
      ],
    });
    await this.redisFunctions.setKey(cacheKey, JSON.stringify(findLeave));

    return findLeave;
  }

  public async createHoliday(
    loggedUser,
    holidayData
  ): Promise<createHolidayData> {
    if (!this.isInstitute(loggedUser)) {
      throw new HttpException(403, 'Forbidden Resource');
    }
    const findHolidayList: HolidayList = await this.holiday.findOne({
      where: {
        holidayListId: holidayData.holidayListId,
      },
    });
    if (findHolidayList) throw new HttpException(409, `Holiday already exists`);

    const createHolidayData = await this.holiday.create({
      ...holidayData,
      instituteId: loggedUser.id,
    });
    await this.redisFunctions.removeDataFromRedis();
    return createHolidayData;
  }

  public async updateHoliday({
    loggedUser,
    holidayId,
    holidayData,
  }): Promise<createHolidayData> {
    if (!this.isInstitute(loggedUser)) {
      throw new HttpException(403, 'Forbidden Resource');
    }
    const findHoliday = await this.holiday.findByPk(holidayId);
    if (!findHoliday) throw new HttpException(409, `Holiday List not found`);

    const findHolidayList = await this.holiday.findOne({
      where: {
        holidayListId: holidayData.holidayListId,
      },
    });

    if (findHolidayList && findHolidayList.id !== holidayId)
      throw new HttpException(409, `Holiday already exists`);
    if (
      loggedUser.id !== findHoliday.instituteId &&
      loggedUser.role !== 'SuperAdmin'
    )
      throw new HttpException(403, "You don't have Authority to Edit Holiday");

    const updateHolidayData = await this.holiday.update(
      { ...holidayData },
      {
        where: { id: holidayId },
        returning: true,
      }
    );
    await this.redisFunctions.removeDataFromRedis();
    return updateHolidayData;
  }

  public async deleteHoliday({
    loggedUser,
    holidayId,
  }): Promise<{ count: number }> {
    if (!this.isInstitute(loggedUser)) {
      throw new HttpException(403, 'Forbidden Resource');
    }
    const findHoliday = await this.holiday.findByPk(holidayId);
    if (!findHoliday) throw new HttpException(409, `Holiday not found`);

    if (
      loggedUser.id !== findHoliday.instituteId &&
      loggedUser.role !== 'SuperAdmin'
    )
      throw new HttpException(
        403,
        "You don't have Authority to Delete Holiday"
      );

    const deleteHolidayData = await this.holiday.destroy({
      where: { id: holidayId },
    });
    await this.redisFunctions.removeDataFromRedis();
    if (deleteHolidayData === 1)
      throw new HttpException(200, 'Holiday deleted successfully');
    return { count: deleteHolidayData };
  }
}
export default HolidayService;
