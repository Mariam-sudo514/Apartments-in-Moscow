import {getTranslations} from 'next-intl/server';

import {ContactInformation} from '@/components/ContactInformation';
import {ContactQrPanel} from '@/components/ContactQrPanel';
import {Container} from '@/components/Container';

import styles from './ContactsTeaser.module.css';

export async function ContactsTeaser() {
  const [t, contactT] = await Promise.all([
    getTranslations('home.contacts'),
    getTranslations('contacts')
  ]);

  return (
    <section aria-labelledby="home-contacts-title" className={styles.section}>
      <Container>
        <div className={styles.layout}>
          <ContactInformation
            labels={{
              actions: {
                telegram: t('actions.telegram'),
                whatsapp: t('actions.whatsapp')
              },
              department: t('bookingDepartment'),
              subtitle: t('subtitle'),
              title: t('title')
            }}
            titleId="home-contacts-title"
            variant="home"
          />
          <ContactQrPanel
            labels={{alt: contactT('qrAlt'), caption: contactT('qrCaption')}}
            variant="home"
          />
        </div>
      </Container>
    </section>
  );
}
