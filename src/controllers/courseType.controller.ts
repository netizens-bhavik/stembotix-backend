import { Coursetype } from '@/interfaces/courseType.interface';
import CourseTypeService from '@/services/courseType.service';
import DB from '@databases';
import { NextFunction, Request, Response } from 'express';

class CourseTypeController {
  public coursetypeservice = new CourseTypeService();
  public user = DB.User;
  public coursetype = DB.CourseType;

  public addCourseType = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const user = req.user;
      const coursetype = req.body;
      const response = await this.coursetypeservice.addCourseType(
        coursetype,
        user
      );
      res
        .status(200)
        .send({ response: response, message: 'Coursetype Added Successfully' });
    } catch (err) {
      next(err);
    }
  };
  public viewAllCourseType = async (
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
        records: (Coursetype | undefined)[];
      } = await this.coursetypeservice.viewAllCourseType(user, queryObject);
      res.status(200).send(response);
    } catch (err) {
      next(err);
    }
  };
  public listCourseType = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const user = req.user;
      const response: {
        totalCount: number;
        records: (Coursetype | undefined)[];
      } = await this.coursetypeservice.listCourseType(user);
      res.status(200).send(response);
    } catch (err) {
      next(err);
    }
  };
  public updateCourseType = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const user = req.user;
      const { coursetypeId } = req.params;
      const coursetypeDetail = req.body;

      const updateCourseType = await this.coursetypeservice.updateCourseType(
        user,
        coursetypeId,
        coursetypeDetail
      );
      res.status(200).send(updateCourseType);
    } catch (error) {
      next(error);
    }
  };
  public deleteCourseType = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const { courseTypeId } = req.params;
      const user = req.user;
      const response: { count: number } =
        await this.coursetypeservice.deleteCourseType(courseTypeId, user);
      res.status(200).send(response);
    } catch (error) {
      next(error);
    }
  };
  public viewCourseByCourseTypeIdByAdmin = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const user = req.user;
      const { courseTypeId } = req.params;
      const { search, pageRecord, pageNo, sortBy, order } = req.query;
      const queryObject = { search, pageRecord, pageNo, sortBy, order };
      const response: {
        totalCount: number;
        records: (Coursetype | undefined)[];
      } = await this.coursetypeservice.viewCourseByCourseTypeIdByAdmin({user, queryObject,courseTypeId});
      res.status(200).send(response);
    } catch (err) {
      next(err);
    }
  };
  
  public viewCourseByCourseTypeId = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const { courseTypeId } = req.params;
      const response: {
        totalCount: number;
        records: (Coursetype | undefined)[];
      } = await this.coursetypeservice.viewCourseByCourseTypeId(courseTypeId);
      res.status(200).send(response);
    } catch (err) {
      next(err);
    }
  };

}
export default CourseTypeController;
