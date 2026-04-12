import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSales, useExpenses, useShifts } from '@/hooks/useStore';
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip, PieChart, Pie, Cell, Legend, LineChart, Line } from 'recharts';
import { TrendingUp, ShoppingBag, DollarSign, Star, FileText, Package, Users, AlertTriangle, ArrowLeft, Calendar, Download, Award, UserCheck, Moon, Sun, LogOut, Plus, Trash2, RefreshCw, Bell, Clock, X, CheckCheck } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import BottomNav from '@/components/BottomNav';
import { generateDailyReport } from '@/lib/generateReport';
import { toast } from 'sonner';
import SuppliesManager from '@/components/SuppliesManager';
import { useAuth } from '@/hooks/useAuth';
import { useTheme } from '@/hooks/useTheme';
import AccountSwitcher from '@/components/AccountSwitcher';
import { ErrorBoundary } from '@/components/ErrorBoundary';

const DashboardPage = () => {
  const [activeTab, setActiveTab] = useState<'sales' | 'expenses' | 'supplies' | 'cashiers' | 'users' | 'shifts'>('sales');
  const [dateRange, setDateRange] = useState<'today' | 'week' | 'month'>('today');
  const [showAccountSwitcher, setShowAccountSwitcher] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  
  // Filtered data states
  const [filteredRevenue, setFilteredRevenue] = useState(0);
  const [filteredExpenses, setFilteredExpenses] = useState(0);
  const [filteredOrders, setFilteredOrders] = useState(0);
  
  const { user, isAuthenticated, isLoading, logout, getCashiers, deleteUser, switchToCashier } = useAuth();
  const { theme, toggleTheme, setUserThemePreference } = useTheme();
  const { shifts, markShiftRead, markAllShiftsRead, unreadCount, todayShifts } = useShifts();
  const navigate = useNavigate();
  
  const { 
    todayRevenue, 
    todayOrders, 
    getBestSeller, 
    getLast7DaysRevenue, 
    todaySales, 
    sales,
    getCashierPerformance,
  } = useSales();
  const { todayExpenseTotal, todayExpenses, expenses } = useExpenses();
  const chartData = getLast7DaysRevenue();
  const netProfit = todayRevenue - todayExpenseTotal;
  
  // Redirect if not admin
  useEffect(() => {
    if (!isLoading) {
      if (!isAuthenticated) {
        navigate('/login', { replace: true });
      } else if (user?.role !== 'admin') {
        navigate('/pos', { replace: true });
      }
    }
  }, [isLoading, isAuthenticated, user, navigate]);

  // Filter data based on date range - FIXED VERSION
  useEffect(() => {
    const now = new Date();
    let startDate = new Date();
    
    // Set start date based on selected range
    if (dateRange === 'today') {
      startDate = new Date();
      startDate.setHours(0, 0, 0, 0);
    } else if (dateRange === 'week') {
      startDate = new Date(now);
      startDate.setDate(now.getDate() - 7);
      startDate.setHours(0, 0, 0, 0);
    } else if (dateRange === 'month') {
      startDate = new Date(now);
      startDate.setMonth(now.getMonth() - 1);
      startDate.setHours(0, 0, 0, 0);
    }
    
    console.log('Date range:', dateRange, 'Start date:', startDate);
    console.log('Total sales in DB:', sales.length);
    
    // Filter sales
    const filteredSales = sales.filter(sale => {
      const saleDate = new Date(sale.date);
      const isAfter = saleDate >= startDate;
      return isAfter;
    });
    
    // Filter expenses
    const filteredExpensesData = expenses.filter(expense => {
      const expenseDate = new Date(expense.date);
      return expenseDate >= startDate;
    });
    
    const revenueSum = filteredSales.reduce((sum, sale) => sum + sale.total, 0);
    const expensesSum = filteredExpensesData.reduce((sum, expense) => sum + expense.amount, 0);
    
    console.log('Filtered sales count:', filteredSales.length, 'Revenue:', revenueSum);
    console.log('Filtered expenses count:', filteredExpensesData.length, 'Expenses:', expensesSum);
    
    setFilteredRevenue(revenueSum);
    setFilteredOrders(filteredSales.length);
    setFilteredExpenses(expensesSum);
  }, [dateRange, sales, expenses]);

  // Safely get cashier performance
  let cashierPerformance: { name: string; sales: number; orders: number; items: number }[] = [];
  try {
    cashierPerformance = getCashierPerformance ? getCashierPerformance() : [];
  } catch (error) {
    console.error('Error getting cashier performance:', error);
    cashierPerformance = [];
  }
  
  const cashiers = getCashiers ? getCashiers() : [];

  const handleThemeToggle = () => {
    toggleTheme();
    if (user?.id) {
      const newTheme = theme === 'light' ? 'dark' : 'light';
      setUserThemePreference(user.id, newTheme);
    }
  };

  const handleLogout = () => {
    logout();
  };

  const handleSwitchToCashier = (cashierId: string) => {
    const cashier = switchToCashier(cashierId);
    if (cashier) {
      toast.success(`Switched to ${cashier.fullName}`);
      navigate('/pos', { replace: true });
    }
  };

  const getDateRangeLabel = () => {
    switch(dateRange) {
      case 'today': return "Today's";
      case 'week': return "This Week's";
      case 'month': return "This Month's";
      default: return "Today's";
    }
  };

  // Calculate category sales
  const getCategorySales = () => {
    const categories: Record<string, number> = {};
    todaySales.forEach(sale => {
      sale.items.forEach(item => {
        categories[item.category] = (categories[item.category] || 0) + (item.price * item.quantity);
      });
    });
    return Object.entries(categories).map(([name, value]) => ({ name, value }));
  };

  const categoryData = getCategorySales();
  const COLORS = ['#FF6B35', '#FF8C42', '#FFA559', '#FFB347', '#FFC46B', '#FFD58C', '#FFE4A0', '#FFEDB5'];

  // Calculate month-to-date revenue
  const getMonthToDateRevenue = () => {
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();
    
    return sales
      .filter(sale => {
        const saleDate = new Date(sale.date);
        return saleDate.getMonth() === currentMonth && saleDate.getFullYear() === currentYear;
      })
      .reduce((sum, sale) => sum + sale.total, 0);
  };

  const monthToDateRevenue = getMonthToDateRevenue();

  // Calculate weekly data
  const getWeeklyData = () => {
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const weeklyData = days.map(day => ({ day, revenue: 0, orders: 0 }));
    
    sales.forEach(sale => {
      const saleDate = new Date(sale.date);
      const dayName = days[saleDate.getDay()];
      const dayData = weeklyData.find(d => d.day === dayName);
      if (dayData) {
        dayData.revenue += sale.total;
        dayData.orders += 1;
      }
    });
    
    return weeklyData;
  };

  const weeklyData = getWeeklyData();

  const handleGenerateReport = () => {
    generateDailyReport(todaySales, todayExpenses, todayRevenue, todayExpenseTotal, getBestSeller());
    toast.success('Report downloaded successfully');
  };

  // Get top performer
  const topPerformer = cashierPerformance.length > 0 ? cashierPerformance[0] : null;
  const totalCashierSales = cashierPerformance.reduce((sum, c) => sum + c.sales, 0);
  const cashierSalesPercentage = totalCashierSales > 0 ? (topPerformer?.sales / totalCashierSales) * 100 : 0;

  // Show loading while checking auth
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white dark:bg-gray-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading dashboard...</p>
        </div>
      </div>
    );
  }
  
  // Don't render if not admin
  if (!isAuthenticated || user?.role !== 'admin') {
    return null;
  }

  return (
    <>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pb-32">
        {/* Header */}
        <div className="bg-gradient-to-r from-orange-500 to-orange-600 px-4 pt-6 pb-6 sticky top-0 z-10">
          <div className="flex justify-between items-start">
            <div className="flex items-center gap-3">
              <button
                onClick={() => navigate('/')}
                className="w-10 h-10 rounded-full bg-white/20 hover:bg-white/30 transition-colors flex items-center justify-center"
              >
                <ArrowLeft className="w-5 h-5 text-white" />
              </button>
              <div>
                <h1 className="text-xl font-bold text-white mb-1">Admin Dashboard</h1>
                <p className="text-sm text-white/80">Welcome, {user?.fullName}</p>
              </div>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setShowNotifications(true)}
                className="w-10 h-10 rounded-full bg-white/20 hover:bg-white/30 transition-colors flex items-center justify-center relative"
              >
                <Bell className="w-5 h-5 text-white" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full text-xs text-white font-bold flex items-center justify-center">
                    {unreadCount}
                  </span>
                )}
              </button>
              <button
                onClick={handleThemeToggle}
                className="w-10 h-10 rounded-full bg-white/20 hover:bg-white/30 transition-colors flex items-center justify-center"
              >
                {theme === 'light' ? (
                  <Moon className="w-5 h-5 text-white" />
                ) : (
                  <Sun className="w-5 h-5 text-white" />
                )}
              </button>
              <button
                onClick={() => setShowAccountSwitcher(true)}
                className="w-10 h-10 rounded-full bg-white/20 hover:bg-white/30 transition-colors flex items-center justify-center"
              >
                <Users className="w-5 h-5 text-white" />
              </button>
              <button
                onClick={handleLogout}
                className="w-10 h-10 rounded-full bg-white/20 hover:bg-white/30 transition-colors flex items-center justify-center"
              >
                <LogOut className="w-5 h-5 text-white" />
              </button>
            </div>
          </div>
          
          {/* Date Range Selector */}
          <div className="mt-4 flex gap-2 overflow-x-auto pb-1">
            <button
              onClick={() => setDateRange('today')}
              className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all ${
                dateRange === 'today'
                  ? 'bg-white text-orange-600'
                  : 'bg-white/20 text-white hover:bg-white/30'
              }`}
            >
              Today
            </button>
            <button
              onClick={() => setDateRange('week')}
              className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all ${
                dateRange === 'week'
                  ? 'bg-white text-orange-600'
                  : 'bg-white/20 text-white hover:bg-white/30'
              }`}
            >
              This Week
            </button>
            <button
              onClick={() => setDateRange('month')}
              className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all ${
                dateRange === 'month'
                  ? 'bg-white text-orange-600'
                  : 'bg-white/20 text-white hover:bg-white/30'
              }`}
            >
              This Month
            </button>
          </div>
          
          <div className="mt-4 bg-white/20 backdrop-blur-sm rounded-2xl p-4">
            <p className="text-sm text-white/80">{getDateRangeLabel()} Revenue</p>
            <p className="text-3xl font-black text-white">₱{filteredRevenue.toLocaleString()}</p>
          </div>
        </div>

        <div className="px-4 -mt-2 pb-4">
          {/* Summary Cards with Date Range Filter */}
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-4 shadow-sm hover:shadow-md transition-shadow">
              <DollarSign className="w-5 h-5 text-green-500 mb-2" />
              <p className="text-xs text-gray-500 dark:text-gray-400">{getDateRangeLabel()} Revenue</p>
              <p className="font-bold text-green-600 dark:text-green-400 text-xl">₱{filteredRevenue.toLocaleString()}</p>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-4 shadow-sm hover:shadow-md transition-shadow">
              <TrendingUp className="w-5 h-5 text-red-500 mb-2" />
              <p className="text-xs text-gray-500 dark:text-gray-400">{getDateRangeLabel()} Expenses</p>
              <p className="font-bold text-red-600 dark:text-red-400 text-xl">₱{filteredExpenses.toLocaleString()}</p>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-4 shadow-sm hover:shadow-md transition-shadow">
              <DollarSign className="w-5 h-5 text-orange-500 mb-2" />
              <p className="text-xs text-gray-500 dark:text-gray-400">{getDateRangeLabel()} Net Profit</p>
              <p className={`font-bold text-xl ${(filteredRevenue - filteredExpenses) >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                ₱{(filteredRevenue - filteredExpenses).toLocaleString()}
              </p>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-4 shadow-sm hover:shadow-md transition-shadow">
              <ShoppingBag className="w-5 h-5 text-orange-500 mb-2" />
              <p className="text-xs text-gray-500 dark:text-gray-400">{getDateRangeLabel()} Orders</p>
              <p className="font-bold text-gray-800 dark:text-white text-xl">{filteredOrders}</p>
            </div>
          </div>

          {/* Tab Navigation */}
          <div className="flex gap-2 mb-6 overflow-x-auto pb-2 categories-scroll">
            {[
              { id: 'sales', label: 'Sales Analytics', icon: TrendingUp },
              { id: 'expenses', label: 'Expenses', icon: DollarSign },
              { id: 'supplies', label: 'Supplies', icon: Package },
              { id: 'cashiers', label: 'Cashiers', icon: Users },
              { id: 'shifts', label: 'Shifts', icon: Clock },
              { id: 'users', label: 'Users', icon: UserCheck }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`px-3 py-2 rounded-xl font-medium transition-all flex items-center gap-1.5 ${
                  activeTab === tab.id
                    ? 'bg-gradient-to-r from-orange-500 to-orange-600 text-white shadow-md'
                    : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                }`}
                style={{ minWidth: 'fit-content' }}
              >
                <tab.icon className="w-3.5 h-3.5 flex-shrink-0" />
                <span className="text-xs font-medium whitespace-nowrap">
                  {tab.label}
                </span>
              </button>
            ))}
          </div>

          {/* Sales Tab */}
          {activeTab === 'sales' && (
            <div className="space-y-5">
              <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-5 shadow-sm">
                <h2 className="font-bold text-gray-800 dark:text-white mb-4">7-Day Revenue Trend</h2>
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart data={chartData}>
                    <XAxis dataKey="day" tick={{ fontSize: 12 }} />
                    <YAxis tick={{ fontSize: 12 }} />
                    <Tooltip 
                      formatter={(value: any) => [`₱${value.toLocaleString()}`, 'Revenue']}
                      contentStyle={{ borderRadius: '12px', padding: '8px 12px' }}
                    />
                    <Bar dataKey="revenue" fill="#f97316" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-5 shadow-sm">
                <h2 className="font-bold text-gray-800 dark:text-white mb-4">Weekly Orders</h2>
                <ResponsiveContainer width="100%" height={220}>
                  <LineChart data={weeklyData}>
                    <XAxis dataKey="day" tick={{ fontSize: 12 }} />
                    <YAxis tick={{ fontSize: 12 }} />
                    <Tooltip contentStyle={{ borderRadius: '12px', padding: '8px 12px' }} />
                    <Line type="monotone" dataKey="orders" stroke="#f97316" strokeWidth={3} dot={{ fill: '#f97316', r: 4 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>

              {categoryData.length > 0 && (
                <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-5 shadow-sm">
                  <h2 className="font-bold text-gray-800 dark:text-white mb-4">Sales by Category</h2>
                  <ResponsiveContainer width="100%" height={240}>
                    <PieChart>
                      <Pie data={categoryData} cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={3} dataKey="value" label>
                        {categoryData.map((_, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value: any) => [`₱${value.toLocaleString()}`, 'Sales']} />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-4 shadow-sm">
                  <Star className="w-5 h-5 text-yellow-500 mb-2" />
                  <p className="text-xs text-gray-500 dark:text-gray-400">Best Seller</p>
                  <p className="font-bold text-gray-800 dark:text-white text-base truncate">{getBestSeller()}</p>
                </div>
                <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-4 shadow-sm">
                  <TrendingUp className="w-5 h-5 text-green-500 mb-2" />
                  <p className="text-xs text-gray-500 dark:text-gray-400">MTD Revenue</p>
                  <p className="font-bold text-gray-800 dark:text-white text-base">₱{monthToDateRevenue.toLocaleString()}</p>
                </div>
              </div>

              <button
                onClick={handleGenerateReport}
                className="w-full bg-gradient-to-r from-orange-500 to-orange-600 text-white font-bold py-3.5 rounded-2xl flex items-center justify-center gap-2 shadow-md hover:shadow-lg transition-all"
              >
                <Download className="w-5 h-5" />
                Generate Daily Report
              </button>

              <div>
                <h2 className="font-bold text-gray-800 dark:text-white mb-3">Recent Sales</h2>
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {todaySales.slice(0, 10).map(sale => (
                    <div key={sale.id} className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-3 shadow-sm hover:shadow-md transition-shadow">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <p className="font-semibold text-gray-800 dark:text-white text-sm">
                            {sale.items.slice(0, 2).map(i => i.name).join(', ')}
                            {sale.items.length > 2 && ` +${sale.items.length - 2}`}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{sale.cashierName} • {new Date(sale.date).toLocaleTimeString()}</p>
                        </div>
                        <p className="font-bold text-orange-600 dark:text-orange-400 ml-3">₱{sale.total.toLocaleString()}</p>
                      </div>
                    </div>
                  ))}
                  {todaySales.length === 0 && (
                    <div className="text-center py-8">
                      <ShoppingBag className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                      <p className="text-gray-500 dark:text-gray-400">No sales today</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Expenses Tab */}
          {activeTab === 'expenses' && (
            <div className="space-y-5">
              <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-5 shadow-sm">
                <h2 className="font-bold text-gray-800 dark:text-white mb-4">{getDateRangeLabel()} Expenses</h2>
                {filteredExpenses === 0 ? (
                  <div className="text-center py-8">
                    <DollarSign className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                    <p className="text-gray-500 dark:text-gray-400">No expenses for {dateRange}</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <div className="pt-3 mt-2 border-t-2 border-red-500">
                      <div className="flex justify-between items-center font-bold">
                        <span className="text-gray-800 dark:text-white">Total</span>
                        <span className="text-red-600 dark:text-red-400 text-lg">₱{filteredExpenses.toLocaleString()}</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Supplies Tab */}
          {activeTab === 'supplies' && (
            <div className="mb-4">
              <ErrorBoundary fallback={
                <div className="bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 rounded-2xl p-8 text-center">
                  <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-3" />
                  <h3 className="text-lg font-semibold text-red-700 dark:text-red-400 mb-2">Something went wrong</h3>
                  <p className="text-sm text-red-600 dark:text-red-300 mb-4">Failed to load supplies manager</p>
                  <button
                    onClick={() => window.location.reload()}
                    className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                  >
                    Reload Page
                  </button>
                </div>
              }>
                <SuppliesManager />
              </ErrorBoundary>
            </div>
          )}

          {/* Cashiers Tab */}
          {activeTab === 'cashiers' && (
            <div className="space-y-5">
              {topPerformer && topPerformer.sales > 0 && (
                <div className="bg-gradient-to-r from-yellow-500 to-orange-500 rounded-2xl p-5 text-white">
                  <div className="flex items-center gap-2 mb-2">
                    <Award className="w-6 h-6" />
                    <span className="font-bold">Top Performer Today</span>
                  </div>
                  <p className="text-2xl font-bold">{topPerformer.name}</p>
                  <p className="text-sm opacity-90">₱{topPerformer.sales.toLocaleString()} sales • {topPerformer.orders} orders</p>
                  <div className="mt-3 w-full bg-white/20 rounded-full h-2">
                    <div className="bg-white rounded-full h-2" style={{ width: `${Math.min(cashierSalesPercentage, 100)}%` }} />
                  </div>
                </div>
              )}

              <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-5 shadow-sm">
                <h2 className="font-bold text-gray-800 dark:text-white mb-4">Cashier Performance</h2>
                <div className="space-y-3">
                  {cashierPerformance.length === 0 ? (
                    <div className="text-center py-8">
                      <Users className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                      <p className="text-gray-500 dark:text-gray-400">No sales recorded today</p>
                    </div>
                  ) : (
                    cashierPerformance.map((cashier, idx) => (
                      <div key={idx} className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-4">
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="font-semibold text-gray-800 dark:text-white text-lg">{cashier.name}</p>
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{cashier.orders} orders • {cashier.items} items</p>
                          </div>
                          <p className="text-2xl font-bold text-orange-600 dark:text-orange-400">₱{cashier.sales.toLocaleString()}</p>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Shifts Tab */}
          {activeTab === 'shifts' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="font-bold text-gray-800 dark:text-white">Shift Reports</h2>
                {shifts.filter(s => !s.isRead).length > 0 && (
                  <button
                    onClick={() => markAllShiftsRead()}
                    className="text-xs text-orange-600 dark:text-orange-400 flex items-center gap-1 hover:underline"
                  >
                    <CheckCheck className="w-3.5 h-3.5" />
                    Mark all read
                  </button>
                )}
              </div>
              {shifts.length === 0 ? (
                <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-10 text-center shadow-sm">
                  <Clock className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                  <p className="text-gray-500 dark:text-gray-400 font-medium">No shift reports yet</p>
                  <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">Shift reports will appear here when cashiers end their shifts</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {shifts.map(shift => (
                    <div
                      key={shift.id}
                      className={`bg-white dark:bg-gray-800 rounded-2xl border p-4 shadow-sm transition-all ${
                        !shift.isRead ? 'border-orange-300 dark:border-orange-600 bg-orange-50 dark:bg-orange-950/30' : 'border-gray-200 dark:border-gray-700'
                      }`}
                      onClick={() => !shift.isRead && markShiftRead(shift.id)}
                    >
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <div className="flex items-center gap-2">
                            <p className="font-bold text-gray-800 dark:text-white">{shift.cashierName}</p>
                            {!shift.isRead && (
                              <span className="px-2 py-0.5 bg-orange-500 text-white text-xs rounded-full font-bold">NEW</span>
                            )}
                          </div>
                          <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                            Code: {shift.cashierCode || 'N/A'}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-lg font-bold text-green-600 dark:text-green-400">₱{shift.totalSales.toLocaleString()}</p>
                          <p className="text-xs text-gray-400">{new Date(shift.shiftEnd).toLocaleDateString()}</p>
                        </div>
                      </div>
                      <div className="grid grid-cols-3 gap-2 mb-3">
                        <div className="bg-gray-100 dark:bg-gray-700 rounded-xl p-2 text-center">
                          <p className="text-sm font-bold text-gray-800 dark:text-white">{shift.totalOrders}</p>
                          <p className="text-xs text-gray-500">Orders</p>
                        </div>
                        <div className="bg-gray-100 dark:bg-gray-700 rounded-xl p-2 text-center">
                          <p className="text-sm font-bold text-gray-800 dark:text-white">{shift.totalItems}</p>
                          <p className="text-xs text-gray-500">Items</p>
                        </div>
                        <div className="bg-gray-100 dark:bg-gray-700 rounded-xl p-2 text-center">
                          <p className="text-sm font-bold text-gray-800 dark:text-white">
                            {(() => {
                              const start = new Date(shift.shiftStart);
                              const end = new Date(shift.shiftEnd);
                              const diffMs = end.getTime() - start.getTime();
                              const hours = Math.floor(diffMs / (1000 * 60 * 60));
                              const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
                              return `${hours}h ${minutes}m`;
                            })()}
                          </p>
                          <p className="text-xs text-gray-500">Duration</p>
                        </div>
                      </div>
                      <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 border-t border-gray-200 dark:border-gray-700 pt-2">
                        <span>Start: {new Date(shift.shiftStart).toLocaleTimeString('en-PH', { hour: '2-digit', minute: '2-digit' })}</span>
                        <span>End: {new Date(shift.shiftEnd).toLocaleTimeString('en-PH', { hour: '2-digit', minute: '2-digit' })}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Users Tab */}
          {activeTab === 'users' && (
            <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-5 shadow-sm">
              <h2 className="font-bold text-gray-800 dark:text-white mb-4">User Management</h2>
              <div className="space-y-3">
                <div className="bg-orange-50 dark:bg-orange-950/30 rounded-xl p-4 border border-orange-200 dark:border-orange-800">
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="font-semibold text-gray-800 dark:text-white text-lg">Admin User</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">admin@maifah.com</p>
                    </div>
                    <span className="px-3 py-1 rounded-full bg-orange-100 dark:bg-orange-900 text-orange-600 dark:text-orange-400 text-xs font-bold">Admin</span>
                  </div>
                </div>
                {cashiers.map(cashier => (
                  <div key={cashier.id} className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-4">
                    <div className="flex justify-between items-center">
                      <div className="flex-1">
                        <p className="font-semibold text-gray-800 dark:text-white">{cashier.fullName}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">{cashier.email}</p>
                        <p className="text-xs text-orange-600 dark:text-orange-400 mt-1">Code: {cashier.cashierCode}</p>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleSwitchToCashier(cashier.id)}
                          className="p-2 rounded-lg hover:bg-orange-100 dark:hover:bg-orange-900/50 text-orange-600 dark:text-orange-400 transition-colors"
                          title="Switch to this account"
                        >
                          <RefreshCw className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => {
                            if (confirm(`Remove ${cashier.fullName}?`)) {
                              deleteUser(cashier.id);
                              toast.success(`${cashier.fullName} removed`);
                            }
                          }}
                          className="p-2 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/50 text-red-500 transition-colors"
                          title="Remove this account"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <button
                onClick={() => navigate('/signup')}
                className="w-full mt-5 py-3 rounded-xl bg-gradient-to-r from-orange-500 to-orange-600 text-white font-bold flex items-center justify-center gap-2 shadow-md hover:shadow-lg transition-all"
              >
                <Plus className="w-4 h-4" />
                Create New Account
              </button>
              <div className="mt-5 p-3 bg-blue-50 dark:bg-blue-950 rounded-xl">
                <div className="flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 text-blue-500 mt-0.5" />
                  <p className="text-xs text-blue-700 dark:text-blue-300">
                    Cashiers can only access POS and their personal dashboard. They cannot view sales analytics, expenses, or supply management.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        <BottomNav />
      </div>

      <AccountSwitcher isOpen={showAccountSwitcher} onClose={() => setShowAccountSwitcher(false)} />

      {/* Notifications Panel */}
      <AnimatePresence>
        {showNotifications && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 z-50 flex justify-end"
            onClick={() => setShowNotifications(false)}
          >
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 30, stiffness: 300 }}
              className="bg-white dark:bg-gray-900 w-full max-w-sm h-full overflow-y-auto shadow-2xl"
              onClick={e => e.stopPropagation()}
            >
              <div className="sticky top-0 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 px-5 py-4 flex justify-between items-center">
                <div>
                  <h2 className="font-bold text-gray-800 dark:text-white text-lg">Notifications</h2>
                  {unreadCount > 0 && (
                    <p className="text-xs text-orange-500">{unreadCount} unread shift report{unreadCount > 1 ? 's' : ''}</p>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  {unreadCount > 0 && (
                    <button onClick={() => markAllShiftsRead()} className="text-xs text-orange-500 hover:underline">
                      Mark all read
                    </button>
                  )}
                  <button
                    onClick={() => setShowNotifications(false)}
                    className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                  >
                    <X className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                  </button>
                </div>
              </div>

              <div className="p-4 space-y-3">
                {shifts.length === 0 ? (
                  <div className="text-center py-16">
                    <Bell className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                    <p className="text-gray-500 dark:text-gray-400">No notifications yet</p>
                    <p className="text-xs text-gray-400 mt-1">Shift end notifications will appear here</p>
                  </div>
                ) : (
                  shifts.map(shift => (
                    <div
                      key={shift.id}
                      className={`rounded-2xl p-4 cursor-pointer transition-all ${
                        !shift.isRead
                          ? 'bg-orange-50 dark:bg-orange-950/30 border border-orange-200 dark:border-orange-700'
                          : 'bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700'
                      }`}
                      onClick={() => {
                        markShiftRead(shift.id);
                        setShowNotifications(false);
                        setActiveTab('shifts');
                      }}
                    >
                      <div className="flex items-start gap-3">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${!shift.isRead ? 'bg-orange-100 dark:bg-orange-900' : 'bg-gray-200 dark:bg-gray-700'}`}>
                          <Clock className={`w-5 h-5 ${!shift.isRead ? 'text-orange-500' : 'text-gray-500'}`} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex justify-between items-start">
                            <p className="font-semibold text-gray-800 dark:text-white text-sm">{shift.cashierName} ended shift</p>
                            {!shift.isRead && <span className="w-2 h-2 bg-orange-500 rounded-full flex-shrink-0 mt-1.5"></span>}
                          </div>
                          <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                            {shift.totalOrders} orders • ₱{shift.totalSales.toLocaleString()} total
                          </p>
                          <p className="text-xs text-gray-400 mt-1">
                            {new Date(shift.shiftEnd).toLocaleString('en-PH', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default DashboardPage;