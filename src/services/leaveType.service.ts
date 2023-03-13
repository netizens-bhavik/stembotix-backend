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

class LeaveTypeService {
  public user = DB.User;
  public instructor = DB.Instructor;
  public livestream = DB.LiveStream;
  public manageLeave = DB.ManageLeaves;
  public instituteInstructor = DB.InstituteInstructor;
  public instrucorHasLeave = DB.InstructorHasLeave;
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

  public async getLeaveType({ loggedUser, queryObject }) {
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
      ? [`%${queryObject.search}%`, DB.Sequelize.Op.like]
      : ['', DB.Sequelize.Op.ne];

    const findLeave = await this.leaveType.findAndCountAll({
      where: DB.Sequelize.or(
        { LeaveName: { [searchCondition]: search } },
        { LeaveDescription: { [searchCondition]: search } }
      ),
      limit: pageSize,
      offset: pageNo,
      order: [[`${sortBy}`, `${order}`]],
    });
    return { totalCount: findLeave.count, records: findLeave.rows };
  }
  public async getAllLeaveType(loggedUser) {
    if (!loggedUser) throw new HttpException(401, 'Unauthorized');
    const findLeave = await this.leaveType.findAndCountAll();
    return { totalCount: findLeave.count, records: findLeave.rows };
  }

  public async addLeaveType({ loggedUser, leaveTypeData }) {
    if (!loggedUser) throw new HttpException(401, 'Unauthorized');
    if (!this.isInstitute(loggedUser)) {
      throw new HttpException(403, 'Forbidden Resource');
    }

    const findLeaveType = await this.leaveType.findOne({
      where: {
        LeaveName: leaveTypeData.LeaveName,
        Type: leaveTypeData.Type,
      },
    });

    if (findLeaveType) {
      throw new HttpException(409, 'Leave Type already exists');
    }

    const createLeaveType = await this.leaveType.create({
      LeaveName: leaveTypeData.LeaveName,
      LeaveDescription: leaveTypeData.LeaveDescription,
      Type: leaveTypeData.Type,
    });

    return createLeaveType;
  }

  public async updateLeaveType({
    loggedUser,
    leaveTypeData,
    leaveTypeId,
  }): Promise<{ records: object; message: string }> {
    if (!loggedUser) throw new HttpException(401, 'Unauthorized');
    if (!this.isInstitute(loggedUser)) {
      throw new HttpException(403, 'Forbidden Resource');
    }

    const findLeaveType = await this.leaveType.findOne({
      where: {
        id: leaveTypeId,
      },
    });

    if (!findLeaveType) {
      throw new HttpException(409, 'Leave Type not found');
    }

    const updateLeaveType = await this.leaveType.update(
      {
        ...leaveTypeData,
        //   LeaveName: leaveTypeData.LeaveName,
        //   LeaveDescription: leaveTypeData.LeaveDescription,
        //   Type: leaveTypeData.Type,
      },
      {
        where: {
          id: leaveTypeId,
        },
      }
    );
    return {
      records: updateLeaveType,
      message: 'Leave Type updated successfully',
    };
  }

  public async deleteLeaveType({ loggedUser, leaveTypeId }) {
    if (!loggedUser) throw new HttpException(401, 'Unauthorized');
    if (!this.isInstitute(loggedUser)) {
      throw new HttpException(403, 'Forbidden Resource');
    }

    const findLeaveType = await this.leaveType.findOne({
      where: {
        id: leaveTypeId,
      },
    });

    if (!findLeaveType) {
      throw new HttpException(409, 'Leave Type not found');
    }

    const deleteLeaveType = await this.leaveType.destroy({
      where: {
        id: leaveTypeId,
      },
    });
    return { message: 'Leave Type deleted successfully' };
  }

  // public async toggleLeaveType({ loggedUser, leaveTypeId }) {
  //   if (!loggedUser) throw new HttpException(401, 'Unauthorized');
  //   if (!this.isInstitute(loggedUser)) {
  //     throw new HttpException(403, 'Forbidden Resource');
  //   }

  //   const findLeaveType = await this.leaveType.findOne({
  //     where: {
  //       id: leaveTypeId,
  //     },
  //   });

  //   if (!findLeaveType) {
  //     throw new HttpException(409, 'Leave Type not found');
  //   }

  //   const updateLeaveType = await this.leaveType.update(
  //     {
  //       IsEnable: !findLeaveType.IsEnable,
  //     },
  //     {
  //       where: {
  //         id: leaveTypeId,
  //       },
  //     }
  //   );
  //   return { message: 'Leave Type updated successfully' };
  // }
}
export default LeaveTypeService;
