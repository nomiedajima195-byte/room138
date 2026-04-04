'use client';

import React, { useState, useEffect, useRef } from 'react';

export default function Room138() {
  const [isMounted, setIsMounted] = useState(false);
  const [mode, setMode] = useState<'FISHING' | 'MINT'>('FISHING');
  
  // フィッシングの状態管理
  // APPEAR: 出現 -> COLOR: 色選択 -> HOOKING: 食いつき判定 -> CHALLENGE: 回数タップ -> LANDING: 取り込み演出 -> RESULT: 最終結果
  const [phase, setPhase] = useState<'APPEAR' | 'COLOR' | 'HOOKING' | 'CHALLENGE' | 'LANDING' | 'RESULT'>('APPEAR');
  const [status, setStatus] = useState<'IDLE' | 'HIT' | 'MISSED' | 'SUCCESS' | 'FAILED'>('IDLE');
  
  const [selectedColor, setSelectedColor] = useState<string | null>(null);
  const [tapCount, setTapCount] = useState(0);
  const [targetConfig, setTargetConfig] = useState({ color: '', taps: 0 });
  const [startY, setStartY] = useState(0);
  const [currentCard, setCurrentCard] = useState<any>(null);

  const [mintTitle, setMintTitle] = useState('');
  const [mintText, setMintText] = useState('');
  const [mintImage, setMintImage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => { setIsMounted(true); }, []);

  const getSavedCards = () => {
    if (typeof window === 'undefined') return [];
    const saved = localStorage.getItem('room138_cards');
    const dummy = [{ id: 138000, title: 'ROOM138', text: 'Waiting...', url: 'https://images.unsplash.com/photo-1550684848-fac1c5b4e853?q=80&w=400' }];
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

  // 第一段階：フリックで「食いつき（HOOKING）」判定
  const handleFirstFlick = () => {
    setPhase('HOOKING');
    const isColorMatch = selectedColor === targetConfig.color;

    setTimeout(() => {
      if (isColorMatch) {
        setStatus('HIT'); // ヒット！
        setTimeout(() => {
          setPhase('CHALLENGE'); // 第二段階（回数タップ）へ
          setTapCount(0);
        }, 2000); // 揺れとチラ見せの時間
      } else {
        setStatus('MISSED'); // ミス
        setTimeout(() => setPhase('APPEAR'), 3000); // 逃走して最初から
      }
    }, 100);
  };

  // 第二段階：最後のフリックで「取り込み（LANDING）」判定
  const handleFinalFlick = () => {
    setPhase('LANDING');
    const isTapMatch = tapCount === targetConfig.taps;

    setTimeout(() => {
      setPhase('RESULT');
      if (isTapMatch) {
        setStatus('SUCCESS');
        setTimeout(() => setPhase('APPEAR'), 10000);
      } else {
        setStatus('FAILED');
        setTimeout(() => setPhase('APPEAR'), 6000);
      }
    }, 800); // 吸い込み演出待ち
  };

  // 共通のフリック検知
  const handleTouchMove = (e: React.TouchEvent) => {
    if (startY - e.touches[0].clientY > 60) {
      if (phase === 'COLOR' && selectedColor) handleFirstFlick();
      if (phase === 'CHALLENGE' && tapCount > 0) handleFinalFlick();
    }
  };

  if (!isMounted) return <div className="fixed inset-0 bg-[#F5F5F5]" />;

  return (
    <div className="fixed inset-0 bg-[#F5F5F5] text-zinc-900 flex flex-col items-center justify-center overflow-hidden font-sans select-none touch-none">
      
      <header className="absolute top-0 w-full h-16 flex items-center justify-between px-6 border-b border-zinc-200 bg-white z-[60]">
        <h1 className="text-[10px] tracking-[0.5em] font-black uppercase opacity-40">room138</h1>
        <span className="text-[10px] tracking-[0.2em] font-bold opacity-30 uppercase">STORAGE: {getSavedCards().length}</span>
      </header>

      {mode === 'FISHING' && (
        <>
          {/* カード挙動クラスの動的割り当て */}
          <div onDoubleClick={() => phase === 'APPEAR' && setPhase('COLOR')}
            style={{ aspectRatio: '1 / 1.618' }}
            className={`relative w-64 rounded-[12px] border border-zinc-200 bg-white shadow-sm flex flex-col overflow-hidden transition-all duration-[800ms] z-20
              ${phase === 'APPEAR' ? 'scale-90 opacity-40' : 'scale-100 opacity-100'}
              ${status === 'HIT' ? 'animate-shake' : ''}
              ${status === 'MISSED' ? 'animate-missed' : ''}
              ${phase === 'LANDING' ? 'animate-suck' : ''}
              ${status === 'SUCCESS' && phase === 'RESULT' ? 'animate-success' : ''}
              ${status === 'FAILED' && phase === 'RESULT' ? 'animate-failed' : ''}
            `}
          >
            {/* 上半分：画像エリア */}
            <div className="w-full h-1/2 bg-zinc-50 relative overflow-hidden flex items-center justify-center">
              {currentCard?.url && (
                <img src={currentCard.url} alt="" className={`w-full h-full object-cover transition-opacity duration-300
                    ${(status === 'HIT' || status === 'MISSED' || phase === 'RESULT') ? 'opacity-100' : 'opacity-0'}`} 
                />
              )}
              {/* 裏面（チラ見せ時以外は表示） */}
              <div className={`absolute inset-0 bg-white flex items-center justify-center z-10 transition-opacity duration-300
                ${(status === 'HIT' || status === 'MISSED' || phase === 'RESULT') ? 'opacity-0' : 'opacity-100'}`}>
                <span className="text-[10px] opacity-10 font-black tracking-widest">138</span>
              </div>
            </div>
            
            {/* 下半分：テキストエリア */}
            <div className="flex-1 p-4 bg-white relative">
               {phase === 'RESULT' && status === 'SUCCESS' && (
                 <>
                   <div className="text-[10px] font-bold tracking-widest uppercase mb-2 line-clamp-1">{currentCard?.title}</div>
                   <div className="text-[8px] opacity-40 leading-relaxed line-clamp-3">{currentCard?.text}</div>
                   <div className="absolute bottom-3 left-4 text-[7px] font-mono opacity-30 uppercase tracking-tighter">NO.{currentCard?.id}</div>
                 </>
               )}
            </div>
          </div>

          {/* 操作パネル */}
          <div className="absolute bottom-32 w-full flex flex-col items-center z-30">
            {/* 色選択UI */}
            <div className={`flex gap-4 transition-all duration-500 ${phase === 'COLOR' ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
              {['#FF4B4B', '#4B7BFF', '#FFD600', '#00D656', '#A64BFF', '#000000'].map((c) => (
                <button key={c} onClick={() => { setSelectedColor(c); }} className={`w-8 h-8 rounded-full border-2 transition-transform ${selectedColor === c ? 'scale-125 border-zinc-900' : 'border-transparent'}`} style={{ backgroundColor: c }} />
              ))}
            </div>

            {/* 回数インジケーター（第二段階） */}
            <div className={`flex gap-4 mb-6 transition-opacity ${phase === 'CHALLENGE' ? 'opacity-100' : 'opacity-0'}`}>
              {[...Array(3)].map((_, i) => <div key={i} className={`w-3 h-3 rounded-full border-2 border-zinc-300 ${tapCount > i ? 'bg-zinc-800 border-zinc-800' : ''}`} />)}
            </div>

            {/* 三角ボタン */}
            <div onTouchStart={(e) => setStartY(e.touches[0].clientY)} onTouchMove={handleTouchMove}
              className={`flex flex-col items-center transition-all duration-500 
              ${(phase === 'COLOR' || phase === 'CHALLENGE') ? 'opacity-100 scale-100' : 'opacity-0 scale-50 pointer-events-none'}
              ${phase === 'LANDING' ? 'translate-y-[-100px] scale-0 opacity-0' : ''}`}>
              <button 
                onClick={() => { if(phase === 'CHALLENGE') setTapCount(prev => Math.min(prev + 1, 3)); }} 
                className="relative w-24 h-28 flex items-end justify-center active:scale-95 transition-transform"
              >
                <svg width="80" height="100" viewBox="0 0 80 100"><path d="M40 0L80 100H0L40 0Z" fill={selectedColor || '#CCC'} /></svg>
                <div className="absolute bottom-5 text-[8px] font-black text-white uppercase tracking-tighter">
                  {phase === 'COLOR' ? (selectedColor ? 'FLICK' : 'COLOR') : (tapCount === 0 ? 'TAP' : 'FLICK')}
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

      {/* ミント画面 */}
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
              <div className="absolute bottom-4 left-5 right-5 flex justify-between items-center text-[8px] font-mono opacity-40"><span>NEW MINT</span><span>LOT 01/150</span></div>
            </div>
          </div>
          <div className="mt-12 w-full max-w-[256px] flex gap-4 px-4">
            <button onClick={() => setMode('FISHING')} className="flex-1 py-3 border border-zinc-200 text-[10px] font-bold tracking-[0.3em] uppercase">CANCEL</button>
            <button onClick={handleMintRelease} className="flex-1 py-3 bg-zinc-900 text-white text-[10px] font-bold tracking-[0.3em] uppercase">RELEASE</button>
          </div>
        </div>
      )}

      {/* 状態ラベル */}
      <div className="absolute top-24 text-[10px] tracking-[1.5em] font-black opacity-30 pointer-events-none">
        {status === 'HIT' && 'HIT!'}
        {status === 'MISSED' && 'BALETA'}
        {status === 'SUCCESS' && 'CAPTURED'}
        {status === 'FAILED' && 'ESCAPED'}
      </div>

      <style jsx global>{`
        @keyframes shake { 0%, 100% { transform: translateX(0); } 20% { transform: translateX(-10px) rotate(-2deg); } 40% { transform: translateX(10px) rotate(2deg); } 60% { transform: translateX(-5px); } 80% { transform: translateX(5px); } }
        .animate-shake { animation: shake 0.5s ease-in-out infinite; }
        
        @keyframes missed { 0% { transform: translateX(0); } 20% { transform: translateX(-5px); } 100% { transform: translateX(150vw) rotate(15deg); } }
        .animate-missed { animation: missed 0.8s ease-in forwards; }

        @keyframes suck { 0% { transform: scale(1); } 100% { transform: scale(0.2) translateY(200px); opacity: 0; } }
        .animate-suck { animation: suck 0.8s cubic-bezier(0.6, -0.28, 0.735, 0.045) forwards; }

        @keyframes success { 0% { transform: scale(0.2) translateY(200px); opacity: 0; } 50% { transform: scale(1) translateY(0); opacity: 1; rotate: Y(180deg); } 100% { transform: rotateY(1080deg); } }
        .animate-success { animation: success 3s ease-out forwards; }

        @keyframes failed { 0% { transform: scale(0.2) translateY(200px); opacity: 0; } 50% { transform: scale(1) translateY(0); opacity: 1; } 100% { transform: translateX(-150vw) rotate(-20deg); } }
        .animate-failed { animation: failed 3s ease-in forwards; }

        @keyframes slideUp { from { transform: translateY(100%); } to { transform: translateY(0); } }
        .animate-slideUp { animation: slideUp 0.4s cubic-bezier(0.16, 1, 0.3, 1); }
      `}</style>
    </div>
  );
}