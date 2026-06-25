import Fuse from 'fuse.js';
import type { FuseResult } from 'fuse.js';

export interface SearchProduct {
  _id?: string;
  title: string;
  description: string;
  price: number;
  category: string;
  subcategory?: string;
  categories?: string[];
  images: string[];
  [key: string]: any;
}

export interface SearchItem extends SearchProduct {
  flowerTypes: string[];
  colors: string[];
  occasions: string[];
  shortDescription: string;
}

// Predefined vocabularies for tagging
const FLOWER_TYPES = [
  'rose', 'roses', 'wedding bouquet', 'bouquets', 'bouquet', 
  'lily', 'lilies', 'orchid', 'orchids', 'sunflower', 'sunflowers', 
  'tulip', 'tulips', 'carnation', 'carnations', 'gerbera', 'gerberas',
  'anthurium', 'daisy', 'daisies', 'hydrangea', 'hydrangeas'
];

const COLOR_NAMES = [
  'red', 'pink', 'white', 'yellow', 'purple', 'blue', 'orange', 
  'peach', 'gold', 'crimson', 'violet', 'lavender', 'magenta'
];

const OCCASIONS = [
  'anniversary', 'birthday', 'wedding', 'marriage', 'valentine', 
  'valentines', 'love', 'romantic', 'romance', 'sympathy', 'funeral', 
  'condolence', 'congratulations', 'corporate', 'baby shower', 
  'housewarming', 'thank you', 'get well soon', 'sorry'
];

/**
 * Extracts first sentence or first 120 chars as short description
 */
export function getShortDescription(description: string): string {
  if (!description) return '';
  const firstSentence = description.split(/[.!?]/)[0];
  if (firstSentence && firstSentence.length < 120) {
    return firstSentence.trim() + '.';
  }
  return description.substring(0, 120).trim() + '...';
}

/**
 * Preprocesses a product for the search index by tagging it with flower types, colors, and occasions
 */
export function preprocessProductForSearch(product: SearchProduct): SearchItem {
  const text = `${product.title} ${product.description} ${(product.categories || []).join(' ')} ${product.category} ${product.subcategory || ''}`.toLowerCase();

  const flowerTypes = FLOWER_TYPES.filter(flower => text.includes(flower));
  const colors = COLOR_NAMES.filter(color => text.includes(color));
  const occasions = OCCASIONS.filter(occasion => text.includes(occasion));

  return {
    ...product,
    flowerTypes,
    colors,
    occasions,
    shortDescription: getShortDescription(product.description || '')
  };
}

/**
 * Creates and configures a Fuse.js instance
 */
export function createSearchIndex(items: SearchItem[]): Fuse<SearchItem> {
  return new Fuse<SearchItem>(items, {
    keys: [
      { name: 'title', weight: 0.5 },
      { name: 'flowerTypes', weight: 0.3 },
      { name: 'colors', weight: 0.3 },
      { name: 'occasions', weight: 0.3 },
      { name: 'category', weight: 0.25 },
      { name: 'subcategory', weight: 0.25 },
      { name: 'categories', weight: 0.2 },
      { name: 'description', weight: 0.1 }
    ],
    threshold: 0.4, // Max distance for typo tolerance (0.0 is perfect, 1.0 matches anything)
    includeScore: true,
    ignoreLocation: true // Search match anywhere in text
  });
}

/**
 * Custom hybrid ranking sorting.
 * Priorities:
 * 1. Exact title match
 * 2. Title starts with query
 * 3. Title contains query
 * 4. Tag/Category/Occasion/Flower Type match
 * 5. Description contains query
 * 6. Fuzzy match via Fuse.js
 */
export function rankSearchResults(
  fuseResults: FuseResult<SearchItem>[],
  query: string
): SearchItem[] {
  const cleanQuery = query.toLowerCase().trim();
  if (!cleanQuery) return [];

  // Map results with calculated custom weights
  const scoredResults = fuseResults.map(result => {
    const item = result.item;
    const title = item.title.toLowerCase();
    const description = item.description.toLowerCase();
    const fuseScore = result.score ?? 1; // 0 is best, 1 is worst

    let score = 0; // Higher score = more relevant

    // 1. Exact Product Name Match
    if (title === cleanQuery) {
      score += 1000;
    }
    // 2. Product Name Starts With Query
    else if (title.startsWith(cleanQuery)) {
      score += 800;
    }
    // 3. Product Name Contains Query (whole word or substring in title)
    else if (title.includes(cleanQuery)) {
      score += 600;
    }

    // 4. Category/Subcategory Matches
    if (item.category.toLowerCase() === cleanQuery || (item.subcategory && item.subcategory.toLowerCase() === cleanQuery)) {
      score += 400;
    } else if (item.category.toLowerCase().includes(cleanQuery)) {
      score += 200;
    }

    // 5. Tags/Categories array match
    const hasTagMatch = (item.categories || []).some(cat => cat.toLowerCase() === cleanQuery);
    if (hasTagMatch) {
      score += 300;
    }

    // 6. Occasion/Flower type/Color exact match
    const hasFlowerMatch = item.flowerTypes.some(f => f === cleanQuery);
    const hasColorMatch = item.colors.some(c => c === cleanQuery);
    const hasOccasionMatch = item.occasions.some(o => o === cleanQuery);
    if (hasFlowerMatch || hasColorMatch || hasOccasionMatch) {
      score += 250;
    }

    // 7. Description contains match
    if (description.includes(cleanQuery)) {
      score += 100;
    }

    // 8. Add weighted Fuse score (scaled from 0 to 50 points)
    // Since Fuse score 0 is best, we do (1 - fuseScore) * 50
    score += (1 - fuseScore) * 50;

    return {
      item,
      relevanceScore: score
    };
  });

  // Sort by relevanceScore descending
  scoredResults.sort((a, b) => b.relevanceScore - a.relevanceScore);

  return scoredResults.map(r => r.item);
}
