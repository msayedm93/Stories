import React, { useState, useEffect, useRef } from 'react';
import { Story } from '../types.ts';
import { ChevronLeft, ChevronRight, Home, Volume2, Sparkles, Languages, Loader2, PlayCircle, StopCircle, GraduationCap } from 'lucide-react';

interface StoryViewProps {
  story: Story;
  onReset: () => void;
  playAudio: (base64: string) => Promise<void>;
  stopAudio: () => void;
  isAudioPlaying: boolean;
  audioFinished: boolean;
  autoPlay: boolean;
  toggleAutoPlay: () => void;
}

const StoryView: React.FC<StoryViewProps> = ({ 
  story, 
  onReset, 
  playAudio, 
  stopAudio, 
  isAudioPlaying, 
  audioFinished,
  autoPlay,
  toggleAutoPlay
}) => {
  const [currentPage, setCurrentPage] = useState(0);
  const [showTranslation, setShowTranslation] = useState(true);
  const [showFact, setShowFact] = useState(false);
  const pageData = story.pages[currentPage];
  const isAr = story.language === 'ar';
  const isPageReady = !!pageData.imageUrl;
  
  const lastPageRef = useRef(currentPage);

  useEffect(() => {
    if (isPageReady && pageData.audioData) {
      playAudio(pageData.audioData);
    }
    return () => stopAudio();
  }, [currentPage, isPageReady, pageData.audioData]);

  useEffect(() => {
    if (autoPlay && audioFinished && currentPage < story.pages.length - 1) {
      const nextPageData = story.pages[currentPage + 1];
      if (nextPageData.imageUrl && nextPageData.audioData) {
        const timeout = setTimeout(() => setCurrentPage(p => p + 1), 1800);
        return () => clearTimeout(timeout);
      }
    }
  }, [autoPlay, audioFinished, currentPage, story.pages]);

  return (
    <div className={`fixed inset-0 bg-slate-950 flex flex-col animate-fade-in ${isAr ? 'font-arabic' : ''}`}>
      
      {/* Background Visual Layer */}
      <div className="absolute inset-0 z-0 bg-black overflow-hidden">
        {isPageReady ? (
          <img 
            src={pageData.imageUrl} 
            className="w-full h-full object-cover opacity-90 animate-ken-burns transform-gpu transition-opacity duration-1000" 
            alt="Story world" 
            key={`img-${currentPage}`}
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center gap-6 p-10">
            <div className="relative">
              <div className="w-24 h-24 border-4 border-white/5 border-t-purple-500 rounded-full animate-spin" />
              <div className="absolute inset-0 flex items-center justify-center">
                 <Sparkles className="text-purple-400 animate-pulse" size={32} />
              </div>
            </div>
            <p className="text-xl font-bold text-purple-300 animate-pulse uppercase tracking-widest">
              Painting your next dream...
            </p>
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-black/60 z-10" />
      </div>

      {/* Dynamic Header */}
      <div className="relative z-50 flex justify-between items-center p-6 md:p-10 pt-12" dir={isAr ? 'rtl' : 'ltr'}>
        <button onClick={onReset} className="w-12 h-12 glass rounded-2xl flex items-center justify-center text-white active:scale-90 border border-white/10">
          <Home size={22} />
        </button>
        
        <div className="flex gap-2">
          {pageData.magicFact && (
            <button 
              onClick={() => {
                setShowFact(!showFact);
                if (window.navigator.vibrate) window.navigator.vibrate(10);
              }}
              className={`flex items-center gap-2 px-4 py-3 glass rounded-2xl border transition-all ${showFact ? 'border-yellow-400 bg-yellow-400/20 shadow-lg scale-105' : 'border-white/10 opacity-70'}`}
            >
              <GraduationCap size={18} className={showFact ? "text-yellow-400" : "text-white"} />
              <span className="text-[10px] font-black uppercase tracking-tight hidden md:block">
                {isAr ? "سر الحكاية" : "Magic Secret"}
              </span>
            </button>
          )}

          <button 
            onClick={toggleAutoPlay}
            className={`flex items-center gap-2 px-4 py-3 glass rounded-2xl border transition-all ${autoPlay ? 'border-cyan-500 bg-cyan-500/20' : 'border-white/10 opacity-70'}`}
          >
            {autoPlay ? <StopCircle size={18} className="text-cyan-400" /> : <PlayCircle size={18} className="text-white" />}
          </button>

          <div className="glass px-4 py-3 rounded-2xl flex items-center gap-3 border border-white/10 text-white font-black tabular-nums">
            <span className="text-xs">{currentPage + 1}/{story.pages.length}</span>
          </div>
        </div>
      </div>

      {/* Immersive Text Box */}
      <div className="relative z-40 flex-grow flex flex-col justify-end p-6 pb-48 md:p-20" dir={isAr ? 'rtl' : 'ltr'}>
        <div className="max-w-4xl mx-auto w-full">
          
          {showFact && pageData.magicFact && (
            <div className="animate-in slide-in-from-bottom-4 fade-in duration-500 mb-6">
               <div className="glass-card bg-yellow-400/10 border-yellow-400/40 p-5 rounded-3xl flex items-start gap-3 shadow-2xl relative overflow-hidden">
                  <div className="absolute top-0 left-0 w-1 h-full bg-yellow-400" />
                  <Sparkles className="text-yellow-400 mt-1 flex-shrink-0" size={18} />
                  <p className="text-base md:text-xl font-bold text-yellow-50 text-shadow-sm">
                    {pageData.magicFact}
                  </p>
               </div>
            </div>
          )}

          <div key={`txt-${currentPage}`} className="animate-slide-up space-y-4 md:space-y-6">
            <div className="glass-card p-8 md:p-14 border border-white/10 shadow-2xl backdrop-blur-3xl relative">
               <div className="absolute -top-4 -right-4 w-10 h-10 glass rounded-full flex items-center justify-center border border-white/20">
                  <Sparkles size={16} className="text-purple-400" />
               </div>
               <p className={`font-black leading-[1.25] text-white transition-all duration-700 ${isAudioPlaying ? 'opacity-100 scale-100' : 'opacity-90 scale-[0.99]'} ${isAr ? 'text-4xl md:text-7xl' : 'text-3xl md:text-6xl tracking-tight'}`}>
                {pageData.text}
              </p>
            </div>

            {showTranslation && (
              <div className="animate-fade-in delay-200">
                <div className="glass-card p-4 md:p-6 px-8 border border-white/5 bg-black/40 inline-block">
                  <p className={`font-bold opacity-70 text-purple-100 ${!isAr ? 'text-xl md:text-3xl font-arabic' : 'text-lg md:text-xl italic'}`}>
                    {pageData.translatedText}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Smart Pagination Dots */}
      <div className="absolute bottom-10 left-0 right-0 z-50 flex flex-col items-center gap-6">
        <div className="flex gap-4 items-center px-6 py-3 glass rounded-full border border-white/10 shadow-xl">
          <button 
            disabled={currentPage === 0}
            onClick={() => { setCurrentPage(p => p - 1); setShowFact(false); }} 
            className="p-2 text-white disabled:opacity-20 transition-all hover:scale-110 active:scale-90"
          >
            <ChevronLeft size={32} />
          </button>
          
          <div className="flex gap-2.5 items-center">
            {story.pages.map((p, i) => (
              <div 
                key={i} 
                className={`h-2 rounded-full transition-all duration-700 ${
                  i === currentPage 
                    ? 'w-10 bg-gradient-to-r from-purple-400 to-pink-500 shadow-glow' 
                    : p.imageUrl 
                      ? 'w-2 bg-white/40' 
                      : 'w-2 bg-purple-500/20 animate-pulse'
                }`} 
              />
            ))}
          </div>

          <button 
            disabled={currentPage === story.pages.length - 1}
            onClick={() => { setCurrentPage(p => p + 1); setShowFact(false); }} 
            className="p-2 text-white disabled:opacity-20 transition-all hover:scale-110 active:scale-90"
          >
            <ChevronRight size={32} />
          </button>
        </div>
      </div>

      <style>{`
        .shadow-glow { box-shadow: 0 0 15px rgba(168, 85, 247, 0.6); }
        .text-shadow-sm { text-shadow: 0 2px 4px rgba(0,0,0,0.5); }
      `}</style>
    </div>
  );
};

export default StoryView;