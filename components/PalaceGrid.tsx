import React from 'react';
import { PalaceData } from '../types';

interface PalaceGridProps {
  palaces: PalaceData[];
  onSelectPalace: (palace: PalaceData) => void;
  centerContent: React.ReactNode;
  currentYearBranchId: number; // The Earthly Branch ID of the selected year
}

const PalaceCard: React.FC<{ 
  data: PalaceData; 
  onClick: () => void;
  isLiuNian: boolean;
}> = ({ data, onClick, isLiuNian }) => {
  
  const posMap: Record<number, string> = {
    5: 'col-start-1 row-start-1', // Si (Top Left)
    6: 'col-start-2 row-start-1', // Wu
    7: 'col-start-3 row-start-1', // Wei
    8: 'col-start-4 row-start-1', // Shen (Top Right)
    9: 'col-start-4 row-start-2', // You
    10: 'col-start-4 row-start-3', // Xu
    11: 'col-start-4 row-start-4', // Hai (Bottom Right)
    0: 'col-start-3 row-start-4', // Zi
    1: 'col-start-2 row-start-4', // Chou
    2: 'col-start-1 row-start-4', // Yin (Bottom Left)
    3: 'col-start-1 row-start-3', // Mao
    4: 'col-start-1 row-start-2', // Chen
  };

  const isDestiny = data.name === '命宮';

  return (
    <div 
      onClick={onClick}
      className={`
        ${posMap[data.id]} 
        relative border transition-all duration-300 cursor-pointer
        flex flex-col p-2 min-h-[120px] shadow-inner
        hover:z-10 hover:scale-[1.02]
        ${isDestiny 
          ? 'bg-slate-800/90 border-amber-600/60 shadow-[inset_0_0_15px_rgba(217,119,6,0.2)]' 
          : isLiuNian 
             ? 'bg-slate-800/70 border-blue-400/50 shadow-[inset_0_0_10px_rgba(96,165,250,0.2)]'
             : 'bg-slate-800/40 border-slate-700/50 hover:bg-slate-700/50 hover:border-amber-500/30'
        }
      `}
    >
      {/* Header: Earthly Branch & Name */}
      <div className="flex justify-between items-center border-b border-slate-700/50 pb-1 mb-1">
        <span className="text-xs text-slate-500 font-mono tracking-wider">{data.heavenlyStem}{data.earthlyBranch}</span>
        <div className="flex items-center gap-1">
          {isLiuNian && <span className="text-[10px] bg-blue-900/50 text-blue-300 px-1 rounded border border-blue-800/50">流年</span>}
          <span className={`font-bold ${isDestiny ? 'text-amber-500' : 'text-slate-300'}`}>{data.name}</span>
        </div>
      </div>

      {/* Stars */}
      <div className="flex-1 flex flex-col gap-1 overflow-hidden">
        <div className="flex flex-wrap gap-1">
          {data.majorStars.map(s => (
            <span key={s} className="text-xs text-red-400 font-bold">{s}</span>
          ))}
        </div>
        <div className="flex flex-wrap gap-1 mt-auto">
          {data.minorStars.map(s => (
            <span key={s} className="text-[10px] text-slate-400">{s}</span>
          ))}
        </div>
      </div>

      {/* Footer: Age Range */}
      <div className="absolute bottom-1 right-2 text-[10px] text-slate-600 font-mono">
        {data.ageRange}
      </div>
    </div>
  );
};

export const PalaceGrid: React.FC<PalaceGridProps> = ({ palaces, onSelectPalace, centerContent, currentYearBranchId }) => {
  return (
    <div className="w-full max-w-4xl mx-auto aspect-square md:aspect-[4/3] lg:aspect-square relative p-2 select-none">
      {/* Mobile: Stack view or simple grid */}
      <div className="md:hidden grid grid-cols-2 gap-2">
         {palaces.map(p => (
           <PalaceCard 
             key={p.id} 
             data={p} 
             onClick={() => onSelectPalace(p)} 
             isLiuNian={p.id === currentYearBranchId}
           />
         ))}
      </div>

      {/* Desktop: The Hollow Square Layout */}
      <div className="hidden md:grid grid-cols-4 grid-rows-4 w-full h-full gap-0 border-4 border-double border-slate-800 shadow-2xl bg-slate-950">
        
        {/* Center Area (Spans middle 2x2) */}
        <div className="col-start-2 row-start-2 col-span-2 row-span-2 border border-slate-800 bg-slate-900 flex flex-col items-center justify-center p-6 text-center z-10 relative">
           {/* Subtle background pattern */}
           <div className="absolute inset-0 opacity-5 bg-[url('https://www.transparenttextures.com/patterns/chinese-pattern.png')] pointer-events-none"></div>
           {centerContent}
        </div>

        {/* The 12 Palaces */}
        {palaces.map((palace) => (
          <PalaceCard 
            key={palace.id} 
            data={palace} 
            onClick={() => onSelectPalace(palace)} 
            isLiuNian={palace.id === currentYearBranchId}
          />
        ))}
      </div>
    </div>
  );
};