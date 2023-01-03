import nodemailer from 'nodemailer';
import { SMTP_USERNAME, SMTP_PASSWORD, SMTP_EMAIL_FROM } from '@config';
import { Options, MailOptions } from 'nodemailer/lib/smtp-transport';
import path from 'path';
import * as ejs from 'ejs';
import { MailPayload } from '@/interfaces/mailPayload.interface';

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
        if (err)
        try {
          await this.transporter.sendMail({
            from: `StemBotix: ${SMTP_EMAIL_FROM}`,
            to: mailerData.to,
            subject: 'Account verification',
            html: data,
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
  public async forgotPassword(payload: MailPayload) {
    try {
      await this.createConnection();
      await this.transporter.verify();

      const pathToView = path.resolve(__dirname, '../view/forgotPassword.ejs');
      const { templateData, mailerData } = payload;
      ejs.renderFile(pathToView, templateData, async (err, data) => {
        if (err) 
        try {
          await this.transporter.sendMail({
            from: `StemBotix: ${SMTP_EMAIL_FROM}`,
            to: mailerData.to,
            subject: 'Passwrod Reset',
            html: data,
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
}
export default EmailService;
