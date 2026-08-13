import type {IconType} from 'react-icons';

import styles from './FeatureCard.module.css';

type FeatureCardProps = {
  description: string;
  icon: IconType;
  title: string;
};

export function FeatureCard({description, icon: Icon, title}: FeatureCardProps) {
  return (
    <article className={styles.card}>
      <div className={styles.icon}>
        <Icon aria-hidden="true" focusable="false" />
      </div>
      <h3 className={styles.title}>{title}</h3>
      <p className={styles.text}>{description}</p>
    </article>
  );
}
