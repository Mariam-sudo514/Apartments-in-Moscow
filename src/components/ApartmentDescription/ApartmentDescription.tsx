import type {LocalizedApartmentSection} from '@/types/apartment';

import styles from './ApartmentDescription.module.css';

type ApartmentDescriptionProps = {
  readonly sections: readonly LocalizedApartmentSection[];
  readonly title: string;
};

function SectionContent({section}: {readonly section: LocalizedApartmentSection}) {
  return (
    <>
      {section.paragraphs.map((paragraph) => (
        <p className={styles.text} key={paragraph}>
          {paragraph}
        </p>
      ))}
      {section.items.length > 0 ? (
        <ul className={styles.list}>
          {section.items.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      ) : null}
    </>
  );
}

export function ApartmentDescription({sections, title}: ApartmentDescriptionProps) {
  const [leadSection, ...remainingSections] = sections;

  return (
    <section className={styles.section}>
      <h1 className={styles.title}>{title}</h1>
      {leadSection ? <SectionContent section={leadSection} /> : null}

      {remainingSections.map((section) => (
        <section className={styles.subsection} key={section.title}>
          <h2 className={styles.title2}>{section.title}</h2>
          <SectionContent section={section} />
        </section>
      ))}
    </section>
  );
}
