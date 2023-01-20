import DB from '@databases';
import { Quiz } from '@/interfaces/quiz.interface';
import { API_BASE } from '@/config';
import { QuizDto } from '@/dtos/quiz.dto';
import { HttpException } from '@exceptions/HttpException';
import { QuizQueDTO } from '@/dtos/quiz.dto';
import { QuizQue } from '@/interfaces/quizQue.interface';
import QuizRoute from '@/routes/quiz.route';
import { where } from 'sequelize/types';
import { isEmpty } from '@/utils/util';
import { CurriCulumVideo } from '@/interfaces/curriculumVideo.interface';
class QuizService {
  public trainer = DB.Trainer;
  public user = DB.User;
  public quiz = DB.Quiz;
  public quizQue = DB.QuizQue;
  public quizAns = DB.QuizAns;
  public quizScore = DB.QuizScore
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

  public async getQuizBycurriculumId(queryObject,curriculumId): Promise<{totalCount: number; records: (Quiz | undefined)[]}> {
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
        where: { curriculum_id: curriculumId },
      });
    
    const data: (Quiz | undefined)[] =
      await this.quiz.findAll({
        where: DB.Sequelize.and(
          { curriculum_id: curriculumId },
          {
            title: {
              [searchCondition]: search,
            },
          }
        ),
        // attributes:["id","question","quiz_id"],
        // attributes:["id","QuizQueId","option"]
        limit: pageSize,
        offset: pageNo,
        order: [[`${sortBy}`, `${order}`]],
      });

      return { totalCount: quizData.count, records: data };
  }
  public async getQuizById(quizId: string): Promise<Quiz> {
    const response: Quiz = await this.quiz.findOne({
      where: {
        id: quizId,
      },
      include: [
        {
          model: this.quizQue,
          attributes: ['id', 'question', 'quiz_id'],

          include: [
            {
              model: this.quizAns,
              attributes: ['id', 'QuizQueId', 'option'], 
            },
          ],
        },
      ],
    });
    return response;
  }
  public async getQuizBy(quizId: string,user): Promise<Quiz> {
    const response: Quiz = await this.quiz.findAndCountAll({
      where: {
        id: quizId,
      },
      include: [
        {
          model: this.quizQue,
          attributes: ['id', 'question', 'quiz_id',],

          include: [
            {
              model: this.quizAns,
              attributes: ['id', 'QuizQueId', 'option'], 
            },
          ],
        },
      ],
    });
    const scoreData = await this.quizScore.findOne({
      where:{quiz_id:quizId}
    })
    if(scoreData===null){
     var data= await this.quizScore.create({
        score: 0,
        totalQue	: response.count,
        quiz_id : quizId,
        userId: user.id,

      })
    }
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
        include: [
          {
            model: this.quizQue,
          },
        ],
        returning: true,
      }
    );

    return { count: updateQuiz[0], rows: updateQuiz[1] };
  }

  public async AnswerQuiz(
    quizId,
    trainer
  ): Promise<{ isFalse: boolean; data: Quiz }> {
    if (!this.isTrainer(trainer) || !trainer.isEmailVerified)
      throw new HttpException(403, 'Forbidden Resource');

    const updateQuiz = await this.quizAns.findOne({
      where: {
        id: quizId,
      },
    });
    const optionsData = await this.quizAns.findAll({
      where: {
        quiz_que_id: updateQuiz.quizQue_id,
      },
      attributes: ['is_correct', 'option'],
    });

    let isFalse = updateQuiz.is_correct === true ? true : false;
    return { isFalse, data: optionsData };
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
