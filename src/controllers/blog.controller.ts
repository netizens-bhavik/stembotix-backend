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
}
export default BlogController;
