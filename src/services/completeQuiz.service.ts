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

  public async createCompleteQuiz(quizid, user): Promise<CompleteQuiz> {
    const completeData = {
      completeQuiz: true,
      quiz_id: quizid,
      user_id: user.id,
    };
    const response = await this.completeQuiz.create(completeData);

    return response;
  }
  public async getCompleteQuizById(quizid): Promise<CompleteQuizType> {
    let message = 'This is your Record';
    const record = await this.completeQuiz.findOne({
      where: {
        completeQuiz: true,
        quiz_id: quizid,
      },
    });
    if (!record) message = 'No record found';
    return { record, message };
  }
}
export default CompleteQuizService;
