import { NextFunction, Request, Response } from 'express';
import { Blog } from '@/interfaces/blog.interface';
import BlogService from '@/services/blog.service';

class BlogController {
  public blogService = new BlogService();

  public addBlog = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const blogDetails: Request = req.body;
      const user = req.user;
      const file = req.file;
      const response: Blog = await this.blogService.addBlog({
        blogDetails,
        file,
        user,
      });
      res
        .status(200)
        .send({ response: response, message: 'Blog Added Successfully' });
    } catch (error) {
      next(error);
    }
  };

  public getBlog = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const user = req.user;
      const response: Blog[] = await this.blogService.getBlog({
        user,
      });
      res.status(200).send(response);
    } catch (error) {
      next(error);
    }
  };
  public getBlogAdmin = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const { search, pageRecord, pageNo, sortBy, order } = req.query;
      const queryObject = { search, pageRecord, pageNo, sortBy, order };
      const user = req.user;
      const BlogCatData: {
        totalCount: number;
        records: (Blog | undefined)[];
      } = await this.blogService.getBlogAdmin({
        queryObject,
        user,
      });
      res.status(200).send(BlogCatData);
    } catch (error) {
      next(error);
    }
  };
  public getBlogbyId = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const { blogId } = req.params;
      const user = req.user;
      const response: Blog = await this.blogService.getBlogbyId({
        user,
        blogId,
      });
      res.status(200).send(response);
    } catch (error) {
      next(error);
    }
  };
  public updateBlog = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const blogDetails: Request = req.body;
      const { blogId } = req.params;
      const user = req.user;
      const file = req.file;
      const response: Blog = await this.blogService.updateBlog({
        blogDetails,
        file,
        user,
        blogId,
      });
      res
        .status(200)
        .send({ response: response, message: 'Blog update successfully' });
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
      const user = req.user;
      const { blogId } = req.params;
      const response: { count: number } = await this.blogService.deleteBlog({
        blogId,
        user,
      });
      res
        .status(200)
        .send({ response: response, message: 'Blog Deleted Successfully' });
    } catch (error) {
      next(error);
    }
  };
}
export default BlogController;
