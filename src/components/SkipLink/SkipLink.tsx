import styles from './SkipLink.module.css';

type SkipLinkProps = {
  readonly label: string;
};

export function SkipLink({label}: SkipLinkProps) {
  return (
    <a className={styles.skipLink} href="#main-content">
      {label}
    </a>
  );
}
