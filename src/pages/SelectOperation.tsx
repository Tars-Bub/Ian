import { motion } from 'framer-motion';
import { ShoppingCart, BarChart3 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const SelectOperation = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center px-6 gap-8">
      <h1 className="text-2xl font-bold text-foreground">Select Operation</h1>
      <div className="flex flex-col gap-4 w-full max-w-xs">
        <motion.button
          whileTap={{ scale: 0.97 }}
          onClick={() => navigate('/pos')}
          className="w-full p-8 rounded-2xl gradient-orange shadow-float flex flex-col items-center gap-3"
        >
          <ShoppingCart className="w-12 h-12 text-primary-foreground" />
          <span className="text-xl font-bold text-primary-foreground">Cashier</span>
          <span className="text-sm text-primary-foreground/70">Point of Sale</span>
        </motion.button>

        <motion.button
          whileTap={{ scale: 0.97 }}
          onClick={() => navigate('/dashboard')}
          className="w-full p-8 rounded-2xl bg-card border border-border shadow-card flex flex-col items-center gap-3"
        >
          <BarChart3 className="w-12 h-12 text-primary" />
          <span className="text-xl font-bold text-foreground">Inventory & Sales</span>
          <span className="text-sm text-muted-foreground">Dashboard & Analytics</span>
        </motion.button>
      </div>
    </div>
  );
};

export default SelectOperation;
