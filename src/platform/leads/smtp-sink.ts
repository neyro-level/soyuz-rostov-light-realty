import nodemailer, { type Transporter } from "nodemailer";
import type { LeadDelivery, LeadSink } from "./types";

export type SmtpTransportOptions = {
  host: string;
  port: number;
  secure: boolean;
  user: string;
  pass: string;
  from: string;
};

export class SmtpLeadSink implements LeadSink {
  constructor(
    private readonly from: string,
    private readonly transporter: Transporter,
  ) {}

  static create(
    options: SmtpTransportOptions,
    transporter?: Transporter,
  ): SmtpLeadSink {
    const mailer =
      transporter ??
      nodemailer.createTransport({
        host: options.host,
        port: options.port,
        secure: options.secure,
        auth: { user: options.user, pass: options.pass },
      });
    return new SmtpLeadSink(options.from, mailer);
  }

  static jsonTransport(from: string): SmtpLeadSink {
    return new SmtpLeadSink(
      from,
      nodemailer.createTransport({ jsonTransport: true }),
    );
  }

  lastResult: unknown;

  async deliver(delivery: LeadDelivery): Promise<void> {
    this.lastResult = await this.transporter.sendMail({
      from: this.from,
      to: delivery.to,
      subject: delivery.subject,
      text: [
        `pageKey=${delivery.pageKey ?? ""}`,
        `consent=true`,
        `consentAt=${delivery.consentAt}`,
        `capturedAt=${delivery.capturedAt}`,
      ].join("\n"),
    });
  }
}
