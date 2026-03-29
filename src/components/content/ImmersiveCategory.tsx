'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaSearch, FaSortAmountDown, FaLayerGroup } from 'react-icons/fa';
import TiltCard from '@/components/cards/TiltCard';
import DigitalDealCard from '@/components/cards/DigitalDealCard';

interface DealItem {
  id: string;
  name: string;
  price: string;
  oldPrice: string;
  discount: string;
  url: string;
  imageUrl: string;
  category?: string;
}

interface FilterOption {
  label: string;
  icon?: React.ReactNode;
  value: string;
}

interface ImmersiveCategoryProps {
  title: string;
  subtitle: string;
  items: DealItem[];
  filters: FilterOption[];
  filterFn: (item: DealItem, filterValue: string) => boolean;
  themeColor: 'purple' | 'blue' | 'pink' | 'gold' | 'green';
  bgPattern?: 'grid' | 'dots' | 'waves';
  loading?: boolean;
}

export default function ImmersiveCategory({
  title,
  subtitle,
  items,
  filters,
  filterFn,
  themeColor = 'purple',
  bgPattern = 'grid',
  loading = false
}: ImmersiveCategoryProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedFilter, setSelectedFilter] = useState(filters[0]?.value || "Tout");
  
  const filteredItems = items.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterFn(item, selectedFilter);
    return matchesSearch && matchesFilter;
  });

  const getColorClasses = (color: string) => {
    switch (color) {
      case 'blue': return {
        text: 'text-blue-500',
        border: 'border-blue-500/50',
        bg: 'bg-blue-500/10',
        gradient: 'from-blue-500/20',
        glow: 'shadow-blue-500/20'
      };
      case 'pink': return {
        text: 'text-pink-500',
        border: 'border-pink-500/50',
        bg: 'bg-pink-500/10',
        gradient: 'from-pink-500/20',
        glow: 'shadow-pink-500/20'
      };
      case 'gold': return {
        text: 'text-yellow-500',
        border: 'border-yellow-500/50',
        bg: 'bg-yellow-500/10',
        gradient: 'from-yellow-500/20',
        glow: 'shadow-yellow-500/20'
      };
      case 'green': return {
        text: 'text-green-500',
        border: 'border-green-500/50',
        bg: 'bg-green-500/10',
        gradient: 'from-green-500/20',
        glow: 'shadow-green-500/20'
      };
      default: return {
        text: 'text-purple-500',
        border: 'border-purple-500/50',
        bg: 'bg-purple-500/10',
        gradient: 'from-purple-500/20',
        glow: 'shadow-purple-500/20'
      };
    }
  };

  const theme = getColorClasses(themeColor);
  const glowColor = getGlowColor(themeColor);

  function getGlowColor(color: string) {
    switch (color) {
        case 'blue': return 'blue';
        case 'pink': return 'pink';
        case 'gold': return 'yellow';
        case 'green': return 'green';
        default: return 'purple';
    }
  }

  const getBackgroundPattern = () => {
      if (bgPattern === 'dots') {
          return 'radial-gradient(rgba(255,255,255,0.1) 1px, transparent 1px)';
      }
      if (bgPattern === 'waves') {
          return 'repeating-radial-gradient(circle at 0 0, transparent 0, rgba(255,255,255,0.03) 40px), repeating-linear-gradient(rgba(255,255,255,0.03) 0, transparent 2px)';
      }
      return 'linear-gradient(to right, rgba(255,255,255,0.05) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.05) 1px, transparent 1px)';
  };

  return (
    <div className="min-h-screen bg-[#0a0a0f] relative overflow-hidden text-gray-100 selection:bg-white/10">
      <div className="fixed inset-0 pointer-events-none z-0">
        <div 
            className="absolute inset-0"
            style={{
                backgroundImage: getBackgroundPattern(),
                backgroundSize: bgPattern === 'dots' ? '24px 24px' : '40px 40px',
                maskImage: 'radial-gradient(circle at center, black, transparent 80%)',
                opacity: 0.4
            }}
        />
        <div 
            className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[500px] rounded-full blur-[120px] opacity-10"
            style={{
                background: `radial-gradient(circle, ${theme.text.replace('text-', '')} 0%, transparent 70%)`
            }}
        />
      </div>

      <div className="relative z-10 max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-24">
        
        <motion.div 
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-16 text-center relative"
        >
            <div className={`inline-flex items-center justify-center mb-6 p-4 rounded-3xl border bg-[#13131a]/80 backdrop-blur-md ${theme.border} shadow-lg ${theme.glow}`}>
                <FaLayerGroup className={`text-3xl ${theme.text}`} />
            </div>
            <h1 className="text-5xl md:text-8xl font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-b from-white to-white/50 mb-6 uppercase">
                {title}
            </h1>
            <p className="text-xl text-gray-400 max-w-3xl mx-auto leading-relaxed font-light">
                {subtitle}
            </p>
        </motion.div>

        <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mb-16 space-y-8"
        >
            <div className="relative max-w-2xl mx-auto group">
                <div className={`absolute inset-0 bg-gradient-to-r ${theme.gradient} opacity-0 group-focus-within:opacity-100 transition-opacity duration-500 rounded-2xl blur-xl`} />
                <div className="relative bg-[#13131a]/80 backdrop-blur-xl border border-white/10 rounded-2xl p-2 shadow-2xl flex items-center transition-all duration-300 group-focus-within:border-white/30 group-focus-within:bg-[#13131a]/95">
                    <FaSearch className="ml-4 text-gray-500 text-xl group-focus-within:text-white transition-colors" />
                    <input 
                        type="text" 
                        placeholder="Rechercher une offre..." 
                        className="w-full bg-transparent border-none py-3 px-4 text-white text-lg focus:outline-none placeholder-gray-600 font-medium"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            <div className="flex flex-wrap justify-center gap-3">
                {filters.map((filter) => {
                    const isActive = selectedFilter === filter.value;
                    return (
                        <button
                            key={filter.value}
                            onClick={() => setSelectedFilter(filter.value)}
                            className={`relative group px-6 py-3 rounded-full border transition-all duration-300 flex items-center gap-3 overflow-hidden ${
                                isActive 
                                    ? `bg-white/10 ${theme.border} text-white shadow-[0_0_20px_rgba(0,0,0,0.5)]`
                                    : 'bg-[#13131a]/50 border-white/5 text-gray-400 hover:bg-white/10 hover:text-white hover:border-white/20'
                            }`}
                        >
                            {isActive && (
                                <motion.div 
                                    layoutId="active-pill-glow"
                                    className={`absolute inset-0 opacity-20 ${theme.bg}`}
                                />
                            )}
                            
                            <span className={`text-lg relative z-10 transition-transform duration-300 ${isActive ? 'scale-110 ' + theme.text : 'group-hover:text-white'}`}>
                                {filter.icon}
                            </span>
                            <span className="font-semibold relative z-10 tracking-wide">
                                {filter.label}
                            </span>
                        </button>
                    );
                })}
            </div>
        </motion.div>

        <div className="w-full">
            <div className="flex items-center justify-between mb-8 px-2 border-b border-white/5 pb-4">
                <div className="text-sm text-gray-400 font-medium flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${filteredItems.length > 0 ? 'bg-green-500' : 'bg-red-500'}`} />
                    <span className="text-white font-bold">{filteredItems.length}</span> 
                    résultats trouvés
                </div>
                <button className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#13131a] border border-white/10 text-gray-400 hover:text-white hover:border-white/20 transition-all active:scale-95 text-sm font-medium">
                    <span>Trier par</span>
                    <FaSortAmountDown />
                </button>
            </div>

            {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                        <div key={i} className="aspect-[3/4] rounded-3xl bg-[#13131a]/50 animate-pulse border border-white/5" />
                    ))}
                </div>
            ) : (
                <motion.div 
                    layout 
                    className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
                >
                    <AnimatePresence mode='popLayout'>
                        {filteredItems.map((item, index) => (
                            <motion.div
                                key={item.id}
                                layout
                                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                                transition={{ duration: 0.3, delay: index * 0.05 }}
                            >
                                <TiltCard glowColor={glowColor}>
                                    <DigitalDealCard {...item} />
                                </TiltCard>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                </motion.div>
            )}

            {!loading && filteredItems.length === 0 && (
                 <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-center py-32"
                >
                     <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-[#13131a] mb-6 border border-white/5 shadow-2xl">
                         <FaSearch className="text-4xl text-gray-700" />
                     </div>
                     <h3 className="text-3xl font-bold text-white mb-4">Aucun résultat</h3>
                     <p className="text-gray-500 text-lg max-w-md mx-auto">Nous n&apos;avons trouvé aucune offre correspondant à vos critères.</p>
                     <button 
                        onClick={() => {
                            setSearchTerm("");
                            setSelectedFilter(filters[0]?.value || "Tout");
                        }}
                        className={`mt-8 px-8 py-3 rounded-xl bg-white/5 hover:bg-white/10 text-white border border-white/10 transition-all font-medium`}
                    >
                        Réinitialiser les filtres
                     </button>
                 </motion.div>
            )}
        </div>
      </div>
    </div>
  );
}
