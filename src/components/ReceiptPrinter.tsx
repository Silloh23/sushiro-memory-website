import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { MemoryItem } from '../types';

interface ReceiptPrinterProps {
  memories: MemoryItem[];
  princessName: string;
}

export default function ReceiptPrinter({ memories, princessName }: ReceiptPrinterProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [printedText, setPrintedText] = useState('');
  const [isDone, setIsDone] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);

  // Generate the full receipt contents as lines for printing
  const headerLines = [
    "━━━━━━━━━━━━━━━━━━━━━",
    "     OMOIDE SUSHI     ",
    "    思い出寿司 (愛)    ",
    "━━━━━━━━━━━━━━━━━━━━━",
    `Reg No: ${new Date().getFullYear()}-0620`,
    `Date: ${new Date().toLocaleDateString()}`,
    `Cashier: Chief Teddy Tim`,
    `Customer: ${princessName}`,
    "---------------------",
    "ITEMS ORDERED:       "
  ];

  const itemsLines = memories.map((m, idx) => {
    // Left pads standard receipt listing length
    const rankStr = `${idx + 1}. ${m.emoji} ${m.title}`;
    const priceStr = `${m.price}`;
    const dotsCount = Math.max(2, 21 - rankStr.length - priceStr.length);
    const pads = ".".repeat(dotsCount);
    return `${rankStr}${pads}${priceStr}`;
  });

  const totalsLines = [
    "---------------------",
    `Total shared:        8 items`,
    "Days together:      183 days",
    "━━━━━━━━━━━━━━━━━━━━━",
    "Dear " + princessName + ",",
    "Thank you so much for",
    "6 gorgeous months of",
    "being the absolute",
    "best person in my",
    "whole entire world.",
    "",
    "Every day, you fill",
    "my path with magic,",
    "giggles, and fairy-",
    "tale warmth.",
    "",
    "I love you. ♡        ",
    "━━━━━━━━━━━━━━━━━━━━━",
    "     ありがとう     ",
    " 2026.06.20 - FOREVER ",
    "━━━━━━━━━━━━━━━━━━━━━"
  ];

  const fullLines = [...headerLines, ...itemsLines, ...totalsLines];
  
  useEffect(() => {
    // We will print character-by-character to let the paper grow organically!
    const fullReceiptText = fullLines.join('\n');
    let currentIndex = 0;
    
    // Smooth scrolling interval
    const scrollInterval = setInterval(() => {
      if (containerRef.current) {
        containerRef.current.scrollTop = containerRef.current.scrollHeight;
      }
    }, 50);

    const typewriterInterval = setInterval(() => {
      if (currentIndex < fullReceiptText.length) {
        setPrintedText((prev) => prev + fullReceiptText[currentIndex]);
        currentIndex++;
      } else {
        clearInterval(typewriterInterval);
        clearInterval(scrollInterval);
        setIsDone(true);
      }
    }, 18); // Fast typing speed

    return () => {
      clearInterval(typewriterInterval);
      clearInterval(scrollInterval);
    };
  }, [princessName]);

  const handleScreenshotClick = () => {
    setShowTooltip(true);
    setTimeout(() => {
      setShowTooltip(false);
    }, 3800);
  };

  return (
    <div id="receipt-overlay" className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="max-w-sm w-full flex flex-col items-center">
        
        {/* Soft falling particles inside background */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden select-none">
          {Array.from({ length: 15 }).map((_, i) => (
            <motion.div
              key={i}
              initial={{ y: -50, x: Math.random() * window.innerWidth, rotate: 0 }}
              animate={{ y: window.innerHeight + 50, rotate: 360 }}
              transition={{
                duration: Math.random() * 5 + 4,
                repeat: Infinity,
                ease: 'linear'
              }}
              className="absolute text-xl opacity-20"
            >
              {i % 3 === 0 ? '💕' : i % 3 === 1 ? '🌸' : '🧸'}
            </motion.div>
          ))}
        </div>

        {/* Paper Container */}
        <motion.div
          initial={{ y: 400, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ type: 'spring', damping: 20, stiffness: 100 }}
          className="w-full bg-[#FFFFFF] shadow-2xl relative select-text border border-gray-300"
          style={{ maxHeight: '82vh', display: 'flex', flexDirection: 'column' }}
        >
          {/* Top Receipt jagged torn edge */}
          <div className="absolute top-0 inset-x-0 h-3 flex overflow-hidden pointer-events-none select-none" style={{ filter: 'drop-shadow(0 1px 1px rgba(0,0,0,0.04))' }}>
            {Array.from({ length: 24 }).map((_, i) => (
              <div
                key={i}
                className="w-4 h-4 bg-[#FFF8F0] rotate-45 transform -translate-y-2.5 relative border border-gray-300"
                style={{ flexShrink: 0, scale: 1.1 }}
              />
            ))}
          </div>

          {/* Scrolling Paper slip core */}
          <div 
            ref={containerRef}
            className="flex-1 overflow-y-auto px-6 pt-8 pb-10 font-mono text-gray-800 text-xs md:text-sm tracking-wide leading-relaxed custom-scrollbar bg-white scroll-smooth"
            style={{ fontFamily: '"Share Tech Mono", monospace', whiteSpace: 'pre-wrap' }}
          >
            {printedText}

            {/* Simulated barcode when finished printing! */}
            {isDone && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.7 }}
                className="flex flex-col items-center mt-6 select-none"
              >
                {/* Barcode bars */}
                <div className="flex h-12 w-48 justify-center bg-white border border-gray-100 p-1">
                  {Array.from({ length: 36 }).map((_, i) => {
                    const barWidths = [1, 2, 3, 4];
                    const width = barWidths[Math.floor(Math.sin(i * 123.4) * 2 + 2)];
                    const isSpace = Math.sin(i * 2) > 0.1;
                    return (
                      <div 
                        key={i} 
                        className={`h-full ${isSpace ? 'bg-transparent' : 'bg-black'}`}
                        style={{ width: `${width}px` }}
                      />
                    );
                  })}
                </div>
                <span className="text-[9px] text-gray-400 mt-1 select-none font-mono">CODE: *LOVE-06-020*</span>
              </motion.div>
            )}
          </div>

          {/* Bottom jagged torn edge */}
          <div className="absolute bottom-0 inset-x-0 h-3 flex overflow-hidden pointer-events-none select-none" style={{ filter: 'drop-shadow(0 -1px 1px rgba(0,0,0,0.04))' }}>
            {Array.from({ length: 24 }).map((_, i) => (
              <div
                key={i}
                className="w-4 h-4 bg-[#FFF8F0] rotate-45 transform translate-y-2.5 relative border border-gray-300"
                style={{ flexShrink: 0, scale: 1.1 }}
              />
            ))}
          </div>
        </motion.div>

        {/* Action Button underneath */}
        <AnimatePresence>
          {isDone && (
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              className="mt-6 flex flex-col items-center w-full relative"
            >
              <button
                id="screenshot_save_receipt_btn"
                onClick={handleScreenshotClick}
                className="bg-[#D0021B] hover:bg-[#b00216] transition-colors text-white py-3 px-8 rounded-full font-display font-bold text-sm tracking-widest shadow-lg flex items-center gap-2 cursor-pointer"
              >
                <span>📸</span> Save as memory
              </button>

              {/* Toast/Tooltip info overlay */}
              {showTooltip && (
                <div className="absolute -top-16 bg-gray-900 border border-white/20 text-white text-xs py-2 px-4 rounded-lg shadow-xl text-center z-10 font-sans tracking-wide">
                  Take a screenshot to keep this receipt, or print to PDF! 💖
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
