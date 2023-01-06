import DB from '@databases';
import { Quiz } from '@/interfaces/quiz.interface';
import { API_BASE } from '@/config';
import { QuizDto } from '@/dtos/quiz.dto';
import { HttpException } from '@exceptions/HttpException';
import { QuizQueDto } from '@/dtos/quizQue.dto';
import { QuizQue } from '@/interfaces/quizQue.interface';
import QuizRoute from '@/routes/quiz.routes';
import { where } from 'sequelize/types';
import { isEmpty } from '@/utils/util';
class QuizService {
  public quiz = DB.Quiz;
  public quizQue = DB.QuizQue;
  public quizAns = DB.QuizAns;
  public quizQueAns = DB.QuizQueAns;
  public curriculum = DB.CurriculumSection;
  public isTrainer(user): boolean {
    return user.role === 'trainer' || user.role === 'admin';
  }

  public async createQuiz(quizData: QuizDto): Promise<Quiz> {
    const newQuiz = await this.quiz.create(quizData);

    return newQuiz;
  }
  public async createQuizQue(quizData: QuizQueDto): Promise<QuizQue> {
    const newQuizQue = await this.quizQue.create(quizData);
    console.log("newQuizQue",newQuizQue.question)
    const op = [];
    quizData.options?.forEach((element: any) => {
      console.log(element);
      const obj = {
        QuizQueId: newQuizQue.id,
        option: element.option,
        is_correct: element.is_correct,
        question:newQuizQue.question
      };
      op.push(obj);
    });

    const res = await this.quizAns.bulkCreate(op);
    return res;
  }
  public async getQuizById(quizId: string): Promise<Quiz> {
    const response: Quiz = await this.quiz.findOne({
      where: {
        id: quizId,
      },
    });
    // console.log("first",response)
    return response;
  }
  public async getQuizQueAnsById(quizQueId: string): Promise<QuizQue> {
    const response: QuizQue = await this.quizQue.findOne({
      where: {
        id: quizQueId,
      },
    });
    return response;
  }
  public async updateQuiz(
    quizDetail
  ): Promise<{ count: number; rows: Quiz[] }> {
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
  public async updateQuizQueAns(
    quizQueAnsDetail
  ): Promise<{ count: number; rows: Quiz[] }> {
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

  public async deleteQuiz({ quizId }): Promise<{ count: number ;row:Quiz[]}> {
    const res: number = await this.quiz.destroy({
      where: {
        id: quizId,
      },
    });
    return { count: res [0],row:res[1]};
  }
  public async deleteQuizQueAns({ quizQueId }): Promise<{ count: number ;row:QuizQue}> {
    const res: number = await this.quizQue.destroy({
      where: {
        id: quizQueId,
      },
    });
    return { count: res[0], row:res[1]};
  }

  public async listQuiz({
    user
    queryObject,
  }):Promise<{totalCount:number;record:(QuizQue|undefined)[]}>{
    if (isEmpty(user) || !this.isTrainer(user))
    throw new HttpException(401, 'Unauthorized');
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
 
    const quizRecord=await this.quiz.findOne({
where:{quiz_id:quiz.id}
    })
    const quizCount=await this.quizQue.findAndCountAll({
      include:[
        {
          model:this.quiz;
          where:{
            quiz_id:quizRecord.quiz_id
          }
        }
      ]
    })
    const Quiz =await this.quizQue.findAll({
      where:DB.Sequelize.or(
        {

        }
      )
    })
    
  }
 

}

export default QuizService;
