import DB from '@databases';
import { HttpException } from '@exceptions/HttpException';
import { isEmpty } from '@utils/util';
import EmailService from './email.service';
import { LeaveData, AddLeaveData } from '@/interfaces/leaveData.interface';
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

  public emailService = new EmailService();

  public isInstitute(loggedUser): boolean {
    return loggedUser.role === 'Institute' || loggedUser.role === 'Admin';
  }

  public isInstructor(loggedUser): boolean {
    return loggedUser.role === 'Instructor';
  }

  public isStudent(loggedUser): boolean {
    return loggedUser.role === 'Student';
  }

  public async getLeaveByAdmin({
    loggedUser,
    queryObject,
  }): Promise<{ totalCount: number; records: (LeaveData | undefined)[] }> {
    if (
      this.isInstructor(loggedUser) ||
      (this.isStudent(loggedUser) && !this.isInstitute(loggedUser))
    ) {
      throw new HttpException(403, 'Forbidden Resource');
    }
    const order = queryObject.order || 'DESC';
    // pagination
    const pageSize = queryObject.pageRecord ? queryObject.pageRecord : 10;
    const pageNo = queryObject.pageNo ? (queryObject.pageNo - 1) * pageSize : 0;
    // Search
    const [search, searchCondition] = queryObject.search
      ? [`%${queryObject.search}%`, DB.Sequelize.Op.like]
      : ['', DB.Sequelize.Op.ne];

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
      ? [`%${queryObject.search}%`, DB.Sequelize.Op.like]
      : ['', DB.Sequelize.Op.ne];

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
    return { totalCount: findLeave.count, records: findLeave.rows };
  }

  public async getLeaveTypeforInstructor({ loggedUser, livestreamId }) {
    if (!this.isInstructor(loggedUser)) {
      throw new HttpException(403, 'Forbidden Resource');
    }

    const findLivestream = await this.livestream.findByPk(livestreamId);
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

    return findLeave;
  }

  public async createLeave(loggedUser, leaveData): Promise<AddLeaveData> {
    if (!this.isInstructor(loggedUser)) {
      throw new HttpException(403, 'Forbidden Resource');
    }
    if (isEmpty(leaveData)) throw new HttpException(400, 'Leave data is empty');

    const findLivestream = await this.livestream.findOne({
      id: leaveData.livestreamId,
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

    if (!updateLeaveBalance)
      throw new HttpException(409, 'Leave balance not updated');

    return createLeave;
  }

  public async getLeaveById(loggedUser, leaveId) {
    if (!this.isInstructor(loggedUser) && !this.isInstitute(loggedUser)) {
      throw new HttpException(403, 'Forbidden Resource');
    }
    if (isEmpty(leaveId)) throw new HttpException(400, 'Leave id is empty');

    const findLeave = await this.manageLeave.findByPk(leaveId, {
      include: [
        {
          model: this.user,
          attributes: ['id', 'firstName', 'lastName', 'email'],
        },
      ],
    });

    if (!findLeave) throw new HttpException(409, 'Leave not found');

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
      id: leaveData.liveStreamId,
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
    const findLeave = await this.manageLeave.findOne({
      where: {
        id: leaveId,
      },
    });
    if (!findLeave) throw new HttpException(409, 'Leave not found');

    let isApproved = isApprovedCount.count === 0 ? 'Approved' : 'Rejected';
    const updateLeave = await this.manageLeave.update(
      { isApproved },
      {
        where: { id: leaveId },
      }
    );

    if (!updateLeave) throw new HttpException(409, 'Leave not updated');

    if (isApproved === 'Rejected') {
      const findInstitute = await this.instituteInstructor.findOne({
        where: {
          instructorId: findLeave.UserId,
          instituteId: loggedUser.id,
          isAccepted: 'Accepted',
        },
      });

      if (!findInstitute)
        throw new HttpException(
          409,
          'You are not associated with this institute for this Event'
        );

      const instituteInstructorId = findInstitute.id;

      const checkLeaveBalance = await this.instrucorHasLeave.findOne({
        where: {
          instituteInstructorId: instituteInstructorId,
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
            instituteInstructorId: instituteInstructorId,
            leaveTypeId: findLeave.leaveTypeId,
          },
        }
      );

      if (!updateLeaveBalance)
        throw new HttpException(409, 'Leave balance not updated');
    }

    return { count: isApprovedCount.count };
  }

  public async getEventsByDate(loggedUser, date) {
    const newDate = new Date(date);
    if (!loggedUser) throw new HttpException(401, 'Unauthorized');

    if (isEmpty(date)) throw new HttpException(400, 'Date is empty');

    const findEvents = await this.livestream.findAll({
      where: { date: newDate, userId: loggedUser.id },
      attributes: ['id', 'date', 'startTime', 'endTime', 'title'],
    });
    return findEvents.map((event) => {
      return {
        id: event.id,
        date: event.date,
        startTime: event.startTime,
        endTime: event.endTime,
        title: event.title,
      };
    });
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
      ? [`%${queryObject.search}%`, DB.Sequelize.Op.like]
      : ['', DB.Sequelize.Op.ne];

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

    return {
      count: findLeave.count,
      records: findLeave.rows,
    };
  }
}
export default LeaveManagementService;
