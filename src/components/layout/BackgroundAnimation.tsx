'use client';

import { useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';

interface Particle {
  x: number;
  y: number;
  radius: number;
  vx: number;
  vy: number;
  alpha: number;
  phase: number;
  depth: number;
}

const THEME_COLORS: Record<string, { r: number; g: number; b: number }> = {
  red: { r: 239, g: 68, b: 68 },
  pink: { r: 236, g: 72, b: 153 },
  green: { r: 34, g: 197, b: 94 },
  orange: { r: 249, g: 115, b: 22 },
  blue: { r: 59, g: 130, b: 246 },
  skyblue: { r: 14, g: 165, b: 233 },
  purple: { r: 168, g: 85, b: 247 },
};

export default function BackgroundAnimation() {
  const pathname = usePathname();
  const isHomeRef = useRef(true);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const themeColorRef = useRef<{r: number, g: number, b: number}>({ r: 168, g: 85, b: 247 });
  const disableForLegalPages = pathname === '/mentions-legales' || pathname === '/cgv' || pathname === '/privacy';

  useEffect(() => {
    isHomeRef.current = pathname === '/';
  }, [pathname]);

  const BASE_SPEED = 0.1;
  const PARALLAX_FORCE = 30;

  const particleSpriteRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const updateTheme = () => {
      const theme = document.documentElement.getAttribute('data-theme');
      if (theme && THEME_COLORS[theme]) {
        themeColorRef.current = THEME_COLORS[theme];
      } else {
        themeColorRef.current = THEME_COLORS['purple'];
      }
      generateParticleSprite();
    };

    const generateParticleSprite = () => {
        const size = 64; 
        const canvas = document.createElement('canvas');
        canvas.width = size;
        canvas.height = size;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const { r, g, b } = themeColorRef.current;
        const center = size / 2;
        const radius = size / 2;

        const gradient = ctx.createRadialGradient(center, center, 0, center, center, radius);
        gradient.addColorStop(0, 'rgba(255, 255, 255, 1)'); 
        gradient.addColorStop(0.2, `rgba(${r}, ${g}, ${b}, 0.8)`);
        gradient.addColorStop(0.5, `rgba(${r}, ${g}, ${b}, 0.2)`);
        gradient.addColorStop(1, 'transparent');

        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(center, center, radius, 0, Math.PI * 2);
        ctx.fill();

        particleSpriteRef.current = canvas;
    };

    const observer = new MutationObserver(updateTheme);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
    updateTheme();
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let particles: Particle[] = [];
    const isMobile = window.matchMedia('(max-width: 768px)').matches;
    const particleCount = pathname === '/' ? (isMobile ? 110 : 180) : (isMobile ? 55 : 90);
    
    let mouseX = 0;
    let mouseY = 0;
    let currentOffsetX = 0;
    let currentOffsetY = 0;

    const initParticles = (width: number, height: number) => {
      particles = [];
      for (let i = 0; i < particleCount; i++) {
        const depth = Math.random() * 1.5 + 0.5;
        
        particles.push({
          x: Math.random() * width,
          y: Math.random() * height, 
          radius: (Math.random() * 2.5 + 0.5) * depth,
          vx: (Math.random() * 0.5 + 0.2) * BASE_SPEED * depth, 
          vy: -(Math.random() * 0.5 + 0.2) * BASE_SPEED * depth,
          alpha: Math.random() * 0.6 + 0.2,
          phase: Math.random() * Math.PI * 2,
          depth: depth,
        });
      }
    };

    const resizeCanvas = () => {
      const dpr = window.devicePixelRatio || 1;
      canvas.width = window.innerWidth * dpr;
      canvas.height = window.innerHeight * dpr;
      ctx.scale(dpr, dpr);
      canvas.style.width = `${window.innerWidth}px`;
      canvas.style.height = `${window.innerHeight}px`;
      initParticles(window.innerWidth, window.innerHeight);
    };

    const handleMouseMove = (e: MouseEvent) => {
      if (!isHomeRef.current) return;
      mouseX = (e.clientX / window.innerWidth) - 0.5;
      mouseY = (e.clientY / window.innerHeight) - 0.5;
    };

    const animate = () => {
      if (document.hidden) {
        animationFrameId = requestAnimationFrame(animate);
        return;
      }
      if (!isHomeRef.current) {
        mouseX = 0;
        mouseY = 0;
      }

      ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
      
      const { r, g, b } = themeColorRef.current;
      const width = window.innerWidth;
      const height = window.innerHeight;

      const bgGradient = ctx.createLinearGradient(0, 0, 0, height);
      bgGradient.addColorStop(0, '#05020a'); 
      bgGradient.addColorStop(1, `rgba(${r * 0.4}, ${g * 0.4}, ${b * 0.4}, 1)`);
      
      ctx.globalCompositeOperation = 'source-over';
      ctx.fillStyle = bgGradient;
      ctx.fillRect(0, 0, width, height);

      const targetOffsetX = mouseX * PARALLAX_FORCE;
      const targetOffsetY = mouseY * PARALLAX_FORCE;
      currentOffsetX += (targetOffsetX - currentOffsetX) * 0.05;
      currentOffsetY += (targetOffsetY - currentOffsetY) * 0.05;

      particles.forEach(p => {
        p.x += p.vx;
        p.y += p.vy; 

        if (p.y < -50 || p.x > width + 50) {
            if (Math.random() > 0.5) {
                p.y = height + 50;
                p.x = Math.random() * width;
            } else {
                p.x = -50;
                p.y = Math.random() * height;
            }
        }

        p.phase += 0.02;
        const pulsingAlpha = p.alpha + Math.sin(p.phase) * 0.2;
        const safeAlpha = Math.max(0, Math.min(1, pulsingAlpha));

        const parallaxX = -currentOffsetX * p.depth; 
        const parallaxY = -currentOffsetY * p.depth;
        const displayX = p.x + parallaxX;
        const displayY = p.y + parallaxY;

        if (particleSpriteRef.current) {
            const size = p.radius * 8;
            ctx.globalAlpha = safeAlpha;
            ctx.drawImage(particleSpriteRef.current, displayX - size/2, displayY - size/2, size, size);
            ctx.globalAlpha = 1.0;
        }
      });
      
      animationFrameId = requestAnimationFrame(animate);
    };

    window.addEventListener('resize', resizeCanvas);
    window.addEventListener('mousemove', handleMouseMove);
    resizeCanvas();
    animate();

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      window.removeEventListener('mousemove', handleMouseMove);
      cancelAnimationFrame(animationFrameId);
    };
  }, [pathname]);

  if (disableForLegalPages) return null;

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        zIndex: -1,
        background: '#020105', 
        pointerEvents: 'none',
      }}
    />
  );
}
