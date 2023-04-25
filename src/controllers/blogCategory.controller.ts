import { NextFunction, Request, Response } from 'express';
import { BlogCategory } from '@/interfaces/blogCategory.interface';
import BlogCategoryService from '@/services/blogCategory.service';

class BlogCatController {
  public blogCatService = new BlogCategoryService();

  public addBlogCat = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const categoryDetails = req.body;
      const user = req.user;
      const response: BlogCategory = await this.blogCatService.addBlogCat({
        categoryDetails,
        user,
      });
      res
        .status(200)
        .send({ response: response, message: 'Category added successfully' });
    } catch (error) {
      next(error);
    }
  };
  public getBlogCatAdmin = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const { search, pageRecord, pageNo, sortBy, order } = req.query;
      const user = req.user;
      const BlogCatData: {
        totalCount: number;
        records: (BlogCategory | undefined)[];
      } = await this.blogCatService.getBlogCatAdmin(
        {
          search,
          pageRecord,
          pageNo,
          sortBy,
          order,
        },
        { user }
      );
      res.status(200).send(BlogCatData);
    } catch (error) {
      next(error);
    }
  };
  public getBlogCat = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const user = req.user;
      const coursesData: BlogCategory[] = await this.blogCatService.getBlogCat({
        user,
      });
      res.status(200).send(coursesData);
    } catch (error) {
      next(error);
    }
  };

  public updateBlogCat = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const categoryDetails = req.body;
      const { catId } = req.params;
      const user = req.user;
      const response = await this.blogCatService.updateBlogCat({
        catId,
        categoryDetails,
        user,
      });
      res
        .status(200)
        .send({ response: response, message: 'Category updated successfully' });
    } catch (error) {
      next(error);
    }
  };
  public deleteBlogCat = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const { catId } = req.params;
      const user = req.user;
      const response: { count: number } =
        await this.blogCatService.deleteBlogCat(catId, user);
      res.status(200).send(response);
    } catch (error) {
      next(error);
    }
  };
}
export default BlogCatController;
