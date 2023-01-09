import DB from '@databases';
import { Quiz } from '@/interfaces/quiz.interface';
import { QuizQueDto } from '@/dtos/quizQue.dto';
import { QuizQue } from '@/interfaces/quizQue.interface';
import { HttpException } from '@/exceptions/HttpException';

class QuizQueAnsService {
  public trainer = DB.Trainer;
  public user = DB.User;
  public quiz = DB.Quiz;
  public quizQue = DB.QuizQue;
  public quizAns = DB.QuizAns;
  public quizQueAns = DB.QuizQueAns;
  public curriculum = DB.CurriculumSection;

  public isTrainer(user): boolean {
    return user.role === 'trainer' || user.role === 'admin';
  }
  public async createQuizQue(quizData: QuizQueDto, user): Promise<QuizQue> {
    if (!this.isTrainer(user)) {
      throw new HttpException(403, 'Forbidden Resource');
    }
    const newQuizQue = await this.quizQue.create(quizData);
    const op = [];
    quizData.options?.forEach((element: any) => {
      console.log(element);
      const obj = {
        QuizQueId: newQuizQue.id,
        option: element.option,
        is_correct: element.is_correct,
        question: newQuizQue.question,
      };
      op.push(obj);
    });
    const res = await this.quizAns.bulkCreate(op);
    return res;
  }
  public async getQuizQueAnsById(quizQueId: string): Promise<QuizQue> {
    const response: QuizQue = await this.quizQue.findOne({
      where: {
        id: quizQueId,
      },
    });
    return response;
  }
  public async updateQuizQueAns(
    quizQueAnsDetail,
    trainer
  ): Promise<{ count: number; rows: Quiz[] }> {
    if (!this.isTrainer(trainer) || !trainer.isEmailVerified)
      throw new HttpException(403, 'Forbidden Resource');

    const updateQuizQueAns = await this.quizQue.update(
      {
        ...quizQueAnsDetail,
      },
      {
        where: {
          id: quizQueAnsDetail.id,
        },
        returning: true,
      }
    );

    return { count: updateQuizQueAns[0], rows: updateQuizQueAns[1] };
  }
  public async deleteQuizQueAns({
    quizQueId,
    trainer,
  }): Promise<{ count: number; row: QuizQue }> {
    if (!this.isTrainer(trainer))
      throw new HttpException(401, 'Forbidden Resource');

    const res: number = await this.quizQue.destroy({
      where: {
        id: quizQueId,
      },
    });
    return { count: res[0], row: res[1] };
  }
}
export default QuizQueAnsService;
