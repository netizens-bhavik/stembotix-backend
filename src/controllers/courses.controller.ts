import { NextFunction, Request, Response } from "express";
import { Course } from "@/interfaces/course.interface";
import CourseService from "@/services/courses.service";
import { HttpException } from "@/exceptions/HttpException";
import { nextTick } from "process";

class CourseController {
  public courseService = new CourseService();

  public viewCourses = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const coursesData: (Course | undefined)[] =
        await this.courseService.viewCourses();
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
      const file = req.file;
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
      console.log(req.body);
      const file = req.file;
      const trainer = req.user;
      courseDetails["id"] = courseId;
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
}
export default CourseController;
