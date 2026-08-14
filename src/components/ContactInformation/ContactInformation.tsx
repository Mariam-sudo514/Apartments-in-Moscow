import {socialLinks} from '@/config/social-links';

import styles from './ContactInformation.module.css';

export type ContactInformationLabels = {
  readonly actions: {
    readonly email: string;
    readonly telegram: string;
    readonly whatsapp: string;
  };
  readonly department: string;
  readonly subtitle: string;
  readonly title: string;
};

type ContactInformationProps = {
  readonly labels: ContactInformationLabels;
};

export function ContactInformation({labels}: ContactInformationProps) {
  return (
    <section aria-labelledby="contact-information-title" className={styles.panel}>
      <h2 className={styles.title} id="contact-information-title">
        {labels.title}
      </h2>
      <p className={styles.subtitle}>{labels.subtitle}</p>
      <h3 className={styles.department}>{labels.department}</h3>

      <ul className={styles.actions}>
        {socialLinks.map(({key, href, external, Icon}) => (
          <li key={key}>
            <a
              className={styles.action}
              href={href}
              rel={external ? 'noopener noreferrer' : undefined}
              target={external ? '_blank' : undefined}
            >
              <Icon aria-hidden="true" focusable="false" />
              <span>{labels.actions[key]}</span>
            </a>
          </li>
        ))}
      </ul>
    </section>
  );
}
