import DB from '@databases'
import { LikeDislike } from '@/interfaces/likedislike.interface'

class LikeDislikeService {
    public comment = DB.Comment
    public user = DB.User
    public likedislike = DB.LikeDislike

    public async addLikedislike(likeDislikeDetails): Promise<LikeDislike> {
        const newLike = await this.likedislike.create({
            ...likeDislikeDetails
        })
        return newLike
    }
}
export default LikeDislikeService