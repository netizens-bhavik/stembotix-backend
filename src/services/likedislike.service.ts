import DB from '@databases';
import { LikeDislike } from '@/interfaces/likedislike.interface';
import { HttpException } from '@/exceptions/HttpException';

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
        where: { comment_id: likeDislikeDetails.comment_id },
      });
      message = 'Dislike Successfuly';
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
        where: { reply_id: likeDislikeDetail.reply_id },
      });
      message = 'Dislike Successfuly';
    }
    return { record, message };
  }

  public async viewLikeonComment(
    queryObject,
    comment_id
  ): Promise<{ totalCount: number; likes: (LikeDislike | undefined)[] }> {
    // sorting
    const sortBy = queryObject.sortBy ? queryObject.sortBy : 'createdAt';
    const order = queryObject.order || 'DESC';
    // pagination
    const pageSize = queryObject.pageRecord ? queryObject.pageRecord : 10;
    const pageNo = queryObject.pageNo ? (queryObject.pageNo - 1) * pageSize : 0;
    // Search
    const [search, searchCondition] = queryObject.search
      ? [`%${queryObject.search}%`, DB.Sequelize.Op.iLike]
      : ['', DB.Sequelize.Op.ne];

    const likeData = await this.likedislike.findAndCountAll({
      where: { comment_id: comment_id },
    });
    const data: (LikeDislike | undefined)[] = await this.likedislike.findAll({
      where: DB.Sequelize.and({ comment_id: comment_id }),

      limit: pageSize,
      offset: pageNo,
      order: [[`${sortBy}`, `${order}`]],
    });

    return { totalCount: likeData.count, likes: data };
  }

  public async viewLikeOnReply(
    queryObject,
    reply_id
  ): Promise<{ totalCount: number; likes: (LikeDislike | undefined)[] }> {
    // sorting
    const sortBy = queryObject.sortBy ? queryObject.sortBy : 'createdAt';
    const order = queryObject.order || 'DESC';
    // pagination
    const pageSize = queryObject.pageRecord ? queryObject.pageRecord : 10;
    const pageNo = queryObject.pageNo ? (queryObject.pageNo - 1) * pageSize : 0;
    // Search
    const [search, searchCondition] = queryObject.search
      ? [`%${queryObject.search}%`, DB.Sequelize.Op.iLike]
      : ['', DB.Sequelize.Op.ne];

    const likeData = await this.likedislike.findAndCountAll({
      where: { reply_id: reply_id },
    });
    const data: (LikeDislike | undefined)[] = await this.likedislike.findAll({
      where: DB.Sequelize.and({ reply_id: reply_id }),

      limit: pageSize,
      offset: pageNo,
      order: [[`${sortBy}`, `${order}`]],
    });
    return { totalCount: likeData.count, likes: data };
  }
}
export default LikeDislikeService;
