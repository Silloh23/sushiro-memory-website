import { motion, AnimatePresence } from 'motion/react';
import { MemoryItem } from '../types';

interface MemoryRevealCardProps {
  item: MemoryItem | null;
  onClose: () => void;
}

export default function MemoryRevealCard({ item, onClose }: MemoryRevealCardProps) {
  return (
    <AnimatePresence>
      {item && (
        <div id="memory-reveal-overlay" className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <motion.div
            initial={{ y: 200, opacity: 0, scale: 0.95 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: 200, opacity: 0, scale: 0.95 }}
            transition={{ type: 'spring', damping: 25, stiffness: 220 }}
            className="w-full max-w-sm rounded-2xl overflow-hidden shadow-2xl relative border-4 border-[#8d5b32]"
            style={{ backgroundColor: item.plateColor }}
          >
            {/* Grid Paper Texture overlay */}
            <div className="absolute inset-0 paper-texture opacity-40 mix-blend-multiply pointer-events-none" />

            {/* Content box */}
            <div className="p-8 relative flex flex-col items-center">
              
              {/* Authentically styled Japanese slip header */}
              <div className="w-full flex justify-between border-b-2 border-dashed border-gray-400 pb-3 mb-6 font-mono text-xs text-gray-700 select-none">
                <span>SLIP No. 06-020</span>
                <span>TABLE 1-A (LOVE)</span>
              </div>

              {/* Huge floaty emoji on top */}
              <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center shadow-md text-4xl border-2 border-amber-900 absolute -top-10 left-1/2 transform -translate-x-1/2 select-none">
                {item.emoji}
              </div>

              {/* Placeholder pad to keep geometry clean */}
              <div className="h-10 w-full" />

              {/* Title & Japanese calligraphy title */}
              <h3 className="font-serif italic text-2xl md:text-3xl text-[#2C2C2C] mt-2 text-center select-all font-bold">
                {item.title}
              </h3>
              
              {/* Sells authentic details */}
              <div className="font-mono text-[10px] tracking-wider text-gray-500 bg-white/60 px-2 py-0.5 rounded-full mt-1.5 font-bold uppercase select-none">
                Category: {item.category} • {item.price}
              </div>

              {/* Love Note content */}
              <p className="font-serif italic text-gray-800 text-base md:text-lg leading-relaxed mt-6 mb-8 text-center bg-white/70 p-5 rounded-xl border border-dashed border-red-200 shadow-xs select-text">
                "{item.memory}"
              </p>

              {/* Signature Red Japanese Seal Stamp (Gou-kaku / Approved / Ai-Love) */}
              <div className="absolute bottom-16 right-6 opacity-35 transform rotate-12 select-none pointer-events-none">
                <div className="w-13 h-13 border-2 border-[#D0021B] rounded-full flex flex-col justify-center items-center text-[11px] font-bold text-[#D0021B] tracking-wider leading-none">
                  <span>愛してる</span>
                  <span className="text-[7px] mt-0.5 font-mono">APPROVED</span>
                </div>
              </div>

              {/* Dismiss button */}
              <button
                id="noted_dismiss_btn"
                onClick={onClose}
                className="w-full bg-[#D0021B] hover:bg-[#b00216] text-white py-3 px-6 rounded-xl font-display font-bold uppercase tracking-widest text-sm shadow-md active:scale-95 duration-100 cursor-pointer text-center"
              >
                💕 Noted
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
