import {getTranslations} from 'next-intl/server';

import {Container} from '@/components/Container';
import {LanguageSwitcher} from '@/components/LanguageSwitcher';
import {SiteLogo} from '@/components/SiteLogo';
import {Link} from '@/i18n/navigation';
import type {Locale} from '@/types/locale';

import {FooterSocialLinks} from './FooterSocialLinks';
import styles from './Footer.module.css';

type FooterProps = {
  locale: Locale;
};

export async function Footer({locale}: FooterProps) {
  const t = await getTranslations();
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
            <nav aria-label={t('footer.ariaLabel')} className={styles.footerNavigation}>
              <ul className={styles.footerNavigationList}>
                <li>
                  <Link className={styles.footerNavigationLink} href="/">
                    {t('navigation.home')}
                  </Link>
                </li>
                <li>
                  <Link className={styles.footerNavigationLink} href="/apartments">
                    {t('navigation.apartments')}
                  </Link>
                </li>
                <li>
                  <Link className={styles.footerNavigationLink} href="/contacts">
                    {t('navigation.contacts')}
                  </Link>
                </li>
              </ul>
            </nav>
            <LanguageSwitcher
              ariaLabel={t('languageSwitcher.ariaLabel')}
              enLabel={t('languageSwitcher.en')}
              currentLocale={locale}
              ruLabel={t('languageSwitcher.ru')}
            />
          </div>

          <div className={styles.socialBlock}>
            <FooterSocialLinks labels={socialLabels} />
          </div>
        </div>

        <p className={styles.copyright}>
          {t('footer.copyright', {year: new Date().getFullYear()})}
        </p>
      </Container>
    </footer>
  );
}
