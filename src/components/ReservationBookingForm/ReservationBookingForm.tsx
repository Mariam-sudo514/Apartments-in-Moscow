import type {ChangeEvent, FormEvent} from 'react';
import {useEffect, useRef, useState} from 'react';

import {BookingContactFields} from '@/components/BookingContactFields';
import {BookingHoneypot} from '@/components/BookingHoneypot';
import {
  getBookingClientErrorMessage,
  submitBookingRequest
} from '@/lib/booking/booking-api-client';
import {validateBooking} from '@/lib/booking';
import type {Locale} from '@/types/locale';
import type {IsoDate} from '@/types/reservation';
import type {
  BookingFieldErrors,
  BookingLabels,
  ReservationBookingRequestDraft
} from '@/types/booking';

import styles from './ReservationBookingForm.module.css';

type ReservationBookingFormProps = {
  readonly adults: number;
  readonly apartmentSlug: string | null;
  readonly checkIn: IsoDate | null;
  readonly checkOut: IsoDate | null;
  readonly childrenCount: number;
  readonly labels: BookingLabels;
  readonly locale: Locale;
  readonly reservationReady: boolean;
  readonly todayIso: IsoDate;
};

type TouchedFields = {
  readonly guestName: boolean;
  readonly guestPhone: boolean;
};

type ReviewState = {
  readonly draft: ReservationBookingRequestDraft;
  readonly reservationKey: string;
};

type SendStatus = 'idle' | 'sending' | 'success' | 'error';

export function ReservationBookingForm({
  adults,
  apartmentSlug,
  checkIn,
  checkOut,
  childrenCount,
  labels,
  locale,
  reservationReady,
  todayIso
}: ReservationBookingFormProps) {
  const formRef = useRef<HTMLFormElement>(null);
  const guestNameRef = useRef<HTMLInputElement>(null);
  const guestPhoneRef = useRef<HTMLInputElement>(null);
  const [guestName, setGuestName] = useState('');
  const [guestPhone, setGuestPhone] = useState('');
  const [touched, setTouched] = useState<TouchedFields>({
    guestName: false,
    guestPhone: false
  });
  const [reviewAttempted, setReviewAttempted] = useState(false);
  const [errors, setErrors] = useState<BookingFieldErrors>({});
  const [reviewState, setReviewState] = useState<ReviewState | null>(null);
  const [serverErrors, setServerErrors] = useState<BookingFieldErrors>({});
  const [sendError, setSendError] = useState<string | null>(null);
  const [sendStatus, setSendStatus] = useState<SendStatus>('idle');
  const [website, setWebsite] = useState('');
  const abortControllerRef = useRef<AbortController | null>(null);
  const submissionVersionRef = useRef(0);
  const reservationKey = [
    checkIn ?? '',
    checkOut ?? '',
    adults,
    childrenCount,
    apartmentSlug ?? '',
    guestName,
    guestPhone
  ].join('|');
  const draft = reviewState?.reservationKey === reservationKey ? reviewState.draft : null;

  useEffect(() => {
    if (reviewState?.reservationKey !== undefined && reviewState.reservationKey !== reservationKey) {
      submissionVersionRef.current += 1;
      abortControllerRef.current?.abort();
      abortControllerRef.current = null;
    }
  }, [reservationKey, reviewState?.reservationKey]);

  useEffect(() => () => {
    abortControllerRef.current?.abort();
  }, []);

  function invalidateReview(): void {
    submissionVersionRef.current += 1;
    abortControllerRef.current?.abort();
    abortControllerRef.current = null;
    setReviewState(null);
    setServerErrors({});
    setSendError(null);
    setSendStatus('idle');
  }

  function clearFieldError(field: 'guestName' | 'guestPhone'): void {
    setErrors((current) => ({...current, [field]: undefined}));
    setServerErrors((current) => ({...current, [field]: undefined}));
    invalidateReview();
  }

  function handleNameChange(event: ChangeEvent<HTMLInputElement>): void {
    setGuestName(event.target.value);
    clearFieldError('guestName');
  }

  function handlePhoneChange(event: ChangeEvent<HTMLInputElement>): void {
    setGuestPhone(event.target.value);
    clearFieldError('guestPhone');
  }

  function validateCurrentField(field: 'guestName' | 'guestPhone'): void {
    const result = validateBooking({
      adults,
      apartmentSlug,
      checkIn,
      checkOut,
      children: childrenCount,
      guestName,
      guestPhone,
      labels,
      locale,
      source: 'reservation',
      todayIso
    });

    setErrors((current) => ({
      ...current,
      [field]: result.ok ? undefined : result.errors[field]
    }));
  }

  function handleBlur(field: 'guestName' | 'guestPhone'): void {
    setTouched((current) => ({...current, [field]: true}));
    validateCurrentField(field);
  }

  function focusFirstError(result: Extract<ReturnType<typeof validateBooking>, {readonly ok: false}>): void {
    window.requestAnimationFrame(() => {
      if (result.errors.guestName) {
        guestNameRef.current?.focus();
      } else if (result.errors.guestPhone) {
        guestPhoneRef.current?.focus();
      } else {
        formRef.current?.focus();
      }
    });
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>): void {
    event.preventDefault();
    setReviewAttempted(true);

    const result = validateBooking({
      adults,
      apartmentSlug,
      checkIn,
      checkOut,
      children: childrenCount,
      guestName,
      guestPhone,
      labels,
      locale,
      source: 'reservation',
      todayIso
    });

    if (!result.ok) {
      setReviewState(null);
      setServerErrors({});
      setSendError(null);
      setSendStatus('idle');
      setErrors(result.errors);
      focusFirstError(result);
      return;
    }

    setErrors({});
    setServerErrors({});
    setSendError(null);
    setSendStatus('idle');
    setReviewState({draft: result.draft, reservationKey});
  }

  function getServerFieldErrors(
    fields: Readonly<Record<string, string>> | undefined
  ): BookingFieldErrors {
    const nextErrors: Record<string, string> = {};

    for (const [field, code] of Object.entries(fields ?? {})) {
      if (field === 'guestName') {
        nextErrors.guestName = code === 'required'
          ? labels.guestNameRequired
          : code === 'too_short'
            ? labels.guestNameTooShort
            : code === 'too_long'
              ? labels.guestNameTooLong
              : code === 'control_characters'
                ? labels.guestNameControlCharacters
                : labels.requestValidationFailed;
      } else if (field === 'guestPhone') {
        nextErrors.guestPhone = code === 'required'
          ? labels.guestPhoneRequired
          : code === 'too_short'
            ? labels.guestPhoneTooShort
            : code === 'too_long'
              ? labels.guestPhoneTooLong
              : labels.guestPhoneFormat;
      } else {
        nextErrors.reservation = labels.requestValidationFailed;
      }
    }

    return nextErrors;
  }

  async function handleSendRequest(): Promise<void> {
    if (draft === null || sendStatus === 'sending' || sendStatus === 'success') {
      return;
    }

    abortControllerRef.current?.abort();
    const controller = new AbortController();
    const version = ++submissionVersionRef.current;
    abortControllerRef.current = controller;
    setSendStatus('sending');
    setSendError(null);
    setServerErrors({});

    const result = await submitBookingRequest({...draft, website}, controller.signal);

    if (version !== submissionVersionRef.current || controller.signal.aborted) {
      return;
    }

    abortControllerRef.current = null;

    if (result.ok) {
      setSendStatus('success');
      return;
    }

    if (result.failure.kind === 'aborted') {
      return;
    }

    setSendStatus('error');
    setSendError(getBookingClientErrorMessage(result.failure, labels));

    if (result.failure.kind === 'server' && result.failure.code === 'VALIDATION_FAILED') {
      setReviewState(null);
      setServerErrors(getServerFieldErrors(result.failure.fields));
    }
  }

  const guestNameError = (reviewAttempted || touched.guestName) ? errors.guestName ?? serverErrors.guestName : undefined;
  const guestPhoneError = (reviewAttempted || touched.guestPhone) ? errors.guestPhone ?? serverErrors.guestPhone : undefined;
  const errorItems = [
    {error: guestNameError, id: 'reservation-guest-name', label: labels.guestNameLabel},
    {error: guestPhoneError, id: 'reservation-guest-phone', label: labels.guestPhoneLabel},
    {error: reviewAttempted ? errors.reservation ?? serverErrors.reservation : undefined, id: 'reservation-booking-form', label: labels.title}
  ].filter((item): item is {error: string; id: string; label: string} => Boolean(item.error));

  return (
    <section aria-labelledby="reservation-booking-form-title" className={styles.formSection}>
      <form
        aria-describedby={errorItems.length > 0 ? 'reservation-booking-errors' : undefined}
        className={styles.form}
        id="reservation-booking-form"
        noValidate
        onSubmit={handleSubmit}
        ref={formRef}
        tabIndex={-1}
      >
        <h2 className={styles.title} id="reservation-booking-form-title">
          {labels.title}
        </h2>
        <p className={styles.description}>{labels.description}</p>

        {errorItems.length > 1 ? (
          <div className={styles.errorSummary} id="reservation-booking-errors" role="alert">
            <p className={styles.errorSummaryTitle}>{labels.errorSummaryTitle}</p>
            <ul className={styles.errorSummaryList}>
              {errorItems.map((item) => (
                <li key={item.id}>
                  <a
                    href={`#${item.id}`}
                    onClick={(event) => {
                      event.preventDefault();
                      if (item.id === 'reservation-guest-name') guestNameRef.current?.focus();
                      if (item.id === 'reservation-guest-phone') guestPhoneRef.current?.focus();
                      if (item.id === 'reservation-booking-form') formRef.current?.focus();
                    }}
                  >
                    {item.label}: {item.error}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        ) : null}

        {errorItems.length === 1 && errors.reservation ? (
          <p className={styles.fieldError} id="reservation-booking-error" role="alert">
            {errors.reservation}
          </p>
        ) : null}

        <BookingContactFields
          guestName={guestName}
          guestNameError={guestNameError}
          guestPhone={guestPhone}
          guestPhoneError={guestPhoneError}
          labels={labels}
          nameInputId="reservation-guest-name"
          nameRef={guestNameRef}
          onNameBlur={() => handleBlur('guestName')}
          onNameChange={handleNameChange}
          onPhoneBlur={() => handleBlur('guestPhone')}
          onPhoneChange={handlePhoneChange}
          phoneInputId="reservation-guest-phone"
          phoneRef={guestPhoneRef}
          variant="reservation"
        />

        <button className={styles.reviewButton} disabled={!reservationReady} type="submit">
          {labels.review}
        </button>
        {!reservationReady ? <p className={styles.disabledHint}>{labels.reviewDisabledHint}</p> : null}

        {draft !== null ? (
          <>
            <p aria-live="polite" className={styles.reviewedMessage} role="status">
              {sendStatus === 'success' ? labels.successMessage : labels.reviewedMessage}
            </p>
            <button
              aria-busy={sendStatus === 'sending'}
              className={styles.reviewButton}
              disabled={sendStatus === 'sending' || sendStatus === 'success'}
              onClick={handleSendRequest}
              type="button"
            >
              {sendStatus === 'sending'
                ? labels.sending
                : sendStatus === 'error'
                  ? labels.retry
                  : labels.sendRequest}
            </button>
            {sendError !== null ? (
              <p aria-live="assertive" className={styles.fieldError} role="alert">
                {sendError}
              </p>
            ) : null}
          </>
        ) : null}
        <BookingHoneypot value={website} onChange={(event) => setWebsite(event.target.value)} />
      </form>
    </section>
  );
}
