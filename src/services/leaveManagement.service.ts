import DB from '@databases';
import { HttpException } from '@exceptions/HttpException';
import { isEmpty } from '@utils/util';
import EmailService from './email.service';
import { LeaveData, AddLeaveData } from '@/interfaces/leaveData.interface';
import { Op } from 'sequelize';
import { Mail } from '@/interfaces/mailPayload.interface';
import { RedisFunctions } from '@/redis';
class LeaveManagementService {
  public user = DB.User;
  public instructor = DB.Instructor;
  public livestream = DB.LiveStream;
  public manageLeave = DB.ManageLeaves;
  public instituteInstructor = DB.InstituteInstructor;
  public instrucorHasLeave = DB.InstructorHasLeave;
  public leaveType = DB.LeaveTypes;
  public holidayList = DB.HolidayList;
  public holiday = DB.Holidays;
  public redisFunctions = new RedisFunctions();

  public emailService = new EmailService();

  public isInstitute(loggedUser): boolean {
    return (
      loggedUser.role === 'Institute' ||
      loggedUser.role === 'Admin' ||
      loggedUser.role === 'SuperAdmin'
    );
  }

  public isInstructor(loggedUser): boolean {
    return (
      loggedUser.role === 'Instructor' ||
      loggedUser.role === 'Admin' ||
      loggedUser.role === 'SuperAdmin'
    );
  }

  public isStudent(loggedUser): boolean {
    return loggedUser.role === 'Student';
  }

  public async getLeaveByAdmin({
    loggedUser,
    queryObject,
  }): Promise<{ totalCount: number; records: (LeaveData | undefined)[] }> {
    if (!this.isInstructor(loggedUser)) {
      throw new HttpException(403, 'Forbidden Resource');
    }
    const order = queryObject.order || 'DESC';
    // pagination
    const pageSize = queryObject.pageRecord ? queryObject.pageRecord : 10;
    const pageNo = queryObject.pageNo ? (queryObject.pageNo - 1) * pageSize : 0;
    // Search
    const [search, searchCondition] = queryObject.search
      ? [`%${queryObject.search}%`, DB.Sequelize.Op.iLike]
      : ['', DB.Sequelize.Op.ne];

    const cacheKey = `getLeaveByAdmin:${order}:${pageSize}:${pageNo}:${search}`;
    const cachedData = await this.redisFunctions.getRedisKey(cacheKey);
    if (cachedData) {
      return cachedData;
    }

    const findLeave = await this.manageLeave.findAndCountAll({
      include: [
        {
          model: this.user,
          attributes: ['id', 'firstName', 'lastName', 'email', 'fullName'],
          where: DB.Sequelize.or(
            { firstName: { [searchCondition]: search } },
            { lastName: { [searchCondition]: search } },
            { email: { [searchCondition]: search } }
          ),
        },
        {
          model: this.livestream,
          attributes: ['id', 'title'],
        },
        {
          model: this.leaveType,
        },
      ],
      limit: pageSize,
      offset: pageNo,
      order: [
        [{ model: this.user }, 'firstName', order],
        [{ model: this.user }, 'lastName', order],
      ],
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

  public async viewLeavebyInstructor({
    loggedUser,
    queryObject,
  }): Promise<{ totalCount: number; records: (LeaveData | undefined)[] }> {
    if (!this.isInstructor(loggedUser)) {
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

    const cacheKey = `viewLeavebyInstructor:${loggedUser.id}--${sortBy}:${order}:${pageSize}:${pageNo}:${search}`;
    const cachedData = await this.redisFunctions.getRedisKey(cacheKey);
    if (cachedData) {
      return cachedData;
    }
    const findLeave = await this.manageLeave.findAndCountAll({
      where: {
        user_id: loggedUser.id,
      },
      include: [
        {
          model: this.user,
          attributes: ['id', 'firstName', 'lastName', 'email', 'fullName'],
        },
        {
          model: this.livestream,
        },
        {
          model: this.leaveType,
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

  public async getLeaveTypeforInstructor({ loggedUser, livestreamId }) {
    if (!this.isInstructor(loggedUser)) {
      throw new HttpException(403, 'Forbidden Resource');
    }
    const cacheKey = `getLeaveTypeforInstructor:${loggedUser.id}`;
    const cachedData = await this.redisFunctions.getRedisKey(cacheKey);
    if (cachedData) {
      return cachedData;
    }
    const findLivestream = await this.livestream.findOne({
      where: {
        id: livestreamId,
      },
    });
    if (!findLivestream) throw new HttpException(409, 'Livestream not found');

    const findInstitute = await this.instituteInstructor.findOne({
      where: {
        instructorId: loggedUser.id,
        instituteId: findLivestream.instituteId,
        isAccepted: 'Accepted',
      },
    });

    if (!findInstitute)
      throw new HttpException(
        409,
        'You are not associated with this institute for this Event'
      );

    const findLeave = await this.instrucorHasLeave.findAll({
      where: {
        instituteInstructorId: findInstitute.id,
      },
      include: [
        {
          model: this.leaveType,
        },
      ],
    });
    await this.redisFunctions.setKey(cacheKey, JSON.stringify(findLeave));
    return findLeave;
  }

  public async createLeave(loggedUser, leaveData): Promise<AddLeaveData> {
    if (!this.isInstructor(loggedUser)) {
      throw new HttpException(403, 'Forbidden Resource');
    }
    if (isEmpty(leaveData)) throw new HttpException(400, 'Leave data is empty');
    const findLivestream = await this.livestream.findOne({
      where: { id: leaveData.liveStreamId },
    });
    const admin = await this.user.findOne({
      where: {
        role: 'Admin',
      },
    });
    if (!findLivestream) throw new HttpException(409, 'Livestream not found');
    const findInstitute = await this.instituteInstructor.findOne({
      where: {
        instructorId: loggedUser.id,
        instituteId: findLivestream.instituteId,
        isAccepted: 'Accepted',
      },
    });

    if (!findInstitute)
      throw new HttpException(
        409,
        'You are not associated with this institute for this Event'
      );

    var instituteInstructorId = findInstitute.id;

    const checkLeaveBalance = await this.instrucorHasLeave.findOne({
      where: {
        instituteInstructorId: instituteInstructorId,
        leaveTypeId: leaveData.leaveTypeId,
      },
    });

    if (!checkLeaveBalance)
      throw new HttpException(
        409,
        'You do not have leave balance for this leave type'
      );

    if (checkLeaveBalance.leaveCount <= 0)
      throw new HttpException(
        409,
        'You do not have leave balance for this leave type'
      );

    const checkLeave = await this.manageLeave.findOne({
      where: {
        date: leaveData.date,
        livestreamId: leaveData.liveStreamId,
        userId: loggedUser.id,
        leaveTypeId: leaveData.leaveTypeId,
        isApproved: 'Approved',
      },
    });

    if (checkLeave) throw new HttpException(409, 'Leave already exists');

    const checkHoliday = await this.holiday.findOne({
      where: {
        date: leaveData.date,
        instituteId: findLivestream.instituteId,
      },
    });

    if (checkHoliday)
      throw new HttpException(409, 'You cannot take leave on holiday');
    const createLeave = await this.manageLeave.create({
      ...leaveData,
      livestreamId: leaveData.liveStreamId,
      userId: loggedUser.id,
    });
    var mailList = [admin.email, findInstitute.email];
    if (createLeave) {
      const mailData: Mail = {
        templateData: {
          date: leaveData.date,
          user: loggedUser.firstName,
          users: loggedUser.lastName,
          email: admin.email,
        },
        mailData: {
          from: loggedUser.email,
          to: mailList,
        },
      };
      this.emailService.sendLeaveaMail(mailData);
    }

    if (!createLeave) throw new HttpException(409, 'Leave not created');

    //update leave balance
    const updateLeaveBalance = await this.instrucorHasLeave.update(
      {
        leaveCount: checkLeaveBalance.leaveCount - 1,
      },
      {
        where: {
          instituteInstructorId: instituteInstructorId,
          leaveTypeId: leaveData.leaveTypeId,
        },
      }
    );
    await this.redisFunctions.removeDataFromRedis();
    if (!updateLeaveBalance)
      throw new HttpException(409, 'Leave balance not updated');

    return createLeave;
  }

  public async getLeaveById(loggedUser, leaveId) {
    if (!this.isInstructor(loggedUser) && !this.isInstitute(loggedUser)) {
      throw new HttpException(403, 'Forbidden Resource');
    }
    if (isEmpty(leaveId)) throw new HttpException(400, 'Leave id is empty');
    const cacheKey = `getLeaveById:${leaveId}`;
    const cachedData = await this.redisFunctions.getRedisKey(cacheKey);
    if (cachedData) {
      return cachedData;
    }
    const findLeave = await this.manageLeave.findByPk(leaveId, {
      include: [
        {
          model: this.user,
          attributes: ['id', 'firstName', 'lastName', 'email'],
        },
      ],
    });

    if (!findLeave) throw new HttpException(409, 'Leave not found');
    await this.redisFunctions.setKey(cacheKey, JSON.stringify(findLeave));

    return findLeave;
  }

  public async updateLeaveById(loggedUser, leaveId, leaveData) {
    if (!this.isInstructor(loggedUser)) {
      throw new HttpException(403, 'Forbidden Resource');
    }
    if (isEmpty(leaveData)) throw new HttpException(400, 'Leave data is empty');

    const findLeave = await this.manageLeave.findByPk(leaveId);

    if (!findLeave) throw new HttpException(409, 'Leave not found');

    const findLivestream = await this.livestream.findOne({
      where: { id: leaveData.liveStreamId },
    });
    if (!findLivestream) throw new HttpException(409, 'Livestream not found');

    const findInstitute = await this.instituteInstructor.findOne({
      where: {
        instructorId: loggedUser.id,
        instituteId: findLivestream.instituteId,
        isAccepted: 'Accepted',
      },
    });

    if (!findInstitute)
      throw new HttpException(
        409,
        'You are not associated with this institute for this Event'
      );

    const checkHoliday = await this.holiday.findOne({
      where: {
        date: leaveData.date,
        instituteId: findLivestream.instituteId,
      },
    });

    if (checkHoliday)
      throw new HttpException(409, 'You cannot take leave on holiday');

    const updateLeave = await this.manageLeave.update(
      {
        ...leaveData,
        userId: loggedUser.id,
      },
      {
        where: { id: leaveId },
      }
    );

    if (!updateLeave) throw new HttpException(409, 'Leave not updated');
    await this.redisFunctions.removeDataFromRedis();
    return updateLeave;
  }

  public async deleteLeaveById(loggedUser, leaveId) {
    if (!this.isInstructor(loggedUser) && !this.isInstitute(loggedUser)) {
      throw new HttpException(403, 'Forbidden Resource');
    }
    if (isEmpty(leaveId)) throw new HttpException(400, 'Leave id is empty');

    const findLeave = await this.manageLeave.findByPk(leaveId);
    if (!findLeave) throw new HttpException(409, 'Leave not found');

    const deleteLeave = await this.manageLeave.destroy({
      where: { id: leaveId },
    });
    await this.redisFunctions.removeDataFromRedis();
    return deleteLeave;
  }

  public async approveLeaveById(
    loggedUser,
    leaveId,
    isApprovedCount
  ): Promise<{ count: number }> {
    if (!this.isInstitute(loggedUser)) {
      throw new HttpException(403, 'Forbidden Resource');
    }
    const admin = await this.user.findOne({
      where: {
        role: 'Admin',
      },
    });
    const findLeave = await this.manageLeave.findOne({
      where: {
        id: leaveId,
      },
      include: {
        model: this.user,
      },
    });
    if (!findLeave) throw new HttpException(409, 'Leave not found');

    let isApproved = isApprovedCount.count === 0 ? 'Approved' : 'Rejected';
    const updateLeave = await this.manageLeave.update(
      { isApproved },
      {
        where: { id: leaveId },
        returning: true,
      }
    );
    // App (0) Rej (1)
    if (!updateLeave) throw new HttpException(409, 'Leave not updated');
    if (isApproved === 'Rejected') {
      const findInstitute = await this.instituteInstructor.findOne({
        where: {
          instructorId: findLeave.userId,
          isAccepted: 'Accepted',
        },
      });
      // \      const instituteInstructorId = findInstitute.id;
      const checkLeaveBalance = await this.instrucorHasLeave.findOne({
        where: {
          leaveTypeId: findLeave.leaveTypeId,
        },
      });

      if (!checkLeaveBalance)
        throw new HttpException(409, 'Leave balance not found');

      //update leave balance
      const updateLeaveBalance = await this.instrucorHasLeave.update(
        {
          leaveCount: checkLeaveBalance.leaveCount + 1,
        },
        {
          where: {
            instituteInstructorId: checkLeaveBalance.instituteInstructorId,
            leaveTypeId: findLeave.leaveTypeId,
          },
        }
      );

      if (!updateLeaveBalance)
        throw new HttpException(409, 'Leave balance not updated');
    }
    if (isApprovedCount.count === 0) {
      const mailData: Mail = {
        templateData: {
          isAccepted: isApproved,
          user: findLeave.User.firstName,
          users: findLeave.User.lastName,
          email: admin.email,
        },
        mailData: {
          from: loggedUser.email,
          to: findLeave.User.email,
        },
      };
      this.emailService.AcceptLeave(mailData);
    } else {
      const mailData: Mail = {
        templateData: {
          isAccepted: isApproved,
          user: findLeave.User.firstName,
          users: findLeave.User.lastName,
          email: admin.email,
        },
        mailData: {
          from: loggedUser.email,
          to: findLeave.User.email,
        },
      };
      this.emailService.RejectLeave(mailData);
    }
    await this.redisFunctions.removeDataFromRedis();
    return { count: isApprovedCount.count };
  }

  public async getEventsByDate(loggedUser, date) {
    const newDate = new Date(date);
    if (!loggedUser) throw new HttpException(401, 'Unauthorized');

    if (isEmpty(date)) throw new HttpException(400, 'Date is empty');
    const cacheKey = `getEventsByDate:${date}`;
    const cachedData = await this.redisFunctions.getRedisKey(cacheKey);
    if (cachedData) {
      return cachedData;
    }
    const findEvents = await this.livestream.findAll({
      where: DB.Sequelize.and(
        { date: newDate },
        {
          userId: loggedUser.id,
        },
        {
          instituteId: null,
        }
      ),
    });
    console.log('findEvents', findEvents);
    await this.redisFunctions.setKey(cacheKey, JSON.stringify(findEvents));
    return findEvents;
  }

  public async getLeaveByInstitute({ loggedUser, queryObject }) {
    if (!this.isInstitute(loggedUser)) {
      throw new HttpException(403, 'Forbidden Resource');
    }
    // sorting
    const sortBy = queryObject.sortBy ? queryObject.sortBy : 'createdAt';
    const order = queryObject.order === 'DESC' ? 'DESC' : 'ASC';
    // pagination
    const pageSize = queryObject.pageRecord ? queryObject.pageRecord : 10;
    const pageNo = queryObject.pageNo ? (queryObject.pageNo - 1) * pageSize : 0;
    // Search
    const [search, searchCondition] = queryObject.search
      ? [`%${queryObject.search}%`, DB.Sequelize.Op.iLike]
      : ['', DB.Sequelize.Op.ne];

    const cacheKey = `getLeaveByInstitute:${loggedUser.id}:${sortBy}:${order}:${pageSize}:${pageNo}`;
    const cachedData = await this.redisFunctions.getRedisKey(cacheKey);
    if (cachedData) {
      return cachedData;
    }
    const instituteLivestream = await this.livestream.findAll({
      where: {
        instituteId: loggedUser.id,
      },
    });

    const instituteLivestreamIds = instituteLivestream.map(
      (livestream) => livestream.id
    );

    const findLeave = await this.manageLeave.findAndCountAll({
      where: {
        livestreamId: instituteLivestreamIds,
      },

      include: [
        {
          model: this.user,
          attributes: ['id', 'firstName', 'lastName', 'email', 'fullName'],
        },
        {
          model: this.leaveType,
        },
        {
          model: this.livestream,
        },
      ],
      order: [[sortBy, order]],
      limit: pageSize,
      offset: pageNo,
    });
    await this.redisFunctions.setKey(
      cacheKey,
      JSON.stringify({
        totalCount: findLeave.count,
        records: findLeave.rows,
      })
    );
    return {
      count: findLeave.count,
      records: findLeave.rows,
    };
  }
}
export default LeaveManagementService;
