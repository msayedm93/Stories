import React, { useState } from 'react';
import { Sparkles, User, Zap, Star } from 'lucide-react';

interface AgeSelectorProps {
  onSelect: (age: number, language: 'en' | 'ar', gender: 'boy' | 'girl' | 'surprise', name: string) => void;
  loading: boolean;
}

const AgeSelector: React.FC<AgeSelectorProps> = ({ onSelect, loading }) => {
  const [language, setLanguage] = useState<'en' | 'ar'>('ar');
  const [name, setName] = useState('');
  const [selectedAge, setSelectedAge] = useState<number | null>(null);
  const [gender, setGender] = useState<'boy' | 'girl' | 'surprise'>('surprise');
  const isAr = language === 'ar';

  const ages = [2, 3, 4, 5, 6, 7, 8, 10];

  const triggerHaptic = () => {
    if (window.navigator && window.navigator.vibrate) {
      window.navigator.vibrate(10);
    }
  };

  const handleAgeSelect = (age: number) => {
    triggerHaptic();
    setSelectedAge(age);
  };

  const handleMainAction = () => {
    if (selectedAge) {
      triggerHaptic();
      onSelect(selectedAge, language, gender, name);
    }
  };

  return (
    <div className={`w-full max-w-2xl mx-auto flex flex-col items-center gap-6 md:gap-12 py-8 md:py-12 px-5 md:px-6 animate-in fade-in slide-in-from-bottom-10 duration-700 ${isAr ? 'font-arabic' : ''}`}>
      
      {/* Language Switcher */}
      <div className="w-full flex justify-center mb-2">
        <div className="flex glass p-1.5 rounded-full border border-white/20 shadow-xl">
          <button 
            onClick={() => { triggerHaptic(); setLanguage('en'); }} 
            className={`px-6 md:px-8 py-2 md:py-3 rounded-full text-xs md:text-sm font-black transition-all ${language === 'en' ? 'bg-white text-purple-900 shadow-lg' : 'opacity-40 text-white'}`}
          >
            English
          </button>
          <button 
            onClick={() => { triggerHaptic(); setLanguage('ar'); }} 
            className={`px-6 md:px-8 py-2 md:py-3 rounded-full text-sm md:text-base font-black transition-all ${language === 'ar' ? 'bg-white text-purple-900 shadow-lg' : 'opacity-40 text-white'}`}
          >
             العربية
          </button>
        </div>
      </div>

      {/* Brand */}
      <div className="text-center space-y-2 md:space-y-4">
        <h1 className="text-4xl md:text-8xl font-black tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-purple-400 via-pink-400 to-cyan-400 drop-shadow-2xl">
          {isAr ? "نجم الحكايات" : "Starlight"}
        </h1>
        <p className="text-base md:text-2xl font-bold opacity-60 tracking-tight text-center px-4">
          {isAr ? "قصص مصرية دافئة لأطفالك بضغطة واحدة" : "Generate magical bedtime stories in seconds"}
        </p>
      </div>

      {/* Input Group */}
      <div className="w-full space-y-8 md:space-y-10">
        
        {/* Child Name (Optional) */}
        <div className="space-y-3">
          <label className="text-[10px] md:text-[12px] font-black tracking-[0.3em] uppercase opacity-40 px-2 flex items-center gap-2">
            <User size={14} /> {isAr ? "اسم البطل (اختياري)" : "Hero Name (Optional)"}
          </label>
          <input 
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            dir={isAr ? 'rtl' : 'ltr'}
            placeholder={isAr ? "سيبها فاضية لو عايز..." : "Leave blank if you want..."}
            className="w-full h-14 md:h-20 glass rounded-[20px] md:rounded-[32px] px-6 md:px-10 text-xl md:text-3xl font-black outline-none ring-1 ring-white/10 focus:ring-4 focus:ring-purple-500/40 transition-all placeholder:text-white/20 bg-transparent text-white shadow-inner"
          />
        </div>

        {/* Avatar/Gender */}
        <div className="space-y-3">
          <label className="text-center block text-[10px] md:text-[12px] font-black tracking-[0.3em] uppercase opacity-40">
            {isAr ? "الشخصية" : "Character"}
          </label>
          <div className="flex justify-center gap-3 md:gap-8">
            {[
              { id: 'boy', icon: '👦', label: isAr ? 'ولد' : 'BOY' },
              { id: 'girl', icon: '👧', label: isAr ? 'بنت' : 'GIRL' },
              { id: 'surprise', icon: '✨', label: isAr ? 'مفاجأة' : '??' }
            ].map((g) => (
              <button
                key={g.id}
                onClick={() => { triggerHaptic(); setGender(g.id as any); }}
                className={`flex-1 max-w-[100px] md:max-w-none flex flex-col items-center gap-2 transition-all ${gender === g.id ? 'scale-105' : 'opacity-30'}`}
              >
                <div className={`w-16 h-16 md:w-28 md:h-28 rounded-[24px] md:rounded-[40px] flex items-center justify-center text-3xl md:text-5xl transition-all border-4 ${gender === g.id ? 'border-white bg-purple-600 shadow-xl' : 'glass border-white/5'}`}>
                  {g.icon}
                </div>
                <span className="text-[9px] md:text-[10px] font-black tracking-widest text-white">{g.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Age Selector */}
        <div className="space-y-3">
          <label className="text-center block text-[10px] md:text-[12px] font-black tracking-[0.3em] uppercase opacity-40">
            {isAr ? "السن كام سنة؟" : "How old?"}
          </label>
          <div className="grid grid-cols-4 md:grid-cols-8 gap-2 md:gap-3">
            {ages.map((age) => (
              <button
                key={age}
                onClick={() => handleAgeSelect(age)}
                className={`h-12 md:h-16 rounded-xl md:rounded-3xl font-black text-lg md:text-2xl transition-all border-2 ${selectedAge === age ? 'bg-white text-purple-900 border-white scale-110 shadow-lg' : 'glass border-white/5 text-white/60'}`}
              >
                {age}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Action */}
      <button
        disabled={loading || !selectedAge}
        onClick={handleMainAction}
        className={`group relative w-full h-16 md:h-24 rounded-[24px] md:rounded-[40px] font-black text-xl md:text-3xl tracking-tight shadow-2xl transition-all active:scale-95 flex items-center justify-center gap-4 ${selectedAge ? 'btn-magic text-white' : 'bg-white/5 text-white/10 pointer-events-none'}`}
      >
        <Zap className={selectedAge ? "animate-pulse" : ""} />
        <span>{isAr ? "افتح باب السحر" : "CREATE MAGIC"}</span>
      </button>

      <div className="text-[9px] font-bold opacity-30 tracking-[0.4em] uppercase text-center pb-10">
        Store-ready application • Native Experience
      </div>

    </div>
  );
};

export default AgeSelector;