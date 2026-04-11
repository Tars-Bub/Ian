// src/assets/logo.tsx
import React from 'react';
import logo from './logo.png';

export const Logo: React.FC<{ className?: string }> = ({ className = "w-64 h-auto" }) => {
  return (
    <img 
      src={logo} 
      alt="MAIFAH Logo" 
      className={className}
    />
  );
};

export default Logo;