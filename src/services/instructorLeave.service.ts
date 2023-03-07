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
      // attributes: ['id', 'LeaveCount'],
      include: [
        {
          model: this.leaveType,
          attributes: ['id', 'LeaveName', 'LeaveDescription', 'Type'],
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
    const { InstituteInstructorId, LeaveTypeId, LeaveCount } = leaveData;
    const findInstructor = await this.instituteInstructor.findOne({
      where: { id: InstituteInstructorId },
    });
    if (!findInstructor) {
      throw new HttpException(404, 'Instructor not found');
    }
    const findLeaveType = await this.leaveType.findOne({
      where: { id: LeaveTypeId },
    });
    if (!findLeaveType) {
      throw new HttpException(404, 'Leave Type not found');
    }
    const findLeave = await this.instructorHasLeave.findOne({
      where: { InstituteInstructorId, LeaveTypeId },
    });
    if (findLeave) {
      throw new HttpException(400, 'Leave already exists');
    }

    if(LeaveCount<0){
      throw new HttpException(401, 'Leave count must not be less than 0');
    }

    const createLeave = await this.instructorHasLeave.create({
      InstituteInstructorId,
      LeaveTypeId,
      LeaveCount,
    });

    return { message: 'Leave added successfully' };
  }

  public async updateInstructorLeave({
    loggedUser,
    leaveData,
    IntructorLeaveId,
  }) {
    if (!loggedUser) throw new HttpException(401, 'Unauthorized');
    if (!this.isInstitute(loggedUser)) {
      throw new HttpException(403, 'Forbidden Resource');
    }
    const { InstituteInstructorId, LeaveTypeId, LeaveCount } = leaveData;
    const findInstructor = await this.instituteInstructor.findOne({
      where: { id: InstituteInstructorId },
    });
    if (!findInstructor) {
      throw new HttpException(404, 'Instructor not found');
    }
    const findLeaveType = await this.leaveType.findOne({
      where: { id: LeaveTypeId },
    });
    if (!findLeaveType) {
      throw new HttpException(404, 'Leave Type not found');
    }
    const findLeave = await this.instructorHasLeave.findOne({
      where: { InstituteInstructorId },
    });
    if (!findLeave) {
      throw new HttpException(404, 'Leave not found');
    }

    if(LeaveCount<0){
      throw new HttpException(401, 'Leave count must not be less than 0');
    }

    const checkfindLeave = await this.instructorHasLeave.findOne({
      where: { InstituteInstructorId, LeaveTypeId },
    });
    if (checkfindLeave) {
      throw new HttpException(400, 'Leave already exists');
    }

    const updateLeave = await this.instructorHasLeave.update(
      {
        InstituteInstructorId,
        LeaveTypeId,
        LeaveCount,
      },
      { where: { id: IntructorLeaveId } }
    );
    return { message: 'Leave updated successfully' };
  }

  public async deleteInstructorLeave({ loggedUser, IntructorLeaveId }) {
    if (!loggedUser) throw new HttpException(401, 'Unauthorized');
    if (!this.isInstitute(loggedUser)) {
      throw new HttpException(403, 'Forbidden Resource');
    }
    const findLeave = await this.instructorHasLeave.findOne({
      where: { id: IntructorLeaveId },
    });
    if (!findLeave) {
      throw new HttpException(404, 'Leave not found');
    }
    const deleteLeave = await this.instructorHasLeave.destroy({
      where: { id: IntructorLeaveId },
    });
    return { message: 'Leave deleted successfully' };
  }

  public async getInstructorsList({ loggedUser }) {
    if (!loggedUser) throw new HttpException(401, 'Unauthorized');
    if (!this.isInstitute(loggedUser)) {
      throw new HttpException(403, 'Forbidden Resource');
    }
    const findInstructor = await this.instituteInstructor.findAndCountAll({
      attributes: ['id'],
      where: {
        InstituteId: loggedUser.id,
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
