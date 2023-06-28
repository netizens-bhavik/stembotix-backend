import { Routes } from '@interfaces/routes.interface';
import { Router } from 'express';
import passport from 'passport';
import validationMiddleware from '@middlewares/validation.middleware';
import PrivacyPolicyController from '@/controllers/privacy-policy.controller';
import { TermsConditionDto } from '@/dtos/terms&condition.dto';

class PrivacyPolicyRoute implements Routes {
  public path = '/privacy-policy';
  public router = Router();
  public privacyPolicyController = new PrivacyPolicyController();

  constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.post(
      `${this.path}`,
      passport.authenticate('jwt', { session: false }),
      validationMiddleware(TermsConditionDto, 'body'),
      this.privacyPolicyController.addPrivacyPolicy
    );
    this.router.get(
      `${this.path}`,
      this.privacyPolicyController.getPrivacyPolicy
    );
    this.router.put(
      `${this.path}/update/:termId`,
      passport.authenticate('jwt', { session: false }),
      this.privacyPolicyController.updatePrivacyPolicy
    );

    this.router.delete(
      `${this.path}/:termId`,
      passport.authenticate('jwt', { session: false }),
      this.privacyPolicyController.deletePrivacyPolicy
    );
  }
}
export default PrivacyPolicyRoute;
