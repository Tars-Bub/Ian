import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Logo } from '@/assets/logo';

const SplashScreen = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen gradient-orange flex flex-col items-center justify-center px-6">
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="flex flex-col items-center gap-6 text-center"
      >
        {/* NEW LOGO IMAGE - replaces the old ugly logo */}
        <Logo />
        
        {/* THE TEXT STAYS HERE - just like before */}
        <div>
          <h1 className="text-3xl font-black text-primary-foreground leading-tight">
            Maifah Tea Bong's Cafe
          </h1>
          <p className="text-lg font-semibold text-primary-foreground/80 mt-1">POS System</p>
        </div>
        
        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={() => navigate('/login')}
          className="mt-8 px-12 py-4 rounded-2xl bg-primary-foreground text-primary font-bold text-lg shadow-float"
        >
          Start
        </motion.button>
      </motion.div>
    </div>
  );
};

export default SplashScreen;