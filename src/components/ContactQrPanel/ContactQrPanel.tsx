import Image from 'next/image';

import {contactDisplay, getSocialLink} from '@/config/social-links';

import styles from './ContactQrPanel.module.css';

type ContactQrPanelProps = {
  readonly labels: {
    readonly alt: string;
    readonly caption: string;
  };
  readonly variant?: 'home' | 'page';
};

export function ContactQrPanel({labels, variant = 'page'}: ContactQrPanelProps) {
  const telegram = getSocialLink('telegram');
  const panelClassName =
    variant === 'home' ? `${styles.panel} ${styles.homePanel}` : styles.panel;

  return (
    <section aria-label={labels.alt} className={panelClassName}>
      <a
        aria-label={labels.alt}
        className={styles.link}
        href={telegram.href}
        rel="noopener noreferrer"
        target="_blank"
      >
        <Image
          alt={labels.alt}
          className={styles.qr}
          height={1908}
          sizes="240px"
          src="/images/contacts/telegram-qr.png"
          width={1726}
        />
      </a>
      <p className={styles.handle}>{contactDisplay.telegramHandle}</p>
      <p className={styles.caption}>{labels.caption}</p>
    </section>
  );
}
