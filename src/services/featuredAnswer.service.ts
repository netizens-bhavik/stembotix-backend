import DB from '@databases';
import { HttpException } from '@exceptions/HttpException';
import { isEmpty } from '@utils/util';
import { featAnswerInterface } from '@/interfaces/Q&A.interface';

class FeatAnswerService {
  public featuredAnswer = DB.FeaturedAnswer;
  public user = DB.User;

  public isUser(user): boolean {
    return user.isEmailVerified === true;
  }

  public async addFeatAnswer({
    answerData,
    user,
  }): Promise<featAnswerInterface> {
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

    const newFeatAnswer = await this.featuredAnswer.create({
      user_id: user.id,
      ...answerData,
    });

    return newFeatAnswer;
  }
}
export default FeatAnswerService;
