'use client';

import {usePathname, useRouter} from 'next/navigation';

import {locales, type Locale} from '@/types/locale';

import styles from './LanguageSwitcher.module.css';

type LocalizedPathname = '/' | '/apartments' | '/contacts' | '/reservation';

type LanguageSwitcherProps = {
  ariaLabel: string;
  enLabel: string;
  currentLocale: Locale;
  ruLabel: string;
};

const knownPathnames: readonly LocalizedPathname[] = [
  '/',
  '/apartments',
  '/contacts',
  '/reservation'
];

function withoutLocale(pathname: string): string {
  if (pathname === '/en' || pathname.startsWith('/en/')) {
    return pathname.slice(3) || '/';
  }

  if (pathname === '/ru' || pathname.startsWith('/ru/')) {
    return pathname.slice(3) || '/';
  }

  return pathname || '/';
}

function getSafePathname(pathname: string): LocalizedPathname {
  const candidate = withoutLocale(pathname);

  return knownPathnames.includes(candidate as LocalizedPathname)
    ? (candidate as LocalizedPathname)
    : '/';
}

function getTargetHref(pathname: string, locale: Locale): string {
  const safePathname = getSafePathname(pathname);

  if (locale === 'ru') {
    return safePathname;
  }

  return safePathname === '/' ? '/en' : `/en${safePathname}`;
}

export function LanguageSwitcher({
  ariaLabel,
  enLabel,
  currentLocale,
  ruLabel
}: LanguageSwitcherProps) {
  const pathname = usePathname();
  const router = useRouter();
  const currentPathname = getSafePathname(pathname);
  const links = locales.map((locale) => ({
    locale,
    href: getTargetHref(currentPathname, locale),
    label: locale === 'ru' ? ruLabel : enLabel
  }));

  return (
    <nav aria-label={ariaLabel} className={styles.switcher}>
      {links.map(({locale, href, label}) => (
        <a
          aria-current={locale === currentLocale ? 'page' : undefined}
          className={[
            styles.link,
            locale === currentLocale ? styles.active : ''
          ].join(' ')}
          href={href}
          key={locale}
          onClick={(event) => {
            const targetHref = getTargetHref(
              window.location.pathname,
              locale
            );
            const nextHref = `${targetHref}${window.location.search}${window.location.hash}`;

            if (nextHref !== href) {
              event.preventDefault();
              router.push(nextHref);
            }
          }}
        >
          {label}
        </a>
      ))}
    </nav>
  );
}
