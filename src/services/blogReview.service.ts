import { HttpException } from '@/exceptions/HttpException';
import DB from '@databases';
import { BlogReview } from '@interfaces/blogReview.interface';
class BlogReviewService {
  public blogReview = DB.BlogReview;
  public blog = DB.Blog;
  public user = DB.User;

  public async addReview({ reviewDetails, user, blogId }): Promise<BlogReview> {
    if (!user) {
      throw new HttpException(403, 'Forbidden Resource');
    }
    const reviewData = await this.blogReview.findOrCreate({
      where: {
        userId: user.id,
      },
      defaults: {
        ...reviewDetails,
        blogId: blogId,
        userId: user.id,
      },
    });
    return reviewData;
  }

  public async getBlogReview({ blogId }): Promise<BlogReview[]> {
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
    if (res === 1)
      throw new HttpException(200, 'Blog Tag Deleted Successfully');
    return { count: res };
  }
}
export default BlogReviewService;
