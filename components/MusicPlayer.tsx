import React, { useRef, useState, useEffect } from 'react';
import { BG_MUSIC_URL } from '../constants';

const MusicPlayer: React.FC = () => {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(0.3);

  const togglePlay = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        const playPromise = audioRef.current.play();
        if (playPromise !== undefined) {
          playPromise.catch(error => {
            console.log("Audio play failed (autoplay policy):", error);
            // We can't force it, but UI shows paused state
          });
        }
      }
      setIsPlaying(!isPlaying);
    }
  };

  useEffect(() => {
    if(audioRef.current) {
      audioRef.current.volume = volume;
    }
  }, [volume]);

  return (
    <div className="fixed bottom-4 right-4 z-[100] flex items-center gap-2 bg-slate-950/80 backdrop-blur-md p-2 rounded-full border border-amber-900/50 shadow-[0_0_15px_rgba(251,191,36,0.2)] group transition-all duration-300 hover:scale-105">
      <audio ref={audioRef} src={BG_MUSIC_URL} loop preload="auto" />
      
      <button 
        onClick={togglePlay}
        className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-700 relative overflow-hidden ${
          isPlaying ? 'bg-amber-700 text-amber-100' : 'bg-slate-800 text-amber-600/50'
        }`}
        title="背景禪樂"
      >
        {isPlaying && (
           <div className="absolute inset-0 border border-amber-500 rounded-full animate-ping opacity-20"></div>
        )}
        {isPlaying ? (
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="6" y="4" width="4" height="16"></rect><rect x="14" y="4" width="4" height="16"></rect></svg>
        ) : (
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg>
        )}
      </button>

      <div className="w-0 overflow-hidden group-hover:w-24 transition-all duration-300 flex items-center px-0 group-hover:px-2">
         <input 
           type="range" 
           min="0" 
           max="1" 
           step="0.01" 
           value={volume} 
           onChange={(e) => setVolume(parseFloat(e.target.value))}
           className="w-20 h-1 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-amber-600"
         />
      </div>
    </div>
  );
};

export default MusicPlayer;