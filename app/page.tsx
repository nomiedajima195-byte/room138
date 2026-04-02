'use client';

import React, { useState, useRef } from 'react';

export default function ThrowCatchTest() {
  const [status, setStatus] = useState<'IDLE' | 'CHARGING' | 'THROWING' | 'SUCCESS' | 'ESCAPED'>('IDLE');
  const [tapCount, setTapCount] = useState(0);
  const [targetTaps, setTargetTaps] = useState(0);
  const [isFlicking, setIsFlicking] = useState(false);
  const [startY, setStartY] = useState(0);

  // 1. 長押しで準備 (0.8s)
  const handleStart = () => {
    if (status !== 'IDLE') return;
    const timer = setTimeout(() => {
      setTargetTaps(Math.floor(Math.random() * 7)); // 0~6の正解
      setStatus('CHARGING');
      setTapCount(0);
    }, 800);
    return () => clearTimeout(timer);
  };

  // 2. フリック（投擲）の開始
  const onFlickStart = (e: React.MouseEvent | React.TouchEvent) => {
    const y = 'touches' in e ? e.touches[0].clientY : e.clientY;
    setStartY(y);
  };

  const onFlickMove = (e: React.MouseEvent | React.TouchEvent) => {
    if (status !== 'CHARGING') return;
    const y = 'touches' in e ? e.touches[0].clientY : e.clientY;
    if (startY - y > 100) { // 100px以上上にフリックしたら投げた判定
      handleThrow();
    }
  };

  const handleThrow = () => {
    setIsFlicking(true);
    setStatus('THROWING');
    
    // 投げたボタンがカードに到達するまでのラグ演出
    setTimeout(() => {
      judge();
    }, 600);
  };

  // 3. 判定
  const judge = () => {
    if (tapCount === targetTaps) {
      setStatus('SUCCESS');
    } else {
      setStatus('ESCAPED');
      setTimeout(() => {
        setStatus('IDLE');
        setIsFlicking(false);
      }, 1500);
    }
  };

  return (
    <div className="min-h-screen bg-[#050505] text-white flex flex-col items-center justify-center font-sans select-none overflow-hidden">
      
      {/* Room136 Header */}
      <header className="fixed top-0 w-full h-16 flex items-center justify-between px-8 border-b border-white/5">
        <div className="text-[10px] tracking-[0.5em] font-black opacity-40 uppercase">room136</div>
        <div className="text-[10px] font-mono opacity-20">SESSION_TEST</div>
      </header>

      {/* Card Area */}
      <div className="relative group">
        <div 
          onMouseDown={handleStart}
          className={`
            w-60 aspect-[1/1.618] rounded-[12px] border border-white/10 bg-zinc-900
            flex items-center justify-center transition-all duration-700 relative
            ${status === 'ESCAPED' ? 'translate-x-[250%] rotate-45 opacity-0' : ''}
            ${status === 'SUCCESS' ? 'shadow-[0_0_60px_rgba(255,255,255,0.15)] bg-zinc-800 scale-105' : ''}
          `}
        >
          {status === 'IDLE' && <div className="text-4xl font-black italic opacity-10">136</div>}
          
          {/* 成功/失敗時の一瞬の表側プレビュー */}
          {(status === 'SUCCESS' || status === 'ESCAPED') && (
            <div className="w-full h-full p-3 flex flex-col animate-in fade-in duration-300">
               <div className="flex-1 bg-zinc-800 rounded-sm mb-4 overflow-hidden">
                  <div className="w-full h-full bg-gradient-to-br from-zinc-700 to-zinc-900 opacity-50" />
               </div>
               <div className="h-2 w-2/3 bg-white/10 mb-2" />
               <div className="h-2 w-1/3 bg-white/5" />
            </div>
          )}

          {/* 衝撃エフェクト（ボタンが当たった瞬間） */}
          {status === 'THROWING' && (
            <div className="absolute inset-0 bg-white/5 animate-pulse rounded-[12px]" />
          )}
        </div>

        {/* Throw UI (投げ当てるボタン) */}
        {(status === 'CHARGING' || status === 'THROWING') && (
          <div 
            className={`
              absolute -bottom-40 left-0 right-0 flex flex-col items-center gap-6
              transition-all duration-500 ease-in-out
              ${status === 'THROWING' ? '-translate-y-[400px] opacity-0 scale-50' : 'translate-y-0 opacity-100'}
            `}
            onMouseDown={onFlickStart}
            onMouseMove={onFlickMove}
            onTouchStart={onFlickStart}
            onTouchMove={onFlickMove}
          >
            {/* タップ数インジケーター */}
            <div className="flex gap-1.5 h-2">
              {[...Array(6)].map((_, i) => (
                <div key={i} className={`w-1.5 h-1.5 rounded-full border border-white/10 transition-all ${tapCount > i ? 'bg-white shadow-[0_0_8px_white]' : 'bg-transparent'}`} />
              ))}
            </div>

            {/* 投げ当てるボタン */}
            <button 
              onClick={() => status === 'CHARGING' && setTapCount(t => Math.min(t + 1, 6))}
              className="w-20 h-20 border-2 border-white/20 rounded-full flex items-center justify-center group active:scale-90 transition-transform"
            >
              <div className="text-[10px] font-black tracking-tighter opacity-40 group-active:opacity-100">
                {status === 'THROWING' ? '' : 'FLICK'}
              </div>
              {/* フリックガイド */}
              <div className="absolute -top-6 animate-bounce opacity-20">↑</div>
            </button>
            <div className="text-[8px] tracking-[0.4em] opacity-30">TAP: {tapCount} / 6</div>
          </div>
        )}
      </div>

      {status === 'SUCCESS' && (
        <div className="mt-16 text-[10px] tracking-[1.5em] text-white animate-pulse">CAPTURED</div>
      )}
    </div>
  );
}