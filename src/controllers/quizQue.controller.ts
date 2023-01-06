import { NextFunction, Request, RequestHandler, Response } from 'express';
import { QuizQue } from '@/interfaces/quizQue.interface';
import QuizQueService from '@/services/quizQue.service';
import { ParamsDictionary } from 'express-serve-static-core';
import { ParsedQs } from 'qs';
import { QuizOption } from '@/interfaces/quizOption.interface';

class QuizQueController {
  public quizQueService = new QuizQueService();
  public quizOptionService = new QuizQueService()

  public createQuizQue = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const quizQueData = req.body;
      const users = req.user;
      const quizQue = {
        ...quizQueData,
        QuizId:req.body.quiz_id

      };
      const response =await this.quizQueService.createQuizQuestion(quizQue,quizQue)
      res.status(200).send(response)
    } catch (err) {
      next(err);
    }
    
  };



  public createQuizOption = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const quizOptionData = req.body;
      const users = req.user;
      const quizOption = {
        ...quizOptionData,
        QuizQueId:req.body.quizQue_id

      };
      const response =await this.quizOptionService.createQuizOption(quizOption)
      res.status(200).send(response)
    } catch (err) {
      next(err);
    }
}




  // public getQuizQueById = async (
  //   req: Request,
  //   res: Response,
  //   next: NextFunction
  // ) => {
  //   try {
  //     const { quizQueId } = req.params;
  //     const response: QuizQue = await this.quizQueService.getQuizQueById(quizQueId);
  //     res.status(200).send(response);
  //   } catch (err) {
  //     next(err);
  //   }
  // };





  public getQuizOptionById = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const { quizAnsId } = req.params;
      const response: QuizOption = await this.quizOptionService.getQuizOptionById(quizAnsId);
      res.status(200).send(response);
    } catch (err) {
      next(err);
    }
  };





  public updateQuizQues = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const { quizQueId } = req.params;
      const quizQueDetail = req.body;
      quizQueDetail['id'] = quizQueId;


      const update = await this.quizQueService.updateQuizQue(quizQueDetail);
      res.status(200).send(update);
    } catch (err) {
      next(err);
    }
  };

  public updateQuizAns = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const { quizAnsId } = req.params;
      const quizAnsDetail = req.body;
      quizAnsDetail['id'] = quizAnsId;


      const update = await this.quizOptionService.updateQuizOption(quizAnsDetail);
      res.status(200).send(update);
    } catch (err) {
      next(err);
    }
  };




  public deleteQuizQue = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const { quizQueId } = req.params;
      const response: { count: number } = await this.quizQueService.deleteQuizQue({
        quizQueId,
      });
      res.status(200).send(response);
    } catch (error) {
      next(error);
    }
  };

  public deleteQuizOption = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const { quizAnsId } = req.params;
      const response: { count: number } = await this.quizOptionService.deleteQuizOption({
        quizAnsId,
      });
      res.status(200).send(response);
    } catch (error) {
      next(error);
    }
  };


}
export default QuizQueController
