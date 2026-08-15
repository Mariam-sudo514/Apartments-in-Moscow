import type {Metadata} from 'next';

export const metadata: Metadata = {
  robots: {
    follow: false,
    index: false
  }
};

export default function NotFound() {
  return <h1>Page not found</h1>;
}
