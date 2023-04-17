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

class LiveStreamService {
  public user = DB.User;
  public liveStream = DB.LiveStream;
  public trainer = DB.Trainer;
  public subscribeEvent = DB.SubscribeEvent;
  public livestreamchatlogs = DB.LiveStreamChatLogs;

  public isTrainer(user): boolean {
    return user.role === 'Instructor' || user.role === 'Admin';
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
    // const thumbnail = file;
    // const thumbnailPath = `${API_BASE}/media/${thumbnail.path
    //   .split('/')
    //   .splice(-2)
    //   .join('/')}`;
    const data = await this.liveStream.findAll({
      where: {
        userId: user.id,
        deletedAt: null,
      },
    });

    data.map((elem) => {
      const date = elem.date.toJSON().slice(0, 10);

      const time = elem.startTime;
      const startTime = moment(liveStreamDetails.startTime, 'HH:mm:ss').format(
        'HH:mm:ss'
      );
      const newTime = elem.endTime;
      const endTime = moment(liveStreamDetails.endTime, 'HH:mm:ss').format(
        'HH:mm:ss'
      );

      if (
        (date === liveStreamDetails.date &&
          time === startTime &&
          newTime === endTime) ||
        (startTime < newTime &&
          date === liveStreamDetails.date &&
          endTime === time)
      ) {
        throw new HttpException(
          409,
          'Event already exist at same date & time please change date & time and try again'
        );
      }
      if (startTime === endTime) {
        throw new HttpException(
          409,
          'Start time and end time is same please change time and try again'
        );
      }
    });

    const liveStream = await this.liveStream.create({
      ...liveStreamDetails,
      thumbnail: file.path,
      userId: user.id,
    });
    return liveStream;
  }
  public async viewLiveStream(user): Promise<{
    totalCount: number;
    records: (LiveStream | undefined)[];
  }> {
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
    const data = streamData.rows
      .filter((elem) => {
        const streamDate = moment(elem.date).format('YYYY-MM-DD');
        const streamEndTime = moment(elem.endTime, 'HH:mm:ss').format(
          'HH:mm:ss'
        );
        return (
          currentDate <= streamDate ||
          (currentDate === streamDate && currentTime <= streamEndTime)
        );
      })
      .map((elem) => elem);
    return { totalCount: data.length, records: data };
  }

  public async viewTodaysEvent(
    user
  ): Promise<{ totalCount: number; records: (LiveStream | undefined)[] }> {
    const currentDate = new Date().toJSON().slice(0, 10);
    const todaysEvent = await this.liveStream.findAndCountAll({
      include: {
        model: this.user,
      },
    });
    const data = [];
    todaysEvent.rows.map((elem) => {
      if (currentDate === elem.date.toJSON().slice(0, 10)) {
        data.push(elem);
      }
    });
    return { totalCount: data.length, records: data };
  }
  public async viewUpcommingEvent(
    user
  ): Promise<{ totalCount: number; records: (LiveStream | undefined)[] }> {
    const currentDate = new Date().toJSON().slice(0, 10);
    const todaysEvent = await this.liveStream.findAndCountAll({
      include: {
        model: this.user,
      },
    });
    const data = [];
    todaysEvent.rows.map((elem) => {
      if (elem.date.toJSON().slice(0, 10) > currentDate) {
        data.push(elem);
      }
    });
    return { totalCount: data.length, records: data };
  }

  public async viewLiveStreambyId(livestreamId): Promise<LiveStream> {
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
    const record = await this.liveStream.findOne({
      where: {
        id: livestreamId,
      },
    });
    if (!record) throw new HttpException(404, 'No stream Found');

    const data = await this.liveStream.findAll({
      where: {
        userId: user.id,
        deletedAt: null,
      },
    });

    data.map((elem) => {
      const date = elem.date.toJSON().slice(0, 10);

      const time = elem.startTime;
      const startTime = moment(livestreamDetails.startTime, 'HH:mm:ss').format(
        'HH:mm:ss'
      );
      const newTime = elem.endTime;
      const endTime = moment(livestreamDetails.endTime, 'HH:mm:ss').format(
        'HH:mm:ss'
      );
      if (
        (date === livestreamDetails.date &&
          time === startTime &&
          newTime === endTime) ||
        (startTime < newTime && date === livestreamDetails.date)
        //  &&
        // endTime === time)
      ) {
        throw new HttpException(
          409,
          'Event already exist at same date & time please change date & time and try again'
        );
      }
      if (startTime === endTime) {
        throw new HttpException(
          409,
          'Start time and end time is same please change time and try again'
        );
      }
    });

    if (
      user.id !== record.userId &&
      user.id !== record.instituteId &&
      user.role !== 'Admin'
    )
      throw new HttpException(403, "You don't have Authority to Update Event");
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

    if (
      user.id !== record.userId &&
      user.id !== record.instituteId &&
      user.role !== 'Admin'
    )
      throw new HttpException(403, "You don't have Authority to Delete Event");

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
      ],
      limit: pageSize,
      offset: pageNo,
      order: [[`${sortBy}`, `${order}`]],
    });
    // liveStreamData.rows.map((elem) => {
    //   elem.startTime = convertTimeTo12Hour(elem.startTime);
    //   elem.endTime = convertTimeTo12Hour(elem.endTime);
    // });
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
      ],
      limit: pageSize,
      offset: pageNo,
      order: [[`${sortBy}`, `${order}`]],
    });
    return { totalCount: liveStream.count, records: liveStream.rows };
  }
  public async getUserTimeLogByEventId(
    livestreamId,
    queryObject,
    trainer
  ): Promise<{ totalCount: number; records: LiveStreamUserRecord[] }> {
    const order = queryObject.order || 'ASC';

    // pagination
    const pageSize = queryObject.pageRecord ? queryObject.pageRecord : 10;
    const pageNo = queryObject.pageNo ? (queryObject.pageNo - 1) * pageSize : 0;
    // Search
    const [search, searchCondition] = queryObject.search
      ? [`%${queryObject.search}%`, DB.Sequelize.Op.iLike]
      : ['', DB.Sequelize.Op.ne];
    if (!this.isTrainer(trainer)) {
      throw new HttpException(403, 'Forbidden Resource');
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
    if (record === 1)
      throw new HttpException(200, 'Attendence Deleted Successfully');
    if (record === 0) throw new HttpException(404, 'No Data found');

    return { count: record };
  }
}
export default LiveStreamService;
