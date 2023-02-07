import { NextFunction, Request, Response } from 'express';
import { Reply } from '@/interfaces/reply.interface';
import ReplyService from '@/services/reply.service';

class Replycontroller {
  public replyService = new ReplyService();

  public addReply = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const replyDetail = req.body;
      const user = req.user;
      const file = req.files;
      const { commentId } = req.params;

      const response: Reply = await this.replyService.addReply({
        replyDetail,
        user: user,
        file,
        commentId,
      });
      res
        .status(200)
        .send({ response: response, message: 'Reply Successfully' });
    } catch (error) {
      next(error);
    }
  };

  public updateReply = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const { replyId} = req.params;
      const replyDetail = req.body;

      const file = req.files;
      replyDetail['id'] = replyId;

      const response = await this.replyService.updateReply({
        replyDetail,
        file,
      });
      res
        .status(200)
        .send({ response: response, message: 'Reply update Successfully' });
    } catch (err) {
      next(err);
    }
  };
  public deleteReply = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const { replyId } = req.params;
      const trainer = req.user;

      const response: { count: number } = await this.replyService.deleteReply({
        replyId,
        trainer,
      });
      res
        .status(200)
        .send({ response: response, message: 'Reply deleted Successfully' });
    } catch (error) {
      next(error);
    }
  };
}
export default Replycontroller;
