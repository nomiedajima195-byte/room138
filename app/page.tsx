'use client';

import React, { useState, useEffect } from 'react';

export default function Room138() {
  const [phase, setPhase] = useState<'APPEAR' | 'DUEL' | 'THROWING' | 'RESULT'>('APPEAR');
  const [status, setStatus] = useState<'IDLE' | 'SUCCESS' | 'ESCAPED'>('IDLE');
  const [selectedColor, setSelectedColor] = useState<string | null>(null);
  const [tapCount, setTapCount] = useState(0);
  const [targetTaps, setTargetTaps] = useState(0);
  const [startY, setStartY] = useState(0);

  const colors = [
    { name: '赤', code: '#FF4B4B' }, { name: '青', code: '#4B7BFF' },
    { name: '黄', code: '#FFD600' }, { name: '緑', code: '#00D656' },
    { name: '紫', code: '#A64BFF' }, { name: '黒', code: '#000000' }
  ];

  // 初期化
  useEffect(() => {
    if (phase === 'APPEAR') {
      setTargetTaps(Math.floor(Math.random() * 7));
      setStatus('IDLE');
      setSelectedColor(null);
      setTapCount(0);
    }
  }, [phase]);

  // ダブルタップでデュエル開始
  const handleDoubleTap = (e: React.MouseEvent | React.TouchEvent) => {
    if (phase === 'APPEAR') setPhase('DUEL');
  };

  const onTouchStart = (e: React.TouchEvent) => {
    setStartY(e.touches[0].clientY);
    if (phase === 'DUEL' && selectedColor) setTapCount(prev => Math.min(prev + 1, 6));
  };

  const onTouchMove = (e: React.TouchEvent) => {
    if (phase !== 'DUEL' || !selectedColor) return;
    const currentY = e.touches[0].clientY;
    if (startY - currentY > 60) handleThrow();
  };

  const handleThrow = () => {
    setPhase('THROWING');
    setTimeout(() => {
      setPhase('RESULT');
      if (tapCount === targetTaps) {
        setStatus('SUCCESS');
        // 成功時：5秒後に裏表3回のギミック
        setTimeout(() => setPhase('APPEAR'), 8000); 
      } else {
        setStatus('ESCAPED');
        // 失敗時：5秒後に横に逃げる
        setTimeout(() => setPhase('APPEAR'), 6000);
      }
    }, 800);
  };

  return (
    <div className="fixed inset-0 bg-[#F5F5F5] text-zinc-900 flex flex-col items-center justify-center overflow-hidden font-sans select-none touch-none">
      
      <header className="absolute top-0 w-full h-16 flex items-center justify-between px-6 border-b border-zinc-200 bg-white z-50">
        <h1 className="text-[10px] tracking-[0.5em] font-black uppercase opacity-40">room138</h1>
        <span className="text-[10px] tracking-[0.2em] font-bold opacity-30">USER: TEST</span>
      </header>

      {/* Card Visual */}
      <div 
        onDoubleClick={handleDoubleTap}
        className={`
          relative w-64 aspect-[1/1.4] rounded-lg border border-zinc-200 bg-white shadow-sm
          flex flex-col items-center justify-center transition-all duration-[800ms]
          ${phase === 'APPEAR' ? 'scale-90 opacity-60' : 'scale-100 opacity-100'}
          ${status === 'ESCAPED' && phase === 'RESULT' ? 'delay-[5000ms] translate-x-[150vw] -rotate-12' : ''}
          ${status === 'SUCCESS' && phase === 'RESULT' ? 'animate-[flip_1s_ease-in-out_5000ms_3]' : ''}
        `}
      >
        <div className="text-[8px] tracking-[0.3em] opacity-20 absolute top-4">
          {phase === 'APPEAR' ? 'DOUBLE TAP TO START' : 'ARTIFACT NO. 138'}
        </div>
        <div className="w-48 h-48 bg-zinc-50 rounded flex items-center justify-center overflow-hidden">
           <div className="text-[10px] opacity-10 font-bold">{status === 'SUCCESS' ? 'CAPTURED' : '138'}</div>
        </div>

        {/* 色選択（デュエル中のみ出現） */}
        <div className={`absolute -bottom-16 flex gap-3 transition-all duration-500 ${phase === 'DUEL' ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none'}`}>
          {colors.map((c) => (
            <button
              key={c.name}
              onClick={() => setSelectedColor(c.code)}
              className={`w-6 h-6 rounded-full border-2 transition-all ${selectedColor === c.code ? 'scale-125 border-zinc-500' : 'border-transparent'}`}
              style={{ backgroundColor: c.code }}
            />
          ))}
        </div>
      </div>

      {/* Throwing Triangle */}
      <div 
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        className={`
          absolute bottom-16 flex flex-col items-center gap-6 transition-all duration-500
          ${phase === 'DUEL' && selectedColor ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10 pointer-events-none'}
        `}
      >
        <div className="flex gap-1.5">
          {[...Array(6)].map((_, i) => (
            <div key={i} className={`w-2 h-2 rounded-full transition-all ${tapCount > i ? 'bg-zinc-800' : 'bg-zinc-200'}`} />
          ))}
        </div>

        <div className="relative w-20 h-24 flex items-end justify-center active:scale-90 transition-transform">
          <svg width="80" height="100" viewBox="0 0 80 100" fill="none">
            <path d="M40 0L80 100H0L40 0Z" fill={selectedColor || '#CCC'} className="opacity-80" />
          </svg>
          <div className="absolute bottom-4 text-[8px] font-black text-white">THROW</div>
        </div>
      </div>

      {/* Status Overlay */}
      {phase === 'RESULT' && (
        <div className="absolute top-24 text-[10px] tracking-[1em] font-black opacity-40 animate-pulse">
          {status === 'SUCCESS' ? 'CAPTURED' : 'MISSED'}
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