import { Router } from 'express';
import CourseController from '@/controllers/courses.controller';
import validationMiddleware from '@middlewares/validation.middleware';
import { Routes } from '@interfaces/routes.interface';
import passport from 'passport';
import passportConfig from '@/config/passportConfig';
import { AddCourseDTO } from '@/dtos/course.dto';
import { uploadFiles } from '@/rest/fileUpload';

class CourseRoute implements Routes {
  public path = '/courses';
  public router = Router();
  public courseController = new CourseController();
  public passport = passportConfig(passport);

  constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes() {
    // view all courses with pagination (without bearer)
    this.router.get(`${this.path}`, this.courseController.viewCourses);

    // view all courses by admin with pagination (without bearer)
    this.router.get(
      `${this.path}/admin`,
      this.courseController.viewCoursesAdmin
    );

    // view own courses
    this.router.get(
      `${this.path}/list/`,
      passport.authenticate('jwt', { session: false }),
      this.courseController.listCourses
    );
    // view single course details
    this.router.get(
      `${this.path}/:courseId`,
      this.courseController.getCourseById
    );
    // View all comment by course id 
    this.router.get(
      `${this.path}/:courseId/comments`,
      this.courseController.getCommentByCourseId
    );
    // add course (by trainer only)
    this.router.post(
      `${this.path}`,
      [
        passport.authenticate('jwt', { session: false }),
        uploadFiles.fields([
          { name: 'trailer', maxCount: 1 },
          { name: 'thumbnail', maxCount: 1 },
        ]),
        (req, res, next) => {
          req.body.price = Number(req.body.price);
          next();
        },
        validationMiddleware(AddCourseDTO, 'body'),
      ],
      this.courseController.addCourse
    );
    // edit own course details
    this.router.put(
      `${this.path}/:courseId`,
      [
        passport.authenticate('jwt', { session: false }),
        uploadFiles.fields([{ name: 'thumbnail' }, { name: 'trailer' }]),
        (req, res, next) => {
          req.body.price = Number(req.body.price);
          next();
        },
        validationMiddleware(AddCourseDTO, 'body'),
      ],
      this.courseController.updateCourse
    );
    // toggle course visibility
    this.router.put(
      `${this.path}/toggle-publish/:courseId`,
      passport.authenticate('jwt', { session: false }),
      this.courseController.togglePublish
    );
    // delete own course (only when unpublished)
    this.router.delete(
      `${this.path}/:courseId`,
      passport.authenticate('jwt', { session: false }),
      this.courseController.deleteCourse
    );
  }
}
export default CourseRoute;
