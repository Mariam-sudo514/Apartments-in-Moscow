import type {IsoDate} from './reservation';
import type {Locale} from './locale';

type BookingRequestBase = {
  readonly locale: Locale;
  readonly guestName: string;
  readonly apartmentSlug: string;
  readonly checkIn: IsoDate;
  readonly checkOut: IsoDate;
};

export type HomeBookingRequestDraft = BookingRequestBase & {
  readonly guestEmail: string;
  readonly preferredContactMethod: PreferredContactMethod;
  readonly preferredContactValue: string | null;
  readonly source: 'home';
};

export type ReservationBookingRequestDraft = BookingRequestBase & {
  readonly adults: number;
  readonly children: number;
  readonly guestEmail: string;
  readonly preferredContactMethod: PreferredContactMethod;
  readonly preferredContactValue: string | null;
  readonly source: 'reservation';
};

export type BookingRequestDraft = HomeBookingRequestDraft | ReservationBookingRequestDraft;

export type PreferredContactMethod = 'email' | 'whatsapp' | 'telegram';

export type BookingCaptchaLabels = {
  readonly captchaAlt: string;
  readonly captchaInvalid: string;
  readonly captchaLabel: string;
  readonly captchaLoadFailed: string;
  readonly captchaPlaceholder: string;
  readonly captchaRefresh: string;
  readonly captchaRequired: string;
};

export type BookingFieldErrors = {
  readonly captcha?: string;
  readonly guestEmail?: string;
  readonly guestName?: string;
  readonly guestPhone?: string;
  readonly checkIn?: string;
  readonly checkOut?: string;
  readonly apartment?: string;
  readonly preferredContactMethod?: string;
  readonly preferredContactValue?: string;
  readonly today?: string;
  readonly reservation?: string;
  readonly server?: string;
};

export type BookingValidationLabels = {
  readonly guestNameLabel: string;
  readonly guestNamePlaceholder: string;
  readonly guestPhoneLabel: string;
  readonly guestPhonePlaceholder: string;
  readonly guestNameRequired: string;
  readonly guestNameTooShort: string;
  readonly guestNameTooLong: string;
  readonly guestNameControlCharacters: string;
  readonly guestPhoneRequired: string;
  readonly guestPhoneFormat: string;
  readonly guestPhoneTooShort: string;
  readonly guestPhoneTooLong: string;
  readonly checkInRequired: string;
  readonly checkInPast: string;
  readonly checkOutRequired: string;
  readonly checkOutAfterCheckIn: string;
  readonly apartmentRequired: string;
  readonly todayInitializing: string;
  readonly reservationIncomplete: string;
};

export type BookingContactLabels = Pick<
  BookingValidationLabels,
  'guestNameLabel' | 'guestNamePlaceholder' | 'guestPhoneLabel' | 'guestPhonePlaceholder'
>;

export type BookingContactMethodLabels = {
  readonly emailOption: string;
  readonly guestEmailFormat: string;
  readonly guestEmailLabel: string;
  readonly guestEmailPlaceholder: string;
  readonly guestEmailRequired: string;
  readonly preferredContactMethodLabel: string;
  readonly preferredContactMethodPlaceholder: string;
  readonly preferredContactMethodRequired: string;
  readonly preferredContactValueFormat: string;
  readonly telegramOption: string;
  readonly telegramUsernameFormat: string;
  readonly telegramUsernameLabel: string;
  readonly telegramUsernamePlaceholder: string;
  readonly telegramUsernameRequired: string;
  readonly whatsappNumberFormat: string;
  readonly whatsappNumberLabel: string;
  readonly whatsappNumberPlaceholder: string;
  readonly whatsappNumberRequired: string;
  readonly whatsappOption: string;
};

export type BookingSendLabels = {
  readonly captchaExpired: string;
  readonly sendRequest: string;
  readonly sending: string;
  readonly successMessage: string;
  readonly networkFailure: string;
  readonly invalidResponse: string;
  readonly requestInvalid: string;
  readonly requestForbidden: string;
  readonly requestPayloadTooLarge: string;
  readonly requestUnsupportedMedia: string;
  readonly requestValidationFailed: string;
  readonly requestRateLimited: string;
  readonly serverMisconfigured: string;
  readonly deliveryNotConfigured: string;
  readonly deliveryFailed: string;
  readonly retry: string;
};

export type BookingLabels = BookingValidationLabels & BookingContactMethodLabels & BookingSendLabels & BookingCaptchaLabels & {
  readonly title: string;
  readonly description: string;
  readonly errorSummaryTitle: string;
};

export type HomeBookingLabels = Omit<BookingValidationLabels, 'guestPhoneFormat' | 'guestPhoneLabel' | 'guestPhonePlaceholder' | 'guestPhoneRequired' | 'guestPhoneTooLong' | 'guestPhoneTooShort'> & BookingContactMethodLabels & BookingSendLabels & BookingCaptchaLabels & {
  readonly title: string;
  readonly description: string;
  readonly contactTitle: string;
  readonly bookingDetailsTitle: string;
  readonly checkInLabel: string;
  readonly checkOutLabel: string;
  readonly calendarLabel: string;
  readonly clearDate: string;
  readonly nextMonth: string;
  readonly previousMonth: string;
  readonly today: string;
  readonly datePlaceholder: string;
  readonly apartmentLabel: string;
  readonly apartmentPlaceholder: string;
  readonly guestEmailLabel: string;
  readonly guestEmailPlaceholder: string;
  readonly guestEmailRequired: string;
  readonly guestEmailFormat: string;
  readonly preferredContactMethodLabel: string;
  readonly preferredContactMethodPlaceholder: string;
  readonly preferredContactMethodRequired: string;
  readonly preferredContactValueFormat: string;
  readonly emailOption: string;
  readonly whatsappOption: string;
  readonly telegramOption: string;
  readonly whatsappNumberLabel: string;
  readonly whatsappNumberPlaceholder: string;
  readonly whatsappNumberRequired: string;
  readonly whatsappNumberFormat: string;
  readonly telegramUsernameLabel: string;
  readonly telegramUsernamePlaceholder: string;
  readonly telegramUsernameRequired: string;
  readonly telegramUsernameFormat: string;
  readonly errorSummaryTitle: string;
};

export type HomeBookingApartmentOption = {
  readonly slug: string;
  readonly label: string;
  readonly address: string;
};

type BookingValidationInputBase = {
  readonly labels: BookingValidationLabels & BookingContactMethodLabels;
  readonly locale: Locale;
  readonly guestName: string;
  readonly apartmentSlug: string | null;
  readonly checkIn: IsoDate | null;
  readonly checkOut: IsoDate | null;
  readonly todayIso: IsoDate | null;
};

export type HomeBookingValidationInput = Omit<BookingValidationInputBase, 'labels'> & {
  readonly labels: HomeBookingLabels;
  readonly source: 'home';
  readonly guestEmail: string;
  readonly preferredContactMethod: PreferredContactMethod | '';
  readonly preferredContactValue: string;
};

export type ReservationBookingValidationInput = BookingValidationInputBase & {
  readonly guestEmail: string;
  readonly preferredContactMethod: PreferredContactMethod | '';
  readonly preferredContactValue: string;
  readonly source: 'reservation';
  readonly adults: number;
  readonly children: number;
};

export type BookingValidationInput = HomeBookingValidationInput | ReservationBookingValidationInput;

export type BookingDraftResult<Source extends 'home' | 'reservation' = 'home' | 'reservation'> =
  | {
      readonly ok: true;
      readonly draft: Extract<BookingRequestDraft, {readonly source: Source}>;
    }
  | {
      readonly ok: false;
      readonly errors: BookingFieldErrors;
    };
