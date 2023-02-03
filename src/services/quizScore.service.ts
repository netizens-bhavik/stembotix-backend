import { QuizScore } from '@/interfaces/quizScore.interface';
import DB from '@databases';

class QuizScoreService {
  public quizScore = DB.QuizScore;
  public user = DB.User;
  public quizQue = DB.QuizQue;

  public async addScore(quizDetail, user): Promise<QuizScore> {
    const record = await this.quizScore.findAll({
      where: {
        quiz_id: quizDetail.id,
      },
    });
    const newScore = await this.quizScore.create({
      user,
    })
    return record;
  }
}
export default QuizScoreService;
