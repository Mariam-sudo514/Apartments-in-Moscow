'use client';

import type {ChangeEvent, FormEvent} from 'react';
import {useCallback, useEffect, useRef, useState} from 'react';

import {BookingCaptcha} from '@/components/BookingCaptcha';
import {BookingHoneypot} from '@/components/BookingHoneypot';
import {
  getBookingClientErrorMessage,
  submitBookingRequest
} from '@/lib/booking/booking-api-client';
import {validateBooking} from '@/lib/booking';
import {isReservationFormReady} from '@/lib/booking/reservation-form-readiness';
import type {Locale} from '@/types/locale';
import type {IsoDate} from '@/types/reservation';
import type {
  BookingFieldErrors,
  BookingLabels,
  PreferredContactMethod,
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
  readonly captcha: boolean;
  readonly guestEmail: boolean;
  readonly guestName: boolean;
  readonly preferredContactMethod: boolean;
  readonly preferredContactValue: boolean;
};

type SendStatus = 'idle' | 'sending' | 'success' | 'error';

function isPreferredContactMethod(value: string): value is PreferredContactMethod {
  return value === 'email' || value === 'whatsapp' || value === 'telegram';
}

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
  const guestEmailRef = useRef<HTMLInputElement>(null);
  const preferredContactMethodRef = useRef<HTMLSelectElement>(null);
  const preferredContactValueRef = useRef<HTMLInputElement>(null);
  const captchaInputRef = useRef<HTMLInputElement>(null);
  const [guestName, setGuestName] = useState('');
  const [guestEmail, setGuestEmail] = useState('');
  const [preferredContactMethod, setPreferredContactMethod] = useState<PreferredContactMethod | ''>('');
  const [preferredContactValue, setPreferredContactValue] = useState('');
  const [captchaAnswer, setCaptchaAnswer] = useState('');
  const [captchaChallengeId, setCaptchaChallengeId] = useState<string | null>(null);
  const [captchaReloadToken, setCaptchaReloadToken] = useState(0);
  const [touched, setTouched] = useState<TouchedFields>({
    captcha: false,
    guestEmail: false,
    guestName: false,
    preferredContactMethod: false,
    preferredContactValue: false
  });
  const [submitAttempted, setSubmitAttempted] = useState(false);
  const [errors, setErrors] = useState<BookingFieldErrors>({});
  const [serverErrors, setServerErrors] = useState<BookingFieldErrors>({});
  const [sendError, setSendError] = useState<string | null>(null);
  const [sendStatus, setSendStatus] = useState<SendStatus>('idle');
  const [website, setWebsite] = useState('');
  const abortControllerRef = useRef<AbortController | null>(null);
  const submissionVersionRef = useRef(0);

  useEffect(() => () => {
    abortControllerRef.current?.abort();
  }, []);

  const invalidatePendingRequest = useCallback((): void => {
    submissionVersionRef.current += 1;
    abortControllerRef.current?.abort();
    abortControllerRef.current = null;
    setServerErrors({});
    setSendError(null);
    setSendStatus('idle');
  }, []);

  const handleCaptchaChallengeChange = useCallback((challengeId: string | null): void => {
    setCaptchaChallengeId(challengeId);
    setCaptchaAnswer('');
  }, []);

  const handleCaptchaRefresh = useCallback((): void => {
    invalidatePendingRequest();
    setCaptchaChallengeId(null);
    setCaptchaAnswer('');
    setErrors((current) => ({...current, captcha: undefined}));
  }, [invalidatePendingRequest]);

  function clearFieldError(field: 'guestEmail' | 'guestName' | 'preferredContactMethod' | 'preferredContactValue'): void {
    setErrors((current) => ({...current, [field]: undefined}));
    setServerErrors((current) => ({...current, [field]: undefined}));
    invalidatePendingRequest();
  }

  function handleNameChange(event: ChangeEvent<HTMLInputElement>): void {
    setGuestName(event.target.value);
    clearFieldError('guestName');
  }

  function handleEmailChange(event: ChangeEvent<HTMLInputElement>): void {
    setGuestEmail(event.target.value);
    clearFieldError('guestEmail');
  }

  function handlePreferredContactMethodChange(event: ChangeEvent<HTMLSelectElement>): void {
    const nextMethod = isPreferredContactMethod(event.target.value) ? event.target.value : '';

    setPreferredContactMethod(nextMethod);
    setPreferredContactValue('');
    setTouched((current) => ({
      ...current,
      preferredContactMethod: true,
      preferredContactValue: false
    }));
    setErrors((current) => ({
      ...current,
      preferredContactMethod: undefined,
      preferredContactValue: undefined
    }));
    setServerErrors((current) => ({
      ...current,
      preferredContactMethod: undefined,
      preferredContactValue: undefined
    }));
    invalidatePendingRequest();
  }

  function handlePreferredContactValueChange(event: ChangeEvent<HTMLInputElement>): void {
    setPreferredContactValue(event.target.value);
    clearFieldError('preferredContactValue');
  }

  function handleCaptchaChange(event: ChangeEvent<HTMLInputElement>): void {
    setCaptchaAnswer(event.target.value);
    setErrors((current) => ({...current, captcha: undefined}));
    setServerErrors((current) => ({...current, captcha: undefined}));
    invalidatePendingRequest();
  }

  function validateCurrentField(field: 'guestEmail' | 'guestName' | 'preferredContactMethod' | 'preferredContactValue'): void {
    const result = validateBooking({
      adults,
      apartmentSlug,
      checkIn,
      checkOut,
      children: childrenCount,
      guestEmail,
      guestName,
      labels,
      locale,
      preferredContactMethod,
      preferredContactValue,
      source: 'reservation',
      todayIso
    });

    setErrors((current) => ({
      ...current,
      [field]: result.ok ? undefined : result.errors[field]
    }));
  }

  function validateCaptchaField(): void {
    setErrors((current) => ({
      ...current,
      captcha: captchaChallengeId === null || captchaAnswer.trim() === ''
        ? labels.captchaRequired
        : undefined
    }));
  }

  function handleCaptchaBlur(): void {
    setTouched((current) => ({...current, captcha: true}));
    validateCaptchaField();
  }

  function getFormValidation() {
    const result = validateBooking({
      adults,
      apartmentSlug,
      checkIn,
      checkOut,
      children: childrenCount,
      guestEmail,
      guestName,
      labels,
      locale,
      preferredContactMethod,
      preferredContactValue,
      source: 'reservation',
      todayIso
    });

    const captchaError = captchaChallengeId === null || captchaAnswer.trim() === ''
      ? labels.captchaRequired
      : undefined;

    if (!result.ok) {
      return {
        errors: {
          ...result.errors,
          ...(captchaError === undefined ? {} : {captcha: captchaError})
        },
        ok: false as const
      };
    }

    return captchaError === undefined
      ? result
      : {errors: {captcha: captchaError}, ok: false as const};
  }

  function handleBlur(field: 'guestEmail' | 'guestName' | 'preferredContactMethod' | 'preferredContactValue'): void {
    setTouched((current) => ({...current, [field]: true}));
    validateCurrentField(field);
  }

  function focusFirstError(errorsToFocus: BookingFieldErrors): void {
    window.requestAnimationFrame(() => {
      if (errorsToFocus.guestName) {
        guestNameRef.current?.focus();
      } else if (errorsToFocus.guestEmail) {
        guestEmailRef.current?.focus();
      } else if (errorsToFocus.preferredContactMethod) {
        preferredContactMethodRef.current?.focus();
      } else if (errorsToFocus.preferredContactValue) {
        preferredContactValueRef.current?.focus();
      } else if (errorsToFocus.captcha) {
        captchaInputRef.current?.focus();
      } else {
        formRef.current?.focus();
      }
    });
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>): void {
    event.preventDefault();
    setSubmitAttempted(true);

    const result = getFormValidation();

    if (!result.ok) {
      setServerErrors({});
      setSendError(null);
      setSendStatus('idle');
      setErrors(result.errors);
      focusFirstError(result.errors);
      return;
    }

    setErrors({});
    setServerErrors({});
    setSendError(null);
    void handleSendRequest(result.draft);
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
      } else if (field === 'guestEmail') {
        nextErrors.guestEmail = code === 'required'
          ? labels.guestEmailRequired
          : labels.guestEmailFormat;
      } else if (field === 'preferredContactMethod') {
        nextErrors.preferredContactMethod = code === 'required'
          ? labels.preferredContactMethodRequired
          : labels.requestValidationFailed;
      } else if (field === 'preferredContactValue') {
        nextErrors.preferredContactValue = code === 'required'
          ? preferredContactMethod === 'whatsapp'
            ? labels.whatsappNumberRequired
            : labels.telegramUsernameRequired
          : code === 'invalid_format'
            ? preferredContactMethod === 'whatsapp'
              ? labels.whatsappNumberFormat
              : labels.telegramUsernameFormat
            : labels.preferredContactValueFormat;
      } else if (field === 'captchaAnswer' || field === 'captchaChallengeId') {
        nextErrors.captcha = code === 'required'
          ? labels.captchaRequired
          : labels.captchaInvalid;
      } else {
        nextErrors.reservation = labels.requestValidationFailed;
      }
    }

    return nextErrors;
  }

  function resetFormAfterSuccess(): void {
    setGuestName('');
    setGuestEmail('');
    setPreferredContactMethod('');
    setPreferredContactValue('');
    setCaptchaAnswer('');
    setCaptchaChallengeId(null);
    setTouched({
      captcha: false,
      guestEmail: false,
      guestName: false,
      preferredContactMethod: false,
      preferredContactValue: false
    });
    setSubmitAttempted(false);
    setErrors({});
    setServerErrors({});
    setWebsite('');
    setSendError(null);
    setSendStatus('success');
  }

  async function handleSendRequest(draft: ReservationBookingRequestDraft): Promise<void> {
    if (sendStatus === 'sending' || sendStatus === 'success' || abortControllerRef.current !== null) {
      return;
    }

    if (captchaChallengeId === null || captchaAnswer.trim() === '') {
      const captchaError = {captcha: labels.captchaRequired};
      setErrors(captchaError);
      focusFirstError(captchaError);
      return;
    }

    const controller = new AbortController();
    const version = ++submissionVersionRef.current;
    abortControllerRef.current = controller;
    setSendStatus('sending');
    setSendError(null);
    setServerErrors({});

    const result = await submitBookingRequest({
      ...draft,
      captchaAnswer,
      captchaChallengeId,
      website
    }, controller.signal);

    if (version !== submissionVersionRef.current || controller.signal.aborted) {
      return;
    }

    abortControllerRef.current = null;

    if (result.ok) {
      resetFormAfterSuccess();
      setCaptchaReloadToken((current) => current + 1);
      return;
    }

    if (result.failure.kind === 'aborted') {
      return;
    }

    setSendStatus('error');
    setSendError(getBookingClientErrorMessage(result.failure, labels));

    if (result.failure.kind === 'server' && result.failure.code === 'VALIDATION_FAILED') {
      setServerErrors(getServerFieldErrors(result.failure.fields));
    } else if (result.failure.kind === 'server' && (
      result.failure.code === 'CAPTCHA_EXPIRED' ||
      result.failure.code === 'CAPTCHA_INVALID' ||
      result.failure.code === 'CAPTCHA_REQUIRED'
    )) {
      const captchaError = result.failure.code === 'CAPTCHA_REQUIRED'
        ? labels.captchaRequired
        : result.failure.code === 'CAPTCHA_EXPIRED'
          ? labels.captchaExpired
          : labels.captchaInvalid;
      setCaptchaChallengeId(null);
      setCaptchaAnswer('');
      setCaptchaReloadToken((current) => current + 1);
      setServerErrors({captcha: captchaError});
      focusFirstError({captcha: captchaError});
    }
  }

  const isFormReady = isReservationFormReady({
    adults,
    apartmentSlug,
    captchaAnswer,
    captchaChallengeId,
    checkIn,
    checkOut,
    children: childrenCount,
    guestEmail,
    guestName,
    labels,
    locale,
    preferredContactMethod,
    preferredContactValue,
    reservationReady,
    source: 'reservation',
    todayIso
  });
  const isSubmitting = sendStatus === 'sending';
  const guestNameError = (submitAttempted || touched.guestName) ? errors.guestName ?? serverErrors.guestName : undefined;
  const guestEmailError = (submitAttempted || touched.guestEmail) ? errors.guestEmail ?? serverErrors.guestEmail : undefined;
  const preferredContactMethodError = (submitAttempted || touched.preferredContactMethod)
    ? errors.preferredContactMethod ?? serverErrors.preferredContactMethod
    : undefined;
  const preferredContactValueError = (submitAttempted || touched.preferredContactValue)
    ? errors.preferredContactValue ?? serverErrors.preferredContactValue
    : undefined;
  const captchaError = (submitAttempted || touched.captcha) ? errors.captcha ?? serverErrors.captcha : undefined;
  const errorItems = [
    {error: guestNameError, id: 'reservation-guest-name', label: labels.guestNameLabel},
    {error: guestEmailError, id: 'reservation-guest-email', label: labels.guestEmailLabel},
    {error: preferredContactMethodError, id: 'reservation-preferred-contact-method', label: labels.preferredContactMethodLabel},
    {error: preferredContactValueError, id: 'reservation-preferred-contact-value', label: preferredContactMethod === 'whatsapp' ? labels.whatsappNumberLabel : labels.telegramUsernameLabel},
    {error: captchaError, id: 'reservation-captcha-input', label: labels.captchaLabel},
    {error: submitAttempted ? errors.reservation ?? serverErrors.reservation : undefined, id: 'reservation-booking-form', label: labels.title}
  ].filter((item): item is {error: string; id: string; label: string} => Boolean(item.error));
  const inputClassName = styles.input;

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
                      if (item.id === 'reservation-guest-email') guestEmailRef.current?.focus();
                      if (item.id === 'reservation-preferred-contact-method') preferredContactMethodRef.current?.focus();
                      if (item.id === 'reservation-preferred-contact-value') preferredContactValueRef.current?.focus();
                      if (item.id === 'reservation-captcha-input') captchaInputRef.current?.focus();
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

        <div className={styles.fieldGroup}>
          <label className={styles.label} htmlFor="reservation-guest-name">
            {labels.guestNameLabel}
          </label>
          <input
            aria-describedby={guestNameError ? 'reservation-guest-name-error' : undefined}
            aria-invalid={guestNameError !== undefined}
            autoComplete="name"
            className={guestNameError ? [inputClassName, styles.invalidInput].join(' ') : inputClassName}
            id="reservation-guest-name"
            maxLength={100}
            name="guestName"
            onBlur={() => handleBlur('guestName')}
            onChange={handleNameChange}
            placeholder={labels.guestNamePlaceholder}
            ref={guestNameRef}
            required
            type="text"
            value={guestName}
          />
          {guestNameError ? <p className={styles.fieldError} id="reservation-guest-name-error" role="alert">{guestNameError}</p> : null}
        </div>

        <div className={styles.fieldGroup}>
          <label className={styles.label} htmlFor="reservation-guest-email">
            {labels.guestEmailLabel}
          </label>
          <input
            aria-describedby={guestEmailError ? 'reservation-guest-email-error' : undefined}
            aria-invalid={guestEmailError !== undefined}
            autoComplete="email"
            className={guestEmailError ? [inputClassName, styles.invalidInput].join(' ') : inputClassName}
            id="reservation-guest-email"
            maxLength={254}
            name="guestEmail"
            onBlur={() => handleBlur('guestEmail')}
            onChange={handleEmailChange}
            placeholder={labels.guestEmailPlaceholder}
            ref={guestEmailRef}
            required
            type="email"
            value={guestEmail}
          />
          {guestEmailError ? <p className={styles.fieldError} id="reservation-guest-email-error" role="alert">{guestEmailError}</p> : null}
        </div>

        <div className={styles.fieldGroup}>
          <label className={styles.label} htmlFor="reservation-preferred-contact-method">
            {labels.preferredContactMethodLabel}
          </label>
          <select
            aria-describedby={preferredContactMethodError ? 'reservation-preferred-contact-method-error' : undefined}
            aria-invalid={preferredContactMethodError !== undefined}
            className={[inputClassName, styles.formSelect, preferredContactMethodError ? styles.invalidInput : ''].join(' ')}
            id="reservation-preferred-contact-method"
            name="preferredContactMethod"
            onBlur={() => handleBlur('preferredContactMethod')}
            onChange={handlePreferredContactMethodChange}
            ref={preferredContactMethodRef}
            required
            value={preferredContactMethod}
          >
            <option disabled value="">{labels.preferredContactMethodPlaceholder}</option>
            <option value="email">{labels.emailOption}</option>
            <option value="whatsapp">{labels.whatsappOption}</option>
            <option value="telegram">{labels.telegramOption}</option>
          </select>
          {preferredContactMethodError ? <p className={styles.fieldError} id="reservation-preferred-contact-method-error" role="alert">{preferredContactMethodError}</p> : null}
        </div>

        {preferredContactMethod === 'whatsapp' || preferredContactMethod === 'telegram' ? (
          <div className={styles.fieldGroup}>
            <label className={styles.label} htmlFor="reservation-preferred-contact-value">
              {preferredContactMethod === 'whatsapp' ? labels.whatsappNumberLabel : labels.telegramUsernameLabel}
            </label>
            <input
              aria-describedby={preferredContactValueError ? 'reservation-preferred-contact-value-error' : undefined}
              aria-invalid={preferredContactValueError !== undefined}
              autoComplete={preferredContactMethod === 'whatsapp' ? 'tel' : 'off'}
              className={preferredContactValueError ? [inputClassName, styles.invalidInput].join(' ') : inputClassName}
              id="reservation-preferred-contact-value"
              inputMode={preferredContactMethod === 'whatsapp' ? 'tel' : 'text'}
              maxLength={32}
              name="preferredContactValue"
              onBlur={() => handleBlur('preferredContactValue')}
              onChange={handlePreferredContactValueChange}
              placeholder={preferredContactMethod === 'whatsapp' ? labels.whatsappNumberPlaceholder : labels.telegramUsernamePlaceholder}
              ref={preferredContactValueRef}
              required
              type="text"
              value={preferredContactValue}
            />
            {preferredContactValueError ? <p className={styles.fieldError} id="reservation-preferred-contact-value-error" role="alert">{preferredContactValueError}</p> : null}
          </div>
        ) : null}

        <BookingCaptcha
          alt={labels.captchaAlt}
          error={captchaError}
          errorClassName={styles.captchaError}
          errorId="reservation-captcha-error"
          imageId="captchaReservation"
          inputClassName={styles.captchaInput}
          inputId="reservation-captcha-input"
          inputRef={captchaInputRef}
          label={labels.captchaLabel}
          loadErrorLabel={labels.captchaLoadFailed}
          onBlur={handleCaptchaBlur}
          onChallengeChange={handleCaptchaChallengeChange}
          onChange={handleCaptchaChange}
          onRefresh={handleCaptchaRefresh}
          placeholder={labels.captchaPlaceholder}
          reloadToken={captchaReloadToken}
          refreshButtonId="refreshReservationCaptcha"
          refreshLabel={labels.captchaRefresh}
          rowClassName={styles.captchaRow}
          value={captchaAnswer}
        />

        <button
          aria-busy={isSubmitting}
          className={styles.submitButton}
          disabled={!isFormReady || isSubmitting}
          type="submit"
        >
          {isSubmitting
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
        {sendStatus === 'success' ? (
          <p aria-live="polite" className={styles.successMessage} role="status">
            {labels.successMessage}
          </p>
        ) : null}
        <BookingHoneypot value={website} onChange={(event) => setWebsite(event.target.value)} />
      </form>
    </section>
  );
}
