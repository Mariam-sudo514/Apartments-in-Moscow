import {getTranslations} from 'next-intl/server';

import {Container} from '@/components/Container';
import {LanguageSwitcher} from '@/components/LanguageSwitcher';
import {Navigation, type NavigationItem} from '@/components/Navigation';
import {SiteLogo} from '@/components/SiteLogo';
import {SocialLinks} from '@/components/SocialLinks';
import type {Locale} from '@/types/locale';

import styles from './Footer.module.css';

type FooterProps = {
  locale: Locale;
};

export async function Footer({locale}: FooterProps) {
  const t = await getTranslations();
  const items: readonly NavigationItem[] = [
    {href: '/', label: t('navigation.home')},
    {href: '/apartments', label: t('navigation.apartments')},
    {href: '/contacts', label: t('navigation.contacts')}
  ];
  const socialLabels = {
    whatsapp: t('social.whatsapp'),
    telegram: t('social.telegram'),
    email: t('social.email')
  };

  return (
    <footer className={styles.footer}>
      <Container>
        <div className={styles.block}>
          <SiteLogo alt={t('brand.logoAlt')} variant="footer" />

          <div className={styles.navigationWrap}>
            <Navigation
              ariaLabel={t('footer.ariaLabel')}
              items={items}
              variant="footer"
            />
            <LanguageSwitcher
              ariaLabel={t('languageSwitcher.ariaLabel')}
              enLabel={t('languageSwitcher.en')}
              currentLocale={locale}
              ruLabel={t('languageSwitcher.ru')}
            />
          </div>

          <div className={styles.socialBlock}>
            <SocialLinks labels={socialLabels} variant="footer" />
          </div>
        </div>

        <p className={styles.copyright}>
          {t('footer.copyright', {year: new Date().getFullYear()})}
        </p>
      </Container>
    </footer>
  );
}
