import DB from '@databases';
import { HttpException } from '@exceptions/HttpException';
import { isEmpty } from '@utils/util';
import { LiveStreamChatDTO } from '@/dtos/livestreamchat.dto';
import crypto from 'crypto';
import { Op } from 'sequelize';
import EmailService from './email.service';
import { Mail, MailPayloads } from '@/interfaces/mailPayload.interface';

class LiveStreamChatLogsService {
  public user = DB.User;
  public liveStream = DB.LiveStream;
  public subscribeEvent = DB.SubscribeEvent;
  public liveStreamChatLogs = DB.LiveStreamChatLogs;
  public emailService = new EmailService();

  public async newUserJoined(data) {
    // try {
      const { livestreamId, userId, socketId } = data;

      if (isEmpty(livestreamId) || isEmpty(userId))
        throw new HttpException(400, "LivestreamId or UserId can't be empty");

      const dbLiveStreamCheck = await this.liveStream.findOne({
        where: { id: livestreamId },
      });

      if (!dbLiveStreamCheck) {
        throw new HttpException(404, 'Event Not Found');
      }

      if (dbLiveStreamCheck.userId !== userId) {
        const subscribeEvent = await this.subscribeEvent.findOne({
          where: {
            livestreamId,
            userId,
          },
        });
        if (!subscribeEvent) {
          throw new HttpException(
            400,
            'User is not subscribed to this livestream'
          );
        }
        var subscribeEventId = subscribeEvent.id ?? null;
      }

      const [liveStreamChatLogs, created] =
        await this.liveStreamChatLogs.findOrCreate({
          where: { livestreamId, userId },
          defaults: {
            livestreamId,
            userId,
            socketId,
            subscribeEventId: subscribeEventId,
            isOnline: true,
          },
        });

      if (!created) {
        await this.liveStreamChatLogs.update(
          { isOnline: true, socketId },
          { where: { livestreamId, userId } }
        );
      }
      // return liveStreamChatLogs;
    // } catch (err) {
    //   console.log(err);
    // }

    if (created) {
      const liveStream = await this.liveStream.findByPk(livestreamId);
      if (userId == liveStream.userId) {
        const subscribedUsers = await this.subscribeEvent.findAll({
          where: {
            livestreamId,
            payment_id: {
              [Op.ne]: null,
            },
            razorpay_signature: {
              [Op.ne]: null,
            },
            razorpay_order_id: {
              [Op.ne]: null,
            },
          },
          include: [
            {
              model: this.user,
              attributes: ['id', 'firstName', 'lastName', 'email', 'fullName'],
            },
          ],
        });
        const mailData = {
          templateData: {
            eventName: liveStream.title,
          },
          mailData: {
            to: subscribedUsers.map((user) => user.User.email),
          },
        };
        this.emailService.sendEventStartNotification(mailData);
      }
    }
    return liveStreamChatLogs;
  }

  public async userDisconnected(data) {
    const { socketId } = data;

    var liveStreamChatLogsData = await this.liveStreamChatLogs.update(
      { isOnline: false },
      { where: { socketId } }
    );

    const liveStreamChatLogs = await this.liveStreamChatLogs.findOne({
      where: { socketId },
      attributes: ['livestreamId'],
    });

    return liveStreamChatLogs?.livestreamId;
  }

  public async fetchActiveLiveStreamUsers(livestreamId) {
    if (isEmpty(livestreamId))
      throw new HttpException(400, "LivestreamId can't be empty");

    const dbLiveStream = await this.liveStream.findByPk(livestreamId);
    if (!dbLiveStream) {
      throw new HttpException(400, 'Livestream not found');
    }

    const instructor = await this.user.findByPk(dbLiveStream.userId);
    if (!instructor) {
      throw new HttpException(400, 'Instructor not found');
    }

    const liveStreamChatLogs = await this.liveStreamChatLogs.findAll({
      where: { livestreamId, isOnline: true },
      include: [
        {
          model: this.user,
        },
      ],
    });
    return { instructor: instructor, allusers: liveStreamChatLogs };
  }
}
export default LiveStreamChatLogsService;
