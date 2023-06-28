import { CourseLevel } from '@/interfaces/courseLevel.interface';
import CourseLevelService from '@/services/courseLevel.service';
import DB from '@databases';
import { NextFunction, Request, Response } from 'express';

class CourseLevelController {
  public courseLevelservice = new CourseLevelService();
  public user = DB.User;
  public coursetype = DB.CourseType;

  public addCourseLevel = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const user = req.user;
      const { level } = req.body;
      const response = await this.courseLevelservice.addCourseLevel(
        level,
        user
      );
      res.status(200).send({
        response: response,
        message: 'Course Level Added Successfully',
      });
    } catch (err) {
      next(err);
    }
  };
  public viewAllCourseLevel = async (
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
        records: (CourseLevel | undefined)[];
      } = await this.courseLevelservice.viewAllCourseLevel(user, queryObject);
      res.status(200).send(response);
    } catch (err) {
      next(err);
    }
  };
  public listCourseLevel = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const user = req.user;
      const response: {
        totalCount: number;
        records: (CourseLevel | undefined)[];
      } = await this.courseLevelservice.listCourseLevel(user);
      res.status(200).send(response);
    } catch (err) {
      next(err);
    }
  };
  public updateCourseLevel = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const user = req.user;
      const { levelId } = req.params;
      const levelDetail = req.body;

      const updateCourseLevel = await this.courseLevelservice.updateCourseLevel(
        user,
        levelId,
        levelDetail
      );
      res.status(200).send(updateCourseLevel);
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
      const { levelId } = req.params;
      const user = req.user;
      const response: { count: number } =
        await this.courseLevelservice.deleteCourseLevel(levelId, user);
      res.status(200).send(response);
    } catch (error) {
      next(error);
    }
  };
}
export default CourseLevelController;
