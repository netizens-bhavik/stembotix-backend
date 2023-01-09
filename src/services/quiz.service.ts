import DB from '@databases';
import { Quiz } from '@/interfaces/quiz.interface';
import { API_BASE } from '@/config';
import { QuizDto } from '@/dtos/quiz.dto';
import { HttpException } from '@exceptions/HttpException';
import { QuizQueDto } from '@/dtos/quizQue.dto';
import { QuizQue } from '@/interfaces/quizQue.interface';
import QuizRoute from '@/routes/quiz.route';
import { where } from 'sequelize/types';
import { isEmpty } from '@/utils/util';
class QuizService {
  public trainer = DB.Trainer;
  public user = DB.User;
  public quiz = DB.Quiz;
  public quizQue = DB.QuizQue;
  public quizAns = DB.QuizAns;
  public isTrainer(user): boolean {
    return user.role === 'trainer' || user.role === 'admin';
  }

  public async createQuiz(quizData: QuizDto, user): Promise<Quiz> {
    if (!this.isTrainer(user)) {
      throw new HttpException(403, 'Forbidden Resource');
    }
    const trainerRecord = await this.trainer.findOne({
      where: {
        user_id: user.id,
      },
    });

    if (!trainerRecord)
      throw new HttpException(404, 'Requested trainer details do not exist');

    const newQuiz = await this.quiz.create(quizData);
    // newQuiz.addTrainer(trainerRecord);
    return newQuiz;
  }

  public async getQuizById(quizId: string): Promise<Quiz> {
    const response: Quiz = await this.quiz.findOne({
      where: {
        id: quizId,
      },
    });
    return response;
  }

  public async updateQuiz(
    quizDetail,
    trainer
  ): Promise<{ count: number; rows: Quiz[] }> {
    if (!this.isTrainer(trainer) || !trainer.isEmailVerified)
      throw new HttpException(403, 'Forbidden Resource');

    const updateQuiz = await this.quiz.update(
      {
        ...quizDetail,
      },
      {
        where: {
          id: quizDetail.id,
        },
        returning: true,
      }
    );

    return { count: updateQuiz[0], rows: updateQuiz[1] };
  }

  public async deleteQuiz({ quizId, trainer }): Promise<{ count: number }> {
    if (!this.isTrainer(trainer))
      throw new HttpException(401, 'Forbidden Resource');

    const res: number = await this.quiz.destroy({
      where: {
        id: quizId,
      },
    });
    return { count: res };
  }

  public async viewQuiz(
    queryObject
  ): Promise<{ totalCount: number; records: (Quiz | undefined)[] }> {
    // sorting
    const sortBy = queryObject.sortBy ? queryObject.sortBy : 'createdAt';
    const order = queryObject.order === 'DESC' ? 'DESC' : 'ASC';
    // pagination
    const pageSize = queryObject.pageRecord ? queryObject.pageRecord : 10;
    const pageNo = queryObject.pageNo ? (queryObject.pageNo - 1) * pageSize : 0;
    // Search
    const [search, searchCondition] = queryObject.search
      ? [`%${queryObject.search}%`, DB.Sequelize.Op.iLike]
      : ['', DB.Sequelize.Op.ne];

    const quizData = await this.quiz.findAndCountAll({
      where: { deleted_at: null },
    });
    const data: (Quiz | undefined)[] = await this.quiz.findAll({
      where: DB.Sequelize.and(
        { deleted_at: null },
        {
          title: {
            [searchCondition]: search,
          },
        }
      ),
      include: [
        {
          model: this.quizQue,
          include: [
            {
              model: this.quizAns,
            },
          ],
        },
      ],

      limit: pageSize,
      offset: pageNo,
      order: [[`${sortBy}`, `${order}`]],
    });
    return { totalCount: quizData.count, records: data };
  }
}

export default QuizService;
