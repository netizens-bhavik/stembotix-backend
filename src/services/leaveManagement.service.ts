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

class LeaveManagementService {
  public user = DB.User;
  public instructor = DB.Instructor;
  public livestream = DB.LiveStream;
  public manageLeave = DB.ManageLeaves;
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

  public async getLeave(loggedUser, queryObject) {
    if (!loggedUser) throw new HttpException(401, 'Unauthorized');
    if (
      this.isInstructor(loggedUser) ||
      (this.isStudent(loggedUser) && !this.isInstitute(loggedUser))
    ) {
      throw new HttpException(403, 'Forbidden Resource');
    }

    const sortBy = queryObject.sortBy ? queryObject.sortBy : 'createdAt';
    const order = queryObject.order === 'DESC' ? 'DESC' : 'ASC';
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
          attributes: ['id', 'firstName', 'lastName', 'email'],
          as: 'ManageUserLeave',
          where: {
            firstName: { [searchCondition]: search },
            lastName: { [searchCondition]: search },
            email: { [searchCondition]: search },
          },
        },
      ],
      limit: pageSize,
      offset: pageNo,
      order: [[`${sortBy}`, `${order}`]],
    });
    return findLeave;
  }

  public async getLeaveView(loggedUser, queryObject) {
    if (!loggedUser) throw new HttpException(401, 'Unauthorized');
    if (!this.isInstructor(loggedUser) && !this.isStudent(loggedUser)) {
      throw new HttpException(403, 'Forbidden Resource');
    }
    const sortBy = queryObject.sortBy ? queryObject.sortBy : 'createdAt';
    const order = queryObject.order === 'DESC' ? 'DESC' : 'ASC';
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
          attributes: ['id', 'firstName', 'lastName', 'email'],
          as: 'ManageUserLeave',
          where: {
            firstName: { [searchCondition]: search },
            lastName: { [searchCondition]: search },
            email: { [searchCondition]: search },
          },
        },
      ],
      where: {
        UserId: loggedUser.id,
      },
      limit: pageSize,
      offset: pageNo,
      order: [[`${sortBy}`, `${order}`]],
    });
    return findLeave;
  }

  public async createLeave(loggedUser, leaveData) {
    if (!loggedUser) throw new HttpException(401, 'Unauthorized');
    if (!this.isInstructor(loggedUser) && !this.isStudent(loggedUser)) {
      throw new HttpException(403, 'Forbidden Resource');
    }
    if (isEmpty(leaveData)) throw new HttpException(400, 'Leave data is empty');

    const findLivestream = await this.livestream.findByPk(
      leaveData.livestreamId
    );
    if (!findLivestream) throw new HttpException(409, 'Livestream not found');

    // if (this.isInstructor(loggedUser)) {
    //   const leaveType = `${leaveData.leaveType}LeaveCount`;
    //   console.log(leaveType);

    //   const [instance, isCreated] = await this.instrucorHasLeave.findOrCreate({
    //     where: {
    //       UserId: loggedUser.id,
    //       [leaveType]: 0,
    //     },
    //   });

    //   if (isCreated) {
    //     console.log('created');
    //   }
    // }

    const checkLeave = await this.manageLeave.findOne({
      where: {
        Date: leaveData.Date,
        LeaveReason: leaveData.leaveReason,
        LeaveType: leaveData.leaveType,
        livestreamId: leaveData.livestreamId,
        isInstructor: this.isInstructor(loggedUser),
        isStudent: this.isStudent(loggedUser),
        UserId: loggedUser.id,
      },
    });

    if (checkLeave) throw new HttpException(409, 'Leave already exists');

    const createLeave = await this.manageLeave.create({
      Date: leaveData.Date,
      LeaveReason: leaveData.leaveReason,
      LeaveType: leaveData.leaveType,
      livestreamId: leaveData.livestreamId,
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
        LeaveReason: leaveData.leaveReason,
        LeaveType: leaveData.leaveType,
        livestreamId: leaveData.livestreamId,
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
}
export default LeaveManagementService;
