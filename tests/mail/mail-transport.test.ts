import {describe, expect, it, vi} from 'vitest';

const createTransport = vi.hoisted(() => vi.fn((options: Record<string, unknown>) => options));

vi.mock('nodemailer', () => ({
  default: {createTransport}
}));

import {createBookingMailTransport} from '@/server/mail/mail-transport';
import type {BookingMailConfig} from '@/server/mail/mail-config';

const smtpConfig: BookingMailConfig = {
  from: 'sender@example.test',
  mode: 'smtp',
  smtpHost: 'smtp.example.test',
  smtpPass: 'test-only',
  smtpPort: 465,
  smtpSecure: true,
  smtpUser: 'account@example.test',
  to: 'recipient@example.test'
};

const mailpitConfig: BookingMailConfig = {
  from: 'bookings@example.test',
  mode: 'mailpit',
  smtpHost: 'mailpit',
  smtpPass: null,
  smtpPort: 1025,
  smtpSecure: false,
  smtpUser: null,
  to: 'landlord@example.test'
};

describe('booking mail transport', () => {
  it('passes SMTP auth only for explicit SMTP mode', () => {
    createBookingMailTransport(smtpConfig);

    expect(createTransport).toHaveBeenCalledWith(expect.objectContaining({
      auth: {pass: 'test-only', user: 'account@example.test'},
      host: 'smtp.example.test',
      port: 465,
      secure: true
    }));
  });

  it('keeps Mailpit unauthenticated and TLS verification defaults intact', () => {
    createTransport.mockClear();
    createBookingMailTransport(mailpitConfig);

    const options = createTransport.mock.calls[0]?.[0] ?? {};
    expect(options).toMatchObject({host: 'mailpit', port: 1025, secure: false});
    expect(options).not.toHaveProperty('tls');
    expect(options).not.toHaveProperty('auth');
  });
});
