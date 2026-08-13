import {getTranslations} from 'next-intl/server';

import {Container} from '@/components/Container';
import {Link} from '@/i18n/navigation';
import {SocialLinks} from '@/components/SocialLinks';
import {socialLinks} from '@/config/social-links';

import styles from './ContactsTeaser.module.css';

export async function ContactsTeaser() {
  const t = await getTranslations('home.contacts');
  const socialLabels = {
    whatsapp: t('actions.whatsapp'),
    telegram: t('actions.telegram'),
    email: t('actions.email')
  };

  return (
    <section aria-labelledby="contacts-teaser-title" className={styles.section}>
      <Container>
        <div className={styles.block}>
          <div className={styles.info}>
            <h2 className={styles.title} id="contacts-teaser-title">
              {t('title')}
            </h2>
            <p className={styles.subtitle}>{t('subtitle')}</p>
            <h3 className={styles.infoTitle}>{t('bookingDepartment')}</h3>
            <div className={styles.actions}>
              {socialLinks.map(({key, href, external, Icon}) => (
                <a
                  className={styles.action}
                  href={href}
                  key={key}
                  rel={external ? 'noopener noreferrer' : undefined}
                  target={external ? '_blank' : undefined}
                >
                  <Icon aria-hidden="true" focusable="false" />
                  {socialLabels[key]}
                </a>
              ))}
            </div>
          </div>

          <div className={styles.panel}>
            <p className={styles.panelTitle}>{t('panelTitle')}</p>
            <p className={styles.panelText}>{t('panelText')}</p>
            <SocialLinks labels={socialLabels} variant="footer" />
            <Link className={styles.contactsLink} href="/contacts">
              {t('contactsLink')}
            </Link>
          </div>
        </div>
      </Container>
    </section>
  );
}
