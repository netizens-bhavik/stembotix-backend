import { NextFunction, Request, Response } from 'express';
import DB from '@databases';

import { Quiz } from '@/interfaces/quiz.interface';
import QuizService from '@services/quiz.service';

class QuizController {
  public quizService = new QuizService();
  public user = DB.User;

  public createQuiz = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const quizData = req.body;
      const trainer = req.user;

      const quizData2 = {
        ...quizData,
        CurriculumSectionId: req.body.curriculum_section_id,
      };
      const response = await this.quizService.createQuiz(quizData2, trainer);
      res
        .status(200)
        .send({ response: response, message: 'Quiz Added Successfully' });
    } catch (err) {
      next(err);
    }
  };

  public getQuizBycurriculumId = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const { search, pageRecord, pageNo, sortBy, order } = req.query;
      const { curriculumId } = req.params;

      const queryObject = { search, pageRecord, pageNo, sortBy, order };
      const response: {
        totalCount: number;
        records: (Quiz | undefined)[];
      } = await this.quizService.getQuizBycurriculumId(
        queryObject,
        curriculumId
      );
      res.status(200).send(response);
    } catch (err) {
      next(err);
    }
  };
  public getQuizByIdAdmin = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const { search, pageRecord, pageNo, sortBy, order } = req.query;
      const queryObject = { search, pageRecord, pageNo, sortBy, order };
      const { quizId } = req.params;
      const user = req.user;
      const response: { totalCount: number; records: (Quiz | undefined)[] } =
        await this.quizService.getQuizByIdAdmin(quizId, queryObject);
      res.status(200).send(response);
    } catch (err) {
      next(err);
    }
  };
  public getQuizById = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const { quizId } = req.params;
      const user = req.user;
      const response = await this.quizService.getQuizById(quizId, user);
      res.status(200).send(response);
    } catch (err) {
      next(err);
    }
  };
  //   public getQuizById = async (
  //   req: Request,
  //   res: Response,
  //   next: NextFunction
  // ) => {
  //   try {
  //     const { quizId } = req.params;
  //     const user = req.user;
  //     const response :{ totalCount: number; records: (Quiz | undefined)[]}= await this.quizService.getQuizById(quizId, user);
  //     res.status(200).send(response);
  //   } catch (err) {
  //     next(err);
  //   }
  // };
  // public getQuizBy = async (
  //   req: Request,
  //   res: Response,
  //   next: NextFunction
  // ) => {
  //   try {
  //     const { quizId } = req.params;
  //     const user = req.user;
  //     const response = await this.quizService.getQuizBy(quizId, user);
  //     res.status(200).send(response);
  //   } catch (err) {
  //     next(err);
  //   }
  // };

  public updateQuiz = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const { quizId } = req.params;
      const quizDetail = req.body;
      const trainer = req.user;

      quizDetail['id'] = quizId;

      const update = await this.quizService.updateQuiz(quizDetail, trainer);
      res
        .status(200)
        .send({ response: update, message: 'Quiz Added Successfully' });
    } catch (err) {
      next(err);
    }
  };

  public AnswerQuiz = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const { quizId } = req.params;
      const trainer = req.user;

      const update = await this.quizService.AnswerQuiz(quizId, trainer);
      res.status(200).send(update);
    } catch (err) {
      next(err);
    }
  };

  public deleteQuiz = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const { quizId } = req.params;
      const trainer = req.user;

      const response: { count: number } = await this.quizService.deleteQuiz({
        quizId,
        trainer,
      });
      res
        .status(200)
        .send({ response: response, message: 'Quiz Deleted Successfully' });
    } catch (error) {
      next(error);
    }
  };

  public viewQuiz = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { search, pageRecord, pageNo, sortBy, order } = req.query;
      const response: { totalCount: number; records: (Quiz | undefined)[] } =
        await this.quizService.viewQuiz({
          search,
          pageRecord,
          pageNo,
          sortBy,
          order,
        });
      res.status(200).send(response);
    } catch (error) {
      next(error);
    }
  };
  public createQuizCompletetion = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const { quizId } = req.params;
      const user = req.user;
      const response = await this.quizService.createQuizCompletetion(
        quizId,
        user
      );
      res.status(200).send({ response: response, message: 'Quiz completed' });
    } catch (error) {
      next(error);
    }
  };
}
export default QuizController;

// exports.completeQuiz = async (req, res) => {
//   const { id } = req.params;
//   try {
//     // Update the quiz and set completed to true
//     await Quiz.update(
//       { completed: true, completedAt: new Date() },
//       { where: { id } }
//     );
//     res.send({ message: 'Quiz completed' });
//   } catch (error) {
//     res.status(500).send({ error: 'Error completing quiz' });
//   }
// };
