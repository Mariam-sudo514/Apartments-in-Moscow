import type {
  ApartmentDetailData,
  ApartmentGalleryImage,
  ApartmentMapData,
  ApartmentPrice,
  ApartmentRecord,
  ApartmentSection,
  ApartmentSource,
  LocalizedText,
} from '@/types/apartment';

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

const section = (
  title: LocalizedText,
  paragraphs: readonly LocalizedText[] = [],
  items: readonly LocalizedText[] = [],
): ApartmentSection => ({ title, paragraphs, items });

const map = (constructorId: string): ApartmentMapData => ({
  provider: 'yandex',
  embedUrl: `https://yandex.ru/map-widget/v1/?um=constructor%3A${constructorId}&source=constructor`,
  title: text('Карта расположения апартаментов', 'Apartment location map'),
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

const commonApartmentRules: readonly LocalizedText[] = [
  text('Заселение после 23:00 по предварительной договорённости и при 100% предоплате', 'Check-in after 11:00 PM by prior arrangement and 100% prepayment'),
  text('Оплата производится в размере 100% в течение 10 минут после заселения', 'Payment is made 100% within 10 minutes after check-in'),
  text('Бесконтактное заселение 24/7', 'Contactless check-in 24/7'),
  text('Гости должны быть старше 23 лет и иметь действующий паспорт', 'Guests must be 23 years or older with a valid passport'),
  text('Заселение гостей от 18 до 23 лет возможно только по согласованию с менеджером и не более чем для 2 человек', 'Check-in for guests aged 18 to 23 is only by agreement with the manager and limited to no more than 2 people'),
  text('Проживание с детьми разрешено. Заселение гостей младше 18 лет возможно только вместе с родителями при наличии документов, подтверждающих родство', 'Staying with children is allowed. Check-in for guests under 18 is only allowed when staying with parents with documented proof of relationship'),
  text('Курение в апартаментах запрещено', 'Smoking in the apartment is prohibited'),
  text('Проживание с домашними животными не разрешено', 'Pets are not allowed'),
  text('Проведение шумных мероприятий в апартаментах запрещено', 'No noisy events are allowed in the apartment'),
  text('Раннее заселение и поздний выезд возможны по договорённости за дополнительную плату и при наличии свободных мест', 'Early check-in and late check-out are possible by arrangement with additional payment and subject to availability'),
  text('Гости, не указанные в форме бронирования, не могут проживать в апартаментах без согласования с менеджером', 'Guests not listed in the booking form are not allowed to stay in the apartment without manager approval'),
  text('Наша компания не оказывает гостиничные услуги, поэтому постельное бельё сушится непосредственно в апартаментах', 'Our company does not provide hotel services, so bed linen is dried directly in the apartment'),
];

const aframeRules: readonly LocalizedText[] = [
  ...commonApartmentRules.slice(0, 6),
  text('Курение в доме запрещено', 'Smoking in the house is prohibited'),
  text('Проживание с домашними животными не разрешено', 'Pets are not allowed'),
  text('Проведение шумных мероприятий в доме запрещено', 'No noisy events are allowed in the house'),
  text('Раннее заселение и поздний выезд возможны по договорённости за дополнительную плату и при наличии свободных мест', 'Early check-in and late check-out are possible by arrangement with additional payment and subject to availability'),
  text('Гости, не указанные в форме бронирования, не могут проживать в доме без согласования с менеджером', 'Guests not listed in the booking form are not allowed to stay in the house without manager approval'),
  text('Наша компания не оказывает гостиничные услуги, поэтому постельное бельё сушится непосредственно в доме', 'Our company does not provide hotel services, so bed linen is dried directly in the housewithout manager approval'),
];

const commonAmenities: readonly LocalizedText[] = [
  text('Стиральная машина', 'Washing machine'),
  text('Можно с детьми', 'Children allowed'),
  text('Холодильник', 'Refrigerator'),
  text('Микроволновая печь', 'Microwave'),
  text('Всё необходимое для ванной комнаты', 'Bathroom essentials'),
  text('Wi-Fi', 'Wi-Fi Internet'),
  text('Кухонная плита', 'Kitchen stove'),
  text('Утюг с гладильной доской', 'Iron with ironing board'),
  text('Телевизор', 'Television'),
  text('Кондиционер', 'Air conditioner'),
];

const accommodationItems: readonly LocalizedText[] = [
  text('Двуспальная кровать (140 × 200 см)', 'Double bed (140*200 cm)'),
  text('Двуспальный диван', 'Double sofa'),
  text('Шкаф для одежды', 'Wardrobe for clothes'),
  text('Кондиционер, Wi-Fi, Smart TV', 'Air conditioner, Wi-Fi, Smart TV'),
  text('Гладильная доска, утюг, сушилка', 'Ironing board, iron, drying rack'),
  text('Свежее качественное постельное бельё и комплект мягких полотенец', 'Fresh high-quality bed linen, set of soft towels'),
];

const kitchenItems: readonly LocalizedText[] = [
  text('Плита, микроволновая печь, духовка, чайник, холодильник', 'Stove, microwave, oven, kettle, refrigerator'),
  text('Набор посуды и все необходимые принадлежности для приготовления пищи', 'Set of dishes and all necessary utensils for cooking'),
];

const bathroomItems: readonly LocalizedText[] = [
  text('Душ, стиральная машина, фен', 'Shower, washing machine, hair dryer'),
  text('Мыло, шампунь, гель для душа', 'Soap, shampoo, shower gel'),
  text('Туалетные принадлежности и средства для уборки', 'Toiletries and cleaning products'),
];

const letniySadSections = (forFourPeople: boolean): readonly ApartmentSection[] => [
  section(
    letniySadName,
    [text(
      'Рядом с комплексом есть автобусные остановки, ближайшая станция метро «Селигерская» находится в 15 минутах ходьбы, а до станции метро «Яхромская» можно дойти за три минуты.',
      'There are bus stops near the complex, and the nearest metro station "Seliger" is a 15-minute walk away. The "Yakhromskaya" metro station is just a three-minute walk.',
    )],
  ),
  section(
    text('Инфраструктура комплекса', 'Complex infrastructure'),
    [text(
      'В жилом комплексе «Летний сад» есть собственный трёхуровневый торгово-развлекательный центр с магазинами, кафе и ресторанами. На первых этажах домов открыты коммерческие помещения:',
      'The "Letniy Sad" residential complex has its own three-level shopping and entertainment center with shops, cafes, and restaurants. Commercial premises are open on the ground floors of the buildings:',
    )],
    [
      text('Продуктовые магазины: «Мираторг», «Дикси»', 'Grocery stores: "Miratorg", "Dixy"'),
      text('Кафе и рестораны: «Шашлык House», Don Donerov, Donna Maria', 'Cafes and restaurants: "Shashlyk House", Don Donerov, Donna Maria'),
      text('Бьюти-заведения: парикмахерская «MOS-Strizhka», салон красоты 4hands, nail-студия Happy Place Manicure', 'Beauty establishments: hair salon "MOS-Strizhka", beauty salon 4hands, nail studio Happy Place Manicure'),
      text('Медицинские компании: аптека DocPharma, глазная клиника Vista, ветеринарная клиника «Биовет»', 'Medical companies: DocPharma pharmacy, Vista eye clinic, veterinary clinic "Biovet"'),
    ],
  ),
  section(
    forFourPeople
      ? text('В апартаментах есть всё необходимое для комфортного проживания 4 человек:', 'The apartment has everything necessary for a comfortable stay for 4 people:')
      : text('В апартаментах есть всё необходимое для комфортного проживания', 'The apartment has everything necessary for a comfortable stay'),
    [],
    accommodationItems,
  ),
  section(text('Кухня:', 'Kitchen:'), [], kitchenItems),
  section(text('Ванная комната:', 'Bathroom:'), [], bathroomItems),
];

const altufyevoSections: readonly ApartmentSection[] = [
  section(
    altufyevoName,
    [text(
      'В комплексе представлены многосекционные дома разной этажности. Квартиры сдаются с готовой отделкой. На территории ЖК созданы дворы без машин, с детскими и спортивными площадками, а также местами для отдыха. Предусмотрен подземный паркинг.',
      'The complex consists of multi-section buildings of different heights. The apartments are delivered with finished interiors. The grounds include car-free courtyards with children\'s and sports areas and recreation spaces. Underground parking is available.',
    )],
  ),
  section(
    text('Инфраструктура комплекса', 'Complex infrastructure'),
    [text(
      'Проект предусматривает развитую внутреннюю и внешнюю инфраструктуру. В шаговой доступности расположены магазины, детские сады и школы. Комплекс находится недалеко от метро «Алтуфьево». Также рядом есть остановки общественного транспорта, что обеспечивает удобное сообщение с центром города.',
      'The project provides developed internal and external infrastructure. Shops, kindergartens, and schools are within walking distance. The complex is located near the Altufyevo metro station. Public transport stops nearby provide convenient connections to the city center.',
    )],
  ),
  section(text('В апартаментах есть всё необходимое для комфортного проживания', 'The apartment has everything necessary for a comfortable stay'), [], accommodationItems),
  section(text('Кухня:', 'Kitchen:'), [], kitchenItems),
  section(text('Ванная комната:', 'Bathroom:'), [], bathroomItems),
];

const beskudnikovskySections: readonly ApartmentSection[] = [
  section(
    beskudnikovskyName,
    [text(
      'Жилой комплекс комфорт-класса, предлагающий различные варианты квартир с отделкой.',
      'A comfort-class residential complex offering different apartment layouts with finished interiors.',
    )],
  ),
  section(
    text('Инфраструктура комплекса', 'Complex infrastructure'),
    [text(
      'В шаговой доступности находятся школы, в том числе адаптированная для детей с ОВЗ, детские сады, магазины, а также ближайшие станции метро «Селигерская» и «Верхние Лихоборы».',
      'Within walking distance are schools, including one adapted for children with disabilities, kindergartens, shops, and the nearby Seligerskaya and Verkhnie Likhobory metro stations.',
    )],
  ),
  section(text('В апартаментах есть всё необходимое для комфортного проживания', 'The apartment has everything necessary for a comfortable stay'), [], accommodationItems),
  section(text('Кухня:', 'Kitchen:'), [], kitchenItems),
  section(text('Ванная комната:', 'Bathroom:'), [], bathroomItems),
];

const aframeSections: readonly ApartmentSection[] = [
  section(
    text('Стильный A-frame дом', 'Stylish A-frame house'),
    [text(
      'Стильный A-frame дом площадью 81 м² с панорамными окнами и выходом к лесу расположен на участке площадью 30 соток.',
      'Stylish 81 m² A-frame house with panoramic windows and access to the forest, located on a 30-acre plot',
    )],
  ),
  section(
    text('Каждая деталь дома создана для комфортного и уютного отдыха:', 'Every detail in the house is designed for your comfortable and cozy stay:'),
    [],
    [
      text('Кухня оборудована техникой и посудой для приготовления и сервировки', 'Kitchen equipped with appliances and cookware for cooking and serving'),
      text('Кондиционер', 'Air conditioner'),
      text('Smart TV и музыкальная система', 'Smart TV, music system'),
      text('Комфортная ванная комната с душевой кабиной и средствами гигиены', 'Comfortable bathroom with shower cabin and hygiene essentials'),
      text('Wi-Fi', 'Wi-Fi'),
      text('Терраса со стульями и столом', 'Terrace with chairs and a table'),
      text('Полностью оборудованная зона барбекю с крытой беседкой', 'Fully equipped barbecue area with a covered gazebo'),
      text('Парковка на территории', 'Parking on the premises'),
      text('Комфортное размещение группы от 2 до 6 человек: отдельная спальня на первом этаже, ортопедический матрас на втором этаже и раскладной двуспальный диван на первом этаже', 'Comfortable accommodation for a group of 2 to 6 people (separate bedroom on the first floor, orthopedic mattress on the second floor, and a fold-out double sofa on the first floor).'),
      text('Постельное бельё и полотенца', 'Bed linen and towels'),
    ],
  ),
  section(
    text('При бронировании вы получаете:', 'When you book, you get:'),
    [],
    [
      text('Уютный интерьер, одинаково комфортный для романтических выходных и встреч с друзьями', 'Cozy interior, equally comfortable for romantic weekends or gatherings with friends'),
      text('Тёплая купель под открытым небом — удовольствие для тела и души', 'Heated open tub — delight for body and soul'),
      text('Терраса и зона гриля', 'Terrace and grill area'),
      text('Атмосферные вечера на закате под уютными пледами', 'Atmospheric evenings at sunset under cozy blankets'),
      text('Чистота и забота в каждой детали', 'Cleanliness and care in every detail'),
    ],
  ),
  section(
    text('Стоимость для двух гостей', 'Price for double occupancy'),
    [],
    [
      text('Пн–Чт, Вс — 8 000 ₽ за ночь (минимальное бронирование — 2 ночи)', 'Mon–Thu, Sun 8,000 RUB/night (minimum 2-night booking)'),
      text('Пт–Сб — 10 000 ₽ за ночь (минимальное бронирование — 2 ночи)', 'Fri–Sat 10,000 RUB/night (minimum 2-night booking)'),
    ],
  ),
  section(
    text('Дополнительная информация', 'Additional information'),
    [],
    [
      text('Бронирование на 1 день возможно при наличии свободных дат, но стоимость увеличивается на плату за уборку и 1 500 ₽', 'Booking for 1 day is possible if dates are available, but the price will increase by the cleaning fee + 1,500 RUB'),
      text('Дополнительный гость — 1 000 ₽ за ночь', 'Additional guest +1,000 RUB/night'),
      text('Проживание с собакой возможно, условия обсуждаются отдельно', 'Accommodation with a dog is possible and discussed separately'),
      text('Депозит 5 000 ₽ возвращается в течение 24 часов после осмотра дома', 'Deposit of 5,000 RUB is returned within 24 hours after house inspection'),
      text('Купель оплачивается отдельно', 'Tub is paid for separately'),
      text('Раннее заселение возможно за дополнительную плату', 'Early check-in is possible for an additional fee'),
    ],
  ),
];

const standardApartmentDetail = (
  title: LocalizedText,
  address: LocalizedText,
  description: LocalizedText,
  sections: readonly ApartmentSection[],
  price: ApartmentPrice,
  gallery: readonly ApartmentGalleryImage[],
  mapData: ApartmentMapData,
): ApartmentDetailData => ({
  title,
  address,
  description,
  sections,
  rules: commonApartmentRules,
  checkIn: text('14:00', '2:00 PM'),
  checkOut: text('12:00', '12:00 PM'),
  amenities: commonAmenities,
  price,
  gallery,
  map: mapData,
});

const aframeDetail = (
  gallery: readonly ApartmentGalleryImage[],
  mapData: ApartmentMapData,
): ApartmentDetailData => ({
  title: text('Стильный A-frame дом', 'Stylish A-frame house'),
  address: text('Московская область, деревня Митино', 'Moscow region, Mitino village'),
  description: aframeDetailDescription,
  sections: aframeSections,
  rules: aframeRules,
  checkIn: text('15:00', '3:00 PM'),
  checkOut: text('12:00', '12:00 PM'),
  amenities: [],
  price: fromPrice(8000),
  gallery,
  map: mapData,
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
      letniySadSections(true),
      exactPrice(5000),
      createGallery('dmitrovskoe-107-apt-1', 'img/apartament img', 11, studioGalleryAlt),
      map('a0d6d7a7ab992d6813d490f1f8d6b9993fa918eeee8dd176e41c049cf62eeaf4'),
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
      letniySadSections(true),
      exactPrice(5000),
      createGallery('dmitrovskoe-107-apt-2', 'img/apartament img2', 6, studioGalleryAlt),
      map('a0d6d7a7ab992d6813d490f1f8d6b9993fa918eeee8dd176e41c049cf62eeaf4'),
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
      altufyevoSections,
      exactPrice(7000),
      createGallery('altufyevskoe-2-apt-3', 'img/apartament img3', 8, apartmentGalleryAlt),
      map('ae8b58555a358cf6078d4945941bb53b325c050f189252380a345adee21357a6'),
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
      altufyevoSections,
      exactPrice(7000),
      createGallery('altufyevskoe-2-apt-4', 'img/apartament img 4', 8, apartmentGalleryAlt),
      map('ae8b58555a358cf6078d4945941bb53b325c050f189252380a345adee21357a6'),
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
      altufyevoSections,
      exactPrice(6000),
      createGallery('altufyevskoe-2-apt-5', 'img/apartament img 5', 10, apartmentGalleryAlt),
      map('ae8b58555a358cf6078d4945941bb53b325c050f189252380a345adee21357a6'),
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
      letniySadSections(false),
      exactPrice(5000),
      createGallery('dmitrovskoe-107-apt-6', 'img/apartament img 6', 6, studioGalleryAlt),
      map('a0d6d7a7ab992d6813d490f1f8d6b9993fa918eeee8dd176e41c049cf62eeaf4'),
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
      letniySadSections(false),
      exactPrice(5000),
      createGallery('dmitrovskoe-107-apt-7', 'img/apartament img 7', 6, studioGalleryAlt),
      map('a0d6d7a7ab992d6813d490f1f8d6b9993fa918eeee8dd176e41c049cf62eeaf4'),
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
      letniySadSections(false),
      exactPrice(5000),
      createGallery('dmitrovskoe-107-apt-8', 'img/apartament img8', 7, studioGalleryAlt),
      map('a0d6d7a7ab992d6813d490f1f8d6b9993fa918eeee8dd176e41c049cf62eeaf4'),
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
      text('Москва, Бескудниковский бульвар, дом 31, кв. 9', 'Moscow, Beskudnikovsky Boulevard 31 кв. 9'),
      apartmentDetailDescription,
      beskudnikovskySections,
      exactPrice(5000),
      createGallery('beskudnikovsky-31-apt-9', 'img/apartament img 9', 6, apartmentGalleryAlt),
      map('55259cc10a1f0111c5d7f3752591c99a82d1357294bf35d8a572ff78b23d59fb'),
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
      text('Москва, Бескудниковский бульвар, дом 52, кв. 10', 'Moscow, Beskudnikovsky Boulevard 52 кв. 10'),
      apartmentDetailDescription,
      beskudnikovskySections,
      exactPrice(7000),
      createGallery('beskudnikovsky-52-apt-10', 'img/apartament img 10', 11, apartmentGalleryAlt),
      map('484ee25120c155a142fed60c56e722fb53d1ea67b3f53ec3f11d1a0933cb79ef'),
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
      text('Бескудниковский бульвар, дом 58, корпус 3, кв. 11', 'Beskudnikovsky Boulevard 58, building 3 кв. 11'),
      apartmentDetailDescription,
      beskudnikovskySections,
      fromPrice(8000),
      createGallery('beskudnikovsky-58-apt-11', 'img/apartament img 11', 11, apartmentGalleryAlt),
      map('8e831140323d4698f9302bc09f4316f1292edeff989975b8d75c52be1cc08ae6'),
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
      map('cda043ca30d69e08e12dc489930484e6e7da6b28f83ff870f7af9cc6c8f5269a'),
    ),
    source: source('apartament12.html', 'img/main/12.png', 'img/apartament12', [
      text('Каталог указывает адрес с номером 10Б, а подробная страница объекта указывает только деревню Митино. В последнем правиле дома в исходнике присутствует слитный фрагмент текста.', 'The catalog includes 10B in the address, while the detail page lists only Mitino village. The source contains a concatenated text fragment in the final house rule.'),
    ]),
  },
] as const satisfies readonly ApartmentRecord[];
