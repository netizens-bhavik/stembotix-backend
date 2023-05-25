import { HttpException } from '@/exceptions/HttpException';
import { RedisFunctions } from '@/redis';
import DB from '@databases';
import { BlogReview } from '@interfaces/blogReview.interface';

export type BlogReviews = {
  record: BlogReview;
  message: string;
};
class BlogReviewService {
  public blogReview = DB.BlogReview;
  public blog = DB.Blog;
  public user = DB.User;
  private redisFunctions = new RedisFunctions();

  public async addReview({
    reviewDetails,
    user,
    blogId,
  }): Promise<BlogReviews> {
    if (!user) {
      throw new HttpException(403, 'Forbidden Resource');
    }
    let message = 'Review Successfully';

    const [record, isCreated] = await this.blogReview.findOrCreate({
      where: {
        userId: user.id,
      },
      defaults: {
        ...reviewDetails,
        blogId: blogId,
        userId: user.id,
        sender_name: user.fullName,
        email: user.email,
      },
    });
    if (!isCreated) {
      await this.blogReview.destroy({
        where: {
          blogId: blogId,
          user_id: user.id,
        },
      });
      const deletedReview = await this.blogReview.findOne({
        where: {
          blogId: blogId,
          user_id: user.id,
        },
        paranoid: false,
      });
      message = 'Unreviewed Successfully';
      return {
        record: deletedReview,
        message,
      };
    }
    await this.redisFunctions.removeDataFromRedis();
    return { record, message };
  }

  public async getBlogReview({ blogId }): Promise<BlogReview[]> {
    const cacheKey = `getBlogRev:${blogId}`;

    const cachedData = await this.redisFunctions.getRedisKey(cacheKey);
    if (cachedData) {
      return cachedData;
    }
    const response = await this.blogReview.findAll({
      where: {
        blogId: blogId,
      },
      include: [
        {
          model: this.user,
          attributes: ['firstName', 'lastName', 'fullName'],
        },
      ],
    });
    await this.redisFunctions.setKey(cacheKey, JSON.stringify(response));

    return response;
  }
  public async updateBlogReviews({
    reviewId,
    reviewDetails,
  }): Promise<{ count: number; rows: BlogReview[] }> {
    const blogData = await this.blogReview.findOne({
      where: {
        id: reviewId,
      },
    });
    if (!blogData) throw new HttpException(404, 'No Tags are found');

    const updateData = await this.blogReview.update(
      {
        ...reviewDetails,
      },
      {
        where: {
          id: reviewId,
        },
        returning: true,
      }
    );
    await this.redisFunctions.removeDataFromRedis();
    return { count: updateData[0], rows: updateData[1] };
  }
  public async deleteBlogReviews({ reviewId }): Promise<{ count: number }> {
    const blogData = await this.blogReview.findOne({
      where: {
        id: reviewId,
      },
    });
    if (!blogData) throw new HttpException(404, 'No Tags are found');

    const res = await this.blogReview.destroy({
      where: {
        id: reviewId,
      },
    });
    await this.redisFunctions.removeDataFromRedis();
    if (res === 1)
      throw new HttpException(200, 'Blog Tag Deleted Successfully');
    return { count: res };
  }
}
export default BlogReviewService;
