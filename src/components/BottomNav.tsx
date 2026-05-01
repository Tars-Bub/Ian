import { ShoppingCart, BarChart3, Receipt, Home } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '@/hooks/useAuth';
import { useEffect, useState } from 'react';

const tabs = [
  { path: '/pos', icon: ShoppingCart, label: 'POS', role: 'all' },
  { path: '/dashboard', icon: BarChart3, label: 'Dashboard', role: 'admin' },
  { path: '/cashier-dashboard', icon: Home, label: 'Dashboard', role: 'cashier' },
  { path: '/expenses', icon: Receipt, label: 'Expenses', role: 'admin' },
];

const BottomNav = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [isCartOpen, setIsCartOpen] = useState(false);

  useEffect(() => {
    // Check for cart drawer by looking for the drawer element itself
    const checkCartOpen = () => {
      // Look for the cart drawer that has "fixed bottom-0" and is visible
      const cartDrawers = document.querySelectorAll('.fixed.bottom-0');
      let cartIsOpen = false;
      
      cartDrawers.forEach(drawer => {
        // Check if it's the cart drawer (has bg-card class)
        if (drawer.classList.contains('bg-card') && 
            drawer.classList.contains('rounded-t-3xl') &&
            window.getComputedStyle(drawer).transform !== 'matrix(1, 0, 0, 1, 0, 0)') {
          cartIsOpen = true;
        }
      });
      
      setIsCartOpen(cartIsOpen);
    };

    checkCartOpen();
    
    // Use MutationObserver to watch for DOM changes
    const observer = new MutationObserver(checkCartOpen);
    observer.observe(document.body, { 
      attributes: true, 
      subtree: true, 
      attributeFilter: ['class', 'style'] 
    });
    
    // Also check on animation events
    window.addEventListener('animationend', checkCartOpen);
    
    return () => {
      observer.disconnect();
      window.removeEventListener('animationend', checkCartOpen);
    };
  }, []);

  const visibleTabs = tabs.filter(tab => 
    tab.role === 'all' || tab.role === user?.role
  );

  // Hide bottom nav when cart is open
  if (isCartOpen) {
    return null;
  }

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 safe-bottom z-50">
      <div className="max-w-md mx-auto flex items-center justify-center gap-12 h-16">
        {visibleTabs.map(tab => {
          const active = location.pathname === tab.path;
          return (
            <motion.button
              key={tab.path}
              whileTap={{ scale: 0.9 }}
              onClick={() => navigate(tab.path)}
              className={`flex flex-col items-center gap-1 transition-colors ${
                active ? 'text-orange-500' : 'text-gray-500 dark:text-gray-400'
              }`}
            >
              <tab.icon className="w-5 h-5" />
              <span className="text-xs font-medium">{tab.label}</span>
            </motion.button>
          );
        })}
      </div>
    </nav>
  );
};

export default BottomNav;