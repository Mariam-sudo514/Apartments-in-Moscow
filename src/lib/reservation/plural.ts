import type {ReservationPluralForms} from '@/types/reservation';

export function getPluralForm(
  locale: string,
  count: number,
  forms: ReservationPluralForms
): string {
  const category = new Intl.PluralRules(locale).select(count);

  return forms[category as keyof ReservationPluralForms] ?? forms.other;
}
