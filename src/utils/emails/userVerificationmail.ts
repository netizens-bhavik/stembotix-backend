import nodemailer from "nodemailer";
import ejs from "ejs";
import { logger } from "../logger";
import path from "path";
import { SMTP_PORT } from '@/config';

const EMAIL_ADDRESS = process.env.EMAIL_FROM;

const userVerificationEmail = async (sendTo, subject, templateData) => {
  try {
    const transporter = nodemailer.createTransport({
      service: "gmail",
      port:SMTP_PORT,
      auth: {
        user: process.env.SMTP_USERNAME,
        pass: process.env.SMTP_PASSWORD,
      },
    });
    transporter.verify().then(() => {
      const pathToView = path.resolve(
        __dirname,
        "../../../views/buyerRegistrationMail.ejs"
      );
      ejs.renderFile(pathToView, templateData).then((data) => {
        transporter
          .sendMail({
            from: `Stembotix <${EMAIL_ADDRESS}>`,
            to: sendTo,
            subject,
            html: data,
          })
          .then(() => {
            logger.info("Email sent");
          });
      });
    });
  } catch (error) {
    logger.error(`${error} from function userVerification`);
  }
};
export default userVerificationEmail;
