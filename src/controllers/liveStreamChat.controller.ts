import { LiveStreamChat } from '@/interfaces/liveStramChat.interface';
import LiveStreamChatService from '@/services/liveStreamChat.service';
import { NextFunction, Request, Response } from 'express';

class LiveStreamChatController {
  public liveStreamchatService = new LiveStreamChatService();

  public getLiveStreamChat = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const { livestreamId } = req.params;
      const loggedUser = req.user;

      const { search, pageRecord, pageNo, sortBy, order } = req.query;
      const queryObject = { search, pageRecord, pageNo, sortBy, order };

      const liveStreamChatResponse: LiveStreamChat =
        await this.liveStreamchatService.getLiveStreamChatMsg(
          livestreamId,
          loggedUser,
          queryObject
        );

      res.status(200).json({
        message: 'LiveStreamChat messages fetched successfully',
        data: liveStreamChatResponse,
      });
    } catch (err) {
      next(err);
    }
  };
  public sendLiveStreamChat = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const { livestreamId } = req.params;
      const messageDetails = req.body;
      const file = req.file;
      const loggedUser = req.user;

      const liveStreamChatResponse: LiveStreamChat =
        await this.liveStreamchatService.sendLiveStreamChat(
          livestreamId,
          messageDetails,
          loggedUser,
          file
        );

      res.status(200).json({
        message: 'Message sent successfully',
        data: liveStreamChatResponse,
      });
    } catch (err) {
      next(err);
    }
  };

  public deleteLiveStreamChat = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const { message_id } = req.params;
      const loggedUser = req.user;

      const liveStreamChatResponse: LiveStreamChat =
        await this.liveStreamchatService.deleteLiveStreamChat(
          message_id,
          loggedUser
        );

      res.status(200).json({
        message: 'Message deleted successfully',
        data: liveStreamChatResponse,
      });
    } catch (err) {
      next(err);
    }
  };
}
export default LiveStreamChatController;
