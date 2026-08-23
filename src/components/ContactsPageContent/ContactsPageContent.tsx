import {getTranslations} from 'next-intl/server';

import {ContactInformation} from '@/components/ContactInformation';
import {ContactQrPanel} from '@/components/ContactQrPanel';
import {Container} from '@/components/Container';
import type {Locale} from '@/types/locale';

import styles from './ContactsPageContent.module.css';

type ContactsPageContentProps = {
  readonly locale: Locale;
};

export async function ContactsPageContent({locale}: ContactsPageContentProps) {
  const t = await getTranslations({locale, namespace: 'contacts'});
  const socialLabels = {
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

          <ContactQrPanel labels={{alt: t('qrAlt'), caption: t('qrCaption')}} />
        </div>
      </section>
    </Container>
  );
}
