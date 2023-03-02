import CourseTypeService from '@/services/courseType.service';
import DB from '@databases';
import { NextFunction, Request, Response } from 'express';

class CourseTypeController {
  public coursetypeservice = new CourseTypeService();
  public user = DB.User;
  public coursetype = DB.CourseType

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
      const response = await this.coursetypeservice.viewAllCourseType(user);
      res.status(200).send(response);
    } catch (err) {
      next(err);
    }
  };
}
export default CourseTypeController;
