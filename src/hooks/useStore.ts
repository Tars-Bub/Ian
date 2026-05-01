import { useSyncExternalStore, useCallback } from 'react';
import { CartItem, SaleRecord, Expense } from '@/data/menu';
import { ShiftRecord } from '@/types/user';

// --- Global store with localStorage persistence ---

type Listener = () => void;

function createStore<T>(key: string, fallback: T) {
  let data: T = fallback;
  try {
    const stored = localStorage.getItem(key);
    if (stored) data = JSON.parse(stored);
  } catch {}

  const listeners = new Set<Listener>();

  function get(): T {
    return data;
  }

  function set(updater: T | ((prev: T) => T)) {
    const newData = typeof updater === 'function' ? (updater as (prev: T) => T)(data) : updater;
    data = newData;
    try {
      localStorage.setItem(key, JSON.stringify(data));
    } catch {}
    listeners.forEach(l => l());
  }

  function subscribe(listener: Listener): () => void {
    listeners.add(listener);
    return () => { listeners.delete(listener); };
  }

  return { get, set, subscribe };
}

const salesStore = createStore<SaleRecord[]>('pos_sales', []);
const expensesStore = createStore<Expense[]>('pos_expenses', []);
const cartStore = createStore<CartItem[]>('pos_cart_temp', []);
const shiftsStore = createStore<ShiftRecord[]>('pos_shifts', []);

// Use React 18's useSyncExternalStore for reliable reactivity
function useStoreData<T>(store: { get: () => T; subscribe: (l: Listener) => () => void }): T {
  return useSyncExternalStore(store.subscribe, store.get, store.get);
}

// --- Hooks ---

export function useSales() {
  const sales = useStoreData(salesStore);

  const addSale = useCallback((sale: SaleRecord) => {
    salesStore.set(prev => [sale, ...prev]);
  }, []);

  // VOID ORDER FUNCTION - Removes order and updates analytics
  const voidOrder = useCallback((orderId: string) => {
    const orderToVoid = sales.find(s => s.id === orderId);
    if (!orderToVoid) return false;
    
    // Remove the order from sales
    salesStore.set(prev => prev.filter(sale => sale.id !== orderId));
    
    // Store void record for audit trail
    const voidRecord = {
      id: `void_${Date.now()}`,
      orderId: orderId,
      orderNumber: orderToVoid.orderNumber,
      amount: orderToVoid.total,
      items: orderToVoid.items,
      cashierName: orderToVoid.cashierName,
      paymentMethod: orderToVoid.paymentMethod,
      reason: 'Customer refund / Voided order',
      voidedAt: new Date().toISOString()
    };
    
    const existingVoids = JSON.parse(localStorage.getItem('pos_voids') || '[]');
    localStorage.setItem('pos_voids', JSON.stringify([voidRecord, ...existingVoids]));
    
    return true;
  }, [sales]);

  // Get all voided orders for reporting
  const getVoidedOrders = useCallback(() => {
    return JSON.parse(localStorage.getItem('pos_voids') || '[]');
  }, []);

  // Get total voided amount for today
  const getTodayVoidedAmount = useCallback(() => {
    const voids = JSON.parse(localStorage.getItem('pos_voids') || '[]');
    const today = new Date().toDateString();
    const todayVoids = voids.filter((v: any) => new Date(v.voidedAt).toDateString() === today);
    return todayVoids.reduce((sum: number, v: any) => sum + v.amount, 0);
  }, []);

  const today = new Date().toDateString();
  const todaySales = sales.filter(s => new Date(s.date).toDateString() === today);
  const todayRevenue = todaySales.reduce((sum, s) => sum + s.total, 0);
  const todayOrders = todaySales.length;

  const getBestSeller = () => {
    const itemCounts: Record<string, { name: string; count: number }> = {};
    todaySales.forEach(sale => {
      sale.items.forEach(item => {
        if (!itemCounts[item.id]) itemCounts[item.id] = { name: item.name, count: 0 };
        itemCounts[item.id].count += item.quantity;
      });
    });
    const sorted = Object.values(itemCounts).sort((a, b) => b.count - a.count);
    return sorted[0]?.name || 'N/A';
  };

  const getLast7DaysRevenue = () => {
    const days: { day: string; revenue: number }[] = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dayStr = d.toDateString();
      const dayLabel = d.toLocaleDateString('en', { weekday: 'short' });
      const revenue = sales
        .filter(s => new Date(s.date).toDateString() === dayStr)
        .reduce((sum, s) => sum + s.total, 0);
      days.push({ day: dayLabel, revenue });
    }
    return days;
  };

  // Get cashier performance for today
  const getCashierPerformance = () => {
    const cashierMap = new Map<string, { name: string; sales: number; orders: number; items: number }>();
    
    todaySales.forEach(sale => {
      const cashierName = sale.cashierName || 'Unknown';
      const current = cashierMap.get(cashierName) || { name: cashierName, sales: 0, orders: 0, items: 0 };
      
      current.sales += sale.total;
      current.orders += 1;
      current.items += sale.items.reduce((sum, item) => sum + item.quantity, 0);
      
      cashierMap.set(cashierName, current);
    });
    
    return Array.from(cashierMap.values()).sort((a, b) => b.sales - a.sales);
  };

  // Get sales for a specific cashier (by name) — used for "Recent Orders" fix
  const getSalesForCashier = (cashierName: string) => {
    return sales.filter(s => s.cashierName === cashierName);
  };

  return { 
    sales, 
    addSale, 
    voidOrder,
    getVoidedOrders,
    getTodayVoidedAmount,
    todaySales, 
    todayRevenue, 
    todayOrders, 
    getBestSeller, 
    getLast7DaysRevenue,
    getCashierPerformance,
    getSalesForCashier,
  };
}

export function useExpenses() {
  const expenses = useStoreData(expensesStore);

  const addExpense = useCallback((expense: Expense) => {
    expensesStore.set(prev => [expense, ...prev]);
  }, []);

  const updateExpense = useCallback((updated: Expense) => {
    expensesStore.set(prev => prev.map(e => e.id === updated.id ? updated : e));
  }, []);

  const deleteExpense = useCallback((id: string) => {
    expensesStore.set(prev => prev.filter(e => e.id !== id));
  }, []);

  const today = new Date().toDateString();
  const todayExpenses = expenses.filter(e => new Date(e.date).toDateString() === today);
  const todayExpenseTotal = todayExpenses.reduce((sum, e) => sum + e.amount, 0);

  return { expenses, addExpense, updateExpense, deleteExpense, todayExpenses, todayExpenseTotal };
}

export function useCart() {
  const cart = useStoreData(cartStore);

  const addToCart = useCallback((item: { id: string; name: string; price: number; category: string }) => {
    cartStore.set(prev => {
      const existing = prev.find(c => c.id === item.id);
      if (existing) {
        return prev.map(c => c.id === item.id ? { ...c, quantity: c.quantity + 1 } : c);
      }
      return [...prev, { ...item, quantity: 1 }];
    });
  }, []);

  const removeFromCart = useCallback((id: string) => {
    cartStore.set(prev => {
      const existing = prev.find(c => c.id === id);
      if (existing && existing.quantity > 1) {
        return prev.map(c => c.id === id ? { ...c, quantity: c.quantity - 1 } : c);
      }
      return prev.filter(c => c.id !== id);
    });
  }, []);

  const clearCart = useCallback(() => cartStore.set([]), []);

  const cartTotal = cart.reduce((sum, c) => sum + c.price * c.quantity, 0);
  const cartCount = cart.reduce((sum, c) => sum + c.quantity, 0);

  return { cart, addToCart, removeFromCart, clearCart, cartTotal, cartCount };
}

// --- Shift Store ---

export function useShifts() {
  const shifts = useStoreData(shiftsStore);

  const addShift = useCallback((shift: ShiftRecord) => {
    shiftsStore.set(prev => [shift, ...prev]);
  }, []);

  const markShiftRead = useCallback((shiftId: string) => {
    shiftsStore.set(prev => prev.map(s => s.id === shiftId ? { ...s, isRead: true } : s));
  }, []);

  const markAllShiftsRead = useCallback(() => {
    shiftsStore.set(prev => prev.map(s => ({ ...s, isRead: true })));
  }, []);

  const unreadCount = shifts.filter(s => !s.isRead).length;
  const todayShifts = shifts.filter(s => new Date(s.shiftEnd).toDateString() === new Date().toDateString());

  return { shifts, addShift, markShiftRead, markAllShiftsRead, unreadCount, todayShifts };

}
