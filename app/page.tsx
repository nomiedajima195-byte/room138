'use client';

import React, { useState, useEffect, useRef } from 'react';

interface Card {
  id: number;
  title: string;
  text: string;
  url: string;
  isHologram?: boolean;
}

type Phase = 'APPEAR' | 'COLOR' | 'HOOKING' | 'CHALLENGE' | 'LANDING' | 'RESULT' | 'SAVING';
type Status = 'IDLE' | 'HIT' | 'MISSED' | 'SUCCESS' | 'FAILED';

export default function Room138() {
  const [isMounted, setIsMounted] = useState(false);
  const [mode, setMode] = useState<'FISHING' | 'MINT'>('FISHING');
  const [phase, setPhase] = useState<Phase>('APPEAR');
  const [status, setStatus] = useState<Status>('IDLE');
  const [selectedColor, setSelectedColor] = useState<string | null>(null);
  const [tapCount, setTapCount] = useState(0);
  const [targetConfig, setTargetConfig] = useState({ color: '', taps: 0 });
  const [currentCard, setCurrentCard] = useState<Card | null>(null);
  
  // MINT (生成) 用の状態
  const [mintTitle, setMintTitle] = useState('');
  const [mintText, setMintText] = useState('');
  const [mintImage, setMintImage] = useState<string | null>(null);
  const [isHoloSelected, setIsHoloSelected] = useState(false);
  const [lastHoloTime, setLastHoloTime] = useState<number>(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const HOLO_COOLDOWN = 168 * 60 * 60 * 1000; // 168時間

  useEffect(() => {
    setIsMounted(true);
    const lastTime = localStorage.getItem('room138_last_holo');
    if (lastTime) setLastHoloTime(parseInt(lastTime));
  }, []);

  const getSavedCards = (): Card[] => {
    if (typeof window === 'undefined') return [];
    const saved = localStorage.getItem('room138_cards');
    return saved ? JSON.parse(saved) : [{ id: 138000, title: 'ROOM138', text: 'INIT...', url: '', isHologram: false }];
  };

  useEffect(() => {
    if (isMounted && mode === 'FISHING' && phase === 'APPEAR') {
      const cards = getSavedCards();
      setCurrentCard(cards[Math.floor(Math.random() * cards.length)]);
      setTargetConfig({
        color: ['#FF4B4B', '#4B7BFF', '#FFD600', '#00D656', '#A64BFF', '#000000'][Math.floor(Math.random() * 6)],
        taps: Math.floor(Math.random() * 6) + 1
      });
      setStatus('IDLE');
      setSelectedColor(null);
      setTapCount(0);
    }
  }, [phase, mode, isMounted]);

  const getRemainingHoloTime = () => {
    const diff = HOLO_COOLDOWN - (Date.now() - lastHoloTime);
    if (diff <= 0) return null;
    const h = Math.floor(diff / (1000 * 60 * 60));
    const m = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    return `${h}h ${m}m`;
  };

  const handleRelease = () => {
    if (!mintImage && !mintTitle) return;
    const newCard: Card = {
      id: Date.now(),
      title: mintTitle || 'UNTITLED',
      text: mintText || '',
      url: mintImage || '',
      isHologram: isHoloSelected
    };
    if (isHoloSelected) {
      const now = Date.now();
      localStorage.setItem('room138_last_holo', now.toString());
      setLastHoloTime(now);
    }
    localStorage.setItem('room138_cards', JSON.stringify([...getSavedCards(), newCard]));
    setMode('FISHING'); setPhase('APPEAR');
    setMintTitle(''); setMintText(''); setMintImage(null); setIsHoloSelected(false);
  };

  const getCardRotation = () => {
    if (['LANDING', 'SAVING', 'RESULT'].includes(phase)) return 'rotateY(180deg)';
    if (['HIT', 'MISSED'].includes(status)) return 'rotateY(180deg)';
    return 'rotateY(0deg)';
  };

  if (!isMounted) return null;

  const holoRemaining = getRemainingHoloTime();

  return (
    <div className="fixed inset-0 bg-[#F5F5F5] text-zinc-900 flex flex-col items-center justify-center overflow-hidden font-sans select-none touch-none">
      
      {/* HEADER */}
      <header className="absolute top-0 w-full h-16 flex items-center justify-between px-6 border-b border-zinc-200 bg-white z-[100]">
        <h1 className="text-[10px] tracking-[0.5em] font-black uppercase opacity-40">Rubbish</h1>
        <span className="text-[10px] tracking-[0.2em] font-bold opacity-30 uppercase">STORAGE: {getSavedCards().length}</span>
      </header>

      {mode === 'FISHING' && (
        <>
          {/* CARD CONTAINER */}
          <div className={`relative w-64 aspect-[1/1.618] z-10 transition-all duration-700
              ${phase === 'APPEAR' ? 'scale-90 opacity-40' : 'scale-100 opacity-100'}
              ${status === 'HIT' ? 'animate-shake' : ''}
              ${status === 'MISSED' ? 'animate-missed' : ''}
            `} style={{ perspective: '1000px' }}>
            <div className={`relative w-full h-full transition-transform duration-500
                ${phase === 'LANDING' ? 'animate-final-spin' : ''}
                ${status === 'SUCCESS' ? 'animate-bounce-3' : ''}
                ${status === 'FAILED' ? 'animate-fail-escape' : ''}
                ${phase === 'SAVING' ? 'animate-save-suck' : ''}
              `} style={{ transformStyle: 'preserve-3d', transform: getCardRotation() }}>
              
              {/* BACK */}
              <div className="absolute inset-0 bg-white rounded-[12px] flex items-center justify-center border border-zinc-200" style={{ backfaceVisibility: 'hidden' }}>
                <span className="text-[10px] opacity-20 font-black tracking-widest">ROOM138</span>
              </div>

              {/* FRONT (HOLO OPTION) */}
              <div className={`absolute inset-0 rounded-[12px] overflow-hidden flex flex-col 
                ${currentCard?.isHologram ? 'p-[8px] animate-hologram-frame' : 'border border-zinc-200 bg-white'}`}
                style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)',
                background: currentCard?.isHologram ? 'linear-gradient(90deg, #ff00d0, #ffea00, #00ff40, #0099ff, #ff00d0)' : 'white',
                backgroundSize: '200% auto' }}>
                
                <div className="w-full h-full bg-white flex flex-col overflow-hidden rounded-[6px]">
                  <div className="w-full h-1/2 bg-zinc-50 border-b border-zinc-100 flex items-center justify-center overflow-hidden">
                    {currentCard?.url && <img src={currentCard.url} className="w-full h-full object-cover" alt="" />}
                  </div>
                  <div className="flex-1 p-4 flex flex-col justify-center relative">
                    <div className="text-[10px] font-bold tracking-widest uppercase mb-1">{currentCard?.title}</div>
                    <div className="text-[8px] opacity-40 leading-relaxed line-clamp-3">{currentCard?.text}</div>
                    <div className="absolute bottom-3 left-4 text-[7px] font-mono opacity-20 uppercase tracking-tighter">NO.{currentCard?.id}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* CONTROLS (Z-50) */}
          <div className="absolute inset-0 flex flex-col items-center justify-end pb-24 z-50 pointer-events-none">
            <div className={`flex gap-4 mb-6 transition-all duration-500 pointer-events-auto ${phase === 'COLOR' ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
              {['#FF4B4B', '#4B7BFF', '#FFD600', '#00D656', '#A64BFF', '#000000'].map(c => (
                <button key={c} onClick={() => setSelectedColor(c)} className={`w-8 h-8 rounded-full border-2 ${selectedColor === c ? 'border-zinc-900 scale-125' : 'border-transparent'}`} style={{ backgroundColor: c }} />
              ))}
            </div>

            <div className={`flex gap-3 mb-8 transition-opacity duration-500 ${phase === 'CHALLENGE' ? 'opacity-100' : 'opacity-0'}`}>
              {[...Array(6)].map((_, i) => <div key={i} className={`w-3 h-3 rounded-full border-2 ${tapCount > i ? 'bg-zinc-900 border-zinc-900' : 'border-zinc-300'}`} />)}
            </div>

            <div className={`transition-all duration-500 pointer-events-auto ${(phase === 'COLOR' || phase === 'CHALLENGE') ? 'scale-100 opacity-100' : 'scale-50 opacity-0 pointer-events-none'}`}>
              <button 
                onClick={() => { if(phase === 'CHALLENGE') setTapCount(v => Math.min(v + 1, 6)); }}
                onContextMenu={(e) => { e.preventDefault(); if(phase === 'COLOR' && selectedColor) setPhase('HOOKING'); }}
                className="w-24 h-28 flex items-end justify-center active:scale-95 transition-transform"
              >
                <svg width="80" height="100" viewBox="0 0 80 100"><path d="M40 0L80 100H0L40 0Z" fill={selectedColor || '#DDD'} /></svg>
              </button>
            </div>
          </div>

          <footer className={`absolute bottom-0 w-full h-24 flex items-center justify-center z-[80] ${phase === 'APPEAR' ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
            <button onClick={() => setMode('MINT')} className="w-14 h-14 rounded-full bg-white border border-zinc-200 shadow-lg flex items-center justify-center active:scale-90">
              <div className="w-8 h-8 rounded-full border-[6px] border-zinc-900" />
            </button>
          </footer>
        </>
      )}

      {mode === 'MINT' && (
        <div className="absolute inset-0 bg-white z-[200] flex flex-col items-center p-6 pt-24 animate-slideUp">
          <div className={`relative w-64 aspect-[1/1.618] rounded-[12px] transition-all duration-500 ${isHoloSelected ? 'p-[8px] animate-hologram-frame' : 'border border-zinc-200'}`}
               style={{ background: isHoloSelected ? 'linear-gradient(90deg, #ff00d0, #ffea00, #00ff40, #0099ff, #ff00d0)' : 'white', backgroundSize: '200% auto' }}>
            <div className="w-full h-full bg-white rounded-[6px] flex flex-col overflow-hidden">
              <input type="text" value={mintTitle} onChange={e => setMintTitle(e.target.value)} placeholder="TITLE" className="w-full h-10 px-4 text-[10px] font-black tracking-widest border-b border-zinc-100 outline-none uppercase" />
              <div className="flex-1 bg-zinc-50 flex items-center justify-center overflow-hidden" onClick={() => fileInputRef.current?.click()}>
                {mintImage ? <img src={mintImage} className="w-full h-full object-cover" /> : <span className="text-zinc-300 text-3xl">+</span>}
              </div>
              <textarea value={mintText} onChange={e => setMintText(e.target.value)} placeholder="DESCRIPTION..." className="w-full h-32 p-4 text-[10px] outline-none resize-none" />
              <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={e => {
                const file = e.target.files?.[0];
                if(file) {
                  const reader = new FileReader();
                  reader.onloadend = () => setMintImage(reader.result as string);
                  reader.readAsDataURL(file);
                }
              }} />
            </div>
          </div>

          <div className="mt-12 flex items-center gap-2 w-full max-w-[300px]">
            <button onClick={() => setMode('FISHING')} className="flex-1 py-4 border border-zinc-200 text-[8px] font-black tracking-widest uppercase">CANCEL</button>
            
            <button 
              disabled={!!holoRemaining}
              onClick={() => setIsHoloSelected(!isHoloSelected)}
              className={`flex-1 py-4 border flex flex-col items-center justify-center gap-1 transition-all
                ${isHoloSelected ? 'bg-purple-50 border-purple-400' : 'border-zinc-200'}
                ${!!holoRemaining ? 'opacity-20 grayscale' : 'active:scale-95'}`}
            >
              <span className="text-[8px] font-black tracking-widest">HOLO</span>
              {holoRemaining && <span className="text-[6px] font-mono">{holoRemaining}</span>}
            </button>

            <button onClick={handleRelease} className="flex-1 py-4 bg-zinc-900 text-white text-[8px] font-black tracking-widest uppercase">RELEASE</button>
          </div>
        </div>
      )}

      <style jsx global>{`
        @keyframes hologram-frame { 0% { background-position: 0% 50%; } 50% { background-position: 100% 50%; } 100% { background-position: 0% 50%; } }
        .animate-hologram-frame { animation: hologram-frame 3s linear infinite; }
        @keyframes shake { 0%, 100% { transform: translateX(0); } 10%, 30%, 50%, 70%, 90% { transform: translateX(-5px); } 20%, 40%, 60%, 80% { transform: translateX(5px); } }
        .animate-shake { animation: shake 0.4s infinite; }
        @keyframes missed { 100% { transform: scale(1.1) rotateY(180deg) translateX(-150vw); } }
        .animate-missed { animation: missed 1s forwards 1.5s; }
        @keyframes final-spin { 0% { transform: rotateY(0deg); } 100% { transform: rotateY(1080deg); } }
        .animate-final-spin { animation: final-spin 2.5s cubic-bezier(0.2, 0.8, 0.2, 1) forwards; }
        @keyframes bounce-3 { 0%, 33%, 66%, 100% { transform: rotateY(180deg) translateY(0); } 16%, 50%, 83% { transform: rotateY(180deg) translateY(-30px); } }
        .animate-bounce-3 { animation: bounce-3 1.5s ease-in-out forwards; }
        @keyframes save-suck { 100% { transform: rotateY(180deg) translateY(400px) scale(0); opacity: 0; } }
        .animate-save-suck { animation: save-suck 0.6s ease-in forwards; }
        @keyframes fail-escape { 100% { transform: rotateY(180deg) translateX(150vw) rotate(30deg); } }
        .animate-fail-escape { animation: fail-escape 3s ease-in forwards; }
        @keyframes slideUp { from { transform: translateY(100%); } to { transform: translateY(0); } }
        .animate-slideUp { animation: slideUp 0.4s cubic-bezier(0.16, 1, 0.3, 1); }
      `}</style>
    </div>
  );
}