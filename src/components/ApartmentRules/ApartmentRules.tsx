import {DescriptionElements} from '@/components/ApartmentDescription/ApartmentDescription';
import styles from '@/components/ApartmentDescription/ApartmentDescription.module.css';
import {
  legacyCheckInIconPath,
  legacyCheckOutIconPath,
} from '@/data/apartments/legacy-detail-content';
import type {LocalizedApartmentRulesBlock} from '@/types/apartment';

type ApartmentRulesProps = {
  readonly block: LocalizedApartmentRulesBlock;
};

export function ApartmentRules({block}: ApartmentRulesProps) {
  return (
    <div className={styles.block}>
      <h1 className={`${styles.title} ${styles.rules}`}>{block.title}</h1>
      <ul className={`${styles.list} ${styles.rulesList}`}>
        {block.timings.map((timing) => (
          <li className={styles.rulesItem} key={timing.icon}>
            <svg
              aria-hidden="true"
              fill="none"
              height="25"
              viewBox="0 0 25 25"
              width="25"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d={timing.icon === 'checkIn' ? legacyCheckInIconPath : legacyCheckOutIconPath}
                fill="black"
              />
            </svg>
            <p className={styles.text}>{timing.text}</p>
          </li>
        ))}
      </ul>
      <DescriptionElements elements={block.elements} />
    </div>
  );
}
