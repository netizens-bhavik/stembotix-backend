import DB from '@databases';
import { HttpException } from '@exceptions/HttpException';
import { isEmpty } from '@utils/util';
import crypto from 'crypto';
import fs from 'fs';
import { API_BASE } from '@/config';
import path from 'path';
import { InstructorInstitute } from '@/interfaces/instructorInstitute.interface';
import EmailService from './email.service';
import { Mail } from '@/interfaces/mailPayload.interface';
import { User } from 'aws-sdk/clients/budgets';
import { clearConfigCache } from 'prettier';
import { LeaveData, AddLeaveData } from '@/interfaces/leaveData.interface';

class LeaveManagementService {
  public user = DB.User;
  public instructor = DB.Instructor;
  public livestream = DB.LiveStream;
  public manageLeave = DB.ManageLeaves;
  public instituteInstructor = DB.InstituteInstructor;
  public instrucorHasLeave = DB.InstructorHasLeave;
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

  public async getLeave({
    loggedUser,
    queryObject,
  }): Promise<{ totalCount: number; records: (LeaveData | undefined)[] }> {
    if (!loggedUser) throw new HttpException(401, 'Unauthorized');
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
          order: [
            [{ model: this.user }, 'firstName', order],
            [{ model: this.user }, 'lastName', order],
          ],
          attributes: ['id', 'firstName', 'lastName', 'email', 'fullName'],
          as: 'ManageUserLeave',
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
      ],
      limit: pageSize,
      offset: pageNo,
    });
    return { totalCount: findLeave.count, records: findLeave.rows };
  }

  public async getLeaveView({
    loggedUser,
    queryObject,
  }): Promise<{ totalCount: number; records: (LeaveData | undefined)[] }> {
    if (!loggedUser) throw new HttpException(401, 'Unauthorized');
    if (!this.isInstructor(loggedUser) && !this.isStudent(loggedUser)) {
      throw new HttpException(403, 'Forbidden Resource');
    }
    // const sortBy = queryObject.sortBy ? queryObject.sortBy : 'createdAt';
    const order = queryObject.order || 'DESC'
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
          order: [
            [{ model: this.user }, 'firstName', order],
            [{ model: this.user }, 'lastName', order],
          ],
          attributes: ['id', 'firstName', 'lastName', 'email', 'fullName'],
          as: 'ManageUserLeave',
          where: DB.Sequelize.or(
            { firstName: { [searchCondition]: search } },
            { lastName: { [searchCondition]: search } },
            { email: { [searchCondition]: search } }
          ),
        },
        {
          model: this.livestream,
        },
      ],
      where: {
        UserId: loggedUser.id,
      },
      limit: pageSize,
      offset: pageNo,
    });
    return { totalCount: findLeave.count, records: findLeave.rows };
  }

  public async createLeave(loggedUser, leaveData): Promise<AddLeaveData> {
    if (!loggedUser) throw new HttpException(401, 'Unauthorized');
    // if (!this.isInstructor(loggedUser) && !this.isStudent(loggedUser)) {
    //   throw new HttpException(403, 'Forbidden Resource');
    // }
    if (isEmpty(leaveData)) throw new HttpException(400, 'Leave data is empty');

    const findLivestream = await this.livestream.findByPk(leaveData.LiveStream);
    if (!findLivestream) throw new HttpException(409, 'Livestream not found');

    if (this.isInstructor(loggedUser)) {
      const findInstitute = await this.instituteInstructor.findAll({
        where: {
          InstructorId: loggedUser.id,
        },
      });

      if (!findInstitute)
        throw new HttpException(
          409,
          'Instructor is not associated with any institute'
        );

      // const [instance, isCreated] = await this.instrucorHasLeave.findOrCreate({
      //   where: {
      //     UserId: loggedUser.id,
      //   },
      // });

      // if (isCreated) {
      //   console.log('created');
      // }
    }

    const checkLeave = await this.manageLeave.findOne({
      where: {
        Date: leaveData.Date,
        // LeaveReason: leaveData.LeaveReason,
        LeaveType: leaveData.LeaveType,
        livestreamId: leaveData.LiveStream,
        isInstructor: this.isInstructor(loggedUser),
        isStudent: this.isStudent(loggedUser),
        UserId: loggedUser.id,
      },
    });

    if (checkLeave) throw new HttpException(409, 'Leave already exists');

    const createLeave = await this.manageLeave.create({
      Date: leaveData.Date,
      LeaveReason: leaveData.LeaveReason,
      LeaveType: leaveData.LeaveType,
      livestreamId: leaveData.LiveStream,
      isInstructor: this.isInstructor(loggedUser),
      isStudent: this.isStudent(loggedUser),
      UserId: loggedUser.id,
    });

    return createLeave;
  }

  public async getLeaveById(loggedUser, leaveId) {
    if (!loggedUser) throw new HttpException(401, 'Unauthorized');
    if (
      !this.isInstructor(loggedUser) &&
      !this.isStudent(loggedUser) &&
      !this.isInstitute(loggedUser)
    ) {
      throw new HttpException(403, 'Forbidden Resource');
    }
    if (isEmpty(leaveId)) throw new HttpException(400, 'Leave id is empty');

    const findLeave = await this.manageLeave.findByPk(leaveId, {
      include: [
        {
          model: this.user,
          attributes: ['id', 'firstName', 'lastName', 'email'],
          as: 'ManageUserLeave',
        },
      ],
    });

    if (!findLeave) throw new HttpException(409, 'Leave not found');

    return findLeave;
  }

  public async updateLeaveById(loggedUser, leaveId, leaveData) {
    if (!loggedUser) throw new HttpException(401, 'Unauthorized');
    if (!this.isInstructor(loggedUser) && !this.isStudent(loggedUser)) {
      throw new HttpException(403, 'Forbidden Resource');
    }
    if (isEmpty(leaveData)) throw new HttpException(400, 'Leave data is empty');

    const findLeave = await this.manageLeave.findByPk(leaveId);
    if (!findLeave) throw new HttpException(409, 'Leave not found');

    const updateLeave = await this.manageLeave.update(
      {
        Date: leaveData.Date,
        LeaveReason: leaveData.LeaveReason,
        LeaveType: leaveData.LeaveType,
        livestreamId: leaveData.LiveStream,
      },
      {
        where: { id: leaveId },
      }
    );

    return updateLeave;
  }

  public async deleteLeaveById(loggedUser, leaveId) {
    if (!loggedUser) throw new HttpException(401, 'Unauthorized');
    if (
      !this.isInstructor(loggedUser) &&
      !this.isStudent(loggedUser) &&
      !this.isInstitute(loggedUser)
    ) {
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

  public async approveLeaveById(loggedUser, leaveId, isApproved) {
    if (!loggedUser) throw new HttpException(401, 'Unauthorized');
    if (!this.isInstitute(loggedUser)) {
      throw new HttpException(403, 'Forbidden Resource');
    }
    if (isEmpty(isApproved))
      throw new HttpException(400, 'Leave approval is empty');

    const findLeave = await this.manageLeave.findByPk(leaveId);
    if (!findLeave) throw new HttpException(409, 'Leave not found');

    const updateLeave = await this.manageLeave.update(isApproved, {
      where: { id: leaveId },
    });

    return updateLeave;
  }

  public async getEventsByDate(loggedUser, date) {
    const newDate = new Date(date);

    if (!loggedUser) throw new HttpException(401, 'Unauthorized');
    // if (!this.isInstructor(loggedUser) && !this.isStudent(loggedUser)) {
    //   throw new HttpException(403, 'Forbidden Resource');
    // }
    if (isEmpty(date)) throw new HttpException(400, 'Date is empty');

    const findEvents = await this.livestream.findAll({
      where: { date: newDate },
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

  public async getLeaveByStudent({
    loggedUser,
    queryObject,
  }): Promise<{ totalCount: number; records: (LeaveData | undefined)[] }> {
    if (!loggedUser) throw new HttpException(401, 'Unauthorized');
    if (
      !this.isInstructor(loggedUser) &&
      !this.isInstitute(loggedUser) &&
      this.isStudent(loggedUser)
    ) {
      throw new HttpException(403, 'Forbidden Resource');
    }

    const instructorLivestream = await this.livestream.findAll({
      where: { userId: loggedUser.id },
    });

    const findLeave = await this.manageLeave.findAndCountAll({
      where: {
        UserId: loggedUser.id,
        livestreamId: instructorLivestream.map((livestream) => livestream.id),
        isStudent: true,
      },
      include: [
        {
          model: this.user,
          attributes: ['id', 'firstName', 'lastName', 'email'],
          as: 'ManageUserLeave',
        },
      ],
    });

    return { totalCount: findLeave.count, records: findLeave.rows };
  }

  public async getLeaveByInstructor({
    loggedUser,
    queryObject,
  }): Promise<{ totalCount: number; records: (LeaveData | undefined)[] }> {
    if (!loggedUser) throw new HttpException(401, 'Unauthorized');
    if (
      !this.isInstructor(loggedUser) &&
      this.isInstitute(loggedUser) &&
      !this.isStudent(loggedUser)
    ) {
      throw new HttpException(403, 'Forbidden Resource');
    }

    const instructorLivestream = await this.livestream.findAll({
      where: { userId: loggedUser.id },
    });

    const findLeave = await this.manageLeave.findAndCountAll({
      where: {
        UserId: loggedUser.id,
        livestreamId: instructorLivestream.map((livestream) => livestream.id),
        isInstructor: true,
      },
      include: [
        {
          model: this.user,
          attributes: ['id', 'firstName', 'lastName', 'email'],
          as: 'ManageUserLeave',
        },
      ],
    });

    return { totalCount: findLeave.count, records: findLeave.rows };
  }
}
export default LeaveManagementService;
