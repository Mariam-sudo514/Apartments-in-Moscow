import Image from 'next/image';

import {Link} from '@/i18n/navigation';

import styles from './SiteLogo.module.css';

type SiteLogoProps = {
  variant: 'navigation' | 'footer';
  alt: string;
};

const logoSources = {
  navigation: {
    full: '/images/brand/nav-logo.svg',
    compact: '/images/brand/nav-logo-compact.svg',
    fullWidth: 80,
    fullHeight: 53
  },
  footer: {
    full: '/images/brand/footer-logo.svg',
    compact: '/images/brand/footer-logo-compact.svg',
    fullWidth: 88,
    fullHeight: 58
  }
} as const;

export function SiteLogo({variant, alt}: SiteLogoProps) {
  const source = logoSources[variant];

  return (
    <div className={[styles.logo, styles[variant]].join(' ')}>
      <Link aria-label={alt} className={styles.link} href="/">
        <Image
          alt={alt}
          className={styles.full}
          height={source.fullHeight}
          priority={variant === 'navigation'}
          src={source.full}
          width={source.fullWidth}
        />
        <Image
          alt=""
          aria-hidden="true"
          className={styles.compact}
          height={36}
          src={source.compact}
          width={54}
        />
      </Link>
    </div>
  );
}
