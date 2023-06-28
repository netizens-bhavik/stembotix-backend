import { Routes } from '@interfaces/routes.interface';
import { Router } from 'express';
import passport from 'passport';
import validationMiddleware from '@middlewares/validation.middleware';
import TermsConditionController from '@/controllers/terms&condition.controller';
import { TermsConditionDto } from '@/dtos/terms&condition.dto';

class TermsAndConditionRoute implements Routes {
  public path = '/terms-condition';
  public router = Router();
  public termsAndConditionCont = new TermsConditionController();

  constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.post(
      `${this.path}`,
      passport.authenticate('jwt', { session: false }),
      validationMiddleware(TermsConditionDto, 'body'),
      this.termsAndConditionCont.addTermsAndCondition
    );
    this.router.get(
      `${this.path}`,
      this.termsAndConditionCont.getTermsAndCondition
    );
    this.router.put(
      `${this.path}/update/:termId`,
      passport.authenticate('jwt', { session: false }),
      this.termsAndConditionCont.updateTermsAndCondition
    );

    this.router.delete(
      `${this.path}/:termId`,
      passport.authenticate('jwt', { session: false }),
      this.termsAndConditionCont.deleteTermsAndCondition
    );
  }
}
export default TermsAndConditionRoute;
