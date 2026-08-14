import type {ChangeEvent, RefObject} from 'react';

import type {BookingContactLabels} from '@/types/booking';

import styles from './BookingContactFields.module.css';

type BookingContactFieldsProps = {
  readonly guestName: string;
  readonly guestPhone: string;
  readonly guestNameError?: string;
  readonly guestPhoneError?: string;
  readonly labels: BookingContactLabels;
  readonly nameInputId: string;
  readonly phoneInputId: string;
  readonly nameRef: RefObject<HTMLInputElement | null>;
  readonly phoneRef: RefObject<HTMLInputElement | null>;
  readonly onNameBlur: () => void;
  readonly onPhoneBlur: () => void;
  readonly onNameChange: (event: ChangeEvent<HTMLInputElement>) => void;
  readonly onPhoneChange: (event: ChangeEvent<HTMLInputElement>) => void;
  readonly variant: 'home' | 'reservation';
};

export function BookingContactFields({
  guestName,
  guestPhone,
  guestNameError,
  guestPhoneError,
  labels,
  nameInputId,
  phoneInputId,
  nameRef,
  phoneRef,
  onNameBlur,
  onPhoneBlur,
  onNameChange,
  onPhoneChange,
  variant
}: BookingContactFieldsProps) {
  const inputClassName = [styles.input, variant === 'home' ? styles.homeInput : ''].join(' ');
  const invalidInputClassName = [
    inputClassName,
    styles.invalidInput
  ].join(' ');

  return (
    <>
      <div className={styles.fieldGroup}>
        <label className={styles.label} htmlFor={nameInputId}>
          {labels.guestNameLabel}
        </label>
        <input
          aria-describedby={guestNameError ? `${nameInputId}-error` : undefined}
          aria-invalid={guestNameError !== undefined}
          autoComplete="name"
          className={guestNameError ? invalidInputClassName : inputClassName}
          id={nameInputId}
          maxLength={100}
          name="guestName"
          onBlur={onNameBlur}
          onChange={onNameChange}
          placeholder={labels.guestNamePlaceholder}
          ref={nameRef}
          required
          type="text"
          value={guestName}
        />
        {guestNameError ? (
          <p className={styles.fieldError} id={`${nameInputId}-error`} role="alert">
            {guestNameError}
          </p>
        ) : null}
      </div>

      <div className={styles.fieldGroup}>
        <label className={styles.label} htmlFor={phoneInputId}>
          {labels.guestPhoneLabel}
        </label>
        <input
          aria-describedby={guestPhoneError ? `${phoneInputId}-error` : undefined}
          aria-invalid={guestPhoneError !== undefined}
          autoComplete="tel"
          className={guestPhoneError ? invalidInputClassName : inputClassName}
          id={phoneInputId}
          inputMode="tel"
          maxLength={32}
          name="guestPhone"
          onBlur={onPhoneBlur}
          onChange={onPhoneChange}
          placeholder={labels.guestPhonePlaceholder}
          ref={phoneRef}
          required
          type="tel"
          value={guestPhone}
        />
        {guestPhoneError ? (
          <p className={styles.fieldError} id={`${phoneInputId}-error`} role="alert">
            {guestPhoneError}
          </p>
        ) : null}
      </div>
    </>
  );
}
