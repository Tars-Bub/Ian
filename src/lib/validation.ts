import { z } from 'zod';

export const expenseSchema = z.object({
  description: z.string().min(1, 'Description is required').max(100, 'Description too long'),
  amount: z.number().positive('Amount must be greater than 0'),
  category: z.string().min(1, 'Category is required'),
  date: z.string().datetime(),
});

export const userSchema = z.object({
  fullName: z.string().min(2, 'Name must be at least 2 characters').max(50, 'Name too long'),
  email: z.string().email('Invalid email format'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  role: z.enum(['admin', 'cashier']),
});

export const cartItemSchema = z.object({
  id: z.string(),
  name: z.string(),
  price: z.number().positive(),
  quantity: z.number().int().positive(),
  category: z.string(),
});

export const saleSchema = z.object({
  items: z.array(cartItemSchema),
  total: z.number().positive(),
  paymentMethod: z.enum(['cash', 'cashless']),
  cashierName: z.string(),
  cashierId: z.string().optional(),
});

export const validateExpense = (data: unknown) => {
  return expenseSchema.safeParse(data);
};

export const validateUser = (data: unknown) => {
  return userSchema.safeParse(data);
};

export const validateSale = (data: unknown) => {
  return saleSchema.safeParse(data);
};