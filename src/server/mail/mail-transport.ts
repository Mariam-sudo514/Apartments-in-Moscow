import 'server-only';

import nodemailer, {type Transporter} from 'nodemailer';

import type {BookingMailConfig} from './mail-config';

export function createBookingMailTransport(config: BookingMailConfig): Transporter {
  const options = {
    connectionTimeout: 5_000,
    disableFileAccess: true,
    disableUrlAccess: true,
    greetingTimeout: 5_000,
    host: config.smtpHost,
    port: config.smtpPort,
    secure: config.smtpSecure,
    socketTimeout: 5_000
  };

  return config.mode === 'smtp'
    ? nodemailer.createTransport({
        ...options,
        auth: {pass: config.smtpPass, user: config.smtpUser}
      })
    : nodemailer.createTransport(options);
}
