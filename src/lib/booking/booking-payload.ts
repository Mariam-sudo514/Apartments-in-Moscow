import type {BookingRequestDraft} from '@/types/booking';
import type {IsoDate} from '@/types/reservation';
import type {Locale} from '@/types/locale';

type BookingDraftPayloadInput = {
  readonly locale: Locale;
  readonly guestName: string;
  readonly guestPhone: string;
  readonly apartmentSlug: string;
  readonly checkIn: IsoDate;
  readonly checkOut: IsoDate;
} & (
  | {readonly source: 'home'}
  | {readonly source: 'reservation'; readonly adults: number; readonly children: number}
);

export function createBookingRequestDraft(
  input: BookingDraftPayloadInput
): BookingRequestDraft {
  const base = {
    apartmentSlug: input.apartmentSlug,
    checkIn: input.checkIn,
    checkOut: input.checkOut,
    guestName: input.guestName.trim(),
    guestPhone: input.guestPhone.trim(),
    locale: input.locale
  };

  return input.source === 'reservation'
    ? {...base, adults: input.adults, children: input.children, source: input.source}
    : {...base, source: input.source};
}
