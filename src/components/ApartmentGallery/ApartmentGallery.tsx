'use client';

import Image from 'next/image';
import {useState} from 'react';
import {FiChevronLeft, FiChevronRight} from 'react-icons/fi';
import type {KeyboardEvent} from 'react';

import type {LocalizedApartmentGalleryImage} from '@/types/apartment';

import styles from './ApartmentGallery.module.css';

type ApartmentGalleryLabels = {
  readonly image: string;
  readonly next: string;
  readonly positionOf: string;
  readonly positionPrefix: string;
  readonly previous: string;
  readonly region: string;
};

type ApartmentGalleryProps = {
  readonly images: readonly LocalizedApartmentGalleryImage[];
  readonly labels: ApartmentGalleryLabels;
};

export function ApartmentGallery({
  images,
  labels
}: ApartmentGalleryProps) {
  const [activeIndex, setActiveIndex] = useState(0);

  if (images.length === 0) {
    return null;
  }

  const activeImage = images[activeIndex] ?? images[0];

  function showNextImage() {
    setActiveIndex((current) => (current + 1) % images.length);
  }

  function showPreviousImage() {
    setActiveIndex((current) => (current - 1 + images.length) % images.length);
  }

  function handleImageKeyDown(event: KeyboardEvent<HTMLButtonElement>) {
    if (event.key === 'ArrowRight') {
      event.preventDefault();
      showNextImage();
    }
    if (event.key === 'ArrowLeft') {
      event.preventDefault();
      showPreviousImage();
    }
  }

  return (
    <section aria-label={labels.region} className={styles.block}>
      <div className={styles.frame}>
        <button
          aria-label={`${labels.image}. ${labels.next}`}
          className={styles.imageButton}
          onClick={showNextImage}
          onKeyDown={handleImageKeyDown}
          type="button"
        >
          <Image
            alt={activeImage.alt}
            className={styles.image}
            fill
            loading={activeIndex === 0 ? 'eager' : 'lazy'}
            sizes="(max-width: 900px) calc(100vw - 30px), (max-width: 1200px) 58vw, 700px"
            src={activeImage.plannedPublicPath}
          />
        </button>

        <button
          aria-label={labels.previous}
          className={[styles.navigationButton, styles.previous].join(' ')}
          onClick={showPreviousImage}
          type="button"
        >
          <FiChevronLeft aria-hidden="true" focusable="false" />
        </button>
        <button
          aria-label={labels.next}
          className={[styles.navigationButton, styles.next].join(' ')}
          onClick={showNextImage}
          type="button"
        >
          <FiChevronRight aria-hidden="true" focusable="false" />
        </button>

        <p aria-live="polite" className={styles.position}>
          {labels.positionPrefix} {activeIndex + 1} {labels.positionOf} {images.length}
        </p>
      </div>
    </section>
  );
}
