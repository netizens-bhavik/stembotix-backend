import DB from '@databases';
import { HttpException } from '@exceptions/HttpException';
import { isEmpty } from '@utils/util';
// import 'reflect-metadata';
import { API_BASE, API_SECURE_BASE, CLIENT_URL } from '@config';
import { LiveStream } from '@/interfaces/liveStream.interface';

class LiveStreamService {
  public user = DB.User;
  public liveStream = DB.LiveStream;
  public trainer = DB.Trainer;
  public subscribeEvent = DB.SubscribeEvent;

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
      include: {
        model: this.user,
      },
      order: [
        ['is_active', 'DESC'],
        ['startTime', 'ASC'],
      ],
    });
    return { totalCount: streamData.count, records: streamData.rows };
  }

  public async viewLiveStreambyId(livestreamId): Promise<LiveStream> {
    const streamData = await this.liveStream.findOne({
      where: {
        id: livestreamId,
      },
      include: {
        model: this.user,
      },
    });
    if (!streamData) throw new HttpException(400, 'No event found');
    return streamData;
  }
  public async updateLiveStream({
    livestreamDetails,
    file,
    trainer,
  }): Promise<{ count: number; rows: LiveStream[] }> {
    if (!this.isTrainer(trainer) || !trainer.isEmailVerified)
      throw new HttpException(403, "You don't have Authority to Update Event");

    const record = await this.liveStream.findOne({
      where: {
        id: livestreamDetails.id,
      },
    });
    if (!record) throw new HttpException(403, 'Forbidden Resource');

    const thumbnail = file;
    const thumbnailPath = `${API_BASE}/media/${thumbnail.path
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
          id: livestreamDetails.id,
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

    let record = await this.liveStream.findOne({
      where: {
        id: livestreamId,
      },
      include: [
        {
          model: this.subscribeEvent,
        },
      ],
    });
    if (!record) throw new HttpException(402, 'No Record Found');
    const res = await this.liveStream.destroy({
      where: {
        id: record.id,
      },
    });
    await this.subscribeEvent.destroy({
      where: {
        livestreamId: livestreamId,
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
      where: {
        deletedAt: null,
        title: {
          [searchCondition]: search,
        },
      },
      include: { model: this.user },

      limit: pageSize,
      offset: pageNo,
      order: [[`${sortBy}`, `${order}`]],
    });
    return { totalCount: liveStreamData.count, records: data };
  }
  public async listLiveEvent(
    trainer,
    queryObject
  ): Promise<{ totalCount: number; records: (LiveStream | undefined)[] }> {
    if (isEmpty(trainer) || !this.isTrainer(trainer))
      throw new HttpException(401, 'Unauthorized');
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

    const trainerRecord = await this.trainer.findOne({
      where: { user_id: trainer.id },
    });
    if (!trainerRecord) throw new HttpException(404, 'Invalid Request');
    const liveStream = await this.liveStream.findAndCountAll({
      where: DB.Sequelize.or({ title: { [searchCondition]: search } }),

      include: [
        {
          model: this.user,
          where: {
            id: trainerRecord.user_id,
          },
        },
      ],
      limit: pageSize,
      offset: pageNo,
      order: [[`${sortBy}`, `${order}`]],
    });
    return { totalCount: liveStream.count, records: liveStream.rows };
  }
}
export default LiveStreamService;
