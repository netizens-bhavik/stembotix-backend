import DB from '@databases';
import { HttpException } from '@exceptions/HttpException';
import { isEmpty } from '@utils/util';
import { LiveStreamChatDTO } from '@/dtos/livestreamchat.dto';
import crypto from 'crypto';
import fs from 'fs';
import { API_BASE } from '@/config';
import path from 'path';

class LiveStreamChatService {
  public user = DB.User;
  public liveStream = DB.LiveStream;
  public subscribeEvent = DB.SubscribeEvent;
  public liveStreamChat = DB.LiveStreamChat;

  public async sendLiveStreamChat(
    livestreamId: string,
    message: string,
    loggedUser: any
  ): Promise<any> {
    const subscribeEvent = await this.subscribeEvent.findOne({
      where: { user_id: loggedUser.id, livestream_id: livestreamId },
    });
    if (!subscribeEvent) {
      throw new HttpException(404, 'User not subscribed to this LiveStream');
    }
    const loggedUserId = loggedUser.id;
    const subscribeEventId = subscribeEvent.id;

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

  public async deleteLiveStreamChat(message_id, loggedUser): Promise<any> {
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
    livestreamId: string,
    loggedUser,
    queryObject
  ): Promise<any> {
    const subscribeEvent = await this.subscribeEvent.findOne({
      where: { user_id: loggedUser.id, livestream_id: livestreamId },
    });
    if (!subscribeEvent) {
      throw new HttpException(404, 'User not subscribed to this LiveStream');
    }

    const getLiveStreamChatMsg = await this.liveStreamChat.findAndCountAll({
      where: { livestreamId: livestreamId, deletedAt: null },
      include: [
        {
          model: this.user,
          attributes: ['id', 'firstName', 'lastName', 'email'],
        },
      ],
      attributes: ['id', 'messages', 'userId', 'subscribeEventId'],
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
