import DB from '@databases';
import { NextFunction, Request, Response } from 'express';
import { Comment } from '@/interfaces/comment.interface';
import CommentService from '@/services/comment.service';

class CommentController {
  public commentService = new CommentService();
  public user = DB.User;

  public addComment = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const commentDetail = req.body;
      const {course_id}= req.params
      const user = req.user;
      const file = req.files;
      const response: Comment = await this.commentService.addComment({
        commentDetail,
        user: user,
        file,
        course_id
      });
      res
        .status(200)
        .send({ response: response, message: 'Comment added successfully' });
    } catch (error) {
      next(error);
    }
  };

  public getCommentById = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const { comment_id } = req.params;
      const response: Comment = await this.commentService.getCommentById(
        comment_id
      );
      res.status(200).send(response);
    } catch (err) {
      next(err);
    }
  };
  public viewComment = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const { search, pageRecord, pageNo, sortBy, order } = req.query;
      const queryObject = { search, pageRecord, pageNo, sortBy, order };
      const response: { totalCount: number; records: (Comment | undefined)[] } =
        await this.commentService.viewComment({
          search,
          pageRecord,
          pageNo,
          sortBy,
          order,
          queryObject,
        });
      res.status(200).send(response);
    } catch (error) {
      next(error);
    }
  };

  public updateComment = async (
    req: Request,
    res: Response,
    next: NextFunction
    ) => {
      try {
      const { comment_id } = req.params;
      const commentDetail = req.body;
      const file = req.files;
      commentDetail['id'] = comment_id;

      const response = await this.commentService.updateComment({
        commentDetail,
        file,
      });
      res
        .status(200)
        .send({ response: response, message: 'Comment update successfully' });
    } catch (err) {
      next(err);
    }
  };

  public deleteComment = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const { comment_id } = req.params;
      const trainer = req.user;

      const response: { count: number } =
        await this.commentService.deleteComment({
          comment_id,
          trainer,
        });
      res
        .status(200)
        .send({ response: response, message: 'Comment deleted successfully' });
    } catch (error) {
      next(error);
    }
  };
}
export default CommentController;
