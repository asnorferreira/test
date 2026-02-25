export interface SendMailDTO {
  to: string;
  subject: string;
  bodyHtml: string;
  attachments?: { filename: string; content: Buffer; contentType: string }[];
}

export abstract class MailPort {
  abstract sendEmail(data: SendMailDTO): Promise<void>;
}
