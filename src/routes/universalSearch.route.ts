import UniversalSearchController from '@/controllers/universalSearch.controller';
import { Router } from 'express';
import { Routes } from '@interfaces/routes.interface';
import passport from 'passport';
import passportConfig from '@/config/passportConfig';

class UniversalSearchRoute implements Routes {
  public path = '/universal';
  public router = Router();
  public passport = passportConfig(passport);
  public universalSearchController = new UniversalSearchController();

  constructor() {
    this.initializeRoutes();
  }
  private initializeRoutes() {
    //Universal search
    this.router.get(
      `${this.path}/search`,
      this.universalSearchController.universalSearch
    );
  }
}
export default UniversalSearchRoute;
