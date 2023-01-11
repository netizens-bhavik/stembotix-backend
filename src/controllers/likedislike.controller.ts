import { NextFunction, Request, Response } from 'express';
import { LikeDislike } from '@/interfaces/likedislike.interface';
import LikeDislikeService from '@/services/likedislike.service';
import DB from '@/databases';

class LikeDislikeController {
    public likeDislikeService = new LikeDislikeService()
    public likedislike = DB.LikeDislike
    public user =DB.User
    public comment =DB.Comment

    public addLike = async (
        req: Request,
        res: Response,
        next: NextFunction
    ) => {
        try {
            const { like, dislike, comment_id } = req.body
            const user = req.user
            const record =await this.likedislike.findOne({
                where:{
                    comment_id:comment_id
                },
                include:[
                    {
                        where:{
                            user_id:user
                          }
                    }
                      
                    
                        
                ]
            })
            const response: LikeDislike = await this.likeDislikeService.addLikedislike({
                like,
                dislike,
                comment_id,
                user
            })
            res.status(200).send({ response: response, message: "like successfull" })
        } catch (error) {
            next(error)
        }
    }
}
export default LikeDislikeController