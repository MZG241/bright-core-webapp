import "server-only";
import nodemailer from "nodemailer";

if (!process.env.SMTP_HOST || !process.env.SMTP_USER || !process.env.SMTP_PASS) {
  throw new Error("SMTP env vars are not set (SMTP_HOST, SMTP_USER, SMTP_PASS)");
}

const port = Number(process.env.SMTP_PORT ?? 587);
const secure = process.env.SMTP_SECURE === "true" || port === 465;

export const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port,
  secure,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

export const FROM_EMAIL =
  process.env.SMTP_FROM ?? `BrightCore <${process.env.SMTP_USER}>`;


export async function sendMail(opts: {
  to: string;
  subject: string;
  html: string;
}) {
  return transporter.sendMail({
    from: FROM_EMAIL,
    to: opts.to,
    subject: opts.subject,
    html: opts.html,
  });
}