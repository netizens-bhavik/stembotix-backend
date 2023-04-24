import DB from '@databases';
import { Contact } from '@/interfaces/contact.interface';
import { Mail } from '@/interfaces/mailPayload.interface';
import EmailService from './email.service';

class ContactService {
  public contact = DB.Contact;
  public user = DB.User;
  public emailService = new EmailService();

  public async addContact({ contactDetails, user }): Promise<Contact> {
    const adminRecord = await this.user.findAll({
      where: { role: 'Admin' },
    });
    const newContact = await this.contact.create({
      ...contactDetails,
      userId: user.id,
    });
    if (newContact) {
      const mailData: Mail = {
        templateData: {
          name: newContact.name,
          subject: newContact.subject,
          message: newContact.message,
        },
        mailData: {
          from: user.email,
          to: adminRecord[0].email,
        },
      };
      this.emailService.sendContact(mailData);
    }
    return newContact;
  }

  public async getContact(
    queryObject
  ): Promise<{ totalCount: number; records: (Contact | undefined)[] }> {
    const sortBy = queryObject.sortBy ? queryObject.sortBy : 'createdAt';
    const order = queryObject.order || 'DESC';
    // pagination
    const pageSize = queryObject.pageRecord ? queryObject.pageRecord : 10;
    const pageNo = queryObject.pageNo ? (queryObject.pageNo - 1) * pageSize : 0;
    // Search
    const [search, searchCondition] = queryObject.search
      ? [`%${queryObject.search}%`, DB.Sequelize.Op.iLike]
      : ['', DB.Sequelize.Op.ne];

    const contactData = await this.contact.findAndCountAll({
      where: DB.Sequelize.and({ deletedAt: null }),
    });

    const data: (Contact | undefined)[] = await this.contact.findAll({
      where: DB.Sequelize.and({
        deletedAt: null,
        name: {
          [searchCondition]: search,
        },
      }),
      limit: pageSize,
      offset: pageNo,
      order: [[`${sortBy}`, `${order}`]],
    });
    return { totalCount: contactData.count, records: data };
  }

  public async getContactById(contactId: string): Promise<Contact> {
    const response = await this.contact.findOne({
      where: {
        id: contactId,
      },
      include: {
        model: this.user,
      },
    });
    return response;
  }

  public async deleteContact(contactId: string): Promise<Contact> {
    const response = await this.contact.destroy({
      where: {
        id: contactId,
      },
    });
    return response;
  }
}

export default ContactService;
