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
  priceRange: '₹₹',
  image: FLORIST_BUSINESS_IMAGE,
  logo: FLORIST_BUSINESS_IMAGE,
  description:
    'Spring Blossoms Florist offers flower bouquets, floral arrangements, celebration cakes and gifts for birthdays, anniversaries, celebrations and other special occasions across Hyderabad and Secunderabad.',
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
  areaServed: [
    { '@type': 'City', name: 'Hyderabad' },
    { '@type': 'City', name: 'Secunderabad' },
  ],
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
      name: 'Do you offer same-day flower delivery in Hyderabad?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Yes! Spring Blossoms Florist provides same-day flower, cake, and gift delivery across Hyderabad and Secunderabad. Simply place your order during daytime hours and select your preferred delivery time slot at checkout.',
      },
    },
    {
      '@type': 'Question',
      name: 'Can I schedule midnight cake and flower delivery in Hyderabad?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Absolutely. Our Midnight Surprise Delivery slot (11:00 PM – 11:59 PM) is available for birthdays, anniversaries, and romantic surprises across all major localities in Hyderabad and Secunderabad.',
      },
    },
    {
      '@type': 'Question',
      name: 'What are the delivery charges across Hyderabad and Secunderabad?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'New customers enjoy Free Delivery on their 1st order! Additionally, standard delivery is FREE on all orders of ₹999 and above. Orders below ₹999 carry a nominal ₹150 delivery fee.',
      },
    },
    {
      '@type': 'Question',
      name: 'How do you keep flowers and cakes fresh during delivery?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Every bouquet is handcrafted using fresh-cut Dutch roses, lilies, orchids, and seasonal blooms shortly before dispatch from our Mehdipatnam studio. Cakes are sourced fresh and transported in temperature-controlled packaging.',
      },
    },
    {
      '@type': 'Question',
      name: 'Can I include a personalized message card with my gift?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Yes, every order includes a complimentary message card where you can add your custom note for the recipient during checkout.',
      },
    },
  ],
};

export const HOME_PAGE_SCHEMAS = [
  FLORIST_LOCAL_BUSINESS_SCHEMA,
  WEBSITE_SCHEMA,
  HOME_FAQ_SCHEMA,
];

