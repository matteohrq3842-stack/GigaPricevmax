'use client';

import { motion } from 'framer-motion';
import { FaShoppingCart, FaTag } from 'react-icons/fa';
import Image from 'next/image';
import Link from 'next/link';

interface DealProps {
  id: string;
  name: string;
  price: string;
  oldPrice: string;
  discount: string;
  url: string;
  imageUrl: string;
  delay?: number;
}

export default function DigitalDealCard({ id, name, price, oldPrice, discount, url, imageUrl, delay = 0 }: DealProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: delay * 0.05 }}
      className="h-full"
    >
      <Link
        href={`/deal/${id}`}
        className="group relative block h-full overflow-hidden rounded-2xl bg-[#13131a] border border-white/5 hover:border-purple-500/50 transition-all duration-300 shadow-lg hover:shadow-purple-900/20"
        data-deal-url={url}
      >
      <div className="relative aspect-[16/9] w-full overflow-hidden bg-[#0a0a0f]">
        {imageUrl ? (
          <Image
            src={imageUrl}
            alt={name}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            className="object-cover transition-transform duration-500 group-hover:scale-110"
            loading="lazy"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-[#1a1a20] to-[#0a0a0f]">
            <span className="text-4xl font-bold text-white/10">GP</span>
          </div>
        )}
        
        <div className="absolute inset-0 bg-gradient-to-t from-[#13131a] via-transparent to-transparent opacity-80" />

        {discount && (
          <div className="absolute top-3 right-3 flex items-center gap-1 rounded-full bg-red-500 px-3 py-1 text-xs font-bold text-white shadow-lg">
            <FaTag className="text-[10px]" />
            {discount}
          </div>
        )}
      </div>

      <div className="p-5 flex flex-col h-[calc(100%-aspect-[16/9])]">
        <h3 className="mb-auto line-clamp-2 text-lg font-semibold text-gray-100 group-hover:text-purple-400 transition-colors">
          {name}
        </h3>

        <div className="mt-4 flex items-baseline gap-3">
          <span className="text-2xl font-bold text-white">{price}</span>
          {oldPrice && (
            <span className="text-sm text-gray-500 line-through decoration-gray-600">
              {oldPrice}
            </span>
          )}
        </div>

        <div className="mt-4 flex items-center justify-center rounded-xl bg-white/5 py-3 text-sm font-bold text-white transition-all duration-300 group-hover:bg-purple-600 group-hover:shadow-lg group-hover:shadow-purple-600/30">
          <FaShoppingCart className="mr-2" />
          Voir l&apos;offre
        </div>
      </div>
      </Link>
    </motion.div>
  );
}
