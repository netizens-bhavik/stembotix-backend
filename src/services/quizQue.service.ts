import DB from '@databases';
import { Quiz } from '@/interfaces/quiz.interface';
import { QuizQue } from '@/interfaces/quizQue.interface';
import { HttpException } from '@/exceptions/HttpException';

class QuizQueAnsService {
  public trainer = DB.Trainer;
  public user = DB.User;
  public quiz = DB.Quiz;
  public quizQue = DB.QuizQue;
  public quizAns = DB.QuizAns;
  public curriculum = DB.CurriculumSection;

  public isTrainer(user): boolean {
    return user.role === 'trainer' || user.role === 'admin';
  }
  public async createQuizQue(quizData, user): Promise<QuizQue> {
    if (!this.isTrainer(user)) {
      throw new HttpException(403, 'Forbidden Resource');
    }
    const newQuizQue = await this.quizQue.create(quizData);
    const op = [];
    quizData.options?.forEach((element) => {
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
    trainer,
    quizQueId
  ): Promise<{ count: number; rows: Quiz[] }> {
    if (!this.isTrainer(trainer) || !trainer.isEmailVerified)
      throw new HttpException(403, 'Forbidden Resource');
    try {
      const { options } = quizQueAnsDetail;
      const updateQuizQueAns = await this.quizQue.update(
        {
          ...quizQueAnsDetail,
        },
        {
          where: {
            id: quizQueId,
          },
          returning: true,
        }
      );
      const res = await this.quizAns.findAll({
        where: { quiz_que_id: quizQueId },
      });

      options?.forEach(async (element, index) => {
        await this.quizAns.update(
          {
            option: element.option,
            is_correct: element.is_correct,
          },
          {
            where: {
              id: res[index].id,
            },
            returning: true,
          }
        );
      });
      return { count: updateQuizQueAns[0], rows: updateQuizQueAns[1] };
    } catch (error) {
      return error;
    }
  }

  public async deleteQuizQueAns({
    quizQueId,
    trainer,
  }): Promise<{ count: number }> {
    if (!this.isTrainer(trainer))
      throw new HttpException(401, 'Forbidden Resource');

    const res: number = await this.quizQue.destroy({
      where: {
        id: quizQueId,
      },
    });
    return { count: res };
  }
}
export default QuizQueAnsService;
