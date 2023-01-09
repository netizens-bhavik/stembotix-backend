import DB from '@databases';
import { HttpException } from '@exceptions/HttpException';
import { isEmpty } from '@utils/util';
import { featQuestion } from '@/interfaces/Q&A.interface';

class FeatQuestionService {
  public featuredQuetion = DB.FeaturedQuestion;
  public user = DB.User;

  public isUser(user): boolean {
    return user.isEmailVerified === true;
  }
  public async addFeatQuestion({ questionData, user }): Promise<featQuestion> {
    if (!this.isUser) {
      throw new HttpException(403, 'Forbidden Resource');
    }

    const userRecord = await this.user.findOne({
      where: {
        id: user.id,
      },
    });

    if (!userRecord)
      throw new HttpException(404, 'Requested user details do not exist');

    const newFeatQuestion = await this.featuredQuetion.create({
      user_id: user.id,
      ...questionData,
    });

    return newFeatQuestion;
  }
}
export default FeatQuestionService;
