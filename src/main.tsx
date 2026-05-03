// src/main.tsx
import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { useAuth } from "./hooks/useAuth";

// Create AuthProvider right here
import { createContext, useContext } from 'react';

type AuthContextType = ReturnType<typeof useAuth>;

const AuthContext = createContext<AuthContextType | null>(null);

function AuthProvider({ children }: { children: React.ReactNode }) {
  const auth = useAuth();
  return (
    <AuthContext.Provider value={auth}>
      {children}
    </AuthContext.Provider>
  );
}

// ============ SAMPLE DATA WITH CASHIER SHIFT SCHEDULES ============

function getDateTime(daysAgo: number, hour: number, minute: number = 0): string {
  const date = new Date();
  date.setDate(date.getDate() + daysAgo);
  date.setHours(hour, minute, 0, 0);
  return date.toISOString();
}

// Cashier Shift Schedules (for accurate SQA reporting)
const cashierShifts = {
  'Maria Santos': {
    id: '2',
    code: 'MS001',
    shifts: [
      { day: -6, start: 8, end: 16, date: 'Sunday' },      // Sunday
      { day: -4, start: 8, end: 16, date: 'Tuesday' },     // Tuesday
      { day: -2, start: 8, end: 16, date: 'Thursday' },    // Thursday
      { day: 0, start: 8, end: 16, date: 'Saturday' },     // Saturday (today)
    ]
  },
  'John Reyes': {
    id: '3',
    code: 'JR002',
    shifts: [
      { day: -5, start: 12, end: 20, date: 'Monday' },     // Monday
      { day: -3, start: 12, end: 20, date: 'Wednesday' },  // Wednesday
      { day: -1, start: 12, end: 20, date: 'Friday' },     // Friday
    ]
  },
  'Anna Cruz': {
    id: '4',
    code: 'AC003',
    shifts: [
      { day: -6, start: 16, end: 22, date: 'Sunday' },     // Sunday evening
      { day: -5, start: 16, end: 22, date: 'Monday' },     // Monday evening
      { day: -4, start: 16, end: 22, date: 'Tuesday' },    // Tuesday evening
      { day: -3, start: 16, end: 22, date: 'Wednesday' },  // Wednesday evening
      { day: -2, start: 16, end: 22, date: 'Thursday' },   // Thursday evening
      { day: -1, start: 16, end: 22, date: 'Friday' },     // Friday evening
      { day: 0, start: 16, end: 22, date: 'Saturday' },    // Saturday evening
    ]
  },
};

// Menu items with complete structure
const menuItemDetails: Record<string, { id: string; name: string; price: number; category: string }> = {
  'Chicken Pastil': { id: 'sm1', name: 'Chicken Pastil', price: 25, category: 'Sulit Meals' },
  'Pork Sisig': { id: 'sm2', name: 'Pork Sisig', price: 25, category: 'Sulit Meals' },
  'Longganisa Silog': { id: 'sl1', name: 'Longganisa Silog', price: 55, category: 'Silog Meals' },
  'Beef Tapa Silog': { id: 'sl7', name: 'Beef Tapa Silog', price: 65, category: 'Silog Meals' },
  'Lechon Kawali Silog': { id: 'sl2', name: 'Lechon Kawali Silog', price: 110, category: 'Silog Meals' },
  'Beef Pares': { id: 'rt10', name: 'Beef Pares', price: 60, category: 'Rice Toppings' },
  'Siomai': { id: 'ff2', name: 'Siomai (10 pcs)', price: 70, category: 'Finger Foods' },
  'Flavored Fries': { id: 'ff7', name: 'Flavored Fries', price: 50, category: 'Finger Foods' },
  'Whole Fried Chicken': { id: 'al1', name: 'Whole Fried Chicken', price: 350, category: 'A La Carte' },
};

// Helper function to create items array
function createItems(itemNames: string[], quantities: number[]) {
  return itemNames.map((name, index) => {
    const item = menuItemDetails[name];
    return {
      id: item.id,
      name: item.name,
      price: item.price,
      quantity: quantities[index],
      category: item.category
    };
  });
}

// Generate orders based on shift schedules (accurate for SQA)
function generateShiftBasedOrders() {
  const orders: any[] = [];
  let orderCounter = 1;
  
  // Daily revenue targets (matches your research paper)
  const dailyTargets = [3250, 4120, 5430, 6890, 7210, 8540, 9230];
  const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  
  // Orders per cashier per shift (for accurate SQA metrics)
  const cashierOrderCounts = {
    'Maria Santos': { orders: 0, revenue: 0 },
    'John Reyes': { orders: 0, revenue: 0 },
    'Anna Cruz': { orders: 0, revenue: 0 },
  };
  
  for (let day = 0; day < 7; day++) {
    const targetRevenue = dailyTargets[day];
    let currentRevenue = 0;
    const dayOrders: any[] = [];
    
    // Determine which cashiers work this day
    const cashiersOnDuty = [];
    for (const [cashierName, schedule] of Object.entries(cashierShifts)) {
      const hasShift = schedule.shifts.some(shift => shift.day === -6 + day);
      if (hasShift) {
        cashiersOnDuty.push(cashierName);
      }
    }
    
    // Generate 8-18 orders per day
    const numOrders = Math.floor(Math.random() * 15) + 12;
    
    for (let orderNum = 0; orderNum < numOrders; orderNum++) {
      // Select cashier from those on duty
      const cashier = cashiersOnDuty[Math.floor(Math.random() * cashiersOnDuty.length)];
      if (!cashier) continue;
      
      // Get cashier's shift hours for this day
      const cashierSchedule = cashierShifts[cashier];
      const shift = cashierSchedule.shifts.find(s => s.day === -6 + day);
      if (!shift) continue;
      
      // Generate random time within shift hours
      const hour = Math.floor(Math.random() * (shift.end - shift.start)) + shift.start;
      const minute = Math.floor(Math.random() * 59);
      
      // Random number of items per order (1-4 items)
      const numItems = Math.floor(Math.random() * 4) + 1;
      const items: any[] = [];
      let orderTotal = 0;
      
      // Generate random items for this order
      const shuffledItems = [...Object.values(menuItemDetails)];
      for (let i = 0; i < numItems && i < shuffledItems.length; i++) {
        const randomItem = shuffledItems[Math.floor(Math.random() * shuffledItems.length)];
        const quantity = Math.floor(Math.random() * 2) + 1;
        const itemTotal = randomItem.price * quantity;
        
        items.push({
          id: randomItem.id,
          name: randomItem.name,
          price: randomItem.price,
          quantity: quantity,
          category: randomItem.category
        });
        
        orderTotal += itemTotal;
      }
      
      // Random payment method (70% cash, 30% GCash)
      const paymentMethod = Math.random() < 0.7 ? 'cash' : 'gcash';
      
      dayOrders.push({
        id: `shift_order_${day}_${orderNum}`,
        orderNumber: `ORD-${String(orderCounter).padStart(4, '0')}`,
        total: orderTotal,
        date: getDateTime(-6 + day, hour, minute),
        items: items,
        cashierName: cashier,
        cashierId: cashierShifts[cashier].id,
        cashierCode: cashierShifts[cashier].code,
        paymentMethod: paymentMethod,
        shiftStart: `${hour}:00`,
        shiftEnd: `${shift.end}:00`,
      });
      
      currentRevenue += orderTotal;
      cashierOrderCounts[cashier].orders += 1;
      cashierOrderCounts[cashier].revenue += orderTotal;
      orderCounter++;
    }
    
    // If we haven't met the revenue target, add a big order
    if (currentRevenue < targetRevenue && dayOrders.length > 0) {
      const difference = targetRevenue - currentRevenue;
      const bigItem = menuItemDetails['Whole Fried Chicken'];
      const quantity = Math.ceil(difference / bigItem.price);
      
      dayOrders.push({
        id: `shift_order_target_${day}`,
        orderNumber: `ORD-${String(orderCounter).padStart(4, '0')}`,
        total: bigItem.price * quantity,
        date: getDateTime(-6 + day, 19, 0),
        items: [{
          id: bigItem.id,
          name: bigItem.name,
          price: bigItem.price,
          quantity: quantity,
          category: bigItem.category
        }],
        cashierName: cashiersOnDuty[0] || 'Maria Santos',
        cashierId: cashierShifts[cashiersOnDuty[0]]?.id || '2',
        cashierCode: cashierShifts[cashiersOnDuty[0]]?.code || 'MS001',
        paymentMethod: 'cash',
        shiftStart: '16:00',
        shiftEnd: '22:00',
      });
      orderCounter++;
    }
    
    orders.push(...dayOrders);
    console.log(`${dayNames[day]}: ${dayOrders.length} orders, ₱${currentRevenue.toLocaleString()} revenue, Cashiers: ${cashiersOnDuty.join(', ')}`);
  }
  
  console.log('\n📊 CASHIER SHIFT PERFORMANCE SUMMARY:');
  for (const [cashier, stats] of Object.entries(cashierOrderCounts)) {
    console.log(`   ${cashier}: ${stats.orders} orders, ₱${stats.revenue.toLocaleString()} revenue`);
  }
  
  return orders;
}

// Generate sample expenses
const generateExpenses = () => {
  const today = getDateTime(0, 12, 0);
  return [
    { id: 'e1', description: 'Chicken Supply (50kg)', amount: 5000, category: 'Ingredients', date: today },
    { id: 'e2', description: 'Vegetables Assorted', amount: 2000, category: 'Ingredients', date: today },
    { id: 'e3', description: 'Electricity Bill - March', amount: 3500, category: 'Utilities', date: today },
    { id: 'e4', description: 'Water Bill - March', amount: 1200, category: 'Utilities', date: today },
    { id: 'e5', description: 'Packaging Materials', amount: 1800, category: 'Supplies', date: today },
    { id: 'e6', description: 'Staff Wages (Weekly)', amount: 4500, category: 'Wages', date: today },
    { id: 'e7', description: 'Cooking Oil (20L)', amount: 800, category: 'Ingredients', date: today },
    { id: 'e8', description: 'Cleaning Supplies', amount: 500, category: 'Supplies', date: today },
    { id: 'e9', description: 'Rice (50kg)', amount: 2200, category: 'Ingredients', date: today },
    { id: 'e10', description: 'Internet Bill', amount: 1500, category: 'Utilities', date: today },
  ];
};

// Generate shift records for each cashier (for SQA shift reporting)
function generateShiftRecords(orders: any[]) {
  const shiftRecords: any[] = [];
  const shiftMap = new Map();
  
  orders.forEach(order => {
    const key = `${order.cashierId}_${order.date.split('T')[0]}`;
    if (!shiftMap.has(key)) {
      shiftMap.set(key, {
        cashierId: order.cashierId,
        cashierName: order.cashierName,
        cashierCode: order.cashierCode,
        date: order.date.split('T')[0],
        totalSales: 0,
        totalOrders: 0,
        totalItems: 0,
        shiftStart: order.shiftStart,
        shiftEnd: order.shiftEnd,
      });
    }
    
    const record = shiftMap.get(key);
    record.totalSales += order.total;
    record.totalOrders += 1;
    record.totalItems += order.items.reduce((sum: number, item: any) => sum + item.quantity, 0);
  });
  
  shiftMap.forEach((record, key) => {
    shiftRecords.push({
      id: `shift_${key}`,
      cashierId: record.cashierId,
      cashierName: record.cashierName,
      cashierCode: record.cashierCode,
      shiftStart: getDateTime(
        -Math.abs(new Date().getDate() - new Date(record.date).getDate()),
        parseInt(record.shiftStart),
        0
      ),
      shiftEnd: getDateTime(
        -Math.abs(new Date().getDate() - new Date(record.date).getDate()),
        parseInt(record.shiftEnd),
        0
      ),
      totalSales: record.totalSales,
      totalOrders: record.totalOrders,
      totalItems: record.totalItems,
      salesBreakdown: orders.filter(o => o.cashierId === record.cashierId && o.date.split('T')[0] === record.date),
      isRead: false,
    });
  });
  
  return shiftRecords;
}

// ============ ONE-TIME DATA LOAD (Preserves user orders) ============
const SAMPLE_DATA_LOADED_KEY = 'maifah_sample_data_loaded';
const SAMPLE_DATA_VERSION = '1.0';

function loadInitialData() {
  const sampleDataStatus = localStorage.getItem(SAMPLE_DATA_LOADED_KEY);
  const currentUser = localStorage.getItem('currentUser');
  
  // Check if sample data already loaded
  if (sampleDataStatus === SAMPLE_DATA_VERSION) {
    console.log("✅ Sample data already loaded. Preserving existing data including your orders.");
    
    // Log current stats
    const existingSales = localStorage.getItem('pos_sales');
    if (existingSales) {
      const sales = JSON.parse(existingSales);
      console.log(`   Current total orders: ${sales.length}`);
      console.log(`   Current total revenue: ₱${sales.reduce((sum: number, s: any) => sum + s.total, 0).toLocaleString()}`);
    }
    return;
  }
  
  console.log("📊 First time setup - Loading sample data with shift schedules...");
  
  // Generate orders based on shift schedules
  const sampleOrders = generateShiftBasedOrders();
  const sampleExpenses = generateExpenses();
  const shiftRecords = generateShiftRecords(sampleOrders);
  
  // Save to localStorage
  localStorage.setItem('pos_sales', JSON.stringify(sampleOrders));
  localStorage.setItem('pos_expenses', JSON.stringify(sampleExpenses));
  localStorage.setItem('pos_shifts', JSON.stringify(shiftRecords));
  localStorage.setItem(SAMPLE_DATA_LOADED_KEY, SAMPLE_DATA_VERSION);
  
  // Calculate and display stats
  const totalRevenue = sampleOrders.reduce((sum, sale) => sum + sale.total, 0);
  const totalExpenses = sampleExpenses.reduce((sum, exp) => sum + exp.amount, 0);
  const uniqueCashiers = [...new Set(sampleOrders.map(o => o.cashierName))];
  
  console.log("\n✅ SAMPLE DATA LOADED SUCCESSFULLY!");
  console.log(`   📦 Total Orders: ${sampleOrders.length}`);
  console.log(`   💰 Total Revenue: ₱${totalRevenue.toLocaleString()}`);
  console.log(`   📉 Total Expenses: ₱${totalExpenses.toLocaleString()}`);
  console.log(`   📈 Net Profit: ₱${(totalRevenue - totalExpenses).toLocaleString()}`);
  console.log(`   👥 Cashiers: ${uniqueCashiers.join(', ')}`);
  console.log(`   📅 Shift Records: ${shiftRecords.length}`);
  console.log("\n💡 TIP: Your future orders will be ADDED to this data - nothing will be overwritten!");
}

// Initialize data (ONE TIME ONLY)
loadInitialData();

createRoot(document.getElementById("root")!).render(
  <AuthProvider>
    <App />
  </AuthProvider>
);