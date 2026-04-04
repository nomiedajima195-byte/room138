'use client';

import React, { useState, useEffect } from 'react';

export default function Room138() {
  const [phase, setPhase] = useState<'APPEAR' | 'COLOR' | 'CHARGE' | 'THROWING' | 'RESULT'>('APPEAR');
  const [status, setStatus] = useState<'IDLE' | 'SUCCESS' | 'ESCAPED'>('IDLE');
  const [selectedColor, setSelectedColor] = useState<string | null>(null);
  const [tapCount, setTapCount] = useState(0);
  const [targetConfig, setTargetConfig] = useState({ color: '', taps: 0 });
  const [startY, setStartY] = useState(0);
  const [currentCard, setCurrentCard] = useState<{ id: number; title: string; url: string } | null>(null);

  // Room138 的な、どうでもいい10枚の野良カードデータ
  const demoCards = [
    { id: 1, title: '昨日のレバニラ定食', url: 'https://images.unsplash.com/photo-1623157618214-3d9a10129e74?q=80&w=400' },
    { id: 2, title: '錆びた自転車のサドル', url: 'https://images.unsplash.com/photo-1596719875151-5b7f7eb01524?q=80&w=400' },
    { id: 3, title: '品種別米粒画像（コシヒカリ）', url: 'https://images.unsplash.com/photo-1596377317730-01c56ac4d216?q=80&w=400' },
    { id: 4, title: '中央線高架下のグラフィティ', url: 'https://images.unsplash.com/photo-1582234032608-f404d023253b?q=80&w=400' },
    { id: 5, title: '雨に濡れたコインランドリーの看板', url: 'https://images.unsplash.com/photo-1593922728956-6f8ac29990e6?q=80&w=400' },
    { id: 6, title: '誰かが捨てたビニール傘', url: 'https://images.unsplash.com/photo-1606404221769-95a2f58e0a82?q=80&w=400' },
    { id: 7, title: '古びたアパートのポスト', url: 'https://images.unsplash.com/photo-1601614032135-23d2da0784be?q=80&w=400' },
    { id: 8, title: '自動販売機の横のゴミ箱', url: 'https://images.unsplash.com/photo-1610486807981-b51c86518cb3?q=80&w=400' },
    { id: 9, title: '誰もいない公園のブランコ', url: 'https://images.unsplash.com/photo-1603210332837-77b311cb1e08?q=80&w=400' },
    { id: 10, title: 'ソトマワール氏（偽物）のサイン', url: 'https://images.unsplash.com/photo-1579783901586-d88db74b4fe1?q=80&w=400' }
  ];

  const colors = [
    { name: '赤', code: '#FF4B4B' }, { name: '青', code: '#4B7BFF' },
    { name: '黄', code: '#FFD600' }, { name: '緑', code: '#00D656' },
    { name: '紫', code: '#A64BFF' }, { name: '黒', code: '#000000' }
  ];

  // 初期化：正解とカードをランダム設定
  useEffect(() => {
    if (phase === 'APPEAR') {
      const card = demoCards[Math.floor(Math.random() * 10)];
      setCurrentCard(card);
      setTargetConfig({
        color: colors[Math.floor(Math.random() * 6)].code,
        taps: Math.floor(Math.random() * 3) + 1 // 1〜3回
      });
      setStatus('IDLE');
      setSelectedColor(null);
      setTapCount(0);
    }
  }, [phase]);

  const onTouchStart = (e: React.TouchEvent) => setStartY(e.touches[0].clientY);
  const onTouchMove = (e: React.TouchEvent) => {
    if (phase !== 'CHARGE' || tapCount === 0) return;
    const currentY = e.touches[0].clientY;
    if (startY - currentY > 60) handleThrow();
  };

  const handleThrow = () => {
    setPhase('THROWING');
    setTimeout(() => {
      setPhase('RESULT');
      const isColorMatch = selectedColor === targetConfig.color;
      const isTapMatch = tapCount === targetConfig.taps;

      if (isColorMatch && isTapMatch) {
        setStatus('SUCCESS');
        // 成功時：表を向けて5秒静止 + 裏表3回転 (計8秒)
        setTimeout(() => setPhase('APPEAR'), 8000); 
      } else {
        setStatus('ESCAPED');
        // 失敗時：表を向けて5秒静止 + 横に逃げる (計6秒)
        setTimeout(() => setPhase('APPEAR'), 6000);
      }
    }, 400); // 吸い込まれるスピード
  };

  return (
    <div className="fixed inset-0 bg-[#F5F5F5] text-zinc-900 flex flex-col items-center justify-center overflow-hidden font-sans select-none touch-none">
      
      <header className="absolute top-0 w-full h-16 flex items-center justify-between px-6 border-b border-zinc-200 bg-white z-50">
        <h1 className="text-[10px] tracking-[0.5em] font-black uppercase opacity-40">room138</h1>
        <span className="text-[10px] tracking-[0.2em] font-bold opacity-30">USER: TEST</span>
      </header>

      {/* Card Visual */}
      <div onDoubleClick={() => phase === 'APPEAR' && setPhase('COLOR')}
        className={`relative w-64 aspect-[1/1.4] rounded-lg border border-zinc-200 bg-white shadow-sm flex flex-col items-center justify-center transition-all duration-[800ms]
          ${phase === 'APPEAR' ? 'scale-90 opacity-40' : 'scale-100 opacity-100'}
          ${status === 'ESCAPED' && phase === 'RESULT' ? 'delay-[5000ms] translate-x-[150vw] -rotate-12' : ''}
          ${status === 'SUCCESS' && phase === 'RESULT' ? 'animate-[flip_1s_ease-in-out_5000ms_3]' : ''}
        `}
      >
        {/* カードの中身（画像） */}
        <div className="w-56 h-72 bg-zinc-50 rounded flex flex-col items-center justify-center relative overflow-hidden p-2 border border-zinc-100">
          <img src={currentCard?.url} alt={currentCard?.title} className={`w-full h-full object-cover transition-opacity duration-1000 ${phase === 'RESULT' ? 'opacity-100' : 'opacity-10'}`} />
          
          {/* 判定中、または失敗時は画像を隠す */}
          {phase !== 'RESULT' && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/90 backdrop-blur-sm z-10">
              <div className="text-[10px] opacity-20 font-bold tracking-widest z-10">138</div>
              <div className="text-[8px] opacity-10 font-bold tracking-[0.3em] uppercase absolute top-4 z-10">Double tap to duel</div>
            </div>
          )}
          
          {/* 結果表示時のタイトル */}
          {phase === 'RESULT' && status === 'SUCCESS' && (
            <div className="absolute bottom-2 left-2 right-2 bg-black/60 p-2 text-white text-center rounded">
              <div className="text-[8px] tracking-[0.3em] font-bold uppercase">{currentCard?.title}</div>
              <div className="text-[6px] opacity-50 mt-1">168 hours left</div>
            </div>
          )}
        </div>
      </div>

      {/* 手順1: 色選択（選択したら消える） */}
      <div className={`absolute bottom-24 flex gap-4 transition-all duration-500 ${phase === 'COLOR' ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none'}`}>
        {colors.map((c) => (
          <button key={c.name} onClick={() => { setSelectedColor(c.code); setPhase('CHARGE'); }} className="w-8 h-8 rounded-full shadow-sm active:scale-125" style={{ backgroundColor: c.code }} />
        ))}
      </div>

      {/* 手順2: 三角ボタンを叩く */}
      <div 
        className={`absolute bottom-16 flex flex-col items-center transition-all duration-500
        ${phase === 'CHARGE' ? 'opacity-100 scale-100' : 'opacity-0 scale-50 pointer-events-none'}
        ${phase === 'THROWING' ? 'translate-y-[-250px] scale-0 opacity-0' : ''}
      `}>
        {/* 打ち込み回数インジケーター（1〜3） */}
        <div className="flex gap-4 mb-6 z-10">
          {[...Array(3)].map((_, i) => (
            <div key={i} className={`w-3 h-3 rounded-full border-2 border-zinc-300 transition-all duration-300 ${tapCount > i ? 'bg-zinc-800 border-zinc-800' : 'bg-transparent'}`} />
          ))}
        </div>

        {/* 三角ボタン */}
        <button 
          onClick={() => setTapCount(prev => Math.min(prev + 1, 3))}
          onTouchStart={onTouchStart} onTouchMove={onTouchMove}
          className="relative w-24 h-28 flex items-end justify-center active:scale-95 transition-transform"
        >
          <svg width="80" height="100" viewBox="0 0 80 100">
            <path d="M40 0L80 100H0L40 0Z" fill={selectedColor || '#CCC'} className="transition-colors duration-300" />
          </svg>
          <div className="absolute bottom-5 text-[8px] font-black text-white uppercase tracking-tighter">
            {tapCount === 0 ? 'TAP TO START' : 'TAP & FLICK'}
          </div>
        </button>
      </div>

      {/* 判定表示（デモ用） */}
      {phase === 'RESULT' && (
        <div className="absolute top-24 text-[10px] tracking-[1.5em] font-black opacity-30 animate-pulse">
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