import type {
  ApartmentDetailData,
  ApartmentGalleryImage,
  ApartmentPrice,
  ApartmentRecord,
  ApartmentSource,
  LocalizedText,
} from '@/types/apartment';
import {legacyDetailContentByFilename} from './legacy-detail-content';

const text = (ru: string, en: string): LocalizedText => ({ ru, en });

const exactPrice = (amount: number): ApartmentPrice => ({
  amount,
  currency: 'RUB',
  mode: 'exact',
});

const fromPrice = (amount: number): ApartmentPrice => ({
  amount,
  currency: 'RUB',
  mode: 'from',
});

const createCover = (
  slug: string,
  legacyPath: string,
  extension: 'png',
  alt: LocalizedText,
) => ({
  legacyPath,
  plannedPublicPath: `/images/apartments/${slug}/cover.${extension}`,
  alt,
});

const createGallery = (
  slug: string,
  legacyDirectory: string,
  count: number,
  alt: LocalizedText,
): readonly ApartmentGalleryImage[] =>
  Array.from({ length: count }, (_, index) => {
    const order = index + 1;
    const fileNumber = String(order).padStart(2, '0');

    return {
      order,
      legacyPath: `${legacyDirectory}/${order}.jpeg`,
      plannedPublicPath: `/images/apartments/${slug}/${fileNumber}.jpeg`,
      alt,
    };
  });

const source = (
  detailPage: string,
  catalogCoverPath: string,
  detailGalleryDirectory: string,
  variantNotes?: readonly LocalizedText[],
): ApartmentSource => ({
  catalogPage: 'apartaments.html',
  detailPage,
  catalogCoverPath,
  detailGalleryDirectory,
  ...(variantNotes === undefined ? {} : { variantNotes }),
});

const studioCatalogDescription = text(
  'В студии есть быстрый Wi-Fi, стиральная машина, посуда и кухонные принадлежности, свежее постельное бельё и полотенца, а также всё необходимое для комфортного проживания.',
  'The studio has high-speed Wi-Fi, a washing machine, dishes and kitchen utensils, fresh bed linen and towels, as well as everything necessary for a comfortable stay.',
);

const studioDetailDescription = text(
  'В студии есть быстрый Wi-Fi, стиральная машина, посуда и кухонные принадлежности, свежее постельное бельё и полотенца, а также всё необходимое для комфортного проживания.',
  'The studio has high-speed Wi-Fi, a washing machine, dishes and kitchen utensils, fresh bed linen and towels, as well as everything necessary for a comfortable stay.',
);

const apartmentCatalogDescription = text(
  'Квартира полностью оборудована, имеет удобную планировку и всю необходимую мебель. В пешей доступности находятся метро, магазины и кафе.',
  'A fully equipped apartment with a convenient layout and all necessary furniture. The metro, shops, and cafes are within walking distance.',
);

const altufyevoCatalogDescription = text(
  'Квартира полностью оборудована, имеет удобную планировку и всю необходимую мебель. В пешей доступности находятся метро «Владыкино», магазины и кафе.',
  'A fully equipped apartment with a convenient layout and all necessary furniture. The Vladykino metro station, shops, and cafes are within walking distance.',
);

const apartmentDetailDescription = text(
  'Квартира полностью оборудована, имеет удобную планировку и всю необходимую мебель. В пешей доступности находятся метро «Владыкино», магазины и кафе.',
  'A fully equipped apartment with a convenient layout and all necessary furniture. The Vladykino metro station, shops, and cafes are within walking distance.',
);

const aframeCatalogDescription = text(
  'Стильный A-frame дом площадью 81 м² с панорамными окнами и выходом к лесу на участке площадью 30 соток.',
  'Stylish 81 m² A-frame house with panoramic windows and access to the forest, located on a 30-acre plot',
);

const aframeDetailDescription = text(
  'Всего в 70 км от Москвы по Ярославскому шоссе вы оказываетесь на веранде уютного дома с видом на лес. Стильный A-frame дом площадью 81 м² с панорамными окнами и выходом к лесу расположен на участке площадью 30 соток.',
  'Just 70 km from Moscow along the Yaroslavl Highway, you find yourself on the veranda of a comfortable house with a view of the forest. Stylish 81 m² A-frame house with panoramic windows and access to the forest, located on a 30-acre plot.',
);

const letniySadName = text('Жилой комплекс "Летний сад"', 'Residential Complex "Letniy Sad"');
const altufyevoName = text('ЖК "В Алтуфьево"', 'Residential complex "V Altufyevo"');
const beskudnikovskyName = text(
  'ЖК "Мой Адрес Бескудниковский"',
  'Residential complex "Moy Adres Beskudnikovsky"',
);

const studioType = text('Студия', 'Studio');
const euroThreeRoomType = text('Евро-трёхкомнатная квартира', 'Euro-three-room apartment');
const euroTwoRoomType = text('Евро-двухкомнатная квартира', 'Euro-two-room apartment');
const oneRoomType = text('Однокомнатная квартира', 'One-room apartment');
const twoRoomType = text('Двухкомнатная квартира', 'Two-room apartment');
const aframeType = text('Стильный A-frame дом', 'Stylish A-frame house');

const studioCoverAlt = text('Обложка студии', 'Studio cover image');
const apartmentCoverAlt = text('Обложка апартаментов', 'Apartment cover image');
const aframeCoverAlt = text('Обложка A-frame дома', 'A-frame house cover image');
const studioGalleryAlt = text('Интерьер студии', 'Studio interior');
const apartmentGalleryAlt = text('Интерьер апартаментов', 'Apartment interior');
const aframeGalleryAlt = text('Интерьер и территория A-frame дома', 'A-frame house interior and grounds');

const standardApartmentDetail = (
  title: LocalizedText,
  address: LocalizedText,
  description: LocalizedText,
  price: ApartmentPrice,
  gallery: readonly ApartmentGalleryImage[],
  legacyFilename: keyof typeof legacyDetailContentByFilename,
): ApartmentDetailData => ({
  ...legacyDetailContentByFilename[legacyFilename],
  title,
  address,
  description,
  price,
  gallery,
  map: legacyDetailContentByFilename[legacyFilename].map,
});

const aframeDetail = (
  gallery: readonly ApartmentGalleryImage[],
  legacyFilename: keyof typeof legacyDetailContentByFilename,
): ApartmentDetailData => ({
  ...legacyDetailContentByFilename[legacyFilename],
  title: text('Стильный A-frame дом', 'Stylish A-frame house'),
  address: text('Московская область, деревня Митино', 'Moscow region, Mitino village'),
  description: aframeDetailDescription,
  price: fromPrice(8000),
  gallery,
  map: legacyDetailContentByFilename[legacyFilename].map,
});

export const apartments = [
  {
    slug: 'dmitrovskoe-107-apt-1',
    legacyFilename: 'apartament780.html',
    catalogOrder: 1,
    catalog: {
      name: letniySadName,
      type: studioType,
      address: text('Москва, Дмитровское шоссе, дом 107, корпус 3', 'Moscow, Dmitrovskoe Shosse 107, building 3'),
      shortDescription: studioCatalogDescription,
      price: exactPrice(5000),
      cover: createCover('dmitrovskoe-107-apt-1', 'img/main/1.png', 'png', studioCoverAlt),
    },
    detail: standardApartmentDetail(
      letniySadName,
      text('Москва, Дмитровское шоссе д 107 корпус 3 кв. 1', 'Moscow, Dmitrovskoe Shosse 107, building 3, apt. 1'),
      studioDetailDescription,
      exactPrice(5000),
      createGallery('dmitrovskoe-107-apt-1', 'img/apartament img', 11, studioGalleryAlt),
      'apartament780.html',
    ),
    source: source('apartament780.html', 'img/main/1.png', 'img/apartament img'),
  },
  {
    slug: 'dmitrovskoe-107-apt-2',
    legacyFilename: 'apartament755.html',
    catalogOrder: 2,
    catalog: {
      name: letniySadName,
      type: studioType,
      address: text('Москва, Дмитровское шоссе, дом 107, корпус 3', 'Moscow, Dmitrovskoe Shosse 107, building 3'),
      shortDescription: studioCatalogDescription,
      price: exactPrice(5000),
      cover: createCover('dmitrovskoe-107-apt-2', 'img/main/2.png', 'png', studioCoverAlt),
    },
    detail: standardApartmentDetail(
      letniySadName,
      text('Москва, Дмитровское шоссе д 107 корпус 3 кв. 2', 'Moscow, Dmitrovskoe Shosse 107, building 3, apt. 2'),
      studioDetailDescription,
      exactPrice(5000),
      createGallery('dmitrovskoe-107-apt-2', 'img/apartament img2', 6, studioGalleryAlt),
      'apartament755.html',
    ),
    source: source('apartament755.html', 'img/main/2.png', 'img/apartament img2'),
  },
  {
    slug: 'altufyevskoe-2-apt-3',
    legacyFilename: 'apartament1202.html',
    catalogOrder: 3,
    catalog: {
      name: altufyevoName,
      type: euroThreeRoomType,
      address: text('Москва, Алтуфьевское шоссе, дом 2, корпус 3', 'Moscow, Altufyevskoye Shosse 2, building 3'),
      shortDescription: altufyevoCatalogDescription,
      price: exactPrice(7000),
      cover: createCover('altufyevskoe-2-apt-3', 'img/main/3.png', 'png', apartmentCoverAlt),
    },
    detail: standardApartmentDetail(
      altufyevoName,
      text('Москва, Алтуфьевское шоссе дом 2 кв. 3', 'Moscow, Altufyevskoye Shosse 2, apt. 3'),
      apartmentDetailDescription,
      exactPrice(7000),
      createGallery('altufyevskoe-2-apt-3', 'img/apartament img3', 8, apartmentGalleryAlt),
      'apartament1202.html',
    ),
    source: source('apartament1202.html', 'img/main/3.png', 'img/apartament img3', [
      text('Каталог указывает корпус 3, а подробная страница объекта указывает только дом 2.', 'The catalog includes building 3, while the detail page lists only house 2.'),
    ]),
  },
  {
    slug: 'altufyevskoe-2-apt-4',
    legacyFilename: 'apartament1204.html',
    catalogOrder: 4,
    catalog: {
      name: altufyevoName,
      type: euroThreeRoomType,
      address: text('Москва, Алтуфьевское шоссе, дом 2', 'Moscow, Altufyevskoye Shosse 2'),
      shortDescription: altufyevoCatalogDescription,
      price: exactPrice(7000),
      cover: createCover('altufyevskoe-2-apt-4', 'img/main/4.png', 'png', apartmentCoverAlt),
    },
    detail: standardApartmentDetail(
      altufyevoName,
      text('Москва, Алтуфьевское шоссе дом 2 кв. 4', 'Moscow, Altufyevskoye Shosse 2, apt. 4'),
      apartmentDetailDescription,
      exactPrice(7000),
      createGallery('altufyevskoe-2-apt-4', 'img/apartament img 4', 8, apartmentGalleryAlt),
      'apartament1204.html',
    ),
    source: source('apartament1204.html', 'img/main/4.png', 'img/apartament img 4'),
  },
  {
    slug: 'altufyevskoe-2-apt-5',
    legacyFilename: 'apartament1206.html',
    catalogOrder: 5,
    catalog: {
      name: altufyevoName,
      type: euroTwoRoomType,
      address: text('Москва, Алтуфьевское шоссе, дом 2', 'Moscow, Altufyevskoye Shosse 2'),
      shortDescription: altufyevoCatalogDescription,
      price: exactPrice(6000),
      cover: createCover('altufyevskoe-2-apt-5', 'img/main/5.png', 'png', apartmentCoverAlt),
    },
    detail: standardApartmentDetail(
      altufyevoName,
      text('Москва, Алтуфьевское шоссе дом 2 кв. 5', 'Moscow, Altufyevskoye Shosse 2, apt. 5'),
      apartmentDetailDescription,
      exactPrice(6000),
      createGallery('altufyevskoe-2-apt-5', 'img/apartament img 5', 10, apartmentGalleryAlt),
      'apartament1206.html',
    ),
    source: source('apartament1206.html', 'img/main/5.png', 'img/apartament img 5'),
  },
  {
    slug: 'dmitrovskoe-107-apt-6',
    legacyFilename: 'apartament759.html',
    catalogOrder: 6,
    catalog: {
      name: letniySadName,
      type: studioType,
      address: text('Москва, Дмитровское шоссе, дом 107, корпус 3', 'Moscow, Dmitrovskoe Shosse 107, building 3'),
      shortDescription: studioCatalogDescription,
      price: exactPrice(5000),
      cover: createCover('dmitrovskoe-107-apt-6', 'img/main/6.png', 'png', studioCoverAlt),
    },
    detail: standardApartmentDetail(
      letniySadName,
      text('Москва, Дмитровское шоссе д 107 корпус 3 кв. 6', 'Moscow, Dmitrovskoe Shosse 107, building 3, apt. 6'),
      studioDetailDescription,
      exactPrice(5000),
      createGallery('dmitrovskoe-107-apt-6', 'img/apartament img 6', 6, studioGalleryAlt),
      'apartament759.html',
    ),
    source: source('apartament759.html', 'img/main/6.png', 'img/apartament img 6'),
  },
  {
    slug: 'dmitrovskoe-107-apt-7',
    legacyFilename: 'ap.html',
    catalogOrder: 7,
    catalog: {
      name: letniySadName,
      type: studioType,
      address: text('Москва, Дмитровское шоссе, дом 107, корпус 3', 'Moscow, Dmitrovskoe Shosse 107, building 3'),
      shortDescription: studioCatalogDescription,
      price: exactPrice(5000),
      cover: createCover('dmitrovskoe-107-apt-7', 'img/main/7.png', 'png', studioCoverAlt),
    },
    detail: standardApartmentDetail(
      letniySadName,
      text('Москва, Дмитровское шоссе, дом 107, корпус 3, кв. 7', 'Moscow, Dmitrovskoe Shosse 107, building 3, apt. 7'),
      studioDetailDescription,
      exactPrice(5000),
      createGallery('dmitrovskoe-107-apt-7', 'img/apartament img 7', 6, studioGalleryAlt),
      'ap.html',
    ),
    source: source('ap.html', 'img/main/7.png', 'img/apartament img 7'),
  },
  {
    slug: 'dmitrovskoe-107-apt-8',
    legacyFilename: 'apartament794.html',
    catalogOrder: 8,
    catalog: {
      name: letniySadName,
      type: studioType,
      address: text('Москва, Дмитровское шоссе, дом 107, корпус 3', 'Moscow, Dmitrovskoe Shosse 107, building 3'),
      shortDescription: studioCatalogDescription,
      price: exactPrice(5000),
      cover: createCover('dmitrovskoe-107-apt-8', 'img/main/8.png', 'png', studioCoverAlt),
    },
    detail: standardApartmentDetail(
      letniySadName,
      text('Москва, Дмитровское шоссе д 107 корпус 3 кв. 8', 'Moscow, Dmitrovskoe Shosse 107, building 3, apt. 8'),
      studioDetailDescription,
      exactPrice(5000),
      createGallery('dmitrovskoe-107-apt-8', 'img/apartament img8', 7, studioGalleryAlt),
      'apartament794.html',
    ),
    source: source('apartament794.html', 'img/main/8.png', 'img/apartament img8'),
  },
  {
    slug: 'beskudnikovsky-31-apt-9',
    legacyFilename: 'apartament230.html',
    catalogOrder: 9,
    catalog: {
      name: beskudnikovskyName,
      type: oneRoomType,
      address: text('Москва, Бескудниковский бульвар, дом 31', 'Moscow, Beskudnikovsky Boulevard 31'),
      shortDescription: apartmentCatalogDescription,
      price: exactPrice(5000),
      cover: createCover('beskudnikovsky-31-apt-9', 'img/main/9.png', 'png', apartmentCoverAlt),
    },
    detail: standardApartmentDetail(
      beskudnikovskyName,
      text('Москва, Бескудниковский бульвар, дом 31, кв. 9', 'Moscow, Beskudnikovsky Boulevard 31, apt. 9'),
      apartmentDetailDescription,
      exactPrice(5000),
      createGallery('beskudnikovsky-31-apt-9', 'img/apartament img 9', 6, apartmentGalleryAlt),
      'apartament230.html',
    ),
    source: source('apartament230.html', 'img/main/9.png', 'img/apartament img 9', [
      text('В кратком описании страницы объекта упоминается метро «Владыкино», а инфраструктурный раздел указывает станции «Селигерская» и «Верхние Лихоборы».', 'The detail page summary mentions Vladykino metro, while its infrastructure section names Seligerskaya and Verkhnie Likhobory.'),
    ]),
  },
  {
    slug: 'beskudnikovsky-52-apt-10',
    legacyFilename: 'apartament170.html',
    catalogOrder: 10,
    catalog: {
      name: beskudnikovskyName,
      type: oneRoomType,
      address: text('Москва, Бескудниковский бульвар, дом 52', 'Moscow, Beskudnikovsky Boulevard 52'),
      shortDescription: apartmentCatalogDescription,
      price: exactPrice(7000),
      cover: createCover('beskudnikovsky-52-apt-10', 'img/main/10.png', 'png', apartmentCoverAlt),
    },
    detail: standardApartmentDetail(
      beskudnikovskyName,
      text('Москва, Бескудниковский бульвар, дом 52, кв. 10', 'Moscow, Beskudnikovsky Boulevard 52, apt. 10'),
      apartmentDetailDescription,
      exactPrice(7000),
      createGallery('beskudnikovsky-52-apt-10', 'img/apartament img 10', 11, apartmentGalleryAlt),
      'apartament170.html',
    ),
    source: source('apartament170.html', 'img/main/10.png', 'img/apartament img 10', [
      text('Каталожный тип и заголовок страницы объекта используют разные языковые варианты; краткое описание страницы объекта также упоминает метро «Владыкино».', 'The catalog type and detail heading use different language variants; the detail page summary also mentions Vladykino metro.'),
    ]),
  },
  {
    slug: 'beskudnikovsky-58-apt-11',
    legacyFilename: 'apartament58-230.html',
    catalogOrder: 11,
    catalog: {
      name: beskudnikovskyName,
      type: twoRoomType,
      address: text('Бескудниковский бульвар, дом 58, корпус 3', 'Beskudnikovsky Boulevard 58, building 3'),
      shortDescription: apartmentCatalogDescription,
      price: exactPrice(8000),
      cover: createCover('beskudnikovsky-58-apt-11', 'img/main/11.png', 'png', apartmentCoverAlt),
    },
    detail: standardApartmentDetail(
      beskudnikovskyName,
      text('Бескудниковский бульвар, дом 58, корпус 3, кв. 11', 'Beskudnikovsky Boulevard 58, building 3, apt. 11'),
      apartmentDetailDescription,
      fromPrice(8000),
      createGallery('beskudnikovsky-58-apt-11', 'img/apartament img 11', 11, apartmentGalleryAlt),
      'apartament58-230.html',
    ),
    source: source('apartament58-230.html', 'img/main/11.png', 'img/apartament img 11', [
      text('Каталог показывает точную цену 8 000 ₽, а подробная страница объекта использует режим «от 8 000 ₽». В кратком описании страницы объекта упоминается метро «Владыкино», а инфраструктурный раздел указывает станции «Селигерская» и «Верхние Лихоборы».', 'The catalog shows an exact price of 8,000 RUB, while the detail page uses the "from 8,000 RUB" mode. The detail page summary mentions Vladykino metro, while its infrastructure section names Seligerskaya and Verkhnie Likhobory.'),
    ]),
  },
  {
    slug: 'mitino-aframe',
    legacyFilename: 'apartament12.html',
    catalogOrder: 12,
    catalog: {
      name: aframeType,
      type: aframeType,
      address: text('Московская область, деревня Митино, 10Б', 'Moscow region, Mitino village, 10B'),
      shortDescription: aframeCatalogDescription,
      price: fromPrice(8000),
      cover: createCover('mitino-aframe', 'img/main/12.png', 'png', aframeCoverAlt),
    },
    detail: aframeDetail(
      createGallery('mitino-aframe', 'img/apartament12', 18, aframeGalleryAlt),
      'apartament12.html',
    ),
    source: source('apartament12.html', 'img/main/12.png', 'img/apartament12', [
      text('Каталог указывает адрес с номером 10Б, а подробная страница объекта указывает только деревню Митино. В последнем правиле дома в исходнике присутствует слитный фрагмент текста.', 'The catalog includes 10B in the address, while the detail page lists only Mitino village. The source contains a concatenated text fragment in the final house rule.'),
    ]),
  },
] as const satisfies readonly ApartmentRecord[];
