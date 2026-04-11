import { Outlet, Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import BottomNav from './BottomNav';

const MainLayout = () => {
  const { user, canAccess } = useAuth();
  const location = useLocation();

  // If user is cashier, redirect to POS only
  if (user && user.role === 'cashier') {
    const allowedPaths = ['/', '/pos', '/cashier-dashboard'];
    const currentPath = location.pathname;
    
    if (!allowedPaths.includes(currentPath)) {
      return <Navigate to="/pos" replace />;
    }
  }

  // If user is admin, allow all paths
  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <Outlet />
      <BottomNav />
    </div>
  );
};

export default MainLayout;