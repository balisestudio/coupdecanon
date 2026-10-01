import type {
  Logger,
  ProviderSendNotificationDTO,
  ProviderSendNotificationResultsDTO,
} from "@medusajs/framework/types";
import { AbstractNotificationProviderService, MedusaError } from "@medusajs/framework/utils";
import nodemailer, { type Transporter } from "nodemailer";

export type SmtpNotificationOptions = {
  host: string;
  port: number;
  secure: boolean;
  user?: string;
  password?: string;
  from: string;
  /** The name inboxes show for `from`. */
  fromName?: string;
};

export class SmtpNotificationService extends AbstractNotificationProviderService {
  static identifier = "smtp";

  private readonly transporter: Transporter;
  private readonly from: string | { name: string; address: string };
  private readonly logger: Logger;

  constructor({ logger }: { logger: Logger }, options: SmtpNotificationOptions) {
    super();
    this.logger = logger;
    this.from = options.fromName ? { name: options.fromName, address: options.from } : options.from;
    this.transporter = nodemailer.createTransport({
      host: options.host,
      port: options.port,
      secure: options.secure,
      auth: options.user ? { user: options.user, pass: options.password } : undefined,
    });
  }

  static validateOptions(options: Record<string, unknown>) {
    for (const key of ["host", "port", "from"]) {
      if (!options[key]) {
        throw new MedusaError(MedusaError.Types.INVALID_DATA, `SMTP option "${key}" is required`);
      }
    }
  }

  async send(
    notification: ProviderSendNotificationDTO,
  ): Promise<ProviderSendNotificationResultsDTO> {
    const { content } = notification;
    if (!content?.subject || !content.html) {
      throw new MedusaError(
        MedusaError.Types.INVALID_DATA,
        `The "${notification.template}" e-mail has no rendered subject or HTML`,
      );
    }

    const info = await this.transporter.sendMail({
      from: notification.from?.trim() || this.from,
      to: notification.to,
      // A message from a visitor is answered to the visitor.
      replyTo:
        typeof notification.data?.reply_to === "string" ? notification.data.reply_to : undefined,
      subject: content.subject,
      html: content.html,
      text: content.text,
      attachments: notification.attachments?.map((attachment) => ({
        filename: attachment.filename,
        content: attachment.content,
        encoding: "base64",
        contentType: attachment.content_type,
      })),
    });

    this.logger.info(`E-mail "${notification.template}" sent to ${notification.to}`);
    return { id: info.messageId };
  }
}
