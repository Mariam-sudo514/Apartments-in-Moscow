'use client';

import Image from 'next/image';
import {useRef, useSyncExternalStore} from 'react';
import {FiChevronLeft, FiChevronRight} from 'react-icons/fi';
import {A11y, Autoplay, Keyboard, Navigation, Pagination} from 'swiper/modules';
import type {Swiper as SwiperClass} from 'swiper';
import {Swiper, SwiperSlide} from 'swiper/react';

import {Link} from '@/i18n/navigation';
import type {ApartmentPrice} from '@/types/apartment';
import type {Locale} from '@/types/locale';

import styles from './HomeApartmentsCarousel.module.css';

const reducedMotionQuery = '(prefers-reduced-motion: reduce)';

export type HomeApartmentSlide = {
  readonly address: string;
  readonly coverAlt: string;
  readonly coverPath: string;
  readonly href: string;
  readonly name: string;
  readonly price: ApartmentPrice;
  readonly shortDescription: string;
  readonly slug: string;
  readonly type: string;
};

export type HomeApartmentsCarouselLabels = {
  readonly carouselLabel: string;
  readonly carouselRole: string;
  readonly from: string;
  readonly moreDetails: string;
  readonly next: string;
  readonly paginationBullet: string;
  readonly perDay: string;
  readonly previous: string;
  readonly slideLabelOf: string;
  readonly slideLabelPrefix: string;
};

type HomeApartmentsCarouselProps = {
  readonly labels: HomeApartmentsCarouselLabels;
  readonly locale: Locale;
  readonly slides: readonly HomeApartmentSlide[];
};

function subscribeToReducedMotion(callback: () => void): () => void {
  const mediaQuery = window.matchMedia(reducedMotionQuery);

  if (mediaQuery.addEventListener) {
    mediaQuery.addEventListener('change', callback);
    return () => mediaQuery.removeEventListener('change', callback);
  }

  mediaQuery.addListener(callback);
  return () => mediaQuery.removeListener(callback);
}

function getReducedMotionSnapshot(): boolean {
  return window.matchMedia(reducedMotionQuery).matches;
}

function getReducedMotionServerSnapshot(): boolean {
  return false;
}

function formatPrice(price: ApartmentPrice, locale: 'ru' | 'en'): string {
  return new Intl.NumberFormat(locale, {
    currency: price.currency,
    currencyDisplay: 'narrowSymbol',
    maximumFractionDigits: 0,
    style: 'currency'
  }).format(price.amount);
}

export function HomeApartmentsCarousel({
  labels,
  locale,
  slides
}: HomeApartmentsCarouselProps) {
  const swiperRef = useRef<SwiperClass | null>(null);
  const reducedMotion = useSyncExternalStore(
    subscribeToReducedMotion,
    getReducedMotionSnapshot,
    getReducedMotionServerSnapshot
  );

  if (slides.length === 0) {
    return null;
  }

  return (
    <div
      className={styles.carouselFrame}
      onMouseEnter={() => swiperRef.current?.autoplay.pause()}
      onMouseLeave={() => swiperRef.current?.autoplay.resume()}
    >
      <Swiper
        a11y={{
          containerMessage: labels.carouselLabel,
          containerRole: 'region',
          containerRoleDescriptionMessage: labels.carouselRole,
          nextSlideMessage: labels.next,
          paginationBulletMessage: `${labels.paginationBullet} {{index}}`,
          prevSlideMessage: labels.previous,
          slideLabelMessage: `${labels.slideLabelPrefix} {{index}} ${labels.slideLabelOf} {{slidesLength}}`
        }}
        autoplay={
          reducedMotion
            ? false
            : {
                delay: 5000,
                disableOnInteraction: false,
                pauseOnMouseEnter: true
              }
        }
        breakpoints={{
          768: {slidesPerView: 2},
          1024: {slidesPerView: 3}
        }}
        className={styles.swiper}
        keyboard={{enabled: true, onlyInViewport: true}}
        key={reducedMotion ? 'reduced-motion' : 'full-motion'}
        loop
        modules={[Navigation, Pagination, Autoplay, Keyboard, A11y]}
        navigation={{
          nextEl: `.${styles.nextButton}`,
          prevEl: `.${styles.previousButton}`
        }}
        pagination={{clickable: true, dynamicBullets: true}}
        slidesPerView={1}
        spaceBetween={30}
        onSwiper={(swiper) => {
          swiperRef.current = swiper;
        }}
      >
        {slides.map((slide) => (
          <SwiperSlide key={slide.slug} data-apartment-slug={slide.slug}>
            <article aria-label={slide.name} className={styles.card}>
              <div className={styles.imageFrame}>
                <Image
                  alt={slide.coverAlt}
                  className={styles.image}
                  fill
                  sizes="(max-width: 767px) calc(100vw - 40px), (max-width: 1023px) calc(50vw - 45px), 330px"
                  src={slide.coverPath}
                />
                <p className={styles.tag}>{slide.type}</p>
              </div>

              <div className={styles.content}>
                <h3 className={styles.title}>{slide.address}</h3>
                <p className={styles.description}>{slide.shortDescription}</p>

                <div className={styles.footer}>
                  <div className={styles.priceBlock}>
                    <p className={styles.price}>
                      {slide.price.mode === 'from' ? `${labels.from} ` : ''}
                      {formatPrice(slide.price, locale)}
                    </p>
                    <p className={styles.priceRole}>{labels.perDay}</p>
                  </div>

                  <Link
                    aria-label={`${labels.moreDetails}: ${slide.name}, ${slide.address}`}
                    className={styles.button}
                    href={slide.href}
                  >
                    {labels.moreDetails}
                  </Link>
                </div>
              </div>
            </article>
          </SwiperSlide>
        ))}
      </Swiper>

      <button
        aria-label={labels.previous}
        className={[styles.navigationButton, styles.previousButton].join(' ')}
        type="button"
      >
        <FiChevronLeft aria-hidden="true" focusable="false" />
      </button>
      <button
        aria-label={labels.next}
        className={[styles.navigationButton, styles.nextButton].join(' ')}
        type="button"
      >
        <FiChevronRight aria-hidden="true" focusable="false" />
      </button>
    </div>
  );
}
