import { NextFunction, Request, Response } from 'express';
import { LikeDislike } from '@/interfaces/likedislike.interface';
import LikeDislikeService from '@/services/likedislike.service';

class LikeDislikeController {
    public likeDislikeService = new LikeDislikeService()

    public addLike = async (
        req: Request,
        res: Response,
        next: NextFunction
    )=>{
        try{
            const {likedislike,comment_id}=req.body
            const user = req.user
             const response:LikeDislike=await this.likeDislikeService.addLike({
                likedislike,
                comment_id
             })
             res.status(200).send({respoonse:response,message:"like successfull"})
        }catch(error){
            next(error)
        }
    }
}