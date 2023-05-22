import DB from '@databases';
import { LikeDislike } from '@/interfaces/likedislike.interface';
import { RedisFunctions } from '@/redis';

export type LikeDislikeType = {
  record: LikeDislike;
  message: string;
};

class LikeDislikeService {
  public comment = DB.Comment;
  public user = DB.User;
  public likedislike = DB.LikeDislike;
  public redisFunctions = new RedisFunctions();

  public async addLikeDislikeOnComment(
    likeDislikeDetails
  ): Promise<LikeDislikeType> {
    let message = 'Like Successfully';
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
      message = 'Dislike Successfully';
      await this.redisFunctions.removeDataFromRedis();

      return {
        record: deletedLike,
        message,
      };
    }
    await this.redisFunctions.removeDataFromRedis();

    return { record, message };
  }

  public async addLikeDislikeOnReply(
    likeDislikeDetail
  ): Promise<LikeDislikeType> {
    let message = 'Like Successfully';
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

      message = 'Dislike Successfully';
      await this.redisFunctions.removeDataFromRedis();
      return {
        record: deleteRecord,
        message,
      };
    }
    await this.redisFunctions.removeDataFromRedis();
    return { record, message };
  }

  public async viewLikeonComment(
    comment_id
  ): Promise<{ totalCount: number; likes: (LikeDislike | undefined)[] }> {
    const cacheKey = `viewLikeonComment:${comment_id}`;
    const cachedData = await this.redisFunctions.getRedisKey(cacheKey);
    if (cachedData) {
      return cachedData;
    }
    const likeData = await this.likedislike.findAndCountAll({
      where: DB.Sequelize.and({ deletedAt: null }, { comment_id: comment_id }),
    });
    await this.redisFunctions.setKey(
      cacheKey,
      JSON.stringify({
        totalCount: likeData.count,
        records: likeData.rows,
      })
    );
    return { totalCount: likeData.count, likes: likeData.rows };
  }

  public async viewLikeOnReply(
    reply_id
  ): Promise<{ totalCount: number; likes: (LikeDislike | undefined)[] }> {
    const cacheKey = `viewLikeOnReply:${reply_id}`;
    const cachedData = await this.redisFunctions.getRedisKey(cacheKey);
    if (cachedData) {
      return cachedData;
    }
    const likeData = await this.likedislike.findAndCountAll({
      where: DB.Sequelize.and({ deletedAt: null }, { reply_id: reply_id }),
    });
    await this.redisFunctions.setKey(
      cacheKey,
      JSON.stringify({
        totalCount: likeData.count,
        records: likeData.rows,
      })
    );
    return { totalCount: likeData.count, likes: likeData.rows };
  }
}
export default LikeDislikeService;
