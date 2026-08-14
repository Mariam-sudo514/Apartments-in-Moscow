import {getTranslations} from 'next-intl/server';
import {FiMessageCircle} from 'react-icons/fi';

import {ContactInformation} from '@/components/ContactInformation';
import {Container} from '@/components/Container';
import {SocialLinks} from '@/components/SocialLinks';
import type {Locale} from '@/types/locale';

import styles from './ContactsPageContent.module.css';

type ContactsPageContentProps = {
  readonly locale: Locale;
};

export async function ContactsPageContent({locale}: ContactsPageContentProps) {
  const t = await getTranslations({locale, namespace: 'contacts'});
  const socialLabels = {
    email: t('actions.email'),
    telegram: t('actions.telegram'),
    whatsapp: t('actions.whatsapp')
  };

  return (
    <Container>
      <section aria-labelledby="contacts-intro-title" className={styles.intro}>
        <h1 className={styles.introTitle} id="contacts-intro-title">
          {t('introTitle')}
        </h1>
        <p className={styles.introText}>{t('introText')}</p>
        <h2 className={styles.introClosing}>{t('introClosing')}</h2>
      </section>

      <section aria-label={t('sectionLabel')} className={styles.contacts}>
        <div className={styles.layout}>
          <ContactInformation
            labels={{
              actions: socialLabels,
              department: t('department'),
              subtitle: t('subtitle'),
              title: t('title')
            }}
          />

          <section aria-labelledby="contact-visual-title" className={styles.visual}>
            <div aria-hidden="true" className={styles.visualIcon}>
              <FiMessageCircle aria-hidden="true" focusable="false" />
            </div>
            <h2 className={styles.visualTitle} id="contact-visual-title">
              {t('visualTitle')}
            </h2>
            <p className={styles.visualText}>{t('visualText')}</p>
            <div className={styles.socialLinks}>
              <SocialLinks labels={socialLabels} variant="header" />
            </div>
          </section>
        </div>
      </section>
    </Container>
  );
}
