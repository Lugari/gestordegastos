// Catálogos de íconos (MaterialIcons) y paletas de color por tipo de bucket.
// Cada lista es amplia y congruente con su dominio para que al crear un bucket
// haya de dónde elegir sin salirse del tono de la categoría.

export const BUDGET_ICONS = [
  // Vivienda y servicios
  'home', 'apartment', 'lightbulb', 'water-drop', 'bolt', 'local-fire-department',
  'receipt-long', 'wifi', 'phone-iphone', 'cleaning-services',
  // Alimentación
  'shopping-cart', 'local-grocery-store', 'restaurant', 'fastfood', 'local-cafe', 'local-bar', 'local-pizza',
  // Transporte
  'directions-car', 'local-gas-station', 'directions-bus', 'local-taxi', 'two-wheeler', 'flight', 'local-parking',
  // Personal y salud
  'local-hospital', 'medical-services', 'medication', 'fitness-center', 'spa', 'checkroom', 'content-cut', 'pets', 'child-care',
  // Ocio y educación
  'school', 'menu-book', 'theaters', 'sports-esports', 'music-note', 'sports-soccer', 'card-giftcard', 'redeem',
  // Servicios y suscripciones
  'subscriptions', 'live-tv', 'cloud', 'movie',
  // Otros
  'build', 'handyman', 'shopping-bag', 'store', 'paid', 'credit-card', 'account-balance-wallet', 'attach-money', 'category',
];

export const SAVING_ICONS = [
  'savings', 'account-balance', 'account-balance-wallet', 'lock', 'shield',
  'travel-explore', 'flight-takeoff', 'beach-access', 'directions-car', 'two-wheeler',
  'house', 'apartment', 'weekend', 'chair', 'school', 'menu-book',
  'devices', 'laptop-mac', 'phone-iphone', 'watch', 'headphones',
  'celebration', 'cake', 'favorite', 'child-friendly', 'pets',
  'diamond', 'redeem', 'card-giftcard', 'trending-up', 'medical-services', 'volunteer-activism', 'flag',
];

export const INVESTMENT_ICONS = [
  'trending-up', 'show-chart', 'candlestick-chart', 'query-stats', 'insights', 'stacked-line-chart',
  'account-balance', 'savings', 'currency-exchange', 'paid', 'attach-money', 'monetization-on',
  'currency-bitcoin', 'toll', 'real-estate-agent', 'apartment', 'business', 'store',
  'diamond', 'workspace-premium', 'pie-chart', 'donut-large', 'agriculture', 'oil-barrel',
];

export const DEBT_ICONS = [
  'credit-card', 'account-balance', 'payments', 'request-quote', 'receipt-long',
  'directions-car', 'house', 'apartment', 'school', 'medical-services',
  'shopping-bag', 'handshake', 'gavel', 'warning', 'trending-down',
];

// Paletas por tipo: tonos congruentes con el dominio (gastos = amplio funcional;
// ahorro = verdes/azules de crecimiento; inversión = púrpuras/dorados de riqueza;
// deuda = rojos/naranjas). Colores saturados que contrastan con íconos blancos.
export const BUCKET_COLORS = {
  budget: [
    '#E8615A', '#EF8354', '#F2B705', '#F4A259', '#7FB069', '#4EA699',
    '#4C86A8', '#5D7CBA', '#8367C7', '#B5658D', '#C97C5D', '#6C757D',
    '#D1495B', '#2A9D8F',
  ],
  saving: [
    '#2A9D8F', '#43AA8B', '#4EA699', '#57CC99', '#80ED99', '#38A3A5',
    '#4C86A8', '#5D7CBA', '#118AB2', '#06D6A0', '#8AC926', '#52796F',
    '#1B9AAA', '#3D8361',
  ],
  investment: [
    '#8367C7', '#7251B5', '#5E60CE', '#5390D9', '#4EA8DE', '#6930C3',
    '#B5179E', '#C77DFF', '#E0A458', '#F2B705', '#DAA520', '#3A0CA3',
    '#48BFE3', '#9D4EDD',
  ],
  debt: [
    '#D1495B', '#E8615A', '#EF476F', '#C1121F', '#9E2A2B', '#EF8354',
    '#F4A259', '#BC4749', '#A44A3F', '#6C757D', '#B5179E', '#780000',
  ],
};
