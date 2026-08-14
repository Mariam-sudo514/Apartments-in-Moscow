'use client';

import type {ChangeEvent, FormEvent, KeyboardEvent as ReactKeyboardEvent} from 'react';
import {useEffect, useRef, useState} from 'react';

import {BookingContactFields} from '@/components/BookingContactFields';
import {getMoscowTodayIso, addCalendarDays, compareCalendarDates} from '@/lib/reservation/calendar';
import {validateBooking} from '@/lib/booking';
import type {Locale} from '@/types/locale';
import type {IsoDate} from '@/types/reservation';
import type {
  BookingFieldErrors,
  HomeBookingApartmentOption,
  HomeBookingLabels,
  HomeBookingRequestDraft
} from '@/types/booking';

import styles from './HomeBookingForm.module.css';

type HomeBookingFormProps = {
  readonly apartments: readonly HomeBookingApartmentOption[];
  readonly labels: HomeBookingLabels;
  readonly locale: Locale;
};

type HomeField = 'guestName' | 'guestPhone' | 'checkIn' | 'checkOut' | 'apartment';

type TouchedFields = Record<HomeField, boolean>;

type ReviewState = {
  readonly draft: HomeBookingRequestDraft;
  readonly formKey: string;
};

const initialTouched: TouchedFields = {
  apartment: false,
  checkIn: false,
  checkOut: false,
  guestName: false,
  guestPhone: false
};

export function HomeBookingForm({apartments, labels, locale}: HomeBookingFormProps) {
  const formRef = useRef<HTMLFormElement>(null);
  const guestNameRef = useRef<HTMLInputElement>(null);
  const guestPhoneRef = useRef<HTMLInputElement>(null);
  const checkInRef = useRef<HTMLInputElement>(null);
  const checkOutRef = useRef<HTMLInputElement>(null);
  const apartmentRef = useRef<HTMLSelectElement>(null);
  const [todayIso, setTodayIso] = useState<IsoDate | null>(null);
  const [guestName, setGuestName] = useState('');
  const [guestPhone, setGuestPhone] = useState('');
  const [checkIn, setCheckIn] = useState<IsoDate | null>(null);
  const [checkOut, setCheckOut] = useState<IsoDate | null>(null);
  const [selectedApartmentSlug, setSelectedApartmentSlug] = useState<string | null>(null);
  const [touched, setTouched] = useState<TouchedFields>(initialTouched);
  const [reviewAttempted, setReviewAttempted] = useState(false);
  const [errors, setErrors] = useState<BookingFieldErrors>({});
  const [reviewState, setReviewState] = useState<ReviewState | null>(null);
  const formKey = [guestName, guestPhone, checkIn ?? '', checkOut ?? '', selectedApartmentSlug ?? ''].join('|');
  const draft = reviewState?.formKey === formKey ? reviewState.draft : null;
  const checkOutMin = checkIn === null ? todayIso ?? undefined : addCalendarDays(checkIn, 1);
  const reviewDisabled = todayIso === null;

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setTodayIso(getMoscowTodayIso());
    }, 0);

    return () => window.clearTimeout(timer);
  }, []);

  function clearFieldError(field: keyof BookingFieldErrors): void {
    setErrors((current) => ({...current, [field]: undefined}));
    setReviewState(null);
  }

  function handleNameChange(event: ChangeEvent<HTMLInputElement>): void {
    setGuestName(event.target.value);
    clearFieldError('guestName');
  }

  function handlePhoneChange(event: ChangeEvent<HTMLInputElement>): void {
    setGuestPhone(event.target.value);
    clearFieldError('guestPhone');
  }

  function handleCheckInChange(event: ChangeEvent<HTMLInputElement>): void {
    const nextCheckIn = event.target.value === '' ? null : event.target.value as IsoDate;
    setCheckIn(nextCheckIn);

    if (
      nextCheckIn !== null &&
      checkOut !== null &&
      compareCalendarDates(checkOut, nextCheckIn) <= 0
    ) {
      setCheckOut(null);
      setTouched((current) => ({...current, checkOut: false}));
    }

    clearFieldError('checkIn');
    clearFieldError('checkOut');
  }

  function handleCheckOutChange(event: ChangeEvent<HTMLInputElement>): void {
    const nextCheckOut = event.target.value === '' ? null : event.target.value as IsoDate;
    setCheckOut(nextCheckOut);
    clearFieldError('checkOut');
  }

  function handleApartmentChange(event: ChangeEvent<HTMLSelectElement>): void {
    setSelectedApartmentSlug(event.target.value || null);
    clearFieldError('apartment');
  }

  function validateCurrentField(field: HomeField): void {
    const result = validateBooking({
      apartmentSlug: selectedApartmentSlug,
      checkIn,
      checkOut,
      guestName,
      guestPhone,
      labels,
      locale,
      source: 'home',
      todayIso
    });

    setErrors((current) => ({
      ...current,
      [field]: result.ok ? undefined : result.errors[field]
    }));
  }

  function handleBlur(field: HomeField): void {
    setTouched((current) => ({...current, [field]: true}));
    validateCurrentField(field);
  }

  function focusFirstError(result: Extract<ReturnType<typeof validateBooking>, {readonly ok: false}>): void {
    window.requestAnimationFrame(() => {
      if (result.errors.guestName) {
        guestNameRef.current?.focus();
      } else if (result.errors.guestPhone) {
        guestPhoneRef.current?.focus();
      } else if (result.errors.checkIn) {
        checkInRef.current?.focus();
      } else if (result.errors.checkOut) {
        checkOutRef.current?.focus();
      } else if (result.errors.apartment) {
        apartmentRef.current?.focus();
      } else {
        formRef.current?.focus();
      }
    });
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>): void {
    event.preventDefault();
    setReviewAttempted(true);

    const result = validateBooking({
      apartmentSlug: selectedApartmentSlug,
      checkIn,
      checkOut,
      guestName,
      guestPhone,
      labels,
      locale,
      source: 'home',
      todayIso
    });

    if (!result.ok) {
      setReviewState(null);
      setErrors(result.errors);
      focusFirstError(result);
      return;
    }

    setErrors({});
    setReviewState({draft: result.draft, formKey});
  }

  function focusErrorTarget(id: string): void {
    if (id === 'home-guest-name') guestNameRef.current?.focus();
    if (id === 'home-guest-phone') guestPhoneRef.current?.focus();
    if (id === 'home-check-in') checkInRef.current?.focus();
    if (id === 'home-check-out') checkOutRef.current?.focus();
    if (id === 'home-apartment') apartmentRef.current?.focus();
  }

  function handleFormKeyDown(event: ReactKeyboardEvent<HTMLFormElement>): void {
    if (event.key === 'Enter' && event.target instanceof HTMLInputElement && event.target.type === 'date') {
      event.preventDefault();
      event.currentTarget.requestSubmit();
    }
  }

  const guestNameError = (reviewAttempted || touched.guestName) ? errors.guestName : undefined;
  const guestPhoneError = (reviewAttempted || touched.guestPhone) ? errors.guestPhone : undefined;
  const checkInError = (reviewAttempted || touched.checkIn) ? errors.checkIn : undefined;
  const checkOutError = (reviewAttempted || touched.checkOut) ? errors.checkOut : undefined;
  const apartmentError = (reviewAttempted || touched.apartment) ? errors.apartment : undefined;
  const errorItems = [
    {error: guestNameError, id: 'home-guest-name', label: labels.guestNameLabel},
    {error: guestPhoneError, id: 'home-guest-phone', label: labels.guestPhoneLabel},
    {error: checkInError, id: 'home-check-in', label: labels.checkInLabel},
    {error: checkOutError, id: 'home-check-out', label: labels.checkOutLabel},
    {error: apartmentError, id: 'home-apartment', label: labels.apartmentLabel}
  ].filter((item): item is {error: string; id: string; label: string} => Boolean(item.error));

  return (
    <form
      aria-describedby={errorItems.length > 0 ? 'home-booking-errors' : undefined}
      className={styles.form}
      noValidate
      onKeyDown={handleFormKeyDown}
      onSubmit={handleSubmit}
      ref={formRef}
      tabIndex={-1}
    >
      <h2 className={styles.title} id="home-booking-title">
        {labels.title}
      </h2>
      <p className={styles.description}>{labels.description}</p>

      {errorItems.length > 0 ? (
        <div className={styles.errorSummary} id="home-booking-errors" role="alert">
          <p className={styles.errorSummaryTitle}>{labels.errorSummaryTitle}</p>
          <ul className={styles.errorSummaryList}>
            {errorItems.map((item) => (
              <li key={item.id}>
                <a
                  href={`#${item.id}`}
                  onClick={(event) => {
                    event.preventDefault();
                    focusErrorTarget(item.id);
                  }}
                >
                  {item.label}: {item.error}
                </a>
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      <div className={styles.grid}>
        <div className={styles.column}>
          <h3 className={styles.subtitle}>{labels.contactTitle}</h3>
          <BookingContactFields
            guestName={guestName}
            guestNameError={guestNameError}
            guestPhone={guestPhone}
            guestPhoneError={guestPhoneError}
            labels={labels}
            nameInputId="home-guest-name"
            nameRef={guestNameRef}
            onNameBlur={() => handleBlur('guestName')}
            onNameChange={handleNameChange}
            onPhoneBlur={() => handleBlur('guestPhone')}
            onPhoneChange={handlePhoneChange}
            phoneInputId="home-guest-phone"
            phoneRef={guestPhoneRef}
            variant="home"
          />
        </div>

        <div className={styles.column}>
          <h3 className={styles.subtitle}>{labels.bookingDetailsTitle}</h3>
          <div className={styles.dates}>
            <div className={styles.dateField}>
              <label className={styles.label} htmlFor="home-check-in">
                {labels.checkInLabel}
              </label>
              <input
                aria-describedby={checkInError ? 'home-check-in-error' : undefined}
                aria-invalid={checkInError !== undefined}
                className={[styles.input, checkInError ? styles.invalidInput : ''].join(' ')}
                id="home-check-in"
                min={todayIso ?? undefined}
                name="checkIn"
                onBlur={() => handleBlur('checkIn')}
                onChange={handleCheckInChange}
                ref={checkInRef}
                required
                type="date"
                value={checkIn ?? ''}
              />
              {checkInError ? <p className={styles.fieldError} id="home-check-in-error" role="alert">{checkInError}</p> : null}
            </div>
            <div className={styles.dateField}>
              <label className={styles.label} htmlFor="home-check-out">
                {labels.checkOutLabel}
              </label>
              <input
                aria-describedby={checkOutError ? 'home-check-out-error' : undefined}
                aria-invalid={checkOutError !== undefined}
                className={[styles.input, checkOutError ? styles.invalidInput : ''].join(' ')}
                id="home-check-out"
                min={checkOutMin}
                name="checkOut"
                onBlur={() => handleBlur('checkOut')}
                onChange={handleCheckOutChange}
                ref={checkOutRef}
                required
                type="date"
                value={checkOut ?? ''}
              />
              {checkOutError ? <p className={styles.fieldError} id="home-check-out-error" role="alert">{checkOutError}</p> : null}
            </div>
          </div>

          <div className={styles.apartmentField}>
            <label className={styles.label} htmlFor="home-apartment">
              {labels.apartmentLabel}
            </label>
            <select
              aria-describedby={apartmentError ? 'home-apartment-error' : undefined}
              aria-invalid={apartmentError !== undefined}
              className={[styles.input, styles.select, apartmentError ? styles.invalidInput : ''].join(' ')}
              id="home-apartment"
              name="apartmentSlug"
              onBlur={() => handleBlur('apartment')}
              onChange={handleApartmentChange}
              ref={apartmentRef}
              required
              value={selectedApartmentSlug ?? ''}
            >
              <option disabled value="">{labels.apartmentPlaceholder}</option>
              {apartments.map((apartment) => (
                <option key={apartment.slug} value={apartment.slug}>
                  {apartment.label} — {apartment.address}
                </option>
              ))}
            </select>
            {apartmentError ? <p className={styles.fieldError} id="home-apartment-error" role="alert">{apartmentError}</p> : null}
          </div>
        </div>
      </div>

      <button className={styles.reviewButton} disabled={reviewDisabled} type="submit">
        {labels.review}
      </button>
      {reviewDisabled ? <p className={styles.disabledHint}>{labels.reviewDisabledHint}</p> : null}
      {draft !== null ? (
        <p aria-live="polite" className={styles.reviewedMessage} role="status">
          {labels.reviewedMessage}
        </p>
      ) : null}
    </form>
  );
}
