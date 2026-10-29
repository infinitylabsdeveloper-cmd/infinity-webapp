import React, { useState, useEffect, useRef } from 'react';
import { Sparkles, GraduationCap, ArrowRight } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface InspirationalSplashProps {
  onComplete: () => void;
  appName?: string;
}

const QUOTES = [
  {
    text: "Your Future Depends on What You Do Today.",
    highlights: ["Future", "Today"]
  },
  {
    text: "Small Steps Today, Extraordinary Achievements Tomorrow.",
    highlights: ["Small Steps", "Achievements", "Tomorrow"]
  },
  {
    text: "Dream Big. Learn Every Day. Achieve Greatness.",
    highlights: ["Dream Big", "Achieve Greatness"]
  },
  {
    text: "Discipline Today, Success Tomorrow.",
    highlights: ["Discipline", "Success", "Tomorrow"]
  },
  {
    text: "Believe in Your Potential. Build Your Future.",
    highlights: ["Believe", "Potential", "Future"]
  },
  {
    text: "Every Question You Practice Brings You Closer to Success.",
    highlights: ["Practice", "Success"]
  },
  {
    text: "Your Hard Work Today Becomes Your Success Story Tomorrow.",
    highlights: ["Hard Work", "Success Story", "Tomorrow"]
  }
];

export default function InspirationalSplash({ onComplete, appName = "All India Competitive Exams" }: InspirationalSplashProps) {
  // Pick a random quote or rotate based on session/time
  const [quoteObj] = useState(() => {
    const idx = Math.floor(Math.random() * QUOTES.length);
    return QUOTES[idx];
  });

  const [displayedText, setDisplayedText] = useState('');
  const [isTypingComplete, setIsTypingComplete] = useState(false);
  const [showGlow, setShowGlow] = useState(false);
  const indexRef = useRef(0);

  // Web Audio API helper for soft, premium mechanical keystroke sound
  const playKeySound = () => {
    try {
      if (typeof window === 'undefined') return;
      const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioContext) return;
      const ctx = new AudioContext();
      if (ctx.state === 'suspended') {
        ctx.resume();
      }
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      // Soft metallic click / mechanical tap frequency
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(220 + Math.random() * 80, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(40, ctx.currentTime + 0.04);

      gain.gain.setValueAtTime(0.04, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.04);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + 0.04);
    } catch (e) {
      // Audio autoplay restrictions or muted - fail silently
    }
  };

  // Typing effect loop
  useEffect(() => {
    const fullText = quoteObj.text;
    const timer = setInterval(() => {
      if (indexRef.current < fullText.length) {
        const nextChar = fullText.charAt(indexRef.current);
        setDisplayedText(prev => prev + nextChar);
        indexRef.current += 1;

        // Play sound on non-space characters
        if (nextChar.trim() !== '') {
          playKeySound();
        }
      } else {
        clearInterval(timer);
        setIsTypingComplete(true);
        setTimeout(() => {
          setShowGlow(true);
        }, 200);

        // Automatically proceed after 2.2 seconds of viewing the completed quote
        const autoProceedTimer = setTimeout(() => {
          onComplete();
        }, 2400);

        return () => clearTimeout(autoProceedTimer);
      }
    }, 42); // ~42ms per character for smooth expert typing speed

    return () => clearTimeout(timer);
  }, [quoteObj, onComplete]);

  // Helper to render text with gradient highlights on keyword matches
  const renderHighlightedText = (text: string) => {
    let result = text;
    // We will wrap highlight words in a special span
    return (
      <span className="inline-block leading-relaxed">
        {text.split(' ').map((word, idx) => {
          const cleanWord = word.replace(/[^a-zA-Z]/g, '');
          const isHighlight = quoteObj.highlights.some(h => h.toLowerCase().includes(cleanWord.toLowerCase()) && cleanWord.length > 2);
          
          if (isHighlight) {
            return (
              <span key={idx} className="bg-gradient-to-r from-amber-300 via-teal-300 to-indigo-300 bg-clip-text text-transparent font-black drop-shadow-sm mx-1 inline-block">
                {word}{' '}
              </span>
            );
          }
          return <span key={idx} className="text-white/95 font-semibold mx-0.5 inline-block">{word} </span>;
        })}
      </span>
    );
  };

  return (
    <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-slate-950 overflow-hidden font-sans select-none px-4">
      {/* Luxurious Cinematic Background Gradients & Glows */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-900/50 via-slate-950 to-slate-950 pointer-events-none" />
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[700px] h-[400px] bg-gradient-to-tr from-purple-600/20 via-indigo-500/25 to-teal-400/20 blur-[140px] pointer-events-none rounded-full" />
      <div className="absolute bottom-10 left-10 w-96 h-96 bg-amber-500/10 blur-[100px] pointer-events-none rounded-full" />
      <div className="absolute top-10 right-10 w-96 h-96 bg-cyan-500/10 blur-[100px] pointer-events-none rounded-full" />

      {/* Subtle Grid Pattern Overlay */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b15_1px,transparent_1px),linear-gradient(to_bottom,#1e293b15_1px,transparent_1px)] bg-[size:3rem_3rem] pointer-events-none opacity-40" />

      {/* Main Content Card */}
      <motion.div 
        initial={{ opacity: 0, scale: 0.94, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        className="relative z-10 max-w-2xl w-full mx-auto text-center space-y-8 p-6 sm:p-10 rounded-3xl bg-slate-900/60 backdrop-blur-2xl border border-slate-800 shadow-2xl shadow-indigo-950/50"
      >
        {/* App Branding & Logo */}
        <div className="flex flex-col items-center space-y-3">
          <motion.div 
            initial={{ scale: 0.8, rotate: -10 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ duration: 0.5, type: 'spring', stiffness: 200 }}
            className="h-16 w-16 sm:h-20 sm:w-20 rounded-2xl bg-gradient-to-br from-indigo-600 via-purple-600 to-teal-500 text-white flex items-center justify-center shadow-lg shadow-indigo-500/30 border border-white/20"
          >
            <GraduationCap className="h-9 w-9 sm:h-11 sm:w-11" />
          </motion.div>
          <div>
            <span className="text-[10px] sm:text-xs font-black uppercase tracking-[0.25em] bg-gradient-to-r from-amber-400 to-amber-200 bg-clip-text text-transparent">
              All India Exam Network
            </span>
            <h1 className="text-lg sm:text-xl font-black text-white tracking-wide mt-0.5">
              {appName}
            </h1>
          </div>
        </div>

        {/* Inspirational Typing Quote Box */}
        <div className="min-h-[120px] sm:min-h-[140px] flex items-center justify-center px-2 py-4">
          <div className="relative">
            {/* Soft backdrop glow on complete */}
            {showGlow && (
              <div className="absolute inset-0 bg-gradient-to-r from-amber-500/20 via-teal-500/20 to-indigo-500/20 blur-xl rounded-2xl transition-all duration-700 animate-pulse" />
            )}
            
            <p className="relative z-10 text-xl sm:text-2xl md:text-3xl font-bold tracking-tight text-white leading-relaxed">
              “{renderHighlightedText(displayedText)}
              {!isTypingComplete && (
                <span className="inline-block w-2.5 h-6 sm:h-7 bg-amber-400 ml-1.5 animate-pulse rounded-full align-middle shadow-[0_0_12px_rgba(251,191,36,0.8)]" />
              )}
              ”
            </p>
          </div>
        </div>

        {/* Footer / Skip action */}
        <div className="flex items-center justify-between pt-4 border-t border-slate-800/80 text-xs text-slate-400 font-medium">
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-amber-400 animate-spin" style={{ animationDuration: '4s' }} />
            <span>Cinematic Inspiration</span>
          </div>

          <button
            onClick={onComplete}
            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-teal-600 hover:from-indigo-500 hover:to-teal-500 text-white font-black text-xs tracking-wider shadow-lg shadow-indigo-600/30 transition-all cursor-pointer flex items-center gap-2 active:scale-95"
          >
            <span>ENTER APP</span>
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      </motion.div>
    </div>
  );
}
