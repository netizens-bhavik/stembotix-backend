import { ReviewDTO } from '@/dtos/review.dto';
import { HttpException } from '@/exceptions/HttpException';
import { Review } from '@/interfaces/review.interface';
import { RedisFunctions } from '@/redis';
import DB from '@databases';

class ReviewService {
  public user = DB.User;
  public course = DB.Course;
  public product = DB.Product;
  public review = DB.Review;
  public redisFunctions = new RedisFunctions();

  public async createReview(reviewDetail, user): Promise<ReviewDTO> {
    const courseData = await this.course.findOne({
      where: { id: reviewDetail.postId },
    });
    await this.redisFunctions.removeDataFromRedis();
    if (courseData) {
      const reviewData = await this.review.findOne({
        where: {
          course_id: reviewDetail.postId,
          user_id: user.id,
        },
      });
      if (reviewData) throw new HttpException(409, 'You already Reviewed');
      const review = await this.review.create({
        ...reviewDetail,
        userId: user.id,
        course_id: reviewDetail.postId,
      });
      return review;
    }
    if (!courseData) {
      const productid = await this.product.findOne({
        where: { id: reviewDetail.postId },
      });
      if (productid) {
        const reviewData = await this.review.findOne({
          where: {
            product_id: reviewDetail.postId,
            user_id: user.id,
          },
        });
        if (reviewData) throw new HttpException(409, 'You already Reviewed');
        const newreview = await this.review.create({
          ...reviewDetail,
          userId: user.id,
          product_id: reviewDetail.postId,
        });
        return newreview;
      }
    }
  }
  public async getReviewByAdmin(
    queryObject,
    postId
  ): Promise<{ totalCount: number; records: (Review | undefined)[] }> {
    const sortBy = queryObject.sortBy ? queryObject.sortBy : 'createdAt';
    const order = queryObject.order || 'DESC';
    // pagination
    const pageSize = queryObject.pageRecord ? queryObject.pageRecord : 10;
    const pageNo = queryObject.pageNo ? (queryObject.pageNo - 1) * pageSize : 0;
    // Search
    const [search, searchCondition] = queryObject.search
      ? [`%${queryObject.search}%`, DB.Sequelize.Op.iLike]
      : ['', DB.Sequelize.Op.ne];

    const cacheKey = `getReviewByAdmin:${postId}:${search}:${sortBy}:${order}:${pageSize}:${pageNo}`;
    const cachedData = await this.redisFunctions.getRedisKey(cacheKey);
    if (cachedData) {
      return cachedData;
    }
    const reviewData = await this.review.findAndCountAll({
      where: DB.Sequelize.or(
        {
          course_id: postId,
        },
        {
          product_id: postId,
        }
      ),
      include: [
        {
          model: this.user,
          where: DB.Sequelize.or(
            {
              firstName: {
                [searchCondition]: search,
              },
            },
            {
              lastName: {
                [searchCondition]: search,
              },
            }
          ),
        },
      ],

      limit: pageSize,
      offset: pageNo,
      order: [[`${sortBy}`, `${order}`]],
    });
    await this.redisFunctions.setKey(
      cacheKey,
      JSON.stringify({
        totalCount: reviewData.count,
        records: reviewData.rows,
      })
    );
    return { totalCount: reviewData.count, records: reviewData.rows };
  }

  public async getReview(
    postId,
    queryObject
  ): Promise<{ totalCount: number; review: (Review | undefined)[] }> {
    // Pagination
    const pageSize = queryObject.pageRecord ? queryObject.pageRecord : 10;
    const pageNo = queryObject.pageNo ? (queryObject.pageNo - 1) * pageSize : 0;
    const cacheKey = `getReviewByAdmin:${pageSize}:${pageNo}`;
    const cachedData = await this.redisFunctions.getRedisKey(cacheKey);
    if (cachedData) {
      return cachedData;
    }
    const reviewData = await this.review.findAndCountAll({
      where: DB.Sequelize.or(
        {
          course_id: postId,
        },
        {
          product_id: postId,
        }
      ),
      include: [
        {
          model: this.user,
        },
      ],
      limit: pageSize,
      offset: pageNo,
      order: [['createdAt', 'DESC']],
    });
    await this.redisFunctions.setKey(
      cacheKey,
      JSON.stringify({
        totalCount: reviewData.count,
        records: reviewData.rows,
      })
    );
    return { totalCount: reviewData.count, review: reviewData.rows };
  }
  public async updateReview(
    reviewDetail,
    reviewId
  ): Promise<{ count: number; review: Review[] }> {
    const updateReview = await this.review.update(
      {
        ...reviewDetail,
      },
      {
        where: {
          id: reviewId,
        },
        returning: true,
      }
    );
    await this.redisFunctions.removeDataFromRedis();
    return { count: updateReview[0], review: updateReview[1] };
  }
  public async deleteReview(reviewId): Promise<{ count: number }> {
    const res: number = await this.review.destroy({
      where: {
        id: reviewId,
      },
    });
    await this.redisFunctions.removeDataFromRedis();
    return { count: res };
  }
}
export default ReviewService;
