// src/services/voidService.ts
import { openDB } from '@/lib/indexedDB';

export interface VoidResult {
  success: boolean;
  message: string;
  voidedOrder: any;
}

export async function voidOrder(orderId: string, reason: string = 'Customer refund'): Promise<VoidResult> {
  try {
    const db = await openDB();
    
    // 1. Get the order to void
    const order = await getOrderById(db, orderId);
    if (!order) {
      return { success: false, message: 'Order not found', voidedOrder: null };
    }
    
    // 2. Create a void record (for audit trail)
    const voidRecord = {
      id: `void_${Date.now()}`,
      orderId: orderId,
      originalOrderNumber: order.orderNumber,
      amount: order.total,
      reason: reason,
      voidedAt: new Date().toISOString(),
      voidedBy: localStorage.getItem('currentUser') || 'Unknown'
    };
    
    // 3. Remove the order from sales store
    const transaction = db.transaction(['orders', 'voids'], 'readwrite');
    const ordersStore = transaction.objectStore('orders');
    await ordersStore.delete(orderId);
    
    // 4. Store void record
    const voidsStore = transaction.objectStore('voids');
    await voidsStore.add(voidRecord);
    
    return {
      success: true,
      message: `Order voided successfully! ₱${order.total.toLocaleString()} refunded.`,
      voidedOrder: order
    };
    
  } catch (error) {
    console.error('Void order failed:', error);
    return { success: false, message: 'Failed to void order', voidedOrder: null };
  }
}

async function getOrderById(db: IDBDatabase, id: string): Promise<any> {
  return new Promise((resolve, reject) => {
    const transaction = db.transaction('orders', 'readonly');
    const store = transaction.objectStore('orders');
    const request = store.get(id);
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

// Function to get all voided orders (for reporting)
export async function getVoidedOrders(): Promise<any[]> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction('voids', 'readonly');
    const store = transaction.objectStore('voids');
    const request = store.getAll();
    request.onsuccess = () => resolve(request.result || []);
    request.onerror = () => reject(request.error);
  });
}