
import React, { useState, useRef, useMemo } from 'react';
import { UserProfile, Gender, PalaceData, AnalysisResult, BaZiChart, BaZiPillar } from './types';
import { calculateChart, getYearBranchIndex, calculateBaZi, calculateFiveElementsScore, getSpecificStarInterpretation, getPillarDetailedMeaning } from './utils/astrologyUtils';
import { analyzeDestiny, resolveLongitude } from './services/geminiService';
import { PalaceGrid } from './components/PalaceGrid';
import { FiveElementsChart } from './components/FiveElementsChart';
import MusicPlayer from './components/MusicPlayer';
import { STAR_INFO_MAP, PALACE_DEFINITIONS, PILLAR_DEFINITIONS } from './constants';
// @ts-ignore - html2canvas import from esm.sh
import html2canvas from 'html2canvas';

const App: React.FC = () => {
  const [step, setStep] = useState<'input' | 'chart'>('input');
  const [profile, setProfile] = useState<UserProfile>({
    name: '',
    birthPlace: '',
    longitude: '120.0', 
    birthDate: '',
    birthTime: '12:00',
    gender: Gender.MALE,
  });
  const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear());
  const [palaces, setPalaces] = useState<PalaceData[]>([]);
  const [bazi, setBazi] = useState<BaZiChart | null>(null);
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState("");
  
  // Ref for capture
  const captureRef = useRef<HTMLDivElement>(null);

  // Modal States
  const [selectedPalace, setSelectedPalace] = useState<PalaceData | null>(null);
  const [selectedStar, setSelectedStar] = useState<{name: string, element: string, description: string} | null>(null);
  const [selectedPillar, setSelectedPillar] = useState<{ key: string, data: BaZiPillar } | null>(null);

  // Memoize Five Elements Data
  const fiveElementsData = useMemo(() => {
    if (!bazi) return [];
    return calculateFiveElementsScore(bazi);
  }, [bazi]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile.name || !profile.birthDate) return;

    setLoading(true);
    
    try {
      // 0. Resolve Longitude
      let resolvedLongitude = profile.longitude;
      if (profile.birthPlace) {
        setLoadingMessage(`正在定位「${profile.birthPlace}」經度以校正真太陽時...`);
        try {
          const [lon] = await Promise.all([
             resolveLongitude(profile.birthPlace),
             new Promise(resolve => setTimeout(resolve, 800)) 
          ]);
          resolvedLongitude = lon;
          setProfile(prev => ({ ...prev, longitude: lon }));
        } catch (err) {
          console.warn("Longitude resolution failed", err);
        }
      }

      setLoadingMessage("正在推演紫微斗數與八字命盤...");
      const calculatedPalaces = calculateChart(profile.birthDate, profile.birthTime);
      const calculatedBaZi = calculateBaZi(profile.birthDate, profile.birthTime, resolvedLongitude);
      
      setPalaces(calculatedPalaces);
      setBazi(calculatedBaZi);
      setStep('chart');

      setLoadingMessage("大師正在批註流年運勢...");
      await fetchAnalysis({ ...profile, longitude: resolvedLongitude }, selectedYear);

    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
      setLoadingMessage("");
    }
  };

  const fetchAnalysis = async (userProfile: UserProfile, year: number) => {
    setLoading(true);
    try {
      const result = await analyzeDestiny(userProfile, year);
      setAnalysis(result);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleYearChange = async (newYear: number) => {
    setSelectedYear(newYear);
    if (step === 'chart') {
      setLoadingMessage(`正在推演${newYear}年運勢...`);
      await fetchAnalysis(profile, newYear);
      setLoadingMessage("");
    }
  };

  const handleReset = () => {
    setStep('input');
    setAnalysis(null);
    setPalaces([]);
    setBazi(null);
    setSelectedPalace(null);
    setProfile(p => ({ ...p, longitude: '120.0' }));
  };

  const handleDownload = async () => {
    if (captureRef.current) {
      try {
        const canvas = await html2canvas(captureRef.current, {
          backgroundColor: '#0f1016', // Match body bg var(--color-bg-deep)
          scale: 2,
          useCORS: true,
          logging: false
        });
        const link = document.createElement('a');
        link.download = `天機排盤_${profile.name}_${selectedYear}.png`;
        link.href = canvas.toDataURL('image/png');
        link.click();
      } catch (err) {
        console.error("Capture failed", err);
        alert("圖片生成失敗，請稍後再試。");
      }
    }
  };

  const handleStarClick = (starName: string, e: React.MouseEvent) => {
    e.stopPropagation(); 
    const info = STAR_INFO_MAP[starName];
    if (info) {
      setSelectedStar({ name: starName, ...info });
    }
  };

  return (
    <div className="min-h-screen text-slate-200 selection:bg-amber-900 selection:text-amber-100 overflow-x-hidden font-serif">
      <MusicPlayer />
      
      {/* Decorative Header Background */}
      <div className="fixed top-0 left-0 w-full h-40 bg-gradient-to-b from-[#0f1016] to-transparent pointer-events-none z-0"></div>
      
      {/* Header */}
      <header className="relative z-10 p-8 text-center border-b border-amber-900/30">
        <h1 className="text-6xl md:text-7xl font-calligraphy text-transparent bg-clip-text bg-gradient-to-t from-amber-600 via-amber-400 to-yellow-200 drop-shadow-[0_4px_10px_rgba(251,191,36,0.3)] mb-3">
          天機 · 命理
        </h1>
        <p className="text-amber-700/60 font-serif text-sm tracking-[0.5em] uppercase flex justify-center items-center gap-4">
          <span className="h-[1px] w-12 bg-gradient-to-r from-transparent to-amber-800"></span>
          CELESTIAL ORACLE
          <span className="h-[1px] w-12 bg-gradient-to-l from-transparent to-amber-800"></span>
        </p>
      </header>

      <main className="container mx-auto px-4 py-8 relative z-10">
        
        {step === 'input' && (
          <div className="max-w-md mx-auto glass-panel p-10 rounded-2xl relative overflow-hidden group mt-12 animate-fadeIn">
            {/* Bagua & Cloud Decoration */}
            <div className="absolute top-0 left-0 w-full h-full bg-clouds opacity-30 pointer-events-none"></div>
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-amber-600 to-transparent"></div>
            
            <h2 className="text-3xl font-serif text-amber-500 mb-10 text-center pb-4 flex flex-col items-center relative z-10">
              <span className="text-xs text-gray-500 mb-3 uppercase tracking-[0.3em]">請輸入生辰八字</span>
              <span className="font-calligraphy text-5xl text-gray-100 text-glow">問道</span>
            </h2>
            
            <form onSubmit={handleSubmit} className="space-y-6 relative z-10">
              <div className="space-y-4">
                <input 
                  type="text" 
                  value={profile.name}
                  onChange={e => setProfile({...profile, name: e.target.value})}
                  className="w-full bg-black/40 border border-gray-700 rounded px-4 py-4 text-amber-100 placeholder-gray-600 focus:outline-none focus:border-amber-600 transition-colors text-center text-lg"
                  placeholder="閣下尊姓大名"
                  required
                />
                 <div className="relative">
                   <input 
                    type="text" 
                    value={profile.birthPlace}
                    onChange={e => setProfile({...profile, birthPlace: e.target.value})}
                    className="w-full bg-black/40 border border-gray-700 rounded px-4 py-4 text-amber-100 placeholder-gray-600 focus:outline-none focus:border-amber-600 transition-colors text-center text-lg"
                    placeholder="出生地點 (如: 中國上海)"
                    required
                  />
                  <div className="text-[10px] text-gray-500 text-center mt-2 flex items-center justify-center gap-1">
                    <span className="w-1 h-1 bg-amber-600 rounded-full"></span>
                    系統將自動推算經度以校正真太陽時
                  </div>
                 </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                 <select 
                    value={profile.gender}
                    onChange={e => setProfile({...profile, gender: e.target.value as Gender})}
                    className="w-full bg-black/40 border border-gray-700 rounded px-4 py-4 text-gray-300 focus:outline-none focus:border-amber-600 appearance-none text-center text-lg"
                  >
                    <option value={Gender.MALE}>乾造 (男)</option>
                    <option value={Gender.FEMALE}>坤造 (女)</option>
                  </select>
                  <div>
                     <input 
                      type="time" 
                      value={profile.birthTime}
                      onChange={e => setProfile({...profile, birthTime: e.target.value})}
                      className="w-full bg-black/40 border border-gray-700 rounded px-4 py-4 text-gray-300 focus:outline-none focus:border-amber-600 text-center text-lg"
                    />
                  </div>
              </div>

              <input 
                type="date" 
                value={profile.birthDate}
                onChange={e => setProfile({...profile, birthDate: e.target.value})}
                className="w-full bg-black/40 border border-gray-700 rounded px-4 py-4 text-gray-300 focus:outline-none focus:border-amber-600 appearance-none text-center tracking-widest text-lg"
                required
              />

              <button 
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-amber-800 to-amber-600 hover:from-amber-700 hover:to-amber-500 text-white font-bold py-4 rounded shadow-[0_4px_20px_rgba(180,83,9,0.4)] transform transition hover:scale-[1.01] active:scale-[0.99] border border-amber-400/30 flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed group mt-4"
              >
                {loading ? (
                   <span className="flex items-center gap-2">
                     <svg className="animate-spin h-5 w-5 text-amber-100" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                     <span>{loadingMessage || "推演中..."}</span>
                   </span>
                ) : (
                  <>
                    <span className="tracking-widest text-lg">排盤推演</span>
                    <span className="text-2xl group-hover:rotate-180 transition-transform duration-700">☯</span>
                  </>
                )}
              </button>
            </form>
          </div>
        )}

        {step === 'chart' && (
          <div className="animate-fade-in opacity-100 transition-opacity duration-1000 max-w-7xl mx-auto">
             
             {/* Controls Bar */}
             <div className="flex flex-col md:flex-row justify-between items-end mb-8 border-b border-amber-900/30 pb-6">
               <div className="text-left">
                  <h3 className="text-4xl font-calligraphy text-amber-500 mb-2">{profile.name} <span className="text-base font-serif text-gray-500 ml-2">({profile.birthPlace})</span></h3>
                  <div className="flex flex-col gap-1">
                     <div className="flex items-center gap-4 text-xs text-gray-400 uppercase tracking-widest font-mono">
                        <span className="bg-gray-800 px-2 py-1 rounded">{profile.gender}</span>
                        <span>|</span>
                        <span>{profile.birthDate} {profile.birthTime}</span>
                        <span>|</span>
                        <span>東經 {profile.longitude}°</span>
                     </div>
                  </div>
               </div>

               <div className="flex flex-wrap items-center gap-3 mt-4 md:mt-0 justify-end">
                 <div className="flex items-center gap-2 bg-black/40 border border-gray-700 rounded px-4 py-2">
                   <span className="text-sm text-gray-500 font-serif">流年運勢</span>
                   <select 
                      value={selectedYear}
                      onChange={(e) => handleYearChange(parseInt(e.target.value))}
                      className="bg-transparent text-amber-500 font-bold focus:outline-none cursor-pointer"
                   >
                      {Array.from({length: 10}, (_, i) => new Date().getFullYear() - 2 + i).map(y => (
                        <option key={y} value={y}>{y}年</option>
                      ))}
                   </select>
                 </div>
                 
                 <button 
                   onClick={handleDownload}
                   className="bg-gray-800 text-amber-500/80 hover:text-amber-300 hover:bg-gray-700 transition-colors px-4 py-2 border border-gray-600 rounded flex items-center gap-2"
                 >
                   <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
                   <span>保存天機</span>
                 </button>

                 <button 
                   onClick={handleReset}
                   className="text-gray-400 hover:text-white transition-colors px-4 py-2 border border-gray-700 rounded hover:bg-gray-800"
                 >
                   重算
                 </button>
               </div>
             </div>

             {/* Capture Area */}
             <div ref={captureRef} className="p-4 md:p-8 bg-[#0f1016]"> 
               
               <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                 {/* Left Column: BaZi & Palace Grid & Five Elements */}
                 <div className="lg:col-span-7 flex flex-col gap-2"> {/* REMOVED h-full and gap-6 -> gap-2 */}
                   
                   {/* Four Pillars (BaZi) Display */}
                   {bazi && (
                     <div className="glass-panel p-6 rounded-xl flex justify-around text-center relative overflow-hidden flex-none">
                        <div className="absolute inset-0 bg-clouds opacity-20 pointer-events-none"></div>
                        
                        {[
                          { key: '年柱', label: '年柱', data: bazi.year },
                          { key: '月柱', label: '月柱', data: bazi.month },
                          { key: '日柱', label: '日柱', data: bazi.day },
                          { key: '時柱', label: '時柱', data: bazi.hour }
                        ].map((pillar, idx) => (
                          <button 
                            key={idx} 
                            onClick={() => setSelectedPillar({ key: pillar.key, data: pillar.data })}
                            className="flex flex-col gap-3 relative z-10 group cursor-pointer transition-transform hover:-translate-y-1"
                          >
                             <span className="text-xs text-gray-500 font-serif tracking-widest border-b border-gray-700 pb-1 group-hover:text-amber-500 transition-colors">{pillar.label}</span>
                             <div className="flex flex-col bg-[#1e1b18] border border-amber-900/40 rounded-lg px-4 py-3 w-20 shadow-lg relative overflow-hidden group-hover:border-amber-600/60 transition-colors">
                                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/wood-pattern.png')] opacity-30"></div>
                                <span className="text-3xl font-calligraphy text-amber-400 drop-shadow-sm mb-1">{pillar.data.stem}</span>
                                <span className="text-3xl font-calligraphy text-amber-600 drop-shadow-sm">{pillar.data.branch}</span>
                             </div>
                             <span className="text-[10px] text-gray-600 group-hover:text-gray-400">{pillar.data.element}</span>
                          </button>
                        ))}
                     </div>
                   )}

                   {/* Zi Wei Dou Shu Grid */}
                   <div className="flex-none">
                    <PalaceGrid 
                      palaces={palaces} 
                      onSelectPalace={setSelectedPalace}
                      currentYearBranchId={getYearBranchIndex(selectedYear)}
                      centerContent={
                        <div className="flex flex-col items-center justify-center h-full w-full">
                           <div className="w-24 h-24 mb-3 relative opacity-80 hover:opacity-100 transition-opacity duration-700">
                             {/* Yin Yang Symbol */}
                             <div className="w-full h-full rounded-full border-2 border-amber-700 bg-gray-900 flex items-center justify-center relative overflow-hidden yinyang-spin shadow-[0_0_30px_rgba(217,119,6,0.3)]">
                                <div className="absolute top-0 left-0 w-full h-1/2 bg-amber-100"></div>
                                <div className="absolute bottom-0 left-0 w-full h-1/2 bg-gray-900"></div>
                                <div className="absolute top-1/2 left-0 w-1/2 h-full bg-amber-100 rounded-full transform -translate-y-1/2 scale-50 origin-center"></div>
                                <div className="absolute top-1/2 right-0 w-1/2 h-full bg-gray-900 rounded-full transform -translate-y-1/2 scale-50 origin-center"></div>
                                <div className="absolute top-[25%] left-1/2 w-3 h-3 bg-gray-900 rounded-full transform -translate-x-1/2"></div>
                                <div className="absolute bottom-[25%] left-1/2 w-3 h-3 bg-amber-100 rounded-full transform -translate-x-1/2"></div>
                             </div>
                           </div>
                           {loading ? (
                             <div className="text-amber-600/70 text-sm animate-pulse tracking-widest text-center mt-2 font-calligraphy">
                               {loadingMessage || "推演天機中..."}
                             </div>
                           ) : analysis ? (
                              <div className="space-y-1 animate-fadeIn text-center mt-2">
                                <p className="text-amber-500 font-calligraphy text-3xl drop-shadow-md tracking-[0.2em]">{analysis.centralSummary}</p>
                              </div>
                           ) : null}
                        </div>
                      }
                    />
                   </div>

                   {/* Five Elements Chart - REMOVED flex-1 */}
                   <div className="w-full">
                      <FiveElementsChart 
                        data={fiveElementsData} 
                        description={analysis?.fiveElementsBalance} 
                      />
                   </div>
                 </div>

                 {/* Right Column: Detailed Analysis & Lucky Card */}
                 <div className="lg:col-span-5 flex flex-col gap-6">
                   {analysis && !loading ? (
                     <>
                     {/* Analysis Text Panel - Removed excessive min-height */}
                     <div className="glass-panel p-8 rounded-xl relative flex flex-col h-fit overflow-hidden">
                        
                        {/* Background Decoration to handle whitespace elegantly */}
                        <div className="absolute bottom-0 right-0 w-64 h-64 bg-clouds opacity-10 pointer-events-none transform translate-y-1/4 translate-x-1/4 rotate-12"></div>
                        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-amber-600 to-transparent opacity-50"></div>

                        <h3 className="text-3xl font-calligraphy text-amber-500 mb-6 flex items-center gap-3 border-b border-amber-900/30 pb-4 relative z-10">
                          <span className="text-2xl">📜</span>
                          <span>天機批注 · {selectedYear}流年</span>
                        </h3>
                        
                        <div className="space-y-6 text-gray-300 leading-7 text-base relative z-10">
                           
                           {/* BaZi Section */}
                           <div className="bg-black/20 p-5 rounded border-l-4 border-amber-700 shadow-sm">
                             <h4 className="text-amber-600 font-bold mb-2 text-lg font-calligraphy tracking-wide">【八字乾坤】</h4>
                             <p className="text-justify font-serif text-gray-300/90">{analysis.baziAnalysis}</p>
                           </div>

                           <div>
                             <h4 className="text-amber-600 font-bold mb-2 text-lg font-calligraphy tracking-wide">【命宮格局】</h4>
                             <p className="text-justify font-serif text-gray-300/90">{analysis.destinyPattern}</p>
                           </div>
                           
                           <div>
                             <h4 className="text-amber-600 font-bold mb-2 text-lg font-calligraphy tracking-wide">【流年運勢】</h4>
                             <p className="text-justify font-serif text-gray-300/90">{analysis.currentYearFortune}</p>
                           </div>
                           
                           <div className="mt-6 pt-4 border-t border-amber-900/20">
                             <div className="flex items-start gap-4 italic text-gray-400 bg-amber-900/10 p-5 rounded relative border border-amber-800/10">
                                <span className="text-5xl text-amber-800/30 absolute -top-3 -left-1 font-serif">“</span>
                                <p className="text-base font-serif relative z-10">{analysis.advice}</p>
                             </div>
                           </div>
                        </div>
                     </div>

                     {/* Lucky Card for Sharing */}
                     {analysis.luckyData && (
                        <div className="bg-gradient-to-br from-[#1a120d] to-[#0f1016] p-6 rounded-xl border border-amber-600/30 relative overflow-hidden flex-none shadow-2xl">
                           <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/5 rounded-full blur-2xl"></div>
                           <h4 className="text-amber-400 font-bold mb-5 flex items-center gap-2 text-xl font-calligraphy">
                             <span>🧧</span> 開運指南
                           </h4>
                           <div className="grid grid-cols-2 gap-4 text-sm">
                              {[
                                { label: '幸運色', value: analysis.luckyData.luckyColor, icon: '🎨' },
                                { label: '幸運數字', value: analysis.luckyData.luckyNumber, icon: '🔢' },
                                { label: '吉利方位', value: analysis.luckyData.luckyDirection, icon: '🧭' },
                                { label: '貴人屬相', value: analysis.luckyData.noblePerson, icon: '🤝' },
                              ].map((item, i) => (
                                <div key={i} className="bg-black/40 p-4 rounded border border-gray-800 flex flex-col items-center text-center hover:border-amber-900/50 transition-colors">
                                  <span className="text-xs text-gray-500 mb-1.5">{item.icon} {item.label}</span>
                                  <span className="text-amber-100 font-bold text-base tracking-wide">{item.value}</span>
                                </div>
                              ))}
                           </div>
                        </div>
                     )}
                     </>
                   ) : (
                     <div className="h-full glass-panel flex items-center justify-center text-gray-600 p-12 text-center min-h-[400px]">
                        {loading ? (
                          <div className="flex flex-col items-center gap-6">
                             <div className="w-16 h-16 border-4 border-amber-900/30 border-t-amber-500 rounded-full animate-spin"></div>
                             <p className="font-calligraphy text-xl text-amber-500 animate-pulse">{loadingMessage || "請等待排盤結果"}</p>
                          </div>
                        ) : (
                          <div className="flex flex-col items-center">
                            <span className="text-6xl mb-4 opacity-20 text-amber-500">☯</span>
                            <p className="font-serif text-lg">請輸入生辰八字以獲取天機</p>
                          </div>
                        )}
                     </div>
                   )}
                 </div>
               </div>
               
               {/* Footer in Capture */}
               <div className="mt-12 text-center text-gray-600 text-xs tracking-[0.3em] opacity-60 font-serif">
                  天機命理 · TIANJI DESTINY
               </div>
             </div>
          </div>
        )}

        {/* Palace Detail Modal */}
        {selectedPalace && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setSelectedPalace(null)}></div>
            <div className="glass-panel border-2 border-amber-700/50 rounded-2xl w-full max-w-lg shadow-[0_0_50px_rgba(0,0,0,0.8)] relative z-10 overflow-hidden animate-scaleIn flex flex-col max-h-[90vh]">
               {/* Modal Header */}
               <div className="bg-black/50 p-6 border-b border-amber-900/30 flex justify-between items-center relative overflow-hidden">
                 <div className="absolute inset-0 bg-clouds opacity-10"></div>
                 <div className="relative z-10">
                   <h3 className="text-4xl text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-amber-600 font-calligraphy mb-1">{selectedPalace.name}</h3>
                   <span className="text-amber-700/60 font-mono text-sm uppercase tracking-widest">{selectedPalace.heavenlyStem}{selectedPalace.earthlyBranch}位 · 大限 {selectedPalace.ageRange}歲</span>
                 </div>
                 <button onClick={() => setSelectedPalace(null)} className="text-gray-500 hover:text-amber-500 transition-colors z-10">
                   <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                 </button>
               </div>

               {/* Modal Body */}
               <div className="p-8 space-y-8 overflow-y-auto">
                 
                 {/* Layman Definition */}
                 <div className="bg-amber-950/20 p-5 rounded-lg border-l-4 border-amber-600 shadow-inner">
                    <h4 className="text-amber-500 font-bold mb-2 text-base font-calligraphy">【宮位本義】</h4>
                    <p className="text-gray-300 text-sm leading-relaxed font-serif">
                       {PALACE_DEFINITIONS[selectedPalace.name] || "此宮位影響您人生的特定面向。"}
                    </p>
                 </div>

                 {/* Detailed Interpretation */}
                 <div>
                   <h4 className="text-xs uppercase tracking-[0.2em] text-amber-800/70 mb-4 border-b border-amber-900/20 pb-2">命盤解讀</h4>
                   {selectedPalace.majorStars.length > 0 ? (
                      <div className="space-y-4">
                        {selectedPalace.majorStars.map(s => (
                           <div key={s} className="bg-black/40 p-4 rounded border border-gray-800 hover:border-amber-900/50 transition-colors">
                              <h5 className="text-red-400 font-bold mb-2 flex items-center gap-2 font-serif text-lg">
                                {s}星
                                <span className="text-[10px] text-gray-500 px-1 border border-gray-700 rounded font-sans">主星</span>
                              </h5>
                              {/* NOTE: This now returns rich paragraph text instead of one sentence */}
                              <div className="text-sm text-gray-300 leading-7 font-serif text-justify whitespace-pre-line">
                                {getSpecificStarInterpretation(s, selectedPalace.name)}
                              </div>
                           </div>
                        ))}
                      </div>
                   ) : (
                     <div className="text-gray-500 italic p-6 text-center border border-dashed border-gray-800 rounded bg-black/20">
                        此宮為空宮，力量較弱，主要受對宮（遷移宮/事業宮等）星曜影響，顯示該領域變數較大，需參照對宮主星。
                     </div>
                   )}
                 </div>

                 <div>
                   <h4 className="text-xs uppercase tracking-[0.2em] text-amber-800/70 mb-4 border-b border-amber-900/20 pb-2">輔星與神煞</h4>
                   <div className="flex flex-wrap gap-2">
                     {selectedPalace.minorStars.map(s => (
                       <button
                         key={s} 
                         onClick={(e) => handleStarClick(s, e)}
                         className="px-3 py-1 bg-gray-900 text-gray-400 border border-gray-700 rounded text-sm hover:text-gray-200 hover:border-gray-500 transition-colors"
                       >
                         {s}
                       </button>
                     ))}
                   </div>
                 </div>
               </div>
            </div>
          </div>
        )}

        {/* BaZi Pillar Detail Modal */}
        {selectedPillar && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setSelectedPillar(null)}></div>
            <div className="glass-panel border-2 border-amber-700/50 rounded-2xl w-full max-w-sm shadow-[0_0_50px_rgba(0,0,0,0.8)] relative z-20 animate-scaleIn overflow-hidden">
               <div className="bg-black/50 p-6 border-b border-amber-900/30 flex justify-between items-center">
                 <h3 className="text-2xl text-amber-500 font-calligraphy">{selectedPillar.key}詳解</h3>
                 <button onClick={() => setSelectedPillar(null)} className="text-gray-500 hover:text-white">
                   <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                 </button>
               </div>
               
               <div className="p-8 text-center">
                  <div className="flex justify-center gap-6 mb-8">
                     <div className="text-6xl font-calligraphy text-amber-400 drop-shadow-[0_0_10px_rgba(251,191,36,0.5)]">{selectedPillar.data.stem}</div>
                     <div className="text-6xl font-calligraphy text-amber-600 drop-shadow-[0_0_10px_rgba(217,119,6,0.5)]">{selectedPillar.data.branch}</div>
                  </div>
                  <div className="text-sm text-gray-400 mb-8 border-b border-gray-800 pb-4">
                    納音五行：<span className="text-gray-200 font-bold">{selectedPillar.data.element}</span>
                  </div>

                  <div className="text-left space-y-6">
                    {PILLAR_DEFINITIONS[selectedPillar.key] && (
                      <div className="bg-amber-950/20 p-4 rounded border border-amber-900/20">
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-amber-500 font-bold font-calligraphy text-lg">{PILLAR_DEFINITIONS[selectedPillar.key].title}</span>
                          <span className="text-xs text-amber-700 bg-amber-950/50 px-2 py-0.5 rounded-full">{PILLAR_DEFINITIONS[selectedPillar.key].age}</span>
                        </div>
                        <p className="text-gray-300 text-sm leading-relaxed font-serif">
                          {PILLAR_DEFINITIONS[selectedPillar.key].desc}
                        </p>
                      </div>
                    )}

                    <div className="bg-black/40 p-4 rounded border border-gray-800">
                       <h5 className="text-xs text-gray-500 mb-2 uppercase tracking-widest">白話解讀</h5>
                       <p className="text-gray-200 text-sm leading-relaxed font-serif text-justify">
                         {getPillarDetailedMeaning(selectedPillar.data, selectedPillar.key)}
                       </p>
                    </div>
                  </div>
               </div>
            </div>
          </div>
        )}

        {/* Star Detail Popup (Nested Modal) */}
        {selectedStar && (
           <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
             <div className="absolute inset-0 bg-black/80" onClick={() => setSelectedStar(null)}></div>
             <div className="glass-panel border-2 border-amber-600/50 rounded-xl w-full max-w-sm p-8 relative z-20 shadow-[0_0_50px_rgba(217,119,6,0.3)] animate-fadeIn text-center">
                <button onClick={() => setSelectedStar(null)} className="absolute top-2 right-2 text-gray-500 hover:text-white">
                   <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                </button>
                <div className="w-20 h-20 mx-auto bg-gray-900 rounded-full flex items-center justify-center border-2 border-amber-900/50 mb-6 text-3xl shadow-inner text-amber-500">
                  ★
                </div>
                <h3 className="text-5xl text-amber-500 font-calligraphy mb-3 text-glow">{selectedStar.name}</h3>
                <span className="inline-block px-4 py-1 bg-black/60 text-xs text-amber-600 rounded-full mb-8 border border-amber-900/30 uppercase tracking-widest font-bold">
                   五行屬{selectedStar.element}
                </span>
                <p className="text-gray-300 leading-relaxed font-serif text-lg text-justify">
                  {selectedStar.description}
                </p>
             </div>
           </div>
        )}

      </main>
      
      <style>{`
        @keyframes scaleIn {
          from { transform: scale(0.95); opacity: 0; }
          to { transform: scale(1); opacity: 1; }
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        .animate-scaleIn {
          animation: scaleIn 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
        .animate-fadeIn {
          animation: fadeIn 0.5s ease-out forwards;
        }
        /* Hide scrollbar for clean UI but allow scroll */
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(0,0,0,0.1); 
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #451a03; 
          border-radius: 2px;
        }
      `}</style>
    </div>
  );
};

export default App;
