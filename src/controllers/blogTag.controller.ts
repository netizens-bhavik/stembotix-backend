import { NextFunction, Request, Response } from 'express';
import { BlogTag } from '@/interfaces/blogTag.interface';
import BlogTagService from '@/services/blogTag.service';

class BlogTagController {
  public blogTagService = new BlogTagService();

  public addBlogTag = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const tag = req.body;
      const user = req.user;
      const response: BlogTag = await this.blogTagService.addBlogTags({
        tag,
        user,
      });
      res
        .status(200)
        .send({ response: response, message: 'Tag added successfully' });
    } catch (error) {
      next(error);
    }
  };
  public getBlogTagsAdmin = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const { search, pageRecord, pageNo, sortBy, order } = req.query;
      const user = req.user;
      const coursesData: {
        totalCount: number;
        records: (BlogTag | undefined)[];
      } = await this.blogTagService.getBlogTagsAdmin(
        {
          search,
          pageRecord,
          pageNo,
          sortBy,
          order,
        },
        { user }
      );
      res.status(200).send(coursesData);
    } catch (error) {
      next(error);
    }
  };
  public getBlogTags = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const user = req.user;
      const coursesData: BlogTag[] = await this.blogTagService.getBlogTags({
        user,
      });
      res.status(200).send(coursesData);
    } catch (error) {
      next(error);
    }
  };

  public updateBlogTag = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const tags = req.body;
      const { tagId } = req.params;
      console.log(req.query);
      const user = req.user;
      const response = await this.blogTagService.updateBlogTags({
        tagId,
        tags,
        user,
      });
      res
        .status(200)
        .send({ response: response, message: 'Tag updated successfully' });
    } catch (error) {
      next(error);
    }
  };
  public deleteBlogTag = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const { tagId } = req.params;
      const user = req.user;
      const response: { count: number } =
        await this.blogTagService.deleteBlogTag(tagId, user);
      res.status(200).send(response);
    } catch (error) {
      next(error);
    }
  };
}
export default BlogTagController;
