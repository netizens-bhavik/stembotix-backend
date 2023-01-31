import { ReviewDTO } from '@/dtos/review.dto';
import DB from '@databases';

class ReviewService {
  public user = DB.User;
  public course = DB.Course;
  public product = DB.Product;
  public review = DB.Review;

  public async createReview(reviewDetail, user): Promise<ReviewDTO> {
    // const courseid = await this.course.findOne({
    //   where: { id: reviewDetail.idDetail },
    // });
    // if (courseid) {
    //   const review = await this.review.create({
    //     ...reviewDetail,
    //     userId: user.id,
    //     course_id: reviewDetail.idDetail,
    //   });
    //   return review;
    // }
    // if (!courseid) {
    //   const productid = await this.product.findOne({
    //     where: { id: reviewDetail.idDetail },
    //   });
    //   if (productid) {
    //     const newreview = await this.review.create({
    //       ...reviewDetail,
    //       userId: user.id,
    //       product_id: reviewDetail.idDetail,
    //     });
    //     return newreview;
    //   }
    // }
    
    if (reviewDetail.type === 'product') {
      const review = await this.review.findOne({

      })
      return await this.review.create({
        ...reviewDetail,
        userId: user.id,
        product_id: reviewDetail.idDetail,
      });
    } else if (reviewDetail.type === 'course') {
      return await this.review.create({
        ...reviewDetail,
        userId: user.id,
        course_id: reviewDetail.idDetail,
      });
    }
  }
}
export default ReviewService;
