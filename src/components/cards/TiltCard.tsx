'use client';

import React from 'react';
import { motion } from 'framer-motion';

interface TiltCardProps {
  children: React.ReactNode;
  className?: string;
  glowColor?: string;
}

export default function TiltCard({ children, className = '', glowColor = 'purple' }: TiltCardProps) {
  
  const getGlowClass = (color: string) => {
    switch(color) {
      case 'blue': return 'bg-blue-500';
      case 'pink': return 'bg-pink-500';
      case 'yellow': case 'gold': return 'bg-yellow-500';
      case 'green': return 'bg-green-500';
      default: return 'bg-purple-500';
    }
  };

  return (
    <motion.div
      whileHover={{ y: -5 }}
      transition={{ duration: 0.2 }}
      className={`relative ${className}`}
    >
      <div className="h-full w-full relative z-10">
        {children}
      </div>
      
      <motion.div 
        className={`absolute inset-0 -z-10 rounded-2xl blur-xl opacity-0 transition-opacity duration-300 ${getGlowClass(glowColor)}`}
        whileHover={{ opacity: 0.2 }}
      />
    </motion.div>
  );
}
