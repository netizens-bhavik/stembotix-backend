import DB from '@databases'
import { LikeDislike } from '@/interfaces/likedislike.interface'

class LikeDislikeService{
    public comment = DB.Comment
    public user = DB.User
    public likedislike = DB.LikeDislike

    public async addLike({likeDislikeDetails}):Promise<LikeDislike>{
        const newLike = await this.likedislike.create({
            ...likeDislikeDetails
        })
    }
}
export default LikeDislikeService