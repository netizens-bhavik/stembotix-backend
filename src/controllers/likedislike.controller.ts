import { NextFunction, Request, Response } from 'express';
import LikeDislikeService from '@/services/likedislike.service';
import DB from '@/databases';
import { LikeDislike } from '@/interfaces/likedislike.interface';

class LikeDislikeController {
  public likeDislikeService = new LikeDislikeService();
  public likedislike = DB.LikeDislike;
  public user = DB.User;
  public comment = DB.Comment;

  public addLike = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const user = req.user;
      const response = await this.likeDislikeService.addLikeDislike({
        comment_id: req.params.comment_id,
        user: user,
      });
      res.status(200).send(response);
    } catch (error) {
      next(error);
    }
  };
  
  public addLikeOnReply = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const user = req.user;
      const response = await this.likeDislikeService.addLikeDislikeOnReply({
        reply_id: req.params.reply_id,
        user: user,
      });
      res.status(200).send(response);
    } catch (error) {
      next(error);
    }
  };

  public listLike = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { comment_id } = req.params;
      const { search, pageRecord, pageNo, sortBy, order } = req.query;
      const queryObject = { search, pageRecord, pageNo, sortBy, order };
      const response: {
        totalCount: number;
        likes: (LikeDislike | undefined)[];
      } = await this.likeDislikeService.viewLike(queryObject, comment_id);
      res.status(200).send(response);
    } catch (error) {
      next(error);
    }
  };

  public listLikeOnReply = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { reply_id } = req.params;
      const { search, pageRecord, pageNo, sortBy, order } = req.query;
      const queryObject = { search, pageRecord, pageNo, sortBy, order };
      const response: {
        totalCount: number;
        likes: (LikeDislike | undefined)[];
      } = await this.likeDislikeService.viewLikeOnReply(queryObject, reply_id);
      res.status(200).send(response);
    } catch (error) {
      next(error);
    }
  };
}
export default LikeDislikeController;
