import { describe, it, expect } from 'vitest';
import {
  addToCart,
  removeFromCart,
  getCartTotal,
  getCartCount,
  login,
  register,
  addExpense,
  deleteExpense,
  getTodayExpenses,
  getTodayRevenue,
  getNetProfit,
  searchMenu,
  getByCategory,
  User,
} from '@/lib/posLogic';
import type { MenuItem, CartItem, Expense, SaleRecord } from '@/data/menu';

// ── Helpers ──

const sampleMenu: MenuItem[] = [
  { id: 'sm1', name: 'Chicken Pastil', price: 25, category: 'Sulit Meals' },
  { id: 'sm2', name: 'Pork Sisig', price: 25, category: 'Sulit Meals' },
  { id: 'sl1', name: 'Longganisa', price: 55, category: 'Silog Meals' },
  { id: 'ff1', name: 'Fish Tofu (12)', price: 80, category: 'Finger Foods' },
  { id: 'al1', name: 'Whole Fried Chicken Oriental', price: 350, category: 'A La Carte' },
  { id: 'z1', name: 'Free Water', price: 0, category: 'Sulit Meals' },
];

const today = new Date().toString();

const seedUsers: User[] = [
  { email: 'admin@maifah.com', name: 'Admin', password: 'admin123', role: 'Owner' },
];

// ════════════════════════════════════════════════════════
// CART TESTS
// ════════════════════════════════════════════════════════

describe('Cart', () => {
  it('addToCart with new item sets qty to 1', () => {
    const cart = addToCart([], 'sm1', sampleMenu);
    expect(cart).toHaveLength(1);
    expect(cart[0].quantity).toBe(1);
  });

  it('addToCart with same item twice sets qty to 2', () => {
    let cart = addToCart([], 'sm1', sampleMenu);
    cart = addToCart(cart, 'sm1', sampleMenu);
    expect(cart).toHaveLength(1);
    expect(cart[0].quantity).toBe(2);
  });

  it('addToCart with multiple different items tracks each separately', () => {
    let cart = addToCart([], 'sm1', sampleMenu);
    cart = addToCart(cart, 'sl1', sampleMenu);
    expect(cart).toHaveLength(2);
    expect(cart[0].id).toBe('sm1');
    expect(cart[1].id).toBe('sl1');
  });

  it('removeFromCart decreases qty by 1', () => {
    let cart = addToCart([], 'sm1', sampleMenu);
    cart = addToCart(cart, 'sm1', sampleMenu);
    cart = removeFromCart(cart, 'sm1');
    expect(cart[0].quantity).toBe(1);
  });

  it('removeFromCart on last item removes it completely', () => {
    let cart = addToCart([], 'sm1', sampleMenu);
    cart = removeFromCart(cart, 'sm1');
    expect(cart).toHaveLength(0);
  });

  it('removeFromCart on item not in cart does not crash', () => {
    const cart = removeFromCart([], 'nonexistent');
    expect(cart).toHaveLength(0);
  });

  it('getCartTotal returns 0 for empty cart', () => {
    expect(getCartTotal([])).toBe(0);
  });

  it('getCartTotal returns correct total for single item', () => {
    const cart = addToCart([], 'sm1', sampleMenu);
    expect(getCartTotal(cart)).toBe(25);
  });

  it('getCartTotal returns correct total for multiple items', () => {
    let cart = addToCart([], 'sm1', sampleMenu); // 25
    cart = addToCart(cart, 'sm1', sampleMenu);    // 25 x2 = 50
    cart = addToCart(cart, 'sl1', sampleMenu);    // 55
    expect(getCartTotal(cart)).toBe(105);
  });

  it('getCartTotal ignores items with price 0', () => {
    let cart = addToCart([], 'sm1', sampleMenu); // 25
    cart = addToCart(cart, 'z1', sampleMenu);     // 0
    expect(getCartTotal(cart)).toBe(25);
  });

  it('getCartCount returns 0 for empty cart', () => {
    expect(getCartCount([])).toBe(0);
  });

  it('getCartCount returns total quantity across all items', () => {
    let cart = addToCart([], 'sm1', sampleMenu);
    cart = addToCart(cart, 'sm1', sampleMenu);
    cart = addToCart(cart, 'sl1', sampleMenu);
    expect(getCartCount(cart)).toBe(3);
  });
});

// ════════════════════════════════════════════════════════
// AUTH TESTS
// ════════════════════════════════════════════════════════

describe('Auth', () => {
  it('login returns user object on valid credentials', () => {
    const user = login(seedUsers, 'admin@maifah.com', 'admin123');
    expect(user).not.toBeNull();
    expect(user!.email).toBe('admin@maifah.com');
  });

  it('login returns null on wrong password', () => {
    expect(login(seedUsers, 'admin@maifah.com', 'wrong')).toBeNull();
  });

  it('login returns null on unknown email', () => {
    expect(login(seedUsers, 'nobody@test.com', 'admin123')).toBeNull();
  });

  it('login is case insensitive for email', () => {
    const user = login(seedUsers, 'ADMIN@MAIFAH.COM', 'admin123');
    expect(user).not.toBeNull();
  });

  it('register returns true for new unique email', () => {
    const result = register(seedUsers, 'Jane', 'jane@test.com', 'pass', 'Cashier');
    expect(result.success).toBe(true);
  });

  it('register returns false for duplicate email', () => {
    const result = register(seedUsers, 'X', 'admin@maifah.com', 'p', 'Owner');
    expect(result.success).toBe(false);
  });

  it('register newly registered user can login afterwards', () => {
    const { users } = register(seedUsers, 'Jane', 'jane@test.com', 'secret', 'Cashier');
    const user = login(users, 'jane@test.com', 'secret');
    expect(user).not.toBeNull();
    expect(user!.name).toBe('Jane');
  });

  it('register stores correct name, email and role', () => {
    const { users } = register(seedUsers, 'Bob', 'bob@test.com', 'pw', 'Manager');
    const bob = users.find(u => u.email === 'bob@test.com')!;
    expect(bob.name).toBe('Bob');
    expect(bob.role).toBe('Manager');
  });
});

// ════════════════════════════════════════════════════════
// EXPENSE TESTS
// ════════════════════════════════════════════════════════

describe('Expenses', () => {
  it('addExpense increases expense list length by 1', () => {
    const result = addExpense([], 'Sugar', 100, 'Ingredients', today);
    expect(result).toHaveLength(1);
  });

  it('addExpense stores correct name and amount', () => {
    const result = addExpense([], 'Sugar', 100, 'Ingredients', today);
    expect(result[0].description).toBe('Sugar');
    expect(result[0].amount).toBe(100);
  });

  it('deleteExpense removes the correct expense by id', () => {
    let list = addExpense([], 'A', 10, 'Other', today);
    const idA = list[0].id;
    list = addExpense(list, 'B', 20, 'Other', today);
    list = deleteExpense(list, idA);
    expect(list).toHaveLength(1);
    expect(list[0].description).toBe('B');
  });

  it('deleteExpense does not crash for non-existent id', () => {
    const list = addExpense([], 'A', 10, 'Other', today);
    const result = deleteExpense(list, 'nonexistent');
    expect(result).toHaveLength(1);
  });

  it('getTodayExpenses returns 0 for empty list', () => {
    expect(getTodayExpenses([])).toBe(0);
  });

  it('getTodayExpenses returns correct sum of all amounts', () => {
    let list = addExpense([], 'A', 100, 'Other', today);
    list = addExpense(list, 'B', 50, 'Other', today);
    expect(getTodayExpenses(list)).toBe(150);
  });

  it('getTodayExpenses updates correctly after adding expense', () => {
    let list = addExpense([], 'A', 100, 'Other', today);
    expect(getTodayExpenses(list)).toBe(100);
    list = addExpense(list, 'B', 200, 'Other', today);
    expect(getTodayExpenses(list)).toBe(300);
  });

  it('getTodayExpenses updates correctly after deleting expense', () => {
    let list = addExpense([], 'A', 100, 'Other', today);
    const idA = list[0].id;
    list = addExpense(list, 'B', 200, 'Other', today);
    list = deleteExpense(list, idA);
    expect(getTodayExpenses(list)).toBe(200);
  });
});

// ════════════════════════════════════════════════════════
// REVENUE & PROFIT TESTS
// ════════════════════════════════════════════════════════

describe('Revenue and Profit', () => {
  const makeSale = (total: number): SaleRecord => ({
    id: `s-${Math.random()}`,
    items: [],
    total,
    paymentMethod: 'cash',
    date: today,
  });

  it('getTodayRevenue returns 0 for empty orders', () => {
    expect(getTodayRevenue([])).toBe(0);
  });

  it('getTodayRevenue returns correct sum of all order totals', () => {
    expect(getTodayRevenue([makeSale(100), makeSale(250)])).toBe(350);
  });

  it('getNetProfit returns revenue minus expenses', () => {
    expect(getNetProfit(500, 100)).toBe(400);
  });

  it('getNetProfit returns negative value when expenses exceed revenue', () => {
    expect(getNetProfit(200, 1000)).toBe(-800);
  });

  it('getNetProfit returns zero when revenue equals expenses', () => {
    expect(getNetProfit(300, 300)).toBe(0);
  });
});

// ════════════════════════════════════════════════════════
// MENU TESTS
// ════════════════════════════════════════════════════════

describe('Menu', () => {
  it('searchMenu returns all items for empty query', () => {
    expect(searchMenu(sampleMenu, '')).toHaveLength(sampleMenu.length);
  });

  it('searchMenu is case insensitive', () => {
    const results = searchMenu(sampleMenu, 'chicken');
    expect(results.length).toBeGreaterThan(0);
    expect(results.every(r => r.name.toLowerCase().includes('chicken'))).toBe(true);
  });

  it('searchMenu returns empty array for no match', () => {
    expect(searchMenu(sampleMenu, 'pizza')).toHaveLength(0);
  });

  it('searchMenu returns correct items for partial name match', () => {
    const results = searchMenu(sampleMenu, 'Pork');
    expect(results).toHaveLength(1);
    expect(results[0].id).toBe('sm2');
  });

  it('getByCategory returns all items for category All', () => {
    expect(getByCategory(sampleMenu, 'All')).toHaveLength(sampleMenu.length);
  });

  it('getByCategory returns only items from specified category', () => {
    const results = getByCategory(sampleMenu, 'Sulit Meals');
    expect(results.every(r => r.category === 'Sulit Meals')).toBe(true);
  });

  it('getByCategory returns empty array for unknown category', () => {
    expect(getByCategory(sampleMenu, 'Desserts')).toHaveLength(0);
  });
});
