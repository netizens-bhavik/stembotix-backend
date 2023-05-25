import DB from '@databases';
import { HttpException } from '@exceptions/HttpException';
import EmailService from './email.service';
import { RedisFunctions } from '@/redis';

class InstructorLeaveService {
  public user = DB.User;
  public instructor = DB.Instructor;
  public livestream = DB.LiveStream;
  public manageLeave = DB.ManageLeaves;
  public instituteInstructor = DB.InstituteInstructor;
  public instructorHasLeave = DB.InstructorHasLeave;
  public leaveType = DB.LeaveTypes;
  public emailService = new EmailService();
  public redisFunctions = new RedisFunctions();

  public isInstitute(loggedUser): boolean {
    return (
      loggedUser.role === 'Institute' ||
      loggedUser.role === 'Admin' ||
      loggedUser.role === 'SuperAdmin'
    );
  }

  public isInstructor(loggedUser): boolean {
    return loggedUser.role === 'Instructor';
  }

  public async getInstructorLeave({ loggedUser, queryObject }) {
    if (!loggedUser) throw new HttpException(401, 'Unauthorized');
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
    const cacheKey = `getInstructorLeave:${sortBy}:${order}:${pageSize}:${pageNo}`;
    const cachedData = await this.redisFunctions.getRedisKey(cacheKey);
    if (cachedData) {
      return cachedData;
    }
    const findLeave = await this.instructorHasLeave.findAndCountAll({
      include: [
        {
          model: this.leaveType,
          attributes: ['id', 'leaveName', 'leaveDescription', 'type'],
        },
        {
          model: this.instituteInstructor,
          attributes: ['id'],
          required: true,
          include: [
            {
              model: this.user,
              as: 'Instructor',
              attributes: ['firstName', 'lastName', 'fullName'],
              where: DB.Sequelize.or(
                {
                  firstName: { [searchCondition]: search },
                },
                {
                  lastName: { [searchCondition]: search },
                }
              ),
            },
          ],
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

  public async addInstructorLeave({ loggedUser, leaveData }) {
    if (!this.isInstitute(loggedUser)) {
      throw new HttpException(403, 'Forbidden Resource');
    }
    const { instituteInstructorId, leaveTypeId, leaveCount } = leaveData;

    const findInstructor = await this.instituteInstructor.findOne({
      where: { id: instituteInstructorId },
    });
    if (!findInstructor) {
      throw new HttpException(404, 'Instructor not found');
    }
    const findLeaveType = await this.leaveType.findOne({
      where: { id: leaveTypeId },
    });
    if (!findLeaveType) {
      throw new HttpException(404, 'Leave Type not found');
    }
    const findLeave = await this.instructorHasLeave.findOne({
      where: { instituteInstructorId, leaveTypeId },
    });
    if (findLeave) {
      throw new HttpException(409, 'Leave already exists');
    }

    if (leaveCount < 0) {
      throw new HttpException(401, 'Leave count must not be less than 0');
    }

    const createLeave = await this.instructorHasLeave.create({
      ...leaveData,
    });
    await this.redisFunctions.removeDataFromRedis();
    return createLeave;
  }

  public async updateInstructorLeave({
    loggedUser,
    leaveData,
    intructorLeaveId,
  }) {
    if (!this.isInstitute(loggedUser)) {
      throw new HttpException(403, 'Forbidden Resource');
    }
    const { instituteInstructorId, leaveTypeId, leaveCount } = leaveData;
    const findInstructor = await this.instituteInstructor.findOne({
      where: { id: instituteInstructorId },
    });
    if (!findInstructor) {
      throw new HttpException(404, 'Instructor not found');
    }
    const findLeaveType = await this.leaveType.findOne({
      where: { id: leaveTypeId },
    });
    if (!findLeaveType) {
      throw new HttpException(404, 'Leave Type not found');
    }
    const findLeave = await this.instructorHasLeave.findOne({
      where: { instituteInstructorId },
    });
    if (!findLeave) {
      throw new HttpException(404, 'Leave not found');
    }

    if (leaveCount < 0) {
      throw new HttpException(401, 'Leave count must not be less than 0');
    }

    const updateLeave = await this.instructorHasLeave.update(
      { ...leaveData },
      { where: { id: intructorLeaveId } }
    );
    await this.redisFunctions.removeDataFromRedis();
    return updateLeave;
  }

  public async deleteInstructorLeave({
    loggedUser,
    intructorLeaveId,
  }): Promise<{ count: number }> {
    if (!this.isInstitute(loggedUser)) {
      throw new HttpException(403, 'Forbidden Resource');
    }
    const deleteLeave = await this.instructorHasLeave.destroy({
      where: { id: intructorLeaveId },
    });
    await this.redisFunctions.removeDataFromRedis();
    if (deleteLeave === 1)
      throw new HttpException(200, 'Leave Deleted Successfully');

    return {
      count: deleteLeave,
    };
  }

  public async getInstructorsList({ loggedUser }) {
    if (!loggedUser) throw new HttpException(401, 'Unauthorized');
    if (!this.isInstitute(loggedUser)) {
      throw new HttpException(403, 'Forbidden Resource');
    }
    const cacheKey = `getInstructorsList:${loggedUser.id}`;
    const cachedData = await this.redisFunctions.getRedisKey(cacheKey);
    if (cachedData) {
      return cachedData;
    }
    const findInstructor = await this.instituteInstructor.findAndCountAll({
      attributes: ['id'],
      where: {
        instituteId: loggedUser.id,
        isAccepted: 'Accepted',
      },
      include: [
        {
          model: this.user,
          as: 'Instructor',
          attributes: ['firstName', 'lastName', 'fullName'],
        },
      ],
    });
    await this.redisFunctions.setKey(
      cacheKey,
      JSON.stringify({
        totalCount: findInstructor.count,
        records: findInstructor.rows,
      })
    );

    return { totalCount: findInstructor.count, records: findInstructor.rows };
  }
}
export default InstructorLeaveService;
