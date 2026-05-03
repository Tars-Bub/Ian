import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShoppingBag, Coffee, Receipt, Clock, ArrowLeft, LogOut, Users, TrendingUp, DollarSign, Star, Moon, Sun, Package, Award, LogIn, ArrowLeftRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import BottomNav from '@/components/BottomNav';import { useAuth } from '@/hooks/useAuth';
import { useSales, useShifts } from '@/hooks/useStore';
import { useTheme } from '@/hooks/useTheme';
import AccountSwitcher from '@/components/AccountSwitcher';
import { toast } from 'sonner';
import { ShiftRecord } from '@/types/user';

const CashierDashboard = () => {
  const [showAccountSwitcher, setShowAccountSwitcher] = useState(false);
  const [showEndShiftDialog, setShowEndShiftDialog] = useState(false);
  const [shiftStartTime] = useState(() => {
    const stored = localStorage.getItem('shiftStartTime');
    return stored ? stored : new Date().toISOString();
  });
  const navigate = useNavigate();
  const { user, isAuthenticated, isLoading, logout } = useAuth();
  const { theme, toggleTheme, setUserThemePreference } = useTheme();
  const { todayRevenue, todayOrders, getBestSeller, todaySales, getSalesForCashier } = useSales();
  const { addShift } = useShifts();
  
  const [currentTime, setCurrentTime] = useState(new Date());
  useEffect(() => {
    // Save shift start time if not already set
    if (!localStorage.getItem('shiftStartTime')) {
      localStorage.setItem('shiftStartTime', new Date().toISOString());
    }
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const timeStr = currentTime.toLocaleTimeString('en-PH', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  const dateStr = currentTime.toLocaleDateString('en-PH', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

  // Redirect if not cashier
  useEffect(() => {
    if (!isLoading) {
      if (!isAuthenticated) {
        navigate('/login', { replace: true });
      } else if (user?.role !== 'cashier') {
        navigate('/dashboard', { replace: true });
      }
    }
  }, [isLoading, isAuthenticated, user, navigate]);

  // FIXED: Use getSalesForCashier to get ALL sales for this cashier (not just today)
  const allMySales = user ? getSalesForCashier(user.fullName) : [];
  
  // Today's sales for this cashier specifically
  const today = new Date().toDateString();
  const mySales = allMySales.filter(s => new Date(s.date).toDateString() === today);
  const myTotalSales = mySales.reduce((sum, sale) => sum + sale.total, 0);
  const myOrderCount = mySales.length;
  const myItemsSold = mySales.reduce((sum, sale) => 
    sum + sale.items.reduce((itemSum, item) => itemSum + item.quantity, 0), 0
  );
  const myAverageOrder = myOrderCount > 0 ? myTotalSales / myOrderCount : 0;

  const averageOrderValue = todayOrders > 0 ? todayRevenue / todayOrders : 0;
  // FIXED: Show all of this cashier's sales, sorted newest first, limit 10
  const recentOrders = mySales.slice(0, 10);
  const totalItemsSold = todaySales.reduce((sum, sale) => 
    sum + sale.items.reduce((itemSum, item) => itemSum + item.quantity, 0), 0
  );

  const handleLogout = () => {
    logout();
  };

  const handleThemeToggle = () => {
    toggleTheme();
    if (user?.id) {
      const newTheme = theme === 'light' ? 'dark' : 'light';
      setUserThemePreference(user.id, newTheme);
    }
  };

  const handleEndShift = () => {
    setShowEndShiftDialog(true);
  };

  const confirmEndShift = () => {
    if (!user) return;

    const shiftEnd = new Date().toISOString();
    const shiftRecord: ShiftRecord = {
      id: Date.now().toString(),
      cashierId: user.id,
      cashierName: user.fullName,
      cashierCode: user.cashierCode,
      shiftStart: shiftStartTime,
      shiftEnd,
      totalSales: myTotalSales,
      totalOrders: myOrderCount,
      totalItems: myItemsSold,
      salesBreakdown: mySales.map(s => ({
        id: s.id,
        items: s.items.map(i => ({ name: i.name, quantity: i.quantity, price: i.price })),
        total: s.total,
        date: s.date,
      })),
      isRead: false,
    };

    addShift(shiftRecord);
    localStorage.removeItem('shiftStartTime');
    
    toast.success('Shift ended! Admin has been notified.', { duration: 4000 });
    setShowEndShiftDialog(false);
    
    // Log out after ending shift
    setTimeout(() => {
      logout();
    }, 1500);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated || user?.role !== 'cashier') {
    return null;
  }

  const shiftDuration = () => {
    const start = new Date(shiftStartTime);
    const diffMs = currentTime.getTime() - start.getTime();
    const hours = Math.floor(diffMs / (1000 * 60 * 60));
    const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
    return `${hours}h ${minutes}m`;
  };

  return (
    <>
      <div className="min-h-screen bg-background pb-32">
        {/* Header */}
        <div className="gradient-orange px-4 pt-6 pb-6 rounded-b-3xl">
          <div className="flex justify-between items-start mb-4">
            <div className="flex items-center gap-3">
              <button
                onClick={() => navigate('/pos')}
                className="p-2 rounded-full bg-primary-foreground/20 hover:bg-primary-foreground/30 transition-colors"
              >
                <ArrowLeft className="w-5 h-5 text-primary-foreground" />
              </button>
              <div>
                <h1 className="text-xl font-bold text-primary-foreground">Cashier Dashboard</h1>
                <p className="text-sm text-primary-foreground/70">Welcome back, {user.fullName}!</p>
              </div>
            </div>
            <div className="flex gap-2">
  {user.assignedOperation === 'inventory' && (
  <button
    onClick={() => navigate('/select')}
    title="Switch Mode"
    className="p-2 rounded-full bg-primary-foreground/20 hover:bg-primary-foreground/30 transition-colors"
  >
    <ArrowLeftRight className="w-5 h-5 text-primary-foreground" />
  </button>
)}
  <button
    onClick={handleThemeToggle}
    className="p-2 rounded-full bg-primary-foreground/20 hover:bg-primary-foreground/30 transition-colors"
  >
                {theme === 'light' ? (
                  <Moon className="w-5 h-5 text-primary-foreground" />
                ) : (
                  <Sun className="w-5 h-5 text-primary-foreground" />
                )}
              </button>
              <button
                onClick={() => setShowAccountSwitcher(true)}
                className="p-2 rounded-full bg-primary-foreground/20 hover:bg-primary-foreground/30 transition-colors"
              >
                <Users className="w-5 h-5 text-primary-foreground" />
              </button>
              <button
                onClick={handleLogout}
                className="p-2 rounded-full bg-primary-foreground/20 hover:bg-primary-foreground/30 transition-colors"
              >
                <LogOut className="w-5 h-5 text-primary-foreground" />
              </button>
            </div>
          </div>
          <div className="text-right">
            <p className="text-xs text-primary-foreground/70">{dateStr}</p>
            <p className="text-sm font-semibold text-primary-foreground">{timeStr}</p>
          </div>
        </div>

        <div className="px-4 -mt-2 pb-4">
          {/* Shift Info Banner */}
          <div className="bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-2xl p-3 mb-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              <div>
                <p className="text-xs font-semibold text-blue-700 dark:text-blue-300">Shift Duration</p>
                <p className="text-sm font-bold text-blue-800 dark:text-blue-200">{shiftDuration()}</p>
              </div>
            </div>
            <button
              onClick={handleEndShift}
              className="px-4 py-2 rounded-xl bg-red-500 hover:bg-red-600 text-white text-sm font-bold transition-colors flex items-center gap-1.5"
            >
              <LogIn className="w-4 h-4" />
              End Shift
            </button>
          </div>

          {/* Today's Overall Stats */}
          <div className="grid grid-cols-2 gap-3 mb-4">
            <div className="bg-card rounded-2xl border border-border p-4 shadow-card">
              <DollarSign className="w-5 h-5 text-success mb-2" />
              <p className="text-xs text-muted-foreground">Today's Total Sales</p>
              <p className="font-bold text-success text-lg">₱{todayRevenue.toLocaleString()}</p>
            </div>
            <div className="bg-card rounded-2xl border border-border p-4 shadow-card">
              <ShoppingBag className="w-5 h-5 text-primary mb-2" />
              <p className="text-xs text-muted-foreground">Total Orders Today</p>
              <p className="font-bold text-foreground text-lg">{todayOrders}</p>
            </div>
            <div className="bg-card rounded-2xl border border-border p-4 shadow-card">
              <Star className="w-5 h-5 text-yellow-500 mb-2" />
              <p className="text-xs text-muted-foreground">Best Seller</p>
              <p className="font-bold text-foreground text-sm truncate">{getBestSeller()}</p>
            </div>
            <div className="bg-card rounded-2xl border border-border p-4 shadow-card">
              <TrendingUp className="w-5 h-5 text-green-500 mb-2" />
              <p className="text-xs text-muted-foreground">Avg. Order Value</p>
              <p className="font-bold text-foreground text-sm">₱{averageOrderValue.toFixed(0)}</p>
            </div>
          </div>

          {/* Your Performance Card */}
          <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-2xl p-5 text-white mb-4 shadow-lg">
            <div className="flex items-center gap-2 mb-3">
              <Award className="w-5 h-5" />
              <p className="text-sm font-semibold">YOUR PERFORMANCE TODAY</p>
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div className="text-center">
                <p className="text-2xl font-bold">₱{myTotalSales.toLocaleString()}</p>
                <p className="text-xs opacity-90">Total Sales</p>
              </div>
              <div className="text-center border-l border-white/30">
                <p className="text-2xl font-bold">{myOrderCount}</p>
                <p className="text-xs opacity-90">Orders</p>
              </div>
              <div className="text-center border-l border-white/30">
                <p className="text-2xl font-bold">{myItemsSold}</p>
                <p className="text-xs opacity-90">Items Sold</p>
              </div>
            </div>
            {myOrderCount > 0 && (
              <div className="mt-3 pt-2 border-t border-white/30 text-center">
                <p className="text-xs opacity-90">Average Order: ₱{myAverageOrder.toFixed(0)}</p>
              </div>
            )}
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-2 gap-3 mb-4">
            <div className="bg-card rounded-2xl border border-border p-4 shadow-card">
              <Clock className="w-5 h-5 text-blue-500 mb-2" />
              <p className="text-xs text-muted-foreground">Shift Started</p>
              <p className="font-bold text-foreground text-sm">{new Date(shiftStartTime).toLocaleTimeString('en-PH', { hour: '2-digit', minute: '2-digit' })}</p>
              <p className="text-xs text-muted-foreground mt-1">{shiftDuration()} elapsed</p>
            </div>
            <div className="bg-card rounded-2xl border border-border p-4 shadow-card">
              <Package className="w-5 h-5 text-orange-500 mb-2" />
              <p className="text-xs text-muted-foreground">Total Items Sold</p>
              <p className="font-bold text-foreground text-lg">{totalItemsSold}</p>
              <p className="text-xs text-muted-foreground mt-1">All cashiers combined</p>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="mb-4">
            <h2 className="font-bold text-foreground mb-3">Quick Actions</h2>
            <div className="grid grid-cols-2 gap-3">
              <motion.button
                whileTap={{ scale: 0.97 }}
                onClick={() => navigate('/pos')}
                className="bg-card border border-border rounded-2xl p-4 text-left shadow-card hover:border-primary/30 hover:shadow-lg transition-all"
              >
                <ShoppingBag className="w-6 h-6 text-primary mb-2" />
                <p className="font-bold text-foreground">New Order</p>
                <p className="text-xs text-muted-foreground">Start a new transaction</p>
              </motion.button>
              
              <motion.button
                whileTap={{ scale: 0.97 }}
                onClick={handleEndShift}
                className="bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 rounded-2xl p-4 text-left shadow-card hover:border-red-400 transition-all"
              >
                <LogIn className="w-6 h-6 text-red-500 mb-2" />
                <p className="font-bold text-red-600 dark:text-red-400">End Shift</p>
                <p className="text-xs text-muted-foreground">Notify admin & log out</p>
              </motion.button>
            </div>
          </div>

          {/* Recent Orders - FIXED */}
          <div className="mb-4">
            <div className="flex justify-between items-center mb-3">
              <h2 className="font-bold text-foreground">Your Recent Orders</h2>
              <span className="text-xs text-muted-foreground">{myOrderCount} orders today</span>
            </div>
            {recentOrders.length === 0 ? (
              <div className="bg-card rounded-2xl border border-border p-8 text-center shadow-card">
                <Coffee className="w-12 h-12 text-muted-foreground mx-auto mb-2" />
                <p className="text-muted-foreground">No orders yet today</p>
                <p className="text-xs text-muted-foreground mt-1">Start by creating a new order</p>
              </div>
            ) : (
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {recentOrders.map(order => (
                  <div key={order.id} className="bg-card rounded-xl border border-border p-3 shadow-card">
                    <div className="flex justify-between items-start mb-1">
                      <div className="flex-1">
                        <p className="font-semibold text-sm">
                          {order.items.slice(0, 2).map(i => i.name).join(', ')}
                          {order.items.length > 2 && ` +${order.items.length - 2} more`}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {order.paymentMethod} • {new Date(order.date).toLocaleTimeString()}
                        </p>
                      </div>
                      <p className="font-bold text-primary ml-2">₱{order.total.toLocaleString()}</p>
                    </div>
                    <div className="flex justify-between items-center mt-2">
                      <span className="text-xs text-muted-foreground">
                        {order.items.reduce((sum, i) => sum + i.quantity, 0)} items
                      </span>
                      <button
                        onClick={() => toast.info('Receipt reprint coming soon')}
                        className="text-xs text-primary hover:underline"
                      >
                        Reprint
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Performance Note */}
          <div className="mb-4">
            <div className="bg-blue-50 dark:bg-blue-950 rounded-2xl p-3 border border-blue-100 dark:border-blue-800">
              <p className="text-xs text-blue-700 dark:text-blue-300">
                You've processed {myOrderCount} orders today totaling ₱{myTotalSales.toLocaleString()}.
                {myOrderCount > 0 && ` You've sold ${myItemsSold} items!`} Keep up the great work!
              </p>
            </div>
          </div>
        </div>

        <BottomNav />
      </div>

      {/* End Shift Confirmation Dialog */}
      <AnimatePresence>
        {showEndShiftDialog && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 z-50 flex items-end sm:items-center justify-center p-4"
            onClick={() => setShowEndShiftDialog(false)}
          >
            <motion.div
              initial={{ y: 80, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 80, opacity: 0 }}
              className="bg-card rounded-3xl p-6 w-full max-w-sm shadow-2xl"
              onClick={e => e.stopPropagation()}
            >
              <div className="text-center mb-5">
                <div className="w-16 h-16 bg-red-100 dark:bg-red-950 rounded-full flex items-center justify-center mx-auto mb-3">
                  <LogIn className="w-8 h-8 text-red-500" />
                </div>
                <h2 className="text-xl font-bold text-foreground mb-1">End Your Shift?</h2>
                <p className="text-sm text-muted-foreground">This will notify the admin with your shift summary and log you out.</p>
              </div>

              {/* Shift Summary */}
              <div className="bg-muted rounded-2xl p-4 mb-5 space-y-2">
                <p className="text-xs font-bold text-muted-foreground uppercase tracking-wide mb-2">Shift Summary</p>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Cashier</span>
                  <span className="font-semibold">{user.fullName}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Shift Duration</span>
                  <span className="font-semibold">{shiftDuration()}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Orders Processed</span>
                  <span className="font-semibold">{myOrderCount}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Items Sold</span>
                  <span className="font-semibold">{myItemsSold}</span>
                </div>
                <div className="flex justify-between text-sm border-t border-border pt-2 mt-2">
                  <span className="font-bold">Total Sales</span>
                  <span className="font-bold text-green-600">₱{myTotalSales.toLocaleString()}</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => setShowEndShiftDialog(false)}
                  className="py-3 rounded-2xl bg-muted text-muted-foreground font-semibold hover:bg-muted/80 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmEndShift}
                  className="py-3 rounded-2xl bg-red-500 hover:bg-red-600 text-white font-bold transition-colors"
                >
                  End Shift
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AccountSwitcher 
        isOpen={showAccountSwitcher}
        onClose={() => setShowAccountSwitcher(false)}
      />
    </>
  );
};

export default CashierDashboard;
