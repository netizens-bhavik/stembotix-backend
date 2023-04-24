import { Router } from 'express';
import validationMiddleware from '@middlewares/validation.middleware';
import { Routes } from '@interfaces/routes.interface';
import passport from 'passport';
import passportConfig from '@/config/passportConfig';
import ContactController from '@/controllers/contact.controller';
import { ContactDto } from '@/dtos/contact.dto';

class ContactRoute implements Routes {
  public path = '/contact';
  public router = Router();
  public contactController = new ContactController();
  public passport = passportConfig(passport);

  constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.post(
      `${this.path}/add`,
      passport.authenticate('jwt', { session: false }),
      validationMiddleware(ContactDto, 'body'),
      this.contactController.addContact
    );
    this.router.get(
      `${this.path}`,
      passport.authenticate('jwt', { session: false }),
      this.contactController.getContact
    );
    this.router.get(
      `${this.path}/:contactId`,
      passport.authenticate('jwt', { session: false }),
      this.contactController.getContactById
    );

    this.router.delete(
      `${this.path}/:contactId`,
      passport.authenticate('jwt', { session: false }),
      this.contactController.deleteContact
    );
  }
}
export default ContactRoute;
