import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, LogOut, Moon, Sun } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useTheme } from '@/hooks/useTheme';
import MenuManager from '@/components/MenuManager';
import SuppliesManager from '@/components/SuppliesManager';

const CashierInventoryPage = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated, isLoading, logout } = useAuth();
  const { theme, toggleTheme, setUserThemePreference } = useTheme();
  const [activeTab, setActiveTab] = useState<'menu' | 'supplies'>('menu');

  useEffect(() => {
    if (!isLoading) {
      if (!isAuthenticated) {
        navigate('/login', { replace: true });
      } else if (user?.role !== 'cashier') {
        navigate('/dashboard', { replace: true });
      } else if (user?.assignedOperation !== 'inventory') {
        navigate('/pos', { replace: true });
      }
    }
  }, [isLoading, isAuthenticated, user, navigate]);

  const handleThemeToggle = () => {
    toggleTheme();
    if (user?.id) {
      setUserThemePreference(user.id, theme === 'light' ? 'dark' : 'light');
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated || user?.role !== 'cashier') return null;

  return (
    <div className="min-h-screen bg-background pb-8">
      {/* Header */}
      <div className="gradient-orange px-4 pt-6 pb-6 rounded-b-3xl">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate('/cashier-dashboard')}
              className="p-2 rounded-full bg-primary-foreground/20 hover:bg-primary-foreground/30 transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-primary-foreground" />
            </button>
            <div>
              <h1 className="text-xl font-bold text-primary-foreground">Inventory</h1>
              <p className="text-sm text-primary-foreground/70">{user.fullName}</p>
            </div>
          </div>
          <div className="flex gap-2">
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
              onClick={() => logout()}
              className="p-2 rounded-full bg-primary-foreground/20 hover:bg-primary-foreground/30 transition-colors"
            >
              <LogOut className="w-5 h-5 text-primary-foreground" />
            </button>
          </div>
        </div>
      </div>

      {/* Tab Switcher */}
      <div className="px-4 mt-4 mb-2">
        <div className="flex gap-2 bg-muted rounded-2xl p-1">
          <button
            onClick={() => setActiveTab('menu')}
            className={`flex-1 py-2 rounded-xl text-sm font-semibold transition-all ${
              activeTab === 'menu'
                ? 'bg-background shadow text-foreground'
                : 'text-muted-foreground'
            }`}
          >
            Menu Items
          </button>
          <button
            onClick={() => setActiveTab('supplies')}
            className={`flex-1 py-2 rounded-xl text-sm font-semibold transition-all ${
              activeTab === 'supplies'
                ? 'bg-background shadow text-foreground'
                : 'text-muted-foreground'
            }`}
          >
            Supplies
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="px-4">
        {activeTab === 'menu' ? <MenuManager /> : <SuppliesManager />}
      </div>
    </div>
  );
};

export default CashierInventoryPage;