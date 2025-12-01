export type EmailOptions = {
  to: string | string[];
  subject: string;
  text: string;
  html: string;
};
export abstract class IEmailService {
  abstract sendEmail(options: EmailOptions): Promise<void>;
}