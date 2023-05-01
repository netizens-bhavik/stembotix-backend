import DB from '@databases';
import { HttpException } from '@exceptions/HttpException';
import { InstructorInstitute } from '@/interfaces/instructorInstitute.interface';
import EmailService from './email.service';
import { Mail } from '@/interfaces/mailPayload.interface';

class InstituteInstructorService {
  public user = DB.User;
  public instituteInstructor = DB.InstituteInstructor;
  public emailService = new EmailService();

  public isInstitute(loggedUser): boolean {
    return loggedUser.role === 'Institute' || loggedUser.role === 'Admin';
  }

  public isInstructor(loggedUser): boolean {
    return loggedUser.role === 'Instructor' || loggedUser.role === 'Admin';
  }

  public async createInstructorRequest({ loggedUser, instructorDetail }) {
    if (!this.isInstitute(loggedUser)) {
      throw new HttpException(403, 'Forbidden Resource');
    }

    // const findInstituteInstructor = await this.instituteInstructor.findOne({
    //   where: {
    //     instituteId: loggedUser.id,
    //     instructorId: instructorDetail.instructorId,
    //   },
    // });
    const createInstituteInstructor = await this.instituteInstructor.create({
      ...instructorDetail,
      instituteId: loggedUser.id,
    });

    const instituteInfo = await this.user.findByPk(loggedUser.id);
    const instructorInfo = await this.user.findByPk(
      instructorDetail.instructorId
    );

    if (createInstituteInstructor) {
      const mailData: Mail = {
        templateData: {
          proposal: instructorDetail.proposal,
          institute: instituteInfo,
          instructor: instructorInfo,
        },
        mailData: {
          from: loggedUser.email,
          to: instructorInfo.email,
        },
      };
      this.emailService.sendRequestToJoinInstitute(mailData);
    }
    return createInstituteInstructor;
  }

  public async acceptApproval(offerId, loggedUser, isAcceptedCount) {
    if (!this.isInstructor(loggedUser))
      throw new HttpException(403, 'Forbidden Resource');

    const findInstituteInstructor = await this.instituteInstructor.findOne({
      where: {
        id: offerId,
      },
      include: {
        model: this.user,
        as: 'Institute',
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
    if (isAcceptedCount.count === 0) {
      const mailData: Mail = {
        templateData: {
          isAccepted: updateOffer[1][0].isAccepted,
          email: loggedUser.email,
          user: findInstituteInstructor.Institute.firstName,
        },
        mailData: {
          from: loggedUser.email,
          to: findInstituteInstructor.Institute.email,
        },
      };
      this.emailService.AcceptProposalofInstitute(mailData);
    }

    if (isAcceptedCount.count === 1) {
      const mailData: Mail = {
        templateData: {
          isAccepted: updateOffer[1][0].isAccepted,
          email: loggedUser.email,
          user: findInstituteInstructor.Institute.firstName,
        },
        mailData: {
          from: loggedUser.email,
          to: findInstituteInstructor.Institute.email,
        },
      };
      this.emailService.RejectProposalofInstitute(mailData);
      await this.instituteInstructor.update(
        { isDeleted: true },
        {
          where: {
            id: offerId,
          },
        }
      );
    }
    return updateOffer[1][0];
  }

  public async deleteInstituteRequest(loggedUser, offerId) {
    if (!this.isInstructor(loggedUser)) {
      throw new HttpException(403, 'Unauthorized');
    }
    const record = await this.instituteInstructor.findOne({
      where: {
        id: offerId,
      },
    });
    if (!record) throw new HttpException(404, 'No data found');
    if (loggedUser.id !== record.instructorId && loggedUser.role !== 'Admin')
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
    if (!this.isInstructor(loggedUser)) {
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
          as: 'Instructor',
        },
      ],
      paranoid: false,
      limit: pageSize,
      offset: pageNo,
      order: [[`${sortBy}`, `${order}`]],
    });
    return resposnse;
  }

  public async getReqByInstructor(
    user,
    queryObject
  ): Promise<{
    totalCount: number;
    records: (InstructorInstitute | undefined)[];
  }> {
    if (!this.isInstructor(user)) {
      throw new HttpException(403, 'Forbidden Resource');
    }
    const sortBy = queryObject.sortBy ? queryObject.sortBy : 'createdAt';
    const order = queryObject.order || 'DESC';
    // pagination
    const pageSize = queryObject.pageRecord ? queryObject.pageRecord : 10;
    const pageNo = queryObject.pageNo ? (queryObject.pageNo - 1) * pageSize : 0;
    // Search
    const [search, searchCondition] = queryObject.search
      ? [`%${queryObject.search}%`, DB.Sequelize.Op.iLike]
      : ['', DB.Sequelize.Op.ne];

    const response = await this.instituteInstructor.findAndCountAll({
      where: {
        instructor_id: user.id,
      },
      include: {
        model: this.user,
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
      paranoid: false,

      limit: pageSize,
      offset: pageNo,
      order: [[`${sortBy}`, `${order}`]],
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
      include: [
        {
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
        {
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
          as: 'Instructor',
        },
      ],
      paranoid: false,

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
    const data = await this.instituteInstructor.findAll({
      where: {
        instructor_id: user.id,
        isAccepted: 'Accepted',
      },
      include: [
        {
          model: this.user,
          as: 'Institute',
          required: true,
        },
      ],
    });
    return data;
  }
}
export default InstituteInstructorService;
