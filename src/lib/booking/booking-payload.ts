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
  readonly adults: number;
  readonly children: number;
};

export function createBookingRequestDraft(
  input: BookingDraftPayloadInput
): BookingRequestDraft {
  return {
    adults: input.adults,
    apartmentSlug: input.apartmentSlug,
    checkIn: input.checkIn,
    checkOut: input.checkOut,
    children: input.children,
    guestName: input.guestName.trim(),
    guestPhone: input.guestPhone.trim(),
    locale: input.locale,
    source: 'reservation'
  };
}
