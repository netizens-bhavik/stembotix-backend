import { NextFunction, Request, Response } from 'express';
import { Comment } from '@/interfaces/comment.interface';
import CommentService from '@/services/comment.service';



class CommentController {
  public commentService = new CommentService();

  public addComment = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const {comment,course_id,thumbnail}= req.body;

      const  user  = req.user;
  
      const response: Comment = await this.commentService.addComment({
        comment,
        course_id,
        user,
        thumbnail
      });
      res.status(200).send({response:response,message:"Comment added successfully"});
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
      const response: Comment = await this.commentService.getCommentById(comment_id);
      res.status(200).send(response);
    } catch (err) {
      next(err);
    }
  };
  public viewComment = async (req: Request, res: Response, next: NextFunction) => {
    try {

      const { search, pageRecord, pageNo, sortBy, order } = req.query;
      const queryObject = { search, pageRecord, pageNo, sortBy, order };
      const response: { totalCount: number; records: (Comment | undefined)[] } =
        await this.commentService.viewComment({ search, pageRecord, pageNo, sortBy, order});
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
      const file = req.files
      commentDetail['id'] = comment_id;


      const response = await this.commentService.updateComment(
       { 
        commentDetail,
        file,
      }
    );
      res.status(200).send(response);
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


      const response: { count: number } = await this.commentService.deleteComment({
        comment_id,
        trainer
      });
      res.sendStatus(200).send(response);
    } catch (error) {
      next(error);
    }
  };
  public uploadImage = async (
    req: Request,
    res: Response,
    next: NextFunction
  )=>{
    try{
      res.status(200).send(req.file);
    } catch (error){
      next(error);
    }
  }
}
export default CommentController