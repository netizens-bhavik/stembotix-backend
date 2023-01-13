import DB from '@databases';
import { LikeDislike } from '@/interfaces/likedislike.interface';

class LikeDislikeService {
  public comment = DB.Comment;
  public user = DB.User;
  public likedislike = DB.LikeDislike;

  public async addLikeDislike(likeDislikeDetails): Promise<LikeDislike> {
    const like = await this.likedislike.findOrCreate({
      where: {
        comment_id: likeDislikeDetails.comment_id,
        user_id: likeDislikeDetails.user.id,
      },
    });
    return like;

    // } else {
    //   await this.likedislike.destroy({
    //     where: { comment_id: likeDislikeDetails.comment_id },
    //   });
    //     // const result =await this.likedislike.findAll({
    //     //     where:{
    //     //         comment_id:likeDislikeDetails.comment_id,
    //     //         like: true
    //     //     }
    //     // })
    //     const isLike = likeDislikeDetails.isLike;
    //     try {
    //       const newLike = await this.likedislike.create({
    //         comment_id: likeDislikeDetails.comment_id,
    //         user_id: likeDislikeDetails.user.id,
    //         like: isLike,
    //         dislike: !isLike,
    //       });

    //       return newLike;
    //     } catch (err) {
    //       console.log(err);
    //     }
  }
  public async viewLike(
    queryObject,
    comment_id
  ): Promise<{ totalCount: number; likes: (LikeDislike | undefined)[] }> {
    // sorting
    const sortBy = queryObject.sortBy ? queryObject.sortBy : 'createdAt';
    const order = queryObject.order === 'DESC' ? 'DESC' : 'ASC';
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
      //   include: [{ model: this.comment }],

      limit: pageSize,
      offset: pageNo,
      order: [[`${sortBy}`, `${order}`]],
    });
    return { totalCount: likeData.count, likes: data };
  }
}
export default LikeDislikeService;
