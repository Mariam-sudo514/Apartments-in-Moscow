import {Link} from '@/i18n/navigation';

import styles from './Navigation.module.css';

export type NavigationPath = '/' | '/apartments' | '/contacts';

export type NavigationItem = {
  href: NavigationPath;
  label: string;
};

type NavigationProps = {
  items: readonly NavigationItem[];
  ariaLabel: string;
  variant: 'header' | 'footer' | 'mobile';
};

export function Navigation({
  items,
  ariaLabel,
  variant
}: NavigationProps) {
  return (
    <nav
      aria-label={ariaLabel}
      className={[styles.navigation, styles[variant]].join(' ')}
    >
      <ul className={styles.list}>
        {items.map((item) => (
          <li className={styles.item} key={item.href}>
            <Link className={styles.link} href={item.href}>
              {item.label}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
