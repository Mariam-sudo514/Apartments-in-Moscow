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

function bookingRequest(source: 'home' | 'reservation', locale: 'ru' | 'en') {
  return source === 'reservation'
    ? createBookingRequestDraft({
        adults: 2,
        apartmentSlug: 'dmitrovskoe-107-apt-1',
        checkIn: '2026-08-20',
        checkOut: '2026-08-22',
        children: 1,
        guestName: 'Maria Ivanova',
        guestPhone: '+7 000 000 00 00',
        locale,
        source
      })
    : createBookingRequestDraft({
        apartmentSlug: 'mitino-aframe',
        checkIn: '2026-08-20',
        checkOut: '2026-08-22',
        guestName: 'Maria Ivanova',
        guestPhone: '+7 000 000 00 00',
        locale,
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
        smtpPort: 1025,
        to: 'landlord@example.test'
      },
      ok: true
    });
    expect(getBookingMailConfig({BOOKING_MAIL_MODE: 'mailpit'})).toMatchObject({
      config: {
        from: 'bookings@example.test',
        mode: 'mailpit',
        smtpHost: '127.0.0.1',
        smtpPort: 1025,
        to: 'landlord@example.test'
      },
      ok: true
    });
  });

  it('renders RU reservation plain text with trusted quote and guest counts', async () => {
    const request = bookingRequest('reservation', 'ru');
    const quote = calculateTrustedBookingQuote(request);

    expect(quote).not.toBeNull();
    const result = await deliverBookingEmail(request, quote!);

    expect(result).toEqual({kind: 'accepted'});
    const message = mailMock.sendMail.mock.calls[0]?.[0] as Record<string, string>;
    expect(message.from).toBe('bookings@example.test');
    expect(message.to).toBe('landlord@example.test');
    expect(message.subject).toBe('Новая заявка на бронирование');
    expect(message.text).toContain('Квартира:');
    expect(message.text).toContain('Заезд: 2026-08-20');
    expect(message.text).toContain('Выезд: 2026-08-22');
    expect(message.text).toContain('Взрослые: 2');
    expect(message.text).toContain('Дети: 1');
    expect(message.text).toContain('Slug: dmitrovskoe-107-apt-1');
    expect(message.text).not.toContain('<');
    expect(mailMock.close).toHaveBeenCalledOnce();
  });

  it('renders EN Home plain text without reservation-only guest counts', async () => {
    const request = bookingRequest('home', 'en');
    const quote = calculateTrustedBookingQuote(request);

    expect(quote).not.toBeNull();
    const result = await deliverBookingEmail(request, quote!);
    const message = mailMock.sendMail.mock.calls[0]?.[0] as Record<string, string>;

    expect(result).toEqual({kind: 'accepted'});
    expect(message.subject).toBe('New booking request');
    expect(message.text).toContain('Apartment:');
    expect(message.text).toContain('Address:');
    expect(message.text).toContain('Slug: mitino-aframe');
    expect(message.text).toContain('Price mode: from');
    expect(message.text).not.toContain('Adults:');
    expect(message.text).not.toContain('Children:');
    expect(message.text).not.toContain('owner@');
    expect(message.text).not.toContain('<');
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
