import { motion } from 'framer-motion';
import { Printer, ArrowLeft, Home, ShoppingBag, LogOut } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';
import { SaleRecord } from '@/data/menu';
import { toast } from 'sonner';
import { useAuth } from '@/hooks/useAuth';

interface ReceiptState {
  sale: SaleRecord;
  orderNumber: number;
  cashierName: string;
  cashierCode?: string;
  cashTendered?: number;
  change?: number;
}

const dashes = '- - - - - - - - - - - - - - -';
const solidLine = '─────────────────────────────';

const ReceiptPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const state = location.state as ReceiptState | null;

  const handleLogout = () => {
    logout();
    navigate('/login');
    toast.info('Logged out successfully');
  };

  if (!state?.sale) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6">
        <div className="text-center">
          <div className="text-6xl mb-4">📄</div>
          <p className="text-muted-foreground mb-4">No receipt data found</p>
          <button
            onClick={() => navigate('/pos')}
            className="px-6 py-3 rounded-xl gradient-orange text-white font-bold"
          >
            Go to POS
          </button>
        </div>
      </div>
    );
  }

  const { sale, orderNumber, cashierName, cashierCode, cashTendered, change } = state;
  const date = new Date(sale.date);
  const dateStr = date.toLocaleDateString('en-PH', { year: 'numeric', month: 'short', day: 'numeric' });
  const timeStr = date.toLocaleTimeString('en-PH', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  const orderNo = `#${String(orderNumber).padStart(4, '0')}`;
  const isCash = sale.paymentMethod === 'cash';

  const handlePrint = () => {
    window.print();
    toast.success('Receipt sent to printer');
  };

  const handleNewOrder = () => {
    navigate('/pos');
  };

  const handleHome = () => {
    // Cashiers go to cashier dashboard, admins go to admin dashboard
    if (user?.role === 'cashier') {
      navigate('/cashier-dashboard');
    } else {
      navigate('/dashboard');
    }
  };

  return (
    <div className="min-h-screen bg-muted/50 flex flex-col items-center px-4 py-8 print:bg-white print:p-0">
      {/* Header with Back Button - Hidden when printing */}
      <div className="w-full max-w-[320px] mb-4 print:hidden">
        <div className="flex items-center justify-between gap-2 mb-4">
          <button
            onClick={() => navigate('/pos')}
            className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            Back to POS
          </button>
          <button
            onClick={handleHome}
            className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors"
          >
            <Home className="w-5 h-5" />
            Dashboard
          </button>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 text-muted-foreground hover:text-red-500 transition-colors"
          >
            <LogOut className="w-5 h-5" />
            Logout
          </button>
        </div>
      </div>

      {/* Receipt Paper */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        id="receipt-content"
        className="w-full max-w-[320px] bg-white rounded-lg shadow-xl p-6 font-mono text-[13px] leading-relaxed text-neutral-800 print:shadow-none print:rounded-none print:max-w-none print:w-full print:p-4"
      >
        {/* Header */}
        <div className="text-center space-y-1">
          <div className="text-3xl">☕</div>
          <p className="font-bold text-base">Maifah Bong's Tea Cafe</p>
          <p className="text-[11px] text-neutral-500">Cook As You Order</p>
          <p className="text-[10px] text-neutral-400">Brgy. Sample, City, Philippines</p>
          <p className="text-[11px] text-neutral-500">VAT REG TIN: 123-456-789-000</p>
          <p className="text-[11px] text-neutral-500">{dateStr} &nbsp; {timeStr}</p>
        </div>

        <p className="text-center text-neutral-300 my-3 tracking-widest text-[11px]">{dashes}</p>

        {/* Order Details */}
        <p className="text-center font-bold text-xs tracking-wider mb-1">ORDER DETAILS</p>
        <p className="text-center text-neutral-300 tracking-widest text-[11px]">{dashes}</p>

        <div className="mt-3 space-y-2">
          {sale.items.map((item, idx) => (
            <div key={item.id}>
              <div className="flex justify-between">
                <span className="truncate max-w-[200px] text-xs">
                  {idx + 1}. {item.name}
                </span>
                <span className="text-neutral-500 ml-2 shrink-0">x{item.quantity}</span>
              </div>
              <div className="text-right text-neutral-600 text-xs">
                ₱{(item.price * item.quantity).toFixed(2)}
              </div>
            </div>
          ))}
        </div>

        <p className="text-center text-neutral-300 my-3 tracking-widest text-[11px]">{dashes}</p>

        {/* Totals */}
        <div className="space-y-1">
          <div className="flex justify-between text-xs">
            <span>Subtotal:</span>
            <span>₱{sale.total.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-xs">
            <span>Discount:</span>
            <span>₱0.00</span>
          </div>
          <div className="flex justify-between text-xs">
            <span>Tax (12%):</span>
            <span>₱{(sale.total * 0.12).toFixed(2)}</span>
          </div>
          <p className="text-neutral-300 text-[11px]">{solidLine}</p>
          <div className="flex justify-between font-bold text-sm">
            <span>TOTAL:</span>
            <span>₱{sale.total.toFixed(2)}</span>
          </div>
          <p className="text-neutral-300 text-[11px]">{solidLine}</p>

          {isCash ? (
            <>
              <div className="flex justify-between text-xs">
                <span>Cash Tendered:</span>
                <span>₱{(cashTendered ?? sale.total).toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span>Change:</span>
                <span>₱{(change ?? 0).toFixed(2)}</span>
              </div>
            </>
          ) : (
            <>
              <div className="flex justify-between text-xs">
                <span>Payment Method:</span>
                <span>GCash / Digital Payment</span>
              </div>
              <div className="flex justify-between text-xs">
                <span>Reference No:</span>
                <span>GC-{String(orderNumber).padStart(6, '0')}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span>Status:</span>
                <span className="font-bold text-green-600">PAID</span>
              </div>
            </>
          )}
        </div>

        <p className="text-center text-neutral-300 my-3 tracking-widest text-[11px]">{dashes}</p>

        {/* Order Info */}
        <div className="space-y-1 text-[11px]">
          <div className="flex justify-between">
            <span>Order No:</span>
            <span className="font-bold">{orderNo}</span>
          </div>
          <div className="flex justify-between">
            <span>Cashier:</span>
            <span>{cashierName}</span>
          </div>
          {cashierCode && (
            <div className="flex justify-between">
              <span>Cashier Code:</span>
              <span>{cashierCode}</span>
            </div>
          )}
          <div className="flex justify-between">
            <span>Date:</span>
            <span>{dateStr}</span>
          </div>
          <div className="flex justify-between">
            <span>Time:</span>
            <span>{timeStr}</span>
          </div>
        </div>

        <p className="text-center text-neutral-300 my-3 tracking-widest text-[11px]">{dashes}</p>

        {/* Footer */}
        <div className="text-center space-y-1 text-[11px] text-neutral-500">
          <p className="font-semibold text-neutral-700">Thank you for dining with us!</p>
          <p>Please come again!</p>
          <p className="text-[9px] text-neutral-400 mt-2">This serves as your official receipt</p>
          <p className="text-[10px] text-neutral-400">Powered by Maifah POS System</p>
        </div>

        <p className="text-center text-neutral-300 mt-3 tracking-widest text-[11px]">{dashes}</p>
      </motion.div>

      {/* Action Buttons — hidden when printing */}
      <div className="flex flex-col gap-3 mt-6 w-full max-w-[320px] print:hidden">
        <motion.button
          whileTap={{ scale: 0.97 }}
          onClick={handlePrint}
          className="w-full py-3 rounded-2xl gradient-orange text-primary-foreground flex items-center justify-center gap-2 font-bold shadow-float"
        >
          <Printer className="w-5 h-5" />
          Print Receipt
        </motion.button>
        
        <div className="grid grid-cols-2 gap-3">
          <motion.button
            whileTap={{ scale: 0.97 }}
            onClick={handleNewOrder}
            className="py-3 rounded-2xl bg-white border-2 border-primary text-primary font-bold flex items-center justify-center gap-2"
          >
            <ShoppingBag className="w-5 h-5" />
            New Order
          </motion.button>
          
          <motion.button
            whileTap={{ scale: 0.97 }}
            onClick={handleHome}
            className="py-3 rounded-2xl bg-secondary text-secondary-foreground font-bold flex items-center justify-center gap-2"
          >
            <Home className="w-5 h-5" />
            {user?.role === 'cashier' ? 'Cashier Dashboard' : 'Dashboard'}
          </motion.button>
        </div>
        
        {/* Logout button for quick access */}
        <motion.button
          whileTap={{ scale: 0.97 }}
          onClick={handleLogout}
          className="py-2 rounded-xl text-muted-foreground hover:text-red-500 transition-colors text-sm"
        >
          Logout
        </motion.button>
      </div>
    </div>
  );
};

export default ReceiptPage;