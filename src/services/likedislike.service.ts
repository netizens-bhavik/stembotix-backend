import DB from '@databases';
import { LikeDislike } from '@/interfaces/likedislike.interface';

export type LikeDislikeType = {
  record: LikeDislike;
  message: string;
};

class LikeDislikeService {
  public comment = DB.Comment;
  public user = DB.User;
  public likedislike = DB.LikeDislike;

  public async addLikeDislikeOnComment(
    likeDislikeDetails
  ): Promise<LikeDislikeType> {
    let message = 'Like Successfuly';
    const [record, isCreated] = await this.likedislike.findOrCreate({
      where: {
        comment_id: likeDislikeDetails.comment_id,
        user_id: likeDislikeDetails.user.id,
      },
    });
    if (!isCreated) {
      await this.likedislike.destroy({
        where: {
          comment_id: likeDislikeDetails.comment_id,
          user_id: likeDislikeDetails.user.id,
        },
      });
      const deletedLike = await this.likedislike.findOne({
        where: {
          comment_id: likeDislikeDetails.comment_id,
          user_id: likeDislikeDetails.user.id,

        },
        paranoid: false,
      });
      message = 'Dislike Successfuly';
      return {
        record: deletedLike,
        message,
      };
    }
    return { record, message };
  }

  public async addLikeDislikeOnReply(
    likeDislikeDetail
  ): Promise<LikeDislikeType> {
    let message = 'Like Successfuly';
    const [record, isCreated] = await this.likedislike.findOrCreate({
      where: {
        reply_id: likeDislikeDetail.reply_id,
        user_id: likeDislikeDetail.user.id,
      },
    });
    if (!isCreated) {
      await this.likedislike.destroy({
        where: {
          reply_id: likeDislikeDetail.reply_id,
          user_id: likeDislikeDetail.user.id,
        },
      });
      const deleteRecord = await this.likedislike.findOne({
        where: {
          reply_id: likeDislikeDetail.reply_id,
          user_id: likeDislikeDetail.user.id,
        },
        paranoid: false,
      });
      message = 'Dislike Successfuly';
      return {
        record: deleteRecord,
        message,
      };
    }
    return { record, message };
  }

  public async viewLikeonComment(
    comment_id
  ): Promise<{ totalCount: number; likes: (LikeDislike | undefined)[] }> {
    const likeData = await this.likedislike.findAndCountAll({
      where: DB.Sequelize.and({ deletedAt: null }, { comment_id: comment_id }),
    });
    return { totalCount: likeData.count, likes: likeData.rows };
  }

  public async viewLikeOnReply(
    reply_id
  ): Promise<{ totalCount: number; likes: (LikeDislike | undefined)[] }> {
    const likeData = await this.likedislike.findAndCountAll({
      where: DB.Sequelize.and({ deletedAt: null }, { reply_id: reply_id }),
    });
    return { totalCount: likeData.count, likes: likeData.rows };
  }
}
export default LikeDislikeService;
