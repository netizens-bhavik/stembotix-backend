import DB from '@databases';
import { HttpException } from '@exceptions/HttpException';
import { isEmpty } from '@utils/util';
import crypto from 'crypto';
import fs from 'fs';
import { API_BASE } from '@/config';
import path from 'path';
import { InstructorInstitute } from '@/interfaces/instructorInstitute.interface';

class InstituteInstructorService {
  public user = DB.User;
  public instituteInstructor = DB.InstituteInstructor;
  public instructor = DB.Instructor;

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
    if (!loggedUser) throw new HttpException(401, 'Unauthorized');
    if (!this.isInstitute(loggedUser)) {
      throw new HttpException(403, 'Forbidden Resource');
    }

    if (isEmpty(instructorDetail.instructorId))
      throw new HttpException(400, 'InstructorId is empty');

    const findInstructor = await this.user.findByPk(
      instructorDetail.instructorId
    );
    if (!findInstructor) throw new HttpException(409, 'Instructor not found');

    const findInstituteInstructor = await this.instituteInstructor.findOne({
      where: {
        InstituteId: loggedUser.id,
        instructor_id: instructorDetail.instructorId,
      },
    });
    if (findInstituteInstructor)
      throw new HttpException(409, 'Request already sent');

    const createInstituteInstructor = await this.instituteInstructor.create({
      InstituteId: loggedUser.id,
      InstructorId: instructorDetail.instructorId,
      proposal: instructorDetail.proposal,
    });
    return createInstituteInstructor;
  }

  public async acceptApproval(offerId, is_accepted, loggedUser) {
    if (!this.isInstructor(loggedUser)) {
      throw new HttpException(403, 'Forbidden Resource');
    }

    if (!loggedUser) throw new HttpException(401, 'Unauthorized');

    const findInstituteInstructor = await this.instituteInstructor.findOne({
      where: {
        id: offerId,
      },
    });
    if (!findInstituteInstructor) {
      throw new HttpException(409, 'Your Request is not found');
    }

    const updateOffer = await this.instituteInstructor.update(
      { isAccepted: is_accepted },
      {
        where: {
          id: offerId,
        },
        returning: true,
      }
    );
    return updateOffer;
  }

  public async deleteInstituteRequest(loggedUser, offerId) {
    if (!this.isInstitute(loggedUser)) {
      throw new HttpException(403, 'Unauthorized');
    }
    const deleteRequest = await this.instituteInstructor.destroy({
      where: { id: offerId },
    });
    return deleteRequest;
  }

  // public async getInstituteRequest(loggedUser, queryObject) {
  //   if (!this.isInstitute(loggedUser)) {
  //     throw new HttpException(401, 'Unauthorized');
  //   }

  //   //sorting
  //   const sortBy = queryObject.sortBy ? queryObject.sortBy : 'createdAt';
  //   const order = queryObject.order || 'DESC';
  //   // pagination
  //   const pageSize = queryObject.pageRecord ? queryObject.pageRecord : 10;
  //   const pageNo = queryObject.pageNo ? (queryObject.pageNo - 1) * pageSize : 0;
  //   // Search
  //   const [search, searchCondition] = queryObject.search
  //     ? [`%${queryObject.search}%`, DB.Sequelize.Op.iLike]
  //     : ['', DB.Sequelize.Op.ne];

  //   const resposnse = await this.instituteInstructor.findAndCountAll({
  //     where: { InstituteId: loggedUser.id },
  //     include: [
  //       {
  //         model: this.user,
  //         // where: DB.Sequelize.and({
  //         //   firstName: {
  //         //     [searchCondition]: search,
  //         //   },
  //         // }),
  //         as: 'Instructor',
  //       },
  //     ],
  //     limit: pageSize,
  //     offset: pageNo,
  //     order: [[`${sortBy}`, `${order}`]],
  //   });
  //   return resposnse;
  // }
  public async getReqByInstructorId(user): Promise<InstructorInstitute> {
    const response = await this.instituteInstructor.findAndCountAll({
      where: {
        instructor_id: user.id,
      },
    });
    return response;
  }
  public async getDataByAdmin({ trainer, queryObject }): Promise<{
    totalCount: number;
    records: (InstructorInstitute | undefined)[];
  }> {
    if (isEmpty(trainer) || !this.isInstitute(trainer))
      throw new HttpException(401, 'Unauthorized');

    // // sorting
    const order = queryObject.order || 'DESC';
    // pagination
    const pageSize = queryObject.pageRecord ? queryObject.pageRecord : 10;
    const pageNo = queryObject.pageNo ? (queryObject.pageNo - 1) * pageSize : 0;
    // Search
    const [search, searchCondition] = queryObject.search
      ? [`%${queryObject.search}%`, DB.Sequelize.Op.iLike]
      : ['', DB.Sequelize.Op.ne];

    const coursesCount = await this.instituteInstructor.findAndCountAll({
      include: {
        model: this.user,
        attributes: ['fullName', 'firstName', 'lastName', 'email'],
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

    return { totalCount: coursesCount.count, records: coursesCount.rows };
  }
}
export default InstituteInstructorService;
