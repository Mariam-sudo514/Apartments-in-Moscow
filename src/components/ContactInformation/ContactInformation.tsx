import {contactDisplay, getSocialLink} from '@/config/social-links';
import {FaEnvelope, FaPhone} from 'react-icons/fa';
import {PiTelegramLogo, PiWhatsappLogo} from 'react-icons/pi';

import styles from './ContactInformation.module.css';

export type ContactInformationLabels = {
  readonly actions: {
    readonly telegram: string;
    readonly whatsapp: string;
  };
  readonly department: string;
  readonly subtitle: string;
  readonly title: string;
};

type ContactInformationProps = {
  readonly labels: ContactInformationLabels;
  readonly titleId?: string;
  readonly variant?: 'home' | 'page';
};

export function ContactInformation({
  labels,
  titleId = 'contact-information-title',
  variant = 'page'
}: ContactInformationProps) {
  const telegram = getSocialLink('telegram');
  const whatsapp = getSocialLink('whatsapp');
  const panelClassName =
    variant === 'home' ? `${styles.panel} ${styles.homePanel}` : styles.panel;

  return (
    <section aria-labelledby={titleId} className={panelClassName}>
      <h2 className={styles.title} id={titleId}>
        {labels.title}
      </h2>
      <p className={styles.subtitle}>{labels.subtitle}</p>
      <h3 className={styles.department}>{labels.department}</h3>

      <ul className={styles.contactRows}>
        <li className={styles.contactRow}>
          <a href="tel:+79000000000">
            <FaPhone aria-hidden="true" focusable="false" />
            <span>{contactDisplay.phone}</span>
          </a>
        </li>
        <li className={styles.contactRow}>
          <a href="mailto:mail@gmail.com">
            <FaEnvelope aria-hidden="true" focusable="false" />
            <span>{contactDisplay.email}</span>
          </a>
        </li>
      </ul>

      <div className={styles.messengers}>
        <a
          className={styles.action}
          href={telegram.href}
          rel="noopener noreferrer"
          target="_blank"
        >
          <PiTelegramLogo aria-hidden="true" focusable="false" />
          <span>{labels.actions.telegram}</span>
        </a>
        <a
          className={styles.action}
          href={whatsapp.href}
          rel="noopener noreferrer"
          target="_blank"
        >
          <PiWhatsappLogo aria-hidden="true" focusable="false" />
          <span>{labels.actions.whatsapp}</span>
        </a>
      </div>
    </section>
  );
}
