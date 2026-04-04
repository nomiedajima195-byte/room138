'use client';

import React, { useState, useEffect, useRef } from 'react';

interface Card {
  id: number;
  title: string;
  text: string;
  url: string;
}

export default function Room138() {
  const [isMounted, setIsMounted] = useState(false);
  const [mode, setMode] = useState<'FISHING' | 'MINT'>('FISHING');
  const [phase, setPhase] = useState<'APPEAR' | 'COLOR' | 'HOOKING' | 'CHALLENGE' | 'LANDING' | 'RESULT'>('APPEAR');
  const [status, setStatus] = useState<'IDLE' | 'HIT' | 'MISSED' | 'SUCCESS' | 'FAILED'>('IDLE');
  const [selectedColor, setSelectedColor] = useState<string | null>(null);
  const [tapCount, setTapCount] = useState(0);
  const [targetConfig, setTargetConfig] = useState({ color: '', taps: 0 });
  const [startY, setStartY] = useState(0);
  const [currentCard, setCurrentCard] = useState<Card | null>(null);

  const [mintTitle, setMintTitle] = useState('');
  const [mintText, setMintText] = useState('');
  const [mintImage, setMintImage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => { setIsMounted(true); }, []);

  const getSavedCards = (): Card[] => {
    if (typeof window === 'undefined') return [];
    const saved = localStorage.getItem('room138_cards');
    const dummy: Card[] = [{ id: 138000, title: 'ROOM138', text: 'Waiting...', url: 'https://images.unsplash.com/photo-1550684848-fac1c5b4e853?q=80&w=400' }];
    return saved ? JSON.parse(saved) : dummy;
  };

  useEffect(() => {
    if (isMounted && mode === 'FISHING' && phase === 'APPEAR') {
      const cards = getSavedCards();
      setCurrentCard(cards[Math.floor(Math.random() * cards.length)]);
      setTargetConfig({
        color: ['#FF4B4B', '#4B7BFF', '#FFD600', '#00D656', '#A64BFF', '#000000'][Math.floor(Math.random() * 6)],
        taps: Math.floor(Math.random() * 3) + 1
      });
      setStatus('IDLE');
      setSelectedColor(null);
      setTapCount(0);
    }
  }, [phase, mode, isMounted]);

  const handleFirstFlick = () => {
    setPhase('HOOKING'); 
    const isColorMatch = selectedColor === targetConfig.color;

    setTimeout(() => {
      if (isColorMatch) {
        setStatus('HIT'); 
        setTimeout(() => {
          setPhase('CHALLENGE');
          setStatus('IDLE');
        }, 3000);
      } else {
        setStatus('MISSED'); 
        setTimeout(() => setPhase('APPEAR'), 4000);
      }
    }, 600); 
  };

  const handleFinalFlick = () => {
    setPhase('LANDING'); 

    setTimeout(() => {
      setPhase('RESULT');
      const isTapMatch = tapCount === targetConfig.taps;
      if (isTapMatch) {
        setStatus('SUCCESS'); 
        setTimeout(() => setPhase('APPEAR'), 16000); 
      } else {
        setStatus('FAILED');
        setTimeout(() => setPhase('APPEAR'), 6000);
      }
    }, 1000);
  };

  if (!isMounted) return <div className="fixed inset-0 bg-[#F5F5F5]" />;

  const getCardRotation = () => {
    if (status === 'HIT' || status === 'MISSED') return 'rotateY(180deg)'; 
    if (phase === 'RESULT' && status === 'SUCCESS') return 'rotateY(180deg)'; 
    if (phase === 'RESULT' && status === 'FAILED') return 'rotateY(180deg)'; 
    return 'rotateY(0deg)'; 
  };

  // デュエルモード（色選択）へ移行する共通関数
  const enterDuelMode = () => {
    if (phase === 'APPEAR') setPhase('COLOR');
  };

  return (
    <div className="fixed inset-0 bg-[#F5F5F5] text-zinc-900 flex flex-col items-center justify-center overflow-hidden font-sans select-none touch-none">
      
      <header className="absolute top-0 w-full h-16 flex items-center justify-between px-6 border-b border-zinc-200 bg-white z-[60]">
        <h1 className="text-[10px] tracking-[0.5em] font-black uppercase opacity-40">room138</h1>
        <span className="text-[10px] tracking-[0.2em] font-bold opacity-30 uppercase">STORAGE: {getSavedCards().length}</span>
      </header>

      {mode === 'FISHING' && (
        <>
          <div 
            onDoubleClick={enterDuelMode}
            className={`relative w-64 aspect-[1/1.618] z-20 transition-all duration-[800ms]
              ${phase === 'APPEAR' ? 'scale-90 opacity-40' : 'scale-100 opacity-100'}
              ${status === 'HIT' ? 'animate-shake' : ''}
              ${status === 'MISSED' ? 'animate-missed' : ''}
              ${phase === 'LANDING' ? 'animate-suck' : ''}
              ${status === 'FAILED' && phase === 'RESULT' ? 'animate-result-failed' : ''}
            `}
            style={{ perspective: '1000px' }} 
          >
            <div 
              // phaseがAPPEARの時はtransitionを外して瞬時に0度に戻す（チラ見え防止）
              className={`relative w-full h-full rounded-[12px] border border-zinc-200 shadow-sm
                ${phase === 'APPEAR' ? 'transition-none' : 'transition-transform duration-500'}
                ${phase === 'RESULT' && status === 'SUCCESS' ? 'animate-result-success' : ''}
              `}
              style={{ 
                transformStyle: 'preserve-3d', 
                transform: getCardRotation(), 
              }}
            >
              {/* カード裏面 */}
              <div 
                className="absolute inset-0 bg-white rounded-[12px] flex items-center justify-center p-4 border border-zinc-100"
                style={{ backfaceVisibility: 'hidden' }} 
              >
                <div className="w-full h-full border border-zinc-50 rounded-[8px] flex items-center justify-center">
                  <span className="text-[10px] opacity-20 font-black tracking-widest uppercase">room138</span>
                </div>
              </div>

              {/* カード表面 */}
              <div 
                onDoubleClick={enterDuelMode} // 表面の下部タップ対策
                className="absolute inset-0 bg-white rounded-[12px] flex flex-col overflow-hidden border border-zinc-100"
                style={{ 
                  backfaceVisibility: 'hidden', 
                  transform: 'rotateY(180deg)' 
                }}
              >
                {/* 画像部分 */}
                <div className="w-full h-1/2 bg-zinc-50 relative overflow-hidden flex items-center justify-center border-b border-zinc-100">
                  {currentCard?.url && (
                    <img src={currentCard.url} alt="" className="w-full h-full object-cover" />
                  )}
                </div>
                
                {/* テキスト部分（下部） */}
                <div className="flex-1 p-4 bg-white relative flex flex-col justify-center">
                   {currentCard && (
                     <div className="animate-fadeIn delay-[500ms]">
                       <div className="text-[10px] font-bold tracking-widest uppercase mb-2 line-clamp-1">{currentCard.title}</div>
                       <div className="text-[8px] opacity-40 leading-relaxed line-clamp-3">{currentCard.text}</div>
                       <div className="absolute bottom-3 left-4 text-[7px] font-mono opacity-30 uppercase tracking-tighter">NO.{currentCard.id}</div>
                     </div>
                   )}
                </div>
              </div>
            </div>
          </div>

          {/* 操作系（全体的に少し下げてカードとの被りを防止） */}
          <div className="absolute bottom-20 w-full flex flex-col items-center z-30">
            {/* 色選択 */}
            <div className={`flex gap-4 mb-3 transition-all duration-700 ${phase === 'COLOR' ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none'}`}>
              {['#FF4B4B', '#4B7BFF', '#FFD600', '#00D656', '#A64BFF', '#000000'].map((c) => (
                <button key={c} onClick={() => setSelectedColor(c)} className={`w-8 h-8 rounded-full border-2 transition-transform ${selectedColor === c ? 'scale-125 border-zinc-900 shadow-xl' : 'border-transparent'}`} style={{ backgroundColor: c }} />
              ))}
            </div>

            {/* 回数表示（mb-8からmb-4に変更し、位置を下げる） */}
            <div className={`flex gap-4 mb-4 transition-all duration-700 ${phase === 'CHALLENGE' ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
              {[...Array(3)].map((_, i) => <div key={i} className={`w-4 h-4 rounded-full border-2 border-zinc-300 transition-all ${tapCount > i ? 'bg-zinc-900 border-zinc-900 scale-110' : ''}`} />)}
            </div>

            {/* 三角ボタン */}
            <div onTouchStart={(e) => setStartY(e.touches[0].clientY)} 
                 onTouchMove={(e) => {
                   if (startY - e.touches[0].clientY > 60) {
                     if (phase === 'COLOR' && selectedColor) handleFirstFlick();
                     if (phase === 'CHALLENGE' && tapCount > 0) handleFinalFlick();
                   }
                 }}
              className={`flex flex-col items-center transition-all duration-700 
              ${(phase === 'COLOR' || phase === 'CHALLENGE') ? 'opacity-100 scale-100' : 'opacity-0 scale-50 pointer-events-none'}
              ${(phase === 'HOOKING' || phase === 'LANDING') ? 'translate-y-[-300px] scale-0 opacity-0' : ''}`}>
              <button onClick={() => { if(phase === 'CHALLENGE') setTapCount(prev => Math.min(prev + 1, 3)); }} 
                className="relative w-24 h-28 flex items-end justify-center active:scale-95 transition-transform">
                <svg width="80" height="100" viewBox="0 0 80 100"><path d="M40 0L80 100H0L40 0Z" fill={selectedColor || '#CCC'} /></svg>
                <div className="absolute bottom-5 text-[8px] font-black text-white uppercase tracking-tighter">
                  {phase === 'COLOR' ? (selectedColor ? 'PUSH' : 'COLOR') : (tapCount === 0 ? 'TAP' : 'PUSH')}
                </div>
              </button>
            </div>
          </div>

          <footer className={`absolute bottom-0 w-full h-24 flex items-center justify-center z-40 transition-all duration-500 ${phase === 'APPEAR' ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
            <button onClick={() => setMode('MINT')} className="w-14 h-14 rounded-full bg-white border border-zinc-200 shadow-xl flex items-center justify-center active:scale-90">
              <div className="w-8 h-8 rounded-full border-[6px] border-zinc-900" />
            </button>
          </footer>
        </>
      )}

      {mode === 'MINT' && (
        <div className="absolute inset-0 bg-white z-[100] flex flex-col items-center p-6 pt-24 animate-slideUp">
           <div style={{ aspectRatio: '1 / 1.618' }} className="relative w-64 rounded-[12px] border border-zinc-200 bg-white shadow-2xl flex flex-col overflow-hidden">
            <div className="relative w-full h-1/2 border-b border-zinc-100 bg-zinc-50 flex flex-col">
              <input type="text" value={mintTitle} onChange={(e) => setMintTitle(e.target.value.slice(0, 20))} placeholder="TITLE" className="w-full h-10 px-4 text-[10px] font-bold tracking-widest uppercase bg-white/80 border-b border-zinc-100 outline-none" />
              <div className="flex-1 flex items-center justify-center relative">
                {mintImage ? <img src={mintImage} alt="" className="w-full h-full object-cover" onClick={() => fileInputRef.current?.click()} /> : <button onClick={() => fileInputRef.current?.click()} className="w-12 h-12 rounded-full border-2 border-dashed border-zinc-200 text-zinc-300 text-2xl">+</button>}
              </div>
              <input type="file" ref={fileInputRef} onChange={(e) => { const file = e.target.files?.[0]; if (file) { const reader = new FileReader(); reader.onloadend = () => setMintImage(reader.result as string); reader.readAsDataURL(file); } }} accept="image/*" className="hidden" />
            </div>
            <div className="relative flex-1 p-5 flex flex-col">
              <textarea value={mintText} onChange={(e) => setMintText(e.target.value.slice(0, 140))} placeholder="DESCRIPTION..." className="w-full flex-1 text-[10px] leading-relaxed bg-transparent outline-none resize-none" />
              <div className="absolute bottom-4 left-5 right-5 flex justify-between items-center text-[8px] font-mono opacity-40"><span>ARTIFACT</span><span>LOT 01/150</span></div>
            </div>
          </div>
          <div className="mt-12 w-full max-w-[256px] flex gap-4 px-4">
            <button onClick={() => setMode('FISHING')} className="flex-1 py-3 border border-zinc-200 text-[10px] font-bold tracking-[0.3em] uppercase">CANCEL</button>
            <button onClick={() => {
              if (!mintImage && !mintTitle) return alert('EMPTY');
              const newCard = { id: Date.now(), title: mintTitle || 'UNTITLED', text: mintText || '', url: mintImage || '' };
              localStorage.setItem('room138_cards', JSON.stringify([...getSavedCards(), newCard]));
              setMode('FISHING'); setPhase('APPEAR');
            }} className="flex-1 py-3 bg-zinc-900 text-white text-[10px] font-bold tracking-[0.3em] uppercase">RELEASE</button>
          </div>
        </div>
      )}

      {/* 状態ラベル */}
      <div className="absolute top-24 text-[10px] tracking-[1.5em] font-black opacity-20 pointer-events-none uppercase z-50">
        {status === 'HIT' && 'Hit!'}
        {status === 'MISSED' && 'Baleta'}
        {status === 'SUCCESS' && 'Captured'}
        {status === 'FAILED' && 'Escaped'}
      </div>

      <style jsx global>{`
        /* 揺れ */
        @keyframes shake { 0%, 100% { transform: translateX(0) rotate(0); } 10%, 30%, 50%, 70%, 90% { transform: translateX(-10px) rotate(-1deg); } 20%, 40%, 60%, 80% { transform: translateX(10px) rotate(1deg); } }
        .animate-shake { animation: shake 0.6s ease-in-out infinite; }
        
        /* 失敗（逃走） - 【変更】左(-150vw)へ飛んでいくように */
        @keyframes missed { 0% { transform: scale(1.1) rotateY(180deg); } 100% { transform: scale(1.1) rotateY(180deg) translateX(-150vw) rotate(-30deg); } }
        .animate-missed { animation: missed 0.8s cubic-bezier(0.5, 0, 1, 0.5) 1.5s forwards; }

        /* 吸い込み */
        @keyframes suck { 0% { transform: scale(1) translateY(0); opacity: 1; } 100% { transform: scale(0) translateY(400px); opacity: 0; } }
        .animate-suck { animation: suck 0.8s cubic-bezier(0.6, -0.28, 0.735, 0.045) forwards; }

        /* 成功：くるっと表面 → 5秒待機 → 3回転 */
        @keyframes result-success {
          0% { transform: scale(0) translateY(400px); opacity: 0; rotateY(180deg); }
          15% { transform: scale(1) translateY(0); opacity: 1; rotateY(180deg); } 
          60% { transform: rotateY(180deg); } 
          100% { transform: rotateY(1260deg); } 
        }
        .animate-result-success { animation: result-success 12s cubic-bezier(0.2, 0, 0.2, 1) forwards; }

        /* 最終失敗 - 【変更】右(150vw)へ飛んでいくように */
        @keyframes result-failed {
          0% { transform: scale(0) translateY(400px); opacity: 0; rotateY(180deg); }
          20% { transform: scale(1) translateY(0); opacity: 1; rotateY(180deg); }
          50% { transform: rotateY(180deg) translateX(0); }
          100% { transform: rotateY(180deg) translateX(150vw) rotate(40deg); }
        }
        .animate-result-failed { animation: result-failed 4s ease-in forwards; }

        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        .animate-fadeIn { animation: fadeIn 0.8s ease-out forwards; }
        @keyframes slideUp { from { transform: translateY(100%); } to { transform: translateY(0); } }
        .animate-slideUp { animation: slideUp 0.4s cubic-bezier(0.16, 1, 0.3, 1); }
      `}</style>
    </div>
  );
} 