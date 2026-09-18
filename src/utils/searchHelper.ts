import Fuse from 'fuse.js';
import type { FuseResult } from 'fuse.js';

export interface SearchProduct {
  _id?: string;
  id?: string;
  title: string;
  name?: string;
  description: string;
  price: number;
  category: string;
  subcategory?: string;
  categories?: string[];
  tags?: string[] | any[];
  images: string[];
  rating?: number;
  isBestseller?: boolean;
  isFeatured?: boolean;
  isNewArrival?: boolean;
  isNew?: boolean;
  sku?: string;
  stock?: number;
  countInStock?: number;
  sameDay?: boolean;
  [key: string]: any;
}

export interface SearchItem extends SearchProduct {
  flowerTypes: string[];
  colors: string[];
  occasions: string[];
  recipients: string[];
  keywords: string[];
  shortDescription: string;
}

// Predefined vocabularies for tagging
export const FLOWER_TYPES = [
  'rose', 'roses', 'wedding bouquet', 'bouquets', 'bouquet', 
  'lily', 'lilies', 'orchid', 'orchids', 'sunflower', 'sunflowers', 
  'tulip', 'tulips', 'carnation', 'carnations', 'gerbera', 'gerberas',
  'anthurium', 'daisy', 'daisies', 'hydrangea', 'hydrangeas',
  'chrysanthemum', 'peony', 'peonies', 'mixed', 'exotic'
];

export const COLOR_NAMES = [
  'red', 'pink', 'white', 'yellow', 'purple', 'blue', 'orange', 
  'peach', 'gold', 'crimson', 'violet', 'lavender', 'magenta', 'green'
];

export const OCCASIONS = [
  'anniversary', 'birthday', 'wedding', 'marriage', 'valentine', 
  'valentines', 'love', 'romantic', 'romance', 'sympathy', 'funeral', 
  'condolence', 'congratulations', 'corporate', 'baby shower', 
  'housewarming', 'thank you', 'get well soon', 'sorry',
  'mothers day', 'fathers day', 'rakhi', 'diwali', 'new year'
];

export const RECIPIENT_TYPES = [
  'wife', 'husband', 'girlfriend', 'boyfriend', 'mother', 'mom',
  'father', 'dad', 'friend', 'sister', 'brother', 'parents', 'her', 'him', 'client'
];

export const PRODUCT_KEYWORDS = [
  'luxury', 'premium', 'bouquet', 'box', 'basket', 'bunch',
  'vase', 'combo', 'hamper', 'fresh', 'imported', 'special'
];

// Florist-specific common typos dictionary
export const TYPO_MAP: Record<string, string> = {
  'roes': 'roses',
  'rose': 'roses',
  'rosess': 'roses',
  'rosez': 'roses',
  'bouqet': 'bouquet',
  'buquet': 'bouquet',
  'boquet': 'bouquet',
  'boqet': 'bouquet',
  'buket': 'bouquet',
  'aniversery': 'anniversary',
  'aniversary': 'anniversary',
  'anniversery': 'anniversary',
  'aniversy': 'anniversary',
  'flowrs': 'flowers',
  'flowes': 'flowers',
  'floers': 'flowers',
  'folwers': 'flowers',
  'flwers': 'flowers',
  'flower': 'flowers',
  'orkid': 'orchid',
  'orchd': 'orchid',
  'orchids': 'orchid',
  'sunflowr': 'sunflower',
  'sunflowrs': 'sunflower',
  'tullip': 'tulip',
  'tullips': 'tulip',
  'carnatn': 'carnation',
  'carnashun': 'carnation',
  'gerbra': 'gerbera',
  'garbera': 'gerbera',
  'hydranga': 'hydrangea',
  'choclate': 'chocolate',
  'chocolat': 'chocolate',
  'choclates': 'chocolate',
  'valintine': 'valentine',
  'valentins': 'valentine',
  'bithday': 'birthday',
  'bday': 'birthday',
  'birhday': 'birthday'
};

// Florist synonyms dictionary
export const SYNONYM_MAP: Record<string, string[]> = {
  'flowers': ['bouquet', 'roses', 'blooms'],
  'bouquet': ['flowers', 'bunch', 'roses bouquet'],
  'roses': ['rose bouquet', 'flowers', 'red roses', 'romantic flowers'],
  'rose bouquet': ['roses', 'red roses', 'romantic flowers', 'love bouquet'],
  'birthday gift': ['birthday flowers', 'birthday bouquet', 'birthday combos'],
  'birthday flowers': ['birthday bouquet', 'birthday gift', 'birthday combos'],
  'romantic': ['love flowers', 'red roses', 'rose bouquet', 'valentine', 'anniversary flowers'],
  'love flowers': ['romantic', 'red roses', 'rose bouquet', 'anniversary'],
  'red roses': ['romantic', 'rose bouquet', 'love flowers', 'roses'],
  'yellow bouquet': ['sunflower', 'yellow roses'],
  'luxury flowers': ['premium roses', 'exotic orchids', 'luxury bouquet'],
  'premium roses': ['luxury flowers', 'red roses', 'roses'],
  'wife': ['romantic', 'love flowers', 'red roses', 'anniversary gifts'],
  'husband': ['love', 'romantic', 'anniversary'],
  'girlfriend': ['romantic', 'love flowers', 'red roses', 'chocolates'],
  'boyfriend': ['gifts', 'chocolates', 'plants'],
  'mother': ['mothers day', 'carnations', 'lilies', 'pink roses'],
  'mom': ['mothers day', 'carnations', 'lilies', 'mother'],
  'father': ['fathers day', 'plants', 'orchids'],
  'dad': ['fathers day', 'plants', 'orchids', 'father'],
  'box': ['flower box', 'rose box'],
  'basket': ['flower basket', 'fruit basket']
};

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
 * Clean and resolve typos + synonyms in user search input
 */
export function normalizeQuery(query: string): {
  cleaned: string;
  corrected: string;
  terms: string[];
  expandedTerms: string[];
} {
  const cleaned = query.toLowerCase().trim().replace(/['"]/g, '');
  const tokens = cleaned.split(/\s+/).filter(Boolean);

  const correctedTokens = tokens.map(t => TYPO_MAP[t] || t);
  const corrected = correctedTokens.join(' ');

  const synonyms = new Set<string>();
  if (SYNONYM_MAP[cleaned]) {
    SYNONYM_MAP[cleaned].forEach(s => synonyms.add(s));
  }
  if (SYNONYM_MAP[corrected]) {
    SYNONYM_MAP[corrected].forEach(s => synonyms.add(s));
  }

  correctedTokens.forEach(token => {
    if (SYNONYM_MAP[token]) {
      SYNONYM_MAP[token].forEach(s => synonyms.add(s));
    }
  });

  const expandedTerms = Array.from(new Set([...tokens, ...correctedTokens, ...synonyms]));

  return {
    cleaned,
    corrected,
    terms: correctedTokens,
    expandedTerms
  };
}

/**
 * Preprocesses a product for the search index by tagging it with flower types, colors, occasions, recipients, keywords
 */
export function preprocessProductForSearch(product: SearchProduct): SearchItem {
  const tagStrings = Array.isArray(product.tags)
    ? product.tags.map(t => (typeof t === 'string' ? t : t.tag || '')).filter(Boolean)
    : [];

  const text = `${product.title || product.name || ''} ${product.description || ''} ${(product.categories || []).join(' ')} ${product.category || ''} ${product.subcategory || ''} ${tagStrings.join(' ')}`.toLowerCase();

  const flowerTypes = FLOWER_TYPES.filter(flower => text.includes(flower));
  const colors = COLOR_NAMES.filter(color => text.includes(color));
  const occasions = OCCASIONS.filter(occasion => text.includes(occasion));
  const recipients = RECIPIENT_TYPES.filter(recipient => text.includes(recipient));
  const keywords = PRODUCT_KEYWORDS.filter(kw => text.includes(kw));

  return {
    ...product,
    title: product.title || product.name || 'Flower Product',
    flowerTypes,
    colors,
    occasions,
    recipients,
    keywords,
    shortDescription: getShortDescription(product.description || '')
  };
}

/**
 * Creates and configures a Fuse.js instance with typo tolerance
 */
export function createSearchIndex(items: SearchItem[]): Fuse<SearchItem> {
  return new Fuse<SearchItem>(items, {
    keys: [
      { name: 'title', weight: 0.5 },
      { name: 'flowerTypes', weight: 0.35 },
      { name: 'colors', weight: 0.3 },
      { name: 'occasions', weight: 0.35 },
      { name: 'recipients', weight: 0.3 },
      { name: 'keywords', weight: 0.25 },
      { name: 'category', weight: 0.3 },
      { name: 'subcategory', weight: 0.25 },
      { name: 'categories', weight: 0.25 },
      { name: 'tags', weight: 0.3 },
      { name: 'sku', weight: 0.2 },
      { name: 'description', weight: 0.1 }
    ],
    threshold: 0.38, // Max distance for typo tolerance
    includeScore: true,
    ignoreLocation: true
  });
}

/**
 * Priority-Ranked Search Results:
 * Highest Priority:
 * 1. Exact Product Name Match (1000)
 * 2. Product Name Starts With / Contains Query (800 / 600)
 * 3. Product Tags Match (500)
 * 4. Category & Subcategory Match (400)
 * 5. Occasion / Flower Type / Color / Recipient Match (350)
 * 6. Description Match (150)
 * 7. Related / Fuzzy match (50)
 * Plus ratings / bestseller quality boosters
 */
export function rankSearchResults(
  fuseResults: FuseResult<SearchItem>[],
  query: string
): SearchItem[] {
  if (!query) return [];
  const { cleaned, corrected, terms, expandedTerms } = normalizeQuery(query);

  const scoredResults = fuseResults.map(result => {
    const item = result.item;
    const title = (item.title || item.name || '').toLowerCase();
    const description = (item.description || '').toLowerCase();
    const category = (item.category || '').toLowerCase();
    const subcategory = (item.subcategory || '').toLowerCase();
    const categories = (item.categories || []).map(c => c.toLowerCase());
    const tags = Array.isArray(item.tags)
      ? item.tags.map(t => (typeof t === 'string' ? t.toLowerCase() : (t.tag || '').toLowerCase()))
      : [];
    const fuseScore = result.score ?? 1;

    let score = 0;

    // 1. Exact Product Name Match
    if (title === cleaned || title === corrected) {
      score += 1000;
    }
    // 2. Product Name Starts With Query
    else if (title.startsWith(cleaned) || title.startsWith(corrected)) {
      score += 800;
    }
    // 2b. Product Name Contains Query
    else if (title.includes(cleaned) || title.includes(corrected)) {
      score += 600;
    }

    // Term matching in title
    const matchingTermsInTitle = terms.filter(t => title.includes(t));
    if (matchingTermsInTitle.length > 0) {
      score += (matchingTermsInTitle.length / terms.length) * 400;
    }

    // 3. Product Tags Match
    const tagMatch = tags.some(tag => tag === cleaned || tag === corrected || terms.some(t => tag.includes(t)));
    if (tagMatch) {
      score += 500;
    }

    // 4. Category & Subcategory Match
    if (category === cleaned || category === corrected || subcategory === cleaned || subcategory === corrected) {
      score += 400;
    } else if (category.includes(cleaned) || subcategory.includes(cleaned)) {
      score += 250;
    } else if (categories.some(c => c === cleaned || c === corrected || terms.some(t => c.includes(t)))) {
      score += 300;
    }

    // 5. Flower Type, Color, Occasion, Recipient Match
    for (const term of terms) {
      if (item.flowerTypes.includes(term)) score += 350;
      if (item.colors.includes(term)) score += 300;
      if (item.occasions.includes(term)) score += 350;
      if (item.recipients.includes(term)) score += 350;
      if (item.keywords.includes(term)) score += 200;
    }

    // 6. Description match
    if (description.includes(cleaned) || description.includes(corrected)) {
      score += 150;
    }

    // 7. Expanded terms / Synonyms match
    for (const exp of expandedTerms) {
      if (exp !== cleaned && exp !== corrected) {
        if (title.includes(exp)) score += 200;
        else if (category.includes(exp) || categories.includes(exp)) score += 150;
        else if (description.includes(exp)) score += 100;
      }
    }

    // 8. Fuse score (typo tolerance)
    score += (1 - fuseScore) * 60;

    // Quality boosters
    if (item.rating && item.rating > 0) score += item.rating * 15;
    if (item.isBestseller) score += 50;
    if (item.isFeatured) score += 30;
    if (item.isNewArrival || item.isNew) score += 20;

    return {
      item,
      relevanceScore: score
    };
  });

  scoredResults.sort((a, b) => b.relevanceScore - a.relevanceScore);
  return scoredResults.map(r => r.item);
}
