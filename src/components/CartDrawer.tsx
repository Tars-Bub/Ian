import { motion, AnimatePresence } from 'framer-motion';
import { X, Plus, Minus, ShoppingBag, Trash2 } from 'lucide-react';
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
  onCheckout: () => void;
}

const CartDrawer = ({ open, onClose, cart, cartTotal, onAdd, onRemove, onCheckout }: CartDrawerProps) => {
  const [imageErrors, setImageErrors] = useState<Record<string, boolean>>({});

  const handleImageError = (id: string) => {
    setImageErrors(prev => ({ ...prev, [id]: true }));
  };

  const handleClearCart = () => {
    if (confirm('Clear all items from cart?')) {
      cart.forEach(item => onRemove(item.id));
    }
  };

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-50"
            onClick={onClose}
          />
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="fixed bottom-0 left-0 right-0 bg-card rounded-t-3xl z-50 flex flex-col max-h-[85vh]"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-border">
              <div className="flex items-center gap-2">
                <ShoppingBag className="w-5 h-5 text-primary" />
                <h2 className="text-lg font-bold text-foreground">Your Order</h2>
                <span className="text-xs text-muted-foreground">({cart.length} items)</span>
              </div>
              <div className="flex gap-2">
                {cart.length > 0 && (
                  <button
                    onClick={handleClearCart}
                    className="p-2 rounded-full hover:bg-red-100 transition-colors"
                    title="Clear all"
                  >
                    <Trash2 className="w-4 h-4 text-red-500" />
                  </button>
                )}
                <button onClick={onClose} className="p-2 rounded-full hover:bg-secondary">
                  <X className="w-5 h-5 text-muted-foreground" />
                </button>
              </div>
            </div>

            {/* Cart Items - Scrollable */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3 max-h-[50vh]">
              {cart.length === 0 ? (
                <div className="text-center py-12">
                  <ShoppingBag className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
                  <p className="text-muted-foreground">Cart is empty</p>
                  <p className="text-xs text-muted-foreground mt-1">Add items from the menu</p>
                </div>
              ) : (
                cart.map(item => {
                  const menuImage = getMenuImage(item.id);
                  const hasError = imageErrors[item.id];
                  
                  return (
                    <div key={item.id} className="flex items-center gap-3 bg-secondary/50 rounded-xl p-3">
                      {/* Item Image */}
                      <div className="w-14 h-14 rounded-lg overflow-hidden bg-gray-200 flex-shrink-0">
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
                        <p className="font-semibold text-foreground text-sm line-clamp-2">{item.name}</p>
                        <p className="text-primary font-bold text-sm mt-1">₱{item.price * item.quantity}</p>
                      </div>
                      
                      {/* Quantity Controls */}
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => onRemove(item.id)}
                          className="w-8 h-8 rounded-full bg-card border border-border flex items-center justify-center hover:bg-gray-100 transition-colors"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="w-6 text-center font-bold text-sm">{item.quantity}</span>
                        <button
                          onClick={() => onAdd(item)}
                          className="w-8 h-8 rounded-full gradient-orange flex items-center justify-center hover:opacity-90 transition-opacity"
                        >
                          <Plus className="w-3 h-3 text-primary-foreground" />
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Footer with Total and Checkout - Fixed at bottom */}
            {cart.length > 0 && (
              <div className="p-4 border-t border-border bg-card rounded-b-3xl">
                <div className="flex justify-between items-center mb-4">
                  <span className="font-semibold text-foreground">Total</span>
                  <span className="font-black text-primary text-2xl">₱{cartTotal.toLocaleString()}</span>
                </div>
                <motion.button
                  whileTap={{ scale: 0.97 }}
                  onClick={onCheckout}
                  className="w-full py-4 rounded-2xl gradient-orange text-primary-foreground font-bold text-lg shadow-float"
                >
                  Proceed to Checkout
                </motion.button>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default CartDrawer;