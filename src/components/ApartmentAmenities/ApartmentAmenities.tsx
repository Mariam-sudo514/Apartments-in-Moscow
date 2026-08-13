import styles from './ApartmentAmenities.module.css';

type ApartmentAmenitiesProps = {
  readonly amenities: readonly string[];
  readonly title: string;
};

export function ApartmentAmenities({amenities, title}: ApartmentAmenitiesProps) {
  if (amenities.length === 0) {
    return null;
  }

  return (
    <section className={styles.section}>
      <h2 className={styles.title}>{title}</h2>
      <ul className={styles.list}>
        {amenities.map((amenity) => (
          <li key={amenity}>{amenity}</li>
        ))}
      </ul>
    </section>
  );
}
