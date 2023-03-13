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

class InstructorLeaveService {
  public user = DB.User;
  public instructor = DB.Instructor;
  public livestream = DB.LiveStream;
  public manageLeave = DB.ManageLeaves;
  public instituteInstructor = DB.InstituteInstructor;
  public instructorHasLeave = DB.InstructorHasLeave;
  public leaveType = DB.LeaveTypes;
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

    const findLeave = await this.instructorHasLeave.findAndCountAll({
      // attributes: ['id', 'leaveCount'],
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

    // findEvents.map((event) => {
    //   return {
    //     id: event.id,
    //     date: event.date,
    //     startTime: event.startTime,
    //     endTime: event.endTime,
    //     title: event.title,
    //   };
    // });

    // const mydata = findLeave.rows.map((data) => {
    //   console.log(data);
    // });

    return { totalCount: findLeave.count, records: findLeave.rows };
  }

  public async addInstructorLeave({ loggedUser, leaveData }) {
    if (!loggedUser) throw new HttpException(401, 'Unauthorized');
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
      throw new HttpException(400, 'Leave already exists');
    }

    if (leaveCount < 0) {
      throw new HttpException(401, 'Leave count must not be less than 0');
    }

    const createLeave = await this.instructorHasLeave.create({
      instituteInstructorId,
      leaveTypeId,
      leaveCount,
    });

    return { message: 'Leave added successfully' };
  }

  public async updateInstructorLeave({
    loggedUser,
    leaveData,
    intructorLeaveId,
  }) {
    if (!loggedUser) throw new HttpException(401, 'Unauthorized');
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

    const checkfindLeave = await this.instructorHasLeave.findOne({
      where: { instituteInstructorId, leaveTypeId, leaveCount },
    });
    if (checkfindLeave) {
      throw new HttpException(400, 'Leave already exists');
    }

    const updateLeave = await this.instructorHasLeave.update(
      {
        instituteInstructorId,
        leaveTypeId,
        leaveCount,
      },
      { where: { id: intructorLeaveId } }
    );
    return { message: 'Leave updated successfully' };
  }

  public async deleteInstructorLeave({
    loggedUser,
    intructorLeaveId,
  }): Promise<{ count: number }> {
    if (!loggedUser) throw new HttpException(401, 'Unauthorized');
    if (!this.isInstitute(loggedUser)) {
      throw new HttpException(403, 'Forbidden Resource');
    }
    const findLeave = await this.instructorHasLeave.findOne({
      where: { id: intructorLeaveId },
    });
    if (!findLeave) {
      throw new HttpException(404, 'Leave not found');
    }
    const deleteLeave = await this.instructorHasLeave.destroy({
      where: { id: intructorLeaveId },
    });

    let message =
      deleteLeave === 1 ? 'Leave deleted successfully' : 'Leave not found';

    return {
      count: deleteLeave,
    };
  }

  public async getInstructorsList({ loggedUser }) {
    if (!loggedUser) throw new HttpException(401, 'Unauthorized');
    if (!this.isInstitute(loggedUser)) {
      throw new HttpException(403, 'Forbidden Resource');
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
    return { totalCount: findInstructor.count, records: findInstructor.rows };
  }
}
export default InstructorLeaveService;
