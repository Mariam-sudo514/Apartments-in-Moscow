import type {Locale} from '@/types/locale';

type LocalizedText = Readonly<Record<Locale, string>>;

type LegacyHomeApartment = {
  readonly address: LocalizedText;
  readonly description: LocalizedText;
  readonly imageAlt: LocalizedText;
  readonly imageHeight: number;
  readonly imagePath: string;
  readonly imageWidth: number;
  readonly legacyHref: string;
  readonly price: LocalizedText;
  readonly priceLabel: LocalizedText;
  readonly slug: string;
  readonly buttonLabel: LocalizedText;
  readonly type: LocalizedText;
};

export type LocalizedLegacyHomeApartment = {
  readonly address: string;
  readonly description: string;
  readonly imageAlt: string;
  readonly imageHeight: number;
  readonly imagePath: string;
  readonly imageWidth: number;
  readonly href: string;
  readonly price: string;
  readonly priceLabel: string;
  readonly slug: string;
  readonly buttonLabel: string;
  readonly type: string;
};

const text = (ru: string, en: string): LocalizedText => ({ru, en});

const studioDescription = text(
  'В студии есть быстрый Wi-Fi, стиральная машина, посуда и кухонные принадлежности, свежее постельное бельё и полотенца, а также всё необходимое для комфортного проживания.',
  'The studio has high-speed Wi-Fi, a washing machine, dishes and kitchen utensils, fresh bed linen and towels, and everything necessary for a comfortable stay.',
);

const altufyevoDescription = text(
  'Квартира полностью оборудована, имеет удобную планировку и всю необходимую мебель. В пешей доступности находятся метро «Владыкино», магазины и кафе.',
  'The apartment is fully equipped with a convenient layout and all necessary furniture. Walking distance to Vladykino metro, shops, and cafes.',
);

const beskudnikovskyDescription = text(
  'Квартира полностью оборудована, имеет удобную планировку и всю необходимую мебель. В пешей доступности находятся метро, магазины и кафе.',
  'The apartment is fully equipped with a convenient layout and all necessary furniture. Within walking distance to the metro, shops, and cafes.',
);

const apartmentLabel = text('За сутки', 'Per day');
const moreDetails = text('Подробнее', 'More details');

const legacyHomeApartments: readonly LegacyHomeApartment[] = [
  {
    address: text('Москва, Дмитровское шоссе, дом 107, корпус 3', 'Moscow, Dmitrovskoe Shosse 107, building 3'),
    description: studioDescription,
    imageAlt: text('Студия', 'Studio'),
    imageHeight: 268,
    imagePath: '/images/home/apartments/1.png',
    imageWidth: 450,
    legacyHref: 'apartament780.html',
    price: text('5 000 ₽', '5 000 ₽'),
    priceLabel: apartmentLabel,
    slug: 'dmitrovskoe-107-apt-1',
    buttonLabel: moreDetails,
    type: text('Студия', 'Studio'),
  },
  {
    address: text('Москва, Дмитровское шоссе, дом 107, корпус 3', 'Moscow, Dmitrovskoe Shosse 107, building 3'),
    description: studioDescription,
    imageAlt: text('Студия', 'Studio'),
    imageHeight: 408,
    imagePath: '/images/home/apartments/2.png',
    imageWidth: 460,
    legacyHref: 'apartament755.html',
    price: text('5 000 ₽', '5 000 ₽'),
    priceLabel: apartmentLabel,
    slug: 'dmitrovskoe-107-apt-2',
    buttonLabel: moreDetails,
    type: text('Студия', 'Studio'),
  },
  {
    address: text('Москва, Алтуфьевское шоссе, дом 2, корпус 3', 'Moscow, Altufyevskoye Shosse 2, building 3'),
    description: altufyevoDescription,
    imageAlt: text('Евро-трёхкомнатная квартира', 'Euro-three-room apartment'),
    imageHeight: 268,
    imagePath: '/images/home/apartments/3.png',
    imageWidth: 450,
    legacyHref: 'apartament1202.html',
    price: text('7 000 ₽', '7 000 ₽'),
    priceLabel: apartmentLabel,
    slug: 'altufyevskoe-2-apt-3',
    buttonLabel: moreDetails,
    type: text('Евро-трёхкомнатная квартира', 'Euro-three-room apartment'),
  },
  {
    address: text('Москва, Алтуфьевское шоссе, дом 2', 'Moscow, Altufyevskoye Shosse 2'),
    description: altufyevoDescription,
    imageAlt: text('Евро-трёхкомнатная квартира', 'Euro-three-room apartment'),
    imageHeight: 268,
    imagePath: '/images/home/apartments/4.png',
    imageWidth: 450,
    legacyHref: 'apartament1204.html',
    price: text('7 000 ₽', '7 000 ₽'),
    priceLabel: apartmentLabel,
    slug: 'altufyevskoe-2-apt-4',
    buttonLabel: moreDetails,
    type: text('Евро-трёхкомнатная квартира', 'Euro-three-room apartment'),
  },
  {
    address: text('Москва, Алтуфьевское шоссе, дом 2', 'Moscow, Altufyevskoye Shosse 2'),
    description: altufyevoDescription,
    imageAlt: text('Евро-двухкомнатная квартира', 'Euro-two-room apartment'),
    imageHeight: 268,
    imagePath: '/images/home/apartments/5.png',
    imageWidth: 450,
    legacyHref: 'apartament1206.html',
    price: text('6 000 ₽', '6 000 ₽'),
    priceLabel: apartmentLabel,
    slug: 'altufyevskoe-2-apt-5',
    buttonLabel: moreDetails,
    type: text('Евро-двухкомнатная квартира', 'Euro-two-room apartment'),
  },
  {
    address: text('Москва, Дмитровское шоссе, дом 107, корпус 3', 'Moscow, Dmitrovskoe Shosse 107, building 3'),
    description: studioDescription,
    imageAlt: text('Студия', 'Studio'),
    imageHeight: 268,
    imagePath: '/images/home/apartments/6.png',
    imageWidth: 450,
    legacyHref: 'apartament759.html',
    price: text('5 000 ₽', '5 000 ₽'),
    priceLabel: apartmentLabel,
    slug: 'dmitrovskoe-107-apt-6',
    buttonLabel: moreDetails,
    type: text('Студия', 'Studio'),
  },
  {
    address: text('Москва, Дмитровское шоссе, дом 107, корпус 3', 'Moscow, Dmitrovskoe Shosse 107, building 3'),
    description: studioDescription,
    imageAlt: text('Студия', 'Studio'),
    imageHeight: 594,
    imagePath: '/images/home/apartments/7.png',
    imageWidth: 441,
    legacyHref: 'ap.html',
    price: text('5 000 ₽', '5 000 ₽'),
    priceLabel: apartmentLabel,
    slug: 'dmitrovskoe-107-apt-7',
    buttonLabel: moreDetails,
    type: text('Студия', 'Studio'),
  },
  {
    address: text('Москва, Дмитровское шоссе, дом 107, корпус 3', 'Moscow, Dmitrovskoe Shosse 107, building 3'),
    description: studioDescription,
    imageAlt: text('Студия', 'Studio'),
    imageHeight: 594,
    imagePath: '/images/home/apartments/8.png',
    imageWidth: 450,
    legacyHref: 'apartament794.html',
    price: text('5 000 ₽', '5 000 ₽'),
    priceLabel: apartmentLabel,
    slug: 'dmitrovskoe-107-apt-8',
    buttonLabel: moreDetails,
    type: text('Студия', 'Studio'),
  },
  {
    address: text('Москва, Бескудниковский бульвар, дом 31', 'Moscow, Beskudnikovsky Boulevard 31'),
    description: beskudnikovskyDescription,
    imageAlt: text('Однокомнатная квартира', 'One-room apartment'),
    imageHeight: 529,
    imagePath: '/images/home/apartments/9.png',
    imageWidth: 450,
    legacyHref: 'apartament230.html',
    price: text('5 000 ₽', '5 000 ₽'),
    priceLabel: apartmentLabel,
    slug: 'beskudnikovsky-31-apt-9',
    buttonLabel: moreDetails,
    type: text('Однокомнатная квартира', 'One-room apartment'),
  },
  {
    address: text('Москва, Бескудниковский бульвар, дом 52', 'Moscow, Beskudnikovsky Boulevard 52'),
    description: beskudnikovskyDescription,
    imageAlt: text('Однокомнатная квартира', 'One-room apartment'),
    imageHeight: 519,
    imagePath: '/images/home/apartments/10.png',
    imageWidth: 450,
    legacyHref: 'apartament170.html',
    price: text('7 000 ₽', '7 000 ₽'),
    priceLabel: apartmentLabel,
    slug: 'beskudnikovsky-52-apt-10',
    buttonLabel: moreDetails,
    type: text('Однокомнатная квартира', 'One-room apartment'),
  },
  {
    address: text('Бескудниковский бульвар, дом 58, корпус 3', 'Beskudnikovsky Boulevard 58, building 3'),
    description: beskudnikovskyDescription,
    imageAlt: text('Двухкомнатная квартира', 'Two-room apartment'),
    imageHeight: 560,
    imagePath: '/images/home/apartments/11.png',
    imageWidth: 458,
    legacyHref: 'apartament58-230.html',
    price: text('8 000 ₽', '8 000 ₽'),
    priceLabel: apartmentLabel,
    slug: 'beskudnikovsky-58-apt-11',
    buttonLabel: moreDetails,
    type: text('Двухкомнатная квартира', 'Two-room apartment'),
  },
  {
    address: text('Московская область, деревня Митино, 10Б', 'Moscow region, Mitino village, 10B'),
    description: text(
      'Стильный A-frame дом площадью 81 м² с панорамными окнами и выходом к лесу, расположенный на участке площадью 30 соток',
      'Stylish 81 m² A-frame house with panoramic windows and access to the forest, located on a 30-acre plot',
    ),
    imageAlt: text('Дом', 'Дом'),
    imageHeight: 519,
    imagePath: '/images/home/apartments/12.png',
    imageWidth: 450,
    legacyHref: 'apartament12.html',
    price: text('от 8 000 ₽', 'от 8 000 ₽'),
    priceLabel: apartmentLabel,
    slug: 'mitino-aframe',
    buttonLabel: moreDetails,
    type: text('Стильный A-frame дом', 'Stylish A-frame house'),
  },
];

export function getLocalizedLegacyHomeApartments(
  locale: Locale,
): readonly LocalizedLegacyHomeApartment[] {
  return legacyHomeApartments.map((apartment) => ({
    address: apartment.address[locale],
    description: apartment.description[locale],
    href: `/apartments/${apartment.slug}`,
    imageAlt: apartment.imageAlt[locale],
    imageHeight: apartment.imageHeight,
    imagePath: apartment.imagePath,
    imageWidth: apartment.imageWidth,
    price: apartment.price[locale],
    priceLabel: apartment.priceLabel[locale],
    slug: apartment.slug,
    buttonLabel: apartment.buttonLabel[locale],
    type: apartment.type[locale],
  }));
}
