'use client';

import React, { useState, useEffect, useRef } from 'react';

interface Card {
  id: number;
  title: string;
  text: string;
  url: string;
  isHologram?: boolean; // ★ ホロ判定
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
  
  // MINT用
  const [mintTitle, setMintTitle] = useState('');
  const [mintText, setMintText] = useState('');
  const [mintImage, setMintImage] = useState<string | null>(null);
  const [isHoloSelected, setIsHoloSelected] = useState(false);
  const [lastHoloTime, setLastHoloTime] = useState<number>(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const HOLO_COOLDOWN = 168 * 60 * 60 * 1000; // 168時間（ミリ秒）

  useEffect(() => {
    setIsMounted(true);
    const lastTime = localStorage.getItem('room138_last_holo');
    if (lastTime) setLastHoloTime(parseInt(lastTime));
  }, []);

  const getSavedCards = (): Card[] => {
    if (typeof window === 'undefined') return [];
    const saved = localStorage.getItem('room138_cards');
    return saved ? JSON.parse(saved) : [{ id: 138000, title: 'ROOM138', text: 'Waiting...', url: '', isHologram: false }];
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

  // クールタイム計算
  const getHoloRemainingTime = () => {
    const now = Date.now();
    const diff = HOLO_COOLDOWN - (now - lastHoloTime);
    if (diff <= 0) return null;
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    return `${hours}h ${minutes}m`;
  };

  const remaining = getHoloRemainingTime();
  const isHoloAvailable = !remaining;

  const handleRelease = (asHolo: boolean) => {
    if (!mintImage && !mintTitle) return alert('EMPTY');
    if (asHolo && !isHoloAvailable) return;

    const newCard: Card = {
      id: Date.now(),
      title: mintTitle || 'UNTITLED',
      text: mintText || '',
      url: mintImage || '',
      isHologram: asHolo
    };

    if (asHolo) {
      const now = Date.now();
      localStorage.setItem('room138_last_holo', now.toString());
      setLastHoloTime(now);
    }

    localStorage.setItem('room138_cards', JSON.stringify([...getSavedCards(), newCard]));
    setMode('FISHING');
    setPhase('APPEAR');
    setIsHoloSelected(false);
    setMintTitle(''); setMintText(''); setMintImage(null);
  };

  if (!isMounted) return null;

  return (
    <div className="fixed inset-0 bg-[#F5F5F5] text-zinc-900 flex flex-col items-center justify-center overflow-hidden font-sans select-none touch-none">
      
      {/* メインの釣り画面 */}
      {mode === 'FISHING' && (
        <>
          <div className={`relative w-64 aspect-[1/1.618] z-10 transition-all duration-700
              ${phase === 'APPEAR' ? 'scale-90 opacity-40' : 'scale-100 opacity-100'}
              ${status === 'HIT' ? 'animate-shake' : ''}
              ${status === 'MISSED' ? 'animate-missed' : ''}
            `}
            style={{ perspective: '1000px' }}
          >
            <div className={`relative w-full h-full rounded-[12px] ${getCardAnimationClass()}`}
                 style={{ transformStyle: 'preserve-3d', transform: getCardRotation() }}>
              
              {/* 裏面 */}
              <div className="absolute inset-0 bg-white rounded-[12px] flex items-center justify-center border border-zinc-200" style={{ backfaceVisibility: 'hidden' }}>
                <span className="text-[10px] opacity-20 font-black tracking-widest">room138</span>
              </div>

              {/* 表面 */}
              <div className={`absolute inset-0 rounded-[12px] overflow-hidden flex flex-col ${currentCard?.isHologram ? 'p-[8px] animate-hologram-frame shadow-lg' : 'border border-zinc-200 bg-white'}`}
                   style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)',
                            background: currentCard?.isHologram ? 'linear-gradient(90deg, #ff00d0, #ffea00, #00ff40, #0099ff, #ff00d0)' : 'white',
                            backgroundSize: '200% auto' }}>
                
                <div className={`w-full h-full bg-white flex flex-col overflow-hidden ${currentCard?.isHologram ? 'rounded-[6px]' : 'rounded-[12px]'}`}>
                  <div className="w-full h-1/2 bg-zinc-50 border-b border-zinc-100 flex items-center justify-center overflow-hidden">
                    {currentCard?.url && <img src={currentCard.url} className="w-full h-full object-cover" />}
                  </div>
                  <div className="flex-1 p-4 flex flex-col justify-center relative">
                    <div className="text-[10px] font-bold tracking-widest uppercase mb-1">{currentCard?.title}</div>
                    <div className="text-[8px] opacity-40 leading-relaxed line-clamp-3">{currentCard?.text}</div>
                    <div className="absolute bottom-3 left-4 text-[7px] font-mono opacity-20">NO.{currentCard?.id}</div>
                    {currentCard?.isHologram && <div className="absolute top-2 right-2 text-[6px] font-black italic opacity-30 text-purple-600">HOLO</div>}
                  </div>
                </div>
              </div>
            </div>
          </div>
          {/* 操作系UIは省略（前回と同じ構成） */}
        </>
      )}

      {/* 生成モード */}
      {mode === 'MINT' && (
        <div className="absolute inset-0 bg-white z-[200] flex flex-col items-center p-6 pt-24 animate-slideUp">
           <div style={{ aspectRatio: '1 / 1.618' }} className={`relative w-64 rounded-[12px] flex flex-col overflow-hidden transition-all duration-500 ${isHoloSelected ? 'p-[8px] animate-hologram-frame' : 'border border-zinc-200'}`}
                style={{ background: isHoloSelected ? 'linear-gradient(90deg, #ff00d0, #ffea00, #00ff40, #0099ff, #ff00d0)' : 'white', backgroundSize: '200% auto' }}>
            <div className="w-full h-full bg-white rounded-[6px] flex flex-col overflow-hidden">
              <input type="text" value={mintTitle} onChange={(e) => setMintTitle(e.target.value.slice(0, 20))} placeholder="TITLE" className="w-full h-10 px-4 text-[10px] font-bold tracking-widest outline-none border-b border-zinc-100" />
              <div className="flex-1 flex items-center justify-center bg-zinc-50" onClick={() => fileInputRef.current?.click()}>
                {mintImage ? <img src={mintImage} className="w-full h-full object-cover" /> : <span className="text-2xl text-zinc-300">+</span>}
              </div>
              <textarea value={mintText} onChange={(e) => setMintText(e.target.value.slice(0, 140))} placeholder="DESCRIPTION..." className="w-full flex-1 p-4 text-[10px] leading-relaxed outline-none resize-none" />
            </div>
            <input type="file" ref={fileInputRef} onChange={(e) => {/* 省略: FileReader処理 */}} className="hidden" />
          </div>

          {/* ボタンエリア */}
          <div className="mt-12 w-full max-w-[280px] flex items-center gap-2">
            <button onClick={() => setMode('FISHING')} className="px-4 py-3 border border-zinc-200 text-[8px] font-black tracking-widest uppercase">CANCEL</button>
            
            {/* ★ HOLOボタン */}
            <button 
              onClick={() => isHoloAvailable && setIsHoloSelected(!isHoloSelected)}
              className={`flex-1 py-3 border transition-all flex flex-col items-center justify-center gap-1
                ${isHoloSelected ? 'border-purple-500 bg-purple-50' : 'border-zinc-200'}
                ${!isHoloAvailable ? 'opacity-30 grayscale' : 'active:scale-95'}`}
            >
              <span className="text-[8px] font-black tracking-widest">HOLO</span>
              {!isHoloAvailable && <span className="text-[6px] font-mono">{remaining}</span>}
            </button>

            <button onClick={() => handleRelease(isHoloSelected)} className="px-6 py-3 bg-zinc-900 text-white text-[8px] font-black tracking-widest uppercase">RELEASE</button>
          </div>
        </div>
      )}
      
      {/* 以前のstyle jsxを継続（hologram-frameアニメ含む） */}
    </div>
  );
}

// 補助関数
function getCardRotation() { /* 前回のロジック */ }
function getCardAnimationClass() { /* 前回のロジック */ }