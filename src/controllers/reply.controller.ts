import { NextFunction, Request, Response } from 'express';
import { Reply } from '@/interfaces/reply.interface';
import ReplyService from '@/services/reply.service';



class Replycontroller {
    public replyService= new ReplyService()



    public addReply = async(
        req: Request,
        res: Response,
        next: NextFunction
    )=>{
        try {
            const replyDetail = req.body
            const  user  = req.user;
            const file = req.files;

            const response : Reply = await this.replyService.addReply({
                replyDetail,
                user:user,
                file
            })
            res.status(200).send({response:response,message:"Reply Successfully"})
        }catch (error){
            next(error)
        }
        
    }
    public getReplyById = async (
        req: Request,
        res: Response,
        next: NextFunction
      ) => {
        try {
          const { reply_id } = req.params;
          const response: Reply = await this.replyService.getReplyById(reply_id);
          res.status(200).send(response);
        } catch (err) {
          next(err);
        }
      };
      public viewReply = async (req: Request, res: Response, next: NextFunction) => {
        try {
    
          const { search, pageRecord, pageNo, sortBy, order } = req.query;
          const queryObject = { search, pageRecord, pageNo, sortBy, order };
          const response: { totalCount: number; records: (Reply | undefined)[] } =
            await this.replyService.viewReply({ search, pageRecord, pageNo, sortBy, order});
          res.status(200).send(response);
        } catch (error) {
          next(error);
        }
      };

      public updateReply = async (
        req: Request,
        res: Response,
        next: NextFunction
      ) => {
        try {
          const { reply_id } = req.params;
          const replyDetail = req.body;
          const file = req.files
          replyDetail['id'] = reply_id;
    
    
          const response = await this.replyService.updateReply(
            replyDetail,
            file
        );
          res.status(200).send(response);
        } catch (err) {
          next(err);
        }
      };
      public deleteReply = async (
        req: Request,
        res: Response,
        next: NextFunction
      ) => {
        try {
          const { reply_id } = req.params;
          const trainer = req.user;
    
    
          const response: { count: number } = await this.replyService.deleteReply({
            reply_id,
            trainer
          });
          res.sendStatus(200).send(response);
        } catch (error) {
          next(error);
        }
      };

}
export default Replycontroller