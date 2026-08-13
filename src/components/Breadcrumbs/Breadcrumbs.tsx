import {Link} from '@/i18n/navigation';

import styles from './Breadcrumbs.module.css';

export type BreadcrumbItem = {
  readonly href?: string;
  readonly label: string;
};

type BreadcrumbsProps = {
  readonly ariaLabel: string;
  readonly items: readonly BreadcrumbItem[];
};

export function Breadcrumbs({ariaLabel, items}: BreadcrumbsProps) {
  return (
    <nav aria-label={ariaLabel} className={styles.container}>
      <ol className={styles.list}>
        {items.map((item, index) => {
          const isCurrent = index === items.length - 1;

          return (
            <li
              aria-current={isCurrent ? 'page' : undefined}
              className={styles.item}
              key={`${item.label}-${index}`}
            >
              {item.href && !isCurrent ? (
                <Link className={styles.link} href={item.href}>
                  {item.label}
                </Link>
              ) : (
                <span className={isCurrent ? styles.current : undefined}>
                  {item.label}
                </span>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
