import {randomBytes} from 'node:crypto';

import type {BookingValidationLabels, HomeBookingLabels} from '@/types/booking';

export const TEST_RATE_LIMIT_SECRET = randomBytes(32).toString('hex');

export const clientLabels: BookingValidationLabels & Pick<HomeBookingLabels,
  | 'emailOption'
  | 'guestEmailFormat'
  | 'guestEmailLabel'
  | 'guestEmailPlaceholder'
  | 'guestEmailRequired'
  | 'preferredContactMethodLabel'
  | 'preferredContactMethodPlaceholder'
  | 'preferredContactMethodRequired'
  | 'preferredContactValueFormat'
  | 'telegramOption'
  | 'telegramUsernameFormat'
  | 'telegramUsernameLabel'
  | 'telegramUsernamePlaceholder'
  | 'telegramUsernameRequired'
  | 'whatsappNumberFormat'
  | 'whatsappNumberLabel'
  | 'whatsappNumberPlaceholder'
  | 'whatsappNumberRequired'
  | 'whatsappOption'
> = {
  apartmentRequired: 'apartment required',
  checkInPast: 'check-in is in the past',
  checkInRequired: 'check-in required',
  checkOutAfterCheckIn: 'check-out must be after check-in',
  checkOutRequired: 'check-out required',
  guestNameControlCharacters: 'name contains control characters',
  guestNameLabel: 'Guest name',
  guestNamePlaceholder: 'Name',
  guestNameRequired: 'name required',
  guestNameTooLong: 'name too long',
  guestNameTooShort: 'name too short',
  guestPhoneFormat: 'phone format',
  guestPhoneLabel: 'Guest phone',
  guestPhonePlaceholder: 'Phone',
  guestPhoneRequired: 'phone required',
  guestPhoneTooLong: 'phone too long',
  guestPhoneTooShort: 'phone too short',
  guestEmailFormat: 'email format',
  guestEmailLabel: 'Email',
  guestEmailPlaceholder: 'name@example.com',
  guestEmailRequired: 'email required',
  preferredContactMethodLabel: 'Preferred contact method',
  preferredContactMethodPlaceholder: 'Choose a contact method',
  preferredContactMethodRequired: 'contact method required',
  preferredContactValueFormat: 'contact value not allowed',
  emailOption: 'Email',
  whatsappOption: 'WhatsApp',
  telegramOption: 'Telegram',
  whatsappNumberLabel: 'WhatsApp number',
  whatsappNumberPlaceholder: 'e.g. +995 555 00 00 00',
  whatsappNumberRequired: 'WhatsApp required',
  whatsappNumberFormat: 'WhatsApp format',
  telegramUsernameLabel: 'Telegram username',
  telegramUsernamePlaceholder: '@username',
  telegramUsernameRequired: 'Telegram required',
  telegramUsernameFormat: 'Telegram format',
  reservationIncomplete: 'reservation incomplete',
  todayInitializing: 'today initializing'
};
