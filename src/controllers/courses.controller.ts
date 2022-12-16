import { NextFunction, Request, Response } from 'express';
import { Course } from '@/interfaces/course.interface';
import CourseService from '@/services/courses.service';

class CourseController {
  public courseService = new CourseService();

  public viewCourses = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const { search, pageRecord, pageNo, sortBy, order } = req.query;
      const coursesData: {
        totalCount: number;
        records: (Course | undefined)[];
      } = await this.courseService.viewCourses({
        search,
        pageRecord,
        pageNo,
        sortBy,
        order,
      });
      res.status(200).send(coursesData);
    } catch (error) {
      next(error);
    }
  };
  public addCourse = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const courseDetails: Request = req.body;
      const trainer = req.user;
      const file = req.files;
      const response: Course = await this.courseService.addCourse({
        courseDetails,
        file,
        trainer,
      });
      res.status(200).send(response);
    } catch (error) {
      next(error);
    }
  };
  public getCourseById = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const { courseId } = req.params;
      const response: Course = await this.courseService.getCourseById(courseId);
      res.status(200).send(response);
    } catch (error) {
      next(error);
    }
  };
  public updateCourse = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const { courseId } = req.params;
      const courseDetails = req.body;
      const file = req.files;
      const trainer = req.user;
      courseDetails['id'] = courseId;
      const response = await this.courseService.updateCourse({
        courseDetails,
        file,
        trainer,
      });
      res.status(200).send(response);
    } catch (error) {
      next(error);
    }
  };
  public deleteCourse = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const trainerData = req.user;
      const { courseId } = req.params;
      const response: { count: number } = await this.courseService.deleteCourse(
        {
          trainer: trainerData,
          courseId,
        }
      );
      res.status(200).send(response);
    } catch (error) {
      next(error);
    }
  };
  public listCourses = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const trainer = req.user;
      const { search, pageRecord, pageNo, sortBy, order } = req.query;
      const queryObject = { search, pageRecord, pageNo, sortBy, order };
      const response: { totalCount: number; records: (Course | undefined)[] } =
        await this.courseService.listCourses({ trainer, queryObject });
      res.status(200).send(response);
    } catch (error) {
      next(error);
    }
  };
  public togglePublish = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const { courseId } = req.params;
      const trainer = req.user;
      const response: { count: number } =
        await this.courseService.togglePublish({
          trainer,
          courseId,
        });
      res.status(200).send(response);
    } catch (error) {
      next(error);
    }
  };
}
export default CourseController;
