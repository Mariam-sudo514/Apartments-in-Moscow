import {socialLinks, type SocialLabelKey} from '@/config/social-links';

import styles from './SocialLinks.module.css';

type SocialLabels = Record<SocialLabelKey, string>;

type SocialLinksProps = {
  labels: SocialLabels;
  variant: 'header' | 'footer' | 'mobile';
};

export function SocialLinks({labels, variant}: SocialLinksProps) {
  return (
    <div className={[styles.social, styles[variant]].join(' ')}>
      <ul className={styles.list}>
        {socialLinks.map(({key, href, external, Icon}) => (
          <li className={styles.item} key={key}>
            <a
              aria-label={labels[key]}
              className={styles.link}
              href={href}
              rel={external ? 'noopener noreferrer' : undefined}
              target={external ? '_blank' : undefined}
            >
              <Icon aria-hidden="true" className={styles.icon} focusable="false" />
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}
