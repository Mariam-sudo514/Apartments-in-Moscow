import {getTranslations} from 'next-intl/server';
import {FaDollarSign, FaMapMarkerAlt, FaShieldAlt} from 'react-icons/fa';

import {Container} from '@/components/Container';
import {FeatureCard} from '@/components/FeatureCard';

import styles from './WhyChoose.module.css';

const features = [
  {key: 'safety', Icon: FaShieldAlt},
  {key: 'priceQuality', Icon: FaDollarSign},
  {key: 'location', Icon: FaMapMarkerAlt}
] as const;

export async function WhyChoose() {
  const t = await getTranslations('home.why');

  return (
    <section aria-labelledby="why-choose-title" className={styles.section}>
      <Container>
        <h2 className={styles.title} id="why-choose-title">
          {t('title')}
        </h2>
        <div className={styles.features}>
          {features.map(({key, Icon}) => (
            <FeatureCard
              description={t(`features.${key}.description`)}
              icon={Icon}
              key={key}
              title={t(`features.${key}.title`)}
            />
          ))}
        </div>
      </Container>
    </section>
  );
}
