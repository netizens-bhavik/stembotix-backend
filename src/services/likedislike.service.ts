import DB from '@databases';
import { LikeDislike } from '@/interfaces/likedislike.interface';

class LikeDislikeService {
  public comment = DB.Comment;
  public user = DB.User;
  public likedislike = DB.LikeDislike;

  public async addLikeDislike(likeDislikeDetails): Promise<LikeDislike> {
    const like = await this.likedislike.findOne({
      where: {
        comment_id: likeDislikeDetails.comment_id,
      },
    });
      if (!like) {
        const isLike = likeDislikeDetails.isLike;
        const newLike = await this.likedislike.create({
          comment_id: likeDislikeDetails.comment_id,
          user_id: likeDislikeDetails.user.id,
          like: isLike,
          dislike: !isLike,
        });
        return newLike;
      } else {
        await this.likedislike.destroy({
          where: { comment_id: likeDislikeDetails.comment_id },
        });
      }
   

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
}
export default LikeDislikeService;
