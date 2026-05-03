// src/lib/database.js
import sqlite3 from 'sqlite3';
import { open } from 'sqlite';
import { v4 as uuidv4 } from 'uuid';
import bcrypt from 'bcryptjs';

let dbInstance = null;

// Initialize database connection
export async function initDatabase() {
  if (dbInstance) return dbInstance;
  
  dbInstance = await open({
    filename: './maifah-pos.db',
    driver: sqlite3.Database
  });
  
  await createTables();
  await seedInitialData();
  
  return dbInstance;
}

// Create all tables
async function createTables() {
  const db = dbInstance;
  
  // Users table
  await db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      full_name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      role TEXT NOT NULL CHECK (role IN ('admin', 'cashier')),
      cashier_code TEXT UNIQUE,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      last_login DATETIME,
      is_active INTEGER DEFAULT 1
    )
  `);
  
  // Categories table
  await db.exec(`
    CREATE TABLE IF NOT EXISTS categories (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL UNIQUE,
      description TEXT,
      sort_order INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);
  
  // Menu items table
  await db.exec(`
    CREATE TABLE IF NOT EXISTS menu_items (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      description TEXT,
      price REAL NOT NULL,
      category_id TEXT NOT NULL,
      image_url TEXT,
      is_available INTEGER DEFAULT 1,
      sort_order INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (category_id) REFERENCES categories(id)
    )
  `);
  
  // Orders table
  await db.exec(`
    CREATE TABLE IF NOT EXISTS orders (
      id TEXT PRIMARY KEY,
      order_number TEXT UNIQUE NOT NULL,
      cashier_id TEXT NOT NULL,
      customer_name TEXT,
      subtotal REAL NOT NULL DEFAULT 0,
      tax REAL DEFAULT 0,
      discount REAL DEFAULT 0,
      total REAL NOT NULL DEFAULT 0,
      payment_method TEXT NOT NULL,
      payment_status TEXT DEFAULT 'paid',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (cashier_id) REFERENCES users(id)
    )
  `);
  
  // Order items table
  await db.exec(`
    CREATE TABLE IF NOT EXISTS order_items (
      id TEXT PRIMARY KEY,
      order_id TEXT NOT NULL,
      menu_item_id TEXT NOT NULL,
      quantity INTEGER NOT NULL,
      unit_price REAL NOT NULL,
      subtotal REAL NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
      FOREIGN KEY (menu_item_id) REFERENCES menu_items(id)
    )
  `);
  
  // Expenses table
  await db.exec(`
    CREATE TABLE IF NOT EXISTS expenses (
      id TEXT PRIMARY KEY,
      description TEXT NOT NULL,
      category TEXT NOT NULL,
      amount REAL NOT NULL,
      notes TEXT,
      created_by TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (created_by) REFERENCES users(id)
    )
  `);
  
  // Supplies table
  await db.exec(`
    CREATE TABLE IF NOT EXISTS supplies (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      category TEXT NOT NULL,
      unit TEXT NOT NULL,
      current_stock REAL NOT NULL DEFAULT 0,
      minimum_stock REAL NOT NULL DEFAULT 0,
      unit_cost REAL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);
}

// Insert sample data
async function seedInitialData() {
  const db = dbInstance;
  
  // Check if users exist
  const userCount = await db.get('SELECT COUNT(*) as count FROM users');
  if (userCount.count > 0) return;
  
  // Create admin user (password: admin123)
  const adminHash = await bcrypt.hash('admin123', 10);
  await db.run(`
    INSERT INTO users (id, full_name, email, password_hash, role)
    VALUES (?, ?, ?, ?, ?)
  `, uuidv4(), 'Admin User', 'admin@maifah.com', adminHash, 'admin');
  
  // Create cashier user (password: cashier123)
  const cashierHash = await bcrypt.hash('cashier123', 10);
  await db.run(`
    INSERT INTO users (id, full_name, email, password_hash, role, cashier_code)
    VALUES (?, ?, ?, ?, ?, ?)
  `, uuidv4(), 'Cashier User', 'cashier@maifah.com', cashierHash, 'cashier', 'CASH001');
  
  // Insert categories
  const categories = [
    { id: uuidv4(), name: 'Coffee', sort_order: 1 },
    { id: uuidv4(), name: 'Tea', sort_order: 2 },
    { id: uuidv4(), name: 'Silog', sort_order: 3 },
    { id: uuidv4(), name: 'Pasta', sort_order: 4 },
    { id: uuidv4(), name: 'Beverages', sort_order: 5 }
  ];
  
  for (const cat of categories) {
    await db.run(`
      INSERT INTO categories (id, name, sort_order)
      VALUES (?, ?, ?)
    `, cat.id, cat.name, cat.sort_order);
  }
  
  console.log('✅ Database initialized with sample data');
}

export function generateId() {
  return uuidv4();
}

export async function getDb() {
  return await initDatabase();
}