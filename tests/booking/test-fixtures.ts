import type {BookingValidationLabels} from '@/types/booking';

export const clientLabels: BookingValidationLabels = {
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
  reservationIncomplete: 'reservation incomplete',
  todayInitializing: 'today initializing'
};
