import { TermsConditioninterface } from '@/interfaces/terms&condition.interface';
import TermsConditionService from '@/services/terms&condition.service';
import { NextFunction, Request, Response } from 'express';

class TermsConditionController {
  public termsAndConditionServ = new TermsConditionService();

  public addTermsAndCondition = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const user = req.user;
      const content = req.body;
      const response = await this.termsAndConditionServ.addTermsAndCondition(
        content,
        user
      );
      res.status(200).send({
        response: response,
        message: 'Terms & Condition Added Successfully',
      });
    } catch (err) {
      next(err);
    }
  };

  public getTermsAndCondition = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const user = req.user;
      const termsData: TermsConditioninterface[] =
        await this.termsAndConditionServ.getTermsAndCondition({
          user,
        });
      res.status(200).send(termsData);
    } catch (error) {
      next(error);
    }
  };

  public updateTermsAndCondition = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const termDetails = req.body;
      const { termId } = req.params;
      const user = req.user;
      const response = await this.termsAndConditionServ.updateTermsAndCondition(
        {
          termId,
          termDetails,
          user,
        }
      );
      res.status(200).send({
        response: response,
        message: 'Terms & Condition updated successfully',
      });
    } catch (error) {
      next(error);
    }
  };

  public deleteTermsAndCondition = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const { termId } = req.params;
      const user = req.user;
      const response: { count: number } =
        await this.termsAndConditionServ.deleteTermsAndCondition(termId, user);
      res.status(200).send(response);
    } catch (error) {
      next(error);
    }
  };
}
export default TermsConditionController;
