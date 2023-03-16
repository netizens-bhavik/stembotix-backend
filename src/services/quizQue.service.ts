import DB from '@databases';
import { QuizQue } from '@/interfaces/quizQue.interface';
import { HttpException } from '@/exceptions/HttpException';
import { capitalize } from '@/utils/util';

export type updateQuizQueAns = {
  updateQuizQueAns: string;
  options: string;
};
class QuizQueAnsService {
  public trainer = DB.Trainer;
  public user = DB.User;
  public quiz = DB.Quiz;
  public quizQue = DB.QuizQue;
  public quizAns = DB.QuizAns;
  public curriculum = DB.CurriculumSection;

  public isTrainer(user): boolean {
    return user.role === 'Instructor' || user.role === 'Admin';
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
        option: capitalize(element.option),
        is_correct: element.is_correct,
        question: newQuizQue.question,
      };
      op.push(obj);
    });
    const res = await this.quizAns.bulkCreate(op);
    return res;
  }
  // public async getQuizQueAnsById(
  //   quizQueId: string,
  //   queryObject
  // ): Promise<{ totalCount: number; records: (QuizQue | undefined)[] }> {
  //   const sortBy = queryObject.sortBy ? queryObject.sortBy : 'createdAt';
  //   const order = queryObject.order === 'DESC' ? 'DESC' : 'ASC';
  //   // pagination
  //   const pageSize = queryObject.pageRecord ? queryObject.pageRecord : 10;
  //   const pageNo = queryObject.pageNo ? (queryObject.pageNo - 1) * pageSize : 0;
  //   // Search
  //   const [search, searchCondition] = queryObject.search
  //     ? [`%${queryObject.search}%`, DB.Sequelize.Op.iLike]
  //     : ['', DB.Sequelize.Op.ne];

  //   const response = await this.quizQue.findOne({
  //     where: {
  //       id: quizQueId,
  //       question: {
  //         [searchCondition]: search,
  //       },
  //     },
  //     include: [
  //       {
  //         model: this.quizAns,
  //         separate: true,
  //         attributes: ['id', 'QuizQueId', 'option'],
  //       },
  //     ],
  //     limit: pageSize,
  //     offset: pageNo,
  //     order: [[`${sortBy}`, `${order}`]],
  //   });
  //   return { totalCount: response, records: response.rows };
  // }

  public async getQuizQueAnsByIdAdmin(
    quizId: string,
    queryObject
  ): Promise<{ totalCount: number; records: (QuizQue | undefined)[] }> {
    const sortBy = queryObject.sortBy ? queryObject.sortBy : 'createdAt';
    const order = queryObject.order || 'DESC';
    // pagination
    const pageSize = queryObject.pageRecord ? queryObject.pageRecord : 10;
    const pageNo = queryObject.pageNo ? (queryObject.pageNo - 1) * pageSize : 0;
    // Search
    const [search, searchCondition] = queryObject.search
      ? [`%${queryObject.search}%`, DB.Sequelize.Op.iLike]
      : ['', DB.Sequelize.Op.ne];

    const response = await this.quizQue.findAndCountAll({
      where: {
        quiz_id: quizId,
        question: {
          [searchCondition]: search,
        },
      },
      include: [
        {
          model: this.quizAns,
          attributes: ['id', 'QuizQueId', 'option', 'is_correct'],
          separate: true,
        },
      ],
      limit: pageSize,
      offset: pageNo,
      order: [[`${sortBy}`, `${order}`]],
    });
    return { totalCount: response.count, records: response.rows };
  }
  public async updateQuizQueAns(
    quizQueAnsDetail,
    trainer,
    quizQueId
  ): Promise<updateQuizQueAns> {
    if (!this.isTrainer(trainer) || !trainer.isEmailVerified)
      throw new HttpException(403, 'Forbidden Resource');
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
          option: capitalize(element.option),
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

    return { updateQuizQueAns, options };
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
