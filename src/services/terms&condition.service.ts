import DB from '@databases';
import { HttpException } from '@exceptions/HttpException';
import { Op } from 'sequelize';
import { TermsConditioninterface } from '@interfaces/terms&condition.interface';
import { RedisFunctions } from '@/redis';

class TermsConditionService {
  public termsAndCondition = DB.TermsCondition;
  public redisFunctions = new RedisFunctions();

  public isAdmin(user): boolean {
    return user.role === 'SuperAdmin';
  }

  public async addTermsAndCondition(
    content,
    user
  ): Promise<TermsConditioninterface> {
    if (!this.isAdmin(user)) {
      throw new HttpException(403, 'Forbidden Resource');
    }

    const termsAndCondition = await this.termsAndCondition.create({
      ...content,
    });
    await this.redisFunctions.removeDataFromRedis();
    return termsAndCondition;
  }

  public async getTermsAndCondition(user): Promise<TermsConditioninterface[]> {
    const cacheKey = `getTermsAndCondition:${user.id}`;

    const cachedData = await this.redisFunctions.getRedisKey(cacheKey);
    if (cachedData) {
      return cachedData;
    }
    const data: (TermsConditioninterface | undefined)[] =
      await this.termsAndCondition.findAll({
        where: {
          deletedAt: null,
        },
      });
    await this.redisFunctions.setKey(cacheKey, JSON.stringify(data));

    return data;
  }

  public async updateTermsAndCondition({
    termId,
    termDetails,
    user,
  }): Promise<{ count: number; rows: TermsConditioninterface[] }> {
    if (!this.isAdmin(user)) {
      throw new HttpException(403, 'Forbidden Resource');
    }
    const termData = await this.termsAndCondition.findOne({
      where: {
        id: termId,
      },
    });
    if (!termData) throw new HttpException(404, 'No Terms found');

    const updateData = await this.termsAndCondition.update(
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

  public async deleteTermsAndCondition(
    termId,
    user
  ): Promise<{ count: number }> {
    if (!this.isAdmin(user)) {
      throw new HttpException(403, 'Forbidden Resource');
    }

    const res: number = await this.termsAndCondition.destroy({
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

export default TermsConditionService;
