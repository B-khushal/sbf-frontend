export const FLORIST_BUSINESS_ID = 'https://sbflorist.in/#business';
export const FLORIST_BUSINESS_URL = 'https://sbflorist.in/';
export const FLORIST_BUSINESS_IMAGE = 'https://sbflorist.in/images/logo_final.png';

export const FLORIST_LOCAL_BUSINESS_SCHEMA = {
  '@context': 'https://schema.org',
  '@type': 'Florist',
  '@id': FLORIST_BUSINESS_ID,
  name: 'Spring Blossoms Florist',
  url: FLORIST_BUSINESS_URL,
  telephone: '+919949683222',
  image: FLORIST_BUSINESS_IMAGE,
  logo: FLORIST_BUSINESS_IMAGE,
  description:
    'Spring Blossoms Florist offers flower bouquets, floral arrangements and gifts for birthdays, anniversaries, celebrations and other special occasions.',
  address: {
    '@type': 'PostalAddress',
    streetAddress:
      'Pillar Number 32, Najam Centre, A/B, Door No. 12-2, 786, Rethi Bowli Road, Mehdipatnam',
    addressLocality: 'Hyderabad',
    addressRegion: 'Telangana',
    postalCode: '500006',
    addressCountry: 'IN',
  },
  geo: {
    '@type': 'GeoCoordinates',
    latitude: 17.395077,
    longitude: 78.433996,
  },
  hasMap: 'https://www.google.com/maps?cid=8660521669298042697',
  sameAs: ['https://www.google.com/maps?cid=8660521669298042697'],
  openingHoursSpecification: [
    {
      '@type': 'OpeningHoursSpecification',
      dayOfWeek: [
        'https://schema.org/Monday',
        'https://schema.org/Tuesday',
        'https://schema.org/Wednesday',
        'https://schema.org/Thursday',
        'https://schema.org/Friday',
        'https://schema.org/Saturday',
        'https://schema.org/Sunday',
      ],
      opens: '08:00',
      closes: '23:00',
    },
  ],
};

export const WEBSITE_SCHEMA = {
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  '@id': 'https://sbflorist.in/#website',
  url: FLORIST_BUSINESS_URL,
  name: 'Spring Blossoms Florist',
  publisher: {
    '@id': FLORIST_BUSINESS_ID,
  },
  potentialAction: {
    '@type': 'SearchAction',
    target: 'https://sbflorist.in/shop?q={search_term_string}',
    'query-input': 'required name=search_term_string',
  },
};

export const HOME_FAQ_SCHEMA = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  '@id': 'https://sbflorist.in/#faq',
  mainEntity: [
    {
      '@type': 'Question',
      name: 'Do you offer same-day flower and cake delivery in Hyderabad and Secunderabad?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Yes! Spring Blossoms Florist provides same-day flower, cake, and gift delivery across both Hyderabad and Secunderabad. Place your order during business hours for doorstep delivery.',
      },
    },
    {
      '@type': 'Question',
      name: 'How do your delivery charges and time slots work?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Free Delivery on your 1st order for all new customers! Additionally, standard delivery is FREE on orders of ₹999 and above (₹150 for orders below ₹999). Midnight delivery is available between 11:00 PM and 11:59 PM.',
      },
    },
    {
      '@type': 'Question',
      name: 'Can I schedule a midnight flower delivery for birthdays or anniversaries?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Absolutely! Our Midnight Surprise Delivery slot operates between 11:00 PM and 11:59 PM to surprise your loved ones right as the clock strikes midnight.',
      },
    },
    {
      '@type': 'Question',
      name: 'Where is Spring Blossoms Florist located in Hyderabad?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Our flagship floral studio is located at Pillar Number 32, Najam Centre, A/B, Door No. 12-2, 786, Rethi Bowli Road, Mehdipatnam, Hyderabad, Telangana 500006. Direct support: +91 9949683222.',
      },
    },
  ],
};

export const HOME_PAGE_SCHEMAS = [
  FLORIST_LOCAL_BUSINESS_SCHEMA,
  WEBSITE_SCHEMA,
  HOME_FAQ_SCHEMA,
];

