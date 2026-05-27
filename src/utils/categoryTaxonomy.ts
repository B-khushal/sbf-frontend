export const PRIMARY_CATEGORIES = [
  { value: "flowers", label: "Flowers" },
  { value: "chocolate", label: "Chocolate" },
  { value: "birthday", label: "Birthday" },
  { value: "anniversary", label: "Anniversary" },
  { value: "baskets", label: "Baskets" },
  { value: "combos", label: "Combos" },
  { value: "plants", label: "Plants" },
  { value: "sympathy", label: "Sympathy" },
  { value: "occasions", label: "Occasions" },
] as const;

export type CategoryOption = {
  value: string;
  label: string;
};

export type CategoryNavItem = {
  name: string;
  path: string;
  emoji: string;
  description: string;
  popular: boolean;
  subcategories: Array<CategoryOption & { path: string }>;
};

export const CATEGORY_SUBCATEGORIES: Record<string, Array<{ value: string; label: string }>> = {
  flowers: [
    { value: "roses", label: "Roses" },
    { value: "lilies", label: "Lilies" },
    { value: "tulips", label: "Tulips" },
    { value: "orchids", label: "Orchids" },
    { value: "sunflowers", label: "Sunflowers" },
  ],
  chocolate: [
    { value: "chocolate-baskets", label: "Chocolate Baskets" },
    { value: "chocolate-bouquets", label: "Chocolate Bouquets" },
    { value: "chocolate-gift-sets", label: "Chocolate Gift Sets" },
    { value: "premium-chocolates", label: "Premium Chocolates" },
  ],
  birthday: [
    { value: "birthday-bouquets", label: "Birthday Bouquets" },
    { value: "party-arrangements", label: "Party Arrangements" },
    { value: "kids-birthday", label: "Kids Birthday" },
    { value: "birthday-cakes", label: "Birthday Cakes" },
    { value: "birthday-combos", label: "Birthday Combos" },
  ],
  anniversary: [
    { value: "romantic-bouquets", label: "Romantic Bouquets" },
    { value: "premium-roses", label: "Premium Roses" },
    { value: "love-arrangements", label: "Love Arrangements" },
    { value: "anniversary-gifts", label: "Anniversary Gifts" },
    { value: "anniversary-combos", label: "Anniversary Combos" },
  ],
  baskets: [
    { value: "fruit-baskets", label: "Fruit Baskets" },
    { value: "flower-baskets", label: "Flower Baskets" },
    { value: "mixed-baskets", label: "Mixed Baskets" },
    { value: "gift-hampers", label: "Gift Hampers" },
  ],
  combos: [
    { value: "combo-packs", label: "Combo Packs" },
    { value: "birthday-combos", label: "Birthday Combos" },
    { value: "anniversary-combos", label: "Anniversary Combos" },
    { value: "romantic-combos", label: "Romantic Combos" },
    { value: "special-occasion-combos", label: "Special Occasion Combos" },
  ],
  plants: [
    { value: "indoor-plants", label: "Indoor Plants" },
    { value: "succulents", label: "Succulents" },
    { value: "garden-plants", label: "Garden Plants" },
    { value: "air-purifying", label: "Air Purifying" },
  ],
  sympathy: [
    { value: "sympathy-bouquets", label: "Sympathy Bouquets" },
    { value: "condolence", label: "Condolence" },
    { value: "condolence-arrangements", label: "Condolence Arrangements" },
    { value: "memorial-flowers", label: "Memorial Flowers" },
    { value: "peaceful-arrangements", label: "Peaceful Arrangements" },
  ],
  occasions: [
    { value: "wedding", label: "Wedding" },
    { value: "graduation", label: "Graduation" },
    { value: "baby-shower", label: "Baby Shower" },
    { value: "housewarming", label: "Housewarming" },
    { value: "congratulations", label: "Congratulations" },
  ],
};

export const CATEGORY_NAV_ITEMS: CategoryNavItem[] = [
  {
    name: "🌹 Flowers",
    path: "/shop/flowers",
    emoji: "🌹",
    description: "Fresh blooms for every occasion",
    popular: true,
    subcategories: [
      { value: "roses", label: "Roses", path: "/shop/roses" },
      { value: "lilies", label: "Lilies", path: "/shop/lilies" },
      { value: "tulips", label: "Tulips", path: "/shop/tulips" },
      { value: "orchids", label: "Orchids", path: "/shop/orchids" },
      { value: "sunflowers", label: "Sunflowers", path: "/shop/sunflowers" },
    ],
  },
  {
    name: "🍫 Chocolate",
    path: "/shop/chocolate",
    emoji: "🍫",
    description: "Delicious chocolate arrangements",
    popular: true,
    subcategories: [
      { value: "chocolate-baskets", label: "Chocolate Baskets", path: "/shop/chocolate-baskets" },
      { value: "chocolate-bouquets", label: "Chocolate Bouquets", path: "/shop/chocolate-bouquets" },
      { value: "chocolate-gift-sets", label: "Chocolate Gift Sets", path: "/shop/chocolate-gift-sets" },
      { value: "premium-chocolates", label: "Premium Chocolates", path: "/shop/premium-chocolates" },
    ],
  },
  {
    name: "🎂 Birthday",
    path: "/shop/birthday",
    emoji: "🎂",
    description: "Celebrate special moments",
    popular: true,
    subcategories: [
      { value: "birthday-bouquets", label: "Birthday Bouquets", path: "/shop/birthday-bouquets" },
      { value: "party-arrangements", label: "Party Arrangements", path: "/shop/party-arrangements" },
      { value: "kids-birthday", label: "Kids Birthday", path: "/shop/kids-birthday" },
      { value: "birthday-cakes", label: "Birthday Cakes", path: "/shop/birthday-cakes" },
      { value: "birthday-combos", label: "Birthday Combos", path: "/shop/birthday-combos" },
    ],
  },
  {
    name: "💕 Anniversary",
    path: "/shop/anniversary",
    emoji: "💕",
    description: "Romantic gestures made perfect",
    popular: false,
    subcategories: [
      { value: "romantic-bouquets", label: "Romantic Bouquets", path: "/shop/romantic-bouquets" },
      { value: "premium-roses", label: "Premium Roses", path: "/shop/premium-roses" },
      { value: "love-arrangements", label: "Love Arrangements", path: "/shop/love-arrangements" },
      { value: "anniversary-gifts", label: "Anniversary Gifts", path: "/shop/anniversary-gifts" },
      { value: "anniversary-combos", label: "Anniversary Combos", path: "/shop/anniversary-combos" },
    ],
  },
  {
    name: "🧺 Baskets",
    path: "/shop/baskets",
    emoji: "🧺",
    description: "Elegant gift baskets",
    popular: false,
    subcategories: [
      { value: "fruit-baskets", label: "Fruit Baskets", path: "/shop/fruit-baskets" },
      { value: "flower-baskets", label: "Flower Baskets", path: "/shop/flower-baskets" },
      { value: "mixed-baskets", label: "Mixed Baskets", path: "/shop/mixed-baskets" },
      { value: "gift-hampers", label: "Gift Hampers", path: "/shop/gift-hampers" },
    ],
  },
  {
    name: "🎁 Combos",
    path: "/shop/combos",
    emoji: "🎁",
    description: "Perfect combo packages",
    popular: true,
    subcategories: [
      { value: "combo-packs", label: "Combo Packs", path: "/shop/combo-packs" },
      { value: "birthday-combos", label: "Birthday Combos", path: "/shop/birthday-combos" },
      { value: "anniversary-combos", label: "Anniversary Combos", path: "/shop/anniversary-combos" },
      { value: "romantic-combos", label: "Romantic Combos", path: "/shop/romantic-combos" },
      { value: "special-occasion-combos", label: "Special Occasion Combos", path: "/shop/special-occasion-combos" },
    ],
  },
  {
    name: "🌿 Plants",
    path: "/shop/plants",
    emoji: "🌿",
    description: "Indoor & outdoor plants",
    popular: false,
    subcategories: [
      { value: "indoor-plants", label: "Indoor Plants", path: "/shop/indoor-plants" },
      { value: "succulents", label: "Succulents", path: "/shop/succulents" },
      { value: "garden-plants", label: "Garden Plants", path: "/shop/garden-plants" },
      { value: "air-purifying", label: "Air Purifying", path: "/shop/air-purifying" },
    ],
  },
  {
    name: "💙 Sympathy",
    path: "/shop/sympathy",
    emoji: "💙",
    description: "Comforting arrangements",
    popular: false,
    subcategories: [
      { value: "sympathy-bouquets", label: "Sympathy Bouquets", path: "/shop/sympathy-bouquets" },
      { value: "condolence", label: "Condolence Arrangements", path: "/shop/condolence" },
      { value: "memorial-flowers", label: "Memorial Flowers", path: "/shop/memorial-flowers" },
      { value: "peaceful-arrangements", label: "Peaceful Arrangements", path: "/shop/peaceful-arrangements" },
    ],
  },
  {
    name: "🎉 Occasions",
    path: "/shop/occasions",
    emoji: "🎉",
    description: "Special celebrations",
    popular: false,
    subcategories: [
      { value: "wedding", label: "Wedding", path: "/shop/wedding" },
      { value: "graduation", label: "Graduation", path: "/shop/graduation" },
      { value: "baby-shower", label: "Baby Shower", path: "/shop/baby-shower" },
      { value: "housewarming", label: "Housewarming", path: "/shop/housewarming" },
      { value: "congratulations", label: "Congratulations", path: "/shop/congratulations" },
    ],
  },
];

const CATEGORY_GROUPS: Record<string, string[]> = Object.fromEntries(
  Object.entries(CATEGORY_SUBCATEGORIES).map(([group, subcategories]) => [
    group,
    [group, ...subcategories.map((subcategory) => subcategory.value)],
  ])
);

export const normalizeCategoryKey = (value?: string | null): string => {
  if (!value) return "";

  return value
    .trim()
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/[\s-]+/g, "-")
    .replace(/^-+|-+$/g, "");
};

export const normalizeCategoryLabel = (value?: string | null): string =>
  normalizeCategoryKey(value).replace(/-/g, " ");

export const getCategoryMatchKeys = (value?: string | null): string[] => {
  const key = normalizeCategoryKey(value);
  if (!key) return [];

  const matches = new Set<string>([key]);

  Object.entries(CATEGORY_GROUPS).forEach(([groupKey, categoryKeys]) => {
    if (groupKey === key || categoryKeys.includes(key)) {
      matches.add(groupKey);
      categoryKeys.forEach((categoryKey) => matches.add(categoryKey));
    }
  });

  return Array.from(matches);
};

export const getSubcategoryOptions = (parentCategory?: string | null) => {
  return CATEGORY_SUBCATEGORIES[normalizeCategoryKey(parentCategory)] || [];
};

export const getAdditionalCategoryOptions = (parentCategory?: string | null, subcategory?: string | null) => {
  const excluded = new Set([normalizeCategoryKey(parentCategory), normalizeCategoryKey(subcategory)]);

  return PRIMARY_CATEGORIES.filter((category) => !excluded.has(category.value)).map((category) => ({
    value: category.value,
    label: category.label,
  }));
};

export const getParentCategoryLabel = (value?: string | null) => {
  const key = normalizeCategoryKey(value);
  return PRIMARY_CATEGORIES.find((category) => category.value === key)?.label || normalizeCategoryLabel(value);
};

export const matchesCategoryGroup = (
  productCategory: string | null | undefined,
  selectedCategory: string | null | undefined,
  additionalCategories: Array<string | null | undefined> = [],
  productSubcategory?: string | null | undefined
): boolean => {
  const selectedKeys = getCategoryMatchKeys(selectedCategory);
  if (selectedKeys.length === 0) return true;

  const candidateKeys = [productCategory, productSubcategory, ...additionalCategories]
    .map((category) => normalizeCategoryKey(category))
    .filter(Boolean);

  return candidateKeys.some((candidateKey) => selectedKeys.includes(candidateKey));
};
