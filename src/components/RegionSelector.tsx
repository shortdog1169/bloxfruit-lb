import React from 'react';
import { REGIONS } from '../data';
import { motion } from 'motion/react';

interface RegionSelectorProps {
  onSelect: (regionId: string) => void;
}

export default function RegionSelector({ onSelect }: RegionSelectorProps) {
  return (
    <div className="p-4 sm:p-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 max-w-7xl mx-auto">
      {REGIONS.map((region, index) => (
        <motion.button
          key={region.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.05 }}
          onClick={() => onSelect(region.id)}
          className="group relative h-48 sm:h-56 overflow-hidden rounded-3xl border border-border-subtle bg-[#111] transition-all hover:border-[#444] active:scale-95"
        >
          {/* Image */}
          <div className="absolute inset-0">
            <img 
              src={region.image} 
              alt={region.name} 
              className="w-full h-full object-cover opacity-40 group-hover:scale-110 group-hover:opacity-60 transition-all duration-700" 
            />
            {/* Gradient Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-bg-dark via-bg-dark/40 to-transparent" />
          </div>

          {/* Label */}
          <div className="absolute bottom-6 left-6 right-6 flex flex-col items-start translate-z-0">
            <span className="text-sm font-bold text-[#666] uppercase tracking-[0.2em] mb-1 group-hover:text-white/60 transition-colors">Project Region</span>
            <span className="text-xl sm:text-2xl font-black italic tracking-tighter text-white group-hover:text-accent-gold transition-colors">
              {region.name}
            </span>
          </div>
        </motion.button>
      ))}
    </div>
  );
}
