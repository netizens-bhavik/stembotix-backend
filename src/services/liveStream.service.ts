import DB from '@databases';
import { HttpException } from '@exceptions/HttpException';
import { isEmpty } from '@utils/util';
// import 'reflect-metadata';
import { API_BASE, API_SECURE_BASE, CLIENT_URL } from '@config';
import { LiveStream } from '@/interfaces/liveStream.interface';

class LiveStreamService {
  public user = DB.User;
  public liveStream = DB.LiveStream;

  public isTrainer(user): boolean {
    return user.role === 'Instructor' || user.role === 'Admin';
  }
  public async createLiveStream({
    file,
    user,
    liveStreamDetails,
  }): Promise<LiveStream> {
    if (!this.isTrainer(user)) {
      throw new HttpException(404, "You don't have Authority to Create Event");
    }
    const { thumbnail } = file;
    const thumbnailPath = `${API_BASE}/media/${thumbnail[0].path
      .split('/')
      .splice(-2)
      .join('/')}`;

    const liveStream = await this.liveStream.create({
      ...liveStreamDetails,
      thumbnail: thumbnailPath,
      userId: user.id,
    });
    return liveStream;
  }
  public async viewLiveStream(user): Promise<{
    totalCount: number;
    records: (LiveStream | undefined)[];
  }> {
    const streamData = await this.liveStream.findAndCountAll({
      order: [
        ['is_active', 'DESC'],
        ['startDate', 'ASC'],
      ],
    });
    return { totalCount: streamData.count, records: streamData.rows };
  }

  public async viewLiveStreambyId(livestreamId): Promise<LiveStream> {
    const streamData = await this.liveStream.findOne({
      where: {
        id: livestreamId,
      },
    });
    if (!streamData) throw new HttpException(400, 'No event found');
    return streamData;
  }
  public async updateLiveStream({
    livestreamDetails,
    file,
    trainer,
    livestreamId,
  }): Promise<{ count: number; rows: LiveStream[] }> {
    if (!this.isTrainer(trainer) || !trainer.isEmailVerified)
      throw new HttpException(403, "You don't have Authority to Update Event");

    const record = await this.liveStream.findOne({
      where: {
        id: livestreamId,
      },
    });
    if (!record) throw new HttpException(403, 'Forbidden Resource');

    const { thumbnail } = file;
    const thumbnailPath = `${API_BASE}/media/${thumbnail[0].path
      .split('/')
      .splice(-2)
      .join('/')}`;

    const updateLiveStream = await this.liveStream.update(
      {
        ...livestreamDetails,
        thumbnail: thumbnailPath,
      },
      {
        where: {
          id: livestreamId,
        },
        returning: true,
      }
    );
    return { count: updateLiveStream[0], rows: updateLiveStream[1] };
  }

  public async deleteLiveStream({
    trainer,
    livestreamId,
  }): Promise<{ count: number }> {
    if (!this.isTrainer(trainer))
      throw new HttpException(401, "You don't have Authority to Delete Event");

    const record = await this.liveStream.findOne({
      where: {
        id: livestreamId,
      },
    });
    if (!record) throw new HttpException(403, 'Forbidden Resource');
    const res = await this.liveStream.destroy({
      where: {
        id: livestreamId,
      },
    });
    if (res === 1) {
      throw new HttpException(200, 'Event has been deleted');
    }
    return { count: res };
  }
  public async viewLiveStreamByAdmin(
    queryObject
  ): Promise<{ totalCount: number; records: (LiveStream | undefined)[] }> {
    // sorting
    const sortBy = queryObject.sortBy ? queryObject.sortBy : 'createdAt';
    const order = queryObject.order || 'DESC';
    // pagination
    const pageSize = queryObject.pageRecord ? queryObject.pageRecord : 10;
    const pageNo = queryObject.pageNo ? (queryObject.pageNo - 1) * pageSize : 0;
    // Search
    const [search, searchCondition] = queryObject.search
      ? [`%${queryObject.search}%`, DB.Sequelize.Op.iLike]
      : ['', DB.Sequelize.Op.ne];
    const liveStreamData = await this.liveStream.findAndCountAll({
      where: DB.Sequelize.and({ deletedAt: null }),
    });
    const data: (LiveStream | undefined)[] = await this.liveStream.findAll({
      where: DB.Sequelize.and({
        deletedAt: null,
        title: {
          [searchCondition]: search,
        },
      }),

      limit: pageSize,
      offset: pageNo,
      order: [[`${sortBy}`, `${order}`]],
    });
    return { totalCount: liveStreamData.count, records: data };
  }
}
export default LiveStreamService;
