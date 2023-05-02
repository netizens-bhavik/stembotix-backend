import DB from '@databases';
import { HttpException } from '@exceptions/HttpException';
import { CurriculumSection } from '@/interfaces/curriculumSection.interface';
import { Course } from '@/interfaces/course.interface';

class CurriculumSectionService {
  public curriculumSection = DB.CurriculumSection;
  public curriculumVideo = DB.CurriCulumVideo;
  public course = DB.Course;
  public trainer = DB.Trainer;
  public user = DB.User;
  public courseTrainer = DB.CoursesTrainers;

  public isTrainer(user): boolean {
    return user.role === 'Instructor' || user.role === 'SuperAdmin';
  }

  public async addSection({
    curriculumDetails,
    user,
  }): Promise<CurriculumSection | Course> {
    if (!this.isTrainer(user)) {
      throw new HttpException(403, 'Forbidden Resource');
    }
    const response = await this.course.findOne({
      where: {
        id: curriculumDetails.course_id,
      },
      include: [
        {
          model: this.trainer,
          through: { attributes: [] },
          include: [
            {
              model: this.user,
            },
          ],
        },
      ],
    });
    if (!response) throw new HttpException(403, 'Forbidden Resource');
    if (user.id !== response.Trainers[0].User.id && user.role !== 'Admin')
      throw new HttpException(
        403,
        "You don't have Authority to Add CourseCurriculumn"
      );
    const newCurriculum = await this.curriculumSection.create({
      ...curriculumDetails,
      userId: user.id,
    });
    return {
      id: newCurriculum.id,
      title: newCurriculum.title,
      objective: newCurriculum.objective,
      course_id: response.id,
      userId: user.id,
    };
  }

  public async viewSection(
    queryObject,
    courseId
  ): Promise<{
    totalCount: number;
    records: (CurriculumSection | undefined)[];
  }> {
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

    const sectionData = await this.curriculumSection.findAndCountAll({
      where: { course_id: courseId },
    });
    const data: (CurriculumSection | undefined)[] =
      await this.curriculumSection.findAll({
        where: DB.Sequelize.and(
          { course_id: courseId },
          {
            title: {
              [searchCondition]: search,
            },
          }
        ),
        include: [
          {
            model: this.curriculumVideo,
          },
          {
            model: DB.Quiz,
          },
        ],

        limit: pageSize,
        offset: pageNo,
        order: [[`${sortBy}`, `${order}`]],
      });
    return { totalCount: sectionData.count, records: data };
  }
  public async updateSection({
    curriculumDetails,
    trainer,
    curriculumId,
  }): Promise<{ count: number; rows: CurriculumSection[] }> {
    if (!this.isTrainer(trainer)) {
      throw new HttpException(403, 'Forbidden Resource');
    }
    const record = await this.curriculumSection.findOne({
      where: {
        id: curriculumId,
      },
      include: {
        model: this.course,
        include: [
          {
            model: this.trainer,
            include: {
              model: this.user,
            },
          },
        ],
      },
    });
    if (
      trainer.id !== record.Course.Trainers[0].User.id &&
      trainer.role !== 'Admin'
    )
      throw new HttpException(
        403,
        "You don't have Authority to Edit CourseCurriculumn"
      );
    const updateSection = await this.curriculumSection.update(
      {
        ...curriculumDetails,
      },
      {
        where: {
          id: curriculumId,
        },
        returning: true,
      }
    );

    return { count: updateSection[0], rows: updateSection[1] };
  }

  public async deleteSection({
    trainer,
    curriculumId,
  }): Promise<{ count: number }> {
    if (!this.isTrainer(trainer)) throw new HttpException(401, 'Unauthorized');
    const record = await this.curriculumSection.findOne({
      where: {
        id: curriculumId,
      },
      include: {
        model: this.course,
        include: [
          {
            model: this.trainer,
            include: {
              model: this.user,
            },
          },
        ],
      },
    });
    if (
      trainer.id !== record.Course.Trainers[0].User.id &&
      trainer.role !== 'Admin'
    )
      throw new HttpException(
        403,
        "You don't have Authority to Delete CourseCurriculumn"
      );

    const res: number = await this.curriculumSection.destroy({
      where: {
        id: curriculumId,
      },
    });
    return { count: res };
  }
}
export default CurriculumSectionService;
