import { TermsConditioninterface } from '@/interfaces/terms&condition.interface';
import PrivacyPolicyService from '@/services/privacy-policy.service';
import { NextFunction, Request, Response } from 'express';

class PrivacyPolicyController {
  public privacyPolicyService = new PrivacyPolicyService();

  public addPrivacyPolicy = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const user = req.user;
      const content = req.body;
      const response = await this.privacyPolicyService.addPrivacyPolicy(
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

  public getPrivacyPolicy = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const user = req.user;
      const termsData: TermsConditioninterface[] =
        await this.privacyPolicyService.getPrivacyPolicy({
          user,
        });
      res.status(200).send(termsData);
    } catch (error) {
      next(error);
    }
  };

  public updatePrivacyPolicy = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const termDetails = req.body;
      const { termId } = req.params;
      const user = req.user;
      const response = await this.privacyPolicyService.updatePrivacyPolicy({
        termId,
        termDetails,
        user,
      });
      res.status(200).send({
        response: response,
        message: 'Terms & Condition updated successfully',
      });
    } catch (error) {
      next(error);
    }
  };

  public deletePrivacyPolicy = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const { termId } = req.params;
      const user = req.user;
      const response: { count: number } =
        await this.privacyPolicyService.deletePrivacyPolicy(termId, user);
      res.status(200).send(response);
    } catch (error) {
      next(error);
    }
  };
}
export default PrivacyPolicyController;
