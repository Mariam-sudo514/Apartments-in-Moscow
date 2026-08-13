import {ContactsTeaser} from '@/components/ContactsTeaser';
import {HomeHero} from '@/components/HomeHero';
import {WhyChoose} from '@/components/WhyChoose';

export default async function HomePage() {
  return (
    <>
      <HomeHero />
      <WhyChoose />
      <ContactsTeaser />
    </>
  );
}
