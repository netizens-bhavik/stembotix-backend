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
  HolidayList,
  Holiday,
  HolidaywithDetails,
  AllHolidaywithDetails,
} from '@/interfaces/holiday.interface';

class HolidayService {
  public user = DB.User;
  public instructor = DB.Instructor;
  public livestream = DB.LiveStream;
  public manageLeave = DB.ManageLeaves;
  public instituteInstructor = DB.InstituteInstructor;
  public instructorHasLeave = DB.InstructorHasLeave;
  public holidayList = DB.HolidayList;
  public holiday = DB.Holidays;
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

  public async getHolidays({
    loggedUser,
    queryObject,
  }): Promise<AllHolidaywithDetails> {
    if (!loggedUser) throw new HttpException(401, 'Unauthorized');
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

    const findLeave = await this.holiday.findAndCountAll({
      attributes: ['id', 'date'],
      include: [
        {
          model: this.holidayList,
          attributes: ['id', 'name', 'description', 'type'],
          as: 'holidayList',
          where: DB.Sequelize.or(
            { name: { [searchCondition]: search } },
            { description: { [searchCondition]: search } }
          ),
        },
      ],

      limit: pageSize,
      offset: pageNo,
      order: [[`${sortBy}`, `${order}`]],
    });

    return { totalCount: findLeave.count, records: findLeave.rows };
  }

  public async getAllHolidays({ loggedUser }) {
    if (!loggedUser) throw new HttpException(401, 'Unauthorized');
    // if (!this.isInstitute(loggedUser) && !this.isInstructor(loggedUser)) {
    //   throw new HttpException(403, 'Forbidden Resource');
    // }

    const findLeave = await this.holiday.findAll({
      // attributes: ['id', 'date'],
      include: [
        {
          model: this.holidayList,
          attributes: ['id', 'name', 'description', 'type'],
          as: 'holidayList',
        },
      ],
    });

    return { data: findLeave };
  }

  public async createHoliday({ loggedUser, holidayData }): Promise<any> {
    if (!loggedUser) throw new HttpException(401, 'Unauthorized');
    if (!this.isInstitute(loggedUser)) {
      throw new HttpException(403, 'Forbidden Resource');
    }
    const findHolidayList: HolidayList = await this.holiday.findOne({
      where: {
        date: holidayData.date,
        holidayListId: holidayData.holidayListId,
      },
    });
    if (findHolidayList) throw new HttpException(409, `Holiday already exists`);

    const createHolidayData: HolidayList = await this.holiday.create({
      ...holidayData,
      instituteId: loggedUser.id,
    });

    return createHolidayData;
  }

  public async updateHoliday({
    loggedUser,
    holidayId,
    holidayData,
  }): Promise<any> {
    if (!loggedUser) throw new HttpException(401, 'Unauthorized');
    if (!this.isInstitute(loggedUser)) {
      throw new HttpException(403, 'Forbidden Resource');
    }
    const findHoliday: HolidayList = await this.holiday.findByPk(holidayId);
    if (!findHoliday) throw new HttpException(409, `Holiday List not found`);

    const findHolidayList: HolidayList = await this.holiday.findOne({
      where: {
        date: holidayData.date,
        holidayListId: holidayData.holidayListId,
      },
    });

    if (findHolidayList && findHolidayList.id !== holidayId)
      throw new HttpException(409, `Holiday already exists`);

    const updateHolidayData = await this.holiday.update(
      { ...holidayData, instituteId: loggedUser.id },
      {
        where: { id: holidayId },
      }
    );

    if (!updateHolidayData)
      throw new HttpException(409, `Something went wrong`);

    return updateHolidayData;
  }

  public async deleteHoliday({ loggedUser, holidayId }): Promise<HolidayList> {
    if (!loggedUser) throw new HttpException(401, 'Unauthorized');
    if (!this.isInstitute(loggedUser)) {
      throw new HttpException(403, 'Forbidden Resource');
    }
    const findHoliday = await this.holiday.findByPk(holidayId);
    if (!findHoliday) throw new HttpException(409, `Holiday not found`);

    const deleteHolidayData = await this.holiday.destroy({
      where: { id: holidayId },
    });

    if (!deleteHolidayData)
      throw new HttpException(409, `Something went wrong`);

    return findHoliday;
  }
}
export default HolidayService;
