// Centralized icon mapping for entity types and category names.
// Cards across the app should pull their icon from here instead of hardcoding
// <Icon name="..." /> inline, so the iconography stays consistent.

// Default icon per entity type
export const ENTITY_ICONS = {
  category: 'category',
  expenseItem: 'shopping-bag',
  incomeSource: 'account-balance',
  savings: 'savings',
};

// Map common category / source names (lowercased) to a meaningful Material icon.
const NAME_ICON_MAP = {
  food: 'restaurant',
  'food & drink': 'restaurant',
  'food & drinks': 'restaurant',
  grocery: 'local-grocery-store',
  groceries: 'local-grocery-store',
  transport: 'directions-car',
  transportation: 'directions-car',
  travel: 'flight',
  fuel: 'local-gas-station',
  shopping: 'shopping-cart',
  entertainment: 'movie',
  health: 'favorite',
  medical: 'medical-services',
  fitness: 'fitness-center',
  bills: 'receipt-long',
  utilities: 'bolt',
  rent: 'home',
  housing: 'home',
  education: 'school',
  salary: 'payments',
  bonus: 'card-giftcard',
  gift: 'card-giftcard',
  investment: 'trending-up',
  savings: 'savings',
  insurance: 'shield',
  phone: 'smartphone',
  mobile: 'smartphone',
  internet: 'wifi',
  subscription: 'subscriptions',
  tax: 'account-balance-wallet',
  others: 'category',
  other: 'category',
  misc: 'category',
};

const normalize = (value) => (value ? value.toLowerCase().trim() : '');

// Stable hash so an arbitrary name always maps to the same icon
const hashString = (str) => {
  let h = 0;
  for (let i = 0; i < str.length; i += 1) {
    h = (h << 5) - h + str.charCodeAt(i);
    h |= 0;
  }
  return Math.abs(h);
};

const pickFromPool = (name, pool) => pool[hashString(name) % pool.length];

// Curated icon pools for variety when a name has no explicit mapping
const CATEGORY_POOL = ['category', 'label', 'sell', 'bookmark', 'list', 'loyalty', 'local-offer'];
const EXPENSE_POOL = ['shopping-bag', 'shopping-cart', 'local-grocery-store', 'checkroom', 'point-of-sale', 'store'];
const SOURCE_POOL = ['account-balance', 'payments', 'card-giftcard', 'trending-up', 'savings', 'account-balance-wallet', 'volunteer-activism', 'redeem', 'local-atm'];

// Icon for a category card (varies by category name, else a stable varied icon)
export const getCategoryIcon = (name) =>
  NAME_ICON_MAP[normalize(name)] || pickFromPool(normalize(name) || 'category', CATEGORY_POOL);

// Icon for an expense item (prefer its joined category name, else a stable varied icon)
export const getExpenseItemIcon = (item) =>
  NAME_ICON_MAP[normalize(item?.category)] || pickFromPool(normalize(item?.category) || 'item', EXPENSE_POOL);

// Icon for an income source (prefer its name, else a stable varied icon)
export const getIncomeSourceIcon = (item) =>
  NAME_ICON_MAP[normalize(item?.sourceName)] || pickFromPool(normalize(item?.sourceName) || 'source', SOURCE_POOL);

// ---------------------------------------------------------------------------
// Expense card category icons
// ---------------------------------------------------------------------------
// This explicit map was previously duplicated in full inside both
// ExpensesList.js and ExpenseByCategoryList.js. It is intentionally kept
// separate from NAME_ICON_MAP above: the manage screens (categories/products/
// sources) rely on NAME_ICON_MAP + the hash pool, and merging the two would
// change several icons those screens already render.

export const CATEGORY_ICONS = {
  Recharge: 'smartphone',
  'Mobile Recharge': 'smartphone',
  'Phone Recharge': 'phone-android',
  'Data Recharge': 'signal-cellular-alt',
  DTH: 'tv',
  Cutting: 'content-cut',
  'Hair Cut': 'content-cut',
  Salon: 'content-cut',
  Haircut: 'content-cut',
  Barber: 'content-cut',
  Vehicle: 'two-wheeler',
  Bike: 'two-wheeler',
  Motorcycle: 'two-wheeler',
  Scooter: 'two-wheeler',
  Bicycle: 'pedal-bike',
  'Car Service': 'directions-car',
  'Vehicle Service': 'build',
  'Vehicle Repair': 'build',
  Petrol: 'local-gas-station',
  Diesel: 'local-gas-station',
  Food: 'restaurant',
  'Food and Dining': 'restaurant',
  Restaurant: 'restaurant-menu',
  Groceries: 'local-grocery-store',
  Transportation: 'directions-car',
  Car: 'directions-car',
  Fuel: 'local-gas-station',
  Bus: 'directions-bus',
  Train: 'train',
  Taxi: 'local-taxi',
  Shopping: 'shopping-cart',
  Clothing: 'checkroom',
  Fashion: 'checkroom',
  Electronics: 'devices',
  Accessories: 'watch',
  Entertainment: 'movie',
  Movies: 'movie',
  Games: 'sports-esports',
  Sports: 'sports-basketball',
  Music: 'music-note',
  Healthcare: 'local-hospital',
  Medical: 'medical-services',
  Medicine: 'medication',
  Doctor: 'healing',
  Health: 'favorite',
  Education: 'school',
  Books: 'menu-book',
  Tuition: 'cast-for-education',
  Courses: 'class',
  Training: 'psychology',
  Bills: 'receipt',
  Utilities: 'power',
  Electricity: 'bolt',
  Water: 'water-drop',
  Internet: 'wifi',
  Phone: 'phone',
  Mobile: 'smartphone',
  Housing: 'home',
  Rent: 'house',
  Maintenance: 'build',
  Furniture: 'chair',
  Appliances: 'kitchen',
  Travel: 'flight',
  Hotel: 'hotel',
  Vacation: 'beach-access',
  Tourism: 'tour',
  Insurance: 'security',
  Investment: 'trending-up',
  Savings: 'savings',
  Banking: 'account-balance',
  'Personal Care': 'face',
  Fitness: 'fitness-center',
  Beauty: 'spa',
  Gifts: 'card-giftcard',
  Donations: 'volunteer-activism',
  Charity: 'favorite-border',
  Business: 'business-center',
  Office: 'business',
  Stationery: 'edit',
  Pets: 'pets',
  'Pet Food': 'pets',
  Veterinary: 'healing',
  default: 'payments',
};

const CATEGORY_FALLBACKS = [
  {test: /recharge|mobile/, icon: 'smartphone'},
  {test: /cut|salon/, icon: 'content-cut'},
  {test: /bike|vehicle/, icon: 'two-wheeler'},
];

// Lookup order: exact -> case-insensitive -> partial (either direction) ->
// category-group fallbacks -> default. Only the final fallbacks were missing
// from the expenses list, and they only apply when no key matches at all.
export const getExpenseCategoryIcon = category => {
  if (!category) {return CATEGORY_ICONS.default;}

  const exact = CATEGORY_ICONS[category];
  if (exact) {return exact;}

  const normalized = String(category).toLowerCase();

  const caseInsensitive = Object.keys(CATEGORY_ICONS).find(
    key => key.toLowerCase() === normalized,
  );
  if (caseInsensitive) {return CATEGORY_ICONS[caseInsensitive];}

  const partial = Object.keys(CATEGORY_ICONS).find(
    key => normalized.includes(key.toLowerCase()) || key.toLowerCase().includes(normalized),
  );
  if (partial) {return CATEGORY_ICONS[partial];}

  const grouped = CATEGORY_FALLBACKS.find(({test}) => test.test(normalized));
  return grouped ? grouped.icon : CATEGORY_ICONS.default;
};
