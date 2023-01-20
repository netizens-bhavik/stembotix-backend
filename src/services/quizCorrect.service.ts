import { QuizCorrect } from '@/interfaces/quizCorrect.interface';
import DB from '@databases';

class QuizCorrectService {
  public quizQue = DB.QuizQue;
  public quizAns = DB.QuizAns;
  public quizScore = DB.QuizScore;

  public async CorrectAns(optiondetail, quizId): Promise<QuizCorrect> {
    const options = await this.quizAns.findAll({
      where: {
        quiz_que_id: optiondetail.quiz_que_id,
      },

      attributes: ['is_correct', 'option', 'id'],

      include: [
        { model: this.quizQue, attributes: ['quiz_id', 'explanation'] },
      ],
    });

    const selection = await this.quizAns.findOne({
      where: {
        id: optiondetail.option_id,
      },
    });
    const findScore = await this.quizScore.findOne({
      where: { quiz_id: quizId },
    });
    if (selection.is_correct === true) {
      const scoreObject = {
        score: findScore?.score + 1,
        option_id: optiondetail.option_id,
      };
      var scoreData = await this.quizScore.update(
        {
          ...scoreObject,
        },
        {
          where: { quiz_id: quizId },
          returning: true,
        }
      );
    }
    const explain = options[0].QuizQue;
    const correctOptions = options.filter((option) => option.is_correct);
    const res = correctOptions?.map((elem) => {
      const { QuizQue, ...restRes } = elem?.dataValues;
      return restRes;
    });
    const response = {
      quiz_que_id: optiondetail.quiz_que_id,
      explain,
      res,
      selected_option: selection.is_correct,
      scoreData,
    };
    return response;
  }

  public async addScore(optiondetail, quizId): Promise<QuizCorrect> {
    const selection = await this.quizAns.findOne({
      where: {
        id: optiondetail.option_id,
      },
    });
    const findScore = await this.quizScore.findOne({
      where: { quiz_id: quizId }, 
    });
    if (selection.is_correct === true) {
      const scoreObject = {
        score: findScore?.score + 1,
        option_id: optiondetail.option_id,
      };
      var scoreData = await this.quizScore.update(
        {
          ...scoreObject,
        },
        {
          where: { quiz_id: quizId },
          attributes:["score"],
          returning: true,
        }
      );
    }
    return scoreData;
  }

  public async getScoreByQuizId(quizId):Promise<QuizCorrect>{
    const response:QuizCorrect = await this.quizScore.findOne({
      where:{quiz_id:quizId},
      attributes:['score','total_que']
    })
    return response
  }
}
export default QuizCorrectService;
