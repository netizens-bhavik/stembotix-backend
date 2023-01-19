import { QuizScore } from '@/interfaces/quizScore.interface';
import DB from '@databases';

class QuizScoreService {
  public quizScore = DB.QuizScore;
  public user = DB.User;
  public quizQue = DB.QuizQue;

  public async addScore(quizDetail, user): Promise<QuizScore> {
    console.log("======================",quizDetail)
    const record = await this.quizScore.findAll({
      where: {
        quiz_id: quizDetail.id
      },
    });
console.log("first",record)
    const newScore = await this.quizScore.create({
      user,
    });
    // let defaultScore = 0;
    // for (let i = 0; i <= defaultScore; i++)
    //   if (is_selected_option === true) return newScore;
    return record
  }
}
export default QuizScoreService;
