import { CompleteQuiz } from '@/interfaces/completeQuiz.interface';
import DB from '@databases';

export type CompleteQuizType = {
  record: CompleteQuiz;
  message: string;
};

class CompleteQuizService {
  public user = DB.User;
  public quiz = DB.Quiz;
  public completeQuiz = DB.CompleteQuiz;

  public async createCompleteQuiz(quiz_id, user): Promise<CompleteQuiz> {
    try {
      const completeData = {
        completeQuiz: true,
        quiz_id: quiz_id,
        user_id: user.id,
      };
      const response = await this.completeQuiz.create(completeData);

      return response;
    } catch (error) {
      return error;
    }
  }
  public async getCompleteQuizById(quiz_id): Promise<CompleteQuizType> {
    let message = 'This is your Record';
    const record = await this.completeQuiz.findOne({
      where: {
        completeQuiz: true,
        quiz_id: quiz_id,
      },
    });
    if (!record) message = 'No record found';
    return { record, message };
  }
}
export default CompleteQuizService;
