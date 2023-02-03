import { NextFunction, Request, Response } from 'express';
import LikeDislikeService from '@/services/likedislike.service';
import DB from '@/databases';
import { LikeDislike } from '@/interfaces/likedislike.interface';

class LikeDislikeController {
  public likeDislikeService = new LikeDislikeService();
  public likedislike = DB.LikeDislike;
  public user = DB.User;
  public comment = DB.Comment;

  public addLikeDislikeOnComment = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const user = req.user;
      const response = await this.likeDislikeService.addLikeDislikeOnComment({
        comment_id: req.params.commentId,
        user: user,
      });
      res.status(200).send(response);
    } catch (error) {
      next(error);
    }
  };
  
  public addLikeDislikeOnReply = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const user = req.user;
      const response = await this.likeDislikeService.addLikeDislikeOnReply({
        reply_id: req.params.replyId,
        user: user,
      });
      res.status(200).send(response);
    } catch (error) {
      next(error);
    }
  };

  public  viewLikeonComment = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { commentId } = req.params;
      const { search, pageRecord, pageNo, sortBy, order } = req.query;
      const queryObject = { search, pageRecord, pageNo, sortBy, order };
      const response: {
        totalCount: number;
        likes: (LikeDislike | undefined)[];
      } = await this.likeDislikeService. viewLikeonComment(queryObject, commentId);
      res.status(200).send(response);
    } catch (error) {
      next(error);
    }
  };

  public viewLikeOnReply = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { replyId } = req.params;
      const { search, pageRecord, pageNo, sortBy, order } = req.query;
      const queryObject = { search, pageRecord, pageNo, sortBy, order };
      const response: {
        totalCount: number;
        likes: (LikeDislike | undefined)[];
      } = await this.likeDislikeService.viewLikeOnReply(queryObject, replyId);
      res.status(200).send(response);
    } catch (error) {
      next(error);
    }
  };
}
export default LikeDislikeController;
