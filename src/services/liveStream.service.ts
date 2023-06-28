import DB from '@databases';
import { HttpException } from '@exceptions/HttpException';
import { isEmpty } from '@utils/util';
// import 'reflect-metadata';
import { API_BASE } from '@config';
import {
  LiveStream,
  LiveStreamUserRecord,
} from '@/interfaces/liveStream.interface';
import convertTimeTo12Hour from '@utils/timeStamp/timestamp';
import { deleteFromS3 } from '@/utils/s3/s3Uploads';
import moment from 'moment';
import { RedisFunctions } from '@/redis';

class LiveStreamService {
  public user = DB.User;
  public liveStream = DB.LiveStream;
  public liveStreamCat = DB.LiveStreamCat;
  public trainer = DB.Trainer;
  public subscribeEvent = DB.SubscribeEvent;
  public livestreamchatlogs = DB.LiveStreamChatLogs;
  public redisFunctions = new RedisFunctions();

  public isTrainer(user): boolean {
    return user.role === 'Instructor' || user.role === 'SuperAdmin';
  }
  public isAdmin(user): boolean {
    return (
      user.role === 'Instructor' ||
      user.role === 'SuperAdmin' ||
      user.role === 'Admin'
    );
  }
  public isUser(user): boolean {
    return user.role === 'Student';
  }
  public async createLiveStream({
    file,
    user,
    liveStreamDetails,
  }): Promise<LiveStream> {
    if (!this.isTrainer(user)) {
      throw new HttpException(404, "You don't have Authority to Create Event");
    }

    const { startTime, endTime, date } = liveStreamDetails;

    const currentTime = moment().format('HH:mm');
    const currentDate = moment().format('YYYY-MM-DD');
    if (startTime === endTime) {
      throw new HttpException(
        409,
        'Start time and end time are the same. Please change the time and try again.'
      );
    }

    if (startTime <= currentTime && date === currentDate) {
      throw new HttpException(409, 'Past time is not allowed');
    }

    const data = await this.liveStream.findAndCountAll({
      where: {
        userId: user.id,
        deletedAt: null,
      },
    });
    if (data.count > 0) {
      const eventsExist = await Promise.all(
        data.rows.map(async (elem) => {
          const eventDate = elem.date.toJSON().slice(0, 10);
          const eventStartTime = moment(elem.startTime, 'HH:mm:ss').format(
            'HH:mm'
          );
          const eventEndTime = moment(elem.endTime, 'HH:mm:ss').format('HH:mm');

          if (date > eventDate || date < eventDate) {
            return false;
          }

          if (date === eventDate) {
            if (
              startTime === eventEndTime ||
              startTime > eventEndTime ||
              endTime === eventStartTime ||
              endTime > eventEndTime
            ) {
              return false;
            }
            if (
              startTime < eventStartTime &&
              (endTime < eventStartTime || endTime < eventStartTime)
            ) {
              return false;
            }
          }
          return true;
        })
      );
      if (eventsExist.some(Boolean)) {
        throw new HttpException(
          409,
          'Event already exists at the same date & time. Please change the date & time and try again.'
        );
      }
    }

    const liveStream = await this.liveStream.create({
      ...liveStreamDetails,
      thumbnail: file.path,
      userId: user.id,
    });
    await this.redisFunctions.removeDataFromRedis();
    return liveStream;
  }

  public async viewLiveStream(user): Promise<{
    totalCount: number;
    records: (LiveStream | undefined)[];
  }> {
    const cacheKey = `viewLiveStream:${user?.id}`;
    const cachedData = await this.redisFunctions.getRedisKey(cacheKey);
    if (cachedData) {
      return cachedData;
    }
    const currentDate = moment().format('YYYY-MM-DD');
    const currentTime = moment().format('HH:mm:ss');
    const streamData = await this.liveStream.findAndCountAll({
      where: {},
      include: {
        model: this.user,
      },
      order: [
        ['date', 'ASC'],
        ['startTime', 'ASC'],
      ],
    });
    const data = [];
    streamData.rows.map((elem) => {
      const streamDate = moment(elem.date).format('YYYY-MM-DD');
      const streamEndTime = moment(elem.endTime, 'HH:mm:ss').format('HH:mm:ss');

      if (
        streamDate > currentDate ||
        (streamDate === currentDate && streamEndTime >= currentTime)
      ) {
        data.push(elem);
      }
    });
    await this.redisFunctions.setKey(
      cacheKey,
      JSON.stringify({
        totalCount: data.length,
        records: data,
      })
    );
    return { totalCount: data.length, records: data };
  }

  public async viewTodaysEvent({
    queryObject,
  }): Promise<{ totalCount: number; records: (LiveStream | undefined)[] }> {
    // pagination
    const pageSize = queryObject.pageRecord ? queryObject.pageRecord : 10;
    const pageNo = queryObject.pageNo ? (queryObject.pageNo - 1) * pageSize : 0;

    const cacheKey = `viewTodaysEvent:${pageSize}:${pageNo}`;
    const cachedData = await this.redisFunctions.getRedisKey(cacheKey);
    if (cachedData) {
      return cachedData;
    }
    const currentDate = new Date().toJSON().slice(0, 10);
    const currentTime = moment().format('HH:mm:ss');
    const todaysEvent = await this.liveStream.findAndCountAll({
      include: {
        model: this.user,
      },
      order: [
        ['date', 'ASC'],
        ['startTime', 'ASC'],
      ],
      limit: pageSize,
      offset: pageNo,
    });
    const data = [];
    todaysEvent.rows.map((elem) => {
      const streamEndTime = moment(elem.endTime, 'HH:mm:ss').format('HH:mm:ss');

      if (
        currentDate === elem.date.toJSON().slice(0, 10) &&
        streamEndTime >= currentTime
      ) {
        data.push(elem);
      }
    });
    await this.redisFunctions.setKey(
      cacheKey,
      JSON.stringify({
        totalCount: data.length,
        records: data,
      })
    );
    return { totalCount: data.length, records: data };
  }
  public async viewUpcommingEvent({
    queryObject,
  }): Promise<{ totalCount: number; records: object }> {
    // pagination
    const pageSize = queryObject.pageRecord ? queryObject.pageRecord : 10;
    const pageNo = queryObject.pageNo ? (queryObject.pageNo - 1) * pageSize : 0;

    const cacheKey = `viewUpcommingEvent:${pageSize}:${pageNo}`;
    const cachedData = await this.redisFunctions.getRedisKey(cacheKey);
    if (cachedData) {
      return cachedData;
    }
    const currentDate = new Date().toJSON().slice(0, 10);
    // const currentTime = moment().format('HH:mm:ss');
    const todaysEvent = await this.liveStream.findAndCountAll({
      include: {
        model: this.user,
      },
      order: [
        ['date', 'ASC'],
        ['startTime', 'ASC'],
      ],
      limit: pageSize,
      offset: pageNo,
    });
    const data = [];
    todaysEvent.rows.map((elem) => {
      // const streamEndTime = moment(elem.endTime, 'HH:mm:ss').format('HH:mm:ss');
      const date = elem.date.toJSON().slice(0, 10);
      if (currentDate < date) {
        data.push(elem);
      }
    });
    await this.redisFunctions.setKey(
      cacheKey,
      JSON.stringify({
        totalCount: data.length,
        records: data,
      })
    );
    return { totalCount: data.length, records: data };
  }

  public async viewLiveStreambyId(livestreamId): Promise<LiveStream> {
    const cacheKey = `viewLiveStreambyId:${livestreamId}`;
    const cachedData = await this.redisFunctions.getRedisKey(cacheKey);
    if (cachedData) {
      return cachedData;
    }
    const streamData = await this.liveStream.findOne({
      where: {
        id: livestreamId,
      },
      include: [
        {
          model: this.user,
        },
        {
          model: this.user,
          as: 'Institute',
        },
      ],
    });
    if (!streamData) throw new HttpException(400, 'No event found');
    streamData.startTime = convertTimeTo12Hour(streamData.startTime);
    streamData.endTime = convertTimeTo12Hour(streamData.endTime);
    await this.redisFunctions.setKey(cacheKey, JSON.stringify(streamData));
    return streamData;
  }
  public async updateLiveStream({
    livestreamDetails,
    file,
    user,
    livestreamId,
  }): Promise<{ count: number; rows: LiveStream[] }> {
    if (this.isUser(user) || !user.isEmailVerified)
      throw new HttpException(403, "You don't have Authority to Update Event");
    const { startTime, endTime } = livestreamDetails;
    const date = moment(livestreamDetails.date).format('YYYY-MM-DD');

    const currentTime = moment().format('HH:mm:ss');
    const currentDate = moment().format('YYYY-MM-DD');

    if (startTime === endTime) {
      throw new HttpException(
        409,
        'Start time and end time are the same. Please change the time and try again.'
      );
    }
    if (startTime <= currentTime && date === currentDate) {
      throw new HttpException(409, 'Past time is not allowed');
    }

    const record = await this.liveStream.findOne({
      where: {
        id: livestreamId,
        deletedAt: null,
      },
    });
    if (!record) throw new HttpException(404, 'No stream Found');

    const data = await this.liveStream.findAndCountAll({
      where: {
        userId: user.id,
        deletedAt: null,
      },
    });
    if (data.count > 0) {
      const eventsExist = await Promise.all(
        data.rows.map(async (elem) => {
          const eventDate = elem.date.toJSON().slice(0, 10);
          const eventStartTime = moment(elem.startTime, 'HH:mm:ss').format(
            'HH:mm'
          );
          const eventEndTime = moment(elem.endTime, 'HH:mm:ss').format('HH:mm');

          if (date > eventDate) {
            return false;
          }
          if (date === eventDate) {
            if (
              startTime === eventEndTime ||
              startTime > eventEndTime ||
              endTime === eventStartTime ||
              endTime > eventEndTime
            ) {
              return false;
            }
            if (
              startTime < eventStartTime &&
              (endTime < eventStartTime || endTime < eventStartTime)
            ) {
              return false;
            }
          }
          return true;
        })
      );

      if (eventsExist.some(Boolean)) {
        throw new HttpException(
          409,
          'Event already exists at the same date & time. Please change the date & time and try again.'
        );
      }
    }
    // if (
    //   user.id !== record.userId ||
    //   // user.id !== record.instituteId ||
    //   user.role !== 'SuperAdmin' ||
    //   user.role !== 'Admin'
    // )
    //   throw new HttpException(409, "You don't have Authority to Update Event");
    if (file) {
      const thumbnailLink = record.thumbnail;
      const fileName = thumbnailLink.split('/');
      await deleteFromS3(fileName[3]);

      const updateLiveStream = await this.liveStream.update(
        {
          ...livestreamDetails,
          thumbnail: file?.path,
        },
        {
          where: {
            id: livestreamId,
          },
          returning: true,
        }
      );
      await this.redisFunctions.removeDataFromRedis();
      return { count: updateLiveStream[0], rows: updateLiveStream[1] };
    }
    // const thumbnail = file;
    // if (thumbnail) {
    //   const thumbnailPath = `${API_BASE}/media/${thumbnail.path
    //     .split('/')
    //     .splice(-2)
    //     .join('/')}`;
    //   livestreamDetails.thumbnail = thumbnailPath;
    // }
    const updateLiveStream = await this.liveStream.update(
      {
        ...livestreamDetails,
      },
      {
        where: {
          id: livestreamId,
        },
        returning: true,
      }
    );
    await this.redisFunctions.removeDataFromRedis();
    return { count: updateLiveStream[0], rows: updateLiveStream[1] };
  }

  public async deleteLiveStream({
    user,
    livestreamId,
  }): Promise<{ count: number }> {
    if (this.isUser(user))
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
    if (!record) throw new HttpException(404, 'No Record Found');

    // if (
    //   user.id !== record.userId &&
    //   user.id !== record.instituteId &&
    //   user.role !== 'Admin'
    // )
    //   throw new HttpException(403, "You don't have Authority to Delete Event");

    const thumbnailLink = record.thumbnail;
    const fileName = thumbnailLink.split('/');
    await deleteFromS3(fileName[3]);

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
    await this.redisFunctions.removeDataFromRedis();
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

    const cacheKey = `viewLiveStreamByAdmin:${sortBy}:${order}:${pageSize}:${pageNo}:${search}`;
    const cachedData = await this.redisFunctions.getRedisKey(cacheKey);
    if (cachedData) {
      return cachedData;
    }
    const liveStreamData = await this.liveStream.findAndCountAll({
      where: DB.Sequelize.and(
        { deletedAt: null },
        { title: { [searchCondition]: search } }
      ),
      include: [
        { model: this.user },
        {
          model: this.user,
          as: 'Institute',
        },
        {
          model: this.liveStreamCat,
        },
      ],
      limit: pageSize,
      offset: pageNo,
      order: [[`${sortBy}`, `${order}`]],
    });
    await this.redisFunctions.setKey(
      cacheKey,
      JSON.stringify({
        totalCount: liveStreamData.count,
        records: liveStreamData.rows,
      })
    );
    return { totalCount: liveStreamData.count, records: liveStreamData.rows };
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

    const cacheKey = `listLiveEvent:${sortBy}:${order}:${pageSize}:${pageNo}:${search}`;
    const cachedData = await this.redisFunctions.getRedisKey(cacheKey);
    if (cachedData) {
      return cachedData;
    }
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
        {
          model: this.user,
          as: 'Institute',
        },
        {
          model: this.liveStreamCat,
        },
      ],
      limit: pageSize,
      offset: pageNo,
      order: [[`${sortBy}`, `${order}`]],
    });
    await this.redisFunctions.setKey(
      cacheKey,
      JSON.stringify({
        totalCount: liveStream.count,
        records: liveStream.rows,
      })
    );
    return { totalCount: liveStream.count, records: liveStream.rows };
  }
  public async getUserTimeLogByEventId(
    livestreamId,
    queryObject,
    trainer
  ): Promise<{ totalCount: number; records: LiveStreamUserRecord[] }> {
    if (!this.isAdmin(trainer)) {
      throw new HttpException(403, 'Forbidden Resource');
    }

    const order = queryObject.order || 'ASC';

    // pagination
    const pageSize = queryObject.pageRecord ? queryObject.pageRecord : 10;
    const pageNo = queryObject.pageNo ? (queryObject.pageNo - 1) * pageSize : 0;
    // Search
    const [search, searchCondition] = queryObject.search
      ? [`%${queryObject.search}%`, DB.Sequelize.Op.iLike]
      : ['', DB.Sequelize.Op.ne];
    const cacheKey = `getUserTimeLogByEventId:${livestreamId}`;
    const cachedData = await this.redisFunctions.getRedisKey(cacheKey);
    if (cachedData) {
      return cachedData;
    }

    const response = await this.livestreamchatlogs.findAndCountAll({
      where: { livestream_id: livestreamId },
      include: [
        {
          model: this.user,
          attributes: ['fullName', 'firstName', 'lastName', 'email'],
          where: DB.Sequelize.or(
            {
              firstName: { [searchCondition]: search },
            },
            {
              lastName: { [searchCondition]: search },
            }
          ),
        },
      ],
      limit: pageSize,
      offset: pageNo,
      order: [
        [{ model: this.user }, 'firstName', order],
        [{ model: this.user }, 'lastName', order],
      ],
    });
    await this.redisFunctions.setKey(
      cacheKey,
      JSON.stringify({
        totalCount: response.count,
        records: response.rows,
      })
    );
    return { totalCount: response.count, records: response.rows };
  }
  public async deleteUserAttendance(
    livestreamchatlogsId,
    trainer
  ): Promise<{ count: number }> {
    if (!this.isTrainer(trainer))
      throw new HttpException(401, "You don't have Authority to Delete Event");
    const record = await this.livestreamchatlogs.destroy({
      where: { id: livestreamchatlogsId },
    });
    await this.redisFunctions.removeDataFromRedis();
    if (record === 1)
      throw new HttpException(200, 'Attendence Deleted Successfully');
    if (record === 0) throw new HttpException(404, 'No Data found');

    return { count: record };
  }
}
export default LiveStreamService;
