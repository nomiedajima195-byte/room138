'use client';

import React, { useState, useEffect, useRef } from 'react';

export default function Room138() {
  const [isMounted, setIsMounted] = useState(false);
  const [mode, setMode] = useState<'FISHING' | 'MINT'>('FISHING');
  
  // フィッシング用の状態
  const [phase, setPhase] = useState<'APPEAR' | 'COLOR' | 'CHARGE' | 'THROWING' | 'RESULT'>('APPEAR');
  const [status, setStatus] = useState<'IDLE' | 'SUCCESS' | 'ESCAPED'>('IDLE');
  const [selectedColor, setSelectedColor] = useState<string | null>(null);
  const [tapCount, setTapCount] = useState(0);
  const [targetConfig, setTargetConfig] = useState({ color: '', taps: 0 });
  const [startY, setStartY] = useState(0);
  const [currentCard, setCurrentCard] = useState<any>(null);

  // 生成（ミント）用の状態
  const [mintTitle, setMintTitle] = useState('');
  const [mintText, setMintText] = useState('');
  const [mintImage, setMintImage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => { setIsMounted(true); }, []);

  const getSavedCards = () => {
    if (typeof window === 'undefined') return [];
    const saved = localStorage.getItem('room138_cards');
    // 初期状態で画像がない場合を考慮したダミー
    const dummy = [{ id: 138000, title: 'ROOM138', text: 'Waiting for new artifacts.', url: 'https://images.unsplash.com/photo-1550684848-fac1c5b4e853?q=80&w=400' }];
    return saved ? JSON.parse(saved) : dummy;
  };

  useEffect(() => {
    if (isMounted && mode === 'FISHING' && phase === 'APPEAR') {
      const cards = getSavedCards();
      const card = cards[Math.floor(Math.random() * cards.length)];
      setCurrentCard(card);
      
      setTargetConfig({
        color: ['#FF4B4B', '#4B7BFF', '#FFD600', '#00D656', '#A64BFF', '#000000'][Math.floor(Math.random() * 6)],
        taps: Math.floor(Math.random() * 3) + 1
      });
      setStatus('IDLE');
      setSelectedColor(null);
      setTapCount(0);
    }
  }, [phase, mode, isMounted]);

  const onThrowMove = (e: React.TouchEvent) => {
    if (phase !== 'CHARGE' || tapCount === 0) return;
    if (startY - e.touches[0].clientY > 60) {
      setPhase('THROWING');
      setTimeout(() => {
        setPhase('RESULT');
        if (selectedColor === targetConfig.color && tapCount === targetConfig.taps) {
          setStatus('SUCCESS');
          setTimeout(() => setPhase('APPEAR'), 8000); 
        } else {
          setStatus('ESCAPED');
          setTimeout(() => setPhase('APPEAR'), 6000);
        }
      }, 400);
    }
  };

  const handleMintRelease = () => {
    if (!mintImage && !mintTitle) return alert('EMPTY');
    const newCard = { id: Date.now(), title: mintTitle || 'UNTITLED', text: mintText || '', url: mintImage || '' };
    const updatedCards = [...getSavedCards(), newCard];
    localStorage.setItem('room138_cards', JSON.stringify(updatedCards));
    setMode('FISHING');
    setPhase('APPEAR');
  };

  if (!isMounted) return <div className="fixed inset-0 bg-[#F5F5F5]" />;

  return (
    <div className="fixed inset-0 bg-[#F5F5F5] text-zinc-900 flex flex-col items-center justify-center overflow-hidden font-sans select-none touch-none">
      
      <header className="absolute top-0 w-full h-16 flex items-center justify-between px-6 border-b border-zinc-200 bg-white z-[60]">
        <h1 className="text-[10px] tracking-[0.5em] font-black uppercase opacity-40">room138</h1>
        <span className="text-[10px] tracking-[0.2em] font-bold opacity-30 uppercase">
          STORAGE: {getSavedCards().length}
        </span>
      </header>

      {mode === 'FISHING' && (
        <>
          {/* カード本体：全体にダブルタップ判定を配置 */}
          <div onDoubleClick={() => phase === 'APPEAR' && setPhase('COLOR')}
            style={{ aspectRatio: '1 / 1.618' }}
            className={`relative w-64 rounded-[12px] border border-zinc-200 bg-white shadow-sm flex flex-col overflow-hidden transition-all duration-[800ms] z-20
              ${phase === 'APPEAR' ? 'scale-90 opacity-40' : 'scale-100 opacity-100'}
              ${status === 'ESCAPED' && phase === 'RESULT' ? 'delay-[5000ms] translate-x-[150vw] -rotate-12' : ''}
              ${status === 'SUCCESS' && phase === 'RESULT' ? 'animate-[flip_1s_ease-in-out_5000ms_3]' : ''}
            `}
          >
            {/* 上半分：画像エリア */}
            <div className="w-full h-1/2 bg-zinc-50 relative overflow-hidden flex items-center justify-center">
              {/* 画像はRESULTフェーズ以外は完全に不透明度を0にする */}
              {currentCard?.url && (
                <img 
                  src={currentCard.url} 
                  alt="" 
                  className={`w-full h-full object-cover transition-opacity duration-[1000ms] 
                    ${phase === 'RESULT' ? 'opacity-100' : 'opacity-0'}`} 
                />
              )}
              {/* フィッシング中は常に目隠しを最前面に */}
              {phase !== 'RESULT' && (
                <div className="absolute inset-0 bg-white flex items-center justify-center z-10">
                  <span className="text-[10px] opacity-10 font-black tracking-widest">138</span>
                </div>
              )}
            </div>
            
            {/* 下半分：テキストエリア */}
            <div className="flex-1 p-4 bg-white relative">
               {phase === 'RESULT' && status === 'SUCCESS' ? (
                 <>
                   <div className="text-[10px] font-bold tracking-widest uppercase mb-2 line-clamp-1">{currentCard?.title}</div>
                   <div className="text-[8px] opacity-40 leading-relaxed line-clamp-3">{currentCard?.text || 'No description.'}</div>
                   <div className="absolute bottom-3 left-4 text-[7px] font-mono opacity-30 uppercase tracking-tighter">NO.{currentCard?.id}</div>
                 </>
               ) : (
                 <div className="w-full h-full flex items-center justify-center border-t border-zinc-50">
                    <div className="w-4 h-[1px] bg-zinc-100" />
                 </div>
               )}
            </div>
          </div>

          {/* 操作パネル */}
          <div className="absolute bottom-32 w-full flex flex-col items-center z-30">
            <div className={`flex gap-4 transition-all duration-500 ${phase === 'COLOR' ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none'}`}>
              {['#FF4B4B', '#4B7BFF', '#FFD600', '#00D656', '#A64BFF', '#000000'].map((c) => (
                <button key={c} onClick={() => { setSelectedColor(c); setPhase('CHARGE'); }} className="w-8 h-8 rounded-full shadow-sm active:scale-125 transition-transform" style={{ backgroundColor: c }} />
              ))}
            </div>
            <div onTouchStart={(e) => setStartY(e.touches[0].clientY)} onTouchMove={onThrowMove}
              className={`flex flex-col items-center transition-all duration-500 ${(phase === 'CHARGE') ? 'opacity-100 scale-100' : 'opacity-0 scale-50 pointer-events-none'} ${phase === 'THROWING' ? 'translate-y-[-250px] scale-0 opacity-0' : ''}`}>
              <div className="flex gap-4 mb-6">
                {[...Array(3)].map((_, i) => <div key={i} className={`w-3 h-3 rounded-full border-2 border-zinc-300 transition-colors ${tapCount > i ? 'bg-zinc-800 border-zinc-800' : ''}`} />)}
              </div>
              <button onClick={() => setTapCount(prev => Math.min(prev + 1, 3))} className="relative w-24 h-28 flex items-end justify-center active:scale-95 transition-transform">
                <svg width="80" height="100" viewBox="0 0 80 100"><path d="M40 0L80 100H0L40 0Z" fill={selectedColor || '#CCC'} /></svg>
                <div className="absolute bottom-5 text-[8px] font-black text-white uppercase tracking-tighter">{tapCount === 0 ? 'TAP' : 'FLICK'}</div>
              </button>
            </div>
          </div>

          <footer className={`absolute bottom-0 w-full h-24 flex items-center justify-center z-40 transition-all duration-500 ${phase === 'APPEAR' ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10 pointer-events-none'}`}>
            <button onClick={() => { setMintTitle(''); setMintText(''); setMintImage(null); setMode('MINT'); }} className="w-14 h-14 rounded-full bg-white border border-zinc-200 shadow-xl flex items-center justify-center active:scale-90 transition-all">
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
              <div className="absolute bottom-4 left-5 right-5 flex justify-between items-center text-[8px] font-mono opacity-40">
                <span>NEW ARTIFACT</span>
                <span>LOT 01/150</span>
              </div>
            </div>
          </div>
          <div className="mt-12 w-full max-w-[256px] flex gap-4 px-4">
            <button onClick={() => setMode('FISHING')} className="flex-1 py-3 border border-zinc-200 text-[10px] font-bold tracking-[0.3em] uppercase active:bg-zinc-50">CANCEL</button>
            <button onClick={handleMintRelease} className="flex-1 py-3 bg-zinc-900 text-white text-[10px] font-bold tracking-[0.3em] uppercase active:bg-zinc-700">RELEASE</button>
          </div>
        </div>
      )}

      {phase === 'RESULT' && <div className="absolute top-24 text-[10px] tracking-[1.5em] font-black opacity-30 animate-pulse">{status === 'SUCCESS' ? 'CAPTURED' : 'BALETA'}</div>}

      <style jsx global>{`
        @keyframes flip { 0% { transform: rotateY(0); } 50% { transform: rotateY(180deg); } 100% { transform: rotateY(360deg); } }
        @keyframes slideUp { from { transform: translateY(100%); } to { transform: translateY(0); } }
        .animate-slideUp { animation: slideUp 0.4s cubic-bezier(0.16, 1, 0.3, 1); }
      `}</style>
    </div>
  );
} 