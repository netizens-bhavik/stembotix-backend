export interface MailPayload {
  templateData: object;
  mailerData: {
    to: string;
  };
}
export interface MailPayloads {
  templateData: object;
  mailerData: {
    to: string[];
  };
}
export interface Mail {
  templateData: object;
  mailData: {
    from?: string;
    to: string[];
  };
}
