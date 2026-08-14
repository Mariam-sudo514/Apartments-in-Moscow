import type {ApartmentPriceMode} from './apartment';
import type {BookingLabels} from './booking';

export type IsoDate = `${number}-${number}-${number}`;

export type ReservationApartmentOption = {
  readonly slug: string;
  readonly label: string;
  readonly address: string;
  readonly price: number;
  readonly priceMode: ApartmentPriceMode;
  readonly currency: 'RUB';
};

export type ReservationPluralForms = {
  readonly one: string;
  readonly few: string;
  readonly many: string;
  readonly other: string;
};

export type ReservationLabels = {
  readonly title: string;
  readonly subtitle: string;
  readonly datesLabel: string;
  readonly datesPlaceholder: string;
  readonly calendarLabel: string;
  readonly previousMonth: string;
  readonly nextMonth: string;
  readonly today: string;
  readonly pastDate: string;
  readonly checkIn: string;
  readonly checkOut: string;
  readonly selectedRange: string;
  readonly selectCheckOut: string;
  readonly guestsLabel: string;
  readonly adultsLabel: string;
  readonly childrenLabel: string;
  readonly countLabel: string;
  readonly decreaseAdults: string;
  readonly increaseAdults: string;
  readonly decreaseChildren: string;
  readonly increaseChildren: string;
  readonly clear: string;
  readonly clearDates: string;
  readonly done: string;
  readonly apartmentLabel: string;
  readonly apartmentPlaceholder: string;
  readonly apartmentOptionsLabel: string;
  readonly summaryTitle: string;
  readonly summaryApartment: string;
  readonly summaryCheckIn: string;
  readonly summaryCheckOut: string;
  readonly summaryNights: string;
  readonly summaryAdults: string;
  readonly summaryChildren: string;
  readonly summaryTotal: string;
  readonly summaryEmpty: string;
  readonly summaryUpdate: string;
  readonly emptyValue: string;
  readonly preliminary: string;
  readonly from: string;
  readonly instructionsTitle: string;
  readonly instructions: readonly string[];
  readonly adults: ReservationPluralForms;
  readonly children: ReservationPluralForms;
  readonly nights: ReservationPluralForms;
  readonly booking: BookingLabels;
};
