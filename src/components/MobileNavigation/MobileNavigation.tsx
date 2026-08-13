'use client';

import type {MouseEvent, ReactNode} from 'react';
import {useEffect, useId, useState} from 'react';
import {FaBars, FaTimes} from 'react-icons/fa';

import styles from './MobileNavigation.module.css';

type MobileNavigationProps = {
  children: ReactNode;
  closeLabel: string;
  menuLabel: string;
  overlayLabel: string;
};

export function MobileNavigation({
  children,
  closeLabel,
  menuLabel,
  overlayLabel
}: MobileNavigationProps) {
  const [isOpen, setIsOpen] = useState(false);
  const drawerId = useId();

  useEffect(() => {
    document.body.classList.toggle('lock', isOpen);

    if (!isOpen) {
      return undefined;
    }

    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsOpen(false);
      }
    };

    window.addEventListener('keydown', closeOnEscape);

    return () => {
      window.removeEventListener('keydown', closeOnEscape);
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
        type="button"
      >
        {isOpen ? (
          <FaTimes aria-hidden="true" focusable="false" />
        ) : (
          <FaBars aria-hidden="true" focusable="false" />
        )}
      </button>

      <div
        aria-hidden={!isOpen}
        className={[styles.drawer, isOpen ? styles.drawerOpen : ''].join(' ')}
        id={drawerId}
        onClick={closeAfterNavigation}
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
