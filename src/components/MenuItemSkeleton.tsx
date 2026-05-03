import { motion } from 'framer-motion';

const MenuItemSkeleton = () => {
  return (
    <div className="bg-card rounded-2xl shadow-card border border-border overflow-hidden">
      <div className="h-32 bg-gray-200 animate-pulse" />
      <div className="p-3 space-y-2">
        <div className="h-4 bg-gray-200 rounded animate-pulse" />
        <div className="h-4 w-2/3 bg-gray-200 rounded animate-pulse" />
        <div className="h-6 w-1/2 bg-gray-200 rounded animate-pulse mt-2" />
      </div>
    </div>
  );
};

export default MenuItemSkeleton;