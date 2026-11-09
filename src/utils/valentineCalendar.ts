// Dynamic Valentine's Week Calendar Calculator for SBFlorist
// Calculates dynamic days, dates, and weekdays for the active or next upcoming Valentine season.

export interface ValentineWeekDay {
  id: string;
  name: string;
  dayNumber: number;
  dateString: string;
  year: number;
  weekday: string;
  formattedDate: string;
  keyword: string;
  secondaryKeyword: string;
  heading: string;
  description: string;
  icon: string;
  bannerImage: string;
  targetCategory: string;
}

export const getValentineWeekDays = (targetYear?: number): ValentineWeekDay[] => {
  const current = new Date();
  const currentYear = current.getFullYear();
  const currentMonth = current.getMonth(); // 0 = Jan, 1 = Feb
  const currentDate = current.getDate();

  // If after Feb 14, calculate for the upcoming year; otherwise use current year
  let year = targetYear;
  if (!year) {
    if (currentMonth > 1 || (currentMonth === 1 && currentDate > 14)) {
      year = currentYear + 1;
    } else {
      year = currentYear;
    }
  }

  const rawDays = [
    {
      id: 'rose-day',
      name: 'Rose Day',
      dayNumber: 7,
      keyword: 'Rose Day Flowers',
      secondaryKeyword: 'Rose Day Gifts',
      heading: 'Rose Day Gifts & Fresh Rose Bouquets',
      description: 'Express your heartfelt romance on Rose Day with handcrafted Dutch red roses, blushing pink stems, and radiant yellow bouquets from Spring Blossoms Florist. Enjoy same-day doorstep delivery across Hyderabad.',
      icon: '🌹',
      bannerImage: '/images/hero-flower-shop.jpg',
      targetCategory: 'roses'
    },
    {
      id: 'propose-day',
      name: 'Propose Day',
      dayNumber: 8,
      keyword: 'Propose Day Gifts',
      secondaryKeyword: 'Propose Day Flowers',
      heading: 'Propose Day Gifts & Romantic Surprises',
      description: 'Make your confession unforgettable on Propose Day with luxury long-stem roses, exotic orchids, and decadent celebration cakes hand-delivered with midnight precision anywhere in Hyderabad and Secunderabad.',
      icon: '💍',
      bannerImage: '/images/hero-flower-shop.jpg',
      targetCategory: 'combos'
    },
    {
      id: 'chocolate-day',
      name: 'Chocolate Day',
      dayNumber: 9,
      keyword: 'Chocolate Day Gifts',
      secondaryKeyword: 'Chocolate Day Combos',
      heading: 'Chocolate Day Gifts & Sweet Surprises',
      description: 'Celebrate sweet affection on Chocolate Day with gourmet Ferrero Rocher arrangements, Cadbury hampers, and rich Dutch Truffle cakes paired with farm-fresh blossoms by Hyderabad’s premier floral studio.',
      icon: '🍫',
      bannerImage: '/images/hero-flower-shop.jpg',
      targetCategory: 'combos'
    },
    {
      id: 'teddy-day',
      name: 'Teddy Day',
      dayNumber: 10,
      keyword: 'Teddy Day Gifts',
      secondaryKeyword: 'Teddy Bear and Flowers',
      heading: 'Teddy Day Gifts & Cuddly Combos',
      description: 'Send adorable cuddles on Teddy Day with plush teddy bears paired with romantic pink rose bouquets and handwritten message cards delivered safely to your loved one’s doorstep in Hyderabad.',
      icon: '🧸',
      bannerImage: '/images/hero-flower-shop.jpg',
      targetCategory: 'combos'
    },
    {
      id: 'promise-day',
      name: 'Promise Day',
      dayNumber: 11,
      keyword: 'Promise Day Gifts',
      secondaryKeyword: 'Promise Day Flowers',
      heading: 'Promise Day Gifts & Meaningful Bouquets',
      description: 'Seal lifelong commitments on Promise Day with pristine white lilies, vibrant mixed carnations, and elegant flower boxes symbolizing everlasting loyalty and devotion across the Twin Cities.',
      icon: '🤝',
      bannerImage: '/images/hero-flower-shop.jpg',
      targetCategory: 'bouquets'
    },
    {
      id: 'hug-day',
      name: 'Hug Day',
      dayNumber: 12,
      keyword: 'Hug Day Gifts',
      secondaryKeyword: 'Warm Hug Day Flowers',
      heading: 'Hug Day Gifts & Warm Floral Bundles',
      description: 'Wrap your sweetheart in floral warmth on Hug Day with generous 50-stem rose arrangements, soothing sunflowers, and comforting sweet bundles crafted with love at our Mehdipatnam design studio.',
      icon: '🤗',
      bannerImage: '/images/hero-flower-shop.jpg',
      targetCategory: 'bouquets'
    },
    {
      id: 'kiss-day',
      name: 'Kiss Day',
      dayNumber: 13,
      keyword: 'Kiss Day Gifts',
      secondaryKeyword: 'Romantic Kiss Day Flowers',
      heading: 'Kiss Day Gifts & Romantic Floral Creations',
      description: 'Ignite passionate sparks on Kiss Day with velvety crimson roses, heart-shaped floral boxes, and luxury gift hampers scheduled for midnight delivery right before Valentine’s Day.',
      icon: '💋',
      bannerImage: '/images/hero-flower-shop.jpg',
      targetCategory: 'roses'
    },
    {
      id: 'valentines-day',
      name: 'Valentine\'s Day',
      dayNumber: 14,
      keyword: 'Valentine\'s Day Gifts',
      secondaryKeyword: 'Valentine\'s Day Flowers Hyderabad',
      heading: 'Valentine\'s Day Gifts & Grand Luxury Rose Bouquets',
      description: 'The grand crescendo of love! Celebrate Valentine’s Day with signature 100-rose presentations, heart-shaped Red Velvet cakes, and personalized romantic gift hampers delivered across 50+ Hyderabad localities.',
      icon: '❤️',
      bannerImage: '/images/hero-flower-shop.jpg',
      targetCategory: 'roses'
    }
  ];

  return rawDays.map(day => {
    const d = new Date(year, 1, day.dayNumber);
    const weekday = d.toLocaleDateString('en-US', { weekday: 'long' });
    const formattedDate = `${weekday}, Feb ${day.dayNumber}, ${year}`;
    const dateString = `${year}-02-${String(day.dayNumber).padStart(2, '0')}`;
    return {
      ...day,
      year,
      weekday,
      formattedDate,
      dateString
    };
  });
};

