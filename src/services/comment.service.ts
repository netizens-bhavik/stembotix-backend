import { API_BASE } from '@/config';
import { HttpException } from '@/exceptions/HttpException';
import { Comment } from '@/interfaces/comment.interface';
import { RedisFunctions } from '@/redis';
import DB from '@databases';
import _ from 'lodash';
class CommentService {
  public comment = DB.Comment;
  public trainer = DB.Trainer;
  public reply = DB.Reply;
  public user = DB.User;
  public course = DB.Course;
  public likedislike = DB.LikeDislike;
  private redisFunctions = new RedisFunctions();

  public async addComment({
    commentDetail,
    user,
    file,
    courseId,
  }): Promise<Comment> {
    const data = await this.course.findOne({
      where: {
        id: courseId,
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
    const newComment = await this.comment.create({
      comment: commentDetail.comment.trim(),
      title: commentDetail.title,
      course_id: courseId,
      userId: user.id,
      thumbnail: thumbnailPath,
    });
    await this.redisFunctions.removeDataFromRedis();
    return newComment;
  }

  public async getCommentById(commentId): Promise<Comment> {
    const cacheKey = `getComment:${commentId}`;
    const cachedData = await this.redisFunctions.getRedisKey(cacheKey);
    if (cachedData) {
      return cachedData;
    }
    const response = await this.comment.findAll({
      where: {
        id: commentId,
      },
      include: [
        {
          model: this.likedislike,
        },
      ],
    });
    await this.redisFunctions.setKey(cacheKey, JSON.stringify(response));

    return response;
  }

  public async viewComment(
    queryObject,
    user
  ): Promise<{ totalCount: number; records: (Comment | undefined)[] }> {
    // sorting
    const sortBy = queryObject.sortBy ? queryObject.sortBy : 'created_at';
    const order = queryObject.order || 'DESC';
    // pagination
    const pageSize = queryObject.pageRecord ? queryObject.pageRecord : 10;
    const pageNo = queryObject.pageNo ? (queryObject.pageNo - 1) * pageSize : 0;
    // Search
    const [search, searchCondition] = queryObject.search
      ? [`%${queryObject.search}%`, DB.Sequelize.Op.iLike]
      : ['', DB.Sequelize.Op.ne];
    const cacheKey = `allComment:${sortBy}:${order}:${pageSize}:${pageNo}:${search}`;
    const cachedData = await this.redisFunctions.getRedisKey(cacheKey);
    if (cachedData) {
      return cachedData;
    }
    const commentData = await this.comment.findAndCountAll({
      where: { deleted_at: null },
    });

    const data: (Comment | undefined)[] = await this.comment.findAll({
      where: DB.Sequelize.and(
        { deleted_at: null },
        {
          title: {
            [searchCondition]: search,
          },
        }
      ),
      include: [
        {
          model: this.reply,
          include: {
            model: this.user,
            attributes: ['firstName', 'lastName', 'id'],
          },
        },
        {
          model: this.user,
          attributes: ['firstName', 'lastName', 'id'],
        },
      ],

      limit: pageSize,
      offset: pageNo,
      order: [[`${sortBy}`, `${order}`]],
    });
    await this.redisFunctions.setKey(
      cacheKey,
      JSON.stringify({
        totalCount: commentData.count,
        records: data,
      })
    );
    const result = { totalCount: commentData.count, records: data };
    return result;
  }
  public async updateComment({
    commentDetail,
    file,
  }): Promise<{ count: number; rows: Comment[] }> {
    let thumbnailPath = null;
    if (!_.isEmpty(file)) {
      const thumbnail = file;
      thumbnailPath = `${API_BASE}/media/${thumbnail.thumbnail[0].path
        .split('/')
        .splice(-2)
        .join('/')}`;
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
    await this.redisFunctions.removeDataFromRedis();
    return { count: updateComment[0], rows: updateComment[1] };
  }

  public async deleteComment({
    commentId,
    trainer,
  }): Promise<{ count: number; row: Comment[] }> {
    const res: number = await this.comment.destroy({
      where: {
        id: commentId,
      },
    });
    await this.redisFunctions.removeDataFromRedis();
    return { count: res, row: res[1] };
  }
}
export default CommentService;
