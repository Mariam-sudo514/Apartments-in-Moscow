import 'server-only';

import nodemailer, {type Transporter} from 'nodemailer';

import type {BookingMailConfig} from './mail-config';

export function createBookingMailTransport(config: BookingMailConfig): Transporter {
  return nodemailer.createTransport({
    connectionTimeout: 5_000,
    disableFileAccess: true,
    disableUrlAccess: true,
    greetingTimeout: 5_000,
    host: config.smtpHost,
    port: config.smtpPort,
    secure: false,
    socketTimeout: 5_000
  });
}
