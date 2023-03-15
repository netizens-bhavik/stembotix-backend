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

class InstituteInstructorService {
  public user = DB.User;
  public instituteInstructor = DB.InstituteInstructor;
  public instructor = DB.Instructor;
  public emailService = new EmailService();

  public isInstitute(loggedUser): boolean {
    return loggedUser.role === 'Institute' || loggedUser.role === 'Admin';
  }

  public isInstructor(loggedUser): boolean {
    return loggedUser.role === 'Instructor';
  }

  // public async fetchInstructors() {
  //   const allInstructors = await this.user.findAll({
  //     where: {
  //       role: 'Instructor',
  //       deletedAt: null,
  //     },
  //     attributes: ['id', 'fullName', 'firstName', 'lastName'],
  //   });
  //   return allInstructors;
  // }

  public async createInstructorRequest(loggedUser, instructorDetail) {
    if (!this.isInstitute(loggedUser)) {
      throw new HttpException(403, 'Forbidden Resource');
    }

    const findInstituteInstructor = await this.instituteInstructor.findOne({
      where: {
        instituteId: loggedUser.id,
        instructorId: instructorDetail.instructorId,
      },
    });
    if (findInstituteInstructor)
      throw new HttpException(409, 'Request already sent');

    const createInstituteInstructor = await this.instituteInstructor.create({
      ...instructorDetail,
      instituteId: loggedUser.id,
    });
    if (createInstituteInstructor) {
      const mailData: Mail = {
        templateData: {
          proposal: instructorDetail.proposal,
        },
        mailData: {
          from: loggedUser.email,
          to: instructorDetail.email,
        },
      };
      this.emailService.sendRequestToJoinInstitute(mailData);
    }
    return createInstituteInstructor;
  }

  public async acceptApproval(
    offerId,
    loggedUser,
    isAcceptedCount
  ): Promise<{ count: number }> {
    if (!this.isInstructor(loggedUser))
      throw new HttpException(403, 'Forbidden Resource');

    const findInstituteInstructor = await this.instituteInstructor.findOne({
      where: {
        id: offerId,
      },
    });
    if (!findInstituteInstructor) {
      throw new HttpException(409, 'Your Request is not found');
    }
    if (
      loggedUser.id !== findInstituteInstructor.instructorId &&
      loggedUser.role !== 'Admin'
    )
      throw new HttpException(
        403,
        "You don't have Authority to Accept Proposal"
      );
    let isAccepted = isAcceptedCount.count === 0 ? 'Accepted' : 'Rejected';

    const updateOffer = await this.instituteInstructor.update(
      { isAccepted },
      {
        where: {
          id: offerId,
        },
        returning: true,
      }
    );
    return { count: updateOffer };
  }

  public async deleteInstituteRequest(loggedUser, offerId) {
    if (!this.isInstitute(loggedUser)) {
      throw new HttpException(403, 'Unauthorized');
    }
    const record = await this.instituteInstructor.findOne({
      where: {
        id: offerId,
      },
    });
    if (loggedUser.id !== record.instituteId && loggedUser.role !== 'Admin')
      throw new HttpException(
        403,
        "You don't have Authority to Delete Proposal"
      );
    const deleteRequest = await this.instituteInstructor.destroy({
      where: { id: offerId },
    });
    return deleteRequest;
  }

  public async getInstituteRequest(loggedUser, queryObject) {
    if (!this.isInstitute(loggedUser)) {
      throw new HttpException(401, 'Unauthorized');
    }

    //sorting
    const sortBy = queryObject.sortBy ? queryObject.sortBy : 'createdAt';
    const order = queryObject.order || 'DESC';
    // pagination
    const pageSize = queryObject.pageRecord ? queryObject.pageRecord : 10;
    const pageNo = queryObject.pageNo ? (queryObject.pageNo - 1) * pageSize : 0;
    // Search
    const [search, searchCondition] = queryObject.search
      ? [`%${queryObject.search}%`, DB.Sequelize.Op.iLike]
      : ['', DB.Sequelize.Op.ne];

    const resposnse = await this.instituteInstructor.findAndCountAll({
      where: { instituteId: loggedUser.id },
      include: [
        {
          model: this.user,
          // where: DB.Sequelize.and({
          //   firstName: {
          //     [searchCondition]: search,
          //   },
          // }),
          as: 'Instructor',
        },
      ],
      limit: pageSize,
      offset: pageNo,
      order: [[`${sortBy}`, `${order}`]],
    });
    return resposnse;
  }

  public async getReqByInstructorId(user): Promise<{
    totalCount: number;
    records: (InstructorInstitute | undefined)[];
  }> {
    if (!this.isInstructor(user)) {
      throw new HttpException(403, 'Forbidden Resource');
    }
    const response = await this.instituteInstructor.findAndCountAll({
      where: {
        instructor_id: user.id,
      },
      include: {
        model: this.user,
        as: 'Institute',
      },
    });
    return { totalCount: response.count, records: response.rows };
  }
  public async getDataByAdmin({ trainer, queryObject }): Promise<{
    totalCount: number;
    records: (InstructorInstitute | undefined)[];
  }> {
    if (!this.isInstitute(trainer)) {
      throw new HttpException(401, 'Unauthorized');
    }

    // sorting
    const order = queryObject.order || 'DESC';
    // pagination
    const pageSize = queryObject.pageRecord ? queryObject.pageRecord : 10;
    const pageNo = queryObject.pageNo ? (queryObject.pageNo - 1) * pageSize : 0;
    // Search
    const [search, searchCondition] = queryObject.search
      ? [`%${queryObject.search}%`, DB.Sequelize.Op.iLike]
      : ['', DB.Sequelize.Op.ne];

    const dataCount = await this.instituteInstructor.findAndCountAll({
      include: {
        model: this.user,
        attributes: [
          'fullName',
          'firstName',
          'lastName',
          'email',
          'id',
          'email',
          'role',
        ],
        as: 'Institute',
        where: DB.Sequelize.or(
          {
            firstName: { [searchCondition]: search },
          },
          {
            lastName: { [searchCondition]: search },
          }
        ),
      },

      limit: pageSize,
      offset: pageNo,
      order: [
        [{ model: this.user, as: 'Institute' }, 'firstName', order],
        [{ model: this.user, as: 'Institute' }, 'lastName', order],
      ],
    });

    return { totalCount: dataCount.count, records: dataCount.rows };
  }

  public async viewRequest(user, instructor) {
    if (!user) throw new HttpException(403, 'Unauthorized');
    const response = await this.instituteInstructor.findOne({
      where: DB.Sequelize.and(
        {
          instructor_id: instructor.instructorId,
        },
        {
          institute_id: user.id,
        }
      ),
    });
    return (
      response ?? {
        message: 'no data found',
      }
    );
  }
  public async viewInstituteByInstructor(user) {
    if (!this.isInstructor(user))
      throw new HttpException(403, 'Forbidden Resource');

    const data = await this.instituteInstructor.findAll({
      where: {
        instructor_id: user.id,
        isAccepted: 'Accepted',
      },
      include: [
        {
          model: this.user,
          // attributes:['firstName','lastName','fullName'],
          as: 'Institute',
          required: true,
        },
      ],
    });
    return data;
  }
}
export default InstituteInstructorService;
