import DB from '@databases';
import { API_BASE } from '@/config';
import { Reply } from '@/interfaces/reply.interface';
import _ from 'lodash';
import { HttpException } from '@/exceptions/HttpException';
import { RedisFunctions } from '@/redis';

class ReplyService {
  public reply = DB.Reply;
  public trainer = DB.Trainer;
  public comment = DB.Comment;
  public redisFunctions = new RedisFunctions();

  public async addReply({
    replyDetail,
    file,
    user,
    commentId,
  }): Promise<Reply> {
    const data = await this.comment.findOne({
      where: {
        id: commentId,
      },
    });
    if (!data) throw new HttpException(409, 'No data found');
    let thumbnailPath = null;
    if (!_.isEmpty(file)) {
      const thumbnail = file;
      thumbnailPath = `${API_BASE}/media/${thumbnail.thumbnail[0].path
        .split('/')
        .splice(-2)
        .join('/')}`;
    }
    const newReply = await this.reply.create({
      reply: replyDetail.reply.trim(),
      comment_id: commentId,
      userId: user.id,
      thumbnail: thumbnailPath,
    });
    await this.redisFunctions.removeDataFromRedis();
    return newReply;
  }

  public async updateReply({
    replyDetail,
    file,
  }): Promise<{ count: number; rows: Reply[] }> {
    let thumbnailPath = null;
    if (!_.isEmpty(file)) {
      const thumbnail = file;
      thumbnailPath = `${API_BASE}/media/${thumbnail.thumbnail[0].path
        .split('/')
        .splice(-2)
        .join('/')}`;
    }

    const updateReply = await this.reply.update(
      {
        ...replyDetail,
      },
      {
        where: {
          id: replyDetail.id,
        },
        returning: true,
      }
    );
    await this.redisFunctions.removeDataFromRedis();
    return { count: updateReply[0], rows: updateReply[1] };
  }
  public async deleteReply({
    replyId,
    trainer,
  }): Promise<{ count: number; row: Reply[] }> {
    const res: number = await this.reply.destroy({
      where: {
        id: replyId,
      },
    });
    await this.redisFunctions.removeDataFromRedis();
    return { count: res, row: res[1] };
  }
}
export default ReplyService;
