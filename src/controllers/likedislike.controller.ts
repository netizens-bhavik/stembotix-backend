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
            const {likeDislike,comment_id}=req.body
            const user = req.user
            
        }catch(error){
            next(error)
        }
    }
}