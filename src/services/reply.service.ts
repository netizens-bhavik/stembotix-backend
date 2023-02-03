import { isEmpty } from '@/utils/util';
import DB from '@databases';
import courseData from '@/boot/data/course';
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
  public async getReplyById(replyId: string): Promise<Reply> {
    const response: Reply = await this.reply.findOne({
      where: {
        id: replyId,

      },
    });
    return response;
  }

  // public async viewReply(
  //   queryObject,
  // ): Promise<{ totalCount: number; records: (Reply | undefined)[] }> {
  //   // sorting
  //   const sortBy = queryObject.sortBy ? queryObject.sortBy : 'createdAt';
  //   const order = queryObject.order === 'DESC' ? 'DESC' : 'ASC';
  //   // pagination
  //   const pageSize = queryObject.pageRecord ? queryObject.pageRecord : 10;
  //   const pageNo = queryObject.pageNo ? (queryObject.pageNo - 1) * pageSize : 0;
  //   // Search
  //   const [search, searchCondition] = queryObject.search
  //     ? [`%${queryObject.search}%`, DB.Sequelize.Op.iLike]
  //     : ['', DB.Sequelize.Op.ne];

  //   const replyData = await this.reply.findAndCountAll({
  //     where: { deleted_at: null },
  //   });
  //   const data: (Reply | undefined)[] = await this.comment.findAll({
  //     where: DB.Sequelize.and({ deleted_at: null }),
  //     include: [
  //       {
  //         model: this.reply,
  //       },
  //     ],

  //     limit: pageSize,
  //     offset: pageNo,
  //     order: [[`${sortBy}`, `${order}`]],
  //   });
  //   return { totalCount: replyData.count, records: data };
  // }
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
