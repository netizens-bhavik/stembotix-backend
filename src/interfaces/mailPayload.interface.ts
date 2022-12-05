export interface MailPayload {
  templateData: object;
  mailerData: {
    to: string;
  };
}
