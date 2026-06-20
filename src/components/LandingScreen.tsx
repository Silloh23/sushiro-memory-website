import React, { useState } from 'react';

interface LandingScreenProps {
  onEnter: (name: string) => void;
}

export default function LandingScreen({ onEnter }: LandingScreenProps) {
  const [name, setName] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onEnter(name.trim() || 'My Princess');
  };

  return (
    <div id="landing-screen" className="fixed inset-0 bg-[#FFF8F0] z-50 flex flex-col justify-between overflow-y-auto px-4 py-8">
      {/* Decorative Bear Paw Prints scattered around */}
      <div className="absolute top-10 left-8 md:left-24 opacity-20 transform -rotate-12 pointer-events-none">
        <div className="w-8 h-8 bg-amber-800 rounded-full relative">
          <div className="w-2.5 h-2.5 bg-amber-800 rounded-full absolute -top-3.5 left-0"></div>
          <div className="w-2.5 h-2.5 bg-amber-800 rounded-full absolute -top-4.5 left-4"></div>
          <div className="w-2.5 h-2.5 bg-amber-800 rounded-full absolute -top-3.5 left-7.5"></div>
        </div>
      </div>
      <div className="absolute bottom-20 right-8 md:right-28 opacity-20 transform rotate-12 pointer-events-none">
        <div className="w-10 h-10 bg-amber-800 rounded-full relative">
          <div className="w-3 h-3 bg-amber-800 rounded-full absolute -top-4 left-0"></div>
          <div className="w-3 h-3 bg-amber-800 rounded-full absolute -top-5 left-5"></div>
          <div className="w-3 h-3 bg-amber-800 rounded-full absolute -top-4 left-9"></div>
        </div>
      </div>

      {/* Floating Sparkles/Sakura CSS indicators in background */}
      <div className="absolute top-28 right-16 w-3 h-3 bg-red-400 rounded-full animate-ping pointer-events-none opacity-40"></div>
      <div className="absolute bottom-36 left-12 w-4 h-4 bg-pink-300 rounded-full animate-pulse pointer-events-none opacity-50"></div>

      <div className="max-w-md w-full mx-auto my-auto flex flex-col items-center">
        {/* Noren / Sushiro Alternating Roof Canopy Canopy */}
        <div className="w-full flex justify-between h-8 bg-[#D0021B] rounded-t-lg relative overflow-hidden shadow-md">
          <div className="absolute inset-0 flex">
            {Array.from({ length: 12 }).map((_, i) => (
              <div 
                key={i} 
                className="flex-1 h-full"
                style={{ backgroundColor: i % 2 === 0 ? '#D0021B' : '#FFFFFF' }}
              />
            ))}
          </div>
        </div>

        {/* Outer Wooden Sign Plate - Omoide Sushi */}
        <div className="w-full bg-[#FCF8F2] border-4 border-[#8d5b32] p-6 shadow-xl text-center relative rounded-b-lg">
          {/* Red branding square tags like trademark logo stamps */}
          <div className="absolute top-3 right-4 bg-[#D0021B] text-white text-[10px] font-bold px-1.5 py-0.5 rounded tracking-widest text-vertical select-none font-mono">
            思い出
          </div>

          <p className="text-[#D0021B] font-mono text-xs tracking-[0.25em] mb-1 font-semibold">
            ✦ VIRTUAL SUSHI EXPERIENCES ✦
          </p>

          <h1 className="font-display font-bold text-3xl md:text-4xl text-[#2C2C2C] tracking-wide mt-2 float-slow drop-shadow-sm">
            Omoide Sushi
          </h1>
          <h2 className="text-[#D0021B] font-bold font-display text-xl tracking-[0.3em] font-sans mt-1">
            思い出寿司
          </h2>
          
          <div className="w-32 h-[2px] bg-[#D0021B] mx-auto my-4 opacity-70"></div>
          <p className="text-gray-600 text-sm tracking-wide font-sans leading-relaxed">
            A special dining table cooked with 6 months of love, laughter, and fairy tales.
          </p>
        </div>

        {/* Cozy teddy bear Minion Tim illustration inside CSS */}
        <div className="w-32 h-32 mt-6 relative flex justify-center items-center pointer-events-none select-none">
          {/* Main Bear Face body */}
          <div className="w-24 h-20 bg-[#a16238] rounded-full relative shadow-md">
            {/* Bear Ears and circles inside */}
            <div className="w-8 h-8 bg-[#a16238] rounded-full absolute -top-3 -left-1 flex justify-center items-center">
              <div className="w-5 h-5 bg-[#c49275] rounded-full"></div>
            </div>
            <div className="w-8 h-8 bg-[#a16238] rounded-full absolute -top-3 -right-1 flex justify-center items-center">
              <div className="w-5 h-5 bg-[#c49275] rounded-full"></div>
            </div>

            {/* Cute Minions Tim Teddy bear glass eyes (mismatched/cute) */}
            <div className="w-6 h-6 bg-white border-2 border-amber-900 rounded-full absolute top-4 left-4 flex justify-center items-center">
              <div className="w-2.5 h-2.5 bg-amber-900 rounded-full"></div>
            </div>
            {/* Cute button/mismatched eye */}
            <div className="w-6 h-6 bg-[#efe9bf] border-2 border-amber-900 rounded-full absolute top-4 right-4 flex justify-center items-center">
              {/* Button threads cross */}
              <div className="text-amber-900 text-[10px] leading-none mb-0.5 font-bold">×</div>
            </div>

            {/* Bear Snout */}
            <div className="w-9 h-6 bg-[#f7d9cc] rounded-full absolute bottom-4 left-1/2 transform -translate-x-1/2 flex flex-col justify-center items-center">
              {/* Cute tiny triangle nose */}
              <div className="w-2 h-1.5 bg-amber-900 rounded-b-md"></div>
              {/* Smile curve */}
              <div className="w-3 h-1.5 border-b border-amber-900 rounded-b-full -mt-0.5"></div>
            </div>

            {/* Blushing Cheeks */}
            <div className="w-2.5 h-2 bg-[#ffccd5] rounded-full absolute top-9 left-2.5"></div>
            <div className="w-2.5 h-2 bg-[#ffccd5] rounded-full absolute top-9 right-2.5"></div>
          </div>
          
          {/* Little sushi Chef Cap */}
          <div className="absolute top-1 left-9 bg-white border border-[#D0021B] px-1.5 py-0.5 rounded text-[8px] tracking-wider text-[#D0021B] font-extrabold select-none shadow">
            SUSHIRO
          </div>
        </div>

        {/* Entrance Name Input Form Card */}
        <form onSubmit={handleSubmit} className="w-full bg-white p-6 rounded-xl shadow-lg border border-red-100 mt-6 text-center">
          <label className="block text-gray-700 font-sans text-xs uppercase tracking-widest font-bold mb-2.5">
            What is your name, princess?
          </label>
          <input
            id="princess_name_entry"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="My Love / 彼女の名前"
            maxLength={20}
            className="w-full text-center px-4 py-3 bg-amber-50/40 rounded-lg border-2 border-[#FFE8A3] focus:outline-none focus:border-[#D0021B] font-sans antialiased placeholder-gray-400 font-medium transition-colors text-gray-800"
          />

          <button
            id="enter_restaurant_btn"
            type="submit"
            className="w-full mt-4 bg-[#D0021B] text-white hover:bg-[#b00216] transition-all py-3.5 px-6 rounded-lg font-display font-bold tracking-wider text-base shadow-md active:scale-95 duration-150 flex items-center justify-center gap-2 cursor-pointer"
          >
            Enter the restaurant <span>→</span>
          </button>
        </form>
      </div>

      {/* Footer Branding credits */}
      <footer className="w-full text-center mt-8 pointer-events-none select-none">
        <p className="text-[10px] text-gray-400 font-mono tracking-widest leading-relaxed">
          6-MONTH ANNIVERSARY GIFT
          <br />
          © OMOIDE SUSHI & CO. ALL RIGHTS RESERVED
        </p>
      </footer>
    </div>
  );
}
