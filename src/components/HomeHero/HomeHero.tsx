import Image from 'next/image';
import {getTranslations} from 'next-intl/server';

import {Container} from '@/components/Container';
import {Link} from '@/i18n/navigation';

import styles from './HomeHero.module.css';

export async function HomeHero() {
  const t = await getTranslations('home.hero');

  return (
    <section aria-labelledby="home-hero-title" className={styles.hero}>
      <Container>
        <div className={styles.inner}>
          <div className={styles.content}>
            <h1 className={styles.title} id="home-hero-title">
              {t('title')}
            </h1>
            <p className={styles.text}>{t('description')}</p>
            <Link className={styles.button} href="/reservation">
              {t('cta')}
            </Link>
          </div>

          <div className={styles.imageFrame}>
            <Image
              alt={t('imageAlt')}
              className={styles.image}
              fill
              priority
              sizes="(max-width: 850px) 100vw, (max-width: 1200px) 50vw, 620px"
              src="/images/home/hero.png"
            />
          </div>
        </div>
      </Container>
    </section>
  );
}
