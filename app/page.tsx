'use client';

import React, { useState, useEffect } from 'react';

export default function Room138() {
  const [status, setStatus] = useState<'IDLE' | 'CHARGING' | 'THROWING' | 'SUCCESS' | 'ESCAPED'>('IDLE');
  const [selectedColor, setSelectedColor] = useState<string | null>(null);
  const [tapCount, setTapCount] = useState(0);
  const [targetTaps, setTargetTaps] = useState(0);
  const [startY, setStartY] = useState(0);

  const colors = [
    { name: '赤', code: '#FF4B4B' },
    { name: '青', code: '#4B7BFF' },
    { name: '黄', code: '#FFD600' },
    { name: '緑', code: '#00D656' },
    { name: '紫', code: '#A64BFF' },
    { name: '黒', code: '#000000' }
  ];

  useEffect(() => {
    // 0〜6の正解回数をランダム設定
    setTargetTaps(Math.floor(Math.random() * 7));
  }, [status === 'IDLE']);

  const handlePressStart = () => {
    if (status !== 'IDLE' || !selectedColor) return;
    setStatus('CHARGING');
    setTapCount(0);
  };

  const onTouchStart = (e: React.TouchEvent) => setStartY(e.touches[0].clientY);
  const onTouchMove = (e: React.TouchEvent) => {
    if (status !== 'CHARGING') return;
    const currentY = e.touches[0].clientY;
    if (startY - currentY > 60) {
      handleThrow();
    }
  };

  const handleThrow = () => {
    setStatus('THROWING');
    setTimeout(() => {
      if (tapCount === targetTaps) {
        setStatus('SUCCESS');
      } else {
        setStatus('ESCAPED');
        setTimeout(() => {
          setStatus('IDLE');
          setSelectedColor(null);
        }, 2000);
      }
    }, 600);
  };

  return (
    <div className="fixed inset-0 bg-[#F5F5F5] text-zinc-900 flex flex-col items-center justify-center overflow-hidden font-sans select-none touch-none">
      
      {/* Header: room138 */}
      <header className="absolute top-0 w-full h-16 flex items-center justify-between px-6 border-b border-zinc-200 bg-white">
        <h1 className="text-[10px] tracking-[0.5em] font-black uppercase opacity-40">room138</h1>
        <span className="text-[10px] tracking-[0.2em] font-bold opacity-30">USER: TEST</span>
      </header>

      {/* Card Area (Demo Card) */}
      <div 
        className={`
          relative w-64 aspect-[1/1.4] rounded-lg border border-zinc-200 bg-white shadow-sm
          flex flex-col items-center justify-center transition-all duration-700 ease-[cubic-bezier(0.23,1,0.32,1)]
          ${status === 'ESCAPED' ? '-translate-y-[120vh] rotate-[15deg] opacity-0' : ''}
          ${status === 'SUCCESS' ? 'shadow-[0_20px_50px_rgba(0,0,0,0.1)] border-zinc-400 scale-105' : ''}
        `}
      >
        <div className="text-[8px] tracking-[0.3em] opacity-20 absolute top-4">ARTIFACT NO. 138</div>
        <div className="w-48 h-48 bg-zinc-50 rounded flex items-center justify-center overflow-hidden">
           {/* ここに将来的にラーメンや米粒の画像が入る */}
           <div className="text-[10px] opacity-10">NO DATA</div>
        </div>
        
        {/* 色選択ドット */}
        <div className="absolute -bottom-12 flex gap-3">
          {colors.map((c) => (
            <button
              key={c.name}
              onClick={() => status === 'IDLE' && setSelectedColor(c.code)}
              className={`w-5 h-5 rounded-full transition-all duration-200 border-2 ${selectedColor === c.code ? 'scale-125 border-zinc-400 shadow-md' : 'border-transparent opacity-60'}`}
              style={{ backgroundColor: c.code }}
            />
          ))}
        </div>
      </div>

      {/* Controller Area */}
      <div 
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        className={`
          absolute bottom-16 flex flex-col items-center gap-8 transition-opacity duration-500
          ${status === 'THROWING' || status === 'SUCCESS' || status === 'ESCAPED' ? 'opacity-0' : 'opacity-100'}
          ${!selectedColor ? 'pointer-events-none opacity-20' : 'cursor-pointer'}
        `}
      >
        {/* タップ回数インジケーター */}
        <div className="flex gap-1.5">
          {[...Array(6)].map((_, i) => (
            <div 
              key={i} 
              className={`w-1.5 h-1.5 rounded-full transition-all duration-300 ${tapCount > i ? 'bg-zinc-800' : 'bg-zinc-200'}`} 
            />
          ))}
        </div>

        {/* 二等辺三角形の投擲ボタン */}
        <div 
          className="relative w-20 h-24 flex items-end justify-center active:scale-90 transition-transform"
          onClick={() => status === 'CHARGING' && setTapCount(prev => Math.min(prev + 1, 6))}
          onTouchStart={handlePressStart}
        >
          <svg width="80" height="100" viewBox="0 0 80 100" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path 
              d="M40 0L80 100H0L40 0Z" 
              fill={selectedColor || '#E4E4E7'} 
              className="transition-colors duration-300 opacity-80"
            />
          </svg>
          <div className="absolute bottom-4 text-[8px] font-bold text-white tracking-widest">
            {status === 'IDLE' ? 'SET' : 'TAP'}
          </div>
        </div>
      </div>

      {/* 成功演出 */}
      {status === 'SUCCESS' && (
        <div className="absolute top-1/2 -translate-y-1/2 text-[10px] tracking-[1.5em] font-black text-zinc-400 animate-pulse">
          CAPTURED
        </div>
      )}
    </div>
  );
}