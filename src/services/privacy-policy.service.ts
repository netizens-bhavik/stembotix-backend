import DB from '@databases';
import { HttpException } from '@exceptions/HttpException';
import { TermsConditioninterface } from '@interfaces/terms&condition.interface';
import { RedisFunctions } from '@/redis';

class PrivacyPolicyService {
  public privacyPolicy = DB.PrivacyPolicy;
  public redisFunctions = new RedisFunctions();

  public isAdmin(user): boolean {
    return user.role === 'SuperAdmin';
  }

  public async addPrivacyPolicy(
    content,
    user
  ): Promise<TermsConditioninterface> {
    if (!this.isAdmin(user)) {
      throw new HttpException(403, 'Forbidden Resource');
    }

    const privacyPolicy = await this.privacyPolicy.create({
      ...content,
    });
    await this.redisFunctions.removeDataFromRedis();
    return privacyPolicy;
  }

  public async getPrivacyPolicy(user): Promise<TermsConditioninterface[]> {
    const cacheKey = `getPrivacyPolicy:${user.id}`;

    const cachedData = await this.redisFunctions.getRedisKey(cacheKey);
    if (cachedData) {
      return cachedData;
    }
    const data: (TermsConditioninterface | undefined)[] =
      await this.privacyPolicy.findAll({
        where: {
          deletedAt: null,
        },
      });
    await this.redisFunctions.setKey(cacheKey, JSON.stringify(data));

    return data;
  }

  public async updatePrivacyPolicy({
    termId,
    termDetails,
    user,
  }): Promise<{ count: number; rows: TermsConditioninterface[] }> {
    if (!this.isAdmin(user)) {
      throw new HttpException(403, 'Forbidden Resource');
    }
    const termData = await this.privacyPolicy.findOne({
      where: {
        id: termId,
      },
    });
    if (!termData) throw new HttpException(404, 'No Categories found');

    const updateData = await this.privacyPolicy.update(
      {
        ...termDetails,
      },
      {
        where: {
          id: termId,
        },
        returning: true,
      }
    );
    await this.redisFunctions.removeDataFromRedis();
    return { count: updateData[0], rows: updateData[1] };
  }

  public async deletePrivacyPolicy(
    termId,
    user
  ): Promise<{ count: number }> {
    if (!this.isAdmin(user)) {
      throw new HttpException(403, 'Forbidden Resource');
    }

    const res: number = await this.privacyPolicy.destroy({
      where: {
        id: termId,
      },
    });
    await this.redisFunctions.removeDataFromRedis();
    if (res === 1)
      throw new HttpException(200, 'Terms & Condition Deleted Successfully');
    if (res === 0) throw new HttpException(404, 'No data found');
    return { count: res };
  }
}

export default PrivacyPolicyService;
