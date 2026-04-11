import { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Logo } from '@/assets/logo';
import { toast } from 'sonner';
import { ArrowLeft, Info, UserPlus, Shield, AlertTriangle } from 'lucide-react';

const SignUpPage = () => {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [role, setRole] = useState<'admin' | 'cashier'>('cashier');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { signup, user } = useAuth();

  // Only admin can access this page
  if (user && user.role !== 'admin') {
    navigate('/pos');
    return null;
  }

  const validateEmail = (email: string) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  };

  const handleSignUp = async () => {
    if (!fullName || !email || !password) {
      setError('Please fill in all fields');
      return;
    }
    
    if (!validateEmail(email)) {
      setError('Please enter a valid email address');
      return;
    }
    
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    
    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }
    
    setLoading(true);
    const result = signup(fullName, email, password, role);
    setLoading(false);
    
    if (result.success) {
      toast.success(`${role === 'admin' ? 'Admin' : 'Cashier'} account created successfully!`);
      // Clear form
      setFullName('');
      setEmail('');
      setPassword('');
      setConfirmPassword('');
      setRole('cashier');
    } else {
      setError(result.error || 'Registration failed');
      toast.error(result.error || 'Registration failed');
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center px-6 py-8">
      {/* Back Button */}
      <button
        onClick={() => navigate('/dashboard')}
        className="absolute top-6 left-6 p-2 rounded-full hover:bg-secondary transition-colors z-10"
      >
        <ArrowLeft className="w-5 h-5 text-muted-foreground" />
      </button>
      
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-xs flex flex-col items-center gap-6"
      >
        <Logo />
        <h1 className="text-2xl font-bold text-foreground">Create New Account</h1>
        <p className="text-sm text-muted-foreground text-center">Add a new cashier or admin user</p>

        {error && (
          <div className="w-full p-3 rounded-xl bg-destructive/10 text-destructive text-sm font-medium text-center">
            {error}
          </div>
        )}

        <div className="w-full flex flex-col gap-3">
          <input
            type="text"
            placeholder="Full Name"
            value={fullName}
            onChange={e => { setFullName(e.target.value); setError(''); }}
            className="w-full px-4 py-3 rounded-xl border border-input bg-card text-foreground text-sm font-medium outline-none focus:ring-2 focus:ring-ring"
            disabled={loading}
          />
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={e => { setEmail(e.target.value); setError(''); }}
            className="w-full px-4 py-3 rounded-xl border border-input bg-card text-foreground text-sm font-medium outline-none focus:ring-2 focus:ring-ring"
            disabled={loading}
          />
          <input
            type="password"
            placeholder="Password (min. 6 characters)"
            value={password}
            onChange={e => { setPassword(e.target.value); setError(''); }}
            className="w-full px-4 py-3 rounded-xl border border-input bg-card text-foreground text-sm font-medium outline-none focus:ring-2 focus:ring-ring"
            disabled={loading}
          />
          <input
            type="password"
            placeholder="Confirm Password"
            value={confirmPassword}
            onChange={e => { setConfirmPassword(e.target.value); setError(''); }}
            className="w-full px-4 py-3 rounded-xl border border-input bg-card text-foreground text-sm font-medium outline-none focus:ring-2 focus:ring-ring"
            disabled={loading}
          />
          
          <div className="relative">
            <select
              value={role}
              onChange={e => setRole(e.target.value as 'admin' | 'cashier')}
              className="w-full px-4 py-3 rounded-xl border border-input bg-card text-foreground text-sm font-medium outline-none focus:ring-2 focus:ring-ring appearance-none"
              disabled={loading}
            >
              <option value="cashier">Cashier - POS Access Only</option>
              <option value="admin">Admin / Manager - Full Access</option>
            </select>
            <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
              <Info className="w-4 h-4 text-muted-foreground" />
            </div>
          </div>
          
          {role === 'admin' && (
            <div className="text-xs text-muted-foreground bg-blue-50 dark:bg-blue-950 p-2 rounded-lg">
              <div className="flex items-center gap-1 text-blue-700 dark:text-blue-300">
                <Shield className="w-3 h-3" />
                <p className="font-semibold">Admin Access Includes:</p>
              </div>
              <p>• Full dashboard access</p>
              <p>• Sales analytics and reports</p>
              <p>• Expense tracking</p>
              <p>• Inventory management</p>
              <p>• Account management (create/remove users)</p>
            </div>
          )}
          
          {role === 'cashier' && (
            <div className="text-xs text-muted-foreground bg-green-50 dark:bg-green-950 p-2 rounded-lg">
              <div className="flex items-center gap-1 text-green-700 dark:text-green-300">
                <UserPlus className="w-3 h-3" />
                <p className="font-semibold">Cashier Access Includes:</p>
              </div>
              <p>• POS system for orders</p>
              <p>• Payment processing</p>
              <p>• Receipt printing</p>
              <p>• Personal dashboard with own stats</p>
              <p>• Cannot access admin features</p>
            </div>
          )}
          
          <motion.button
            whileTap={{ scale: 0.97 }}
            onClick={handleSignUp}
            disabled={loading}
            className="w-full py-3 rounded-xl gradient-orange text-primary-foreground font-bold text-base shadow-float mt-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Creating Account...' : `Create ${role === 'admin' ? 'Admin' : 'Cashier'} Account`}
          </motion.button>
        </div>

        <div className="mt-4 p-3 bg-yellow-50 dark:bg-yellow-950 rounded-xl">
          <div className="flex items-start gap-2">
            <AlertTriangle className="w-4 h-4 text-yellow-600 mt-0.5" />
            <p className="text-xs text-yellow-700 dark:text-yellow-300">
              Only admins can create new accounts. Cashiers cannot access this page.
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default SignUpPage;