'use client';

import type {ChangeEvent, FocusEvent, RefObject} from 'react';
import {useEffect, useRef, useState} from 'react';

type BookingCaptchaProps = {
  readonly alt: string;
  readonly error?: string;
  readonly errorClassName: string;
  readonly errorId: string;
  readonly imageId?: string;
  readonly inputId: string;
  readonly inputClassName: string;
  readonly inputRef: RefObject<HTMLInputElement | null>;
  readonly label: string;
  readonly loadErrorLabel: string;
  readonly onBlur: (event: FocusEvent<HTMLInputElement>) => void;
  readonly onChallengeChange: (challengeId: string | null) => void;
  readonly onChange: (event: ChangeEvent<HTMLInputElement>) => void;
  readonly onRefresh?: () => void;
  readonly placeholder: string;
  readonly reloadToken: number;
  readonly refreshLabel: string;
  readonly refreshButtonId?: string;
  readonly rowClassName: string;
  readonly value: string;
};

export function BookingCaptcha({
  alt,
  error,
  errorClassName,
  errorId,
  imageId = 'captchaHome',
  inputId,
  inputClassName,
  inputRef,
  label,
  loadErrorLabel,
  onBlur,
  onChallengeChange,
  onChange,
  onRefresh,
  placeholder,
  reloadToken,
  refreshLabel,
  refreshButtonId = 'refreshHomeCaptcha',
  rowClassName,
  value
}: BookingCaptchaProps) {
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [refreshToken, setRefreshToken] = useState(0);
  const [loadError, setLoadError] = useState(false);
  const challengeRef = useRef<string | null>(null);

  useEffect(() => {
    const controller = new AbortController();
    let objectUrl: string | null = null;

    async function loadCaptcha(): Promise<void> {
      setLoadError(false);

      try {
        const previous = challengeRef.current;
        const query = previous === null ? '' : `?previous=${encodeURIComponent(previous)}`;
        const response = await fetch(`/api/captcha${query}`, {
          cache: 'no-store',
          signal: controller.signal
        });

        if (!response.ok) {
          throw new Error('Captcha request failed.');
        }

        const challengeId = response.headers.get('X-Captcha-Challenge');
        const blob = await response.blob();

        if (challengeId === null || blob.size === 0) {
          throw new Error('Captcha response is incomplete.');
        }

        objectUrl = URL.createObjectURL(blob);
        challengeRef.current = challengeId;
        onChallengeChange(challengeId);
        setImageUrl(objectUrl);
      } catch (error) {
        if (error instanceof DOMException && error.name === 'AbortError') {
          return;
        }

        setLoadError(true);
        setImageUrl(null);
        challengeRef.current = null;
        onChallengeChange(null);
      }
    }

    void loadCaptcha();

    return () => {
      controller.abort();

      if (objectUrl !== null) {
        URL.revokeObjectURL(objectUrl);
      }
    };
  }, [onChallengeChange, refreshToken, reloadToken]);

  return (
    <div className={rowClassName}>
      {imageUrl !== null ? (
        // CAPTCHA is a runtime blob URL, so next/image cannot replace this native image.
        // eslint-disable-next-line @next/next/no-img-element -- the API returns a dynamic CAPTCHA blob.
        <img alt={alt} id={imageId} src={imageUrl} />
      ) : null}
      <button
        aria-label={refreshLabel}
        id={refreshButtonId}
        onClick={() => {
          onRefresh?.();
          setRefreshToken((current) => current + 1);
        }}
        type="button"
      >
        ⟳
      </button>
      <input
        aria-describedby={error !== undefined || loadError ? errorId : undefined}
        aria-invalid={error !== undefined}
        aria-label={label}
        autoComplete="off"
        className={inputClassName}
        id={inputId}
        inputMode="text"
        name="captcha"
        onBlur={onBlur}
        onChange={onChange}
        placeholder={placeholder}
        ref={inputRef}
        required
        spellCheck={false}
        type="text"
        value={value}
      />
      <div className={errorClassName} id={errorId} role={error !== undefined || loadError ? 'alert' : undefined}>
        {error ?? (loadError ? loadErrorLabel : '')}
      </div>
    </div>
  );
}
