import type {ChangeEvent} from 'react';

import styles from './BookingHoneypot.module.css';

type BookingHoneypotProps = {
  readonly value: string;
  readonly onChange: (event: ChangeEvent<HTMLInputElement>) => void;
};

export function BookingHoneypot({value, onChange}: BookingHoneypotProps) {
  return (
    <div aria-hidden="true" className={styles.field}>
      <label aria-hidden="true" htmlFor="booking-website">Website</label>
      <input
        aria-hidden="true"
        autoComplete="off"
        id="booking-website"
        name="website"
        onChange={onChange}
        tabIndex={-1}
        type="text"
        value={value}
      />
    </div>
  );
}
