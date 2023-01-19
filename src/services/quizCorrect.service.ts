import DB from '@databases';

class QuizCorrectService {
  public quizQue = DB.QuizQue;
  public quizAns = DB.QuizAns;


  public async getAnsById(quizQueId): Promise<QuizQue> {
    const response = await this.quizQue.findOne({
      where: {
        id: quizQueId,
      },
    });
    return response;
  }
}
export default QuizCorrectService
