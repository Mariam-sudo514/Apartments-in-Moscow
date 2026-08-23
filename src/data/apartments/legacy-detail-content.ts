import type {
  ApartmentDescriptionElement,
  ApartmentMapData,
  ApartmentMapLink,
  ApartmentRulesBlock,
  LocalizedText,
} from '@/types/apartment';

const text = (ru: string, en: string): LocalizedText => ({ru, en});

const heading = (
  level: 1 | 2,
  ru: string,
  en: string,
): ApartmentDescriptionElement => ({
  level,
  text: text(ru, en),
  type: 'heading',
});

const paragraph = (
  ru: string,
  en: string,
  variant: 'default' | 'infrastructure' | 'indented' = 'default',
): ApartmentDescriptionElement => ({
  text: text(ru, en),
  type: 'paragraph',
  ...(variant === 'default' ? {} : {variant}),
});

const list = (...items: LocalizedText[]): ApartmentDescriptionElement => ({
  items,
  type: 'list',
});

export const legacyCheckInIconPath =
  'M12.5 0C19.4036 0 25 5.59644 25 12.5C25 19.4036 19.4036 25 12.5 25C5.59644 25 0 19.4036 0 12.5C0 5.59644 5.59644 0 12.5 0ZM12.5 1.29297C6.3106 1.29297 1.29297 6.3106 1.29297 12.5C1.29297 18.6894 6.3106 23.707 12.5 23.707C18.6894 23.707 23.707 18.6894 23.707 12.5C23.707 6.3106 18.6894 1.29297 12.5 1.29297ZM13.0098 2.59863C18.2479 2.86408 22.4129 7.19594 22.4131 12.5L22.4004 13.0098C22.1349 18.2479 17.8041 22.4129 12.5 22.4131L11.9893 22.4004C6.92032 22.1431 2.85551 18.0788 2.59863 13.0098L2.58594 12.5C2.58608 7.02498 7.02498 2.58608 12.5 2.58594L13.0098 2.59863ZM12.5 3.44824C7.50108 3.44839 3.44839 7.50108 3.44824 12.5C3.44839 17.4989 7.50108 21.5516 12.5 21.5518C17.4989 21.5516 21.5516 17.4989 21.5518 12.5C21.5516 7.50108 17.4989 3.44839 12.5 3.44824ZM12.5 5.81934C12.8571 5.81934 13.1465 6.10874 13.1465 6.46582V13.2266L19.0508 14.0146C19.4047 14.0619 19.6536 14.3873 19.6064 14.7412C19.559 15.0948 19.2336 15.343 18.8799 15.2959L12.4141 14.4346L11.8535 14.3594V6.46582C11.8535 6.10874 12.1429 5.81934 12.5 5.81934Z';

export const legacyCheckOutIconPath =
  'M12.5 0C19.4036 0 25 5.59644 25 12.5C25 19.4036 19.4036 25 12.5 25C5.59644 25 0 19.4036 0 12.5C0 5.59644 5.59644 0 12.5 0ZM12.5 1.29297C6.3106 1.29297 1.29297 6.3106 1.29297 12.5C1.29297 18.6894 6.3106 23.707 12.5 23.707C18.6894 23.707 23.707 18.6894 23.707 12.5C23.707 6.3106 18.6894 1.29297 12.5 1.29297ZM13.0098 2.59863C18.2479 2.86408 22.4129 7.19594 22.4131 12.5L22.4004 13.0098C22.1349 18.2479 17.8041 22.4129 12.5 22.4131L11.9893 22.4004C6.92032 22.1431 2.85551 18.0788 2.59863 13.0098L2.58594 12.5C2.58608 7.02498 7.02498 2.58608 12.5 2.58594L13.0098 2.59863ZM12.5 3.0166C7.26303 3.01675 3.01675 7.26303 3.0166 12.5C3.01675 17.737 7.26303 21.9823 12.5 21.9824C17.737 21.9823 21.9823 17.737 21.9824 12.5C21.9823 7.26303 17.737 3.01675 12.5 3.0166ZM7.32227 8.14453C7.5855 7.90341 7.99412 7.92141 8.23535 8.18457L12.8174 13.1826L19.0508 14.0146C19.4046 14.0619 19.6536 14.3873 19.6064 14.7412C19.559 15.0948 19.2336 15.3439 18.8799 15.2969L12.415 14.4346L12.1816 14.4033L12.0234 14.2305L7.28223 9.05762C7.04114 8.79442 7.05921 8.38578 7.32227 8.14453Z';

const standardRules = [
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
] as const;

const houseRules = list(...standardRules);

const standardAmenities = [
  [
    text('Стиральная машина', 'Washing machine'),
    text('Можно с детьми', 'Children allowed'),
    text('Холодильник', 'Refrigerator'),
    text('Микроволновая печь', 'Microwave'),
    text('Всё необходимое для ванной комнаты', 'Bathroom essentials'),
  ],
  [
    text('Wi-Fi', 'Wi-Fi Internet'),
    text('Кухонная плита', 'Kitchen stove'),
    text('Утюг с гладильной доской', 'Iron with ironing board'),
    text('Телевизор', 'Television'),
    text('Кондиционер', 'Air conditioner'),
  ],
] as const;

const letniySadElements = (forFourPeople: boolean): readonly ApartmentDescriptionElement[] => [
  heading(1, 'Жилой комплекс "Летний сад"', 'Residential Complex "Letniy Sad"'),
  paragraph(
    'Рядом с комплексом есть автобусные остановки, ближайшая станция метро «Селигер» находится в 15 минутах ходьбы. До станции метро «Яхромская» — всего три минуты ходьбы.',
    'There are bus stops near the complex, and the nearest metro station "Seliger" is a 15-minute walk away. The "Yakhromskaya" metro station is just a three-minute walk.',
  ),
  heading(2, 'Инфраструктура комплекса', 'Complex infrastructure'),
  paragraph(
    'В жилом комплексе «Летний сад» есть собственный трёхуровневый торгово-развлекательный центр с магазинами, кафе и ресторанами. На первых этажах домов открыты коммерческие помещения:',
    'The "Letniy Sad" residential complex has its own three-level shopping and entertainment center with shops, cafes, and restaurants. Commercial premises are open on the ground floors of the buildings:',
    'infrastructure',
  ),
  list(
    text('Продуктовые магазины: «Мираторг», «Дикси»', 'Grocery stores: "Miratorg", "Dixy"'),
    text('Кафе и рестораны: «Шашлык House», Don Donerov, Donna Maria', 'Cafes and restaurants: "Shashlyk House", Don Donerov, Donna Maria'),
    text('Бьюти-заведения: парикмахерская «MOS-Strizhka», салон красоты 4hands, nail-студия Happy Place Manicure', 'Beauty establishments: hair salon "MOS-Strizhka", beauty salon 4hands, nail studio Happy Place Manicure'),
    text('Медицинские компании: аптека DocPharma, глазная клиника Vista, ветеринарная клиника «Биовет»', 'Medical companies: DocPharma pharmacy, Vista eye clinic, veterinary clinic "Biovet"'),
  ),
  heading(2, 'Правила проживания:', 'House rules:'),
  houseRules,
  heading(
    2,
    forFourPeople
      ? 'В апартаментах есть всё необходимое для комфортного проживания 4 человек:'
      : 'В апартаментах есть всё необходимое для комфортного проживания',
    forFourPeople
      ? 'The apartment has everything necessary for a comfortable stay for four people:'
      : 'The apartment has everything necessary for a comfortable stay',
  ),
  list(
    text('Двуспальная кровать (140*200 см)', 'Double bed (140*200 cm)'),
    text('Двуспальный диван', 'Double sofa'),
    text('Шкаф для одежды', 'Wardrobe for clothes'),
    text('Кондиционер, Wi-Fi, Smart TV', 'Air conditioner, Wi-Fi, Smart TV'),
    text('Гладильная доска, утюг, сушилка', 'Ironing board, iron, drying rack'),
    text('Свежее качественное постельное бельё и комплект мягких полотенец', 'Fresh high-quality bed linen, set of soft towels'),
  ),
  heading(2, 'Кухня:', 'Kitchen:'),
  list(
    text('Плита, микроволновая печь, духовка, чайник, холодильник', 'Stove, microwave, oven, kettle, refrigerator'),
    text('Набор посуды и все необходимые принадлежности для приготовления пищи', 'Set of dishes and all necessary utensils for cooking'),
  ),
  heading(2, 'Ванная комната:', 'Bathroom:'),
  list(
    text('Душ, стиральная машина, фен', 'Shower, washing machine, hair dryer'),
    text('Мыло, шампунь, гель для душа', 'Soap, shampoo, shower gel'),
    text('Туалетные принадлежности и средства для уборки', 'Toiletries and cleaning products'),
  ),
];

const altufyevoElements: readonly ApartmentDescriptionElement[] = [
  heading(1, 'ЖК "В Алтуфьево"', 'Residential Complex "V Altufyevo"'),
  paragraph(
    'В комплексе представлены многосекционные дома разной этажности. Квартиры сдаются с готовой отделкой. На территории ЖК созданы дворы без машин, с детскими и спортивными площадками, а также местами для отдыха. Предусмотрен подземный паркинг.',
    'The complex consists of multi-section buildings of different heights. The apartments are delivered with finished interiors. The grounds include car-free courtyards with children\'s and sports areas and recreation spaces. Underground parking is available.',
  ),
  heading(2, 'Инфраструктура комплекса', 'Complex infrastructure'),
  paragraph(
    'Проект предусматривает развитую внутреннюю и внешнюю инфраструктуру. В шаговой доступности расположены магазины, детские сады и школы. Комплекс находится недалеко от метро «Алтуфьево». Также рядом есть остановки общественного транспорта, что обеспечивает удобное сообщение с центром города.',
    'The project provides developed internal and external infrastructure. Shops, kindergartens, and schools are within walking distance. The complex is located near the Altufyevo metro station. Public transport stops nearby provide convenient connections to the city center.',
    'infrastructure',
  ),
  heading(2, 'Правила проживания:', 'House rules:'),
  houseRules,
  heading(2, 'В апартаментах есть всё необходимое для комфортного проживания', 'The apartment has everything necessary for a comfortable stay'),
  list(
    text('Двуспальная кровать (140*200 см)', 'Double bed (140*200 cm)'),
    text('Двуспальный диван', 'Double sofa'),
    text('Шкаф для одежды', 'Wardrobe for clothes'),
    text('Кондиционер, Wi-Fi, Smart TV', 'Air conditioner, Wi-Fi, Smart TV'),
    text('Гладильная доска, утюг, сушилка', 'Ironing board, iron, drying rack'),
    text('Свежее качественное постельное бельё и комплект мягких полотенец', 'Fresh high-quality bed linen, set of soft towels'),
  ),
  heading(2, 'Кухня:', 'Kitchen:'),
  list(
    text('Плита, микроволновая печь, духовка, чайник, холодильник', 'Stove, microwave, oven, kettle, refrigerator'),
    text('Набор посуды и все необходимые принадлежности для приготовления пищи', 'Set of dishes and all necessary utensils for cooking'),
  ),
  heading(2, 'Ванная комната:', 'Bathroom:'),
  list(
    text('Душ, стиральная машина, фен', 'Shower, washing machine, hair dryer'),
    text('Мыло, шампунь, гель для душа', 'Soap, shampoo, shower gel'),
    text('Туалетные принадлежности и средства для уборки', 'Toiletries and cleaning products'),
  ),
];

const beskudnikovskyElements: readonly ApartmentDescriptionElement[] = [
  heading(1, 'ЖК "Мой Адрес Бескудниковский"', 'Residential Complex "Moy Adres Beskudnikovsky"'),
  paragraph(
    'Жилой комплекс комфорт-класса, предлагающий различные варианты квартир с отделкой.',
    'A comfort-class residential complex offering different apartment layouts with finished interiors.',
  ),
  heading(2, 'Инфраструктура комплекса', 'Complex infrastructure'),
  paragraph(
    'В шаговой доступности находятся школы (в том числе адаптированная для детей с ОВЗ), детские сады, магазины, а также ближайшие станции метро «Селигерская» и «Верхние Лихоборы».',
    'Within walking distance are schools (including one adapted for children with disabilities), kindergartens, shops, and the nearby Seligerskaya and Verkhnie Likhobory metro stations.',
    'infrastructure',
  ),
  heading(2, 'Правила проживания:', 'House rules:'),
  houseRules,
  heading(2, 'В апартаментах есть всё необходимое для комфортного проживания', 'The apartment has everything necessary for a comfortable stay'),
  list(
    text('Двуспальная кровать (140*200 см)', 'Double bed (140*200 cm)'),
    text('Двуспальный диван', 'Double sofa'),
    text('Шкаф для одежды', 'Wardrobe for clothes'),
    text('Кондиционер, Wi-Fi, Smart TV', 'Air conditioner, Wi-Fi, Smart TV'),
    text('Гладильная доска, утюг, сушилка', 'Ironing board, iron, drying rack'),
    text('Свежее качественное постельное бельё и комплект мягких полотенец', 'Fresh high-quality bed linen, set of soft towels'),
  ),
  heading(2, 'Кухня:', 'Kitchen:'),
  list(
    text('Плита, микроволновая печь, духовка, чайник, холодильник', 'Stove, microwave, oven, kettle, refrigerator'),
    text('Набор посуды и все необходимые принадлежности для приготовления пищи', 'Set of dishes and all necessary utensils for cooking'),
  ),
  heading(2, 'Ванная комната:', 'Bathroom:'),
  list(
    text('Душ, стиральная машина, фен', 'Shower, washing machine, hair dryer'),
    text('Мыло, шампунь, гель для душа', 'Soap, shampoo, shower gel'),
    text('Туалетные принадлежности и средства для уборки', 'Toiletries and cleaning products'),
  ),
];

const aframeElements: readonly ApartmentDescriptionElement[] = [
  heading(1, 'Стильный A-frame дом', 'Stylish A-frame house'),
  paragraph(
    'Стильный A-frame дом площадью 81 м² с панорамными окнами и выходом к лесу расположен на участке площадью 30 соток.',
    'Stylish 81 m² A-frame house with panoramic windows and access to the forest, located on a 30-acre plot',
  ),
  heading(2, 'Правила проживания:', 'House rules:'),
  list(
    text('Заселение после 23:00 по предварительной договорённости и при 100% предоплате', 'Check-in after 11:00 PM by prior arrangement and 100% prepayment'),
    text('Оплата производится в размере 100% в течение 10 минут после заселения', 'Payment is made 100% within 10 minutes after check-in'),
    text('Бесконтактное заселение 24/7', 'Contactless check-in 24/7'),
    text('Гости должны быть старше 23 лет и иметь действующий паспорт', 'Guests must be 23 years or older with a valid passport'),
    text('Заселение гостей от 18 до 23 лет возможно только по согласованию с менеджером и не более чем для 2 человек', 'Check-in for guests aged 18 to 23 is only by agreement with the manager and limited to no more than 2 people'),
    text('Проживание с детьми разрешено. Заселение гостей младше 18 лет возможно только вместе с родителями при наличии документов, подтверждающих родство', 'Staying with children is allowed. Check-in for guests under 18 is only allowed when staying with parents with documented proof of relationship'),
    text('Курение в доме запрещено', 'Smoking in the house is prohibited'),
    text('Проживание с домашними животными не разрешено', 'Pets are not allowed'),
    text('Проведение шумных мероприятий в доме запрещено', 'No noisy events are allowed in the house'),
    text('Раннее заселение и поздний выезд возможны по договорённости за дополнительную плату и при наличии свободных мест', 'Early check-in and late check-out are possible by arrangement with additional payment and subject to availability'),
    text('Гости, не указанные в форме бронирования, не могут проживать в доме без согласования с менеджером', 'Guests not listed in the booking form are not allowed to stay in the house without manager approval'),
    text('Наша компания не оказывает гостиничные услуги, поэтому постельное бельё сушится непосредственно в доме без согласования с менеджером', 'Our company does not provide hotel services, so bed linen is dried directly in the housewithout manager approval'),
  ),
  heading(2, 'Каждая деталь дома создана для комфортного и уютного отдыха:', 'Every detail in the house is designed for your comfortable and cozy stay:'),
  list(
    text('Кухня оборудована техникой и посудой для приготовления и сервировки', 'Kitchen equipped with appliances and cookware for cooking and serving'),
    text('Кондиционер', 'Air conditioner'),
    text('Smart TV, музыкальная система', 'smart-tv, Music system'),
    text('Комфортная ванная комната с душевой кабиной и средствами гигиены', 'Comfortable bathroom with shower cabin and hygiene essentials'),
    text('Wi-Fi', 'wi-fi'),
    text('Терраса со стульями и столом', 'Terrace with chairs and a table'),
    text('Полностью оборудованная зона барбекю с крытой беседкой', 'Fully equipped barbecue area with a covered gazebo'),
    text('Парковка на территории', 'Parking on the premises'),
    text('Комфортное размещение группы от 2 до 6 человек (отдельная спальня на первом этаже, ортопедический матрас на втором этаже и раскладной двуспальный диван на первом этаже).', 'Comfortable accommodation for a group of 2 to 6 people (separate bedroom on the first floor, orthopedic mattress on the second floor, and a fold-out double sofa on the first floor).'),
    text('Постельное бельё и полотенца', 'Bed linen and towels'),
  ),
  heading(2, 'При бронировании вы получаете:', 'When you book, you get:'),
  list(
    text('Уютный интерьер, одинаково комфортный для романтических выходных и встреч с друзьями', 'Cozy interior, equally comfortable for romantic weekends or gatherings with friends'),
    text('Тёплая купель под открытым небом — удовольствие для тела и души', 'Heated open tub — delight for body and soul'),
    text('Терраса и зона гриля', 'Terrace and grill area'),
    text('Атмосферные вечера на закате под уютными пледами', 'Atmospheric evenings at sunset under cozy blankets'),
    text('Чистота и забота в каждой детали', 'Cleanliness and care in every detail'),
  ),
];

const standardRulesBlock = (
  checkInRu: string,
  checkInEn: string,
  checkOutRu: string,
  checkOutEn: string,
): ApartmentRulesBlock => ({
  elements: [],
  title: text('Правила заселения', 'Check-in rules'),
  timings: [
    {icon: 'checkIn', text: text(`Заселение в ${checkInRu}`, `Check-in at ${checkInEn}`)},
    {icon: 'checkOut', text: text(`Выезд в ${checkOutRu}`, `Check-out at ${checkOutEn}`)},
  ],
});

const aframeRulesBlock: ApartmentRulesBlock = {
  elements: [
    paragraph('Раннее заселение возможно за дополнительную плату', 'Early check-in is possible for an additional fee', 'indented'),
    heading(2, 'Стоимость для двух гостей', 'Price for double occupancy'),
    list(
      text('Пн–Чт, Вс 8 000 ₽/за ночь (минимальное бронирование — 2 ночи)', 'Mon–Thu, Sun 8,000 ₽/night (minimum 2-night booking)'),
      text('Пт–Сб 10 000 ₽/за ночь (минимальное бронирование — 2 ночи)', 'Fri–Sat 10,000 ₽/night (minimum 2-night booking)'),
    ),
    heading(2, 'Дополнительная информация', 'Additional information'),
    list(
      text('Бронирование на 1 день возможно при наличии свободных дат, но стоимость увеличивается на плату за уборку + 1 500 ₽', 'Booking for 1 day is possible if dates are available, but the price will increase by the cleaning fee + 1,500 ₽'),
      text('Дополнительный гость +1 000 ₽/за ночь', 'Additional guest +1,000 ₽/night'),
      text('Проживание с собакой возможно, условия обсуждаются отдельно', 'Accommodation with a dog is possible and discussed separately'),
      text('Депозит 5 000 ₽ возвращается в течение 24 часов после осмотра дома', 'Deposit of 5,000 ₽ is returned within 24 hours after house inspection'),
      text('Купель оплачивается отдельно', 'Tub is paid for separately'),
    ),
  ],
  title: text('Правила заселения', 'Check-in rules'),
  timings: [
    {icon: 'checkIn', text: text('Заселение с 15:00', 'Check-in from 3:00 PM')},
    {icon: 'checkOut', text: text('Выезд до 12:00', 'Check-out by 12:00 PM')},
  ],
};

const mapLink = (
  provider: ApartmentMapLink['provider'],
  href: string,
): ApartmentMapLink => ({
  href,
  label: text(
    provider === 'yandex' ? 'Открыть в Яндекс.Картах' : provider === 'google' ? 'Открыть в Google Maps' : 'Открыть в Apple Maps',
    provider === 'yandex' ? 'Open in Yandex.Maps' : provider === 'google' ? 'Open in Google Maps' : 'Open in Apple Maps',
  ),
  provider,
});

const map = (
  constructorId: string,
  links: readonly ApartmentMapLink[],
): ApartmentMapData => ({
  embedUrl: `https://yandex.ru/map-widget/v1/?um=constructor%3A${constructorId}&source=constructor`,
  links,
  provider: 'yandex',
  title: text('Карта расположения апартаментов', 'Apartment location map'),
});

const letniySadMap = map(
  'a0d6d7a7ab992d6813d490f1f8d6b9993fa918eeee8dd176e41c049cf62eeaf4',
  [
    mapLink('yandex', 'https://yandex.ru/maps/?ll=37.539734%2C55.879913&z=16&pt=37.539734,55.879913,pm2rdm'),
    mapLink('google', 'https://www.google.com/maps/search/?api=1&query=55.879913,37.539734'),
    mapLink('apple', 'http://maps.apple.com/?ll=55.879913,37.539734&q=Livhouse'),
  ],
);

const altufyevoMap = map(
  'ae8b58555a358cf6078d4945941bb53b325c050f189252380a345adee21357a6',
  [
    mapLink('yandex', 'https://yandex.ru/maps/?ll=37.586622%2C55.849326&z=16&pt=37.586622,55.849326,pm2rdm'),
    mapLink('google', 'https://www.google.com/maps/search/?api=1&query=55.849326,37.586622'),
    mapLink('apple', 'http://maps.apple.com/?ll=55.849326,37.586622&q=Livhouse'),
  ],
);

const beskudnikovsky31Map = map(
  '55259cc10a1f0111c5d7f3752591c99a82d1357294bf35d8a572ff78b23d59fb',
  [
    mapLink('yandex', 'https://yandex.ru/maps/?ll=37.552386%2C55.872382&z=16&pt=37.552386,55.872382,pm2rdm'),
    mapLink('google', 'https://www.google.com/maps/search/?api=1&query=55.872382,37.552386'),
    mapLink('apple', 'http://maps.apple.com/?ll=55.872382,37.552386&q=Livhouse'),
  ],
);

const beskudnikovsky52Map = map(
  '484ee25120c155a142fed60c56e722fb53d1ea67b3f53ec3f11d1a0933cb79ef',
  [
    mapLink('yandex', 'https://yandex.ru/maps/?ll=37.537839%2C55.873695&z=16&pt=37.537839,55.873695,pm2rdm'),
    mapLink('google', 'https://www.google.com/maps/search/?api=1&query=55.873695,37.537839'),
    mapLink('apple', 'http://maps.apple.com/?ll=55.873695,37.537839&q=Livhouse'),
  ],
);

const beskudnikovsky58Map = map(
  '8e831140323d4698f9302bc09f4316f1292edeff989975b8d75c52be1cc08ae6',
  [
    mapLink('yandex', 'https://yandex.ru/maps/?ll=37.536349%2C55.874592&z=16&pt=37.536349,55.874592,pm2rdm'),
    mapLink('google', 'https://www.google.com/maps/search/?api=1&query=55.874592,37.536349'),
    mapLink('apple', 'http://maps.apple.com/?ll=55.874592,37.536349&q=Livhouse'),
  ],
);

const mitinoMap = map(
  'cda043ca30d69e08e12dc489930484e6e7da6b28f83ff870f7af9cc6c8f5269a',
  [
    mapLink('yandex', 'https://yandex.ru/maps/?ll=38.308021%2C56.378259&z=16&pt=38.308021,56.378259,pm2rdm'),
    mapLink('google', 'https://www.google.com/maps/search/?api=1&query=56.378259,38.308021'),
    mapLink('apple', 'http://maps.apple.com/?ll=56.378259,38.308021&q=Livhouse'),
  ],
);

export type LegacyDetailContent = {
  readonly descriptionElements: readonly ApartmentDescriptionElement[];
  readonly rulesBlock: ApartmentRulesBlock;
  readonly amenityColumns: readonly (readonly LocalizedText[])[];
  readonly map: ApartmentMapData;
};

const standardContent = (
  descriptionElements: readonly ApartmentDescriptionElement[],
  mapData: ApartmentMapData,
): LegacyDetailContent => ({
  amenityColumns: standardAmenities,
  descriptionElements,
  map: mapData,
  rulesBlock: standardRulesBlock('14:00', '2:00 PM', '12:00', '12:00 PM'),
});

export const legacyDetailContentByFilename = {
  'apartament780.html': standardContent(letniySadElements(true), letniySadMap),
  'apartament755.html': standardContent(letniySadElements(true), letniySadMap),
  'apartament1202.html': standardContent(altufyevoElements, altufyevoMap),
  'apartament1204.html': standardContent(altufyevoElements, altufyevoMap),
  'apartament1206.html': standardContent(altufyevoElements, altufyevoMap),
  'apartament759.html': standardContent(letniySadElements(false), letniySadMap),
  'ap.html': standardContent(letniySadElements(false), letniySadMap),
  'apartament794.html': standardContent(letniySadElements(false), letniySadMap),
  'apartament230.html': standardContent(beskudnikovskyElements, beskudnikovsky31Map),
  'apartament170.html': standardContent(beskudnikovskyElements, beskudnikovsky52Map),
  'apartament58-230.html': standardContent(beskudnikovskyElements, beskudnikovsky58Map),
  'apartament12.html': {
    amenityColumns: [],
    descriptionElements: aframeElements,
    map: mitinoMap,
    rulesBlock: aframeRulesBlock,
  },
} as const satisfies Readonly<Record<string, LegacyDetailContent>>;
