import {getTranslations} from 'next-intl/server';

import {Container} from '@/components/Container';
import {MobileNavigation} from '@/components/MobileNavigation';
import {Navigation, type NavigationItem} from '@/components/Navigation';
import {SiteLogo} from '@/components/SiteLogo';
import {SocialLinks} from '@/components/SocialLinks';

import styles from './Header.module.css';

export async function Header() {
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
    <header className={styles.header}>
      <Container>
        <div className={styles.inner}>
          <SiteLogo alt={t('brand.logoAlt')} variant="navigation" />

          <div className={styles.desktopNavigation}>
            <Navigation
              ariaLabel={t('navigation.ariaLabel')}
              items={items}
              variant="header"
            />
            <SocialLinks labels={socialLabels} variant="header" />
          </div>

          <MobileNavigation
            closeLabel={t('mobileMenu.close')}
            menuLabel={t('mobileMenu.open')}
            overlayLabel={t('mobileMenu.overlay')}
          >
            <Navigation
              ariaLabel={t('navigation.ariaLabel')}
              items={items}
              variant="mobile"
            />
            <SocialLinks labels={socialLabels} variant="mobile" />
          </MobileNavigation>
        </div>
      </Container>
    </header>
  );
}
