import { RedisFunctions } from '@/redis';
import DB from '@databases';
import { HttpException } from '@exceptions/HttpException';
class LeaveTypeService {
  public user = DB.User;
  public instructor = DB.Instructor;
  public livestream = DB.LiveStream;
  public manageLeave = DB.ManageLeaves;
  public instituteInstructor = DB.InstituteInstructor;
  public instrucorHasLeave = DB.InstructorHasLeave;
  public leaveType = DB.LeaveTypes;
  public redisFunctions = new RedisFunctions();

  public isInstitute(loggedUser): boolean {
    return loggedUser.role === 'Institute' || loggedUser.role === 'SuperAdmin';
  }

  public isInstructor(loggedUser): boolean {
    return loggedUser.role === 'Instructor';
  }

  public async getLeaveType({ loggedUser, queryObject }) {
    if (!this.isInstitute(loggedUser) && !this.isInstructor(loggedUser)) {
      throw new HttpException(403, 'Forbidden Resource');
    }
    const sortBy = queryObject.sortBy ? queryObject.sortBy : 'createdAt';
    const order = queryObject.order === 'DESC' ? 'DESC' : 'ASC';
    // pagination
    const pageSize = queryObject.pageRecord ? queryObject.pageRecord : 10;
    const pageNo = queryObject.pageNo ? (queryObject.pageNo - 1) * pageSize : 0;
    // Search
    const [search, searchCondition] = queryObject.search
      ? [`%${queryObject.search}%`, DB.Sequelize.Op.iLike]
      : ['', DB.Sequelize.Op.ne];

    const cacheKey = `getLeaveType:${sortBy}:${order}:${pageSize}:${pageNo}::${search}`;
    const cachedData = await this.redisFunctions.getRedisKey(cacheKey);
    if (cachedData) {
      return cachedData;
    }
    const findLeave = await this.leaveType.findAndCountAll({
      where: DB.Sequelize.or({ leaveName: { [searchCondition]: search } }),
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
  public async getAllLeaveType(loggedUser) {
    const cacheKey = `getAllLeaveType:${loggedUser.id}`;
    const cachedData = await this.redisFunctions.getRedisKey(cacheKey);
    if (cachedData) {
      return cachedData;
    }
    const findLeave = await this.leaveType.findAndCountAll();
    await this.redisFunctions.setKey(
      cacheKey,
      JSON.stringify({
        totalCount: findLeave.count,
        records: findLeave.rows,
      })
    );
    return { totalCount: findLeave.count, records: findLeave.rows };
  }

  public async addLeaveType({ loggedUser, leaveTypeData }) {
    if (!loggedUser) throw new HttpException(401, 'Unauthorized');
    if (!this.isInstitute(loggedUser)) {
      throw new HttpException(403, 'Forbidden Resource');
    }

    const findLeaveType = await this.leaveType.findOne({
      where: {
        leaveName: leaveTypeData.leaveName,
        type: leaveTypeData.type,
      },
    });

    if (findLeaveType) {
      throw new HttpException(409, 'Leave type already exists');
    }

    const createLeaveType = await this.leaveType.create({
      ...leaveTypeData,
    });
    await this.redisFunctions.removeDataFromRedis();

    return createLeaveType;
  }

  public async updateLeaveType({ loggedUser, leaveTypeData, leavetypeId }) {
    if (!this.isInstitute(loggedUser)) {
      throw new HttpException(403, 'Forbidden Resource');
    }

    const findLeaveType = await this.leaveType.findOne({
      where: {
        id: leavetypeId,
      },
    });

    if (!findLeaveType) {
      throw new HttpException(409, 'Leave type not found');
    }

    const updateLeaveType = await this.leaveType.update(
      {
        ...leaveTypeData,
      },
      {
        where: {
          id: leavetypeId,
        },
        returning: true,
      }
    );
    await this.redisFunctions.removeDataFromRedis();

    return updateLeaveType;
  }

  public async deleteLeaveType({
    loggedUser,
    leaveTypeId,
  }): Promise<{ count: number }> {
    if (!this.isInstitute(loggedUser)) {
      throw new HttpException(403, 'Forbidden Resource');
    }

    const findLeaveType = await this.leaveType.findOne({
      where: {
        id: leaveTypeId,
      },
    });

    if (!findLeaveType) {
      throw new HttpException(409, 'Leave type not found');
    }

    const deleteLeaveType = await this.leaveType.destroy({
      where: {
        id: leaveTypeId,
      },
    });
    await this.redisFunctions.removeDataFromRedis();

    if (deleteLeaveType === 1)
      throw new HttpException(200, 'Leavetype deleted successfully');
    return { count: deleteLeaveType };
  }
}
export default LeaveTypeService;
