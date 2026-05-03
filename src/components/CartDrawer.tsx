import { motion, AnimatePresence } from 'framer-motion';
import { X, Plus, Minus, ShoppingBag, Trash2, ArrowLeft } from 'lucide-react';
import { CartItem } from '@/data/menu';
import { getMenuImage } from '@/data/menuImages';
import { useState } from 'react';

interface CartDrawerProps {
  open: boolean;
  onClose: () => void;
  cart: CartItem[];
  cartTotal: number;
  onAdd: (item: CartItem) => void;
  onRemove: (id: string) => void;
  onClear: () => void;
  onCheckout: () => void;
}

const CartDrawer = ({ open, onClose, cart, cartTotal, onAdd, onRemove, onClear, onCheckout }: CartDrawerProps) => {  const [imageErrors, setImageErrors] = useState<Record<string, boolean>>({});

  const handleImageError = (id: string) => {
    setImageErrors(prev => ({ ...prev, [id]: true }));
  };

  const [showClearConfirm, setShowClearConfirm] = useState(false);

  const handleClearCart = () => {
    setShowClearConfirm(true);
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-white dark:bg-gray-900 z-50 flex flex-col"
          style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0 }}
        >
          {/* Header */}
<div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-orange-500 to-orange-600 relative">            <div className="flex items-center gap-2">
              <button onClick={onClose} className="p-2 rounded-full hover:bg-white/20 transition-colors">
                <ArrowLeft className="w-5 h-5 text-white" />
              </button>
              <ShoppingBag className="w-5 h-5 text-white" />
              <h2 className="text-lg font-bold text-white">Your Order</h2>
              <span className="text-xs bg-white/20 text-white px-2 py-0.5 rounded-full">
                {cart.length} {cart.length === 1 ? 'item' : 'items'}
              </span>
            </div>
            {cart.length > 0 && (
  <>
    <button
      onClick={handleClearCart}
      className="p-2 rounded-full hover:bg-white/20 transition-colors"
    >
      <Trash2 className="w-4 h-4 text-white" />
    </button>

    {showClearConfirm && (
      <div className="absolute top-16 right-4 bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-4 z-50 w-64 border border-gray-200 dark:border-gray-700">
        <p className="font-semibold text-gray-800 dark:text-white text-sm mb-1">Clear all items?</p>
        <p className="text-xs text-gray-500 dark:text-gray-400 mb-3">This will remove everything from your cart.</p>
        <div className="flex gap-2">
          <button
            onClick={() => setShowClearConfirm(false)}
            className="flex-1 py-2 rounded-xl bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-sm font-semibold"
          >
            Cancel
          </button>
          <button
            onClick={() => { onClear(); setShowClearConfirm(false); }}
            className="flex-1 py-2 rounded-xl bg-red-500 text-white text-sm font-bold"
          >
            Clear
          </button>
        </div>
      </div>
    )}
  </>
)}
          </div>

          {/* Cart Items - Scrollable */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {cart.length === 0 ? (
              <div className="text-center py-12">
                <ShoppingBag className="w-16 h-16 text-gray-400 mx-auto mb-3" />
                <p className="text-gray-500 dark:text-gray-400 text-lg">Cart is empty</p>
                <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">Add items from the menu</p>
                <button
                  onClick={onClose}
                  className="mt-6 px-6 py-2 rounded-xl bg-gradient-to-r from-orange-500 to-orange-600 text-white font-medium"
                >
                  Continue Shopping
                </button>
              </div>
            ) : (
              cart.map(item => {
                const menuImage = getMenuImage(item.id);
                const hasError = imageErrors[item.id];
                
                return (
                  <div key={item.id} className="flex items-center gap-3 bg-gray-50 dark:bg-gray-800 rounded-xl p-3 shadow-sm">
                    {/* Item Image */}
                    <div className="w-16 h-16 rounded-lg overflow-hidden bg-gray-200 flex-shrink-0">
                      {!hasError && menuImage?.imageUrl ? (
                        <img
                          src={menuImage.imageUrl}
                          alt={item.name}
                          className="w-full h-full object-cover"
                          onError={() => handleImageError(item.id)}
                        />
                      ) : (
                        <div 
                          className="w-full h-full flex items-center justify-center text-xs font-bold text-center p-1"
                          style={{ backgroundColor: menuImage?.fallbackColor || '#FF6B35' }}
                        >
                          <span className="text-white text-[10px] leading-tight">
                            {item.name.split(' ').slice(0, 2).join('\n')}
                          </span>
                        </div>
                      )}
                    </div>
                    
                    {/* Item Details */}
                    <div className="flex-1">
                      <p className="font-semibold text-gray-800 dark:text-white text-sm">{item.name}</p>
                      <p className="text-orange-600 dark:text-orange-400 font-bold text-sm mt-1">
                        ₱{item.price.toLocaleString()} each
                      </p>
                    </div>
                    
                    {/* Quantity Controls */}
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => onRemove(item.id)}
                        className="w-8 h-8 rounded-full bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 flex items-center justify-center hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="w-6 text-center font-bold text-sm">{item.quantity}</span>
                      <button
                        onClick={() => onAdd(item)}
                        className="w-8 h-8 rounded-full bg-gradient-to-r from-orange-500 to-orange-600 flex items-center justify-center hover:opacity-90 transition-opacity"
                      >
                        <Plus className="w-3 h-3 text-white" />
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Footer with Total and Checkout */}
          {cart.length > 0 && (
            <div className="p-4 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 shadow-lg">
              <div className="flex justify-between items-center mb-3">
                <span className="text-gray-500 dark:text-gray-400">Subtotal</span>
                <span className="font-semibold text-gray-800 dark:text-white">₱{cartTotal.toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center mb-4 pt-2 border-t border-gray-200 dark:border-gray-700">
                <span className="font-bold text-gray-800 dark:text-white text-lg">Total</span>
                <span className="font-black text-orange-600 dark:text-orange-400 text-2xl">₱{cartTotal.toLocaleString()}</span>
              </div>
              <motion.button
                whileTap={{ scale: 0.97 }}
                onClick={onCheckout}
                className="w-full py-4 rounded-2xl bg-gradient-to-r from-orange-500 to-orange-600 text-white font-bold text-lg shadow-lg"
              >
                Proceed to Checkout
              </motion.button>
            </div>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default CartDrawer;