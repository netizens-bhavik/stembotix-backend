import { isEmpty } from '@/utils/util';
import DB from '@databases';
import courseData from '@/boot/data/course';
import { API_BASE } from '@/config';
import { Reply } from '@/interfaces/reply.interface';

class ReplyService {
  public reply = DB.Reply;
  public trainer = DB.Trainer;
  public comment = DB.Comment;

  public async addReply({replyDetail,file,user}): Promise<Reply> {
    const  thumbnail  = file

    const thumbnailPath = `${API_BASE}/media/${thumbnail.thumbnail[0].path
      .split('/')
      .splice(-2)
      .join('/')}`;
    const newReply = await this.reply.create({
     reply:replyDetail.reply.trim(),
     CommentId:replyDetail.comment_id,
     userId:user.id,
      thumbnail: thumbnailPath,
    });
    return newReply;
  }
  public async getReplyById(reply_id: string): Promise<Reply> {
    const response: Reply = await this.reply.findOne({
      where: {
        id: reply_id,
      },
    });
    return response;
  }

  public async viewReply(
    queryObject
  ): Promise<{ totalCount: number; records: (Reply | undefined)[] }> {
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

    const replyData = await this.reply.findAndCountAll({
      where: { deleted_at: null },
    });
    const data: (Reply | undefined)[] = await this.reply.findAll({
      where: DB.Sequelize.and(
        { deleted_at: null },
        {
          reply: {
            [searchCondition]: search,
          },
        }
      ),
      include: [
        {
          model: this.comment,
        },
      ],

      limit: pageSize,
      offset: pageNo,
      order: [[`${sortBy}`, `${order}`]],
    });
    return { totalCount: replyData.count, records: data };
  }
  public async updateReply(
    replyDetail,
    file
  ): Promise<{ count: number; rows: Reply[] }> {
    const  thumbnail  = file;
    if (thumbnail) {
      const thumbnailPath = `${API_BASE}/media/${thumbnail.thumbnail[0].path
        .split('/')
        .splice(-2)
        .join('/')}`;
      replyDetail.thumbnail = thumbnailPath;
    }

    const updateComment = await this.comment.update(
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

    return { count: updateComment[0], rows: updateComment[1] };
  }
  public async deleteReply({
    reply_id,
    trainer,
  }): Promise<{ count: number; row: Reply[] }> {
    const res: number = await this.reply.destroy({
      where: {
        id: reply_id,
      },
    });
    return { count: res[0], row: res[1] };
  }
}
export default ReplyService;
