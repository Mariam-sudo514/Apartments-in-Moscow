import 'server-only';

export type BookingMailMode = 'disabled' | 'mailpit';

export type BookingMailConfig = {
  readonly mode: BookingMailMode;
  readonly smtpHost: string;
  readonly smtpPort: 1025;
  readonly from: string;
  readonly to: string;
};

type Environment = Readonly<Record<string, string | undefined>>;

export type BookingMailConfigResult =
  | {readonly ok: true; readonly config: BookingMailConfig}
  | {readonly ok: false};

const DEFAULT_HOST = '127.0.0.1';
const DEFAULT_FROM = 'bookings@example.test';
const DEFAULT_TO = 'landlord@example.test';
const ALLOWED_HOSTS = new Set(['127.0.0.1', '::1', 'localhost', 'mailpit']);
const PLACEHOLDER_EMAIL_PATTERN = /^[A-Za-z0-9.!#$%&'*+/=?^_`{|}~-]+@(?:[A-Za-z0-9-]+\.)+test$/u;

function isPlaceholderEmail(value: string): boolean {
  return PLACEHOLDER_EMAIL_PATTERN.test(value) && !/[\u0000-\u001F\u007F-\u009F]/u.test(value);
}

function parsePort(value: string | undefined): boolean {
  if (value === undefined) {
    return true;
  }

  return /^1025$/u.test(value.trim());
}

export function getBookingMailConfig(
  environment: Environment = process.env
): BookingMailConfigResult {
  const modeValue = (environment.BOOKING_MAIL_MODE ?? 'disabled').trim().toLowerCase();

  if (modeValue === 'disabled') {
    return {
      config: {
        from: DEFAULT_FROM,
        mode: 'disabled',
        smtpHost: DEFAULT_HOST,
        smtpPort: 1025,
        to: DEFAULT_TO
      },
      ok: true
    };
  }

  if (modeValue !== 'mailpit') {
    return {ok: false};
  }

  const smtpHost = (environment.BOOKING_SMTP_HOST ?? DEFAULT_HOST).trim().toLowerCase();
  const from = (environment.BOOKING_MAIL_FROM ?? DEFAULT_FROM).trim();
  const to = (environment.BOOKING_MAIL_TO ?? DEFAULT_TO).trim();

  if (
    !ALLOWED_HOSTS.has(smtpHost) ||
    !parsePort(environment.BOOKING_SMTP_PORT) ||
    !isPlaceholderEmail(from) ||
    !isPlaceholderEmail(to)
  ) {
    return {ok: false};
  }

  return {
    config: {
      from,
      mode: 'mailpit',
      smtpHost,
      smtpPort: 1025,
      to
    },
    ok: true
  };
}
