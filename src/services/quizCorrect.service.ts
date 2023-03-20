import { HttpException } from '@/exceptions/HttpException';
import { QuizCorrect } from '@/interfaces/quizCorrect.interface';
import DB from '@databases';

class QuizCorrectService {
  public quizQue = DB.QuizQue;
  public quizAns = DB.QuizAns;
  public quizScore = DB.QuizScore;
  public attemptQuizQue = DB.AttemptQuizQue;

  public async CorrectAns(optiondetail, quizId, user): Promise<QuizCorrect> {
    const options = await this.quizAns.findAll({
      where: {
        quiz_que_id: optiondetail.quiz_que_id,
      },

      attributes: ['is_correct', 'option', 'id'],

      include: [
        { model: this.quizQue, attributes: ['quiz_id', 'explanation'] },
      ],
    });

    const findQueQuizId = await this.quizQue.findByPk(optiondetail.quiz_que_id);

    const queQuizId = findQueQuizId.quiz_id;

    const [attemptQuizQue, created] = await this.attemptQuizQue.findOrCreate({
      where: {
        quiz_que_id: optiondetail.quiz_que_id,
        userId: user.id,
        deletedAt: null,
        quiz_id: queQuizId,
      },
      defaults: {
        quiz_que_id: optiondetail.quiz_que_id,
        userId: user.id,
        isAttempted: true,
        quiz_id: queQuizId,
      },
    });

    if (!created) {
      await this.attemptQuizQue.destroy({
        where: {
          userId: user.id,
          quiz_id: queQuizId,
        },
      });

      await this.attemptQuizQue.create({
        quiz_que_id: optiondetail.quiz_que_id,
        userId: user.id,
        isAttempted: true,
        quiz_id: queQuizId,
      });
    }

    // const isAlreadyAttempted = await this.attemptQuizQue.findOne({
    //   quiz_que_id: optiondetail.quiz_que_id,
    //   userId: user.id,
    //   isAttempted: true,
    //   quiz_id: queQuizId,
    // })

    // if(isAlreadyAttempted){
    //   throw new HttpException(400, 'Already Attempted');
    // }

    const totalAttemptQuizQue = await this.attemptQuizQue.findAndCountAll({
      where: { userId: user.id, quiz_id: queQuizId },
    });

    const selection = await this.quizAns.findOne({
      where: {
        id: optiondetail.option_id,
      },
    });
    const findScore = await this.quizScore.findOne({
      where: { quiz_id: quizId },
    });
    if (findScore) {
      var totalQuizQues = await this.quizQue.findAndCountAll({
        where: {
          quiz_id: quizId,
        },
      });

      const totalAttemptQuizQue = await this.attemptQuizQue.findAndCountAll({
        where: { userId: user.id, quiz_id: quizId },
      });

      var isCompleted =
        totalQuizQues?.count === totalAttemptQuizQue.count ? true : false;
    }
    if (selection.is_correct === true) {
      const scoreObject = {
        score: findScore?.score + 1,
      };

      await this.quizScore.update(
        {
          ...scoreObject
        },
        {
          where: { quiz_id: quizId },
          returning: true,
        }
      );
    }
    const scoreDataUpdate = await this.quizScore.update(
      {
        isCompleted: isCompleted,
      },
      {
        where: { quiz_id: quizId },
        returning: true,
      }
    );
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
    };
    return response;
  }

  // public async addScore(optiondetail, quizId, user): Promise<QuizCorrect> {
  //   const selection = await this.quizAns.findOne({
  //     where: {
  //       id: optiondetail.option_id,
  //     },
  //   });
  //   const findScore = await this.quizScore.findOne({
  //     where: { quiz_id: quizId },
  //   });
  //   console.log(findScore);
  //   // if (findScore) {
  //   let totalQuizQues = await this.quizQue.findAndCountAll({
  //     where: {
  //       quiz_id: quizId,
  //     },
  //   });
  //   console.log('totalQuizQues', totalQuizQues);

  //   const totalAttemptQuizQue = await this.attemptQuizQue.findAndCountAll({
  //     where: { userId: user.id, quiz_id: quizId },
  //   });

  //   console.log('totalAttemptQuizQue', totalAttemptQuizQue);

  //   let isCompleted =
  //     totalQuizQues?.count === totalAttemptQuizQue.count ? true : false;
  //   console.log('isCompleted', isCompleted);
  //   // }

  //   if (selection.is_correct === true) {
  //     const scoreObject = {
  //       score: findScore?.score + 1,
  //       option_id: optiondetail.option_id,
  //     };
  //     var scoreData = await this.quizScore.update(
  //       {
  //         ...scoreObject,
  //       },
  //       {
  //         where: { quiz_id: quizId },
  //         attributes: ['score'],
  //         returning: true,
  //       }
  //     );
  //   }

  //   const scoreDataUpdate = await this.quizScore.update(
  //     {
  //       isCompleted: isCompleted,
  //     },
  //     {
  //       where: { quiz_id: quizId, user_id: user.id },
  //       returning: true,
  //     }
  //   );

  //   console.log('scoreDataUpdate', scoreDataUpdate);

  //   return scoreData;
  // }

  public async getScoreByQuizId(quizId) {
    let response = await this.quizScore.findOne({
      where: { quiz_id: quizId },
      attributes: ['score', 'total_que', 'isCompleted'],
    });
    if (!response) throw new HttpException(404, 'No score Exist');

    return response;
  }
}
export default QuizCorrectService;
