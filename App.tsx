import React, { useState, useCallback, useRef, useEffect } from 'react';
import AgeSelector from './components/AgeSelector.tsx';
import StoryView from './components/StoryView.tsx';
import { AppState, Story, ThemeMode, StoryPage } from './types.ts';
import { generateStoryContent, generatePageImage, generateNarration } from './services/geminiService.ts';
import { AlertTriangle, Sparkles, Moon, Sun, Star, GraduationCap, Zap } from 'lucide-react';

export default function App() {
  const [state, setState] = useState<AppState>(AppState.IDLE);
  const [story, setStory] = useState<Story | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loadingMsg, setLoadingMsg] = useState("");
  const [theme, setTheme] = useState<ThemeMode>('dark');
  const [autoPlay, setAutoPlay] = useState(false);
  
  const audioContextRef = useRef<AudioContext | null>(null);
  const currentSourceRef = useRef<AudioBufferSourceNode | null>(null);
  const [isAudioPlaying, setIsAudioPlaying] = useState(false);
  const [audioFinished, setAudioFinished] = useState(false);

  useEffect(() => {
    document.body.className = theme === 'dark' ? '' : 'light-mode';
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'dark' ? 'light' : 'dark');
  };

  const stopAudio = useCallback(() => {
    if (currentSourceRef.current) {
      try { currentSourceRef.current.stop(); } catch (err) {}
      currentSourceRef.current = null;
    }
    setIsAudioPlaying(false);
    setAudioFinished(false);
  }, []);

  const decodeAudioData = useCallback(async (data: Uint8Array, ctx: AudioContext, sampleRate: number, numChannels: number): Promise<AudioBuffer> => {
    const dataInt16 = new Int16Array(data.buffer);
    const frameCount = dataInt16.length / numChannels;
    const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);
    for (let channel = 0; channel < numChannels; channel++) {
      const channelData = buffer.getChannelData(channel);
      for (let i = 0; i < frameCount; i++) {
        channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
      }
    }
    return buffer;
  }, []);

  const playAudio = useCallback(async (base64: string) => {
    stopAudio();
    if (!base64) return;
    if (!audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
    }
    const ctx = audioContextRef.current;
    if (ctx.state === 'suspended') await ctx.resume();

    try {
      const binaryString = atob(base64);
      const bytes = new Uint8Array(binaryString.length);
      for (let i = 0; i < binaryString.length; i++) bytes[i] = binaryString.charCodeAt(i);
      const audioBuffer = await decodeAudioData(bytes, ctx, 24000, 1);
      const source = ctx.createBufferSource();
      source.buffer = audioBuffer;
      source.connect(ctx.destination);
      source.onended = () => {
        setIsAudioPlaying(false);
        setAudioFinished(true);
      };
      currentSourceRef.current = source;
      source.start();
      setIsAudioPlaying(true);
      setAudioFinished(false);
    } catch (e) { 
      console.error("Audio error:", e);
      setAudioFinished(true);
    }
  }, [stopAudio, decodeAudioData]);

  const handleStart = async (age: number, language: 'en' | 'ar', gender: string, childName: string) => {
    try {
      setError(null);
      setState(AppState.GENERATING_TEXT);
      const isArabic = language === 'ar';
      const cleanName = childName.trim();
      
      const displayName = cleanName || (isArabic ? 'بطلنا الصغير' : 'Our Hero');
      setLoadingMsg(isArabic ? `بنحضر حكاية خيالية لـ ${displayName}...` : `CRAFTING A MAGICAL WORLD FOR ${displayName.toUpperCase()}...`);
      
      const heroType = gender === 'boy' ? (isArabic ? 'ولد شجاع' : 'brave boy') : (gender === 'girl' ? (isArabic ? 'بنت ذكية' : 'smart girl') : (isArabic ? 'بطل صغير' : 'little hero'));
      const heroQuery = cleanName ? `${heroType} named ${cleanName}` : `our anonymous ${heroType}`;
      
      // Step 1: Text Generation (Extremely Fast)
      const newStory = await generateStoryContent(age, language, heroQuery);
      newStory.childName = cleanName;
      setStory(newStory);

      // Step 2: Trigger Asset Pipeline
      setState(AppState.GENERATING_ASSETS);
      setLoadingMsg(isArabic ? "بنلون الحلم..." : "PAINTING THE FIRST WORLD...");

      // Parallelize Page 1 for immediate view
      const [img1, audio1] = await Promise.all([
        generatePageImage(newStory.pages[0].imagePrompt),
        generateNarration(newStory.pages[0].text, language)
      ]);

      const updatedPages = [...newStory.pages];
      updatedPages[0] = { ...updatedPages[0], imageUrl: img1, audioData: audio1 };
      setStory({ ...newStory, pages: updatedPages });

      // Start reading immediately!
      setState(AppState.READING);

      // Background loading: Parallelize all remaining pages at once
      newStory.pages.slice(1).forEach(async (page, i) => {
        const actualIndex = i + 1;
        try {
          const [img, audio] = await Promise.all([
            generatePageImage(page.imagePrompt),
            generateNarration(page.text, language)
          ]);
          setStory(prev => {
            if (!prev) return null;
            const nextPages = [...prev.pages];
            nextPages[actualIndex] = { ...nextPages[actualIndex], imageUrl: img, audioData: audio };
            return { ...prev, pages: nextPages };
          });
        } catch (e) {
          console.warn(`Asset failed for page ${actualIndex}`, e);
        }
      });

    } catch (err: any) {
      setError(err.message || "Magic spark failed. Try again!");
      setState(AppState.IDLE);
    }
  };

  return (
    <div className={`min-h-screen w-full flex flex-col items-center justify-center relative overflow-x-hidden transition-all duration-1000 ${theme === 'light' ? 'bg-[#f0f4f8]' : 'bg-[#020617]'}`}>
      
      {state !== AppState.READING && (
        <button 
          onClick={toggleTheme} 
          className="fixed top-6 md:top-8 right-6 md:right-8 z-[100] w-12 h-12 md:w-14 md:h-14 glass rounded-[16px] md:rounded-[20px] flex items-center justify-center active:scale-90 transition-all shadow-xl border border-white/10"
        >
          {theme === 'dark' ? <Sun className="text-yellow-400" /> : <Moon className="text-indigo-600" />}
        </button>
      )}

      {state === AppState.IDLE && <AgeSelector onSelect={handleStart} loading={false} />}

      {(state === AppState.GENERATING_TEXT || state === AppState.GENERATING_ASSETS) && (
        <div className="flex flex-col items-center text-center space-y-10 animate-fade-in max-w-xl px-6 py-12">
          <div className="relative">
            <div className="w-40 h-40 md:w-64 md:h-64 glass rounded-[50px] md:rounded-[80px] flex items-center justify-center shadow-[0_0_120px_rgba(168,85,247,0.5)] border border-white/20">
              <Sparkles size={80} className="text-purple-400 animate-pulse" />
            </div>
            <div className="absolute top-0 right-0">
               <Zap size={48} className="text-cyan-400 animate-bounce" />
            </div>
          </div>
          <div className="space-y-4">
            <h2 className="text-3xl md:text-6xl font-black tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-400 px-4 leading-tight">
              {loadingMsg}
            </h2>
            <p className="text-xs md:text-sm font-black text-white/30 tracking-[0.4em] uppercase">
              {state === AppState.GENERATING_TEXT ? "Writing unique magic..." : "Generating Pixar worlds..."}
            </p>
          </div>
        </div>
      )}

      {state === AppState.READING && story && (
        <StoryView 
          story={story} 
          onReset={() => { stopAudio(); setState(AppState.IDLE); setStory(null); }} 
          playAudio={playAudio} 
          stopAudio={stopAudio} 
          isAudioPlaying={isAudioPlaying}
          audioFinished={audioFinished}
          autoPlay={autoPlay}
          toggleAutoPlay={() => setAutoPlay(!autoPlay)}
        />
      )}

      {error && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-6 bg-slate-950/95 backdrop-blur-3xl animate-fade-in">
          <div className="glass-card p-10 text-center space-y-6 max-w-md border-rose-500/30">
            <AlertTriangle size={48} className="text-rose-500 mx-auto" />
            <h3 className="text-xl font-black text-white uppercase tracking-tighter">Magic Interrupted</h3>
            <p className="text-base opacity-80 text-slate-300">{error}</p>
            <button onClick={() => setError(null)} className="w-full py-4 btn-magic rounded-2xl font-black text-lg text-white active:scale-95">Try Again</button>
          </div>
        </div>
      )}
    </div>
  );
}