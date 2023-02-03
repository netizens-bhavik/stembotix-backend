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
      const { courseId } = req.params;
      const user = req.user;
      const file = req.files;
      const response: Comment = await this.commentService.addComment({
        commentDetail,
        user: user,
        file,
        courseId,
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
      const { commentId } = req.params;
      const response: Comment = await this.commentService.getCommentById(
        commentId
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
      const user = req.user;
      const response: { totalCount: number; records: (Comment | undefined)[] } =
        await this.commentService.viewComment(
          {
            search,
            pageRecord,
            pageNo,
            sortBy,
            order,
          },
          { user }
        );
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
      const { commentId } = req.params;
      const commentDetail = req.body;
      const file = req.files;
      commentDetail['id'] = commentId;

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
      const { commentId } = req.params;
      const trainer = req.user;

      const response: { count: number } =
        await this.commentService.deleteComment({
          commentId,
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
