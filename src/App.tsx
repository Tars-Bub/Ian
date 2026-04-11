import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { useEffect, useState } from 'react';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import SplashScreen from "./pages/SplashScreen";
import LoginPage from "./pages/LoginPage";
import SignUpPage from "./pages/SignUpPage";
import SelectOperationPage from "./pages/SelectOperationPage";
import POSPage from "./pages/POSPage";
import PaymentPage from "./pages/PaymentPage";
import ReceiptPage from "./pages/ReceiptPage";
import DashboardPage from "./pages/DashboardPage";
import CashierDashboard from "./pages/CashierDashboard";
import ExpensesPage from "./pages/ExpensesPage";
import NotFound from "./pages/NotFound";
import { useAuth } from '@/hooks/useAuth';
import { useTheme } from '@/hooks/useTheme';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

const AppContent = () => {
  const { user, isLoading, logout } = useAuth();
  const { getUserThemePreference } = useTheme();
  const [isInitialized, setIsInitialized] = useState(false);

  // Clear any stale session on app start - ONLY ONCE
  useEffect(() => {
    const initApp = () => {
      // Check if this is a fresh page load
      const isFreshLoad = sessionStorage.getItem('app_initialized');
      if (!isFreshLoad) {
        // Clear any stale user data to prevent auto-login
        localStorage.removeItem('currentUser');
        sessionStorage.clear();
        sessionStorage.setItem('app_initialized', 'true');
        console.log('App initialized - cleared stale sessions');
      }
      setIsInitialized(true);
    };
    
    initApp();
  }, []);

  useEffect(() => {
    if (user?.id && isInitialized) {
      const userPref = getUserThemePreference(user.id);
      if (userPref === 'dark') {
        document.documentElement.classList.add('dark');
      } else if (userPref === 'light') {
        document.documentElement.classList.remove('dark');
      }
    }
  }, [user, isInitialized]);

  if (isLoading || !isInitialized) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto min-h-screen relative bg-background">
      <ErrorBoundary>
        <Routes>
          <Route path="/" element={<SplashScreen />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignUpPage />} />
          <Route path="/select" element={<SelectOperationPage />} />
          <Route path="/pos" element={<POSPage />} />
          <Route path="/payment" element={<PaymentPage />} />
          <Route path="/receipt" element={<ReceiptPage />} />
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/cashier-dashboard" element={<CashierDashboard />} />
          <Route path="/expenses" element={<ExpensesPage />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </ErrorBoundary>
    </div>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner richColors closeButton position="top-right" />
      <BrowserRouter future={{ v7_relativeSplatPath: true, v7_startTransition: true }}>
        <AppContent />
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;