import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Trash2, Pencil, X, ArrowLeft, DollarSign, TrendingDown, Calendar } from 'lucide-react';
import { useExpenses, useSales } from '@/hooks/useStore';
import { expenseCategories } from '@/data/menu';
import BottomNav from '@/components/BottomNav';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

// Validation function
const validateExpense = (description: string, amount: number, category: string) => {
  if (!description.trim()) {
    return { valid: false, error: 'Description is required' };
  }
  if (description.length > 100) {
    return { valid: false, error: 'Description is too long (max 100 characters)' };
  }
  if (isNaN(amount) || amount <= 0) {
    return { valid: false, error: 'Please enter a valid amount greater than 0' };
  }
  if (!category) {
    return { valid: false, error: 'Please select a category' };
  }
  return { valid: true, error: null };
};

const ExpensesPage = () => {
  const navigate = useNavigate();
  const { expenses, addExpense, updateExpense, deleteExpense, todayExpenses, todayExpenseTotal } = useExpenses();
  const { todayRevenue } = useSales();
  const [sheetOpen, setSheetOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [desc, setDesc] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState(expenseCategories[0]);
  const [date, setDate] = useState(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
  });
  const [errors, setErrors] = useState<{ description?: string; amount?: string; category?: string }>({});

  const netProfit = todayRevenue - todayExpenseTotal;

  const resetForm = () => {
    setDesc('');
    setAmount('');
    setCategory(expenseCategories[0]);
    const now = new Date();
    setDate(`${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`);
    setEditingId(null);
    setErrors({});
  };

  const openAdd = () => {
    resetForm();
    setSheetOpen(true);
  };

  const openEdit = (expense: { id: string; description: string; amount: number; category: string; date: string }) => {
    setEditingId(expense.id);
    setDesc(expense.description);
    setAmount(expense.amount.toString());
    setCategory(expense.category);
    setDate(new Date(expense.date).toISOString().split('T')[0]);
    setSheetOpen(true);
    setErrors({});
  };

  const handleSubmit = () => {
    const amountNum = parseFloat(amount);
    
    // Validate
    const validation = validateExpense(desc, amountNum, category);
    
    if (!validation.valid) {
      toast.error(validation.error);
      return;
    }
    
    const expenseData = {
      id: editingId || Date.now().toString(),
      description: desc.trim(),
      amount: amountNum,
      category,
      date: new Date(date + 'T12:00:00').toString(),
    };

    if (editingId) {
      updateExpense(expenseData);
      toast.success('Expense updated successfully');
    } else {
      addExpense(expenseData);
      toast.success('Expense added successfully');
    }

    resetForm();
    setSheetOpen(false);
  };

  const handleDelete = (id: string, name: string) => {
    if (confirm(`Are you sure you want to delete "${name}"?`)) {
      deleteExpense(id);
      toast.success('Expense deleted successfully');
    }
  };

  // Calculate category totals for all expenses
  const categoryTotals: Record<string, number> = {};
  expenses.forEach(e => {
    categoryTotals[e.category] = (categoryTotals[e.category] || 0) + e.amount;
  });

  // Sort expenses by date (newest first)
  const sortedExpenses = [...expenses].sort((a, b) => 
    new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  return (
    <div className="min-h-screen bg-background pb-32">
      {/* Header with Back Button */}
      <div className="gradient-red px-4 pt-6 pb-6 rounded-b-3xl">
        <div className="flex items-center gap-3 mb-4">
          <button
            onClick={() => navigate(-1)}
            className="p-2 rounded-full bg-destructive-foreground/20 hover:bg-destructive-foreground/30 transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-destructive-foreground" />
          </button>
          <div>
            <h1 className="text-xl font-bold text-destructive-foreground mb-1">Expenses</h1>
            <p className="text-sm text-destructive-foreground/70">Track your spending</p>
          </div>
        </div>
        <div className="mt-4 bg-destructive-foreground/20 backdrop-blur-sm rounded-2xl p-4">
          <p className="text-sm text-destructive-foreground/70">Today's Expenses</p>
          <p className="text-3xl font-black text-destructive-foreground">₱{todayExpenseTotal.toLocaleString()}</p>
        </div>
      </div>

      <div className="px-4 -mt-2">
        {/* Summary Cards */}
        <div className="grid grid-cols-3 gap-3 mb-4">
          <div className="bg-card rounded-2xl border border-border p-3 shadow-card">
            <DollarSign className="w-5 h-5 text-success mb-1" />
            <p className="text-xs text-muted-foreground">Revenue</p>
            <p className="font-bold text-success text-sm">₱{todayRevenue.toLocaleString()}</p>
          </div>
          <div className="bg-card rounded-2xl border border-border p-3 shadow-card">
            <TrendingDown className="w-5 h-5 text-expense mb-1" />
            <p className="text-xs text-muted-foreground">Expenses</p>
            <p className="font-bold text-expense text-sm">₱{todayExpenseTotal.toLocaleString()}</p>
          </div>
          <div className="bg-card rounded-2xl border border-border p-3 shadow-card">
            <DollarSign className="w-5 h-5 text-primary mb-1" />
            <p className="text-xs text-muted-foreground">Net Profit</p>
            <p className={`font-bold text-sm ${netProfit >= 0 ? 'text-success' : 'text-expense'}`}>
              ₱{netProfit.toLocaleString()}
            </p>
          </div>
        </div>

        {/* Category Breakdown */}
        {Object.keys(categoryTotals).length > 0 && (
          <div className="mb-4 bg-card rounded-2xl border border-border p-4 shadow-card">
            <h2 className="font-bold text-foreground mb-3">Category Breakdown</h2>
            <div className="space-y-2">
              {Object.entries(categoryTotals)
                .sort((a, b) => b[1] - a[1])
                .map(([cat, total]) => (
                  <div key={cat} className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">{cat}</span>
                    <span className="font-bold text-expense text-sm">₱{total.toLocaleString()}</span>
                  </div>
                ))}
            </div>
          </div>
        )}

        {/* Expense List Header */}
        <div className="flex justify-between items-center mb-3">
          <h2 className="font-bold text-foreground">All Expenses</h2>
          <span className="text-xs text-muted-foreground">{expenses.length} records</span>
        </div>

        {/* Expense List */}
        {sortedExpenses.length === 0 ? (
          <div className="bg-card rounded-2xl border border-border p-8 text-center shadow-card">
            <DollarSign className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
            <p className="text-muted-foreground">No expenses recorded</p>
            <p className="text-xs text-muted-foreground mt-1">Click the + button to add your first expense</p>
          </div>
        ) : (
          <div className="space-y-2 mb-4">
            {sortedExpenses.map(expense => (
              <motion.div
                key={expense.id}
                layout
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="bg-card rounded-xl border border-border p-3 shadow-card hover:shadow-md transition-shadow"
              >
                <div className="flex justify-between items-start mb-1">
                  <div className="flex-1">
                    <p className="font-semibold text-foreground text-sm">{expense.description}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs px-2 py-0.5 rounded-full bg-expense/10 text-expense">
                        {expense.category}
                      </span>
                      <span className="text-xs text-muted-foreground flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {new Date(expense.date).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <p className="font-bold text-expense mr-2">₱{expense.amount.toLocaleString()}</p>
                    <button 
                      onClick={() => openEdit(expense)} 
                      className="p-1.5 rounded-full hover:bg-primary/10 transition-colors"
                    >
                      <Pencil className="w-4 h-4 text-primary" />
                    </button>
                    <button 
                      onClick={() => handleDelete(expense.id, expense.description)} 
                      className="p-1.5 rounded-full hover:bg-expense/10 transition-colors"
                    >
                      <Trash2 className="w-4 h-4 text-expense" />
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* FAB Button */}
      <motion.button
        whileTap={{ scale: 0.9 }}
        onClick={openAdd}
        className="fixed bottom-20 right-4 w-14 h-14 rounded-full gradient-red shadow-float flex items-center justify-center z-40 hover:shadow-lg transition-shadow"
      >
        <Plus className="w-6 h-6 text-destructive-foreground" />
      </motion.button>

      {/* Add/Edit Expense Sheet */}
      <AnimatePresence>
        {sheetOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-foreground/30 z-50"
              onClick={() => { setSheetOpen(false); resetForm(); }}
            />
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="fixed bottom-0 left-0 right-0 bg-card rounded-t-3xl z-50 p-6"
            >
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-bold text-foreground">
                  {editingId ? 'Edit Expense' : 'Add Expense'}
                </h2>
                <button 
                  onClick={() => { setSheetOpen(false); resetForm(); }} 
                  className="p-2 rounded-full hover:bg-secondary transition-colors"
                >
                  <X className="w-5 h-5 text-muted-foreground" />
                </button>
              </div>
              <div className="space-y-3">
                <div>
                  <input
                    placeholder="Description (e.g., Rice, Vegetables, etc.)"
                    value={desc}
                    onChange={e => setDesc(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-border bg-secondary text-foreground outline-none text-sm focus:ring-2 focus:ring-expense"
                  />
                  {errors.description && (
                    <p className="text-xs text-red-500 mt-1">{errors.description}</p>
                  )}
                </div>
                <div>
                  <input
                    type="number"
                    placeholder="Amount"
                    value={amount}
                    onChange={e => setAmount(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-border bg-secondary text-foreground outline-none text-sm focus:ring-2 focus:ring-expense"
                    min="0.01"
                    step="0.01"
                  />
                  {errors.amount && (
                    <p className="text-xs text-red-500 mt-1">{errors.amount}</p>
                  )}
                </div>
                <div>
                  <select
                    value={category}
                    onChange={e => setCategory(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-border bg-secondary text-foreground outline-none text-sm focus:ring-2 focus:ring-expense"
                  >
                    {expenseCategories.map(c => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
                <input
                  type="date"
                  value={date}
                  onChange={e => setDate(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-border bg-secondary text-foreground outline-none text-sm focus:ring-2 focus:ring-expense"
                />
                <motion.button
                  whileTap={{ scale: 0.97 }}
                  onClick={handleSubmit}
                  className="w-full py-4 rounded-2xl gradient-red text-destructive-foreground font-bold text-lg"
                >
                  {editingId ? 'Update Expense' : 'Add Expense'}
                </motion.button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <BottomNav />
    </div>
  );
};

export default ExpensesPage;