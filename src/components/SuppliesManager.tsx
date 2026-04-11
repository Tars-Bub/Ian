import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Package, AlertTriangle, Clock, Trash2, Plus, Bell, AlertCircle } from 'lucide-react';
import { useSupplies } from '../hooks/useSupplies';
import { toast } from 'sonner';

const SuppliesManager = () => {
  const { supplies, addSupply, deleteSupply, getExpiringSoon, getExpired, updateSupplyQuantity } = useSupplies();
  const [showAddForm, setShowAddForm] = useState(false);
  const [lowStockItems, setLowStockItems] = useState<typeof supplies>([]);
  const [notifiedItems, setNotifiedItems] = useState<Set<string>>(new Set());
  const [newSupply, setNewSupply] = useState({
    name: '',
    category: 'Ingredients',
    quantity: 0,
    unit: 'kg',
    expiryDate: '',
    minStockLevel: 10,
  });

  const expiringSoon = getExpiringSoon();
  const expired = getExpired();

  // Check for low stock items - FIXED: removed dependency that causes infinite loop
  useEffect(() => {
    const lowStock = supplies.filter(supply => {
      const threshold = supply.minStockLevel || (supply.initialQuantity ? supply.initialQuantity * 0.2 : 5);
      return supply.quantity <= threshold && supply.quantity > 0;
    });
    setLowStockItems(lowStock);
  }, [supplies]); // Only depends on supplies, not on lowStockItems

  // Show notifications for low stock - FIXED: only shows once per item
  useEffect(() => {
    lowStockItems.forEach(supply => {
      if (!notifiedItems.has(supply.id)) {
        toast.warning(`⚠️ Low stock: ${supply.name} (${supply.quantity} ${supply.unit} remaining)`, {
          duration: 5000,
          icon: <AlertTriangle className="w-4 h-4" />,
        });
        setNotifiedItems(prev => new Set(prev).add(supply.id));
      }
    });
  }, [lowStockItems, notifiedItems]);

  const handleAddSupply = () => {
    if (!newSupply.name || !newSupply.expiryDate) {
      toast.error('Please fill in all required fields');
      return;
    }
    
    if (newSupply.quantity <= 0) {
      toast.error('Quantity must be greater than 0');
      return;
    }
    
    addSupply({
      name: newSupply.name,
      category: newSupply.category,
      quantity: newSupply.quantity,
      unit: newSupply.unit,
      expiryDate: newSupply.expiryDate,
      addedBy: 'Admin',
      minStockLevel: newSupply.minStockLevel,
      initialQuantity: newSupply.quantity,
    });
    
    toast.success(`${newSupply.name} added to inventory`);
    setNewSupply({ name: '', category: 'Ingredients', quantity: 0, unit: 'kg', expiryDate: '', minStockLevel: 10 });
    setShowAddForm(false);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'expired': return 'text-red-600 bg-red-50 dark:bg-red-900/30 dark:text-red-400';
      case 'warning': return 'text-orange-600 bg-orange-50 dark:bg-orange-900/30 dark:text-orange-400';
      default: return 'text-green-600 bg-green-50 dark:bg-green-900/30 dark:text-green-400';
    }
  };

  const getStatusText = (status: string, daysUntilExpiry: number) => {
    switch (status) {
      case 'expired': return 'Expired';
      case 'warning': return `Expires in ${daysUntilExpiry} days`;
      default: return 'Good';
    }
  };

  return (
    <div className="space-y-5">
      {/* Low Stock Alert Banner */}
      {lowStockItems.length > 0 && (
        <div className="bg-yellow-50 dark:bg-yellow-950 border-l-4 border-yellow-500 p-4 rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <Bell className="w-5 h-5 text-yellow-600" />
            <h3 className="font-bold text-yellow-700 dark:text-yellow-400">Low Stock Alert</h3>
          </div>
          <div className="space-y-1">
            {lowStockItems.map(supply => (
              <div key={supply.id} className="text-sm text-yellow-700 dark:text-yellow-400 flex justify-between items-center">
                <span>⚠️ {supply.name}</span>
                <span className="font-semibold">{supply.quantity} {supply.unit} remaining</span>
              </div>
            ))}
          </div>
          <p className="text-xs text-yellow-600 dark:text-yellow-500 mt-2">Please reorder these items soon!</p>
        </div>
      )}

      {/* Expiry Alert Banner */}
      {(expiringSoon.length > 0 || expired.length > 0) && (
        <div className="bg-orange-50 dark:bg-orange-950 border-l-4 border-orange-500 p-4 rounded-lg">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-orange-500" />
            <h3 className="font-bold text-orange-700 dark:text-orange-400">Expiry Alerts</h3>
          </div>
          <div className="mt-2 space-y-1">
            {expiringSoon.map(supply => (
              <div key={supply.id} className="text-sm text-orange-600 dark:text-orange-400">
                ⚠️ {supply.name} expires in {supply.daysUntilExpiry} days
              </div>
            ))}
            {expired.map(supply => (
              <div key={supply.id} className="text-sm text-red-600 dark:text-red-400">
                ❌ {supply.name} has expired!
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Add Supply Button */}
      <button
        onClick={() => setShowAddForm(!showAddForm)}
        className="w-full py-3 rounded-xl bg-gradient-to-r from-orange-500 to-orange-600 text-white font-bold flex items-center justify-center gap-2 shadow-md hover:shadow-lg transition-all"
      >
        <Plus className="w-5 h-5" />
        Add New Supply
      </button>

      {/* Add Supply Form */}
      <AnimatePresence>
        {showAddForm && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4 space-y-3 overflow-hidden shadow-md"
          >
            <input
              type="text"
              placeholder="Supply name"
              value={newSupply.name}
              onChange={e => setNewSupply({ ...newSupply, name: e.target.value })}
              className="w-full p-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
            />
            <select
              value={newSupply.category}
              onChange={e => setNewSupply({ ...newSupply, category: e.target.value })}
              className="w-full p-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
            >
              <option>Ingredients</option>
              <option>Supplies</option>
              <option>Packaging</option>
              <option>Cleaning</option>
            </select>
            <div className="flex gap-2">
              <input
                type="number"
                placeholder="Quantity"
                value={newSupply.quantity}
                onChange={e => setNewSupply({ ...newSupply, quantity: parseFloat(e.target.value) })}
                className="flex-1 p-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
              <select
                value={newSupply.unit}
                onChange={e => setNewSupply({ ...newSupply, unit: e.target.value })}
                className="w-24 p-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
              >
                <option>kg</option>
                <option>g</option>
                <option>L</option>
                <option>pcs</option>
                <option>bags</option>
              </select>
            </div>
            <input
              type="number"
              placeholder="Minimum stock level (alert when below)"
              value={newSupply.minStockLevel}
              onChange={e => setNewSupply({ ...newSupply, minStockLevel: parseFloat(e.target.value) })}
              className="w-full p-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
            />
            <input
              type="date"
              value={newSupply.expiryDate}
              onChange={e => setNewSupply({ ...newSupply, expiryDate: e.target.value })}
              className="w-full p-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
            />
            <button
              onClick={handleAddSupply}
              className="w-full py-3 rounded-xl bg-green-500 text-white font-bold hover:bg-green-600 transition-colors"
            >
              Save Supply
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Supplies List */}
      <div className="space-y-3">
        <div className="flex justify-between items-center">
          <h3 className="font-bold text-gray-800 dark:text-white flex items-center gap-2">
            <Package className="w-5 h-5" />
            Inventory List
          </h3>
          <span className="text-xs text-gray-500 dark:text-gray-400">{supplies.length} items</span>
        </div>
        
        {supplies.length === 0 ? (
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-8 text-center">
            <Package className="w-12 h-12 text-gray-400 mx-auto mb-2" />
            <p className="text-gray-500 dark:text-gray-400">No supplies added yet</p>
            <p className="text-xs text-gray-400 mt-1">Click + to add your first supply</p>
          </div>
        ) : (
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {supplies.map(supply => {
              const isLowStock = supply.quantity <= (supply.minStockLevel || (supply.initialQuantity ? supply.initialQuantity * 0.2 : 5));
              return (
                <div key={supply.id} className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4 shadow-sm hover:shadow-md transition-shadow">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h4 className="font-bold text-gray-900 dark:text-white">{supply.name}</h4>
                        {isLowStock && supply.quantity > 0 && (
                          <span className="text-xs bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300 px-2 py-0.5 rounded-full flex items-center gap-1">
                            <AlertCircle className="w-3 h-3" />
                            Low Stock
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                        {supply.quantity} {supply.unit} • {supply.category}
                      </p>
                    </div>
                    <button 
                      onClick={() => deleteSupply(supply.id)} 
                      className="text-red-500 hover:text-red-600 transition-colors p-1"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                  
                  <div className="mt-3 flex justify-between items-center">
                    <div className={`text-xs px-2 py-1 rounded-full ${getStatusColor(supply.status)}`}>
                      {getStatusText(supply.status, supply.daysUntilExpiry)}
                    </div>
                    <div className="flex items-center gap-1 text-xs text-gray-400">
                      <Clock className="w-3 h-3" />
                      Expires: {new Date(supply.expiryDate).toLocaleDateString()}
                    </div>
                  </div>
                  
                  {/* Progress bar for stock level */}
                  {supply.initialQuantity && (
                    <div className="mt-3">
                      <div className="flex justify-between text-xs text-gray-500 mb-1">
                        <span>Stock Level</span>
                        <span>{Math.round((supply.quantity / supply.initialQuantity) * 100)}%</span>
                      </div>
                      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                        <div 
                          className={`h-2 rounded-full transition-all ${
                            (supply.quantity / supply.initialQuantity) <= 0.2 
                              ? 'bg-red-500' 
                              : (supply.quantity / supply.initialQuantity) <= 0.5 
                                ? 'bg-yellow-500' 
                                : 'bg-green-500'
                          }`}
                          style={{ width: `${Math.min((supply.quantity / supply.initialQuantity) * 100, 100)}%` }}
                        />
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default SuppliesManager;