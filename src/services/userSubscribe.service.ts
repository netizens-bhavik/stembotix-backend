import DB from '@databases';
import { UserSubscribe } from '@/interfaces/userSubscribe.interface';
import { HttpException } from '@exceptions/HttpException';
import { RedisFunctions } from '@/redis';

class UserSubscribeService {
  public userSubscribe = DB.UserSubscribe;
  public redisFunctions = new RedisFunctions();

  public async addUserSubcribe(userSubDetails, user): Promise<UserSubscribe> {
    if (!user.isEmailVerified)
      throw new HttpException(403, 'Forbidden Resource');
    const subriberData = await this.userSubscribe.findOrCreate({
      where: {
        email: userSubDetails.email,
      },
      defaults: {
        ...userSubDetails,
        userId: user.id,
      },
    });
    await this.redisFunctions.removeDataFromRedis();
    return subriberData;
  }
}
export default UserSubscribeService;
