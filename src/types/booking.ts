import type {IsoDate} from './reservation';
import type {Locale} from './locale';

export type BookingRequestDraft = {
  readonly source: 'reservation';
  readonly locale: Locale;
  readonly guestName: string;
  readonly guestPhone: string;
  readonly apartmentSlug: string;
  readonly checkIn: IsoDate;
  readonly checkOut: IsoDate;
  readonly adults: number;
  readonly children: number;
};

export type BookingFieldErrors = {
  readonly guestName?: string;
  readonly guestPhone?: string;
  readonly reservation?: string;
};

export type BookingLabels = {
  readonly title: string;
  readonly description: string;
  readonly guestNameLabel: string;
  readonly guestNamePlaceholder: string;
  readonly guestPhoneLabel: string;
  readonly guestPhonePlaceholder: string;
  readonly review: string;
  readonly reviewDisabledHint: string;
  readonly errorSummaryTitle: string;
  readonly guestNameRequired: string;
  readonly guestNameTooShort: string;
  readonly guestNameTooLong: string;
  readonly guestNameControlCharacters: string;
  readonly guestPhoneRequired: string;
  readonly guestPhoneFormat: string;
  readonly guestPhoneTooShort: string;
  readonly guestPhoneTooLong: string;
  readonly reservationIncomplete: string;
  readonly reviewedMessage: string;
};

export type BookingValidationInput = {
  readonly labels: BookingLabels;
  readonly locale: Locale;
  readonly guestName: string;
  readonly guestPhone: string;
  readonly apartmentSlug: string | null;
  readonly checkIn: IsoDate | null;
  readonly checkOut: IsoDate | null;
  readonly adults: number;
  readonly children: number;
};

export type BookingDraftResult =
  | {
      readonly ok: true;
      readonly draft: BookingRequestDraft;
    }
  | {
      readonly ok: false;
      readonly errors: BookingFieldErrors;
    };
