import { NextFunction, Request, Response } from 'express';
import LikeDislikeService from '@/services/likedislike.service';
import DB from '@/databases';

class LikeDislikeController {
  public likeDislikeService = new LikeDislikeService();
  public likedislike = DB.LikeDislike;
  public user = DB.User;
  public comment = DB.Comment;

  public addLike = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const user = req.user;
      const response = this.likeDislikeService.addLikeDislike({
        comment_id: req.params.comment_id,
        user: user,
        isLike: req.body.isLike,
      });
      res.status(200).send(response); 
    } catch (error) {
      next(error);
    }
  };

  public getLIkeDislike
}
export default LikeDislikeController;
