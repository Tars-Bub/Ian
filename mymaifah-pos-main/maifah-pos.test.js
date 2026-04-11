import { describe, test, expect, beforeEach } from "vitest";
import {
  addToCart, removeFromCart, getCartTotal, getCartCount,
  login, register,
  addExpense, deleteExpense, getTodayExpenses, getTodayRevenue, getNetProfit,
  searchMenu, getByCategory
} from "./posLogic.js";

const MENU = [
  { id: 1,   name: "Chicken Pastil",      price: 25, category: "Sulit Meals" },
  { id: 2,   name: "Pork Sisig",          price: 25, category: "Sulit Meals" },
  { id: 107, name: "Beef Tapa Silog",     price: 65, category: "Silog Meals" },
  { id: 210, name: "Beef Pares",          price: 60, category: "Rice Toppings" },
  { id: 301, name: "Whole Fried Chicken", price: 0,  category: "A La Carte" },
];

// ── Cart Tests ──────────────────────────────────────────────────────────────

describe("Cart Logic", () => {
  test("addToCart new item sets qty to 1", () => {
    expect(addToCart({}, 1)[1]).toBe(1);
  });

  test("addToCart same item twice sets qty to 2", () => {
    expect(addToCart(addToCart({}, 1), 1)[1]).toBe(2);
  });

  test("addToCart multiple items tracked separately", () => {
    const cart = addToCart(addToCart({}, 1), 2);
    expect(cart[1]).toBe(1);
    expect(cart[2]).toBe(1);
  });

  test("removeFromCart decreases qty by 1", () => {
    const cart = addToCart(addToCart({}, 1), 1);
    expect(removeFromCart(cart, 1)[1]).toBe(1);
  });

  test("removeFromCart last item removes it completely", () => {
    const cart = addToCart({}, 1);
    expect(removeFromCart(cart, 1)[1]).toBeUndefined();
  });

  test("removeFromCart item not in cart does not crash", () => {
    expect(removeFromCart({}, 999)[999]).toBeUndefined();
  });

  test("getCartTotal returns 0 for empty cart", () => {
    expect(getCartTotal({}, MENU)).toBe(0);
  });

  test("getCartTotal returns correct total for single item", () => {
    expect(getCartTotal(addToCart({}, 1), MENU)).toBe(25);
  });

  test("getCartTotal returns correct total for multiple items", () => {
    expect(getCartTotal(addToCart(addToCart({}, 1), 2), MENU)).toBe(50);
  });

  test("getCartTotal ignores items with price 0", () => {
    expect(getCartTotal(addToCart(addToCart({}, 1), 301), MENU)).toBe(25);
  });

  test("getCartCount returns 0 for empty cart", () => {
    expect(getCartCount({})).toBe(0);
  });

  test("getCartCount returns total quantity across all items", () => {
    const cart = addToCart(addToCart(addToCart({}, 1), 1), 2);
    expect(getCartCount(cart)).toBe(3);
  });
});

// ── Auth Tests ──────────────────────────────────────────────────────────────

describe("Auth Logic", () => {
  let users;
  beforeEach(() => {
    users = [{ name: "Admin", email: "admin@maifah.com", password: "admin123", role: "Manager" }];
  });

  test("login returns user on valid credentials", () => {
    expect(login(users, "admin@maifah.com", "admin123")).not.toBeNull();
  });

  test("login returns null on wrong password", () => {
    expect(login(users, "admin@maifah.com", "wrongpass")).toBeNull();
  });

  test("login returns null on unknown email", () => {
    expect(login(users, "nobody@maifah.com", "admin123")).toBeNull();
  });

  test("login is case insensitive for email", () => {
    expect(login(users, "ADMIN@MAIFAH.COM", "admin123")).not.toBeNull();
  });

  test("register returns true for new unique email", () => {
    expect(register(users, "Maria", "maria@maifah.com", "pass", "Cashier")).toBe(true);
  });

  test("register returns false for duplicate email", () => {
    expect(register(users, "Other", "admin@maifah.com", "pass", "Cashier")).toBe(false);
  });

  test("register newly registered user can login", () => {
    register(users, "Pedro", "pedro@maifah.com", "mypass", "Manager");
    expect(login(users, "pedro@maifah.com", "mypass")).not.toBeNull();
  });

  test("register stores correct role", () => {
    register(users, "Ana", "ana@maifah.com", "pass", "Owner");
    expect(login(users, "ana@maifah.com", "pass").role).toBe("Owner");
  });
});

// ── Expense Tests ───────────────────────────────────────────────────────────

describe("Expense Logic", () => {
  let expenses;
  beforeEach(() => {
    expenses = [
      { id: 1, name: "Cooking Oil", amount: 350,  category: "Supplies",    date: "Mar 14" },
      { id: 2, name: "Rice 25kg",   amount: 1200, category: "Ingredients", date: "Mar 13" },
    ];
  });

  test("addExpense increases list length by 1", () => {
    expect(addExpense(expenses, "Gas", 800, "Utilities", "Today").length).toBe(3);
  });

  test("addExpense stores correct name and amount", () => {
    const result = addExpense(expenses, "Vinegar", 80, "Supplies", "Today");
    expect(result[0].name).toBe("Vinegar");
    expect(result[0].amount).toBe(80);
  });

  test("deleteExpense removes correct expense by id", () => {
    expect(deleteExpense(expenses, 1).find(e => e.id === 1)).toBeUndefined();
  });

  test("deleteExpense does not crash for non-existent id", () => {
    expect(deleteExpense(expenses, 999).length).toBe(2);
  });

  test("getTodayExpenses returns 0 for empty list", () => {
    expect(getTodayExpenses([])).toBe(0);
  });

  test("getTodayExpenses returns correct sum", () => {
    expect(getTodayExpenses(expenses)).toBe(1550);
  });

  test("getNetProfit returns revenue minus expenses", () => {
    expect(getNetProfit(2000, 1550)).toBe(450);
  });

  test("getNetProfit returns negative when expenses exceed revenue", () => {
    expect(getNetProfit(500, 1550)).toBe(-1050);
  });

  test("getNetProfit returns zero when equal", () => {
    expect(getNetProfit(1000, 1000)).toBe(0);
  });
});

// ── Menu Tests ──────────────────────────────────────────────────────────────

describe("Menu Logic", () => {
  test("searchMenu returns all items for empty query", () => {
    expect(searchMenu(MENU, "").length).toBe(MENU.length);
  });

  test("searchMenu is case insensitive", () => {
    expect(searchMenu(MENU, "chicken").length).toBe(searchMenu(MENU, "CHICKEN").length);
  });

  test("searchMenu returns empty for no match", () => {
    expect(searchMenu(MENU, "zzznomatch").length).toBe(0);
  });

  test("searchMenu returns correct items for partial match", () => {
    expect(searchMenu(MENU, "pares").length).toBeGreaterThan(0);
  });

  test("getByCategory All returns everything", () => {
    expect(getByCategory(MENU, "All").length).toBe(MENU.length);
  });

  test("getByCategory returns only items from that category", () => {
    getByCategory(MENU, "Sulit Meals").forEach(item =>
      expect(item.category).toBe("Sulit Meals")
    );
  });

  test("getByCategory returns empty for unknown category", () => {
    expect(getByCategory(MENU, "Unknown").length).toBe(0);
  });
});