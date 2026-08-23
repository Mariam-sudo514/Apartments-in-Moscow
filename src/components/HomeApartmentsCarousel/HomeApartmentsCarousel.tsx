'use client';

import {useEffect, useRef, useSyncExternalStore} from 'react';
import Swiper from 'swiper';
import {Autoplay, Navigation, Pagination} from 'swiper/modules';

import {Link} from '@/i18n/navigation';

import styles from './HomeApartmentsCarousel.module.css';

const reducedMotionQuery = '(prefers-reduced-motion: reduce)';

export type HomeApartmentSlide = {
  readonly address: string;
  readonly buttonLabel: string;
  readonly description: string;
  readonly href: string;
  readonly imageAlt: string;
  readonly imageHeight: number;
  readonly imagePath: string;
  readonly imageWidth: number;
  readonly price: string;
  readonly priceLabel: string;
  readonly slug: string;
  readonly type: string;
};

type HomeApartmentsCarouselProps = {
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

export function HomeApartmentsCarousel({slides}: HomeApartmentsCarouselProps) {
  const reducedMotion = useSyncExternalStore(
    subscribeToReducedMotion,
    getReducedMotionSnapshot,
    getReducedMotionServerSnapshot,
  );
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = wrapperRef.current;

    if (!root) {
      return;
    }

    const pagination = root.querySelector<HTMLElement>('.swiper-pagination');
    const previous = root.querySelector<HTMLElement>('.swiper-button-prev');
    const next = root.querySelector<HTMLElement>('.swiper-button-next');

    if (!pagination || !previous || !next) {
      return;
    }

    const swiper = new Swiper(root, {
      modules: [Autoplay, Pagination, Navigation],
      loop: true,
      spaceBetween: 30,
      autoplay: reducedMotion
        ? false
        : {
            delay: 5000,
            disableOnInteraction: false,
            pauseOnMouseEnter: true,
          },
      pagination: {
        el: pagination,
        clickable: true,
        dynamicBullets: true,
      },
      navigation: {
        nextEl: next,
        prevEl: previous,
      },
      breakpoints: {
        0: {slidesPerView: 1},
        768: {slidesPerView: 2},
        1024: {slidesPerView: 3},
      },
    });

    return () => swiper.destroy(true, true);
  }, [reducedMotion]);

  if (slides.length === 0) {
    return null;
  }

  return (
    <div className={[styles.container, 'swiper'].join(' ')}>
      <div className={styles.wrapper} ref={wrapperRef}>
        <div className={[styles.cardList, 'swiper-wrapper'].join(' ')}>
          {slides.map((slide) => (
            <div className={[styles.card, 'swiper-slide'].join(' ')} key={slide.slug}>
              <div className={styles.cardImage}>
                {/* The legacy carousel eagerly loads every slide image. */}
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  alt={slide.imageAlt}
                  className={styles.image}
                  src={slide.imagePath}
                />
                <p className={styles.cardTag}>{slide.type}</p>
              </div>
              <div className={styles.cardContent}>
                <h3 className={styles.cardTitle}>{slide.address}</h3>
                <p className={styles.cardText}>{slide.description}</p>
                <div className={styles.cardFooter}>
                  <div className={styles.cardProfile}>
                    <div className={styles.cardProfileInfo}>
                      <span className={styles.cardProfilePrice}>{slide.price}</span>
                      <span className={styles.cardProfileRole}>{slide.priceLabel}</span>
                    </div>
                  </div>
                  <Link className={styles.cardButton} href={slide.href}>
                    {slide.buttonLabel}
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
        <div className="swiper-pagination" />
        <div className="swiper-button-prev" />
        <div className="swiper-button-next" />
      </div>
    </div>
  );
}
