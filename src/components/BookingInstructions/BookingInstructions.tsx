import type {ReservationLabels} from '@/types/reservation';

import styles from './BookingInstructions.module.css';

type BookingInstructionsProps = {
  readonly labels: Pick<ReservationLabels, 'instructions' | 'instructionsTitle'>;
};

export function BookingInstructions({labels}: BookingInstructionsProps) {
  return (
    <section aria-labelledby="reservation-instructions-title" className={styles.info}>
      <h2 className={styles.title} id="reservation-instructions-title">
        {labels.instructionsTitle}
      </h2>
      <ul className={styles.list}>
        {labels.instructions.map((instruction) => (
          <li className={styles.item} key={instruction}>
            {instruction}
          </li>
        ))}
      </ul>
    </section>
  );
}
