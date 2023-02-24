import DB from '@databases';
import { HttpException } from '@exceptions/HttpException';
import { isEmpty } from '@utils/util';
import { LiveStreamChatDTO } from '@/dtos/livestreamchat.dto';
import crypto from 'crypto';
import { API_BASE } from '@/config';
import { LiveStreamChat } from '@/interfaces/liveStramChat.interface';

class LiveStreamChatService {
  public user = DB.User;
  public liveStream = DB.LiveStream;
  public subscribeEvent = DB.SubscribeEvent;
  public liveStreamChat = DB.LiveStreamChat;

  public async sendLiveStreamChat(
    livestreamId,
    messageDetails,
    loggedUser,
    file
  ): Promise<LiveStreamChat> {
    const subscribeEvent = await this.subscribeEvent.findOne({
      where: { user_id: loggedUser.id, livestream_id: livestreamId },
    });
    if (!subscribeEvent) {
      throw new HttpException(404, 'User not subscribed to this LiveStream');
    }
    const loggedUserId = loggedUser.id;
    const subscribeEventId = subscribeEvent.id;
    const thumbnail = file;
    if (thumbnail) {
      const thumbnailPath = `${API_BASE}/media/${thumbnail.path
        .split('/')
        .splice(-2)
        .join('/')}`;
      subscribeEvent.thumbnail = thumbnailPath;
    }
    const sendLiveStreamChatMsg = await this.liveStreamChat.create({
      messages: messageDetails,
      userId: loggedUserId,
      subscribeEventId: subscribeEventId,
      livestreamId: livestreamId,
    });

    if (!sendLiveStreamChatMsg) {
      throw new HttpException(500, 'Something went wrong');
    }
    return {
      message: sendLiveStreamChatMsg.messages,
    };
  }

  public async deleteLiveStreamChat(message_id, loggedUser): Promise<LiveStreamChat> {
    const liveStreamChat = await this.liveStreamChat.findOne({
      where: { id: message_id },
    });
    if (!liveStreamChat) {
      throw new HttpException(404, 'Message not found');
    }
    if (liveStreamChat.userId !== loggedUser.id && loggedUser.role !== 'Admin')
      throw new HttpException(
        403,
        'You are not allowed to delete this message'
      );

    const deleteLiveStreamChatMsg = await this.liveStreamChat.destroy({
      where: { id: message_id },
    });
    if (!deleteLiveStreamChatMsg) {
      throw new HttpException(500, 'Something went wrong');
    }
    return {
      message: 'Message deleted successfully',
    };
  }
  public async getLiveStreamChatMsg(
    livestreamId,
    loggedUser,
    queryObject
  ): Promise<LiveStreamChat> {
    const sortBy = queryObject.sortBy ? queryObject.sortBy : 'createdAt';
    const order = queryObject.order === 'DESC' ? 'DESC' : 'ASC';
    // pagination
    const pageSize = queryObject.pageRecord ? queryObject.pageRecord : 10;
    const pageNo = queryObject.pageNo ? (queryObject.pageNo - 1) * pageSize : 0;
    // Search
    const [search, searchCondition] = queryObject.search
      ? [`%${queryObject.search}%`, DB.Sequelize.Op.like]
      : ['', DB.Sequelize.Op.ne];

    const subscribeEvent = await this.subscribeEvent.findOne({
      where: { user_id: loggedUser.id, livestream_id: livestreamId },
    });
    if (!subscribeEvent) {
      throw new HttpException(404, 'User not subscribed to this LiveStream');
    }
    const loggedUserId = loggedUser.id;
    const subscribeEventId = subscribeEvent.id;

    const getLiveStreamChatMsg = await this.liveStreamChat.findAndCountAll({
      //  where: { subscribeEventId: subscribeEventId, deletedAt: null },
      include: [
        {
          model: this.user,
          attributes: ['id', 'firstName', 'lastName', 'email'],
        },
      ],
      attributes: ['id', 'messages', 'userId', 'subscribeEventId'],

      where: DB.Sequelize.and(
        { messages: { [searchCondition]: search } },
        { livestreamId: livestreamId, deletedAt: null }
      ),
      limit: pageSize,
      offset: pageNo,
      order: [[`${sortBy}`, `${order}`]],
    });
    if (!getLiveStreamChatMsg) {
      throw new HttpException(500, 'Something went wrong');
    }
    return {
      message: getLiveStreamChatMsg,
    };
  }
}
export default LiveStreamChatService;
