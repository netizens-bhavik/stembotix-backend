import courseData from '@/boot/data/course';
import { API_BASE } from '@/config';
import { HttpException } from '@/exceptions/HttpException';
import { Comment } from '@/interfaces/comment.interface';
import { isEmpty } from '@/utils/util';
import DB from '@databases';
import _ from 'lodash';

class CommentService {
  public comment = DB.Comment;
  public trainer = DB.Trainer;
  public reply = DB.Reply;
  public user = DB.User;
  public course = DB.Course;

  public async addComment({
    commentDetail,
    user,
    file,
    course_id,
  }): Promise<Comment> {
    let thumbnailPath = null;
    if (!_.isEmpty(file)) {
      const thumbnail = file;
      thumbnailPath = `${API_BASE}/media/${thumbnail.thumbnail[0].path
        .split('/')
        .splice(-2)
        .join('/')}`;
    }
    const newComment = await this.comment.create({
      comment: commentDetail.comment?.trim(),
      title: commentDetail.title,
      course_id: course_id,
      userId: user.id,
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
    queryObject,
    user
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
          include: {
            model:this.user,
            attributes:['firstName','lastName','id']
          },
        },
        {
          model: this.user,
          attributes: ['firstName', 'lastName','id'],
        },
      ],

      limit: pageSize,
      offset: pageNo,
      order: [[`${sortBy}`, `${order}`]],
    });
    return { totalCount: commentData.count, records: data };
  }
  public async updateComment({
    commentDetail,
    file,
  }): Promise<{ count: number; rows: Comment[] }> {
    const thumbnail = file;

    if (thumbnail) {
      const thumbnailPath = `${API_BASE}/media/${thumbnail.thumbnail[0].path
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
    return { count: res, row: res[1] };
  }
}
export default CommentService;
