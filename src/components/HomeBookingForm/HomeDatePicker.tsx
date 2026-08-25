import type {KeyboardEvent as ReactKeyboardEvent, RefObject} from 'react';
import {useCallback, useEffect, useRef, useState} from 'react';
import {FiCalendar, FiChevronLeft, FiChevronRight} from 'react-icons/fi';

import {
  addCalendarDays,
  compareCalendarDates,
  createIsoDate,
  getCalendarMonth,
  getDaysInMonth,
  getMonthFirstWeekday,
  isDateInMonth,
  getMoscowTodayIso,
  shiftMonth,
  type CalendarMonth
} from '@/lib/reservation/calendar';
import type {HomeBookingLabels} from '@/types/booking';
import type {Locale} from '@/types/locale';
import type {IsoDate} from '@/types/reservation';

import {
  formatHomeAccessibleDate,
  formatHomeDate,
  formatHomeMonth,
  formatHomeWeekday
} from './home-date';
import styles from './HomeBookingForm.module.css';

type HomeDatePickerLabels = Pick<
  HomeBookingLabels,
  'calendarLabel' | 'clearDate' | 'nextMonth' | 'previousMonth' | 'today'
>;

type HomeDatePickerProps = {
  readonly ariaDescribedBy?: string;
  readonly id: string;
  readonly inputRef: RefObject<HTMLButtonElement | null>;
  readonly label: string;
  readonly labels: HomeDatePickerLabels;
  readonly locale: Locale;
  readonly max?: IsoDate;
  readonly min?: IsoDate;
  readonly name: string;
  readonly onBlur: () => void;
  readonly onChange: (value: IsoDate | null) => void;
  readonly onClose: () => void;
  readonly onOpen: () => void;
  readonly placeholder: string;
  readonly todayIso: IsoDate | null;
  readonly value: IsoDate | null;
  readonly isOpen: boolean;
};

function getPickerId(id: string): string {
  return `home-date-picker-${id}`;
}

function getMonthDates(month: CalendarMonth): IsoDate[] {
  return Array.from({length: getDaysInMonth(month)}, (_, index) =>
    createIsoDate(month.year, month.month, index + 1)
  );
}

export function HomeDatePicker({
  ariaDescribedBy,
  id,
  inputRef,
  isOpen,
  label,
  labels,
  locale,
  max,
  min,
  name,
  onBlur,
  onChange,
  onClose,
  onOpen,
  placeholder,
  todayIso,
  value
}: HomeDatePickerProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const dayButtonRefs = useRef<Record<string, HTMLButtonElement | null>>({});
  const [displayedMonth, setDisplayedMonth] = useState<CalendarMonth | null>(null);
  const [focusedDate, setFocusedDate] = useState<IsoDate | null>(null);
  const minimumDate = min ?? todayIso ?? undefined;
  const pickerId = getPickerId(id);
  const month = displayedMonth ?? getCalendarMonth(value ?? todayIso ?? getMoscowTodayIso());
  const monthDates = getMonthDates(month);
  const focusableDate = monthDates.find((date) => {
    const disabled = minimumDate !== undefined && compareCalendarDates(date, minimumDate) < 0;
    return !disabled && (focusedDate === null || date === focusedDate);
  }) ?? monthDates.find((date) => {
    const disabled = minimumDate !== undefined && compareCalendarDates(date, minimumDate) < 0;
    return !disabled;
  });

  function isDateDisabled(date: IsoDate): boolean {
    return (
      (minimumDate !== undefined && compareCalendarDates(date, minimumDate) < 0) ||
      (max !== undefined && compareCalendarDates(date, max) > 0)
    );
  }

  const focusTrigger = useCallback((): void => {
    window.requestAnimationFrame(() => inputRef.current?.focus());
  }, [inputRef]);

  const closePicker = useCallback((restoreFocus: boolean): void => {
    onClose();

    if (restoreFocus) {
      focusTrigger();
    }
  }, [focusTrigger, onClose]);

  function openPicker(): void {
    const anchor = value ?? todayIso ?? getMoscowTodayIso();
    setDisplayedMonth(getCalendarMonth(anchor));
    setFocusedDate(anchor);
    onOpen();
  }

  function togglePicker(): void {
    if (isOpen) {
      closePicker(true);
      return;
    }

    openPicker();
  }

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    function handlePointerDown(event: PointerEvent): void {
      if (event.target instanceof Node && !rootRef.current?.contains(event.target)) {
        closePicker(false);
      }
    }

    function handleKeyDown(event: globalThis.KeyboardEvent): void {
      if (event.key === 'Escape') {
        event.preventDefault();
        closePicker(true);
      }
    }

    document.addEventListener('pointerdown', handlePointerDown);
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('pointerdown', handlePointerDown);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [closePicker, isOpen]);

  function selectDate(date: IsoDate): void {
    if (isDateDisabled(date)) {
      return;
    }

    onChange(date);
    closePicker(true);
  }

  function clearDate(): void {
    onChange(null);
    closePicker(true);
  }

  function selectToday(): void {
    if (todayIso === null || isDateDisabled(todayIso)) {
      return;
    }

    onChange(todayIso);
    closePicker(true);
  }

  function moveMonth(offset: number): void {
    setDisplayedMonth((current) => shiftMonth(current ?? month, offset));
  }

  function moveFocus(date: IsoDate, offset: number): void {
    const candidate = addCalendarDays(date, offset);
    const nextDate = minimumDate !== undefined && compareCalendarDates(candidate, minimumDate) < 0
      ? minimumDate
      : candidate;

    setFocusedDate(nextDate);

    if (!isDateInMonth(nextDate, month)) {
      setDisplayedMonth(getCalendarMonth(nextDate));
    }

    window.requestAnimationFrame(() => dayButtonRefs.current[nextDate]?.focus());
  }

  function handleDayKeyDown(
    event: ReactKeyboardEvent<HTMLButtonElement>,
    date: IsoDate
  ): void {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      selectDate(date);
      return;
    }

    const offsets: Record<string, number> = {
      ArrowDown: 7,
      ArrowLeft: -1,
      ArrowRight: 1,
      ArrowUp: -7
    };
    const offset = offsets[event.key];

    if (offset === undefined) {
      return;
    }

    event.preventDefault();
    moveFocus(date, offset);
  }

  function handleTriggerKeyDown(event: ReactKeyboardEvent<HTMLButtonElement>): void {
    if (event.key === 'Escape' && isOpen) {
      event.preventDefault();
      closePicker(true);
    }
  }

  return (
    <div className={styles.localizedDateInput} ref={rootRef}>
      <button
        aria-controls={isOpen ? pickerId : undefined}
        aria-describedby={ariaDescribedBy}
        aria-expanded={isOpen}
        aria-haspopup="dialog"
        aria-label={label}
        className={styles.dateInput}
        id={id}
        onBlur={onBlur}
        onClick={togglePicker}
        onKeyDown={handleTriggerKeyDown}
        ref={inputRef}
        type="button"
      >
        <span className={styles.dateInputValue}>
          {value === null ? placeholder : formatHomeDate(value, locale)}
        </span>
        <FiCalendar aria-hidden="true" className={styles.dateInputIcon} focusable="false" />
      </button>
      <input aria-hidden="true" name={name} type="hidden" value={value ?? ''} />

      {isOpen ? (
        <div
          aria-label={labels.calendarLabel}
          className={styles.datePickerPopup}
          id={pickerId}
          role="dialog"
        >
          <div className={styles.datePickerNav}>
            <button
              aria-label={labels.previousMonth}
              className={styles.datePickerNavButton}
              onClick={() => moveMonth(-1)}
              type="button"
            >
              <FiChevronLeft aria-hidden="true" focusable="false" />
            </button>
            <h3 className={styles.datePickerMonthTitle}>{formatHomeMonth(month, locale)}</h3>
            <button
              aria-label={labels.nextMonth}
              className={styles.datePickerNavButton}
              onClick={() => moveMonth(1)}
              type="button"
            >
              <FiChevronRight aria-hidden="true" focusable="false" />
            </button>
          </div>

          <div aria-label={labels.calendarLabel} className={styles.datePickerGrid} role="grid">
            {Array.from({length: 7}, (_, index) => (
              <div className={styles.datePickerWeekday} key={`weekday-${index}`} role="columnheader">
                {formatHomeWeekday(index, locale)}
              </div>
            ))}
            {Array.from({length: getMonthFirstWeekday(month)}, (_, index) => (
              <span aria-hidden="true" className={styles.datePickerEmptyDay} key={`empty-${index}`} />
            ))}
            {monthDates.map((date) => {
              const isDisabled = isDateDisabled(date);
              const isSelected = value === date;
              const isToday = todayIso === date;
              const dateLabel = formatHomeAccessibleDate(date, locale);

              return (
                <div
                  aria-selected={isSelected}
                  className={styles.datePickerDayCell}
                  key={date}
                  role="gridcell"
                >
                  <button
                    aria-current={isToday ? 'date' : undefined}
                    aria-label={isToday ? `${dateLabel}, ${labels.today}` : dateLabel}
                    className={[
                      styles.datePickerDay,
                      isSelected ? styles.datePickerSelectedDay : '',
                      isToday ? styles.datePickerToday : ''
                    ].filter(Boolean).join(' ')}
                    disabled={isDisabled}
                    onClick={() => selectDate(date)}
                    onFocus={() => setFocusedDate(date)}
                    onKeyDown={(event) => handleDayKeyDown(event, date)}
                    ref={(element) => {
                      dayButtonRefs.current[date] = element;
                    }}
                    tabIndex={date === focusableDate ? 0 : -1}
                    type="button"
                  >
                    {Number(date.slice(-2))}
                  </button>
                </div>
              );
            })}
          </div>

          <div className={styles.datePickerActions}>
            <button
              className={styles.datePickerAction}
              disabled={value === null}
              onClick={clearDate}
              type="button"
            >
              {labels.clearDate}
            </button>
            <button
              className={styles.datePickerAction}
              disabled={todayIso === null || isDateDisabled(todayIso)}
              onClick={selectToday}
              type="button"
            >
              {labels.today}
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
