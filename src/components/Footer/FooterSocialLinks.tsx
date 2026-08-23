import {socialLinks, type SocialLabelKey} from '@/config/social-links';

import styles from './Footer.module.css';

type FooterSocialLinksProps = {
  readonly labels: Record<SocialLabelKey, string>;
};

function FooterSocialIcon({type}: {readonly type: SocialLabelKey}) {
  if (type === 'whatsapp') {
    return (
      <svg aria-hidden="true" fill="none" focusable="false" height="40" viewBox="0 0 40 40" width="40" xmlns="http://www.w3.org/2000/svg">
        <circle cx="20" cy="20" r="19.5" fill="#ffffff" stroke="#ffffff" />
        <path
          clipRule="evenodd"
          d="M20.1339 29C24.0807 28.9991 27.5518 26.3508 28.6495 22.5029C29.7471 18.6551 28.2069 14.5341 24.871 12.3932C21.5352 10.2523 17.2067 10.6069 14.2524 13.2632C11.298 15.9194 10.429 20.2378 12.1205 23.8572L10 29L15.5635 27.7143C16.9429 28.5581 18.5234 29.0027 20.1339 29Z"
          fillRule="evenodd"
          stroke="#191919"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          clipRule="evenodd"
          d="M17.6526 18.7992C16.9315 18.7928 16.3513 18.1955 16.3555 17.4634C16.3597 16.7315 16.9466 16.1409 17.6677 16.143C18.389 16.1451 18.9725 16.7391 18.9726 17.4711C18.969 18.2077 18.3783 18.8021 17.6526 18.7992Z"
          fillRule="evenodd"
          stroke="#191919"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          clipRule="evenodd"
          d="M21.2954 22.466C21.2914 23.0081 21.6099 23.4993 22.1021 23.7098C22.5944 23.9202 23.1631 23.8085 23.5425 23.4268C23.9219 23.045 24.0368 22.4688 23.8337 21.9674C23.6307 21.4659 23.1496 21.1383 22.6154 21.1378C21.8897 21.135 21.299 21.7294 21.2954 22.466Z"
          fillRule="evenodd"
          stroke="#191919"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path d="M16.3336 17.4711C16.3158 21.9286 20.5138 24.2814 22.6153 23.7942" stroke="#191919" strokeLinecap="round" />
      </svg>
    );
  }

  if (type === 'telegram') {
    return (
      <svg aria-hidden="true" fill="none" focusable="false" height="40" viewBox="0 0 40 40" width="40" xmlns="http://www.w3.org/2000/svg">
        <circle cx="20" cy="20" r="19.5" fill="#ffffff" stroke="#ffffff" />
        <path
          d="M16.6738 22.8925L16.3929 27.0746C16.5441 27.0756 16.6934 27.0398 16.8294 26.9701C16.9655 26.9003 17.0845 26.7984 17.1774 26.6723L19.0616 24.7661L22.9739 27.7921C23.6865 28.2161 24.1901 27.9951 24.3854 27.0963L26.9513 14.3688C27.1775 13.249 26.5814 12.7996 25.8688 13.0823L10.7951 19.1887C9.75362 19.6236 9.7776 20.2325 10.6204 20.5115L14.4779 21.7799L23.1555 16.42C23.5769 16.1192 23.964 16.2859 23.6488 16.5795L16.6738 22.8925Z"
          stroke="#191919"
          strokeLinecap="round"
        />
      </svg>
    );
  }

  return (
    <svg aria-hidden="true" fill="none" focusable="false" height="40" viewBox="0 0 40 40" width="40" xmlns="http://www.w3.org/2000/svg">
      <circle cx="20" cy="20" r="19.5" fill="#ffffff" stroke="#ffffff" />
      <rect height="12" rx="1.5" stroke="#191919" width="17" x="11.5" y="13.5" />
      <path d="M12 14L19.3415 20.4238C19.7185 20.7537 20.2815 20.7537 20.6585 20.4238L28 14" stroke="#191919" strokeLinecap="round" />
    </svg>
  );
}

export function FooterSocialLinks({labels}: FooterSocialLinksProps) {
  return (
    <ul className={styles.footerSocialList}>
      {socialLinks.map(({external, href, key}) => (
        <li className={styles.footerSocialItem} key={key}>
          <a
            aria-label={labels[key]}
            className={styles.footerSocialLink}
            href={href}
            rel={external ? 'noopener noreferrer' : undefined}
            target={external ? '_blank' : undefined}
          >
            <FooterSocialIcon type={key} />
          </a>
        </li>
      ))}
    </ul>
  );
}
