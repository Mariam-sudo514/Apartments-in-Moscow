import type {BookingRequestDraft} from '@/types/booking';
import type {IsoDate} from '@/types/reservation';
import type {Locale} from '@/types/locale';

type BookingDraftPayloadInput = {
  readonly locale: Locale;
  readonly guestName: string;
  readonly apartmentSlug: string;
  readonly checkIn: IsoDate;
  readonly checkOut: IsoDate;
} & (
  | {
      readonly source: 'home';
      readonly guestEmail: string;
      readonly preferredContactMethod: 'email' | 'whatsapp' | 'telegram';
      readonly preferredContactValue: string | null;
    }
  | {
      readonly source: 'reservation';
      readonly adults: number;
      readonly children: number;
      readonly guestEmail: string;
      readonly preferredContactMethod: 'email' | 'whatsapp' | 'telegram';
      readonly preferredContactValue: string | null;
    }
);

export function createBookingRequestDraft(
  input: BookingDraftPayloadInput
): BookingRequestDraft {
  const base = {
    apartmentSlug: input.apartmentSlug,
    checkIn: input.checkIn,
    checkOut: input.checkOut,
    guestName: input.guestName.trim(),
    locale: input.locale
  };

  if (input.source === 'reservation') {
    return {
      ...base,
      adults: input.adults,
      children: input.children,
      guestEmail: input.guestEmail.trim(),
      preferredContactMethod: input.preferredContactMethod,
      preferredContactValue: input.preferredContactValue === null ? null : input.preferredContactValue.trim(),
      source: input.source
    };
  }

  return {
    ...base,
    guestEmail: input.guestEmail.trim(),
    preferredContactMethod: input.preferredContactMethod,
    preferredContactValue: input.preferredContactValue === null ? null : input.preferredContactValue.trim(),
    source: input.source
  };
}
