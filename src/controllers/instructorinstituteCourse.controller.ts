import AllCourseForInstituteService from '@/services/instructorinstituteCourse.service';
import { NextFunction, Request, Response } from 'express';

class AllCourseForInstituteController {
  public instruinstitu = new AllCourseForInstituteService();

  public getAllCourseForInstitute = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const loggedUser = req.user;
      const response = await this.instruinstitu.getAllCourseForInstitute(
        loggedUser
      );
      res.status(200).send(response);
    } catch (error) {
      next(error);
    }
  };
  public getAllCourseForInstitutebyAdmin = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const loggedUser = req.user;
      const { search, pageRecord, pageNo, sortBy, order } = req.query;
      const queryObject = { search, pageRecord, pageNo, sortBy, order };

      const response = await this.instruinstitu.getAllCoursebyInstitute(
        loggedUser,
        queryObject
      );

      res.status(200).send(response);
    } catch (error) {
      next(error);
    }
  };
}
export default AllCourseForInstituteController;
