import type {ReactNode} from 'react';

import {Container} from '@/components/Container';
import type {LocalizedApartmentDescriptionElement} from '@/types/apartment';

import styles from './ApartmentDescription.module.css';

type ApartmentDescriptionProps = {
  readonly children: ReactNode;
  readonly elements: readonly LocalizedApartmentDescriptionElement[];
};

export function DescriptionElements({
  elements
}: {
  readonly elements: readonly LocalizedApartmentDescriptionElement[];
}) {
  return (
    <>
      {elements.map((element, index) => {
        if (element.type === 'heading') {
          const Heading = element.level === 1 ? 'h1' : 'h2';
          return (
            <Heading
              className={element.level === 1 ? styles.title : styles.title2}
              key={`heading-${index}`}
            >
              {element.text}
            </Heading>
          );
        }

        if (element.type === 'paragraph') {
          const className = element.variant === 'infrastructure'
            ? styles.textInfrastructure
            : element.variant === 'indented'
              ? styles.textIndented
              : styles.text;

          return (
            <p className={className} key={`paragraph-${index}`}>
              {element.text}
            </p>
          );
        }

        return (
          <ul className={styles.list} key={`list-${index}`}>
            {element.items.map((item, itemIndex) => (
              <li className={styles.item} key={`${item}-${itemIndex}`}>
                {item}
              </li>
            ))}
          </ul>
        );
      })}
    </>
  );
}

export function ApartmentDescription({children, elements}: ApartmentDescriptionProps) {
  return (
    <Container className={styles.description}>
      <div className={styles.block}>
        <DescriptionElements elements={elements} />
      </div>
      {children}
    </Container>
  );
}
