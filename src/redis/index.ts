import { REDIS_HOST, REDIS_PORT } from '@/config';
import { logger } from '@utils/logger';
import RedisClient from '@redis/client/dist/lib/client';

export class RedisFunctions {
  private client;
  constructor() {
    this.redisInit();
  }

  private async redisInit() {
    try {
      this.client = new RedisClient({
        socket: {
          connectTimeout: 10000,
          host: REDIS_HOST || 'localhost',
          port: REDIS_PORT || '6379',
        },
      });
      this.client.connect().catch(console.error);
    } catch (error) {
      logger.error(error);
    }
  }

  public async getRedisKey(key: string) {
    const dataFromKey = await this.client.get(key);
    return JSON.parse(dataFromKey);
  }

  public async setKey(key, data) {
    try {
      await this.client.set(key, data, { NX: true });
    } catch (error) {
      console.log(error);
    }
  }

  public async updateKey(key, data) {
    await this.client.set(key, data, { XX: true });
  }

  public async checkIfKeyExists(key: string): Promise<boolean> {
    const exists: number = await this.client.exists(key);
    return !!exists;
  }

  public async removeDataFromRedis() {
    await this.client.flushAll();
  }

  public async deleteByKey(key: string) {
    await this.client.del(key);
  }
  public async disconnectRedis() {
    await this.client.disconnect();
  }
}
