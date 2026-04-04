'use client';

import React, { useState, useEffect, useRef } from 'react';

export default function Room138() {
  const [phase, setPhase] = useState<'APPEAR' | 'DUEL' | 'THROWING' | 'RESULT'>('APPEAR');
  const [status, setStatus] = useState<'IDLE' | 'SUCCESS' | 'ESCAPED'>('IDLE');
  const [selectedColor, setSelectedColor] = useState<string | null>(null);
  const [targetConfig, setTargetConfig] = useState<{ taps: number; position: 'LEFT' | 'CENTER' | 'RIGHT' }>({ taps: 0, position: 'CENTER' });
  const [tapCount, setTapCount] = useState(0);
  const [currentPosition, setCurrentPosition] = useState<'LEFT' | 'CENTER' | 'RIGHT'>('CENTER');
  const [touchStart, setTouchStart] = useState({ x: 0, y: 0 });
  const [isHoldingTriangle, setIsHoldingTriangle] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  const colors = [
    { name: '赤', code: '#FF4B4B' }, { name: '青', code: '#4B7BFF' },
    { name: '黄', code: '#FFD600' }, { name: '緑', code: '#00D656' },
    { name: '紫', code: '#A64BFF' }, { name: '黒', code: '#000000' }
  ];

  const positions: ('LEFT' | 'CENTER' | 'RIGHT')[] = ['LEFT', 'CENTER', 'RIGHT'];

  // 初期化：正解をランダム設定
  useEffect(() => {
    if (phase === 'APPEAR') {
      setTargetConfig({
        taps: Math.floor(Math.random() * 7),
        position: positions[Math.floor(Math.random() * 3)]
      });
      setStatus('IDLE');
      setSelectedColor(null);
      setTapCount(0);
      setCurrentPosition('CENTER');
    }
  }, [phase]);

  // ダブルタップでデュエル開始
  const handleDoubleTap = () => {
    if (phase === 'APPEAR') setPhase('DUEL');
  };

  // タッチ開始（三角形を掴む）
  const onTouchStart = (e: React.TouchEvent, position: 'LEFT' | 'CENTER' | 'RIGHT') => {
    if (phase !== 'DUEL' || !selectedColor) return;
    setTouchStart({ x: e.touches[0].clientX, y: e.touches[0].clientY });
    setIsHoldingTriangle(true);
    setCurrentPosition(position);
    setTapCount(prev => Math.min(prev + 1, 6)); // タップ回数をカウント
  };

  // タッチ移動（三角形を移動＆フリック検知）
  const onTouchMove = (e: React.TouchEvent) => {
    if (!isHoldingTriangle || phase !== 'DUEL') return;

    const currentX = e.touches[0].clientX;
    const currentY = e.touches[0].clientY;
    const deltaX = currentX - touchStart.x;
    const deltaY = currentY - touchStart.y;

    // フリック検知（上に60px以上）
    if (deltaY < -60) {
      handleThrow();
      return;
    }

    // 左右移動の検知（指の場所ではなく、相対的な移動量で判定）
    if (deltaX < -50) setCurrentPosition('LEFT');
    else if (deltaX > 50) setCurrentPosition('RIGHT');
    else setCurrentPosition('CENTER');
  };

  // タッチ終了（掴みを離す）
  const onTouchEnd = () => {
    setIsHoldingTriangle(false);
  };

  const handleThrow = () => {
    setPhase('THROWING');
    setIsHoldingTriangle(false);
    
    // 判定ロジック
    setTimeout(() => {
      setPhase('RESULT');
      const isColorMatch = true; // 色の判定は将来的に実装（今は全色正解扱い）
      const isTapMatch = tapCount === targetConfig.taps;
      const isPositionMatch = currentPosition === targetConfig.position;

      // 色と位置の両方が合致すれば成功（色はデモのためスルー）
      if (isTapMatch && isPositionMatch) {
        setStatus('SUCCESS');
        setTimeout(() => setPhase('APPEAR'), 8000); // 成功時演出を含めてリセット
      } else {
        setStatus('ESCAPED');
        setTimeout(() => setPhase('APPEAR'), 6000); // 失敗時演出を含めてリセット
      }
    }, 800);
  };

  return (
    <div 
      className="fixed inset-0 bg-[#F5F5F5] text-zinc-900 flex flex-col items-center justify-center overflow-hidden font-sans select-none touch-none"
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEnd}
    >
      
      <header className="absolute top-0 w-full h-16 flex items-center justify-between px-6 border-b border-zinc-200 bg-white z-50">
        <h1 className="text-[10px] tracking-[0.5em] font-black uppercase opacity-40">room138</h1>
        <span className="text-[10px] tracking-[0.2em] font-bold opacity-30">USER: TEST</span>
      </header>

      {/* Card Visual */}
      <div 
        ref={cardRef}
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
        <div className="w-48 h-48 bg-zinc-50 rounded flex items-center justify-center overflow-hidden relative">
          <div className="text-[10px] opacity-10 font-bold">{status === 'SUCCESS' ? 'CAPTURED' : '138'}</div>
          
          {/* 投擲エリアのグリッド（デモ用） */}
          {phase === 'DUEL' && (
            <div className="absolute inset-0 grid grid-cols-3 border border-zinc-100 opacity-30">
              <div className="border-r border-zinc-100"></div>
              <div className="border-r border-zinc-100"></div>
              <div></div>
            </div>
          )}
        </div>

        {/* 1. 色選択（選択したら消える） */}
        <div className={`absolute -bottom-16 flex gap-3 transition-all duration-500 ${phase === 'DUEL' && !selectedColor ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none'}`}>
          {colors.map((c) => (
            <button
              key={c.name}
              onClick={() => setSelectedColor(c.code)}
              className="w-6 h-6 rounded-full border-2 border-transparent transition-all active:scale-125"
              style={{ backgroundColor: c.code }}
            />
          ))}
        </div>
      </div>

      {/* 2. 三区画の投擲ボタン（色選択後に出現） */}
      <div 
        className={`
          absolute bottom-16 w-64 grid grid-cols-3 gap-2 transition-all duration-500
          ${phase === 'DUEL' && selectedColor ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10 pointer-events-none'}
        `}
      >
        {positions.map((pos) => (
          <div 
            key={pos}
            onTouchStart={(e) => onTouchStart(e, pos)}
            className="flex flex-col items-center gap-4 cursor-pointer"
          >
            {/* タップ回数インジケーター（その区画のものを表示） */}
            <div className={`flex gap-1 transition-opacity ${currentPosition === pos && isHoldingTriangle ? 'opacity-100' : 'opacity-30'}`}>
              {[...Array(6)].map((_, i) => (
                <div key={i} className={`w-1 h-1 rounded-full transition-all ${currentPosition === pos && isHoldingTriangle && tapCount > i ? 'bg-zinc-800' : 'bg-zinc-200'}`} />
              ))}
            </div>

            {/* 二等辺三角形 */}
            <div 
              className={`relative w-16 h-20 flex items-end justify-center transition-all ${currentPosition === pos && isHoldingTriangle ? 'scale-110' : 'scale-100 opacity-60'}`}
              style={{ transform: currentPosition === pos && isHoldingTriangle ? 'translateY(-10px)' : 'none' }}
            >
              <svg width="60" height="75" viewBox="0 0 60 75" fill="none">
                <path 
                  d="M30 0L60 75H0L30 0Z" 
                  fill={selectedColor || '#CCC'} 
                  className={`opacity-80 transition-colors ${currentPosition === pos && isHoldingTriangle ? 'opacity-100' : 'opacity-40'}`} 
                />
              </svg>
              <div className="absolute bottom-2 text-[7px] font-black text-white">{pos}</div>
            </div>
          </div>
        ))}
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