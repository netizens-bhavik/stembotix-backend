import DB from '@databases';
import { HttpException } from '@exceptions/HttpException';
import { isEmpty } from '@utils/util';
import { CurriculumSection } from '@/interfaces/curriculumSection.interface';
import { Course } from '@/interfaces/course.interface';
import { CurriculumSectionDto } from '@/dtos/curriculumSection.dto';
import { CurriCulumVideo } from '@/interfaces/curriculumVideo.interface';

class CurriculumSectionService {
  public curriculumSection = DB.CurriculumSection;
  public curriculumVideo = DB.CurriCulumVideo;
  public course = DB.Course;
  public trainer = DB.Trainer;
  public user = DB.User;

  public isTrainer(user): boolean {
    return user.role === 'Instructor' || user.role === 'Admin';
  }

  public async addSection({
    curriculumDetails,
  }): Promise<CurriculumSection | Course> {
    const response: Course = await this.course.findOne({
      where: {
        id: curriculumDetails.course_id,
      },
      include: [
        {
          model: this.trainer,
          through: [],
          include: [
            {
              model: this.user,
            },
          ],
        },
      ],
    });
    if (!response) throw new HttpException(403, 'Forbidden Resource');

    const newCurriculum = await this.curriculumSection.create({
      ...curriculumDetails,
    });
    return {
      id: newCurriculum.id,
      title: newCurriculum.title,
      objective: newCurriculum.objective,
      course_id: response.id,
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
    const order = queryObject.order || 'DESC'
    // === 'ASC' ? 'ASC' : 'DESC';
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
  }): Promise<{ count: number; rows: CurriculumSection[] }> {
    if (!this.isTrainer(trainer)) {
      throw new HttpException(403, 'Forbidden Resource');
    }

    const updateSection = await this.curriculumSection.update(
      {
        ...curriculumDetails,
      },
      {
        where: {
          id: curriculumDetails.id,
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

    const res: number = await this.curriculumSection.destroy({
      where: {
        id: curriculumId,
      },
    });
    return { count: res };
  }
}
export default CurriculumSectionService;
