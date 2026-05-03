import { Moon, Sun } from 'lucide-react';
import { motion } from 'framer-motion';
import { useTheme } from '@/hooks/useTheme';
import { useAuth } from '@/hooks/useAuth';

const ThemeToggle = () => {
  const { theme, toggleTheme, setUserThemePreference } = useTheme();
  const { user } = useAuth();

  const handleToggle = () => {
    toggleTheme();
    // Save preference for current user if logged in
    if (user?.id) {
      const newTheme = theme === 'light' ? 'dark' : 'light';
      setUserThemePreference(user.id, newTheme);
    }
  };

  return (
    <motion.button
      whileTap={{ scale: 0.9 }}
      onClick={handleToggle}
      className="p-2 rounded-full bg-secondary hover:bg-secondary/80 transition-colors"
      aria-label="Toggle theme"
    >
      {theme === 'light' ? (
        <Moon className="w-4 h-4 text-foreground" />
      ) : (
        <Sun className="w-4 h-4 text-foreground" />
      )}
    </motion.button>
  );
};

export default ThemeToggle;