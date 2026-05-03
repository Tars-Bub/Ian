import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Logo } from '@/assets/logo';
import { toast } from 'sonner';
import { User, ArrowLeft, AlertCircle, LogIn } from 'lucide-react';

// Email validation regex
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [touched, setTouched] = useState({ email: false, password: false });
  const navigate = useNavigate();
  const { login, user, isAuthenticated, isLoading } = useAuth();

  // Validation
  const isEmailValid = email.trim() === '' || emailRegex.test(email);
  const isPasswordValid = password.trim() === '' || password.length >= 6;
  
  const canSubmit = email.trim() !== '' && password.trim() !== '' && isEmailValid && isPasswordValid;

  // Redirect if already logged in
  useEffect(() => {
    if (!isLoading && isAuthenticated && user) {
      if (user.role === 'admin') {
        navigate('/dashboard', { replace: true });
      } else if (user.role === 'cashier') {
        navigate('/pos', { replace: true });
      }
    }
  }, [isLoading, isAuthenticated, user, navigate]);

  const handleLogin = async () => {
    // Clear previous error
    setError('');
    
    // Validate email format
    if (!emailRegex.test(email)) {
      setError('Please enter a valid email address');
      return;
    }
    
    // Validate password length
    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }
    
    setLoading(true);
    
    const result = await login(email, password);
    
    if (result.success && result.user) {
      toast.success(`Welcome back, ${result.user.fullName}!`);
      // Navigation will happen in useEffect after state updates
    } else {
      setError(result.error || 'Invalid email or password');
      toast.error(result.error || 'Login failed');
      setLoading(false);
    }
  };

  const fillDemoCredentials = (type: 'admin' | 'cashier') => {
    setTouched({ email: true, password: true });
    if (type === 'admin') {
      setEmail('admin@maifah.com');
      setPassword('admin123');
    } else {
      setEmail('cashier1@maifah.com');
      setPassword('cashier123');
    }
    setError('');
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && canSubmit && !loading) {
      handleLogin();
    }
  };

  // Show loading while checking auth
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

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center px-6 py-8">
      <button
        onClick={() => navigate('/')}
        className="absolute top-6 left-6 p-2 rounded-full hover:bg-secondary transition-colors z-10"
      >
        <ArrowLeft className="w-5 h-5 text-muted-foreground" />
      </button>
      
      <div className="w-full max-w-xs flex flex-col items-center gap-6">
        <Logo />
        <h1 className="text-2xl font-bold text-foreground">Welcome Back</h1>

        {error && (
          <div className="w-full p-3 rounded-xl bg-destructive/10 text-destructive text-sm font-medium text-center flex items-center gap-2 justify-center">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            {error}
          </div>
        )}

        <div className="w-full flex flex-col gap-3">
          <div>
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={e => { setEmail(e.target.value); setError(''); }}
              onBlur={() => setTouched({ ...touched, email: true })}
              onKeyDown={handleKeyPress}
              className={`w-full px-4 py-3 rounded-xl border ${
                touched.email && !isEmailValid && email !== ''
                  ? 'border-destructive'
                  : 'border-input'
              } bg-card text-foreground text-sm font-medium outline-none focus:ring-2 focus:ring-ring`}
              disabled={loading}
            />
            {touched.email && !isEmailValid && email !== '' && (
              <p className="text-xs text-destructive mt-1">Please enter a valid email address</p>
            )}
          </div>
          
          <div>
            <input
              type="password"
              placeholder="Password (min. 6 characters)"
              value={password}
              onChange={e => { setPassword(e.target.value); setError(''); }}
              onBlur={() => setTouched({ ...touched, password: true })}
              onKeyDown={handleKeyPress}
              className={`w-full px-4 py-3 rounded-xl border ${
                touched.password && !isPasswordValid && password !== ''
                  ? 'border-destructive'
                  : 'border-input'
              } bg-card text-foreground text-sm font-medium outline-none focus:ring-2 focus:ring-ring`}
              disabled={loading}
            />
            {touched.password && !isPasswordValid && password !== '' && (
              <p className="text-xs text-destructive mt-1">Password must be at least 6 characters</p>
            )}
          </div>
          
          <button
            onClick={handleLogin}
            disabled={loading || !canSubmit}
            className="w-full py-3 rounded-xl gradient-orange text-primary-foreground font-bold text-base shadow-float mt-2 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Signing in...
              </>
            ) : (
              <>
                <LogIn className="w-4 h-4" />
                Sign In
              </>
            )}
          </button>
        </div>

        <div className="w-full space-y-3">
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-border"></div>
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">Demo Accounts</span>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => fillDemoCredentials('admin')}
              className="p-3 rounded-xl bg-gradient-to-r from-orange-500 to-orange-600 text-white text-left transition-all hover:shadow-lg"
            >
              <div className="flex items-center gap-2 mb-1">
                <User className="w-4 h-4" />
                <span className="font-bold text-sm">Admin</span>
              </div>
              <p className="text-xs text-white/80">admin@maifah.com</p>
              <p className="text-xs text-white/80">•••••••</p>
            </button>
            
            <button
              onClick={() => fillDemoCredentials('cashier')}
              className="p-3 rounded-xl bg-gradient-to-r from-green-500 to-green-600 text-white text-left transition-all hover:shadow-lg"
            >
              <div className="flex items-center gap-2 mb-1">
                <User className="w-4 h-4" />
                <span className="font-bold text-sm">Cashier</span>
              </div>
              <p className="text-xs text-white/80">cashier1@maifah.com</p>
              <p className="text-xs text-white/80">•••••••</p>
            </button>
          </div>
          
          <div className="text-xs text-center text-muted-foreground bg-secondary/50 rounded-lg p-2">
            <p>Click on a demo account to auto-fill credentials, then click Sign In</p>
            <p className="text-[10px] mt-1">Admin: full access • Cashier: POS only</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;