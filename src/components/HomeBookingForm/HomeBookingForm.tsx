'use client';

import type {ChangeEvent, FormEvent} from 'react';
import {createPortal} from 'react-dom';
import {useCallback, useEffect, useRef, useState} from 'react';

import {BookingCaptcha} from '@/components/BookingCaptcha';
import {
  getBookingClientErrorMessage,
  submitBookingRequest
} from '@/lib/booking/booking-api-client';
import {addCalendarDays, compareCalendarDates, getMoscowTodayIso} from '@/lib/reservation/calendar';
import {validateBooking} from '@/lib/booking';
import type {Locale} from '@/types/locale';
import type {IsoDate} from '@/types/reservation';
import type {
  BookingFieldErrors,
  HomeBookingApartmentOption,
  HomeBookingLabels
} from '@/types/booking';

import styles from './HomeBookingForm.module.css';

type HomeBookingFormProps = {
  readonly apartments: readonly HomeBookingApartmentOption[];
  readonly labels: HomeBookingLabels;
  readonly locale: Locale;
};

type HomeField = 'guestName' | 'guestPhone' | 'checkIn' | 'checkOut' | 'apartment' | 'captcha';

type TouchedFields = Record<HomeField, boolean>;
type SendStatus = 'idle' | 'sending';

type HomeAlert = {
  readonly error: boolean;
  readonly id: number;
  readonly message: string;
  readonly visible: boolean;
};

const initialTouched: TouchedFields = {
  apartment: false,
  captcha: false,
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
  const captchaInputRef = useRef<HTMLInputElement>(null);
  const abortControllerRef = useRef<AbortController | null>(null);
  const submissionVersionRef = useRef(0);
  const alertSequenceRef = useRef(0);
  const alertTimersRef = useRef<number[]>([]);
  const [todayIso, setTodayIso] = useState<IsoDate | null>(null);
  const [guestName, setGuestName] = useState('');
  const [guestPhone, setGuestPhone] = useState('');
  const [checkIn, setCheckIn] = useState<IsoDate | null>(null);
  const [checkOut, setCheckOut] = useState<IsoDate | null>(null);
  const [selectedApartmentSlug, setSelectedApartmentSlug] = useState<string | null>(null);
  const [captchaAnswer, setCaptchaAnswer] = useState('');
  const [captchaChallengeId, setCaptchaChallengeId] = useState<string | null>(null);
  const [captchaReloadToken, setCaptchaReloadToken] = useState(0);
  const [touched, setTouched] = useState<TouchedFields>(initialTouched);
  const [submitAttempted, setSubmitAttempted] = useState(false);
  const [errors, setErrors] = useState<BookingFieldErrors>({});
  const [serverErrors, setServerErrors] = useState<BookingFieldErrors>({});
  const [sendStatus, setSendStatus] = useState<SendStatus>('idle');
  const [website, setWebsite] = useState('');
  const [alert, setAlert] = useState<HomeAlert | null>(null);
  const checkOutMin = checkIn === null ? todayIso ?? undefined : addCalendarDays(checkIn, 1);

  useEffect(() => {
    const timer = window.setTimeout(() => setTodayIso(getMoscowTodayIso()), 0);

    return () => window.clearTimeout(timer);
  }, []);

  useEffect(() => () => {
    abortControllerRef.current?.abort();
    for (const timer of alertTimersRef.current) {
      window.clearTimeout(timer);
    }
  }, []);

  function invalidateSubmission(): void {
    submissionVersionRef.current += 1;
    abortControllerRef.current?.abort();
    abortControllerRef.current = null;
    setServerErrors({});
    setSendStatus('idle');
  }

  function clearFieldError(field: keyof BookingFieldErrors): void {
    setErrors((current) => ({...current, [field]: undefined}));
    setServerErrors((current) => ({...current, [field]: undefined}));
    invalidateSubmission();
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
    setCheckOut(event.target.value === '' ? null : event.target.value as IsoDate);
    clearFieldError('checkOut');
  }

  function handleApartmentChange(event: ChangeEvent<HTMLSelectElement>): void {
    setSelectedApartmentSlug(event.target.value || null);
    clearFieldError('apartment');
  }

  function handleCaptchaChange(event: ChangeEvent<HTMLInputElement>): void {
    setCaptchaAnswer(event.target.value);
    clearFieldError('captcha');
  }

  const handleCaptchaChallengeChange = useCallback((challengeId: string | null): void => {
    setCaptchaChallengeId(challengeId);
    setCaptchaAnswer('');
    setErrors((current) => ({...current, captcha: undefined}));
    setServerErrors((current) => ({...current, captcha: undefined}));
  }, []);

  function validateCurrentField(field: HomeField): void {
    if (field === 'captcha') {
      setErrors((current) => ({
        ...current,
        captcha: captchaChallengeId === null || captchaAnswer.trim() === ''
          ? labels.captchaRequired
          : undefined
      }));
      return;
    }

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

  function getCurrentValidation() {
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
      return captchaChallengeId === null || captchaAnswer.trim() === ''
        ? {errors: {...result.errors, captcha: labels.captchaRequired}, ok: false as const}
        : result;
    }

    if (captchaChallengeId === null || captchaAnswer.trim() === '') {
      return {errors: {captcha: labels.captchaRequired}, ok: false as const};
    }

    return result;
  }

  function focusFirstError(errorsToFocus: BookingFieldErrors): void {
    window.requestAnimationFrame(() => {
      if (errorsToFocus.guestName) {
        guestNameRef.current?.focus();
      } else if (errorsToFocus.guestPhone) {
        guestPhoneRef.current?.focus();
      } else if (errorsToFocus.checkIn) {
        checkInRef.current?.focus();
      } else if (errorsToFocus.checkOut) {
        checkOutRef.current?.focus();
      } else if (errorsToFocus.apartment) {
        apartmentRef.current?.focus();
      } else if (errorsToFocus.captcha) {
        captchaInputRef.current?.focus();
      } else {
        formRef.current?.focus();
      }
    });
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
      } else if (field === 'checkIn') {
        nextErrors.checkIn = code === 'past' ? labels.checkInPast : labels.checkInRequired;
      } else if (field === 'checkOut') {
        nextErrors.checkOut = code === 'must_be_after_check_in'
          ? labels.checkOutAfterCheckIn
          : labels.checkOutRequired;
      } else if (field === 'apartmentSlug') {
        nextErrors.apartment = labels.apartmentRequired;
      } else if (field === 'captchaAnswer' || field === 'captchaChallengeId') {
        nextErrors.captcha = code === 'required' ? labels.captchaRequired : labels.captchaInvalid;
      } else {
        nextErrors.server = labels.requestValidationFailed;
      }
    }

    return nextErrors;
  }

  function showCustomAlert(message: string, error: boolean): void {
    for (const timer of alertTimersRef.current) {
      window.clearTimeout(timer);
    }
    alertTimersRef.current = [];

    const id = ++alertSequenceRef.current;
    setAlert({error, id, message, visible: false});

    alertTimersRef.current.push(window.setTimeout(() => {
      if (alertSequenceRef.current === id) {
        setAlert((current) => current?.id === id ? {...current, visible: true} : current);
      }
    }, 10));
    alertTimersRef.current.push(window.setTimeout(() => {
      if (alertSequenceRef.current === id) {
        setAlert((current) => current?.id === id ? {...current, visible: false} : current);
      }
    }, 3500));
    alertTimersRef.current.push(window.setTimeout(() => {
      if (alertSequenceRef.current === id) {
        setAlert((current) => current?.id === id ? null : current);
      }
    }, 3800));
  }

  function resetForm(): void {
    setGuestName('');
    setGuestPhone('');
    setCheckIn(null);
    setCheckOut(null);
    setSelectedApartmentSlug(null);
    setCaptchaAnswer('');
    setTouched(initialTouched);
    setSubmitAttempted(false);
    setErrors({});
    setServerErrors({});
    setWebsite('');
    setSendStatus('idle');
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault();
    setSubmitAttempted(true);

    const validation = getCurrentValidation();

    if (!validation.ok) {
      setServerErrors({});
      setSendStatus('idle');
      setErrors(validation.errors);
      focusFirstError(validation.errors);
      return;
    }

    const challengeId = captchaChallengeId;

    if (challengeId === null) {
      const captchaValidationError = {captcha: labels.captchaRequired};
      setErrors(captchaValidationError);
      setSendStatus('idle');
      focusFirstError(captchaValidationError);
      return;
    }

    abortControllerRef.current?.abort();
    const controller = new AbortController();
    const version = ++submissionVersionRef.current;
    abortControllerRef.current = controller;
    setErrors({});
    setServerErrors({});
    setSendStatus('sending');

    const result = await submitBookingRequest({
      ...validation.draft,
      captchaAnswer,
      captchaChallengeId: challengeId,
      website
    }, controller.signal);

    if (version !== submissionVersionRef.current || controller.signal.aborted) {
      return;
    }

    abortControllerRef.current = null;

    if (result.ok) {
      resetForm();
      setCaptchaReloadToken((current) => current + 1);
      showCustomAlert(labels.successMessage, false);
      return;
    }

    if (result.failure.kind === 'aborted') {
      return;
    }

    setSendStatus('idle');

    if (result.failure.kind === 'server' && result.failure.code === 'VALIDATION_FAILED') {
      const fieldErrors = getServerFieldErrors(result.failure.fields);
      setServerErrors(fieldErrors);
      focusFirstError(fieldErrors);
    } else if (result.failure.kind === 'server' && (
      result.failure.code === 'CAPTCHA_INVALID' || result.failure.code === 'CAPTCHA_REQUIRED'
    )) {
      const captchaError = result.failure.code === 'CAPTCHA_REQUIRED'
        ? labels.captchaRequired
        : labels.captchaInvalid;
      setServerErrors({captcha: captchaError});
      focusFirstError({captcha: captchaError});
    }

    showCustomAlert(getBookingClientErrorMessage(result.failure, labels), true);
  }

  const guestNameError = (submitAttempted || touched.guestName)
    ? errors.guestName ?? serverErrors.guestName
    : undefined;
  const guestPhoneError = (submitAttempted || touched.guestPhone)
    ? errors.guestPhone ?? serverErrors.guestPhone
    : undefined;
  const checkInError = (submitAttempted || touched.checkIn)
    ? errors.checkIn ?? serverErrors.checkIn
    : undefined;
  const checkOutError = (submitAttempted || touched.checkOut)
    ? errors.checkOut ?? serverErrors.checkOut
    : undefined;
  const apartmentError = (submitAttempted || touched.apartment)
    ? errors.apartment ?? serverErrors.apartment
    : undefined;
  const captchaError = (submitAttempted || touched.captcha)
    ? errors.captcha ?? serverErrors.captcha
    : undefined;

  return (
    <>
      <div className={styles.formContainer}>
        <h1 className={styles.formTitle}>{labels.title}</h1>
        <p className={styles.formText}>{labels.description}</p>
        <form
          noValidate
          onSubmit={handleSubmit}
          ref={formRef}
          tabIndex={-1}
        >
          <input name="form_type" type="hidden" value="home" />
          <input
            aria-hidden="true"
            autoComplete="off"
            className={styles.honeypot}
            id="booking-website"
            name="website"
            onChange={(event) => setWebsite(event.target.value)}
            tabIndex={-1}
            type="text"
            value={website}
          />

          <div className={styles.formGrid}>
            <div className={styles.formCol}>
              <h3 className={styles.formSubtitle}>{labels.contactTitle}</h3>
              <div className={styles.field}>
                <label htmlFor="fio">{labels.guestNameLabel}</label>
                <input
                  aria-describedby={guestNameError ? 'fioError' : undefined}
                  aria-invalid={guestNameError !== undefined}
                  autoComplete="name"
                  id="fio"
                  name="guest_name_visible"
                  onBlur={() => handleBlur('guestName')}
                  onChange={handleNameChange}
                  placeholder={labels.guestNamePlaceholder}
                  ref={guestNameRef}
                  required
                  type="text"
                  value={guestName}
                />
                <div className={styles.error} id="fioError" role={guestNameError ? 'alert' : undefined}>
                  {guestNameError ?? ''}
                </div>
              </div>
              <div className={styles.field}>
                <label htmlFor="phone">{labels.guestPhoneLabel}</label>
                <input
                  aria-describedby={guestPhoneError ? 'phoneError' : undefined}
                  aria-invalid={guestPhoneError !== undefined}
                  autoComplete="tel"
                  id="phone"
                  inputMode="tel"
                  name="guest_phone_visible"
                  onBlur={() => handleBlur('guestPhone')}
                  onChange={handlePhoneChange}
                  placeholder={labels.guestPhonePlaceholder}
                  ref={guestPhoneRef}
                  required
                  type="tel"
                  value={guestPhone}
                />
                <div className={styles.error} id="phoneError" role={guestPhoneError ? 'alert' : undefined}>
                  {guestPhoneError ?? ''}
                </div>
              </div>
            </div>

            <div className={styles.formCol}>
              <h3 className={styles.formSubtitle}>{labels.bookingDetailsTitle}</h3>
              <div className={styles.formDates}>
                <div className={styles.formDate}>
                  <label htmlFor="dateIn">{labels.checkInLabel}</label>
                  <input
                    aria-describedby={checkInError ? 'dateInError' : undefined}
                    aria-invalid={checkInError !== undefined}
                    id="dateIn"
                    min={todayIso ?? undefined}
                    name="check_in_date"
                    onBlur={() => handleBlur('checkIn')}
                    onChange={handleCheckInChange}
                    ref={checkInRef}
                    required
                    type="date"
                    value={checkIn ?? ''}
                  />
                  <div className={styles.error} id="dateInError" role={checkInError ? 'alert' : undefined}>
                    {checkInError ?? ''}
                  </div>
                </div>
                <div className={styles.formDate}>
                  <label htmlFor="dateOut">{labels.checkOutLabel}</label>
                  <input
                    aria-describedby={checkOutError ? 'dateOutError' : undefined}
                    aria-invalid={checkOutError !== undefined}
                    id="dateOut"
                    min={checkOutMin}
                    name="check_out_date"
                    onBlur={() => handleBlur('checkOut')}
                    onChange={handleCheckOutChange}
                    ref={checkOutRef}
                    required
                    type="date"
                    value={checkOut ?? ''}
                  />
                  <div className={styles.error} id="dateOutError" role={checkOutError ? 'alert' : undefined}>
                    {checkOutError ?? ''}
                  </div>
                </div>
              </div>

              <div className={styles.field}>
                <label htmlFor="address">{labels.apartmentLabel}</label>
                <select
                  aria-describedby={apartmentError ? 'addressError' : undefined}
                  aria-invalid={apartmentError !== undefined}
                  className={styles.formSelect}
                  id="address"
                  name="room_address"
                  onBlur={() => handleBlur('apartment')}
                  onChange={handleApartmentChange}
                  ref={apartmentRef}
                  required
                  value={selectedApartmentSlug ?? ''}
                >
                  <option disabled value="">{labels.apartmentPlaceholder}</option>
                  {apartments.map((apartment) => (
                    <option key={apartment.slug} value={apartment.slug}>
                      {apartment.label}
                    </option>
                  ))}
                </select>
                <div className={styles.error} id="addressError" role={apartmentError ? 'alert' : undefined}>
                  {apartmentError ?? ''}
                </div>
              </div>
            </div>
          </div>

          <BookingCaptcha
            alt={labels.captchaAlt}
            error={captchaError}
            errorClassName={styles.error}
            errorId="captchaHomeError"
            inputClassName={styles.formInput}
            inputId="captchaHomeInput"
            inputRef={captchaInputRef}
            label={labels.captchaLabel}
            loadErrorLabel={labels.captchaLoadFailed}
            onBlur={() => handleBlur('captcha')}
            onChallengeChange={handleCaptchaChallengeChange}
            onChange={handleCaptchaChange}
            placeholder={labels.captchaPlaceholder}
            reloadToken={captchaReloadToken}
            refreshLabel={labels.captchaRefresh}
            rowClassName={styles.captchaRow}
            value={captchaAnswer}
          />

          <button
            aria-busy={sendStatus === 'sending'}
            className={styles.submitButton}
            disabled={sendStatus === 'sending'}
            type="submit"
          >
            {labels.sendRequest}
          </button>
        </form>
      </div>
      {alert !== null && typeof document !== 'undefined'
        ? createPortal(
            <div
              aria-live={alert.error ? 'assertive' : 'polite'}
              className={[styles.customAlert, alert.error ? styles.error : '', alert.visible ? styles.show : '']
                .filter(Boolean)
                .join(' ')}
              role={alert.error ? 'alert' : 'status'}
            >
              {alert.message}
            </div>,
            document.body
          )
        : null}
    </>
  );
}
