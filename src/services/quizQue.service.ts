import DB from '@databases';
import { QuizQue } from '@/interfaces/quizQue.interface';
import { QuizQueDto } from '@/dtos/quizQue.dto';
import { HttpException } from '@/exceptions/HttpException';
import { QuizOptionDto } from '@/dtos/quizOption.dto';
import { QuizOption } from '@/interfaces/quizOption.interface';

class QuizQueService {
  public quiz = DB.Quiz;
  public quizQue = DB.QuizQue;
  public quizAns = DB.QuizAns;
  public quizQueAns = DB.QuizQueAns;

  public async createQuizQuestion(
    quizData: QuizQueDto,
    quizQue_id
  ): Promise<QuizQue> {
    const newQuizQue = await this.quizQue.create(quizData);
    const op = [];
    quizData.options?.forEach((element: any) => {
      console.log(element);
      const obj = {
        QuizQueId: newQuizQue.id,
        option: element.option,
        is_correct: element.is_correct,
      };
      op.push(obj);
    });
    const res = await this.quizAns.bulkCreate(op);
    return res;
  
  }
  
    
 
  // public async createQuizQue(quizData: QuizQueDto): Promise<QuizQue> {
  //   const newQuizQue = await this.quizQue.create(quizData);
    

  public async createQuizOption(
    quizOption: QuizOptionDto
  ): Promise<QuizOption> {
    const newOption = await this.quizAns.create(quizOption);
    if (newOption === quizOption) {
    }
    return newOption;
  }

  // public async getQuizQueById(quizQueId: string): Promise<QuizQue> {
  //   const response: QuizQue = await this.quizQue.findOne({
  //     where: {
  //       id: quizQueId,
  //     },
  //   });
  //   return response;
  // }

  public async getQuizOptionById(quizAnsId: string): Promise<QuizOption> {
    const response: QuizOption = await this.quizAns.findOne({
      where: {
        id: quizAnsId,
      },
    });
    return response;
  }

  public async updateQuizQue(
    quizQueDetail
  ): Promise<{ count: number; rows: QuizQue[] }> {
    const updateQuizQue = await this.quizQue.update(
      {
        ...quizQueDetail,
      },
      {
        where: {
          id: quizQueDetail.id,
        },
        returning: true,
      }
    );

    return { count: updateQuizQue[0], rows: updateQuizQue[1] };
  }

  public async updateQuizOption(
    quizOptionDetails
  ): Promise<{ count: number; rows: QuizOption[] }> {
    const updateQuizOption = await this.quizAns.update(
      {
        ...quizOptionDetails,
      },
      {
        where: {
          id: quizOptionDetails.id,
        },
        returning: true,
      }
    );

    return { count: updateQuizOption[0], rows: updateQuizOption[1] };
  }

  public async deleteQuizQue({ quizQueId }): Promise<{ count: number }> {
    const res: number = await this.quizQue.destroy({
      where: {
        id: quizQueId,
      },
    });
    return { count: res };
  }

  public async deleteQuizOption({ quizAnsId }): Promise<{ count: number }> {
    const res: number = await this.quizAns.destroy({
      where: {
        id: quizAnsId,
      },
    });
    return { count: res };
  }
}

export default QuizQueService;
