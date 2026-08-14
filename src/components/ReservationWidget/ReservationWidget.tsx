'use client';

import type {ReactNode, KeyboardEvent as ReactKeyboardEvent} from 'react';
import {useEffect, useMemo, useRef, useState} from 'react';
import {
  FiCalendar,
  FiChevronDown,
  FiChevronLeft,
  FiChevronRight,
  FiMinus,
  FiPlus
} from 'react-icons/fi';

import {
  addCalendarDays,
  compareCalendarDates,
  formatCalendarDate,
  formatMonth,
  formatPrice,
  formatWeekday,
  getCalendarMonth,
  getDaysInMonth,
  getMonthFirstWeekday,
  getMonthKey,
  getNights,
  isDateInMonth,
  shiftMonth,
  type CalendarMonth
} from '@/lib/reservation/calendar';
import {getPluralForm} from '@/lib/reservation/plural';
import type {Locale} from '@/types/locale';
import type {
  IsoDate,
  ReservationApartmentOption,
  ReservationLabels
} from '@/types/reservation';

import styles from './ReservationWidget.module.css';

type Dropdown = 'calendar' | 'guests' | 'apartment' | null;

type ReservationWidgetProps = {
  readonly apartments: readonly ReservationApartmentOption[];
  readonly children: ReactNode;
  readonly labels: ReservationLabels;
  readonly locale: Locale;
  readonly todayIso: IsoDate;
};

function joinApartmentLabel(apartment: ReservationApartmentOption): string {
  return `${apartment.label} — ${apartment.address}`;
}

function getGuestDisplay(
  adults: number,
  children: number,
  locale: Locale,
  labels: ReservationLabels
): string {
  const adultText = `${adults} ${getPluralForm(locale, adults, labels.adults)}`;

  if (children === 0) {
    return adultText;
  }

  return `${adultText}, ${children} ${getPluralForm(locale, children, labels.children)}`;
}

function getDayId(date: IsoDate): string {
  return `reservation-calendar-day-${date}`;
}

export function ReservationWidget({
  apartments,
  children,
  labels,
  locale,
  todayIso
}: ReservationWidgetProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const dayButtonRefs = useRef<Record<string, HTMLButtonElement | null>>({});
  const calendarTriggerRef = useRef<HTMLButtonElement>(null);
  const guestsTriggerRef = useRef<HTMLButtonElement>(null);
  const apartmentTriggerRef = useRef<HTMLButtonElement>(null);
  const [checkIn, setCheckIn] = useState<IsoDate | null>(null);
  const [checkOut, setCheckOut] = useState<IsoDate | null>(null);
  const [displayedMonth, setDisplayedMonth] = useState<CalendarMonth>(() =>
    getCalendarMonth(todayIso)
  );
  const [focusedDate, setFocusedDate] = useState<IsoDate>(todayIso);
  const [adults, setAdults] = useState(1);
  const [childrenCount, setChildrenCount] = useState(0);
  const [selectedApartmentSlug, setSelectedApartmentSlug] = useState<string | null>(null);
  const [openDropdown, setOpenDropdown] = useState<Dropdown>(null);
  const [activeApartmentIndex, setActiveApartmentIndex] = useState(0);

  const selectedApartment = useMemo(
    () => apartments.find(({slug}) => slug === selectedApartmentSlug) ?? null,
    [apartments, selectedApartmentSlug]
  );
  const nights = getNights(checkIn, checkOut);
  const total = nights !== null && selectedApartment !== null
    ? nights * selectedApartment.price
    : null;
  const secondMonth = shiftMonth(displayedMonth, 1);
  const visibleCalendarDates = [displayedMonth, secondMonth].flatMap((month) =>
    Array.from({length: getDaysInMonth(month)}, (_, index) =>
      `${month.year}-${String(month.month).padStart(2, '0')}-${String(index + 1).padStart(2, '0')}` as IsoDate
    )
  );
  const focusableDate = visibleCalendarDates.includes(focusedDate)
    ? focusedDate
    : visibleCalendarDates.find((date) => compareCalendarDates(date, todayIso) >= 0) ??
      visibleCalendarDates[0];
  const guestDisplay = getGuestDisplay(adults, childrenCount, locale, labels);
  const dateDisplay = checkIn === null
    ? labels.datesPlaceholder
    : checkOut === null
      ? `${formatCalendarDate(checkIn, locale)} — ${labels.selectCheckOut}`
      : `${formatCalendarDate(checkIn, locale)} — ${formatCalendarDate(checkOut, locale)}`;
  const summaryAnnouncement =
    selectedApartment !== null && nights !== null
      ? `${labels.summaryUpdate}: ${joinApartmentLabel(selectedApartment)}, ${nights} ${getPluralForm(locale, nights, labels.nights)}`
      : '';

  useEffect(() => {
    if (openDropdown === null) {
      return;
    }

    const handlePointerDown = (event: PointerEvent) => {
      if (event.target instanceof Node && !rootRef.current?.contains(event.target)) {
        setOpenDropdown(null);
      }
    };
    const handleKeyDown = (event: globalThis.KeyboardEvent) => {
      if (event.key === 'Escape') {
        setOpenDropdown(null);
      }
    };

    document.addEventListener('pointerdown', handlePointerDown);
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('pointerdown', handlePointerDown);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [openDropdown]);

  function toggleDropdown(dropdown: Exclude<Dropdown, null>): void {
    setOpenDropdown((current) => (current === dropdown ? null : dropdown));
  }

  function handleDateSelect(date: IsoDate): void {
    if (compareCalendarDates(date, todayIso) < 0) {
      return;
    }

    setFocusedDate(date);

    if (checkIn === null || checkOut !== null) {
      setCheckIn(date);
      setCheckOut(null);
      return;
    }

    const order = compareCalendarDates(date, checkIn);

    if (order < 0) {
      setCheckIn(date);
      setCheckOut(checkIn);
      setOpenDropdown(null);
    } else if (order === 0) {
      setCheckOut(null);
    } else {
      setCheckOut(date);
      setOpenDropdown(null);
    }
  }

  function moveCalendarFocus(date: IsoDate, offset: number): void {
    let nextDate = addCalendarDays(date, offset);

    if (compareCalendarDates(nextDate, todayIso) < 0) {
      nextDate = todayIso;
    }

    setFocusedDate(nextDate);

    if (
      !isDateInMonth(nextDate, displayedMonth) &&
      !isDateInMonth(nextDate, secondMonth)
    ) {
      setDisplayedMonth(getCalendarMonth(nextDate));
    }

    window.requestAnimationFrame(() => {
      dayButtonRefs.current[nextDate]?.focus();
    });
  }

  function handleDayKeyDown(event: ReactKeyboardEvent<HTMLButtonElement>, date: IsoDate): void {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      handleDateSelect(date);
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
    moveCalendarFocus(date, offset);
  }

  function changeGuests(type: 'adults' | 'children', delta: number): void {
    if (type === 'adults') {
      setAdults((current) => Math.min(10, Math.max(1, current + delta)));
      return;
    }

    setChildrenCount((current) => Math.min(10, Math.max(0, current + delta)));
  }

  function selectApartment(index: number): void {
    const apartment = apartments[index];

    if (apartment === undefined) {
      return;
    }

    setSelectedApartmentSlug(apartment.slug);
    setActiveApartmentIndex(index);
    setOpenDropdown(null);
  }

  function handleApartmentKeyDown(event: ReactKeyboardEvent<HTMLButtonElement>): void {
    if (event.key === 'Escape') {
      event.preventDefault();
      setOpenDropdown(null);
      return;
    }

    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();

      if (openDropdown === 'apartment') {
        selectApartment(activeApartmentIndex);
      } else {
        setActiveApartmentIndex(
          Math.max(
            0,
            apartments.findIndex(({slug}) => slug === selectedApartmentSlug)
          )
        );
        setOpenDropdown('apartment');
      }
      return;
    }

    if (event.key !== 'ArrowDown' && event.key !== 'ArrowUp') {
      return;
    }

    event.preventDefault();
    const direction = event.key === 'ArrowDown' ? 1 : -1;

    if (openDropdown !== 'apartment') {
      setOpenDropdown('apartment');
      return;
    }

    setActiveApartmentIndex((current) =>
      (current + direction + apartments.length) % apartments.length
    );
  }

  function renderMonth(month: CalendarMonth, isSecond: boolean) {
    const monthKey = getMonthKey(month);
    const days = getDaysInMonth(month);
    const leadingEmptyDays = getMonthFirstWeekday(month);
    const titleId = `reservation-calendar-month-${monthKey}`;

    return (
      <section
        aria-labelledby={titleId}
        className={[styles.month, isSecond ? styles.secondMonth : ''].join(' ')}
        key={monthKey}
      >
        <h3 className={styles.monthTitle} id={titleId}>
          {formatMonth(month, locale)}
        </h3>
        <div aria-colcount={7} aria-rowcount={6} className={styles.calendarGrid} role="grid">
          {Array.from({length: 7}, (_, index) => (
            <div className={styles.weekday} key={`${monthKey}-weekday-${index}`} role="columnheader">
              {formatWeekday(index, locale)}
            </div>
          ))}
          {Array.from({length: leadingEmptyDays}, (_, index) => (
            <span aria-hidden="true" className={styles.emptyDay} key={`${monthKey}-empty-${index}`} />
          ))}
          {Array.from({length: days}, (_, index) => {
            const date = `${month.year}-${String(month.month).padStart(2, '0')}-${String(index + 1).padStart(2, '0')}` as IsoDate;
            const isPast = compareCalendarDates(date, todayIso) < 0;
            const isCheckIn = date === checkIn;
            const isCheckOut = date === checkOut;
            const isInRange =
              checkIn !== null &&
              checkOut !== null &&
              compareCalendarDates(date, checkIn) > 0 &&
              compareCalendarDates(date, checkOut) < 0;
            const isToday = date === todayIso;
            const descriptors = [formatCalendarDate(date, locale)];

            if (isToday) descriptors.push(labels.today);
            if (isCheckIn) descriptors.push(labels.checkIn);
            if (isCheckOut) descriptors.push(labels.checkOut);
            if (isInRange) descriptors.push(labels.selectedRange);
            if (isPast) descriptors.push(labels.pastDate);

            return (
              <div className={styles.dayCell} key={date} role="gridcell">
                <button
                  aria-current={isToday ? 'date' : undefined}
                  aria-disabled={isPast}
                  aria-label={descriptors.join(', ')}
                  aria-pressed={isCheckIn || isCheckOut || isInRange}
                  className={[
                    styles.day,
                    isCheckIn || isCheckOut ? styles.selectedDay : '',
                    isInRange ? styles.inRangeDay : '',
                    isPast ? styles.pastDay : ''
                  ].join(' ')}
                  disabled={isPast}
                  id={getDayId(date)}
                  key={date}
                  onClick={() => handleDateSelect(date)}
                  onFocus={() => setFocusedDate(date)}
                  onKeyDown={(event) => handleDayKeyDown(event, date)}
                  ref={(element) => {
                    dayButtonRefs.current[date] = element;
                  }}
                  tabIndex={date === focusableDate ? 0 : -1}
                  type="button"
                >
                  {index + 1}
                </button>
              </div>
            );
          })}
        </div>
      </section>
    );
  }

  return (
    <div className={styles.widget} ref={rootRef}>
      <div className={styles.widgets}>
        <div className={styles.fieldShell}>
          <button
            aria-controls="reservation-calendar-dropdown"
            aria-expanded={openDropdown === 'calendar'}
            aria-haspopup="dialog"
            className={[styles.fieldTrigger, openDropdown === 'calendar' ? styles.openTrigger : ''].join(' ')}
            onClick={() => toggleDropdown('calendar')}
            ref={calendarTriggerRef}
            type="button"
          >
            <span className={styles.fieldContent}>
              <span className={styles.fieldLabel}>{labels.datesLabel}</span>
              <span className={styles.fieldValue}>{dateDisplay}</span>
            </span>
            <FiCalendar aria-hidden="true" className={styles.fieldIcon} focusable="false" />
          </button>

          {openDropdown === 'calendar' ? (
            <div
              aria-label={labels.calendarLabel}
              className={styles.dropdown}
              id="reservation-calendar-dropdown"
              role="dialog"
            >
              <div className={styles.calendarNav}>
                <button
                  aria-label={labels.previousMonth}
                  className={styles.calendarNavButton}
                  onClick={() => setDisplayedMonth((current) => shiftMonth(current, -1))}
                  type="button"
                >
                  <FiChevronLeft aria-hidden="true" focusable="false" />
                </button>
                <div className={styles.calendarTitles}>
                  <span className={styles.monthTitle}>{formatMonth(displayedMonth, locale)}</span>
                  <span className={[styles.monthTitle, styles.secondMonth].join(' ')}>
                    {formatMonth(secondMonth, locale)}
                  </span>
                </div>
                <button
                  aria-label={labels.nextMonth}
                  className={styles.calendarNavButton}
                  onClick={() => setDisplayedMonth((current) => shiftMonth(current, 1))}
                  type="button"
                >
                  <FiChevronRight aria-hidden="true" focusable="false" />
                </button>
              </div>
              <div className={styles.calendarWrapper}>
                {renderMonth(displayedMonth, false)}
                {renderMonth(secondMonth, true)}
              </div>
              <div className={styles.calendarActions}>
                <button
                  className={[styles.actionButton, styles.secondaryButton].join(' ')}
                  onClick={() => {
                    setCheckIn(null);
                    setCheckOut(null);
                    setFocusedDate(todayIso);
                  }}
                  type="button"
                >
                  {labels.clearDates}
                </button>
              </div>
            </div>
          ) : null}
        </div>

        <div className={styles.fieldShell}>
          <button
            aria-controls="reservation-guests-dropdown"
            aria-expanded={openDropdown === 'guests'}
            aria-haspopup="dialog"
            className={[styles.fieldTrigger, openDropdown === 'guests' ? styles.openTrigger : ''].join(' ')}
            onClick={() => toggleDropdown('guests')}
            ref={guestsTriggerRef}
            type="button"
          >
            <span className={styles.fieldContent}>
              <span className={styles.fieldLabel}>{labels.guestsLabel}</span>
              <span className={styles.fieldValue}>{guestDisplay}</span>
            </span>
            <FiChevronDown aria-hidden="true" className={styles.fieldIcon} focusable="false" />
          </button>

          {openDropdown === 'guests' ? (
            <div
              aria-label={labels.guestsLabel}
              className={styles.dropdown}
              id="reservation-guests-dropdown"
              role="dialog"
            >
              <div className={styles.guestSection}>
                <h3 className={styles.sectionTitle}>{labels.adultsLabel}</h3>
                <div className={styles.counter}>
                  <span className={styles.counterLabel}>{labels.countLabel}</span>
                  <span className={styles.counterControls}>
                    <button
                      aria-label={labels.decreaseAdults}
                      className={styles.counterButton}
                      disabled={adults === 1}
                      onClick={() => changeGuests('adults', -1)}
                      type="button"
                    >
                      <FiMinus aria-hidden="true" focusable="false" />
                    </button>
                    <span aria-live="polite" className={styles.counterValue}>{adults}</span>
                    <button
                      aria-label={labels.increaseAdults}
                      className={styles.counterButton}
                      disabled={adults === 10}
                      onClick={() => changeGuests('adults', 1)}
                      type="button"
                    >
                      <FiPlus aria-hidden="true" focusable="false" />
                    </button>
                  </span>
                </div>
              </div>

              <div className={styles.guestSection}>
                <h3 className={styles.sectionTitle}>{labels.childrenLabel}</h3>
                <div className={styles.counter}>
                  <span className={styles.counterLabel}>{labels.countLabel}</span>
                  <span className={styles.counterControls}>
                    <button
                      aria-label={labels.decreaseChildren}
                      className={styles.counterButton}
                      disabled={childrenCount === 0}
                      onClick={() => changeGuests('children', -1)}
                      type="button"
                    >
                      <FiMinus aria-hidden="true" focusable="false" />
                    </button>
                    <span aria-live="polite" className={styles.counterValue}>{childrenCount}</span>
                    <button
                      aria-label={labels.increaseChildren}
                      className={styles.counterButton}
                      disabled={childrenCount === 10}
                      onClick={() => changeGuests('children', 1)}
                      type="button"
                    >
                      <FiPlus aria-hidden="true" focusable="false" />
                    </button>
                  </span>
                </div>
              </div>

              <div className={styles.divider} />
              <div className={styles.actions}>
                <button
                  className={[styles.actionButton, styles.secondaryButton].join(' ')}
                  onClick={() => {
                    setAdults(1);
                    setChildrenCount(0);
                  }}
                  type="button"
                >
                  {labels.clear}
                </button>
                <button
                  className={[styles.actionButton, styles.primaryButton].join(' ')}
                  onClick={() => setOpenDropdown(null)}
                  type="button"
                >
                  {labels.done}
                </button>
              </div>
            </div>
          ) : null}
        </div>
      </div>

      <div className={styles.fieldShell}>
        <button
          aria-activedescendant={openDropdown === 'apartment' ? `reservation-apartment-option-${activeApartmentIndex}` : undefined}
          aria-controls="reservation-apartment-dropdown"
          aria-expanded={openDropdown === 'apartment'}
          aria-haspopup="listbox"
          aria-label={labels.apartmentLabel}
          className={[styles.fieldTrigger, styles.apartmentTrigger, openDropdown === 'apartment' ? styles.openTrigger : ''].join(' ')}
          onClick={() => toggleDropdown('apartment')}
          onKeyDown={handleApartmentKeyDown}
          ref={apartmentTriggerRef}
          role="combobox"
          type="button"
        >
          <span className={styles.fieldContent}>
            <span className={styles.fieldLabel}>{labels.apartmentLabel}</span>
            <span className={styles.fieldValue}>
              {selectedApartment === null ? labels.apartmentPlaceholder : joinApartmentLabel(selectedApartment)}
            </span>
          </span>
          <FiChevronDown aria-hidden="true" className={styles.fieldIcon} focusable="false" />
        </button>

        {openDropdown === 'apartment' ? (
          <div className={styles.dropdown} id="reservation-apartment-dropdown">
            <ul aria-label={labels.apartmentOptionsLabel} className={styles.apartmentList} role="listbox">
              {apartments.map((apartment, index) => (
                <li
                  aria-selected={selectedApartmentSlug === apartment.slug}
                  className={styles.apartmentOption}
                  id={`reservation-apartment-option-${index}`}
                  key={apartment.slug}
                  role="option"
                >
                  <button
                    className={styles.apartmentOptionButton}
                    onClick={() => selectApartment(index)}
                    type="button"
                  >
                    <span>{joinApartmentLabel(apartment)}</span>
                    <span className={styles.optionPrice}>
                      {apartment.priceMode === 'from' ? `${labels.from} ` : ''}
                      {formatPrice(apartment.price, locale)}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          </div>
        ) : null}
      </div>

      {children}

      <section aria-labelledby="reservation-summary-title" className={styles.summary}>
        <h2 className={styles.summaryTitle} id="reservation-summary-title">
          {labels.summaryTitle}
        </h2>
        <dl className={styles.summaryList}>
          <div className={styles.summaryRow}>
            <div className={styles.summaryItem}>
              <dt>{labels.summaryApartment}</dt>
              <dd>
                {selectedApartment === null ? labels.emptyValue : (
                  <>
                    <strong>{selectedApartment.label}</strong>
                    <span>{selectedApartment.address}</span>
                  </>
                )}
              </dd>
            </div>
          </div>
          <div className={styles.summaryRow}>
            <div className={styles.summaryItem}>
              <dt>{labels.summaryCheckIn}</dt>
              <dd>{checkIn === null ? labels.emptyValue : formatCalendarDate(checkIn, locale)}</dd>
            </div>
            <div className={styles.summaryItem}>
              <dt>{labels.summaryCheckOut}</dt>
              <dd>{checkOut === null ? labels.emptyValue : formatCalendarDate(checkOut, locale)}</dd>
            </div>
            <div className={styles.summaryItem}>
              <dt>{labels.summaryNights}</dt>
              <dd>
                {nights === null
                  ? labels.emptyValue
                  : `${nights} ${getPluralForm(locale, nights, labels.nights)}`}
              </dd>
            </div>
          </div>
          <div className={styles.summaryRow}>
            <div className={styles.summaryItem}>
              <dt>{labels.summaryAdults}</dt>
              <dd>{adults}</dd>
            </div>
            <div className={styles.summaryItem}>
              <dt>{labels.summaryChildren}</dt>
              <dd>{childrenCount}</dd>
            </div>
            <div className={[styles.summaryItem, styles.totalItem].join(' ')}>
              <dt>{labels.summaryTotal}</dt>
              <dd>
                {total === null
                  ? labels.emptyValue
                  : (
                    <>
                      <strong>
                        {selectedApartment?.priceMode === 'from' ? `${labels.from} ` : ''}
                        {formatPrice(total, locale)}
                      </strong>
                      <span>{labels.preliminary}</span>
                    </>
                  )}
              </dd>
            </div>
          </div>
        </dl>
        {total === null ? <p className={styles.emptySummary}>{labels.summaryEmpty}</p> : null}
        <p aria-live="polite" className={styles.visuallyHidden} role="status">
          {summaryAnnouncement}
        </p>
      </section>
    </div>
  );
}
