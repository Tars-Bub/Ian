export interface User {
  id: string;
  fullName: string;
  email: string;
  password: string;
  role: 'admin' | 'cashier';
  assignedOperation: 'cashier' | 'inventory' | null;
  createdAt: string;
}

export const DEFAULT_ADMIN: User = {
  id: '1',
  fullName: 'Admin',
  email: 'admin@maifah.com',
  password: 'admin123',
  role: 'admin',
  assignedOperation: 'inventory',
  createdAt: new Date().toISOString(),
};