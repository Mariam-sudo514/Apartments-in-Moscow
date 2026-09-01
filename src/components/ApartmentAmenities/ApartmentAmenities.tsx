import styles from '@/components/ApartmentDescription/ApartmentDescription.module.css';

type ApartmentAmenitiesProps = {
  readonly columns: readonly (readonly string[])[];
  readonly title: string;
};

export function ApartmentAmenities({columns, title}: ApartmentAmenitiesProps) {
  if (columns.length === 0) {
    return null;
  }

  return (
    <div className={styles.block}>
      <h2 className={`${styles.title} ${styles.facilities}`}>{title}</h2>
      <div className={styles.rulesList}>
        {columns.map((column, columnIndex) => (
          <ul className={styles.list} key={`amenity-column-${columnIndex}`}>
            {column.map((amenity) => (
              <li key={amenity}>{amenity}</li>
            ))}
          </ul>
        ))}
      </div>
    </div>
  );
}
