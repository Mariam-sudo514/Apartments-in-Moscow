import 'server-only';

export type BookingMailMode = 'disabled' | 'mailpit' | 'smtp';

type BookingMailConfigBase = {
  readonly from: string;
  readonly smtpHost: string;
  readonly smtpPort: number;
  readonly smtpSecure: boolean;
  readonly to: string;
};

export type BookingMailConfig =
  | (BookingMailConfigBase & {
      readonly mode: 'disabled';
      readonly smtpPass: null;
      readonly smtpUser: null;
    })
  | (BookingMailConfigBase & {
      readonly mode: 'mailpit';
      readonly smtpPass: null;
      readonly smtpUser: null;
    })
  | (BookingMailConfigBase & {
      readonly mode: 'smtp';
      readonly smtpPass: string;
      readonly smtpUser: string;
    });

type Environment = Readonly<Record<string, string | undefined>>;

export type BookingMailConfigResult =
  | {readonly ok: true; readonly config: BookingMailConfig}
  | {readonly ok: false};

const DEFAULT_HOST = '127.0.0.1';
const DEFAULT_FROM = 'bookings@example.test';
const DEFAULT_TO = 'landlord@example.test';
const DEFAULT_MAILPIT_PORT = 1025;
const ALLOWED_HOSTS = new Set(['127.0.0.1', '::1', 'localhost', 'mailpit']);
const PLACEHOLDER_EMAIL_PATTERN = /^[A-Za-z0-9.!#$%&'*+/=?^_`{|}~-]+@(?:[A-Za-z0-9-]+\.)+test$/u;
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+$/u;
const CONTROL_CHARACTER_PATTERN = /[\u0000-\u001F\u007F-\u009F]/u;

function isPlaceholderEmail(value: string): boolean {
  return PLACEHOLDER_EMAIL_PATTERN.test(value) && !/[\u0000-\u001F\u007F-\u009F]/u.test(value);
}

function parsePort(value: string | undefined, fallback: number | null): number | null {
  if (value === undefined) {
    return fallback;
  }

  if (!/^\d{1,5}$/u.test(value.trim())) {
    return null;
  }

  const parsed = Number(value.trim());

  return Number.isSafeInteger(parsed) && parsed >= 1 && parsed <= 65_535
    ? parsed
    : null;
}

function parseSecure(value: string | undefined, fallback: boolean | null): boolean | null {
  if (value === undefined) {
    return fallback;
  }

  const normalized = value.trim().toLowerCase();

  if (normalized === 'true') {
    return true;
  }

  if (normalized === 'false') {
    return false;
  }

  return null;
}

function isSafeText(value: string): boolean {
  return value !== '' && value.length <= 512 && !CONTROL_CHARACTER_PATTERN.test(value) && !/\s/u.test(value);
}

function isEmail(value: string): boolean {
  return value.length <= 254 && !CONTROL_CHARACTER_PATTERN.test(value) && EMAIL_PATTERN.test(value);
}

function requiredValue(value: string | undefined): string | null {
  if (value === undefined) {
    return null;
  }

  const trimmed = value.trim();
  return trimmed === '' ? null : trimmed;
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
        smtpPass: null,
        smtpPort: DEFAULT_MAILPIT_PORT,
        smtpSecure: false,
        smtpUser: null,
        to: DEFAULT_TO
      },
      ok: true
    };
  }

  if (modeValue !== 'mailpit' && modeValue !== 'smtp') {
    return {ok: false};
  }

  if (modeValue === 'smtp') {
    const smtpHost = requiredValue(environment.BOOKING_SMTP_HOST);
    const smtpPort = parsePort(environment.BOOKING_SMTP_PORT, null);
    const smtpSecure = parseSecure(environment.BOOKING_SMTP_SECURE, null);
    const smtpUser = requiredValue(environment.BOOKING_SMTP_USER);
    const smtpPass = requiredValue(environment.BOOKING_SMTP_PASS);
    const from = requiredValue(environment.BOOKING_MAIL_FROM);
    const to = requiredValue(environment.BOOKING_MAIL_TO);

    if (
      smtpHost === null ||
      smtpPort === null ||
      smtpSecure === null ||
      smtpUser === null ||
      smtpPass === null ||
      from === null ||
      to === null ||
      !isSafeText(smtpHost) ||
      !isSafeText(smtpUser) ||
      !isSafeText(smtpPass) ||
      !isEmail(from) ||
      !isEmail(to)
    ) {
      return {ok: false};
    }

    return {
      config: {
        from,
        mode: 'smtp',
        smtpHost,
        smtpPass,
        smtpPort,
        smtpSecure,
        smtpUser,
        to
      },
      ok: true
    };
  }

  const smtpHost = (environment.BOOKING_SMTP_HOST ?? DEFAULT_HOST).trim().toLowerCase();
  const smtpPort = parsePort(environment.BOOKING_SMTP_PORT, DEFAULT_MAILPIT_PORT);
  const smtpSecure = parseSecure(environment.BOOKING_SMTP_SECURE, false);
  const smtpUser = (environment.BOOKING_SMTP_USER ?? '').trim();
  const smtpPass = (environment.BOOKING_SMTP_PASS ?? '').trim();
  const from = (environment.BOOKING_MAIL_FROM ?? DEFAULT_FROM).trim();
  const to = (environment.BOOKING_MAIL_TO ?? DEFAULT_TO).trim();

  if (
    !ALLOWED_HOSTS.has(smtpHost) ||
    smtpPort !== DEFAULT_MAILPIT_PORT ||
    smtpSecure !== false ||
    smtpUser !== '' ||
    smtpPass !== '' ||
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
      smtpPass: null,
      smtpPort: DEFAULT_MAILPIT_PORT,
      smtpSecure: false,
      smtpUser: null,
      to
    },
    ok: true
  };
}
