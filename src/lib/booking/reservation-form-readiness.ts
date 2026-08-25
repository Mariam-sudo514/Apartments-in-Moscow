import type {BookingValidationInput} from '@/types/booking';
import {validateBooking} from './booking-validation';

export type ReservationFormReadinessInput = Omit<Extract<BookingValidationInput, {readonly source: 'reservation'}>, 'source'> & {
  readonly captchaAnswer: string;
  readonly captchaChallengeId: string | null;
  readonly reservationReady: boolean;
  readonly source: 'reservation';
};

export function isReservationFormReady(input: ReservationFormReadinessInput): boolean {
  const validation = validateBooking(input);

  return input.reservationReady &&
    validation.ok &&
    input.captchaChallengeId !== null &&
    input.captchaAnswer.trim() !== '';
}
