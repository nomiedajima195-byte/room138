'use client';

import React, { useState, useEffect, useRef } from 'react';

// ユニークなカードナンバーを生成するための簡易カウンター（リロードでリセットされます）
let cardCounter = 138001;

export default function Room138() {
  const [mode, setMode] = useState<'FISHING' | 'MINT'>('FISHING');
  
  // フィッシング用の状態
  const [phase, setPhase] = useState<'APPEAR' | 'COLOR' | 'CHARGE' | 'THROWING' | 'RESULT'>('APPEAR');
  const [status, setStatus] = useState<'IDLE' | 'SUCCESS' | 'ESCAPED'>('IDLE');
  const [selectedColor, setSelectedColor] = useState<string | null>(null);
  const [tapCount, setTapCount] = useState(0);
  const [targetConfig, setTargetConfig] = useState({ color: '', taps: 0 });
  const [startY, setStartY] = useState(0);
  const [currentCard, setCurrentCard] = useState<{ id: number; title: string; url: string } | null>(null);

  // 生成（ミント）用の状態
  const [mintTitle, setMintTitle] = useState('');
  const [mintText, setMintText] = useState('');
  const [mintImage, setMintImage] = useState<string | null>(null);
  const [mintCardNumber, setMintCardNumber] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // データ（フィッシング用デモカード）
  const demoCards = [
    { id: 1, title: '昨日のレバニラ定食', url: 'https://images.unsplash.com/photo-1623157618214-3d9a10129e74?q=80&w=400' },
    { id: 2, title: '錆びた自転車のサドル', url: 'https://images.unsplash.com/photo-1596719875151-5b7f7eb01524?q=80&w=400' },
    { id: 10, title: 'ソトマワール氏（偽物）のサイン', url: 'https://images.unsplash.com/photo-1579783901586-d88db74b4fe1?q=80&w=400' }
  ];

  const colors = [
    { name: '赤', code: '#FF4B4B' }, { name: '青', code: '#4B7BFF' },
    { name: '黄', code: '#FFD600' }, { name: '緑', code: '#00D656' },
    { name: '紫', code: '#A64BFF' }, { name: '黒', code: '#000000' }
  ];

  // フィッシング初期化
  useEffect(() => {
    if (mode === 'FISHING' && phase === 'APPEAR') {
      const card = demoCards[Math.floor(Math.random() * demoCards.length)];
      setCurrentCard(card);
      setTargetConfig({
        color: colors[Math.floor(Math.random() * 6)].code,
        taps: Math.floor(Math.random() * 3) + 1
      });
      setStatus('IDLE');
      setSelectedColor(null);
      setTapCount(0);
    }
  }, [phase, mode]);

  // フィッシング操作
  const onThrowStart = (e: React.TouchEvent) => setStartY(e.touches[0].clientY);
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

  // 生成（ミント）操作
  const openMintInput = () => {
    setMintTitle('');
    setMintText('');
    setMintImage(null);
    setMintCardNumber(cardCounter++);
    setMode('MINT');
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setMintImage(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleMintRelease = () => {
    // ここで本来はデータをサーバーに保存する
    console.log('Minted:', { mintTitle, mintText, mintImage, mintCardNumber });
    alert(`CARD NO.${mintCardNumber} を発行しました。 (デモ)`);
    setMode('FISHING');
    setPhase('APPEAR');
  };

  return (
    <div className="fixed inset-0 bg-[#F5F5F5] text-zinc-900 flex flex-col items-center justify-center overflow-hidden font-sans select-none touch-none">
      
      <header className="absolute top-0 w-full h-16 flex items-center justify-between px-6 border-b border-zinc-200 bg-white z-50">
        <h1 className="text-[10px] tracking-[0.5em] font-black uppercase opacity-40">room138</h1>
        <span className="text-[10px] tracking-[0.2em] font-bold opacity-30">USER: TEST</span>
      </header>

      {/* --- フィッシングモード --- */}
      {mode === 'FISHING' && (
        <>
          {/* Card Visual */}
          <div onDoubleClick={() => phase === 'APPEAR' && setPhase('COLOR')}
            className={`relative w-64 aspect-[1/1.4] rounded-lg border border-zinc-200 bg-white shadow-sm flex flex-col items-center justify-center transition-all duration-[800ms] z-20
              ${phase === 'APPEAR' ? 'scale-90 opacity-40' : 'scale-100 opacity-100'}
              ${status === 'ESCAPED' && phase === 'RESULT' ? 'delay-[5000ms] translate-x-[150vw] -rotate-12' : ''}
              ${status === 'SUCCESS' && phase === 'RESULT' ? 'animate-[flip_1s_ease-in-out_5000ms_3]' : ''}
            `}
          >
            <div className="w-56 h-72 bg-zinc-50 rounded flex flex-col items-center justify-center relative overflow-hidden p-2 border border-zinc-100">
              <img src={currentCard?.url} alt={currentCard?.title} className={`w-full h-full object-cover transition-opacity duration-1000 ${phase === 'RESULT' ? 'opacity-100' : 'opacity-10'}`} />
              {phase !== 'RESULT' && (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/90 backdrop-blur-sm z-10">
                  <div className="text-[10px] opacity-20 font-bold tracking-widest z-10">138</div>
                </div>
              )}
              {phase === 'RESULT' && status === 'SUCCESS' && (
                <div className="absolute bottom-2 left-2 right-2 bg-black/60 p-2 text-white text-center rounded z-20">
                  <div className="text-[8px] tracking-[0.3em] font-bold uppercase">{currentCard?.title}</div>
                  <div className="text-[6px] opacity-50 mt-1">168 hours left</div>
                </div>
              )}
            </div>
          </div>

          {/* 操作UI */}
          <div className="absolute bottom-32 w-full flex flex-col items-center z-30">
            {/* 色選択 */}
            <div className={`flex gap-4 transition-all duration-500 ${phase === 'COLOR' ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
              {colors.map((c) => (
                <button key={c.name} onClick={() => { setSelectedColor(c.code); setPhase('CHARGE'); }} className="w-8 h-8 rounded-full shadow-sm" style={{ backgroundColor: c.code }} />
              ))}
            </div>
            {/* 三角ボタン */}
            <div onTouchStart={onThrowStart} onTouchMove={onThrowMove}
              className={`flex flex-col items-center transition-all duration-500 ${(phase === 'CHARGE') ? 'opacity-100 scale-100' : 'opacity-0 scale-50 pointer-events-none'} ${phase === 'THROWING' ? 'translate-y-[-250px] scale-0 opacity-0' : ''}`}>
              <div className="flex gap-4 mb-6">
                {[...Array(3)].map((_, i) => <div key={i} className={`w-3 h-3 rounded-full border-2 border-zinc-300 ${tapCount > i ? 'bg-zinc-800 border-zinc-800' : ''}`} />)}
              </div>
              <button onClick={() => setTapCount(prev => Math.min(prev + 1, 3))} className="relative w-24 h-28 flex items-end justify-center active:scale-95 transition-transform">
                <svg width="80" height="100" viewBox="0 0 80 100"><path d="M40 0L80 100H0L40 0Z" fill={selectedColor || '#CCC'} /></svg>
                <div className="absolute bottom-5 text-[8px] font-black text-white uppercase tracking-tighter">{tapCount === 0 ? 'TAP' : 'FLICK'}</div>
              </button>
            </div>
          </div>
        </>
      )}

      {/* --- 生成（ミント）モード --- */}
      {mode === 'MINT' && (
        <div className="absolute inset-0 bg-white z-[100] flex flex-col items-center p-6 pt-24 animate-slideInUp">
          {/* 1.618:1 空カード */}
          <div className="relative w-72 aspect-[1/1.618] rounded-[12px] border border-zinc-200 bg-white shadow-xl flex flex-col overflow-hidden">
            
            {/* 上半分：画像＆ヘッダー */}
            <div className="relative w-full h-1/2 border-b border-zinc-100 bg-zinc-50 flex flex-col">
              {/* ヘッダー：タイトル入力 */}
              <input 
                type="text" 
                value={mintTitle}
                onChange={(e) => setMintTitle(e.target.value.slice(0, 20))}
                placeholder="TITLE (max 20)"
                className="w-full h-8 px-3 text-[10px] font-bold tracking-widest uppercase bg-white/80 border-b border-zinc-100 outline-none placeholder:opacity-30"
              />
              {/* 画像エリア */}
              <div className="flex-1 flex items-center justify-center relative group">
                {mintImage ? (
                  <img src={mintImage} alt="Mint preview" className="w-full h-full object-cover" />
                ) : (
                  <button onClick={() => fileInputRef.current?.click()} className="w-12 h-12 rounded-full border-2 border-dashed border-zinc-200 flex items-center justify-center text-zinc-300 text-3xl font-light hover:border-zinc-400 hover:text-zinc-500">+</button>
                )}
                {/* 画像がある場合の変更ボタン */}
                {mintImage && (
                   <button onClick={() => fileInputRef.current?.click()} className="absolute bottom-2 right-2 bg-black/50 text-white text-[8px] px-2 py-1 rounded opacity-0 group-hover:opacity-100">CHANGE</button>
                )}
              </div>
              <input type="file" ref={fileInputRef} onChange={handleImageChange} accept="image/*" className="hidden" />
            </div>

            {/* 下半分：テキストエリア */}
            <div className="relative flex-1 p-4 flex flex-col">
              <textarea 
                value={mintText}
                onChange={(e) => setMintText(e.target.value.slice(0, 140))}
                placeholder="DESCRIPTION (max 140)"
                className="w-full flex-1 text-[10px] leading-relaxed bg-transparent outline-none resize-none placeholder:opacity-30"
              />
              {/* カードナンバー */}
              <div className="absolute bottom-3 left-4 right-4 flex justify-between items-center text-[8px] font-mono opacity-40 tracking-tight">
                <span>NO.{String(mintCardNumber).padStart(6, '0')}</span>
                <span>LOT 01/150</span>
              </div>
            </div>
          </div>

          {/* 操作ボタン */}
          <div className="mt-12 w-full max-w-sm flex gap-4 px-6">
            <button onClick={() => setMode('FISHING')} className="flex-1 py-3 border border-zinc-200 text-[10px] font-bold tracking-[0.3em] uppercase active:bg-zinc-50">CANCEL</button>
            <button onClick={handleMintRelease} className="flex-1 py-3 bg-zinc-900 text-white text-[10px] font-bold tracking-[0.3em] uppercase active:bg-zinc-700">RELEASE</button>
          </div>
        </div>
      )}

      {/* --- 最下部：生成起動ボタン（フィッシング時は常駐、ミント時は消える） --- */}
      {mode === 'FISHING' && (
        <footer className="absolute bottom-0 w-full h-20 flex items-center justify-center z-40">
          <button 
            onClick={openMintInput}
            className="w-12 h-12 rounded-full bg-white border border-zinc-200 shadow-lg flex items-center justify-center active:scale-95 transition-transform"
          >
            <div className="w-6 h-6 rounded-full border-4 border-zinc-900" />
          </button>
        </footer>
      )}

      <style jsx global>{`
        @keyframes flip {
          0% { transform: rotateY(0); }
          50% { transform: rotateY(180deg); }
          100% { transform: rotateY(360deg); }
        }
        @keyframes slideInUp {
          from { transform: translateY(100%); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
        .animate-slideInUp {
          animation: slideInUp 0.5s ease-out forwards;
        }
      `}</style>
    </div>
  );
}