import React from 'react';

interface ElementData {
  element: string;
  score: number;
  percent: number;
}

interface FiveElementsChartProps {
  data: ElementData[];
  description?: string;
}

const ELEMENT_COLORS: Record<string, string> = {
  '金': 'text-yellow-100',
  '木': 'text-emerald-100',
  '水': 'text-blue-100',
  '火': 'text-red-100',
  '土': 'text-amber-100',
};

const ELEMENT_ICON_COLORS: Record<string, string> = {
  '金': 'bg-yellow-600 border-yellow-300',
  '木': 'bg-emerald-700 border-emerald-400',
  '水': 'bg-blue-700 border-blue-400',
  '火': 'bg-red-700 border-red-400',
  '土': 'bg-amber-700 border-amber-400',
};

const ELEMENT_BAR_COLORS: Record<string, string> = {
  '金': 'bg-gradient-to-r from-yellow-600 to-yellow-300',
  '木': 'bg-gradient-to-r from-emerald-700 to-emerald-400',
  '水': 'bg-gradient-to-r from-blue-700 to-blue-400',
  '火': 'bg-gradient-to-r from-red-700 to-red-400',
  '土': 'bg-gradient-to-r from-amber-700 to-amber-400',
};

export const FiveElementsChart: React.FC<FiveElementsChartProps> = ({ data, description }) => {
  const strongest = data.length > 0 ? data[0] : null;

  return (
    <div className="glass-panel p-5 rounded-xl flex flex-col relative overflow-hidden border border-amber-500/20 h-auto">
      
      {/* Decorative Background */}
      <div className="absolute top-0 right-0 p-4 opacity-10 pointer-events-none">
        <svg width="100" height="100" viewBox="0 0 100 100" fill="currentColor" className="text-amber-500">
           <circle cx="50" cy="50" r="40" stroke="currentColor" strokeWidth="1" fill="none"/>
           <path d="M50 10 L50 90 M10 50 L90 50" stroke="currentColor" strokeWidth="1"/>
           <circle cx="50" cy="50" r="10" fill="currentColor" opacity="0.5"/>
        </svg>
      </div>

      <div className="flex justify-between items-center mb-5 relative z-10 border-b border-gray-700/50 pb-2">
         <h4 className="text-amber-500 font-calligraphy text-xl tracking-wider text-glow">五行能量分布</h4>
         {strongest && (
            <div className="flex items-center gap-2">
               <span className="text-xs text-gray-400 uppercase tracking-widest hidden sm:inline">格局主氣</span>
               <span className={`text-sm font-bold px-3 py-0.5 rounded border ${ELEMENT_ICON_COLORS[strongest.element]} text-white shadow-lg`}>
                  {strongest.element}
               </span>
            </div>
         )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 relative z-10">
        {/* Left: The Chart */}
        <div className="flex flex-col gap-4">
          {data.map((item) => (
            <div key={item.element} className="group">
              <div className="flex justify-between items-end text-xs text-gray-400 mb-1.5 px-1 whitespace-nowrap">
                 <span className="font-serif tracking-widest">{item.element} <span className="opacity-50 mx-1">/</span> {(item.score).toFixed(1)}</span>
                 <span className="font-mono">{item.percent}%</span>
              </div>
              <div className="flex items-center gap-3">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold font-serif border shadow-md text-white shrink-0 ${ELEMENT_ICON_COLORS[item.element]} transition-transform group-hover:scale-110`}>
                  {item.element}
                </div>
                <div className="flex-1 h-3 bg-gray-800/80 rounded-full overflow-hidden border border-gray-700/30 relative shadow-inner">
                  <div 
                    className={`h-full ${ELEMENT_BAR_COLORS[item.element]} transition-all duration-1000 ease-out relative rounded-full shadow-[0_0_10px_rgba(0,0,0,0.3)]`}
                    style={{ width: `${item.percent}%` }}
                  >
                     <div className="absolute inset-0 bg-white/20 group-hover:bg-white/40 transition-colors"></div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Right: The Interpretation Text */}
        <div className="flex flex-col h-full">
          <div className="bg-black/30 rounded-lg p-4 border border-white/5 flex flex-col h-full relative overflow-hidden min-h-[200px]">
             {/* Inner corner decoration */}
             <div className="absolute top-0 left-0 w-3 h-3 border-t border-l border-amber-600/50 rounded-tl"></div>
             <div className="absolute bottom-0 right-0 w-3 h-3 border-b border-r border-amber-600/50 rounded-br"></div>

             <h5 className="text-amber-600/90 font-bold mb-3 text-sm tracking-widest flex items-center gap-2 border-b border-gray-800 pb-2">
               <span>✦</span> 能量解讀
             </h5>
             <div className="flex-1 overflow-y-auto custom-scrollbar pr-1">
               {description ? (
                 <p className="text-gray-300 text-sm leading-6 text-justify font-serif tracking-wide">
                   {description}
                 </p>
               ) : (
                 <div className="h-full flex items-center justify-center text-gray-600 text-xs italic">
                   等待排盤分析結果...
                 </div>
               )}
             </div>
          </div>
        </div>
      </div>
      
      <div className="mt-4 pt-2 border-t border-gray-800 text-[10px] text-gray-600 text-center tracking-widest">
         * 五行強弱源自四柱干支（含藏干）權重計算
      </div>
    </div>
  );
};