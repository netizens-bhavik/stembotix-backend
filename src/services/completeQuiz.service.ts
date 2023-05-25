import { CompleteQuiz } from '@/interfaces/completeQuiz.interface';
import { RedisFunctions } from '@/redis';
import DB from '@databases';

export type CompleteQuizType = {
  record: CompleteQuiz;
  message: string;
};

class CompleteQuizService {
  public user = DB.User;
  public quiz = DB.Quiz;
  public completeQuiz = DB.CompleteQuiz;
  private redisFunctions = new RedisFunctions();

  public async createCompleteQuiz(quizid, user): Promise<CompleteQuiz> {
    const completeData = {
      completeQuiz: true,
      quiz_id: quizid,
      user_id: user.id,
    };
    const response = await this.completeQuiz.create(completeData);
    await this.redisFunctions.removeDataFromRedis();
    return response;
  }
  public async getCompleteQuizById(quizId): Promise<CompleteQuizType> {
    const cacheKey = `completeQuiz:${quizId}`;
    const cachedData = await this.redisFunctions.getRedisKey(cacheKey);
    if (cachedData) {
      return cachedData;
    }
    let message = 'This is your Record';
    const record = await this.completeQuiz.findOne({
      where: {
        completeQuiz: true,
        quiz_id: quizId,
      },
    });
    await this.redisFunctions.setKey(cacheKey, JSON.stringify(record));

    if (!record) message = 'No record found';
    await this.redisFunctions.removeDataFromRedis();
    return { record, message };
  }
}
export default CompleteQuizService;
