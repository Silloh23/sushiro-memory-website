import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { DEFAULT_MEMORIES, DEFAULT_BGM_URL } from './data/memories';
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

  // Background Music (BGM) playback state
  const [bgmUrl, setBgmUrl] = useState(() => {
    return localStorage.getItem('omoide_bgm_url') || DEFAULT_BGM_URL;
  });
  const [isBgmPlaying, setIsBgmPlaying] = useState(false);
  const [isEditingBgm, setIsEditingBgm] = useState(false);
  const [bgmInputUrl, setBgmInputUrl] = useState(bgmUrl);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Restart, recreate, or update audio element whenever BGM URL changes
  useEffect(() => {
    if (!started) return;

    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.src = "";
    }

    if (!bgmUrl) {
      setIsBgmPlaying(false);
      return;
    }

    const audio = new Audio(bgmUrl);
    audio.loop = true;
    audio.volume = 0.35; // Beautiful soft cozy background level
    audioRef.current = audio;

    const handlePlay = () => setIsBgmPlaying(true);
    const handlePause = () => setIsBgmPlaying(false);
    audio.addEventListener('play', handlePlay);
    audio.addEventListener('pause', handlePause);

    // Auto-attempt playback on start
    audio.play().catch((err) => {
      console.warn("Autoplay was prevented by browser security. Audio will start upon click. Error:", err);
      setIsBgmPlaying(false);
    });

    return () => {
      audio.removeEventListener('play', handlePlay);
      audio.removeEventListener('pause', handlePause);
      audio.pause();
      audioRef.current = null;
    };
  }, [bgmUrl, started]);

  const toggleBgm = () => {
    if (!audioRef.current) return;
    if (isBgmPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play().catch((err) => {
        console.error("Audio playback failed manually:", err);
      });
    }
  };

  const handleSaveBgm = (url: string) => {
    const trimmed = url.trim();
    localStorage.setItem('omoide_bgm_url', trimmed);
    setBgmUrl(trimmed);
    setBgmInputUrl(trimmed);
    setIsEditingBgm(false);
  };

  const handleResetBgm = () => {
    localStorage.removeItem('omoide_bgm_url');
    setBgmUrl(DEFAULT_BGM_URL);
    setBgmInputUrl(DEFAULT_BGM_URL);
    setIsEditingBgm(false);
  };

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
    document.title = `Omoide Sushi — ${name}`;
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
            </div>
            <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-[#1a1a1a] drop-shadow-xs pointer-events-auto">
              Omoide Sushi <span className="font-serif italic font-normal text-2xl md:text-3xl ml-1 text-[#D0021B]">思い出寿司</span>
            </h1>
            <p className="text-[10px] md:text-xs text-[#2c2c2c] font-semibold opacity-60 tracking-wider mt-1 uppercase">6 Month Anniversary Edition</p>
          </div>

          <div className="flex flex-col items-end gap-2.5 mt-4 md:mt-0 max-w-[280px] w-full md:w-auto">
            {/* Memories Consumed Badge */}
            <div className="w-full bg-white/80 border border-[#F7C5C5] px-5 py-2.5 rounded-2xl shadow-sm flex items-center justify-between md:justify-end gap-4 backdrop-blur-md pointer-events-auto shadow-md">
              <div className="text-right">
                <p className="text-[10px] uppercase tracking-tighter opacity-50 font-bold text-[#2C2C2C]">Memories Consumed</p>
                <p className="text-lg font-bold text-[#1a1a1a]">{consumed.length} / {DEFAULT_MEMORIES.length}</p>
              </div>
              <div className="w-10 h-10 rounded-full bg-[#F7C5C5] flex items-center justify-center text-xl select-none shadow-xs"><span className="text-[#D0021B]">♥</span></div>
            </div>
          </div>
        </div>

        {/* Tabletop Vintage Vinyl Record Player */}
        <div className="absolute bottom-4 right-4 z-20 pointer-events-auto select-none scale-95 md:scale-100 origin-bottom-right transition-all duration-300">
          <div className="relative bg-[#dfbe9a] border-2 border-[#b09370] rounded-2xl w-28 h-28 shadow-xl p-2.5 flex flex-col justify-between overflow-visible" style={{ backgroundImage: 'linear-gradient(135deg, #e4c19b 0%, #d5ae86 100%)' }}>
            {/* Glossy top veneer bevel */}
            <div className="absolute inset-[2px] border border-white/20 rounded-xl pointer-events-none animate-pulse-subtle" />
            
            {/* Table shadow representation */}
            <div className="absolute -bottom-1 left-4 right-4 h-1 bg-black/30 rounded-full blur-xs pointer-events-none" />

            {/* Brass corner accent screws */}
            <div className="absolute top-1 left-1.5 w-1 h-1 rounded-full bg-amber-700/60 pointer-events-none" />
            <div className="absolute top-1 right-1.5 w-1 h-1 rounded-full bg-amber-700/60 pointer-events-none" />
            <div className="absolute bottom-1.5 left-1.5 w-1 h-1 rounded-full bg-amber-700/60 pointer-events-none" />
            <div className="absolute bottom-1.5 right-1.5 w-1 h-1 rounded-full bg-amber-700/60 pointer-events-none" />

            {/* The Record Platter Base (Metallic ring) */}
            <div 
              onClick={toggleBgm}
              className="absolute left-[9px] top-[9px] w-[76px] h-[76px] rounded-full bg-slate-300 shadow-inner flex items-center justify-center border border-slate-400/40 cursor-pointer active:scale-98 transition-transform"
              title={isBgmPlaying ? "Tap to Pause Music" : "Tap to Play Music"}
            >
              {/* Grooved Vinyl Disc */}
              <div 
                className={`relative w-[70px] h-[70px] rounded-full shadow-[0_2px_8px_rgba(0,0,0,0.5)] flex items-center justify-center border border-neutral-900 overflow-hidden vinyl-spin-container ${isBgmPlaying ? '' : 'vinyl-spin-paused'}`}
                style={{
                  background: 'radial-gradient(circle, #2a2a2a 14%, #121212 16%, #1f1f1f 32%, #0d0d0d 34%, #1c1c1c 46%, #111111 48%, #1a1a1a 60%, #080808 62%, #171717 74%, #040404 76%, #1f1f1f 88%)'
                }}
              >
                {/* Vinyl grooved light-reflection glares */}
                <div className="absolute inset-0 bg-gradient-to-tr from-white/0 via-white/5 to-white/0 rotate-45 pointer-events-none" />
                <div className="absolute inset-0 bg-gradient-to-bl from-white/0 via-white/5 to-white/0 rotate-45 pointer-events-none" />

                {/* Center Pastel Custom Label */}
                <div className="w-5 h-5 rounded-full bg-rose-200 border border-amber-950/20 flex items-center justify-center shadow-inner select-none pointer-events-none animate-pulse">
                  <span className="text-[10px] text-[#D0021B] leading-none select-none">♥</span>
                </div>
              </div>
            </div>

            {/* Swiveling Tonearm (Pivots physically onto the vinyl based on play state) */}
            <div 
              className="absolute top-[5px] right-[5px] w-14 h-14 origin-[44px_6px] transition-transform duration-700 ease-out pointer-events-none z-10"
              style={{
                transform: isBgmPlaying ? 'rotate(18deg)' : 'rotate(-10deg)',
              }}
            >
              {/* Stand bracket */}
              <div className="absolute top-[3px] right-[8px] w-2 h-2 rounded-full bg-slate-500 border border-slate-600 shadow-xs" />
              {/* Arm metal rod */}
              <div className="absolute top-[6px] right-[11px] w-11 h-[2px] bg-amber-100 rounded-full origin-right shadow-xs" style={{ transform: 'rotate(-44deg)' }} />
              {/* Cartridge and needle stylus block resting on record */}
              <div className="absolute top-[26px] left-[7px] w-[5px] h-[7px] bg-stone-700 rounded-xs border border-stone-800 shadow-xs" />
            </div>

            {/* Retro LED glowing operational light */}
            <div className="absolute bottom-1.5 left-2.5 flex items-center gap-1 shrink-0">
              <span className={`w-1.5 h-1.5 rounded-full shadow-[0_0_4px_rgba(0,0,0,0.2)] transition-colors duration-300 ${isBgmPlaying ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`} />
              <span className="text-[7.5px] font-mono font-extrabold text-[#745839]/80 tracking-widest uppercase">VINYL</span>
            </div>

            {/* Tiny Settings edit button to adjust/customize BGM URL */}
            <button
              onClick={() => setIsEditingBgm(!isEditingBgm)}
              className={`absolute bottom-1.5 right-2 w-5 h-5 rounded-md flex items-center justify-center transition-colors text-[9px] cursor-pointer hover:bg-[#b09370]/25 text-neutral-800 ${isEditingBgm ? 'bg-[#b09370]/40' : ''}`}
              title="Change Background Song Link"
            >
              ⚙️
            </button>

            {/* Floating popover/tooltip overlay to customize Spotify/audio URL when settings is clicked */}
            {isEditingBgm && (
              <div className="absolute bottom-12 right-0 w-[230px] bg-white border border-[#F7C5C5]/60 rounded-2xl shadow-xl p-3 z-30 flex flex-col gap-2 animate-fade-in text-left">
                <p className="text-[9px] font-extrabold text-[#2C2C2C] leading-tight flex items-center gap-1 select-none">
                  <span>🎵</span> PLAY YOUR OWN BGM
                </p>
                <p className="text-[8px] text-gray-500 leading-normal">
                  Paste the URL of an MP3/streaming audio file to change the turntable playlist sound:
                </p>
                
                <div className="flex gap-1.5">
                  <input 
                    type="text"
                    value={bgmInputUrl}
                    onChange={(e) => setBgmInputUrl(e.target.value)}
                    placeholder="https://example.com/song.mp3"
                    className="flex-1 text-[10px] bg-amber-50/50 border border-[#F7C5C5] rounded-md px-2 py-1 outline-none focus:border-[#D0021B] text-gray-800"
                  />
                  <button 
                    onClick={() => handleSaveBgm(bgmInputUrl)}
                    className="bg-[#D0021B] hover:bg-[#b00216] text-white text-[9px] font-bold px-2.5 py-1 rounded-md cursor-pointer transition-colors shrink-0"
                  >
                    Load
                  </button>
                </div>

                <div className="flex items-center justify-between border-t border-[#F7C5C5]/30 pt-1.5 mt-0.5 pointer-events-auto">
                  <span className="text-[8px] text-gray-400 truncate max-w-[120px] font-mono select-all">
                    {bgmUrl.split('/').pop() || 'Loading song...'}
                  </span>
                  <button 
                    onClick={handleResetBgm}
                    className="text-[9px] text-[#D0021B] hover:underline font-bold select-none cursor-pointer"
                  >
                    Reset
                  </button>
                </div>
              </div>
            )}
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
            <h5 className="font-display font-bold text-sm mt-1">Secret Menu is Brewing!</h5>
            <p className="font-sans text-xs text-gray-300 mt-1 leading-relaxed">
              Order all other {DEFAULT_MEMORIES.length - 1} magical memory plates to reveal the final secret dessert roll!
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
