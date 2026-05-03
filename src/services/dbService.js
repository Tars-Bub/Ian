// src/services/dbService.js
import { 
  openDB, 
  addItem, 
  getAllItems, 
  getItemById, 
  updateItem, 
  deleteItem,
  generateId 
} from '../lib/indexedDB';
import { menuItems as defaultMenu } from '../data/menu';

// Initialize database with sample data
export async function initDatabase() {
  try {
    await openDB();
    
    // Check if users exist
    const users = await getAllItems('users');
    if (users.length === 0) {
      await seedInitialData();
    }
    
    console.log('✅ IndexedDB initialized');
    return true;
  } catch (error) {
    console.error('❌ Database error:', error);
    return false;
  }
}

// Seed initial data
async function seedInitialData() {
  // Add default admin
  await addItem('users', {
    id: generateId(),
    fullName: 'Admin User',
    email: 'admin@maifah.com',
    password: 'admin123', // In production, hash this!
    role: 'admin',
    createdAt: new Date().toISOString()
  });
  
  // Add default cashier
  await addItem('users', {
    id: generateId(),
    fullName: 'Cashier User',
    email: 'cashier@maifah.com',
    password: 'cashier123',
    role: 'cashier',
    cashierCode: 'CASH001',
    createdAt: new Date().toISOString()
  });
  
  // Add default menu items
  for (const item of defaultMenu) {
    await addItem('menu_items', {
      ...item,
      id: generateId(),
      createdAt: new Date().toISOString()
    });
  }
  
  console.log('✅ Sample data seeded');
}

// ============ USER SERVICES ============
export const userService = {
  async getAllUsers() {
    const users = await getAllItems('users');
    return users.map(({ password, ...user }) => user);
  },
  
  async getUserByEmail(email) {
    const users = await getAllItems('users');
    return users.find(u => u.email === email);
  },
  
  async validateUser(email, password) {
    const user = await this.getUserByEmail(email);
    if (user && user.password === password) {
      const { password, ...safeUser } = user;
      return safeUser;
    }
    return null;
  },
  
  async createUser(userData) {
    const newUser = {
      id: generateId(),
      ...userData,
      createdAt: new Date().toISOString()
    };
    await addItem('users', newUser);
    const { password, ...safeUser } = newUser;
    return safeUser;
  },
  
  async deleteUser(id) {
    await deleteItem('users', id);
  }
};

// ============ ORDER SERVICES ============
export const orderService = {
  async createOrder(orderData) {
    const order = {
      id: generateId(),
      orderNumber: `ORD-${Date.now()}`,
      ...orderData,
      createdAt: new Date().toISOString()
    };
    await addItem('orders', order);
    return order;
  },
  
  async getAllOrders() {
    const orders = await getAllItems('orders');
    return orders.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  },
  
  async getTodayOrders() {
    const orders = await this.getAllOrders();
    const today = new Date().toDateString();
    return orders.filter(o => new Date(o.createdAt).toDateString() === today);
  },
  
  async getTodayRevenue() {
    const todayOrders = await this.getTodayOrders();
    const total = todayOrders.reduce((sum, order) => sum + order.total, 0);
    return total;
  },
  
  async getLast7DaysRevenue() {
    const orders = await this.getAllOrders();
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const result = [];
    
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dayStr = date.toDateString();
      const dayLabel = days[date.getDay()];
      const revenue = orders
        .filter(o => new Date(o.createdAt).toDateString() === dayStr)
        .reduce((sum, o) => sum + o.total, 0);
      result.push({ day: dayLabel, revenue });
    }
    return result;
  }
};

// ============ EXPENSE SERVICES ============
export const expenseService = {
  async addExpense(expenseData) {
    const expense = {
      id: generateId(),
      ...expenseData,
      createdAt: new Date().toISOString()
    };
    await addItem('expenses', expense);
    return expense;
  },
  
  async getAllExpenses() {
    const expenses = await getAllItems('expenses');
    return expenses.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  },
  
  async getTodayExpenses() {
    const expenses = await this.getAllExpenses();
    const today = new Date().toDateString();
    const todayExpenses = expenses.filter(e => new Date(e.createdAt).toDateString() === today);
    const total = todayExpenses.reduce((sum, e) => sum + e.amount, 0);
    return { todayExpenses, total };
  }
};

// ============ SUPPLIES SERVICES ============
export const suppliesService = {
  async getAllSupplies() {
    return await getAllItems('supplies');
  },
  
  async addSupply(supplyData) {
    const supply = {
      id: generateId(),
      ...supplyData,
      createdAt: new Date().toISOString()
    };
    await addItem('supplies', supply);
    return supply;
  },
  
  async updateStock(id, newStock) {
    await updateItem('supplies', id, { currentStock: newStock });
  },
  
  async getLowStock() {
    const supplies = await this.getAllSupplies();
    return supplies.filter(s => s.currentStock <= s.minimumStock);
  }
};

// ============ DASHBOARD SERVICES ============
export const dashboardService = {
  async getStats() {
    const todayRevenue = await orderService.getTodayRevenue();
    const { total: todayExpenses } = await expenseService.getTodayExpenses();
    const todayOrders = await orderService.getTodayOrders();
    const lowStock = await suppliesService.getLowStock();
    
    return {
      todayRevenue,
      todayExpenses,
      netProfit: todayRevenue - todayExpenses,
      todayOrders: todayOrders.length,
      lowStockCount: lowStock.length
    };
  },
  
  async getCashierPerformance() {
    const orders = await orderService.getAllOrders();
    const users = await userService.getAllUsers();
    const cashiers = users.filter(u => u.role === 'cashier');
    
    const today = new Date().toDateString();
    const performance = cashiers.map(cashier => {
      const cashierOrders = orders.filter(o => 
        o.cashierId === cashier.id && 
        new Date(o.createdAt).toDateString() === today
      );
      return {
        name: cashier.fullName,
        sales: cashierOrders.reduce((sum, o) => sum + o.total, 0),
        orders: cashierOrders.length,
        items: cashierOrders.reduce((sum, o) => sum + (o.items?.length || 0), 0)
      };
    });
    
    return performance.sort((a, b) => b.sales - a.sales);
  }
};