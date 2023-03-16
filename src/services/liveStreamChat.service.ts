import DB from '@databases';
import { HttpException } from '@exceptions/HttpException';
import { LiveStreamChat } from '@/interfaces/liveStramChat.interface';

class LiveStreamChatService {
  public user = DB.User;
  public liveStream = DB.LiveStream;
  public subscribeEvent = DB.SubscribeEvent;
  public liveStreamChat = DB.LiveStreamChat;

  public async sendLiveStreamChat(
    livestreamId: string,
    message: string,
    loggedUser
  ): Promise<LiveStreamChat> {
   
    const userId=loggedUser.id;

    const dbLiveStreamCheck = await this.liveStream.findOne({
      where: { id: livestreamId },
    });

    if (!dbLiveStreamCheck) {
      throw new HttpException(404, 'Event Not Found');
    }

    if (dbLiveStreamCheck.userId !== userId) {
      const subscribeEvent = await this.subscribeEvent.findOne({
        where: { user_id: loggedUser.id, livestream_id: livestreamId },
      });
  
      if (!subscribeEvent) {
        throw new HttpException(
          400,
          'User is not subscribed to this livestream'
        );
      }
      var subscribeEventId = subscribeEvent.id ?? null;
    }
    const loggedUserId = loggedUser.id;

    const sendLiveStreamChatMsg = await this.liveStreamChat.create({
      messages: message,
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

  public async deleteLiveStreamChat(
    message_id,
    loggedUser
  ): Promise<LiveStreamChat> {
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
    livestreamId: string
  ): Promise<LiveStreamChat> {
    const getLiveStreamChatMsg = await this.liveStreamChat.findAndCountAll({
      where: { livestreamId: livestreamId, deletedAt: null },
      include: [
        {
          model: this.user,
        },
      ],
      attributes: ['id', 'messages', 'userId', 'createdAt'],
      order: [['createdAt', 'ASC']],
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
