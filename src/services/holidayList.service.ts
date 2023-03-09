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
import {
  AllHolidayList,
  HolidayList,
} from '@/interfaces/holidayList.interface';

class HolidayListService {
  public user = DB.User;
  public instructor = DB.Instructor;
  public livestream = DB.LiveStream;
  public manageLeave = DB.ManageLeaves;
  public instituteInstructor = DB.InstituteInstructor;
  public instructorHasLeave = DB.InstructorHasLeave;
  public holidayList = DB.HolidayList;
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

  public async getHolidayList({
    loggedUser,
    queryObject,
  }): Promise<AllHolidayList> {
    // if (!this.isInstitute(loggedUser) && !this.isInstructor(loggedUser)) {
    //   throw new HttpException(403, 'Forbidden Resource');
    // }
    const sortBy = queryObject.sortBy ? queryObject.sortBy : 'createdAt';
    const order = queryObject.order === 'ASC' ? 'ASC' : 'DESC';
    // pagination
    const pageSize = queryObject.pageRecord ? queryObject.pageRecord : 10;
    const pageNo = queryObject.pageNo ? (queryObject.pageNo - 1) * pageSize : 0;
    // Search
    const [search, searchCondition] = queryObject.search
      ? [`%${queryObject.search}%`, DB.Sequelize.Op.iLike]
      : ['', DB.Sequelize.Op.ne];

    const findLeave = await this.holidayList.findAndCountAll({
      attributes: ['id', 'name', 'description', 'type'],
      where: DB.Sequelize.or(
        { name: { [searchCondition]: search } },
        { description: { [searchCondition]: search } }
      ),
      limit: pageSize,
      offset: pageNo,
      order: [[`${sortBy}`, `${order}`]],
    });

    return { totalCount: findLeave.count, records: findLeave.rows };
  }

  public async getAllHolidayList({ loggedUser }) {
    const findLeave = await this.holidayList.findAll({
      attributes: ['id', 'name', 'description', 'type'],
    });

    return { data: findLeave };
  }

  public async createHolidayList({
    loggedUser,
    holidayListData,
  }): Promise<HolidayList> {
    if (!this.isInstitute(loggedUser)) {
      throw new HttpException(403, 'Forbidden Resource');
    }
    const findHolidayList: HolidayList = await this.holidayList.findOne({
      where: { name: holidayListData.name },
    });
    if (findHolidayList)
      throw new HttpException(409, `Holiday List already exists`);

    const createHolidayListData: HolidayList = await this.holidayList.create({
      ...holidayListData,
    });

    return createHolidayListData;
  }

  public async updateHolidayList({
    loggedUser,
    holidayListId,
    holidayListData,
  }): Promise<{ count: number; rows: HolidayList[] }> {
    if (!this.isInstitute(loggedUser)) {
      throw new HttpException(403, 'Forbidden Resource');
    }
    const findHolidayList: HolidayList = await this.holidayList.findByPk(
      holidayListId
    );
    if (!findHolidayList)
      throw new HttpException(409, `Holiday List not found`);

    const updateHolidayList = await this.holidayList.update(
      { ...holidayListData },
      { where: { id: holidayListId }, returning: true }
    );
    return { count: updateHolidayList[0], rows: updateHolidayList[1] };
  }

  public async deleteHolidayList({
    loggedUser,
    holidayListId,
  }): Promise<{ count: number }> {
    if (!this.isInstitute(loggedUser)) {
      throw new HttpException(403, 'Forbidden Resource');
    }
    const findHolidayList: HolidayList = await this.holidayList.findByPk(
      holidayListId
    );
    if (!findHolidayList)
      throw new HttpException(409, `Holiday List not found`);

    const res = await this.holidayList.destroy({
      where: { id: holidayListId },
    });
    if (res === 1) {
      throw new HttpException(200, 'Holiday List has been deleted');
    }
    return { count: res };
  }
}
export default HolidayListService;
