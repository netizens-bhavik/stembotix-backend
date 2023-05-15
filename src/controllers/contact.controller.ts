import { NextFunction, Request, Response } from 'express';
import { Contact } from '@/interfaces/contact.interface';
import ContactService from '@/services/contact.service';

class ContactController {
  public contactService = new ContactService();

  public addContact = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const contactDetails = req.body;
      const user = req.user;
      const response: Contact = await this.contactService.addContact({
        contactDetails,
        user,
      });
      res
        .status(200)
        .send({ response: response, message: 'Mail sended successfully' });
    } catch (error) {
      next(error);
    }
  };
  public getContact = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const { search, pageRecord, pageNo, sortBy, order } = req.query;
      const coursesData: {
        totalCount: number;
        records: (Contact | undefined)[];
      } = await this.contactService.getContact({
        search,
        pageRecord,
        pageNo,
        sortBy,
        order,
      });
      res.status(200).send(coursesData);
    } catch (error) {
      next(error);
    }
  };
  public getContactById = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const { contactId } = req.params;
      const coursesData: Contact = await this.contactService.getContactById({
        contactId,
      });
      res.status(200).send(coursesData);
    } catch (error) {
      next(error);
    }
  };
  public deleteContact = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const { contactId } = req.body;
      const coursesData: Contact = await this.contactService.deleteContact(
        contactId
      );
      res.status(200).send(coursesData);
    } catch (error) {
      next(error);
    }
  };
}
export default ContactController;
