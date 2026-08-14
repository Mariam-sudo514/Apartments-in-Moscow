import type {IsoDate} from './reservation';
import type {Locale} from './locale';

type BookingRequestBase = {
  readonly locale: Locale;
  readonly guestName: string;
  readonly guestPhone: string;
  readonly apartmentSlug: string;
  readonly checkIn: IsoDate;
  readonly checkOut: IsoDate;
};

export type HomeBookingRequestDraft = BookingRequestBase & {
  readonly source: 'home';
};

export type ReservationBookingRequestDraft = BookingRequestBase & {
  readonly source: 'reservation';
  readonly adults: number;
  readonly children: number;
};

export type BookingRequestDraft = HomeBookingRequestDraft | ReservationBookingRequestDraft;

export type BookingFieldErrors = {
  readonly guestName?: string;
  readonly guestPhone?: string;
  readonly checkIn?: string;
  readonly checkOut?: string;
  readonly apartment?: string;
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

export type BookingSendLabels = {
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

export type BookingLabels = BookingValidationLabels & BookingSendLabels & {
  readonly title: string;
  readonly description: string;
  readonly review: string;
  readonly reviewDisabledHint: string;
  readonly errorSummaryTitle: string;
  readonly reviewedMessage: string;
};

export type HomeBookingLabels = BookingValidationLabels & BookingSendLabels & {
  readonly title: string;
  readonly description: string;
  readonly contactTitle: string;
  readonly bookingDetailsTitle: string;
  readonly checkInLabel: string;
  readonly checkOutLabel: string;
  readonly apartmentLabel: string;
  readonly apartmentPlaceholder: string;
  readonly review: string;
  readonly reviewDisabledHint: string;
  readonly errorSummaryTitle: string;
  readonly reviewedMessage: string;
};

export type HomeBookingApartmentOption = {
  readonly slug: string;
  readonly label: string;
  readonly address: string;
};

export type BookingValidationInput = {
  readonly source: 'home' | 'reservation';
  readonly labels: BookingValidationLabels;
  readonly locale: Locale;
  readonly guestName: string;
  readonly guestPhone: string;
  readonly apartmentSlug: string | null;
  readonly checkIn: IsoDate | null;
  readonly checkOut: IsoDate | null;
  readonly todayIso: IsoDate | null;
  readonly adults?: number;
  readonly children?: number;
};

export type BookingDraftResult<Source extends 'home' | 'reservation' = 'home' | 'reservation'> =
  | {
      readonly ok: true;
      readonly draft: Extract<BookingRequestDraft, {readonly source: Source}>;
    }
  | {
      readonly ok: false;
      readonly errors: BookingFieldErrors;
    };
