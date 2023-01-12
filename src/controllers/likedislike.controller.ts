import { NextFunction, Request, Response } from 'express';
import { LikeDislike } from '@/interfaces/likedislike.interface';
import LikeDislikeService from '@/services/likedislike.service';
import DB from '@/databases';
import { timeStamp } from 'console';

class LikeDislikeController {
  public likeDislikeService = new LikeDislikeService();
  public likedislike = DB.LikeDislike;
  public user = DB.User;
  public comment = DB.Comment;

  public addLike = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const user = req.user;
      const { comment_id } = req.params;
      const record = await this.likedislike.findOne({
        where: {
          comment_id: comment_id,
        },
        include: [
          {
            model: this.user,
          },
        ],
      });
      if (!record) {
        const newlikeDislike = await this.likeDislikeService.addLikeDislike;
        ({
          comment_id: req.params.id,
          user_id: user,
        });
        return res.json(newlikeDislike);
      } else {
        await this.likedislike.destroy();
        return res.send();
      }
    } catch (error) {
    }
  };
}
export default LikeDislikeController;
