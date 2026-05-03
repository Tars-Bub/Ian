import { motion } from 'framer-motion';
import { useState, useEffect, useRef } from 'react';

interface MenuItemProps {
  item: {
    id: string;
    name: string;
    price: number;
    category: string;
    description?: string;
    image?: string;        // ← Support dynamic image URL
  };
  quantity: number;
  onAdd: (item: any) => void;
  index: number;
}

const MenuItem = ({ item, quantity, onAdd, index }: MenuItemProps) => {
  const [imageError, setImageError] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const itemRef = useRef<HTMLDivElement>(null);

  // Use dynamic image from DB, fallback to old system if needed
  const imageUrl = item.image || null;

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => setIsVisible(entry.isIntersecting),
      { threshold: 0.1 }
    );

    if (itemRef.current) observer.observe(itemRef.current);

    return () => {
      if (itemRef.current) observer.unobserve(itemRef.current);
    };
  }, []);

  return (
    <motion.div
      ref={itemRef}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.02 }}
      whileTap={{ scale: 0.97 }}
      onClick={() => onAdd(item)}
      className="bg-white dark:bg-gray-800 rounded-xl shadow-md border border-gray-200 dark:border-gray-700 overflow-hidden hover:shadow-lg transition-all cursor-pointer active:scale-95"
    >
      {/* Image Container */}
      <div className="relative h-36 bg-gray-100 dark:bg-gray-700 overflow-hidden">
        {imageUrl && !imageError ? (
          <img
            src={imageUrl}
            alt={item.name}
            className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
            onError={() => setImageError(true)}
            loading="lazy"
          />
        ) : (
          <div 
            className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-orange-100 to-amber-100 dark:from-gray-700 dark:to-gray-600"
          >
            <span className="text-5xl mb-2">🍽️</span>
            <span className="text-white/70 font-medium text-center px-4 text-sm line-clamp-2">
              {item.name}
            </span>
          </div>
        )}

        {/* Quantity Badge */}
        {isVisible && quantity > 0 && (
          <div className="absolute -top-2 -right-2 w-7 h-7 rounded-full bg-gradient-to-r from-orange-500 to-orange-600 text-white text-xs font-bold flex items-center justify-center shadow-md border-2 border-white z-10">
            {quantity}
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-3">
        <p className="font-semibold text-gray-800 dark:text-white text-sm leading-tight line-clamp-2 min-h-[42px]">
          {item.name}
        </p>
        
        {item.description && (
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 line-clamp-2">
            {item.description}
          </p>
        )}

        <div className="mt-3">
          <span className="inline-block px-3 py-1.5 rounded-full bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 font-bold text-sm">
            ₱{item.price}
          </span>
        </div>
      </div>
    </motion.div>
  );
};

export default MenuItem;