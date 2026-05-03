// Pure business logic functions — no React, no side effects.

import type { MenuItem, CartItem, Expense, SaleRecord } from '@/data/menu';

// ── Cart ──────────────────────────────────────────────

export function addToCart(cart: CartItem[], itemId: string, menuItems: MenuItem[]): CartItem[] {
  const existing = cart.find(c => c.id === itemId);
  if (existing) {
    return cart.map(c => c.id === itemId ? { ...c, quantity: c.quantity + 1 } : c);
  }
  const menuItem = menuItems.find(m => m.id === itemId);
  if (!menuItem) return cart;
  return [...cart, { ...menuItem, quantity: 1 }];
}

export function removeFromCart(cart: CartItem[], itemId: string): CartItem[] {
  const existing = cart.find(c => c.id === itemId);
  if (!existing) return cart;
  if (existing.quantity > 1) {
    return cart.map(c => c.id === itemId ? { ...c, quantity: c.quantity - 1 } : c);
  }
  return cart.filter(c => c.id !== itemId);
}

export function getCartTotal(cart: CartItem[]): number {
  return cart.reduce((sum, c) => sum + c.price * c.quantity, 0);
}

export function getCartCount(cart: CartItem[]): number {
  return cart.reduce((sum, c) => sum + c.quantity, 0);
}

// ── Auth ──────────────────────────────────────────────

export interface User {
  email: string;
  name: string;
  password: string;
  role: string;
}

export function login(users: User[], email: string, password: string): Omit<User, 'password'> | null {
  const found = users.find(u => u.email.toLowerCase() === email.toLowerCase() && u.password === password);
  if (!found) return null;
  const { password: _, ...rest } = found;
  return rest;
}

export function register(
  users: User[],
  name: string,
  email: string,
  password: string,
  role: string
): { users: User[]; success: boolean } {
  if (users.find(u => u.email.toLowerCase() === email.toLowerCase())) {
    return { users, success: false };
  }
  return { users: [...users, { email, name, password, role }], success: true };
}

// ── Expenses ──────────────────────────────────────────

export function addExpense(
  expenses: Expense[],
  name: string,
  amount: number,
  category: string,
  date: string
): Expense[] {
  const id = crypto.randomUUID ? crypto.randomUUID() : `e-${Date.now()}-${Math.random()}`;
  return [...expenses, { id, description: name, amount, category, date }];
}

export function deleteExpense(expenses: Expense[], id: string): Expense[] {
  return expenses.filter(e => e.id !== id);
}

export function getTodayExpenses(expenses: Expense[]): number {
  const today = new Date().toDateString();
  return expenses
    .filter(e => new Date(e.date).toDateString() === today)
    .reduce((sum, e) => sum + e.amount, 0);
}

// ── Revenue / Profit ──────────────────────────────────

export function getTodayRevenue(orders: SaleRecord[]): number {
  const today = new Date().toDateString();
  return orders
    .filter(o => new Date(o.date).toDateString() === today)
    .reduce((sum, o) => sum + o.total, 0);
}

export function getNetProfit(revenue: number, expenses: number): number {
  return revenue - expenses;
}

// ── Menu ──────────────────────────────────────────────

export function searchMenu(items: MenuItem[], query: string): MenuItem[] {
  if (!query) return items;
  const lower = query.toLowerCase();
  return items.filter(i => i.name.toLowerCase().includes(lower));
}

export function getByCategory(items: MenuItem[], category: string): MenuItem[] {
  if (category === 'All') return items;
  return items.filter(i => i.category === category);
}
