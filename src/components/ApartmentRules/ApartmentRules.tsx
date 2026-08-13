import styles from './ApartmentRules.module.css';

type ApartmentRulesLabels = {
  readonly checkIn: string;
  readonly checkOut: string;
  readonly title: string;
};

type ApartmentRulesProps = {
  readonly checkIn: string;
  readonly checkOut: string;
  readonly labels: ApartmentRulesLabels;
  readonly rules: readonly string[];
};

export function ApartmentRules({
  checkIn,
  checkOut,
  labels,
  rules
}: ApartmentRulesProps) {
  return (
    <section className={styles.section}>
      <h2 className={styles.title}>{labels.title}</h2>
      <ul className={styles.list}>
        {rules.map((rule) => (
          <li key={rule}>{rule}</li>
        ))}
      </ul>
      <div className={styles.timings}>
        <p>
          <span>{labels.checkIn}</span>
          {checkIn}
        </p>
        <p>
          <span>{labels.checkOut}</span>
          {checkOut}
        </p>
      </div>
    </section>
  );
}
