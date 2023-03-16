import DB from '@databases';
import { API_BASE } from '@/config';
import { Reply } from '@/interfaces/reply.interface';
import _ from 'lodash';

class ReplyService {
  public reply = DB.Reply;
  public trainer = DB.Trainer;
  public comment = DB.Comment;

  public async addReply({
    replyDetail,
    file,
    user,
    commentId,
  }): Promise<Reply> {
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
    return { count: res, row: res[1] };
  }
}
export default ReplyService;
