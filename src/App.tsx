import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { DEFAULT_MEMORIES } from './data/memories';
import { MemoryItem } from './types';
import LandingScreen from './components/LandingScreen';
import SushiroScene from './components/SushiroScene';
import MemoryRevealCard from './components/MemoryRevealCard';
import ReceiptPrinter from './components/ReceiptPrinter';

export default function App() {
  const [princessName, setPrincessName] = useState('');
  const [started, setStarted] = useState(false);
  const [activeTab, setActiveTab] = useState<'memories' | 'tim' | 'disney' | 'secret'>('memories');
  
  // App state
  const [onBelt, setOnBelt] = useState<MemoryItem[]>([]);
  const [ordered, setOrdered] = useState<number[]>([]);
  const [consumed, setConsumed] = useState<number[]>([]);
  const [queue, setQueue] = useState<number[]>([]);
  
  // Overlays
  const [activeMemory, setActiveMemory] = useState<MemoryItem | null>(null);
  const [showReceipt, setShowReceipt] = useState(false);
  const [showSecretsNotice, setShowSecretsNotice] = useState(false);

  // Check if touch device for optimal Raycaster tap configurations
  const [isTouchDevice, setIsTouchDevice] = useState(false);

  useEffect(() => {
    setIsTouchDevice(
      'ontouchstart' in window || 
      navigator.maxTouchPoints > 0
    );
  }, []);

  // Update document tab title on entrance
  const handleEnter = (name: string) => {
    setPrincessName(name);
    setStarted(true);
    document.title = `Omoide Sushi 🍣 — ${name}`;
  };

  // Compute if secret menu is unlocked
  const isSecretUnlocked = DEFAULT_MEMORIES
    .filter(m => m.category !== 'secret')
    .every(m => consumed.includes(m.id));

  // Determine current items to render in the scrollable view based on tab selection
  const visibleItems = DEFAULT_MEMORIES.filter((m) => m.category === activeTab);

  // Queue and spawn logic
  const handleOrder = (item: MemoryItem) => {
    if (item.category === 'secret' && !isSecretUnlocked) {
      setShowSecretsNotice(true);
      setTimeout(() => setShowSecretsNotice(false), 3800);
      return;
    }

    if (ordered.includes(item.id)) return; // Already ordered

    // Place on belt if there's less than 2 items currently active, else queue it
    if (onBelt.length < 2) {
      setOnBelt((prev) => [...prev, item]);
    } else {
      setQueue((prev) => [...prev, item.id]);
    }

    setOrdered((prev) => [...prev, item.id]);
  };

  // Called from SushiroScene when a user clicks/eats a plate
  const handlePlateConsumed = (id: number) => {
    const matchedItem = DEFAULT_MEMORIES.find(m => m.id === id);
    if (!matchedItem) return;

    // Remove from belt
    setOnBelt((prev) => prev.filter(item => item.id !== id));
    
    // Add to consumed list
    setConsumed((prev) => [...prev, id]);

    // Open standard love letter reveal card
    setActiveMemory(matchedItem);
  };

  // Next queued plate check - triggered after onBelt length declines
  useEffect(() => {
    if (onBelt.length < 2 && queue.length > 0) {
      const nextId = queue[0];
      const nextItem = DEFAULT_MEMORIES.find(m => m.id === nextId);
      
      if (nextItem) {
        setOnBelt((prev) => [...prev, nextItem]);
        setQueue((prev) => prev.slice(1));
      }
    }
  }, [onBelt, queue]);

  // Handle closing of memory letter modal
  const handleCloseMemory = () => {
    setActiveMemory(null);
    
    // Trigger final receipt printing if all 8 memories are fully consumed
    const allConsumed = consumed.length === DEFAULT_MEMORIES.length;
    if (allConsumed) {
      setTimeout(() => {
        setShowReceipt(true);
      }, 600);
    }
  };

  if (!started) {
    return <LandingScreen onEnter={handleEnter} />;
  }

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-[#FFF8F0] tracking-wide" style={{ backgroundImage: 'radial-gradient(circle at 50% 50%, #fffbf7 0%, #fff8f0 100%)' }}>
      
      {/* 3D Serving Area (60% Height) */}
      <div className="relative h-[50vh] md:h-[60vh] w-full flex-none overflow-hidden select-none">
        
        {/* Subtle Canvas Ambient shadow mask top/sides */}
        <div className="absolute inset-x-0 top-0 h-10 bg-gradient-to-b from-[#FFF8F0]/30 to-transparent z-10 pointer-events-none" />
        <div className="absolute inset-y-0 left-0 w-8 bg-gradient-to-r from-[#FFF8F0]/10 to-transparent z-10 pointer-events-none" />
        <div className="absolute inset-y-0 right-0 w-8 bg-gradient-to-l from-[#FFF8F0]/10 to-transparent z-10 pointer-events-none" />

        {/* 3D Core Canvas integration */}
        <SushiroScene 
          onBelt={onBelt} 
          onPlateConsumed={handlePlateConsumed} 
          isTouchDevice={isTouchDevice}
        />

        {/* HUD Overlay / Editorial Header */}
        <div className="absolute top-0 left-0 w-full p-6 md:p-8 flex flex-col md:flex-row justify-between items-start z-20 pointer-events-none select-none">
          <div className="flex flex-col">
            <div className="flex items-center gap-2 mb-1.5 pointer-events-auto">
              <span className="bg-[#D0021B] text-white px-3 py-0.5 rounded-full text-[10px] md:text-xs font-bold uppercase tracking-widest shadow-xs">Est. 2026</span>
              <span className="text-2xl animate-bounce"></span>
            </div>
            <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-[#1a1a1a] drop-shadow-xs pointer-events-auto">
              Omoide Sushi <span className="font-serif italic font-normal text-2xl md:text-3xl ml-1 text-[#D0021B]">思い出寿司</span>
            </h1>
            <p className="text-[10px] md:text-xs text-[#2c2c2c] font-semibold opacity-60 tracking-wider mt-1 uppercase">6 Month Anniversary Edition</p>
          </div>

          <div className="mt-4 md:mt-0 bg-white/80 border border-[#F7C5C5] px-5 py-2.5 rounded-2xl shadow-sm flex items-center gap-4 backdrop-blur-md pointer-events-auto shadow-md">
            <div className="text-right">
              <p className="text-[10px] uppercase tracking-tighter opacity-50 font-bold text-[#2C2C2C]">Memories Consumed</p>
              <p className="text-lg font-bold text-[#1a1a1a]">{consumed.length} / {DEFAULT_MEMORIES.length}</p>
            </div>
            <div className="w-10 h-10 rounded-full bg-[#F7C5C5] flex items-center justify-center text-xl select-none shadow-xs"><span className="text-[#D0021B]">♥</span></div>
          </div>
        </div>

        {/* Interactive hints block */}
        <div className="absolute bottom-3 left-1/2 transform -translate-x-1/2 z-10 bg-[#D0021B]/95 text-white font-sans text-xs font-semibold px-4 py-1.5 rounded-full shadow-lg tracking-wider animate-bounce select-none pointer-events-none">
          {consumed.length === DEFAULT_MEMORIES.length 
            ? "✦ Anniversary Table Cleared! ✦" 
            : onBelt.length === 0 
              ? "Order a custom roll from the touchscreen below!" 
              : "Tap moving plates to eat & unlock love notes!"
          }
        </div>
      </div>

      {/* Digital Order Touchscreen (Remaining 40% Height) */}
      <div className="flex-1 bg-[#1A1A1A] border-t-4 border-[#D0021B] flex flex-col overflow-hidden relative">
        
        {/* Touchscreen Header Panel - Alternating Japanese diner aesthetics */}
        <div className="bg-black/70 px-4 md:px-6 py-2.5 flex items-center justify-between border-b border-gray-800 flex-none select-none text-white">
          <div className="flex items-center gap-2">
            <span className="text-sm">🏮</span>
            <span className="font-display text-xs tracking-wider uppercase font-bold text-gray-300">
              Omoide Tablet System 
            </span>
            <span className="font-mono text-[9px] text-[#D0021B] bg-red-950 px-1.5 rounded font-extrabold pb-0.5">
              注文
            </span>
          </div>

          <div className="flex items-center gap-4 text-xs font-mono text-gray-400">
            <span>TABLE: A-1</span>
            <span>MEM: {queue.length > 0 ? `(${queue.length} Wait)` : 'READY'}</span>
          </div>
        </div>

        {/* Category Tabs list */}
        <div className="flex gap-3 px-6 py-4 bg-[#151515] overflow-x-auto select-none no-scrollbar flex-none">
          {(['memories', 'tim', 'disney', 'secret'] as const).map((cat) => {
            const isLocked = cat === 'secret' && !isSecretUnlocked;
            const tabName = cat === 'memories' ? 'Memories' :
                            cat === 'tim' ? 'Tim Specials' :
                            cat === 'disney' ? 'Disney Magic' : 'Secret Menu';
            const tabEmoji = cat === 'memories' ? '' :
                             cat === 'tim' ? '' :
                             cat === 'disney' ? '' : '';

            const isActive = activeTab === cat;

            return (
              <button
                key={cat}
                onClick={() => setActiveTab(cat)}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl cursor-pointer transition-all duration-200 outline-none text-xs font-bold uppercase tracking-wider whitespace-nowrap ${
                  isActive 
                    ? 'bg-[#D0021B] text-white shadow-md scale-102 font-bold' 
                    : 'bg-[#2C2C2C] text-white/60 hover:text-white border border-white/5'
                }`}
              >
                <span className="text-sm">{tabEmoji}</span>
                <span>{tabName}</span>
                {isLocked && <span className="text-[10px] leading-none opacity-80 select-none"></span>}
              </button>
            );
          })}
        </div>

        {/* Scrollable digital ordering card deck */}
        <div className="flex-1 overflow-x-auto overflow-y-hidden flex items-center px-6 py-4 gap-4 custom-scrollbar select-none bg-[#141414]">
          {visibleItems.map((item) => {
            const isOrdered = ordered.includes(item.id);
            const isConsumed = consumed.includes(item.id);
            const isOnBelt = onBelt.some(ob => ob.id === item.id);
            const isInQueue = queue.includes(item.id);
            const isWaiting = isOnBelt || isInQueue;

            return (
              <motion.div
                key={item.id}
                whileHover={{ y: isConsumed ? 0 : -4 }}
                className={`min-w-[160px] w-[180px] bg-[#262626] rounded-2xl border p-4 flex flex-col justify-between h-42 shadow-md relative group flex-none transition-transform ${
                  isConsumed 
                    ? 'border-white/5 opacity-50' 
                    : isWaiting 
                      ? 'border-[#D0021B] ring-2 ring-[#D0021B] shadow-[0_4px_15px_rgba(208,2,27,0.15)] bg-[#2C2222]' 
                      : 'border-white/5 hover:border-[#D0021B]/40'
                }`}
              >
                {/* Active pulsating ordered indicator lamp */}
                {isWaiting && (
                  <div className="absolute top-2.5 right-2.5 w-2 h-2 bg-[#FFE8A3] rounded-full animate-pulse z-10" />
                )}

                {/* Card Header information */}
                <div>
                  <div className="flex justify-between items-start mb-1">
                    {item.imageUrl ? (
                      <img 
                        src={item.imageUrl} 
                        alt="" 
                        className="w-9 h-9 rounded-full object-cover border border-white/20 select-none shadow-xs"
                        referrerPolicy="no-referrer"
                      />
                    ) : (
                      <span className="text-2xl select-none leading-none">{item.emoji}</span>
                    )}
                    <span className="text-[#D0021B] font-mono text-xs font-bold">{item.price}</span>
                  </div>
                  <h3 className="text-white font-bold text-xs md:text-sm tracking-wide leading-tight truncate select-all mt-1">
                    {item.title}
                  </h3>
                </div>

                {/* Interactive State Action Buttons */}
                <div className="mt-3">
                  {isConsumed ? (
                    <button className="w-full py-2 bg-[#333] text-white/40 text-[10px] font-bold rounded-lg uppercase tracking-wide cursor-not-allowed select-none">
                      Consumed
                    </button>
                  ) : isWaiting ? (
                    <button className="w-full py-2 bg-[#D0021B] text-white text-[10px] font-bold rounded-lg uppercase tracking-wide animate-pulse select-none">
                      On its way!
                    </button>
                  ) : (
                    <button
                      id={`order_btn_${item.id}`}
                      onClick={() => handleOrder(item)}
                      className="w-full py-2 border border-[#D0021B] text-[#D0021B] hover:bg-[#D0021B] hover:text-white text-[10px] font-bold rounded-lg uppercase tracking-wide transition-colors duration-150 active:scale-95 cursor-pointer select-none"
                    >
                      Order
                    </button>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Notice alert popups */}
      <AnimatePresence>
        {showSecretsNotice && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="fixed top-24 left-1/2 transform -translate-x-1/2 z-40 bg-gray-900 border-2 border-[#D0021B] py-3.5 px-6 rounded-xl shadow-2xl max-w-xs text-center select-none text-white backdrop-blur-md"
          >
            <span className="text-xl"></span>
            <h5 className="font-display font-bold text-sm mt-1">Secret Menu is Brewing!</h5>
            <p className="font-sans text-xs text-gray-300 mt-1 leading-relaxed">
              Feed Chef Tim all other {DEFAULT_MEMORIES.length - 1} magical memory plates to reveal the final secret dessert roll! 
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Love Letter Slip Memory Reveal Modal Card */}
      <MemoryRevealCard item={activeMemory} onClose={handleCloseMemory} />

      {/* Receipt Printer Overlay */}
      {showReceipt && <ReceiptPrinter memories={DEFAULT_MEMORIES} princessName={princessName} />}

    </div>
  );
}
