export function addToCart(cart, itemId) {
  return { ...cart, [itemId]: (cart[itemId] || 0) + 1 };
}

export function removeFromCart(cart, itemId) {
  const qty = cart[itemId] || 0;
  if (qty <= 1) {
    const newCart = { ...cart };
    delete newCart[itemId];
    return newCart;
  }
  return { ...cart, [itemId]: qty - 1 };
}

export function getCartTotal(cart, menuItems) {
  return menuItems
    .filter(item => cart[item.id] > 0)
    .reduce((sum, item) => sum + item.price * cart[item.id], 0);
}

export function getCartCount(cart) {
  return Object.values(cart).reduce((sum, qty) => sum + qty, 0);
}

export function login(users, email, password) {
  return users.find(
    u => u.email.toLowerCase() === email.toLowerCase() && u.password === password
  ) || null;
}

export function register(users, name, email, password, role) {
  const exists = users.find(u => u.email.toLowerCase() === email.toLowerCase());
  if (exists) return false;
  users.push({ name, email, password, role });
  return true;
}

export function addExpense(expenses, name, amount, category, date) {
  return [{ id: Date.now(), name, amount, category, date: date || "Today" }, ...expenses];
}

export function deleteExpense(expenses, id) {
  return expenses.filter(e => e.id !== id);
}

export function getTodayExpenses(expenses) {
  return expenses.reduce((sum, e) => sum + e.amount, 0);
}

export function getTodayRevenue(orders) {
  return orders.reduce((sum, o) => sum + o.total, 0);
}

export function getNetProfit(revenue, expenses) {
  return revenue - expenses;
}

export function searchMenu(items, query) {
  if (!query || query.trim() === "") return items;
  return items.filter(i => i.name.toLowerCase().includes(query.toLowerCase()));
}

export function getByCategory(items, category) {
  if (category === "All") return items;
  return items.filter(i => i.category === category);
}