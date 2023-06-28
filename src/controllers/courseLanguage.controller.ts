import { CourseLanguage } from '@/interfaces/courseLanguage.interface';
import CourseLanguageService from '@/services/courseLanguage.service';
import DB from '@databases';
import { NextFunction, Request, Response } from 'express';

class CourseLanguageController {
  public courseLanguageservice = new CourseLanguageService();
  public user = DB.User;
  public coursetype = DB.CourseType;

  public addCourseLanguage = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const user = req.user;
      const { language } = req.body;
      const response = await this.courseLanguageservice.addCourseLanguage(
        language,
        user
      );
      res.status(200).send({
        response: response,
        message: 'Course Language Added Successfully',
      });
    } catch (err) {
      next(err);
    }
  };
  public viewAllCourseLanguage = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const user = req.user;
      const { search, pageRecord, pageNo, sortBy, order } = req.query;
      const queryObject = { search, pageRecord, pageNo, sortBy, order };
      const response: {
        totalCount: number;
        records: (CourseLanguage | undefined)[];
      } = await this.courseLanguageservice.viewAllCourseLanguage(
        user,
        queryObject
      );
      res.status(200).send(response);
    } catch (err) {
      next(err);
    }
  };
  public listCourseLanguage = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const user = req.user;
      const response: {
        totalCount: number;
        records: (CourseLanguage | undefined)[];
      } = await this.courseLanguageservice.listCourseLanguage(user);
      res.status(200).send(response);
    } catch (err) {
      next(err);
    }
  };
  public updateCourseLanguage = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const user = req.user;
      const { languageId } = req.params;
      const languageDetail = req.body;

      const updateCourseLanguage =
        await this.courseLanguageservice.updateCourseLanguage(
          user,
          languageId,
          languageDetail
        );
      res.status(200).send(updateCourseLanguage);
    } catch (error) {
      next(error);
    }
  };
  public deleteCourseLevel = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const { languageId } = req.params;
      const user = req.user;
      const response: { count: number } =
        await this.courseLanguageservice.deleteCourseLanguage(languageId, user);
      res.status(200).send(response);
    } catch (error) {
      next(error);
    }
  };
}
export default CourseLanguageController;
