/**
 * sync.ts  –  Singleton Socket.io client for Maifah POS real-time sync
 *
 * HOW TO USE
 * ----------
 *  1. Set SERVER_URL to your deployed server address.
 *  2. Import syncManager anywhere and call its methods.
 *  3. Listen to events with syncManager.on(event, handler) inside useEffect.
 *
 * IMPORTANT: Install socket.io-client first:
 *   npm install socket.io-client
 */

import { io, Socket } from 'socket.io-client';

// ─────────────────────────────────────────────────────────────────────────────
// ⚠️  CHANGE THIS to your server's IP or domain
//     Examples:
//       Local network:  'http://192.168.1.10:3001'
//       Railway/Render: 'https://maifah-pos-server.up.railway.app'
// ─────────────────────────────────────────────────────────────────────────────
export const SERVER_URL = 'http://YOUR_SERVER_IP:3001';

export type SyncRole = 'admin' | 'cashier';

export type InventoryAction =
  | 'add_item'
  | 'edit_item'
  | 'delete_item'
  | 'add_supply'
  | 'edit_supply'
  | 'delete_supply';

export interface ModeChangedPayload {
  mode: 'inventory' | 'cashier';
  assignedBy: string;
  message: string;
  timestamp: string;
}

export interface InventoryUpdatePayload {
  action: InventoryAction;
  item: Record<string, unknown>;
  cashierId: string;
  cashierName: string;
  timestamp: string;
}

export interface CashierPresencePayload {
  cashierId: string;
  cashierName: string;
  timestamp: string;
}

// ─────────────────────────────────────────────────────────────────────────────

type Listener<T = unknown> = (data: T) => void;

class SyncManager {
  private socket: Socket | null = null;
  private registeredUserId: string | null = null;
  private listeners = new Map<string, Set<Listener>>();

  /** Connect and register with the server. Safe to call multiple times. */
  connect(userId: string, role: SyncRole, name: string) {
    // Already registered as same user — skip
    if (this.socket?.connected && this.registeredUserId === userId) return;

    // Already have a socket but different user — re-register
    if (this.socket?.connected) {
      this.socket.emit('register', { userId, role, name });
      this.registeredUserId = userId;
      return;
    }

    // Create new socket
    this.socket = io(SERVER_URL, {
      transports: ['websocket'],
      reconnectionAttempts: 5,
      reconnectionDelay: 2000,
    });

    this.socket.on('connect', () => {
      console.log('[Sync] Connected to server');
      this.socket!.emit('register', { userId, role, name });
      this.registeredUserId = userId;
    });

    this.socket.on('disconnect', () => {
      console.log('[Sync] Disconnected from server');
    });

    this.socket.on('connect_error', (err) => {
      console.warn('[Sync] Connection error:', err.message);
    });

    // ── Incoming events ────────────────────────────────────────────────
    this.socket.on('mode_changed',      (d) => this._emit('mode_changed', d));
    this.socket.on('inventory_update',  (d) => this._emit('inventory_update', d));
    this.socket.on('cashier_online',    (d) => this._emit('cashier_online', d));
    this.socket.on('cashier_offline',   (d) => this._emit('cashier_offline', d));
    this.socket.on('assign_confirmed',  (d) => this._emit('assign_confirmed', d));
    this.socket.on('registered',        (d) => this._emit('registered', d));
  }

  disconnect() {
    this.socket?.disconnect();
    this.socket = null;
    this.registeredUserId = null;
  }

  isConnected(): boolean {
    return this.socket?.connected ?? false;
  }

  // ── Subscribe to server events ──────────────────────────────────────

  on<T = unknown>(event: string, listener: Listener<T>): () => void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event)!.add(listener as Listener);
    return () => {
      this.listeners.get(event)?.delete(listener as Listener);
    };
  }

  private _emit(event: string, data: unknown) {
    this.listeners.get(event)?.forEach((l) => l(data));
  }

  // ── Emit to server ──────────────────────────────────────────────────

  /** Admin: put cashier into inventory mode */
  assignInventory(cashierId: string, cashierName: string) {
    this.socket?.emit('assign_inventory', { cashierId, cashierName });
  }

  /** Admin: switch cashier back to cashier mode */
  assignCashier(cashierId: string, cashierName: string) {
    this.socket?.emit('assign_cashier', { cashierId, cashierName });
  }

  /** Cashier: notify admin of an inventory change */
  inventoryAction(action: InventoryAction, item: Record<string, unknown>) {
    this.socket?.emit('inventory_action', { action, item });
  }
}

// Export a singleton — import this everywhere
export const syncManager = new SyncManager();
