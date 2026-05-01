import { useState } from 'react';
import { motion } from 'framer-motion';
import { Banknote, Smartphone, ArrowLeft } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';
import { CartItem } from '@/data/menu';
import { useSales, useCart } from '@/hooks/useStore';
import { useAuth } from '@/hooks/useAuth';

// Global order counter persisted in localStorage
function getNextOrderNumber(): number {
  const stored = localStorage.getItem('pos_order_counter');
  const next = stored ? parseInt(stored, 10) + 1 : 1;
  localStorage.setItem('pos_order_counter', next.toString());
  return next;
}

const PaymentPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { addSale } = useSales();
  const { clearCart } = useCart();
  const { user } = useAuth();
  const { cart, cartTotal } = (location.state as { cart: CartItem[]; cartTotal: number }) || { cart: [], cartTotal: 0 };

  const [selectedMethod, setSelectedMethod] = useState<'cash' | 'cashless' | null>(null);
  const [cashTendered, setCashTendered] = useState('');

  const cashAmount = parseFloat(cashTendered) || 0;
  const change = cashAmount - cartTotal;
  const canConfirmCash = cashAmount >= cartTotal;

  const handleConfirm = () => {
    if (!selectedMethod) return;
    if (selectedMethod === 'cash' && !canConfirmCash) return;

    const orderNumber = getNextOrderNumber();
    const formattedOrderNumber = `ORD-${Date.now()}`; // Create a formatted order number
    
    const sale = {
      id: Date.now().toString(),
      orderNumber: formattedOrderNumber, // ADD THIS LINE
      items: cart,
      total: cartTotal,
      paymentMethod: selectedMethod,
      date: new Date().toISOString(),
      cashierName: user?.fullName || 'Cashier',
      cashierId: user?.id,
    };
    
    addSale(sale);
    clearCart();
    
    navigate('/receipt', {
      state: {
        sale,
        orderNumber: orderNumber, // Keep the numeric counter for display
        cashierName: user?.fullName || 'Cashier',
        cashierCode: user?.cashierCode,
        cashTendered: selectedMethod === 'cash' ? cashAmount : undefined,
        change: selectedMethod === 'cash' ? change : undefined,
      },
    });
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center px-6 py-8">
      <div className="w-full max-w-sm">
        <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-muted-foreground mb-6">
          <ArrowLeft className="w-5 h-5" /> Back
        </button>

        <h1 className="text-2xl font-bold text-foreground text-center mb-2">Select Payment</h1>
        <p className="text-3xl font-black text-primary text-center mb-6">₱{cartTotal.toLocaleString()}</p>

        <div className="flex flex-col gap-4 mb-6">
          <motion.button
            whileTap={{ scale: 0.97 }}
            onClick={() => { setSelectedMethod('cash'); setCashTendered(''); }}
            className={`w-full p-5 rounded-2xl flex items-center gap-4 border-2 transition-colors ${
              selectedMethod === 'cash'
                ? 'gradient-orange border-primary shadow-float'
                : 'bg-card border-border shadow-card'
            }`}
          >
            <Banknote className={`w-9 h-9 ${selectedMethod === 'cash' ? 'text-primary-foreground' : 'text-primary'}`} />
            <div className="text-left">
              <span className={`text-lg font-bold ${selectedMethod === 'cash' ? 'text-primary-foreground' : 'text-foreground'}`}>Cash</span>
              <p className={`text-sm ${selectedMethod === 'cash' ? 'text-primary-foreground/70' : 'text-muted-foreground'}`}>Pay with cash</p>
            </div>
          </motion.button>

          <motion.button
            whileTap={{ scale: 0.97 }}
            onClick={() => setSelectedMethod('cashless')}
            className={`w-full p-5 rounded-2xl flex items-center gap-4 border-2 transition-colors ${
              selectedMethod === 'cashless'
                ? 'gradient-orange border-primary shadow-float'
                : 'bg-card border-border shadow-card'
            }`}
          >
            <Smartphone className={`w-9 h-9 ${selectedMethod === 'cashless' ? 'text-primary-foreground' : 'text-primary'}`} />
            <div className="text-left">
              <span className={`text-lg font-bold ${selectedMethod === 'cashless' ? 'text-primary-foreground' : 'text-foreground'}`}>GCash</span>
              <p className={`text-sm ${selectedMethod === 'cashless' ? 'text-primary-foreground/70' : 'text-muted-foreground'}`}>Digital payment</p>
            </div>
          </motion.button>
        </div>

        {/* Cash Tendered Input */}
        {selectedMethod === 'cash' && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-card rounded-2xl border border-border p-5 shadow-card mb-6 space-y-3"
          >
            <label className="text-sm font-semibold text-foreground">Cash Tendered</label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-lg font-bold text-muted-foreground">₱</span>
              <input
                type="number"
                value={cashTendered}
                onChange={e => setCashTendered(e.target.value)}
                placeholder="0.00"
                className="w-full pl-10 pr-4 py-3 rounded-xl border border-border bg-background text-foreground text-lg font-bold focus:outline-none focus:ring-2 focus:ring-primary"
                min={0}
                autoFocus
              />
            </div>
            <div className="flex justify-between items-center pt-1">
              <span className="text-sm text-muted-foreground">Change</span>
              <span className={`text-lg font-black ${change >= 0 ? 'text-success' : 'text-destructive'}`}>
                ₱{change >= 0 ? change.toLocaleString() : '—'}
              </span>
            </div>
          </motion.div>
        )}

        {/* Confirm Button */}
        {selectedMethod && (
          <motion.button
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            whileTap={{ scale: 0.97 }}
            onClick={handleConfirm}
            disabled={selectedMethod === 'cash' && !canConfirmCash}
            className="w-full py-4 rounded-2xl gradient-orange text-primary-foreground font-bold text-lg shadow-float disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Confirm Payment
          </motion.button>
        )}
      </div>
    </div>
  );
};

export default PaymentPage;