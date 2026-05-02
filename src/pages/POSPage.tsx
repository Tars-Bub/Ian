import { useState, useMemo, useEffect } from 'react';
import { Search, ShoppingBag, ArrowLeft, LogOut, Users, Moon, Sun } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useCart } from '@/hooks/useStore';
import CartDrawer from '@/components/CartDrawer';
import BottomNav from '@/components/BottomNav';
import { useNavigate } from 'react-router-dom';
import MenuItemComponent from '@/components/MenuItem';
import { useAuth } from '@/hooks/useAuth';
import { useTheme } from '@/hooks/useTheme';
import AccountSwitcher from '@/components/AccountSwitcher';
import { toast } from 'sonner';
import { getAllMenuItems, searchMenuItems } from '../../posLogic';  // ← Added

const POSPage = () => {
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [search, setSearch] = useState('');
  const [cartOpen, setCartOpen] = useState(false);
  const [showAccountSwitcher, setShowAccountSwitcher] = useState(false);
  const [menuItems, setMenuItems] = useState([]);     // ← Dynamic
  const [loading, setLoading] = useState(true);

  const { cart, addToCart, removeFromCart, clearCart, cartTotal, cartCount } = useCart();
  const navigate = useNavigate();
  const { user, isLoading: authLoading, logout } = useAuth();
  const { theme, toggleTheme, setUserThemePreference } = useTheme();

  // Load menu items from IndexedDB
  const loadMenuItems = async () => {
    setLoading(true);
    try {
      const items = await getAllMenuItems();
      setMenuItems(items);
    } catch (error) {
      console.error("Failed to load menu items:", error);
      toast.error("Failed to load menu");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMenuItems();
  }, []);

  // Redirect if not logged in
  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/login', { replace: true });
    }
  }, [authLoading, user, navigate]);

  const filteredItems = useMemo(() => {
    let items = menuItems;
    if (selectedCategory !== 'All') {
      items = items.filter(i => i.category === selectedCategory);
    }
    if (search) {
      const searchLower = search.toLowerCase();
      items = items.filter(i => 
        i.name.toLowerCase().includes(searchLower) || 
        (i.description && i.description.toLowerCase().includes(searchLower))
      );
    }
    return items;
  }, [menuItems, selectedCategory, search]);

  const getItemQty = (id: string) => cart.find(c => c.id === id)?.quantity || 0;

  const handleAddToCart = (item: any) => {
    if (item.price <= 0) {
      toast.error('Invalid item price');
      return;
    }
    addToCart(item);
    toast.success(`Added ${item.name} to cart`);
  };

  const handleCheckout = () => {
    if (cart.length === 0) {
      toast.error('Cart is empty');
      return;
    }
    setCartOpen(false);
    navigate('/payment', { state: { cart, cartTotal } });
  };

  const handleLogout = () => logout();

  const handleThemeToggle = () => {
    toggleTheme();
    if (user?.id) {
      setUserThemePreference(user.id, theme === 'light' ? 'dark' : 'light');
    }
  };

  const goBack = () => {
    if (user?.role === 'cashier') {
      navigate('/cashier-dashboard', { replace: true });
    } else {
      navigate('/dashboard', { replace: true });
    }
  };

  // Get unique categories from actual data
  const availableCategories = useMemo(() => {
    const cats = new Set(menuItems.map(item => item.category));
    return ['All', ...Array.from(cats)];
  }, [menuItems]);

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white dark:bg-gray-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading Menu...</p>
        </div>
      </div>
    );
  }

  if (!user) return null;

  return (
    <>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pb-20">
        {/* Header */}
        <div className="sticky top-0 z-20">
          <div className="bg-gradient-to-r from-orange-500 to-orange-600 px-4 pt-6 pb-4">
            <div className="flex justify-between items-center mb-4">
              <button onClick={goBack} className="w-10 h-10 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center">
                <ArrowLeft className="w-5 h-5 text-white" />
              </button>
              <div className="flex-1 text-center">
                <h1 className="text-lg font-bold text-white">Point of Sale</h1>
                <p className="text-xs text-white/80">Cashier: {user.fullName}</p>
              </div>
              <div className="flex gap-2">
                <button onClick={handleThemeToggle} className="w-10 h-10 rounded-full bg-white/20 hover:bg-white/30">
                  {theme === 'light' ? <Moon className="w-5 h-5 text-white" /> : <Sun className="w-5 h-5 text-white" />}
                </button>
                <button onClick={() => setShowAccountSwitcher(true)} className="w-10 h-10 rounded-full bg-white/20 hover:bg-white/30">
                  <Users className="w-5 h-5 text-white" />
                </button>
                <button onClick={handleLogout} className="w-10 h-10 rounded-full bg-white/20 hover:bg-white/30">
                  <LogOut className="w-5 h-5 text-white" />
                </button>
              </div>
            </div>

            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search menu..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-3 rounded-xl bg-white/20 text-white placeholder:text-white/60 outline-none text-sm font-medium"
              />
            </div>
          </div>

          {/* Dynamic Categories */}
          <div className="bg-white dark:bg-gray-800 px-4 py-3 overflow-x-auto border-b border-gray-200 dark:border-gray-700">
            <div className="flex gap-2" style={{ minWidth: 'min-content' }}>
              {availableCategories.map(cat => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-4 py-2 rounded-full text-sm font-semibold transition-all whitespace-nowrap ${
                    selectedCategory === cat
                      ? 'bg-gradient-to-r from-orange-500 to-orange-600 text-white shadow-md'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Product Grid */}
        <div className="px-3 py-4 pb-28">
          <div className="grid grid-cols-2 gap-3">
            {filteredItems.map((item, i) => (
              <MenuItemComponent
                key={item.id}
                item={item}
                quantity={getItemQty(item.id)}
                onAdd={handleAddToCart}
                index={i}
              />
            ))}
          </div>
          
          {filteredItems.length === 0 && (
            <div className="text-center py-12">
              <Search className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500 dark:text-gray-400 font-medium">No items found</p>
            </div>
          )}
        </div>

        {/* Floating Cart Button */}
        <AnimatePresence>
          {cartCount > 0 && !cartOpen && (
            <motion.button
              initial={{ y: 100, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 100, opacity: 0 }}
              onClick={() => setCartOpen(true)}
              className="fixed bottom-32 left-4 right-4 bg-gradient-to-r from-orange-500 to-orange-600 rounded-2xl py-4 px-6 flex items-center justify-between shadow-lg z-40"
            >
              <div className="flex items-center gap-3">
                <div className="relative">
                  <ShoppingBag className="w-5 h-5 text-white" />
                  <span className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 rounded-full text-[10px] text-white flex items-center justify-center font-bold">
                    {cartCount}
                  </span>
                </div>
                <span className="text-white font-semibold">View Order</span>
              </div>
              <span className="text-white font-bold text-xl">₱{cartTotal.toLocaleString()}</span>
            </motion.button>
          )}
        </AnimatePresence>

        <CartDrawer
          open={cartOpen}
          onClose={() => setCartOpen(false)}
          cart={cart}
          cartTotal={cartTotal}
          onAdd={addToCart}
          onRemove={removeFromCart}
          onCheckout={handleCheckout}
        />

        {!cartOpen && <BottomNav />}
      </div>

      <AccountSwitcher 
        isOpen={showAccountSwitcher}
        onClose={() => setShowAccountSwitcher(false)}
      />
    </>
  );
};

export default POSPage;