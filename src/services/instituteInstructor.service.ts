import DB from '@databases';
import { HttpException } from '@exceptions/HttpException';
import { isEmpty } from '@utils/util';
import crypto from 'crypto';
import fs from 'fs';
import { API_BASE } from '@/config';
import path from 'path';

class InstituteInstructorService {
  public user = DB.User;
  public instituteInstructor = DB.InstituteInstructor;

  public async fetchInstructors() {
    const allInstructors = await this.user.findAll({
      where: {
        role: 'Instructor',
        deletedAt: null,
      },
      attributes: ['id', 'fullName', 'firstName', 'lastName'],
    });
    return allInstructors;
  }

  public async createInstructorRequest(loggedUser, instructorId) {
    console.log('loggedUser', loggedUser);

    console.log('instructorId', instructorId);

    if (!loggedUser) throw new HttpException(401, 'Unauthorized');
    if (loggedUser.role !== 'Institute' && loggedUser.role !== 'Admin')
      throw new HttpException(403, 'Access Forbidden');

    if (isEmpty(instructorId))
      throw new HttpException(400, 'InstructorId is empty');

    const findInstructor = await this.user.findByPk(instructorId);
    if (!findInstructor) throw new HttpException(409, 'Instructor not found');

    const findInstituteInstructor = await this.instituteInstructor.findOne({
      where: {
        InstituteId: loggedUser.id,
        instructor_id: instructorId,
      },
    });
    if (findInstituteInstructor)
      throw new HttpException(409, 'Request already sent');

    const createInstituteInstructor = await this.instituteInstructor.create({
      InstituteId: loggedUser.id,
      InstructorId: instructorId,
    });
    return createInstituteInstructor;
  }
}
export default InstituteInstructorService;
