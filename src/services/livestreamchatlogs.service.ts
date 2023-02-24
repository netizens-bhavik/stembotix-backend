import DB from '@databases';
import { HttpException } from '@exceptions/HttpException';
import { isEmpty } from '@utils/util';
import { LiveStreamChatDTO } from '@/dtos/livestreamchat.dto';
import crypto from 'crypto';

class LiveStreamChatLogsService {
  public user = DB.User;
  public liveStream = DB.LiveStream;
  public subscribeEvent = DB.SubscribeEvent;
  public liveStreamChatLogs = DB.LiveStreamChatLogs;

  public async newUserJoined(data) {
    const { livestreamId, userId, socketId } = data;

    if (isEmpty(livestreamId) || isEmpty(userId))
      throw new HttpException(400, "LivestreamId or UserId can't be empty");

    const subscribeEvent = await this.subscribeEvent.findOne({
      where: { livestreamId, userId },
    });

    if (!subscribeEvent) {
      throw new HttpException(400, 'User is not subscribed to this livestream');
    }

    const [liveStreamChatLogs, created] =
      await this.liveStreamChatLogs.findOrCreate({
        where: { livestreamId, userId },
        defaults: {
          livestreamId,
          userId,
          socketId,
          subscribeEventId: subscribeEvent.id,
          isOnline: true,
        },
      });

    if (!created) {
      await this.liveStreamChatLogs.update(
        { isOnline: true, socketId },
        { where: { livestreamId, userId } }
      );
    }

    //console.log('newUserJoined', liveStreamChatLogs);
    return liveStreamChatLogs;
  }

  public async userDisconnected(data) {
    const { socketId } = data;
    var res = '';

    if (isEmpty(socketId)) res = 'SocketId can not be empty';

    var liveStreamChatLogsData = await this.liveStreamChatLogs.update(
      { isOnline: false },
      { where: { socketId } }
    );

    //get liveStreamId from liveStreamChatLogsData
    const liveStreamChatLogs = await this.liveStreamChatLogs.findOne({
      where: { socketId },
      attributes: ['livestreamId'],
    });

    return liveStreamChatLogs?.livestreamId;
  }

  public async fetchActiveLiveStreamUsers(livestreamId) {
    if (isEmpty(livestreamId))
      throw new HttpException(400, "LivestreamId can't be empty");

    const liveStreamChatLogs = await this.liveStreamChatLogs.findAll({
      where: { livestreamId, isOnline: true },
      include: [
        {
          model: this.user,
          // attributes: ['id', 'first_name', 'last_name', 'email', 'role'],
        },
      ],
    });
    //console.log(liveStreamChatLogs);
    return liveStreamChatLogs;
  }
}
export default LiveStreamChatLogsService;
