import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Users, LogOut, User, RefreshCw, X, Check, TrendingUp, Award, Trash2, UserPlus } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { useSales } from '@/hooks/useStore';

interface AccountSwitcherProps {
  isOpen: boolean;
  onClose: () => void;
}

const AccountSwitcher = ({ isOpen, onClose }: AccountSwitcherProps) => {
  const { user, users, switchToCashier, getCashiers, setUsers, logout } = useAuth();
  const { getCashierPerformance } = useSales();
  const navigate = useNavigate();
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);
  
  const cashiers = getCashiers();
  let cashierPerformance: { name: string; sales: number; orders: number; items: number }[] = [];
  try {
    cashierPerformance = getCashierPerformance ? getCashierPerformance() : [];
  } catch (error) {
    console.error('Error getting cashier performance:', error);
    cashierPerformance = [];
  }

  const handleSwitchToCashier = (cashierId: string) => {
    const cashier = switchToCashier(cashierId);
    if (cashier) {
      toast.success(`Switched to ${cashier.fullName}`);
      onClose();
      window.location.href = '/pos';
    }
  };

  const handleDeleteAccount = (userId: string, userName: string) => {
    if (user?.id === userId) {
      toast.error('Cannot delete your own account');
      return;
    }
    
    const updatedUsers = users.filter(u => u.id !== userId);
    setUsers(updatedUsers);
    localStorage.setItem('users', JSON.stringify(updatedUsers));
    toast.success(`${userName} has been removed`);
    setShowDeleteConfirm(null);
  };

  const handleLogout = () => {
    logout();
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-50"
            onClick={onClose}
          />
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="fixed right-0 top-0 bottom-0 w-80 bg-card shadow-2xl z-50 flex flex-col"
          >
            {/* Header */}
            <div className="p-4 border-b border-border bg-gradient-to-r from-orange-500 to-orange-600">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2 min-w-0 flex-1">
                  <Users className="w-5 h-5 text-white flex-shrink-0" />
                  <h2 className="text-lg font-bold text-white break-words whitespace-normal">
                    Account Manager
                  </h2>
                </div>
                <button onClick={onClose} className="p-1 rounded-full hover:bg-white/20 transition-colors flex-shrink-0">
                  <X className="w-5 h-5 text-white" />
                </button>
              </div>
              <p className="text-xs text-white/70 mt-1 break-words whitespace-normal">
                {user?.role === 'admin' ? 'Manage users and switch accounts' : 'Your account information'}
              </p>
            </div>

            {/* Current Account */}
            <div className="p-4 border-b border-border bg-secondary/30">
              <p className="text-xs text-muted-foreground mb-2">CURRENT ACCOUNT</p>
              <div className="flex items-center gap-3 min-w-0">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                  user?.role === 'admin' ? 'gradient-orange' : 'bg-gradient-to-r from-green-500 to-green-600'
                }`}>
                  <User className="w-5 h-5 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-foreground break-words whitespace-normal">
                    {user?.fullName}
                  </p>
                  <p className="text-xs text-muted-foreground break-words whitespace-normal">
                    {user?.email}
                  </p>
                  <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                    <p className="text-xs text-primary capitalize">{user?.role}</p>
                    {user?.cashierCode && (
                      <span className="text-xs bg-gray-200 dark:bg-gray-700 px-1 rounded">#{user.cashierCode}</span>
                    )}
                  </div>
                </div>
                <button onClick={handleLogout} className="p-2 rounded-lg hover:bg-red-100 dark:hover:bg-red-900 text-red-500 transition-colors flex-shrink-0">
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Admin View */}
            {user?.role === 'admin' && (
              <div className="flex-1 overflow-y-auto p-4">
                <p className="text-xs text-muted-foreground mb-3 flex items-center gap-2">
                  <Award className="w-3 h-3 flex-shrink-0" />
                  <span className="break-words whitespace-normal">MANAGE USERS ({cashiers.length + 1} total)</span>
                </p>
                
                {/* Admin Account */}
                <div className="mb-4">
                  <div className="bg-secondary/30 rounded-xl p-3 border border-primary/20">
                    <div className="flex justify-between items-center gap-2">
                      <div className="flex items-center gap-3 min-w-0 flex-1">
                        <div className="w-10 h-10 rounded-full gradient-orange flex items-center justify-center flex-shrink-0">
                          <User className="w-5 h-5 text-white" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="font-semibold text-foreground break-words whitespace-normal">
                            Admin User
                          </p>
                          <p className="text-xs text-muted-foreground break-words whitespace-normal">
                            admin@maifah.com
                          </p>
                          <span className="text-xs text-primary">Administrator</span>
                        </div>
                      </div>
                      <span className="px-2 py-1 rounded-full bg-primary/10 text-primary text-xs font-bold flex-shrink-0">
                        Admin
                      </span>
                    </div>
                  </div>
                </div>

                {/* Cashier Accounts */}
                {cashiers.length > 0 && (
                  <>
                    <p className="text-xs text-muted-foreground mb-2 mt-4">CASHIERS</p>
                    <div className="space-y-2">
                      {cashiers.map(cashier => {
                        const performance = cashierPerformance.find(p => p.name === cashier.fullName);
                        return (
                          <div key={cashier.id} className="bg-secondary/30 rounded-xl p-3">
                            <div className="flex items-start gap-3 min-w-0">
                              <div className="w-10 h-10 rounded-full bg-gradient-to-r from-green-500 to-green-600 flex items-center justify-center text-white font-bold flex-shrink-0">
                                {cashier.fullName.charAt(0)}
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="font-semibold text-foreground break-words whitespace-normal">
                                  {cashier.fullName}
                                </p>
                                <p className="text-xs text-muted-foreground break-words whitespace-normal">
                                  {cashier.email}
                                </p>
                                <div className="flex items-center gap-2 mt-1 flex-wrap">
                                  <span className="text-xs text-green-600 dark:text-green-400">
                                    Code: {cashier.cashierCode}
                                  </span>
                                  {performance && (
                                    <span className="text-xs text-orange-600 dark:text-orange-400">
                                      ₱{performance.sales.toLocaleString()} today
                                    </span>
                                  )}
                                </div>
                              </div>
                              <div className="flex gap-1 flex-shrink-0">
                                <button
                                  onClick={() => handleSwitchToCashier(cashier.id)}
                                  className="p-1.5 rounded-lg hover:bg-primary/10 text-primary transition-colors"
                                  title="Switch to this account"
                                >
                                  <RefreshCw className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() => setShowDeleteConfirm(cashier.id)}
                                  className="p-1.5 rounded-lg hover:bg-red-100 dark:hover:bg-red-900 text-red-500 transition-colors"
                                  title="Remove this account"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            </div>
                            
                            {showDeleteConfirm === cashier.id && (
                              <div className="mt-3 pt-3 border-t border-border">
                                <p className="text-xs text-muted-foreground mb-2 break-words whitespace-normal">
                                  Are you sure you want to remove {cashier.fullName}?
                                </p>
                                <div className="flex gap-2">
                                  <button
                                    onClick={() => handleDeleteAccount(cashier.id, cashier.fullName)}
                                    className="flex-1 px-3 py-1.5 rounded-lg bg-red-500 text-white text-xs font-medium"
                                  >
                                    Yes, Remove
                                  </button>
                                  <button
                                    onClick={() => setShowDeleteConfirm(null)}
                                    className="flex-1 px-3 py-1.5 rounded-lg bg-secondary text-secondary-foreground text-xs font-medium"
                                  >
                                    Cancel
                                  </button>
                                </div>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </>
                )}

                {/* Create New Account Button */}
                <button
                  onClick={() => {
                    onClose();
                    navigate('/signup');
                  }}
                  className="w-full mt-4 py-3 rounded-xl gradient-orange text-white font-bold text-sm flex items-center justify-center gap-2"
                >
                  <UserPlus className="w-4 h-4 flex-shrink-0" />
                  <span className="break-words whitespace-normal">Create New Account</span>
                </button>

                {/* Cashier Performance Summary */}
                {cashierPerformance.length > 0 && (
                  <div className="mt-6 pt-4 border-t border-border">
                    <p className="text-xs text-muted-foreground mb-3 flex items-center gap-2">
                      <TrendingUp className="w-3 h-3 flex-shrink-0" />
                      <span className="break-words whitespace-normal">CASHIER PERFORMANCE TODAY</span>
                    </p>
                    <div className="space-y-2">
                      {cashierPerformance.map((cashier, index) => (
                        <div key={index} className="bg-secondary/30 rounded-lg p-2">
                          <div className="flex justify-between items-center gap-2">
                            <span className="text-sm font-medium break-words whitespace-normal flex-1">
                              {cashier.name}
                            </span>
                            <span className="text-sm font-bold text-primary flex-shrink-0">
                              ₱{cashier.sales.toLocaleString()}
                            </span>
                          </div>
                          <div className="flex justify-between text-xs text-muted-foreground mt-1">
                            <span>{cashier.orders} orders</span>
                            <span>{cashier.items} items</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Cashier View */}
            {user?.role === 'cashier' && (
              <div className="flex-1 overflow-y-auto p-4">
                <p className="text-xs text-muted-foreground mb-3">YOUR STATISTICS</p>
                <div className="space-y-3">
                  <div className="bg-secondary/30 rounded-xl p-3">
                    <p className="text-xs text-muted-foreground">Total Sales Today</p>
                    <p className="text-2xl font-bold text-primary break-words whitespace-normal">
                      ₱{cashierPerformance.find(p => p.name === user.fullName)?.sales?.toLocaleString() || 0}
                    </p>
                  </div>
                  <div className="bg-secondary/30 rounded-xl p-3">
                    <p className="text-xs text-muted-foreground">Orders Processed</p>
                    <p className="text-2xl font-bold text-foreground break-words whitespace-normal">
                      {cashierPerformance.find(p => p.name === user.fullName)?.orders || 0}
                    </p>
                  </div>
                  <div className="bg-secondary/30 rounded-xl p-3">
                    <p className="text-xs text-muted-foreground">Items Sold</p>
                    <p className="text-2xl font-bold text-foreground break-words whitespace-normal">
                      {cashierPerformance.find(p => p.name === user.fullName)?.items || 0}
                    </p>
                  </div>
                </div>

                <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-950 rounded-xl">
                  <p className="text-xs text-blue-700 dark:text-blue-300 break-words whitespace-normal">
                    💡 You are logged in as a cashier. Contact admin if you need assistance.
                  </p>
                </div>

                <button
                  onClick={handleLogout}
                  className="w-full mt-4 py-3 rounded-xl bg-red-500 text-white font-bold text-sm flex items-center justify-center gap-2"
                >
                  <LogOut className="w-4 h-4 flex-shrink-0" />
                  <span className="break-words whitespace-normal">Logout</span>
                </button>
              </div>
            )}

            {/* Footer */}
            <div className="p-4 border-t border-border bg-secondary/20">
              <p className="text-[10px] text-center text-muted-foreground break-words whitespace-normal">
                {user?.role === 'admin' 
                  ? 'Admins can create, switch to, and remove cashier accounts'
                  : 'Cashiers can only view their own statistics'}
              </p>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default AccountSwitcher;