import nodemailer from 'nodemailer';
import { SMTP_USERNAME, SMTP_PASSWORD, SMTP_EMAIL_FROM } from '@config';
import { Options, MailOptions } from 'nodemailer/lib/smtp-transport';
import path from 'path';
import * as ejs from 'ejs';
import {
  Mail,
  MailPayload,
  MailPayloads,
} from '@/interfaces/mailPayload.interface';

const transporterOptions: Options = {
  service: 'gmail',
  auth: {
    user: SMTP_USERNAME,
    pass: SMTP_PASSWORD,
  },
};

class EmailService {
  private transporter: nodemailer.Transporter;
  // Initialise transporter instance;
  private async createConnection() {
    this.transporter = nodemailer.createTransport(transporterOptions);
  }
  private async terminateConnection() {
    this.transporter.close();
  }
  /**
   * Sends verification email for account activation
   * @param payload
   */

  //Done
  public async accountVerification(payload: MailPayload) {
    try {
      await this.createConnection();
      await this.transporter.verify();

      // Mailing Data assignment
      const pathToView = path.resolve(
        __dirname,
        '../view/userVerificationmail.ejs'
      );
      const { templateData, mailerData } = payload;

      ejs.renderFile(pathToView, templateData, async (err, data) => {
        try {
          await this.transporter.sendMail({
            from: `StemBotix: ${SMTP_EMAIL_FROM}`,
            to: mailerData.to,
            subject: 'Account verification',
            html: data,
            attachments: [
              {
                filename: 'Stembotix_logo.png',
                path: __dirname + '/../public/assets/Stembotix_logo.png',
                cid: 'logo@cid',
              },
            ],
          });
          this.terminateConnection();
        } catch (error) {
          return error;
        }
      });
    } catch (err) {
      return err;
    }
  }
  //DONE
  public async sendMailDeleteCourse(payload: MailPayloads) {
    try {
      await this.createConnection();
      await this.transporter.verify();

      // Mailing Data assignment
      const pathToView = path.resolve(
        __dirname,
        '../view/deletedCoursemail.ejs'
      );
      const { templateData, mailerData } = payload;
      ejs.renderFile(pathToView, templateData, async (err, data) => {
        try {
          await this.transporter.sendMail({
            from: `StemBotix: ${SMTP_EMAIL_FROM}`,
            to: mailerData.to,
            subject: 'Delete Course',
            html: data,
            attachments: [
              {
                filename: 'Stembotix_logo.png',
                path: __dirname + '/../public/assets/Stembotix_logo.png',
                cid: 'logo@cid',
              },
            ],
          });
          this.terminateConnection();
        } catch (error) {
          return error;
        }
      });
    } catch (err) {
      return err;
    }
  }

  //Done
  public async sendEventstartMail(payload: MailPayloads) {
    try {
      await this.createConnection();
      await this.transporter.verify();

      // Mailing Data assignment
      const pathToView = path.resolve(
        __dirname,
        '../view/subscribeLiveEventEmail.ejs'
      );
      const { templateData, mailerData } = payload;

      ejs.renderFile(pathToView, templateData, async (err, data) => {
        try {
          await this.transporter.sendMail({
            from: `StemBotix: ${SMTP_EMAIL_FROM}`,
            to: mailerData.to,
            subject: 'Live Event Schedule',
            html: data,
            attachments: [
              {
                filename: 'Stembotix_logo.png',
                path: __dirname + '/../public/assets/Stembotix_logo.png',
                cid: 'logo@cid',
              },
            ],
          });
          this.terminateConnection();
        } catch (error) {
          return error;
        }
      });
    } catch (err) {
      return err;
    }
  }
  //Done
  public async sendMailDeleteProduct(payload: MailPayloads) {
    try {
      await this.createConnection();
      await this.transporter.verify();

      // Mailing Data assignment
      const pathToView = path.resolve(
        __dirname,
        '../view/deletedProductmail.ejs'
      );
      const { templateData, mailerData } = payload;

      ejs.renderFile(pathToView, templateData, async (err, data) => {
        try {
          await this.transporter.sendMail({
            from: `StemBotix: ${SMTP_EMAIL_FROM}`,
            to: mailerData.to,
            subject: 'Delete Product',
            html: data,
            attachments: [
              {
                filename: 'Stembotix_logo.png',
                path: __dirname + '/../public/assets/Stembotix_logo.png',
                cid: 'logo@cid',
              },
            ],
          });
          this.terminateConnection();
        } catch (error) {
          return error;
        }
      });
    } catch (err) {
      return err;
    }
  }
  //Done
  public async sendMailPublishCourse(payload: Mail) {
    try {
      await this.createConnection();
      await this.transporter.verify();

      // Mailing Data assignment
      const pathToView = path.resolve(
        __dirname,
        '../view/publishedCoursemail.ejs'
      );
      const { templateData, mailData } = payload;

      ejs.renderFile(pathToView, templateData, async (err, data) => {
        try {
          await this.transporter.sendMail({
            from: `${mailData.from}`,
            to: mailData.to,
            subject: 'Published Added Course',
            html: data,
            attachments: [
              {
                filename: 'Stembotix_logo.png',
                path: __dirname + '/../public/assets/Stembotix_logo.png',
                cid: 'logo@cid',
              },
            ],
          });
          this.terminateConnection();
        } catch (error) {
          return error;
        }
      });
    } catch (err) {
      return err;
    }
  }

  //Done
  public async sendMailPublishProduct(payload: Mail) {
    try {
      await this.createConnection();
      await this.transporter.verify();

      // Mailing Data assignment
      const pathToView = path.resolve(
        __dirname,
        '../view/publishedProductmail.ejs'
      );
      const { templateData, mailData } = payload;

      ejs.renderFile(pathToView, templateData, async (err, data) => {
        try {
          await this.transporter.sendMail({
            from: `${mailData.from}`,
            to: mailData.to,
            subject: 'Published Added product',
            html: data,
            attachments: [
              {
                filename: 'Stembotix_logo.png',
                path: __dirname + '/../public/assets/Stembotix_logo.png',
                cid: 'logo@cid',
              },
            ],
          });
          this.terminateConnection();
        } catch (error) {
          return error;
        }
      });
    } catch (err) {
      return err;
    }
  }
  //Done
  public async sendMailunPublishcourse(payload: Mail) {
    try {
      await this.createConnection();
      await this.transporter.verify();

      // Mailing Data assignment
      const pathToView = path.resolve(
        __dirname,
        '../view/unpublishedCoursemail.ejs'
      );
      const { templateData, mailData } = payload;

      ejs.renderFile(pathToView, templateData, async (err, data) => {
        try {
          await this.transporter.sendMail({
            from: `${mailData.from}`,
            to: mailData.to,
            subject: 'Unpublished Course',
            html: data,
            attachments: [
              {
                filename: 'Stembotix_logo.png',
                path: __dirname + '/../public/assets/Stembotix_logo.png',
                cid: 'logo@cid',
              },
            ],
          });
          this.terminateConnection();
        } catch (error) {
          return error;
        }
      });
    } catch (err) {
      return err;
    }
  }

  //Done
  public async sendMailofOrder(payload: Mail) {
    try {
      await this.createConnection();
      await this.transporter.verify();

      // Mailing Data assignment
      const pathToView = path.resolve(__dirname, '../view/orderMail.ejs');
      const { templateData, mailData } = payload;

      ejs.renderFile(pathToView, templateData, async (err, data) => {
        try {
          await this.transporter.sendMail({
            from: `StemBotix: ${SMTP_EMAIL_FROM}`,
            to: mailData.to,
            subject: 'Order',
            html: data,
            attachments: [
              {
                filename: 'Stembotix_logo.png',
                path: __dirname + '/../public/assets/Stembotix_logo.png',
                cid: 'logo@cid',
              },
            ],
          });
          this.terminateConnection();
        } catch (error) {
          return error;
        }
      });
    } catch (err) {
      return err;
    }
  }

  //Done
  public async sendRequestToJoinInstitute(payload: Mail) {
    try {
      await this.createConnection();
      await this.transporter.verify();

      // Mailing Data assignment
      const pathToView = path.resolve(
        __dirname,
        '../view/sendRequestToJoinInstitute.ejs'
      );
      const { templateData, mailData } = payload;

      ejs.renderFile(pathToView, templateData, async (err, data) => {
        try {
          await this.transporter.sendMail({
            from: `${mailData.from}`,
            to: mailData.to,
            subject: 'Proposal request',
            html: data,
            attachments: [
              {
                filename: 'Stembotix_logo.png',
                path: __dirname + '/../public/assets/Stembotix_logo.png',
                cid: 'logo@cid',
              },
            ],
          });
          this.terminateConnection();
        } catch (error) {
          return error;
        }
      });
    } catch (err) {
      return err;
    }
  }
  //Done
  public async AcceptProposalofInstitute(payload: Mail) {
    try {
      await this.createConnection();
      await this.transporter.verify();

      const pathToView = path.resolve(
        __dirname,
        '../view/acceptProposalofInstitute.ejs'
      );
      const { templateData, mailData } = payload;

      ejs.renderFile(pathToView, templateData, async (err, data) => {
        try {
          await this.transporter.sendMail({
            from: `${mailData.from}`,
            to: mailData.to,
            subject: 'Proposal',
            html: data,
            attachments: [
              {
                filename: 'Stembotix_logo.png',
                path: __dirname + '/../public/assets/Stembotix_logo.png',
                cid: 'logo@cid',
              },
            ],
          });
          this.terminateConnection();
        } catch (error) {
          return error;
        }
      });
    } catch (err) {
      return err;
    }
  }
  //Done
  public async RejectProposalofInstitute(payload: Mail) {
    try {
      await this.createConnection();
      await this.transporter.verify();

      const pathToView = path.resolve(
        __dirname,
        '../view/rejectProposalofInstitute.ejs'
      );
      const { templateData, mailData } = payload;

      ejs.renderFile(pathToView, templateData, async (err, data) => {
        try {
          await this.transporter.sendMail({
            from: `${mailData.from}`,
            to: mailData.to,
            subject: 'Proposal',
            html: data,
            attachments: [
              {
                filename: 'Stembotix_logo.png',
                path: __dirname + '/../public/assets/Stembotix_logo.png',
                cid: 'logo@cid',
              },
            ],
          });
          this.terminateConnection();
        } catch (error) {
          return error;
        }
      });
    } catch (err) {
      return err;
    }
  }

  //Done
  public async sendMailunPublishproduct(payload: Mail) {
    try {
      await this.createConnection();
      await this.transporter.verify();

      // Mailing Data assignment
      const pathToView = path.resolve(
        __dirname,
        '../view/unpublishedProductmail.ejs'
      );
      const { templateData, mailData } = payload;

      ejs.renderFile(pathToView, templateData, async (err, data) => {
        try {
          await this.transporter.sendMail({
            from: `${mailData.from}`,
            to: mailData.to,
            subject: 'Unpublished Product',
            html: data,
            attachments: [
              {
                filename: 'Stembotix_logo.png',
                path: __dirname + '/../public/assets/Stembotix_logo.png',
                cid: 'logo@cid',
              },
            ],
          });
          this.terminateConnection();
        } catch (error) {
          return error;
        }
      });
    } catch (err) {
      return err;
    }
  }

  //Done
  public async forgotPassword(payload: MailPayload) {
    try {
      await this.createConnection();
      await this.transporter.verify();

      const pathToView = path.resolve(__dirname, '../view/forgotPassword.ejs');
      const { templateData, mailerData } = payload;

      ejs.renderFile(pathToView, templateData, async (err, data) => {
        try {
          await this.transporter.sendMail({
            from: `StemBotix: ${SMTP_EMAIL_FROM}`,
            to: mailerData.to,
            subject: 'Passwrod Reset',
            html: data,
            attachments: [
              {
                filename: 'Stembotix_logo.png',
                path: __dirname + '/../public/assets/Stembotix_logo.png',
                cid: 'logo@cid',
              },
            ],
          });
          this.terminateConnection();
        } catch (error) {
          return error;
        }
      });
    } catch (err) {
      return err;
    }
  }
  //Done
  public async sendEventStartNotification(payload) {
    try {
      await this.createConnection();
      await this.transporter.verify();

      const pathToView = path.resolve(
        __dirname,
        '../view/sendEventStartNotification.ejs'
      );
      const { templateData, mailData } = payload;

      ejs.renderFile(pathToView, templateData, async (err, data) => {
        if (err) return err;
        try {
          await this.transporter.sendMail({
            from: `StemBotix: ${SMTP_EMAIL_FROM}`,
            to: mailData.to,
            subject: 'Event Start Notification',
            html: data,
            attachments: [
              {
                filename: 'Stembotix_logo.png',
                path: __dirname + '/../public/assets/Stembotix_logo.png',
                cid: 'logo@cid',
              },
            ],
          });
          this.terminateConnection();
        } catch (error) {
          return error;
        }
      });
    } catch (err) {
      return err;
    }
  }
  //DONE
  public async sendMailtoUserforAccountDeletion(payload: Mail) {
    try {
      await this.createConnection();
      await this.transporter.verify();

      const pathToView = path.resolve(__dirname, '../view/deleteAccount.ejs');
      const { templateData, mailData } = payload;
      ejs.renderFile(pathToView, templateData, async (err, data) => {
        try {
          await this.transporter.sendMail({
            from: `${mailData.from}`,
            to: mailData.to,
            subject: 'Account Deleted',
            html: data,
            attachments: [
              {
                filename: 'Stembotix_logo.png',
                path: __dirname + '/../public/assets/Stembotix_logo.png',
                cid: 'logo@cid',
              },
            ],
          });
          this.terminateConnection();
        } catch (err) {
          return err;
        }
      });
    } catch (err) {
      return err;
    }
  }
}
export default EmailService;
