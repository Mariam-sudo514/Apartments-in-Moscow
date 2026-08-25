import {afterEach, beforeEach, describe, expect, it, vi} from 'vitest';

import {createBookingRequestDraft} from '@/lib/booking';
import {calculateTrustedBookingQuote} from '@/server/booking/booking-quote';
import {getBookingMailConfig} from '@/server/mail/mail-config';
import {deliverBookingEmail} from '@/server/mail/booking-email';

const mailMock = vi.hoisted(() => ({
  close: vi.fn(),
  sendMail: vi.fn()
}));

vi.mock('@/server/mail/mail-transport', () => ({
  createBookingMailTransport: vi.fn(() => mailMock)
}));

function bookingRequest(
  source: 'home' | 'reservation',
  locale: 'ru' | 'en',
  preferredContactMethod: 'email' | 'whatsapp' | 'telegram' = 'email',
  preferredContactValue: string | null = null
) {
  return source === 'reservation'
    ? createBookingRequestDraft({
        adults: 2,
        apartmentSlug: 'dmitrovskoe-107-apt-1',
        checkIn: '2026-08-20',
        checkOut: '2026-08-22',
        children: 1,
        guestEmail: 'maria@example.com',
        guestName: 'Maria Ivanova',
        locale,
        preferredContactMethod,
        preferredContactValue,
        source
      })
    : createBookingRequestDraft({
        apartmentSlug: 'mitino-aframe',
        checkIn: '2026-08-20',
        checkOut: '2026-08-22',
        guestEmail: 'maria@example.com',
        guestName: 'Maria Ivanova',
        locale,
        preferredContactMethod,
        preferredContactValue,
        source
      });
}

describe('local booking mail configuration and rendering', () => {
  beforeEach(() => {
    vi.stubEnv('BOOKING_MAIL_MODE', 'mailpit');
    mailMock.close.mockClear();
    mailMock.sendMail.mockReset().mockResolvedValue(undefined);
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it('fails closed for invalid modes and non-local mailpit configuration', () => {
    expect(getBookingMailConfig({BOOKING_MAIL_MODE: 'smtp'}).ok).toBe(false);
    expect(getBookingMailConfig({
      BOOKING_MAIL_MODE: 'mailpit',
      BOOKING_SMTP_HOST: 'smtp.example.com'
    }).ok).toBe(false);
    expect(getBookingMailConfig({
      BOOKING_MAIL_MODE: 'mailpit',
      BOOKING_SMTP_PORT: '2525'
    }).ok).toBe(false);
    expect(getBookingMailConfig({
      BOOKING_MAIL_MODE: 'mailpit',
      BOOKING_MAIL_FROM: 'owner@example.com'
    }).ok).toBe(false);
  });

  it('supports disabled mode and the exact safe local mailpit defaults', () => {
    expect(getBookingMailConfig({})).toEqual({
      config: {
        from: 'bookings@example.test',
        mode: 'disabled',
        smtpHost: '127.0.0.1',
        smtpPass: null,
        smtpPort: 1025,
        smtpSecure: false,
        smtpUser: null,
        to: 'landlord@example.test'
      },
      ok: true
    });
    expect(getBookingMailConfig({BOOKING_MAIL_MODE: 'mailpit'})).toMatchObject({
      config: {
        from: 'bookings@example.test',
        mode: 'mailpit',
        smtpHost: '127.0.0.1',
        smtpPass: null,
        smtpPort: 1025,
        smtpSecure: false,
        smtpUser: null,
        to: 'landlord@example.test'
      },
      ok: true
    });
  });

  it('accepts a complete SMTP configuration and fails closed when required values are missing', () => {
    const smtpEnvironment = {
      BOOKING_MAIL_FROM: 'sender@example.test',
      BOOKING_MAIL_MODE: 'smtp',
      BOOKING_MAIL_TO: 'recipient@example.test',
      BOOKING_SMTP_HOST: 'smtp.example.test',
      BOOKING_SMTP_PASS: 'test-only',
      BOOKING_SMTP_PORT: '587',
      BOOKING_SMTP_SECURE: 'false',
      BOOKING_SMTP_USER: 'account@example.test'
    };

    expect(getBookingMailConfig(smtpEnvironment)).toMatchObject({
      config: {
        mode: 'smtp',
        smtpHost: 'smtp.example.test',
        smtpPort: 587,
        smtpSecure: false,
        smtpUser: 'account@example.test'
      },
      ok: true
    });

    for (const key of Object.keys(smtpEnvironment).filter((key) => key !== 'BOOKING_MAIL_MODE')) {
      const incomplete = {...smtpEnvironment};
      delete incomplete[key as keyof typeof incomplete];
      expect(getBookingMailConfig(incomplete).ok).toBe(false);
    }

    expect(getBookingMailConfig({...smtpEnvironment, BOOKING_SMTP_SECURE: 'yes'}).ok).toBe(false);
    expect(getBookingMailConfig({...smtpEnvironment, BOOKING_SMTP_PORT: '2525'}).ok).toBe(true);
    expect(getBookingMailConfig({...smtpEnvironment, BOOKING_SMTP_PASS: '   '}).ok).toBe(false);
  });

  it('does not create a transport or expose SMTP details for a misconfigured mode', async () => {
    vi.stubEnv('BOOKING_MAIL_MODE', 'smtp');
    vi.stubEnv('BOOKING_SMTP_PASS', 'test-only');
    const request = bookingRequest('reservation', 'en');
    const quote = calculateTrustedBookingQuote(request);

    const result = await deliverBookingEmail(request, quote!);

    expect(result).toEqual({kind: 'server_misconfigured'});
    expect(mailMock.sendMail).not.toHaveBeenCalled();
  });

  it('renders the exact seven-line RU reservation email body', async () => {
    const request = bookingRequest('reservation', 'ru');
    const quote = calculateTrustedBookingQuote(request);

    expect(quote).not.toBeNull();
    const result = await deliverBookingEmail(request, quote!);

    expect(result).toEqual({kind: 'accepted'});
    const message = mailMock.sendMail.mock.calls[0]?.[0] as Record<string, string>;
    expect(message.from).toBe('bookings@example.test');
    expect(message.to).toBe('landlord@example.test');
    expect(message.subject).toBe('Новая заявка на бронирование');
    expect(message.text).toBe([
      'Имя гостя: Maria Ivanova',
      'Количество гостей: 2',
      'Количество детей: 1',
      'Email гостя: maria@example.com',
      'Предпочтительный способ связи: Email',
      'Адрес квартиры: Москва, Дмитровское шоссе д 107 корпус 3 кв. 1',
      'Дата заезда: 20.08.2026',
      'Дата выезда: 22.08.2026'
    ].join('\n'));
    expect(message.text).not.toMatch(/^(Источник формы|Локаль|Квартира|Slug|Ночей|Режим цены|Валюта|Доверенная стоимость|Создано):/mu);
    expect(message.text).not.toMatch(/captcha|challenge|honeypot|website|stack|IP/iu);
    expect(mailMock.close).toHaveBeenCalledOnce();
  });

  it('renders the exact seven-line EN reservation email body', async () => {
    const request = bookingRequest('reservation', 'en');
    const quote = calculateTrustedBookingQuote(request);

    expect(quote).not.toBeNull();
    const result = await deliverBookingEmail(request, quote!);
    const message = mailMock.sendMail.mock.calls[0]?.[0] as Record<string, string>;

    expect(result).toEqual({kind: 'accepted'});
    expect(message.subject).toBe('New booking request');
    expect(message.text).toBe([
      'Guest name: Maria Ivanova',
      'Number of guests: 2',
      'Number of children: 1',
      'Guest email: maria@example.com',
      'Preferred contact method: Email',
      'Apartment address: Moscow, Dmitrovskoe Shosse 107, building 3, apt. 1',
      'Check-in date: 08/20/2026',
      'Check-out date: 08/22/2026'
    ].join('\n'));
    expect(message.text).not.toMatch(/^(Form source|Locale|Apartment|Slug|Nights|Price mode|Currency|Trusted total|Created at):/mu);
    expect(message.text).not.toMatch(/captcha|challenge|honeypot|website|stack|IP/iu);
  });

  it('renders the selected Reservation conditional contact line', async () => {
    const request = bookingRequest('reservation', 'en', 'telegram', '@maria_user');
    const quote = calculateTrustedBookingQuote(request);

    await deliverBookingEmail(request, quote!);
    const message = mailMock.sendMail.mock.calls.at(-1)?.[0] as Record<string, string>;

    expect(message.text).toContain('Preferred contact method: Telegram');
    expect(message.text).toContain('Telegram username: @maria_user');
    expect(message.text).not.toContain('WhatsApp number');
  });

  it('renders the exact RU Home email body', async () => {
    const request = bookingRequest('home', 'ru');
    const quote = calculateTrustedBookingQuote(request);

    expect(quote).not.toBeNull();
    const result = await deliverBookingEmail(request, quote!);
    const message = mailMock.sendMail.mock.calls[0]?.[0] as Record<string, string>;

    expect(result).toEqual({kind: 'accepted'});
    expect(message.subject).toBe('Новая заявка на бронирование');
    expect(message.text).toBe([
      'Имя гостя: Maria Ivanova',
      'Email гостя: maria@example.com',
      'Предпочтительный способ связи: Email',
      'Адрес квартиры: Московская область, деревня Митино',
      'Дата заезда: 20.08.2026',
      'Дата выезда: 22.08.2026'
    ].join('\n'));
    expect(message.text).not.toMatch(/^(Источник формы|Локаль|Квартира|Slug|Ночей|Режим цены|Валюта|Доверенная стоимость|Создано):/mu);
    expect(message.text).not.toMatch(/captcha|challenge|honeypot|website|stack|IP|secret|password|BOOKING_/iu);
  });

  it('renders the exact EN Home email body', async () => {
    const request = bookingRequest('home', 'en');
    const quote = calculateTrustedBookingQuote(request);

    expect(quote).not.toBeNull();
    const result = await deliverBookingEmail(request, quote!);
    const message = mailMock.sendMail.mock.calls[0]?.[0] as Record<string, string>;

    expect(result).toEqual({kind: 'accepted'});
    expect(message.subject).toBe('New booking request');
    expect(message.text).toBe([
      'Guest name: Maria Ivanova',
      'Guest email: maria@example.com',
      'Preferred contact method: Email',
      'Apartment address: Moscow region, Mitino village',
      'Check-in date: 08/20/2026',
      'Check-out date: 08/22/2026'
    ].join('\n'));
    expect(message.text).not.toMatch(/^(Form source|Locale|Apartment|Slug|Nights|Price mode|Currency|Trusted total|Created at):/mu);
    expect(message.text).not.toMatch(/captcha|challenge|honeypot|website|stack|IP|secret|password|BOOKING_/iu);
  });

  it('renders localized Home WhatsApp and Telegram contact lines only when selected', async () => {
    for (const [locale, whatsappText, telegramText] of [
      ['ru', 'Номер WhatsApp: +995 555 000 000', 'Имя пользователя Telegram: @maria_user'],
      ['en', 'WhatsApp number: +995 555 000 000', 'Telegram username: @maria_user']
    ] as const) {
      const whatsappRequest = bookingRequest('home', locale, 'whatsapp', '+995 555 000 000');
      const whatsappQuote = calculateTrustedBookingQuote(whatsappRequest);
      await deliverBookingEmail(whatsappRequest, whatsappQuote!);
      const whatsappMessage = mailMock.sendMail.mock.calls.at(-1)?.[0] as Record<string, string>;
      expect(whatsappMessage.text).toContain(whatsappText);
      expect(whatsappMessage.text).not.toContain('Telegram username');

      const telegramRequest = bookingRequest('home', locale, 'telegram', '@maria_user');
      const telegramQuote = calculateTrustedBookingQuote(telegramRequest);
      await deliverBookingEmail(telegramRequest, telegramQuote!);
      const telegramMessage = mailMock.sendMail.mock.calls.at(-1)?.[0] as Record<string, string>;
      expect(telegramMessage.text).toContain(telegramText);
      expect(telegramMessage.text).not.toContain('WhatsApp number');
    }
  });

  it('does not create a transport when delivery is disabled', async () => {
    vi.stubEnv('BOOKING_MAIL_MODE', 'disabled');
    const request = bookingRequest('home', 'en');
    const quote = calculateTrustedBookingQuote(request);
    const result = await deliverBookingEmail(request, quote!);

    expect(result).toEqual({kind: 'not_configured'});
    expect(mailMock.sendMail).not.toHaveBeenCalled();
  });

  it('fails cleanly for an unknown apartment and a transport error', async () => {
    const validRequest = bookingRequest('home', 'en');
    const validQuote = calculateTrustedBookingQuote(validRequest)!;
    const invalidRequest = {...validRequest, apartmentSlug: 'missing-slug'};
    const invalidQuote = {...validQuote, apartmentSlug: 'missing-slug'};

    await expect(deliverBookingEmail(invalidRequest, invalidQuote)).resolves.toEqual({kind: 'delivery_failed'});

    mailMock.sendMail.mockRejectedValueOnce(new Error('test transport failure'));
    await expect(deliverBookingEmail(validRequest, validQuote)).resolves.toEqual({kind: 'delivery_failed'});
    expect(mailMock.close).toHaveBeenCalled();
  });
});
