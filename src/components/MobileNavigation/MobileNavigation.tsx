'use client';

import type {MouseEvent, ReactNode} from 'react';
import {useEffect, useId, useRef, useState} from 'react';

import styles from './MobileNavigation.module.css';

type MobileNavigationProps = {
  children: ReactNode;
  closeLabel: string;
  dialogLabel: string;
  menuLabel: string;
  overlayLabel: string;
};

const focusableSelector = [
  'a[href]',
  'button:not([disabled])',
  'input:not([disabled])',
  'select:not([disabled])',
  'textarea:not([disabled])',
  '[tabindex]:not([tabindex="-1"])'
].join(', ');

export function MobileNavigation({
  children,
  closeLabel,
  dialogLabel,
  menuLabel,
  overlayLabel
}: MobileNavigationProps) {
  const [isOpen, setIsOpen] = useState(false);
  const drawerId = useId();
  const burgerRef = useRef<HTMLButtonElement>(null);
  const drawerRef = useRef<HTMLDivElement>(null);
  const wasOpenRef = useRef(false);

  function handleDrawerRef(element: HTMLDivElement | null): void {
    drawerRef.current = element;

    if (element !== null && isOpen) {
      const firstFocusable = element.querySelector<HTMLElement>(focusableSelector);
      (firstFocusable ?? element).focus();
    }
  }

  useEffect(() => {
    document.body.classList.toggle('lock', isOpen);

    if (!isOpen) {
      if (wasOpenRef.current) {
        wasOpenRef.current = false;
        burgerRef.current?.focus();
      }

      return undefined;
    }

    wasOpenRef.current = true;

    const focusTimeout = window.setTimeout(() => {
      const firstFocusable = drawerRef.current?.querySelector<HTMLElement>(focusableSelector);
      (firstFocusable ?? drawerRef.current)?.focus();
    }, 50);

    const handleDrawerKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        setIsOpen(false);
        return;
      }

      if (event.key !== 'Tab') {
        return;
      }

      const focusableElements = drawerRef.current
        ? Array.from(drawerRef.current.querySelectorAll<HTMLElement>(focusableSelector))
        : [];

      if (focusableElements.length === 0) {
        event.preventDefault();
        drawerRef.current?.focus();
        return;
      }

      if (!drawerRef.current?.contains(document.activeElement)) {
        event.preventDefault();
        (event.shiftKey ? focusableElements.at(-1) : focusableElements[0])?.focus();
        return;
      }

      const firstFocusable = focusableElements[0];
      const lastFocusable = focusableElements[focusableElements.length - 1];

      if (event.shiftKey && document.activeElement === firstFocusable) {
        event.preventDefault();
        lastFocusable.focus();
      } else if (!event.shiftKey && document.activeElement === lastFocusable) {
        event.preventDefault();
        firstFocusable.focus();
      }
    };

    document.addEventListener('keydown', handleDrawerKeyDown);

    return () => {
      window.clearTimeout(focusTimeout);
      document.removeEventListener('keydown', handleDrawerKeyDown);
      document.body.classList.remove('lock');
    };
  }, [isOpen]);

  useEffect(() => {
    return () => document.body.classList.remove('lock');
  }, []);

  const closeAfterNavigation = (event: MouseEvent<HTMLDivElement>) => {
    const target = event.target;
    const link = target instanceof HTMLElement ? target.closest('a') : null;

    if (link?.getAttribute('href')?.startsWith('/')) {
      setIsOpen(false);
    }
  };

  return (
    <div className={styles.mobileNavigation}>
      <button
        aria-controls={drawerId}
        aria-expanded={isOpen}
        aria-label={isOpen ? closeLabel : menuLabel}
        className={[styles.burger, isOpen ? styles.burgerActive : ''].join(' ')}
        onClick={() => setIsOpen((open) => !open)}
        ref={burgerRef}
        type="button"
      >
        {isOpen ? (
          <svg
            aria-hidden="true"
            focusable="false"
            height="19"
            viewBox="0 0 20 19"
            width="20"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M1 1L17.5858 17.5858M18.1716 1L1.58579 17.5858"
              fill="none"
              stroke="#191919"
              strokeLinecap="round"
              strokeWidth="2"
            />
          </svg>
        ) : (
          <svg
            aria-hidden="true"
            focusable="false"
            height="14"
            viewBox="0 0 25 14"
            width="25"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M1 1H24M1 7H19M1 13H24"
              fill="none"
              stroke="#191919"
              strokeLinecap="round"
              strokeWidth="2"
            />
          </svg>
        )}
      </button>

      <div
        aria-hidden={!isOpen}
        aria-label={dialogLabel}
        aria-modal={isOpen ? true : undefined}
        className={[styles.drawer, isOpen ? styles.drawerOpen : ''].join(' ')}
        id={drawerId}
        inert={!isOpen}
        onClick={closeAfterNavigation}
        ref={handleDrawerRef}
        role="dialog"
        tabIndex={-1}
      >
        {children}
      </div>

      <button
        aria-label={overlayLabel}
        className={[styles.overlay, isOpen ? styles.overlayOpen : ''].join(' ')}
        onClick={() => setIsOpen(false)}
        type="button"
      />
    </div>
  );
}
