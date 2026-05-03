import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ShoppingCart, BarChart3, LogOut, AlertTriangle } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';

const SelectOperationPage = () => {
  const navigate = useNavigate();
  const { user, users, setUsers, logout } = useAuth();
  const [isProcessing, setIsProcessing] = useState(false);

  // Only auto-redirect cashiers (not admins — admins should be able to switch freely)
  useEffect(() => {
    if (user?.assignedOperation && !isProcessing && user.role === 'cashier') {
      if (user.assignedOperation === 'cashier') {
        navigate('/pos', { replace: true });
      } else if (user.assignedOperation === 'inventory') {
  navigate('/cashier-inventory', { replace: true });
}
    }
  }, [user, navigate, isProcessing]);

  const handleSelectOperation = (operation: 'cashier' | 'inventory') => {
    if (!user) {
      toast.error('Please login again');
      navigate('/login');
      return;
    }
    
    // Cashiers can only access their assigned operation
    if (user.role === 'cashier' && operation === 'inventory' && user.assignedOperation !== 'inventory') {
      toast.error('You are not assigned to inventory. Contact your admin.');
      return;
    }

    // FIX Bug 2+3: Allow admins to switch freely — don't lock them in permanently
    if (user.role === 'admin' && user.assignedOperation === operation) {
  // Already in this mode, just navigate
  navigate(operation === 'cashier' ? '/pos' : '/dashboard');
  return;
}

// For cashiers already in this mode, just navigate
if (user.role === 'cashier' && user.assignedOperation === operation) {
  navigate(operation === 'cashier' ? '/pos' : '/cashier-inventory');
  return;
}
    setIsProcessing(true);
    
    // Save the selected operation permanently
    const updatedUser = { ...user, assignedOperation: operation };
    const updatedUsers = users.map(u => 
      u.id === user.id ? updatedUser : u
    );
    
    // Update in localStorage and state
    localStorage.setItem('users', JSON.stringify(updatedUsers));
    localStorage.setItem('currentUser', JSON.stringify(updatedUser));
    
    setUsers(updatedUsers);
    
    toast.success(`Switched to ${operation === 'cashier' ? 'Cashier' : 'Inventory'} Mode`);
    
    // Navigate to the selected operation
    if (operation === 'cashier') {
  navigate('/pos');
} else {
  // Admins go to the admin dashboard; cashiers go to their own dashboard
 navigate(user.role === 'admin' ? '/dashboard' : '/cashier-inventory');
}
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
    toast.info('Logged out successfully');
  };

  // If no user, show loading
  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
          <p className="text-gray-500">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-white flex flex-col items-center justify-center p-6">
      {/* Logout Button */}
      <button
        onClick={handleLogout}
        className="absolute top-6 right-6 p-2 rounded-full hover:bg-orange-100 transition-colors"
      >
        <LogOut className="w-5 h-5 text-gray-500" />
      </button>

      <div className="text-center mb-12">
        <div className="text-6xl mb-4">☕</div>
        <h1 className="text-3xl font-bold text-gray-800">
          Welcome, {user.fullName || user.email.split('@')[0]}!
        </h1>
        <p className="text-gray-500 mt-2">Please select your operation</p>
        {!user.assignedOperation && user.role === 'cashier' && (
          <div className="mt-3 flex items-center justify-center gap-2 text-orange-500 bg-orange-50 rounded-lg p-2">
            <AlertTriangle className="w-4 h-4" />
            <p className="text-xs font-medium">This choice will be permanent for your account</p>
          </div>
        )}
        {user.role === 'admin' && (
          <div className="mt-3 flex items-center justify-center gap-2 text-blue-500 bg-blue-50 rounded-lg p-2">
            <AlertTriangle className="w-4 h-4" />
            <p className="text-xs font-medium">As admin, you can switch between modes anytime</p>
          </div>
        )}
      </div>

      <div className="flex flex-col gap-6 w-full max-w-sm">
        <motion.button
          whileTap={{ scale: 0.97 }}
          onClick={() => handleSelectOperation('cashier')}
          disabled={isProcessing}
          className={`w-full p-6 rounded-2xl bg-gradient-to-r from-orange-500 to-orange-600 text-white text-left flex items-center gap-4 shadow-lg transition-all hover:shadow-xl`}
        >
          <div className="w-14 h-14 bg-white/20 rounded-full flex items-center justify-center">
            <ShoppingCart className="w-8 h-8" />
          </div>
          <div className="flex-1">
            <div className="text-xl font-bold">Cashier Mode</div>
            <div className="text-sm text-white/80">Process orders, accept payments, print receipts</div>
            {user.assignedOperation === 'inventory' && (
              <div className="text-xs text-white/60 mt-1">Currently in Inventory Mode</div>
            )}
          </div>
          {user.assignedOperation === 'cashier' && (
            <div className="w-6 h-6 rounded-full bg-white/30 flex items-center justify-center">
              <div className="w-2 h-2 rounded-full bg-white" />
            </div>
          )}
        </motion.button>

        {(user?.role === 'admin' || user?.assignedOperation === 'inventory') && (
          <motion.button
            whileTap={{ scale: 0.97 }}
            onClick={() => handleSelectOperation('inventory')}
            disabled={isProcessing}
            className={`w-full p-6 rounded-2xl bg-gradient-to-r from-blue-500 to-blue-600 text-white text-left flex items-center gap-4 shadow-lg transition-all hover:shadow-xl`}
          >
            <div className="w-14 h-14 bg-white/20 rounded-full flex items-center justify-center">
              <BarChart3 className="w-8 h-8" />
            </div>
            <div className="flex-1">
              <div className="text-xl font-bold">Inventory & Sales</div>
              <div className="text-sm text-white/80">View reports, manage expenses, track inventory</div>
              {user.assignedOperation === 'cashier' && (
                <div className="text-xs text-white/60 mt-1">Currently in Cashier Mode</div>
              )}
            </div>
            {user.assignedOperation === 'inventory' && (
              <div className="w-6 h-6 rounded-full bg-white/30 flex items-center justify-center">
                <div className="w-2 h-2 rounded-full bg-white" />
              </div>
            )}
          </motion.button>
        )}
      </div>
    </div>
  );
};

export default SelectOperationPage;