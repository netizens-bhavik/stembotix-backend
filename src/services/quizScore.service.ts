// import { QuizScore } from '@/interfaces/quizScore.interface';
// import DB from '@databases';

// class QuizScoreService {
//   public quizScore = DB.QuizScore;
//   public user = DB.User;
//   public quizQue = DB.QuizQue;

//   public async addScore({ quizQueId, user }): Promise<QuizScore> {
//     const record = await this.quizScore.findAll({
//       where: {
//         quiz_que_id: quizQueId,
//       },
//     });
//     const newScore = await this.quizScore.create({
//       user,
//     });
//     return newScore;
//   }
// }
// export default QuizScoreService;
