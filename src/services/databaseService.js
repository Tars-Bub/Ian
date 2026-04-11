// src/services/databaseService.js
import { getDb, generateId } from '../lib/database';
import bcrypt from 'bcryptjs';

// User Service
export const userService = {
  async getUserByEmail(email) {
    const db = await getDb();
    return await db.get('SELECT * FROM users WHERE email = ? AND is_active = 1', email);
  },
  
  async getUserById(id) {
    const db = await getDb();
    return await db.get('SELECT id, full_name, email, role, cashier_code FROM users WHERE id = ? AND is_active = 1', id);
  },
  
  async getAllUsers() {
    const db = await getDb();
    return await db.all('SELECT id, full_name, email, role, cashier_code, created_at FROM users WHERE is_active = 1');
  },
  
  async getCashiers() {
    const db = await getDb();
    return await db.all('SELECT id, full_name, email, cashier_code FROM users WHERE role = "cashier" AND is_active = 1');
  },
  
  async validateUser(email, password) {
    const db = await getDb();
    const user = await db.get('SELECT * FROM users WHERE email = ? AND is_active = 1', email);
    
    if (!user) return null;
    
    const isValid = await bcrypt.compare(password, user.password_hash);
    if (!isValid) return null;
    
    // Update last login
    await db.run('UPDATE users SET last_login = CURRENT_TIMESTAMP WHERE id = ?', user.id);
    
    return user;
  },
  
  async createUser(userData) {
    const db = await getDb();
    const id = generateId();
    const passwordHash = await bcrypt.hash(userData.password, 10);
    
    await db.run(`
      INSERT INTO users (id, full_name, email, password_hash, role, cashier_code)
      VALUES (?, ?, ?, ?, ?, ?)
    `, id, userData.fullName, userData.email, passwordHash, userData.role, userData.cashierCode);
    
    return { id, ...userData };
  },
  
  async deleteUser(id) {
    const db = await getDb();
    await db.run('UPDATE users SET is_active = 0 WHERE id = ?', id);
  }
};

// Order Service
export const orderService = {
  async createOrder(orderData) {
    const db = await getDb();
    const orderId = generateId();
    const orderNumber = `ORD-${Date.now()}`;
    
    await db.run(`
      INSERT INTO orders (id, order_number, cashier_id, customer_name, subtotal, tax, discount, total, payment_method)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, orderId, orderNumber, orderData.cashierId, orderData.customerName || '',
       orderData.subtotal, orderData.tax || 0, orderData.discount || 0, orderData.total, orderData.paymentMethod);
    
    // Insert order items
    for (const item of orderData.items) {
      await db.run(`
        INSERT INTO order_items (id, order_id, menu_item_id, quantity, unit_price, subtotal)
        VALUES (?, ?, ?, ?, ?, ?)
      `, generateId(), orderId, item.id, item.quantity, item.price, item.price * item.quantity);
    }
    
    return { id: orderId, orderNumber };
  },
  
  async getTodaySales() {
    const db = await getDb();
    const today = new Date().toISOString().split('T')[0];
    
    const revenue = await db.get(`
      SELECT COALESCE(SUM(total), 0) as total FROM orders 
      WHERE DATE(created_at) = DATE('now')
    `);
    
    const orders = await db.get(`
      SELECT COUNT(*) as count FROM orders 
      WHERE DATE(created_at) = DATE('now')
    `);
    
    return {
      todayRevenue: revenue.total,
      todayOrders: orders.count
    };
  },
  
  async getRecentOrders(limit = 10) {
    const db = await getDb();
    return await db.all(`
      SELECT o.*, u.full_name as cashierName 
      FROM orders o
      JOIN users u ON o.cashier_id = u.id
      ORDER BY o.created_at DESC
      LIMIT ?
    `, limit);
  },
  
  async getLast7DaysRevenue() {
    const db = await getDb();
    return await db.all(`
      SELECT DATE(created_at) as day, COALESCE(SUM(total), 0) as revenue
      FROM orders
      WHERE created_at >= DATE('now', '-6 days')
      GROUP BY DATE(created_at)
      ORDER BY day
    `);
  }
};

// Expense Service
export const expenseService = {
  async addExpense(expenseData) {
    const db = await getDb();
    const id = generateId();
    
    await db.run(`
      INSERT INTO expenses (id, description, category, amount, notes, created_by)
      VALUES (?, ?, ?, ?, ?, ?)
    `, id, expenseData.description, expenseData.category, expenseData.amount, expenseData.notes, expenseData.createdBy);
    
    return { id, ...expenseData };
  },
  
  async getTodayExpenses() {
    const db = await getDb();
    const total = await db.get(`
      SELECT COALESCE(SUM(amount), 0) as total FROM expenses 
      WHERE DATE(created_at) = DATE('now')
    `);
    
    const expenses = await db.all(`
      SELECT * FROM expenses 
      WHERE DATE(created_at) = DATE('now')
      ORDER BY created_at DESC
    `);
    
    return { todayExpenseTotal: total.total, todayExpenses: expenses };
  },
  
  async getAllExpenses(limit = 50) {
    const db = await getDb();
    return await db.all(`
      SELECT e.*, u.full_name as createdByName
      FROM expenses e
      JOIN users u ON e.created_by = u.id
      ORDER BY e.created_at DESC
      LIMIT ?
    `, limit);
  }
};

// Supplies Service
export const suppliesService = {
  async getAllSupplies() {
    const db = await getDb();
    return await db.all('SELECT * FROM supplies ORDER BY name');
  },
  
  async updateStock(id, quantity) {
    const db = await getDb();
    await db.run(`
      UPDATE supplies 
      SET current_stock = current_stock + ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `, quantity, id);
    
    return await db.get('SELECT * FROM supplies WHERE id = ?', id);
  },
  
  async getLowStock() {
    const db = await getDb();
    return await db.all('SELECT * FROM supplies WHERE current_stock <= minimum_stock');
  }
};

// Dashboard Service
export const dashboardService = {
  async getStats() {
    const db = await getDb();
    
    const todayRevenue = await db.get(`
      SELECT COALESCE(SUM(total), 0) as total FROM orders WHERE DATE(created_at) = DATE('now')
    `);
    
    const todayOrders = await db.get(`
      SELECT COUNT(*) as count FROM orders WHERE DATE(created_at) = DATE('now')
    `);
    
    const todayExpenses = await db.get(`
      SELECT COALESCE(SUM(amount), 0) as total FROM expenses WHERE DATE(created_at) = DATE('now')
    `);
    
    const lowStock = await db.get(`
      SELECT COUNT(*) as count FROM supplies WHERE current_stock <= minimum_stock
    `);
    
    return {
      todayRevenue: todayRevenue.total,
      todayOrders: todayOrders.count,
      todayExpenses: todayExpenses.total,
      netProfit: todayRevenue.total - todayExpenses.total,
      lowStockCount: lowStock.count
    };
  },
  
  async getCashierPerformance() {
    const db = await getDb();
    return await db.all(`
      SELECT u.full_name as name, 
             COUNT(o.id) as orders,
             COALESCE(SUM(o.total), 0) as sales,
             COALESCE(SUM(oi.quantity), 0) as items
      FROM users u
      LEFT JOIN orders o ON o.cashier_id = u.id AND DATE(o.created_at) = DATE('now')
      LEFT JOIN order_items oi ON oi.order_id = o.id
      WHERE u.role = 'cashier'
      GROUP BY u.id
      ORDER BY sales DESC
    `);
  }
};