'use client';

import React, { useState, useEffect } from 'react';

export default function Room138() {
  const [phase, setPhase] = useState<'APPEAR' | 'DUEL' | 'THROWING' | 'RESULT'>('APPEAR');
  const [status, setStatus] = useState<'IDLE' | 'SUCCESS' | 'ESCAPED'>('IDLE');
  const [selectedColor, setSelectedColor] = useState<string | null>(null);
  const [selectedPos, setSelectedPos] = useState<number | null>(null); // 0:左, 1:中, 2:右
  const [tapCount, setTapCount] = useState(0);
  const [targetConfig, setTargetConfig] = useState({ taps: 0, position: 1 });
  const [startY, setStartY] = useState(0);

  const colors = [
    { name: '赤', code: '#FF4B4B' }, { name: '青', code: '#4B7BFF' },
    { name: '黄', code: '#FFD600' }, { name: '緑', code: '#00D656' },
    { name: '紫', code: '#A64BFF' }, { name: '黒', code: '#000000' }
  ];

  useEffect(() => {
    if (phase === 'APPEAR') {
      setTargetConfig({
        taps: Math.floor(Math.random() * 7),
        position: Math.floor(Math.random() * 3)
      });
      setStatus('IDLE');
      setSelectedColor(null);
      setSelectedPos(null);
      setTapCount(0);
    }
  }, [phase]);

  const onTouchStart = (e: React.TouchEvent) => setStartY(e.touches[0].clientY);
  const onTouchMove = (e: React.TouchEvent) => {
    if (phase !== 'DUEL' || selectedPos === null) return;
    const currentY = e.touches[0].clientY;
    if (startY - currentY > 50) handleThrow();
  };

  const handleThrow = () => {
    setPhase('THROWING');
    setTimeout(() => {
      setPhase('RESULT');
      const isSuccess = tapCount === targetConfig.taps && selectedPos === targetConfig.position;
      if (isSuccess) {
        setStatus('SUCCESS');
        setTimeout(() => setPhase('APPEAR'), 8500);
      } else {
        setStatus('ESCAPED');
        setTimeout(() => setPhase('APPEAR'), 6500);
      }
    }, 400); // 吸い込まれるスピードを速く
  };

  return (
    <div className="fixed inset-0 bg-[#F5F5F5] text-zinc-900 flex flex-col items-center justify-center overflow-hidden font-sans select-none touch-none">
      
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
        <div className="w-48 h-48 bg-zinc-50 rounded flex items-center justify-center relative overflow-hidden">
          <div className="text-[10px] opacity-10 font-bold tracking-widest">{status === 'SUCCESS' ? 'CAPTURED' : '138'}</div>
          
          {/* 吸い込まれた三角の着弾点 */}
          {phase === 'THROWING' && (
             <div 
               className="absolute bottom-0 w-8 h-10 transition-all duration-300 ease-in"
               style={{ 
                 backgroundColor: selectedColor || '#000',
                 left: `${(selectedPos! * 33.3) + 5}%`,
                 clipPath: 'polygon(50% 0%, 0% 100%, 100% 100%)',
                 transform: 'translateY(-100px) scale(0.5)',
                 opacity: 0
               }}
             />
          )}
        </div>

        {/* 手順1: 色選択 */}
        <div className={`absolute -bottom-16 flex gap-4 transition-all duration-500 ${phase === 'DUEL' && !selectedColor ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
          {colors.map((c) => (
            <button key={c.name} onClick={() => setSelectedColor(c.code)} className="w-6 h-6 rounded-full shadow-sm active:scale-125" style={{ backgroundColor: c.code }} />
          ))}
        </div>

        {/* 手順2: 位置選択 (〇が三つ) */}
        <div className={`absolute -bottom-16 flex gap-12 transition-all duration-500 ${phase === 'DUEL' && selectedColor && selectedPos === null ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
          {[0, 1, 2].map((i) => (
            <button 
              key={i} 
              onClick={() => setSelectedPos(i)} 
              className="w-8 h-8 rounded-full border-2 border-zinc-300 flex items-center justify-center active:bg-zinc-200"
            >
              <div className="w-2 h-2 bg-zinc-400 rounded-full" />
            </button>
          ))}
        </div>
      </div>

      {/* 手順3: 三角ボタンを叩いて投擲 */}
      <div 
        onTouchStart={onTouchStart} onTouchMove={onTouchMove}
        className={`absolute bottom-16 flex flex-col items-center transition-all duration-500
        ${phase === 'DUEL' && selectedPos !== null ? 'opacity-100 scale-100' : 'opacity-0 scale-50 pointer-events-none'}
        ${phase === 'THROWING' ? 'translate-y-[-200px] scale-0 opacity-0' : ''}
      `}>
        {/* タップ回数インジケーター */}
        <div className="flex gap-1.5 mb-6">
          {[...Array(6)].map((_, i) => (
            <div key={i} className={`w-1.5 h-1.5 rounded-full transition-all ${tapCount > i ? 'bg-zinc-800' : 'bg-zinc-200'}`} />
          ))}
        </div>

        {/* 叩く三角ボタン */}
        <button 
          onClick={() => setTapCount(prev => Math.min(prev + 1, 6))}
          className="relative w-20 h-24 flex items-end justify-center active:scale-90 transition-transform"
        >
          <svg width="70" height="90" viewBox="0 0 70 90">
            <path d="M35 0L70 90H0L35 0Z" fill={selectedColor || '#CCC'} />
          </svg>
          <div className="absolute bottom-4 text-[8px] font-black text-white uppercase">TAP & FLICK</div>
        </button>
      </div>

      {/* 判定表示 */}
      {phase === 'RESULT' && (
        <div className="absolute top-24 text-[10px] tracking-[1.5em] font-black opacity-30">
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