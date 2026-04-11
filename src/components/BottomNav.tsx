import { ShoppingCart, BarChart3, Receipt, Home } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '@/hooks/useAuth';

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

  const visibleTabs = tabs.filter(tab => 
    tab.role === 'all' || tab.role === user?.role
  );

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