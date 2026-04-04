'use client';

import React, { useState, useEffect } from 'react';

export default function Room138() {
  const [phase, setPhase] = useState<'APPEAR' | 'DUEL' | 'THROWING' | 'RESULT'>('APPEAR');
  const [status, setStatus] = useState<'IDLE' | 'SUCCESS' | 'ESCAPED'>('IDLE');
  const [selectedColor, setSelectedColor] = useState<string | null>(null);
  const [targetConfig, setTargetConfig] = useState({ taps: 0, position: 1 }); // 0:LEFT, 1:CENTER, 2:RIGHT
  const [tapCount, setTapCount] = useState(0);
  const [currentPosIndex, setCurrentPosIndex] = useState(1); // 初期位置は中央(1)
  const [touchStart, setTouchStart] = useState({ x: 0, y: 0 });
  const [isHolding, setIsHolding] = useState(false);

  const colors = [
    { name: '赤', code: '#FF4B4B' }, { name: '青', code: '#4B7BFF' },
    { name: '黄', code: '#FFD600' }, { name: '緑', code: '#00D656' },
    { name: '紫', code: '#A64BFF' }, { name: '黒', code: '#000000' }
  ];

  const posLabels = ['LEFT', 'CENTER', 'RIGHT'];

  useEffect(() => {
    if (phase === 'APPEAR') {
      setTargetConfig({
        taps: Math.floor(Math.random() * 7),
        position: Math.floor(Math.random() * 3)
      });
      setStatus('IDLE');
      setSelectedColor(null);
      setTapCount(0);
      setCurrentPosIndex(1);
    }
  }, [phase]);

  const onTouchStart = (e: React.TouchEvent) => {
    if (phase !== 'DUEL' || !selectedColor) return;
    setTouchStart({ x: e.touches[0].clientX, y: e.touches[0].clientY });
    setIsHolding(true);
    setTapCount(prev => Math.min(prev + 1, 6)); // 掴んだ瞬間にタップカウント
  };

  const onTouchMove = (e: React.TouchEvent) => {
    if (!isHolding || phase !== 'DUEL') return;

    const x = e.touches[0].clientX;
    const y = e.touches[0].clientY;
    const deltaX = x - touchStart.x;
    const deltaY = y - touchStart.y;

    // 1. 上フリック判定
    if (deltaY < -70) {
      handleThrow();
      return;
    }

    // 2. 左右スライド判定（感度調整：80pxごとに位置切り替え）
    if (deltaX < -60) setCurrentPosIndex(0); // LEFT
    else if (deltaX > 60) setCurrentPosIndex(2); // RIGHT
    else setCurrentPosIndex(1); // CENTER
  };

  const handleThrow = () => {
    setPhase('THROWING');
    setIsHolding(false);
    
    setTimeout(() => {
      setPhase('RESULT');
      const isSuccess = tapCount === targetConfig.taps && currentPosIndex === targetConfig.position;

      if (isSuccess) {
        setStatus('SUCCESS');
        setTimeout(() => setPhase('APPEAR'), 8500); // 5s待機 + 3s回転演出
      } else {
        setStatus('ESCAPED');
        setTimeout(() => setPhase('APPEAR'), 6500); // 5s待機 + 逃走
      }
    }, 800);
  };

  return (
    <div className="fixed inset-0 bg-[#F5F5F5] text-zinc-900 flex flex-col items-center justify-center overflow-hidden font-sans select-none touch-none"
         onTouchMove={onTouchMove} onTouchEnd={() => setIsHolding(false)}>
      
      <header className="absolute top-0 w-full h-16 flex items-center justify-between px-6 border-b border-zinc-200 bg-white z-50">
        <h1 className="text-[10px] tracking-[0.5em] font-black uppercase opacity-40">room138</h1>
        <span className="text-[10px] tracking-[0.2em] font-bold opacity-30">USER: TEST</span>
      </header>

      {/* Card Visual */}
      <div onDoubleClick={() => phase === 'APPEAR' && setPhase('DUEL')}
        className={`relative w-64 aspect-[1/1.4] rounded-lg border border-zinc-200 bg-white shadow-sm flex flex-col items-center justify-center transition-all duration-[800ms]
          ${phase === 'APPEAR' ? 'scale-90 opacity-40' : 'scale-100 opacity-100'}
          ${status === 'ESCAPED' && phase === 'RESULT' ? 'delay-[5000ms] translate-x-[150vw] -rotate-12' : ''}
          ${status === 'SUCCESS' && phase === 'RESULT' ? 'animate-[flip_1s_ease-in-out_5000ms_3]' : ''}
        `}
      >
        <div className="text-[7px] tracking-[0.3em] opacity-20 absolute top-4 uppercase">
          {phase === 'APPEAR' ? 'Double tap to Duel' : `Pos: ${posLabels[currentPosIndex]}`}
        </div>
        <div className="w-48 h-48 bg-zinc-50 rounded flex items-center justify-center relative overflow-hidden">
          <div className="text-[10px] opacity-10 font-bold tracking-widest">{status === 'SUCCESS' ? 'CAPTURED' : '138'}</div>
          {/* 三区画のガイドライン（デュエル中のみ） */}
          {phase === 'DUEL' && (
            <div className="absolute inset-0 flex opacity-[0.03]">
              <div className={`flex-1 border-r border-zinc-900 ${currentPosIndex === 0 ? 'bg-zinc-900' : ''}`} />
              <div className={`flex-1 border-r border-zinc-900 ${currentPosIndex === 1 ? 'bg-zinc-900' : ''}`} />
              <div className={`flex-1 ${currentPosIndex === 2 ? 'bg-zinc-900' : ''}`} />
            </div>
          )}
        </div>

        {/* 色選択ドット */}
        <div className={`absolute -bottom-16 flex gap-4 transition-all duration-500 ${phase === 'DUEL' && !selectedColor ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
          {colors.map((c) => (
            <button key={c.name} onClick={() => setSelectedColor(c.code)} className="w-6 h-6 rounded-full" style={{ backgroundColor: c.code }} />
          ))}
        </div>
      </div>

      {/* 一つの二等辺三角形（スライド式） */}
      <div className={`absolute bottom-16 w-full flex flex-col items-center transition-all duration-500 ${phase === 'DUEL' && selectedColor ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
        
        {/* タップ回数インジケーター */}
        <div className="flex gap-1.5 mb-6">
          {[...Array(6)].map((_, i) => (
            <div key={i} className={`w-1.5 h-1.5 rounded-full transition-all ${tapCount > i ? 'bg-zinc-800' : 'bg-zinc-200'}`} />
          ))}
        </div>

        {/* スライドする三角形 */}
        <div 
          onTouchStart={onTouchStart}
          style={{ transform: `translateX(${(currentPosIndex - 1) * 80}px)` }}
          className={`relative w-20 h-24 flex items-end justify-center transition-transform duration-200 ease-out active:scale-95`}
        >
          <svg width="70" height="90" viewBox="0 0 70 90">
            <path d="M35 0L70 90H0L35 0Z" fill={selectedColor || '#CCC'} className={`${isHolding ? 'opacity-100' : 'opacity-40'} transition-opacity`} />
          </svg>
          <div className="absolute bottom-4 text-[8px] font-black text-white tracking-tighter uppercase">{posLabels[currentPosIndex]}</div>
        </div>
        
        <div className="mt-4 text-[8px] tracking-[0.3em] opacity-20 font-bold">SLIDE & FLICK</div>
      </div>

      {/* 判定表示 */}
      {phase === 'RESULT' && (
        <div className="absolute top-24 text-[10px] tracking-[1.5em] font-black opacity-30 animate-pulse">
          {status === 'SUCCESS' ? 'SUCCESS' : 'MISSED'}
        </div>
      )}

      <style jsx>{`
        @keyframes flip {
          0% { transform: rotateY(0); }
          50% { transform: rotateY(180deg); }
          100% { transform: rotateY(360deg); }
        }
      `}</style>
    </div>
  );
}