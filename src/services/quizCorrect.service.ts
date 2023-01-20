import { QuizCorrect } from '@/interfaces/quizCorrect.interface';
import DB from '@databases';

class QuizCorrectService {
  public quizQue = DB.QuizQue;
  public quizAns = DB.QuizAns;

  public async CorrectAns(optiondetail): Promise<QuizCorrect> {
    const options = await this.quizAns.findAll({
      where: {
        quiz_que_id: optiondetail.quiz_que_id,
      },

      attributes: ['is_correct', 'option', 'id'],

      include: [{ model: this.quizQue, attributes: ['explanation'] }],
    });
    const selection = await this.quizAns.findOne({
      where: {
        id: optiondetail.option_id,
      },
    });
    const explanation = options[0].QuizQue.explanation;
    const correctOptions = options.filter((option) => option.is_correct);

    const res = correctOptions?.map((elem) => {
      const { QuizQue, ...restRes } = elem?.dataValues;
      return restRes;
    });

    const response = {
      quiz_que_id: optiondetail.quiz_que_id,
      explanation,
      res,
      selected_option: selection.is_correct,
    };
    return response;
  }
}
export default QuizCorrectService;
















// const name=[]
// correctOptions.forEach((elem)=>{
//   console.log(elem)
//   const obj ={
//     is_correct:elem.is_correct,
//     option:elem.option,
//     id:elem.id

//   }
//   name.push(obj)
// })

// const response = {
//   quiz_que_id: optiondetail.quiz_que_id,
//   explanation,
//   correctOption:name,
//   selected_option: selection.is_correct,
// };

