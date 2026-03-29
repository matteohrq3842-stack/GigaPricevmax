'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface PageLoaderProps {
  text: string;
}

export default function PageLoader({ text }: PageLoaderProps) {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
    }, 1500);

    return () => clearTimeout(timer);
  }, []);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          key="page-loader"
          initial={{ opacity: 1 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5 }}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100vw',
            height: '100vh',
            backgroundColor: '#000000',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: 99999,
          }}
        >
          <h1 style={{ 
            fontSize: '3.5rem',
            fontWeight: '800', 
            marginBottom: '1rem', 
            margin: '0 0 1rem 0',
            lineHeight: 1
          }}>
            <span style={{ color: '#ffffff' }}>Giga</span>
            <span style={{ 
              background: 'linear-gradient(90deg, #793BDC 0%, #8B2AAF 50%, #2372E2 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
              color: 'transparent'
            }}>Price</span>
          </h1>
          <p style={{ 
            fontSize: '1.2rem', 
            fontWeight: 300,
            opacity: 0.8,
            color: '#ffffff',
            margin: 0
          }}>
            {text}
          </p>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
