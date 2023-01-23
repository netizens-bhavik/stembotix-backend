import { CompleteQuiz } from '@/interfaces/completeQuiz.interface';
import DB from '@databases';

class CompleteQuizService {
  public user = DB.User;
  public quiz = DB.Quiz;
  public completeQuiz = DB.CompleteQuiz;

  public async createCompleteQuiz(quiz_id, user): Promise<CompleteQuiz> {
    try {
      const record = await this.completeQuiz.findOrCreate({
        where: {
          completeQuiz: true,
          quiz_id: quiz_id,
          user_id: user.id,
        },
      });
      console.log(record);
      return record;
    } catch (error) {
      console.log('sdcsssssssssssssss', error);
    }
  }
}
export default CompleteQuizService;
