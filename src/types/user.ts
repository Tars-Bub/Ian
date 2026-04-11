export interface User {
  id: string;
  fullName: string;
  email: string;
  password: string;
  role: 'admin' | 'cashier';
  assignedOperation: 'cashier' | 'inventory' | null;
  cashierId?: string; // Unique ID for cashier
  cashierCode?: string; // Display code (CASH001, CASH002)
  createdAt: string;
  lastActive?: string;
  totalSales?: number;
  totalOrders?: number;
}

export interface ShiftRecord {
  id: string;
  cashierId: string;
  cashierName: string;
  cashierCode?: string;
  shiftStart: string;
  shiftEnd: string;
  totalSales: number;
  totalOrders: number;
  totalItems: number;
  salesBreakdown: { id: string; items: { name: string; quantity: number; price: number }[]; total: number; date: string }[];
  isRead: boolean;
}

export const DEFAULT_ADMIN: User = {
  id: '1',
  fullName: 'Admin User',
  email: 'admin@maifah.com',
  password: 'admin123',
  role: 'admin',
  assignedOperation: 'inventory',
  createdAt: new Date().toISOString(),
};

export const DEMO_CASHIERS: User[] = [
  {
    id: '2',
    fullName: 'Maria Santos',
    email: 'cashier1@maifah.com',
    password: 'cashier123',
    role: 'cashier',
    assignedOperation: 'cashier',
    cashierId: 'CASH001',
    cashierCode: 'MS001',
    createdAt: new Date().toISOString(),
    totalSales: 0,
    totalOrders: 0,
  },
  {
    id: '3',
    fullName: 'John Reyes',
    email: 'cashier2@maifah.com',
    password: 'cashier123',
    role: 'cashier',
    assignedOperation: 'cashier',
    cashierId: 'CASH002',
    cashierCode: 'JR002',
    createdAt: new Date().toISOString(),
    totalSales: 0,
    totalOrders: 0,
  },
  {
    id: '4',
    fullName: 'Anna Cruz',
    email: 'cashier3@maifah.com',
    password: 'cashier123',
    role: 'cashier',
    assignedOperation: 'cashier',
    cashierId: 'CASH003',
    cashierCode: 'AC003',
    createdAt: new Date().toISOString(),
    totalSales: 0,
    totalOrders: 0,
  },
];