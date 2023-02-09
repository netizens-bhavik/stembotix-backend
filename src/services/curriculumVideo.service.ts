import DB from '@databases';
import { HttpException } from '@exceptions/HttpException';
import { isEmpty } from '@utils/util';
import { CurriCulumVideoDto } from '@/dtos/curriculumVideo.dto';
import { CurriCulumVideo } from '@/interfaces/curriculumVideo.interface';
import { API_BASE, API_SECURE_BASE } from '@/config';

class CurriculumVideoService {
  public curriculumVideo = DB.CurriCulumVideo;
  public curriculumSection = DB.CurriculumSection;
  public isTrainer(user): boolean {
    return user.role === 'Instructor' || user.role === 'Admin';
  }
  public async addVideo({
    curriculumVideoDetails,
    file,
    trainer,
    curriculumId,
  }): Promise<CurriCulumVideo> {
    if (!this.isTrainer(trainer)) {
      throw new HttpException(403, 'Forbidden Resource');
    }

    const fetchSection = await this.curriculumSection.findOne({
      where: { id: curriculumId.curriculumId },
    });

    if (!fetchSection) {
      throw new HttpException(403, 'No section found');
    }
    const filePath = `${API_BASE}/media/${file.path
      .split('/')
      .splice(-2)
      .join('/')}`;
    const newVideo = await this.curriculumVideo.create({
      ...curriculumVideoDetails,
      video_url: filePath,
      curriculum_id: fetchSection.id,
    });

    return {
      id: newVideo.id,
      title: newVideo.title,
      video_url: `${API_BASE}/media/${newVideo.video_url}`,
    };
  }

  public async listVideos(
    queryObject,
    sectionId
  ): Promise<{ totalCount: number; records: (CurriCulumVideo | undefined)[] }> {
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

    const videoData = await this.curriculumVideo.findAndCountAll({
      where: { curriculum_id: sectionId },
    });
    const data: (CurriCulumVideo | undefined)[] =
      await this.curriculumVideo.findAll({
        where: DB.Sequelize.and(
          { curriculum_id: sectionId },
          {
            title: {
              [searchCondition]: search,
            },
          }
        ),
        include: [
          {
            model: this.curriculumSection,
          },
        ],
        limit: pageSize,
        offset: pageNo,
        order: [[`${sortBy}`, `${order}`]],
      });
    return { totalCount: videoData.count, records: data };
  }

  public async updatevideo({
    curriculumVideoDetails,
    file,
    trainer,
  }): Promise<{ count: number; rows: CurriCulumVideo[] }> {
    if (!this.isTrainer(trainer)) {
      throw new HttpException(403, 'Forbidden Resource');
    }
    const filePath = `${API_BASE}/media/${file?.path
      .split('/')
      .splice(-2)
      .join('/')}`;
    if (filePath)
      curriculumVideoDetails.video_url = `${API_BASE}/media/${filePath}`;
    const updateVideo = await this.curriculumVideo.update(
      {
        ...curriculumVideoDetails,
      },
      {
        where: {
          id: curriculumVideoDetails.id,
        },
        returning: true,
      }
    );
    return { count: updateVideo[0], rows: updateVideo[1] };
  }

  public async deleteVideo({ trainer, videoId }): Promise<{ count: number }> {
    if (!this.isTrainer(trainer)) throw new HttpException(401, 'Unauthorized');
    const res: number = await this.curriculumVideo.destroy({
      where: {
        id: videoId,
      },
    });

    return { count: res };
  }
}

export default CurriculumVideoService;
