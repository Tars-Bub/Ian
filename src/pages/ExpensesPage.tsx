import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Plus, Trash2, ArrowLeft, DollarSign, Calendar, Tag } from 'lucide-react';
import { useExpenses } from '@/hooks/useStore';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import BottomNav from '@/components/BottomNav';
import { expenseCategories } from '@/data/menu';
import ConfirmDialog from '@/components/ConfirmDialog';

const ExpensesPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { expenses, addExpense, deleteExpense, todayExpenseTotal } = useExpenses();
  const [showForm, setShowForm] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [expenseToDelete, setExpenseToDelete] = useState<{ id: string; amount: number; description: string } | null>(null);
  const [formData, setFormData] = useState({
    description: '',
    amount: '',
    category: expenseCategories[0],
    notes: ''
  });

  const categories = expenseCategories;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.description || !formData.amount) {
      toast.error('Please fill in all required fields');
      return;
    }

    const newExpense = {
      id: Date.now().toString(),
      description: formData.description,
      amount: parseFloat(formData.amount),
      category: formData.category,
      date: new Date().toISOString(),
      createdBy: user?.id || 'unknown'
    };

    addExpense(newExpense);
    toast.success('Expense added successfully');
    setFormData({ description: '', amount: '', category: categories[0], notes: '' });
    setShowForm(false);
  };

  const handleDeleteExpense = (id: string, amount: number, description: string) => {
    setExpenseToDelete({ id, amount, description });
    setShowDeleteDialog(true);
  };

  const confirmDeleteExpense = () => {
    if (expenseToDelete) {
      deleteExpense(expenseToDelete.id);
      toast.success(`Expense "${expenseToDelete.description}" deleted`);
      setShowDeleteDialog(false);
      setExpenseToDelete(null);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pb-32">
      {/* Header */}
      <div className="bg-gradient-to-r from-orange-500 to-orange-600 px-4 pt-6 pb-6 sticky top-0 z-10">
        <div className="flex justify-between items-center">
          <button
            onClick={() => navigate(-1)}
            className="w-10 h-10 rounded-full bg-white/20 hover:bg-white/30 transition-colors flex items-center justify-center"
          >
            <ArrowLeft className="w-5 h-5 text-white" />
          </button>
          <h1 className="text-xl font-bold text-white">Expenses</h1>
          <button
            onClick={() => setShowForm(!showForm)}
            className="w-10 h-10 rounded-full bg-white/20 hover:bg-white/30 transition-colors flex items-center justify-center"
          >
            <Plus className="w-5 h-5 text-white" />
          </button>
        </div>
        <div className="mt-4 bg-white/20 backdrop-blur-sm rounded-2xl p-4">
          <p className="text-sm text-white/80">Today's Total</p>
          <p className="text-3xl font-black text-white">₱{todayExpenseTotal.toLocaleString()}</p>
        </div>
      </div>

      <div className="px-4 mt-4 space-y-4">
        {/* Add Expense Form */}
        {showForm && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white dark:bg-gray-800 rounded-2xl p-5 shadow-sm border border-gray-200"
          >
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Description *
                </label>
                <input
                  type="text"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-4 py-2 rounded-xl border border-gray-300 focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  placeholder="e.g., Chicken order, Electricity bill"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Amount *
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">₱</span>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.amount}
                    onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                    className="w-full pl-8 pr-4 py-2 rounded-xl border border-gray-300 focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    placeholder="0.00"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Category
                </label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full px-4 py-2 rounded-xl border border-gray-300 focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                >
                  {categories.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="submit"
                  className="flex-1 py-3 rounded-xl bg-gradient-to-r from-orange-500 to-orange-600 text-white font-bold"
                >
                  Add Expense
                </button>
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="flex-1 py-3 rounded-xl bg-gray-200 text-gray-700 font-bold"
                >
                  Cancel
                </button>
              </div>
            </form>
          </motion.div>
        )}

        {/* Expenses List */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="p-4 border-b border-gray-200 dark:border-gray-700">
            <h2 className="font-bold text-gray-800 dark:text-white">Recent Expenses</h2>
          </div>
          
          <div className="divide-y divide-gray-200 dark:divide-gray-700 max-h-96 overflow-y-auto">
            {expenses.length === 0 ? (
              <div className="text-center py-12">
                <DollarSign className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                <p className="text-gray-500">No expenses yet</p>
                <p className="text-xs text-gray-400 mt-1">Tap the + button to add</p>
              </div>
            ) : (
              expenses.map(expense => (
                <div key={expense.id} className="p-4 flex justify-between items-center hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                  <div className="flex-1">
                    <p className="font-medium text-gray-800 dark:text-white">{expense.description}</p>
                    <div className="flex items-center gap-3 mt-1">
                      <span className="text-xs text-gray-500 flex items-center gap-1">
                        <Tag className="w-3 h-3" />
                        {expense.category}
                      </span>
                      <span className="text-xs text-gray-500 flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {new Date(expense.date).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <p className="font-bold text-red-600 dark:text-red-400 text-lg">
                      ₱{expense.amount.toLocaleString()}
                    </p>
                    <button
                      onClick={() => handleDeleteExpense(expense.id, expense.amount, expense.description)}
                      className="p-2 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/50 text-red-500 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      <BottomNav />

      {/* Delete Expense Confirmation Dialog */}
      <ConfirmDialog
        isOpen={showDeleteDialog}
        onClose={() => { setShowDeleteDialog(false); setExpenseToDelete(null); }}
        onConfirm={confirmDeleteExpense}
        title="Delete Expense"
        message={`Are you sure you want to delete this expense?\n\n${expenseToDelete?.description}\nAmount: ₱${expenseToDelete?.amount?.toLocaleString() || 0}\n\nThis action cannot be undone!`}
        confirmText="Yes, Delete"
        cancelText="Cancel"
      />
    </div>
  );
};

export default ExpensesPage;