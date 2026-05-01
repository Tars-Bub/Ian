export interface MenuItem {
  id: string;
  name: string;
  price: number;
  category: string;
  image?: string; // Optional image URL
}

export interface CartItem extends MenuItem {
  quantity: number;
}

export interface SaleRecord {
  id: string;
  orderNumber: string; // ADD THIS - unique order number
  items: CartItem[];
  total: number;
  paymentMethod: 'cash' | 'cashless';
  date: string;
  cashierName?: string;
  cashierId?: string;
}

export interface Expense {
  id: string;
  description: string;
  amount: number;
  category: string;
  date: string;
}

export const categories = [
  'All',
  'Sulit Meals',
  'Silog Meals',
  'Rice Toppings',
  'A La Carte',
  'Finger Foods',
];

export const menuItems: MenuItem[] = [
  // Sulit Meals
  { id: 'sm1', name: 'Chicken Pastil', price: 25, category: 'Sulit Meals' },
  { id: 'sm2', name: 'Pork Sisig', price: 25, category: 'Sulit Meals' },
  { id: 'sm3', name: '60 Pesos Pares', price: 60, category: 'Sulit Meals' },
  { id: 'sm4', name: '100 Pesos Overload Pares', price: 100, category: 'Sulit Meals' },
  { id: 'sm5', name: 'Tender Juicy Hotdog', price: 20, category: 'Sulit Meals' },
  { id: 'sm6', name: 'Sweet Ham', price: 20, category: 'Sulit Meals' },
  { id: 'sm7', name: 'Giniling Express', price: 25, category: 'Sulit Meals' },

  // Silog Meals
  { id: 'sl1', name: 'Longganisa', price: 55, category: 'Silog Meals' },
  { id: 'sl2', name: 'Lechon Kawali', price: 110, category: 'Silog Meals' },
  { id: 'sl3', name: 'Pork Liempo', price: 110, category: 'Silog Meals' },
  { id: 'sl4', name: 'Sweet Ham (1 pc)', price: 45, category: 'Silog Meals' },
  { id: 'sl5', name: 'Embotido', price: 65, category: 'Silog Meals' },
  { id: 'sl6', name: 'Sizzling Tofu', price: 65, category: 'Silog Meals' },
  { id: 'sl7', name: 'Beef Tapa', price: 65, category: 'Silog Meals' },
  { id: 'sl8', name: 'Burger Steak', price: 65, category: 'Silog Meals' },
  { id: 'sl9', name: 'Honey Bacon', price: 75, category: 'Silog Meals' },
  { id: 'sl10', name: 'Cordon Bleu', price: 100, category: 'Silog Meals' },
  { id: 'sl11', name: 'Chicken Fingers (3)', price: 75, category: 'Silog Meals' },
  { id: 'sl12', name: 'Chicken Chop', price: 110, category: 'Silog Meals' },
  { id: 'sl13', name: 'Chicken Nuggets (4)', price: 75, category: 'Silog Meals' },
  { id: 'sl14', name: 'Tocino (Pork/Chicken)', price: 65, category: 'Silog Meals' },
  { id: 'sl15', name: 'Sisig (Pork/Chicken)', price: 70, category: 'Silog Meals' },
  { id: 'sl16', name: 'Hungarian Sausage', price: 79, category: 'Silog Meals' },
  { id: 'sl17', name: 'Skinless Longganisa', price: 55, category: 'Silog Meals' },
  { id: 'sl18', name: 'Luncheon Meat', price: 40, category: 'Silog Meals' },
  { id: 'sl19', name: 'Boneless Bangus', price: 89, category: 'Silog Meals' },

  // Rice Toppings
  { id: 'rt1', name: 'Fried Chicken Leg Quarter', price: 110, category: 'Rice Toppings' },
  { id: 'rt2', name: 'Fried Chicken Wings (2)', price: 80, category: 'Rice Toppings' },
  { id: 'rt3', name: 'Fried Chicken Wings (3)', price: 100, category: 'Rice Toppings' },
  { id: 'rt4', name: 'Chicken Pastil with Egg', price: 65, category: 'Rice Toppings' },
  { id: 'rt5', name: 'Siomai Meal (4)', price: 40, category: 'Rice Toppings' },
  { id: 'rt6', name: 'Dumplings Meal (4)', price: 45, category: 'Rice Toppings' },
  { id: 'rt7', name: 'Lumpiang Shanghai (6)', price: 65, category: 'Rice Toppings' },
  { id: 'rt8', name: 'Fish Fillet (4)', price: 70, category: 'Rice Toppings' },
  { id: 'rt9', name: 'Pork Chop', price: 110, category: 'Rice Toppings' },
  { id: 'rt10', name: 'Beef Pares', price: 60, category: 'Rice Toppings' },
  { id: 'rt11', name: 'Overload Pares', price: 100, category: 'Rice Toppings' },

  // A La Carte
  { id: 'al1', name: 'Whole Fried Chicken Oriental', price: 350, category: 'A La Carte' },
  { id: 'al2', name: 'Half Fried Chicken Oriental', price: 200, category: 'A La Carte' },
  { id: 'al3', name: 'Chicken Wings (6)', price: 200, category: 'A La Carte' },
  { id: 'al4', name: 'Chicken Fingers (8)', price: 160, category: 'A La Carte' },
  { id: 'al5', name: 'Embotido', price: 110, category: 'A La Carte' },
  { id: 'al6', name: 'Lechon Kawali', price: 250, category: 'A La Carte' },
  { id: 'al7', name: 'Fried Liempo', price: 250, category: 'A La Carte' },
  { id: 'al8', name: 'Fried Boneless Bangus', price: 130, category: 'A La Carte' },
  { id: 'al9', name: 'Sizzling Tokwa', price: 130, category: 'A La Carte' },

  // Finger Foods
  { id: 'ff1', name: 'Fish Tofu (12)', price: 80, category: 'Finger Foods' },
  { id: 'ff2', name: 'Siomai (10)', price: 70, category: 'Finger Foods' },
  { id: 'ff3', name: 'Dumplings (10)', price: 80, category: 'Finger Foods' },
  { id: 'ff4', name: 'Lumpiang Shanghai (12)', price: 110, category: 'Finger Foods' },
  { id: 'ff5', name: 'Lumpiang Togue (3)', price: 25, category: 'Finger Foods' },
  { id: 'ff6', name: 'Chicken Skin', price: 50, category: 'Finger Foods' },
  { id: 'ff7', name: 'Flavored Fries', price: 50, category: 'Finger Foods' },
];

export const expenseCategories = [
  'Ingredients',
  'Utilities',
  'Supplies',
  'Wages',
  'Rent',
  'Other',
];