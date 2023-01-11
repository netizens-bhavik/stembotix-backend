import courseData from '@/boot/data/course';
import { API_BASE } from '@/config';
import { Comment } from '@/interfaces/comment.interface';
import { isEmpty } from '@/utils/util';
import DB from '@databases';

class CommentService {
  public comment = DB.Comment;
  public trainer = DB.Trainer;
  public reply = DB.Reply
  public user =DB.User
  public course = DB.Course


  public async addComment(commentData): Promise<Comment> {
const thumbnail = commentData.thumbnail

    const thumbnailPath = `${API_BASE}/media/${thumbnail
      .split('/')
      .splice(-2)
      .join('/')}`;
    const newComment = await this.comment.create({
      comment: commentData.comment.trim(),
      user_id: commentData.user_id,
      course_id: commentData.course_id,
      thumbnail: thumbnailPath,
    });
    return newComment;
  }

  public async getCommentById(comment_id: string): Promise<Comment> {
    const response: Comment = await this.comment.findOne({
      where: {
        id: comment_id,
      },
    });
    return response;
  }
  public async viewComment(
    queryObject
  ): Promise<{ totalCount: number; records: (Comment | undefined)[] }> {
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

    const commentData = await this.comment.findAndCountAll({
      where: { deleted_at: null },
    });
    const data: (Comment | undefined)[] = await this.comment.findAll({
      where: DB.Sequelize.and(
        { deleted_at: null },
        {
          comment: {
            [searchCondition]: search,
          },
        }
      ),
      include: [
        {
          model: this.reply,
        },
        
      ],

      limit: pageSize,
      offset: pageNo,
      order: [[`${sortBy}`, `${order}`]],
    });
    console.log("second",data)
    return { totalCount: commentData.count, records: data };
  }
  public async updateComment(
  {  commentDetail,
    file}
  ): Promise<{ count: number; rows: Comment[] }> {
const thumbnail= file
   if (thumbnail) {
      const thumbnailPath = `${API_BASE}/media/${thumbnail
        .split('/')
        .splice(-2)
        .join('/')}`;
        commentDetail.thumbnail = thumbnailPath;
    }

    const updateComment = await this.comment.update(
      {
        ...commentDetail,
      },
      {
        where: {
          id: commentDetail.id,
        },
        returning: true,
      }
    );

    return { count: updateComment[0], rows: updateComment[1] };
  }

  public async deleteComment({
    comment_id,
    trainer,
  }): Promise<{ count: number; row: Comment[] }> {

    const res: number = await this.comment.destroy({
      where: {
        id: comment_id,
      },
    });
    return { count: res[0], row: res[1] };
  }


}
export default CommentService;
