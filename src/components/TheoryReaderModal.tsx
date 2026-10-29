import React, { useState } from 'react';
import { Topic, AppConfig } from '../types';
import { 
  X, BookOpen, Layers, CheckCircle2, 
  Printer, Copy, Check, ZoomIn, ZoomOut, Zap, 
  Table as TableIcon
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface TheoryReaderModalProps {
  isOpen: boolean;
  onClose: () => void;
  topic: Topic;
  unitName: string;
  subjectName: string;
  activeApp: AppConfig;
  onStartPractice?: () => void;
}

export default function TheoryReaderModal({
  isOpen,
  onClose,
  topic,
  unitName,
  subjectName,
  activeApp,
  onStartPractice
}: TheoryReaderModalProps) {
  const [fontSize, setFontSize] = useState<'normal' | 'large' | 'xlarge'>('normal');
  const [copied, setCopied] = useState(false);
  const [activeReadingTheme, setActiveReadingTheme] = useState<'light' | 'sepia' | 'dark'>('dark');

  if (!isOpen || !topic) return null;

  const handleCopyNotes = () => {
    const textToCopy = `${topic.name}\n\n${topic.theorySummary || ''}\n\n${topic.theoryContent || ''}`;
    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePrint = () => {
    window.print();
  };

  // Render markdown-like sections (headings, bold, lists)
  const renderFormattedContent = (content?: string) => {
    if (!content) return null;

    const lines = content.split('\n');
    return (
      <div className="space-y-4">
        {lines.map((line, idx) => {
          const trimmed = line.trim();
          if (!trimmed) return <div key={idx} className="h-2" />;

          // Heading 3
          if (trimmed.startsWith('### ')) {
            return (
              <h3 key={idx} className="text-lg sm:text-xl font-black text-amber-400 mt-6 mb-2 border-b border-amber-500/20 pb-1.5 flex items-center gap-2">
                <span className="text-amber-500">✦</span> {trimmed.replace('### ', '')}
              </h3>
            );
          }

          // Heading 4
          if (trimmed.startsWith('#### ')) {
            return (
              <h4 key={idx} className="text-base sm:text-lg font-bold text-indigo-300 mt-4 mb-1">
                {trimmed.replace('#### ', '')}
              </h4>
            );
          }

          // Bullet list item
          if (trimmed.startsWith('* ') || trimmed.startsWith('- ')) {
            const itemText = trimmed.substring(2);
            return (
              <div key={idx} className="flex items-start gap-2.5 ml-2 sm:ml-4 my-1">
                <div className="h-1.5 w-1.5 rounded-full bg-amber-400 mt-2 shrink-0" />
                <p className="leading-relaxed font-normal text-slate-200">
                  {renderInlineFormatting(itemText)}
                </p>
              </div>
            );
          }

          // Numbered list item
          if (/^\d+\.\s/.test(trimmed)) {
            const num = trimmed.match(/^\d+\./)?.[0] || '•';
            const itemText = trimmed.replace(/^\d+\.\s*/, '');
            return (
              <div key={idx} className="flex items-start gap-2.5 ml-2 sm:ml-4 my-1.5">
                <span className="font-bold text-amber-400 text-xs mt-0.5 shrink-0 px-1.5 py-0.5 rounded bg-amber-950/60 border border-amber-500/30">
                  {num}
                </span>
                <p className="leading-relaxed font-normal text-slate-200">
                  {renderInlineFormatting(itemText)}
                </p>
              </div>
            );
          }

          // Regular paragraph
          return (
            <p key={idx} className="leading-relaxed font-normal text-slate-200">
              {renderInlineFormatting(trimmed)}
            </p>
          );
        })}
      </div>
    );
  };

  // Helper for inline bold (**text**)
  const renderInlineFormatting = (text: string) => {
    const parts = text.split(/(\*\*.*?\*\*)/g);
    return parts.map((part, pIdx) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return (
          <strong key={pIdx} className="font-extrabold text-amber-300">
            {part.slice(2, -2)}
          </strong>
        );
      }
      return part;
    });
  };

  // Font size classes
  const fontClass = 
    fontSize === 'xlarge' ? 'text-lg sm:text-xl' :
    fontSize === 'large' ? 'text-base sm:text-lg' : 'text-sm sm:text-base';

  // Theme classes
  const themeContainerClass = 
    activeReadingTheme === 'light' ? 'bg-slate-50 text-slate-900 border-slate-300' :
    activeReadingTheme === 'sepia' ? 'bg-[#fbf0d9] text-[#433422] border-[#e8d7b8]' :
    'bg-indigo-50 text-indigo-950 border-indigo-200';

  const themeCardBg = 
    activeReadingTheme === 'light' ? 'bg-white border-slate-200 shadow-sm' :
    activeReadingTheme === 'sepia' ? 'bg-[#f4e4c1] border-[#dfcd9f] shadow-sm' :
    'bg-white border-indigo-200 shadow-sm';

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-900/30 backdrop-blur-md overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: 15 }}
          transition={{ duration: 0.2 }}
          className={`w-full max-w-4xl max-h-[92vh] flex flex-col rounded-2xl sm:rounded-3xl border shadow-2xl overflow-hidden ${themeContainerClass}`}
        >
          {/* Header Bar */}
          <div className="p-3.5 sm:p-5 border-b border-inherit flex items-center justify-between gap-3 bg-white/60 backdrop-blur-md shrink-0">
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1.5 text-[11px] text-slate-400 font-semibold mb-1 truncate">
                <span className="truncate">{activeApp.name}</span>
                <span>/</span>
                <span className="truncate">{subjectName}</span>
                <span>/</span>
                <span className="text-amber-400 font-bold truncate">{unitName}</span>
              </div>
              <h2 className="text-base sm:text-xl font-black truncate flex items-center gap-2">
                <span className="p-1.5 rounded-lg bg-amber-500/20 text-amber-400 shrink-0">
                  <BookOpen className="h-4 w-4" />
                </span>
                <span className="truncate">{topic.name}</span>
              </h2>
            </div>

            {/* Reading Toolbar (Font Size, Theme, Copy, Close) */}
            <div className="flex items-center gap-1 sm:gap-2 shrink-0">
              {/* Font Sizer */}
              <div className="hidden sm:flex items-center bg-black/30 rounded-xl p-1 border border-white/10 text-xs">
                <button
                  onClick={() => setFontSize('normal')}
                  className={`px-2 py-1 rounded-lg font-bold transition-all ${fontSize === 'normal' ? 'bg-amber-500 text-white' : 'text-slate-400 hover:text-white'}`}
                  title="Normal font size"
                >
                  <ZoomOut className="h-3.5 w-3.5" />
                </button>
                <button
                  onClick={() => setFontSize('large')}
                  className={`px-2 py-1 rounded-lg font-bold transition-all ${fontSize === 'large' ? 'bg-amber-500 text-white' : 'text-slate-400 hover:text-white'}`}
                  title="Large font size"
                >
                  A
                </button>
                <button
                  onClick={() => setFontSize('xlarge')}
                  className={`px-2 py-1 rounded-lg font-bold transition-all ${fontSize === 'xlarge' ? 'bg-amber-500 text-white' : 'text-slate-400 hover:text-white'}`}
                  title="Extra large font size"
                >
                  <ZoomIn className="h-3.5 w-3.5" />
                </button>
              </div>

              {/* Theme Selector */}
              <div className="flex items-center bg-black/30 rounded-xl p-1 border border-white/10 text-xs">
                <button
                  onClick={() => setActiveReadingTheme('dark')}
                  className={`h-7 w-7 rounded-lg flex items-center justify-center font-bold transition-all ${activeReadingTheme === 'dark' ? 'bg-indigo-600 text-white ring-2 ring-white/30' : 'text-slate-400'}`}
                  title="Night / Dark Mode"
                >
                  🌙
                </button>
                <button
                  onClick={() => setActiveReadingTheme('sepia')}
                  className={`h-7 w-7 rounded-lg flex items-center justify-center font-bold transition-all ${activeReadingTheme === 'sepia' ? 'bg-[#d8c399] text-amber-950 ring-2 ring-amber-700/30' : 'text-slate-400'}`}
                  title="Sepia Book Mode"
                >
                  📜
                </button>
                <button
                  onClick={() => setActiveReadingTheme('light')}
                  className={`h-7 w-7 rounded-lg flex items-center justify-center font-bold transition-all ${activeReadingTheme === 'light' ? 'bg-white text-slate-900 ring-2 ring-slate-400' : 'text-slate-400'}`}
                  title="Day / Light Mode"
                >
                  ☀️
                </button>
              </div>

              {/* Copy Notes */}
              <button
                onClick={handleCopyNotes}
                className="h-8 w-8 sm:h-9 sm:w-9 rounded-xl bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-all cursor-pointer border border-white/10"
                title="Copy Theory Notes"
              >
                {copied ? <Check className="h-4 w-4 text-emerald-400" /> : <Copy className="h-4 w-4" />}
              </button>

              {/* Print Notes */}
              <button
                onClick={handlePrint}
                className="hidden sm:flex h-9 w-9 rounded-xl bg-white/10 hover:bg-white/20 text-white items-center justify-center transition-all cursor-pointer border border-white/10"
                title="Print Notes"
              >
                <Printer className="h-4 w-4" />
              </button>

              {/* Close Button */}
              <button
                onClick={onClose}
                className="h-8 w-8 sm:h-9 sm:w-9 rounded-xl bg-rose-500/20 hover:bg-rose-500 text-white flex items-center justify-center transition-all cursor-pointer border border-rose-500/30"
                title="Close"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Reader Body (Scrollable) */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-8 space-y-6">
            {/* Top Badge & Theory Title */}
            <div className="space-y-2 border-b border-inherit pb-4">
              <div className="flex flex-wrap items-center gap-2">
                <span className="px-2.5 py-1 rounded-md text-[10px] font-black uppercase tracking-wider bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center gap-1">
                  <BookOpen className="h-3 w-3" /> Comprehensive Theory Notes
                </span>
                <span className="px-2.5 py-1 rounded-md text-[10px] font-black uppercase tracking-wider bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                  Exact Syllabus Aligned
                </span>
                {topic.hasPractice !== false && (
                  <span className="px-2.5 py-1 rounded-md text-[10px] font-black uppercase tracking-wider bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                    Practice MCQs Available
                  </span>
                )}
              </div>

              <h1 className="text-xl sm:text-2xl md:text-3xl font-black leading-tight tracking-tight">
                {topic.theoryTitle || topic.name}
              </h1>

              {topic.theorySummary && (
                <div className={`p-3.5 sm:p-4 rounded-xl border ${themeCardBg} relative mt-3`}>
                  <p className="text-xs sm:text-sm font-medium leading-relaxed italic opacity-90">
                    💡 <strong className="font-bold">Key Focus & Overview:</strong> {topic.theorySummary}
                  </p>
                </div>
              )}
            </div>

            {/* Key Takeaways Cards */}
            {topic.keyTakeaways && topic.keyTakeaways.length > 0 && (
              <div className="space-y-2">
                <h3 className="text-xs font-black uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
                  <CheckCircle2 className="h-3.5 w-3.5" /> High-Yield Exam Takeaways
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {topic.keyTakeaways.map((point, kIdx) => (
                    <div 
                      key={kIdx} 
                      className={`p-3 rounded-xl border flex items-start gap-2.5 text-xs sm:text-sm font-medium ${themeCardBg}`}
                    >
                      <span className="text-emerald-400 font-bold shrink-0 mt-0.5">✓</span>
                      <span className="leading-snug">{point}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Structured Tables (e.g. Constitutional Articles, Reorganisation Act, Dynasties) */}
            {topic.theoryTables && topic.theoryTables.length > 0 && (
              <div className="space-y-4 pt-2">
                {topic.theoryTables.map((tbl, tIdx) => (
                  <div key={tIdx} className={`rounded-2xl border overflow-hidden ${themeCardBg}`}>
                    {tbl.title && (
                      <div className="p-3 sm:p-4 bg-amber-500/15 border-b border-inherit flex items-center gap-2">
                        <TableIcon className="h-4 w-4 text-amber-400" />
                        <h4 className="text-xs sm:text-sm font-black text-amber-300 tracking-wide uppercase">
                          {tbl.title}
                        </h4>
                      </div>
                    )}
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-xs sm:text-sm border-collapse">
                        <thead>
                          <tr className="bg-white/5 border-b border-inherit text-slate-300 font-black">
                            {tbl.headers.map((h, hIdx) => (
                              <th key={hIdx} className="p-2.5 sm:p-3.5 whitespace-nowrap">
                                {h}
                              </th>
                            ))}
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-inherit">
                          {tbl.rows.map((row, rIdx) => (
                            <tr key={rIdx} className="hover:bg-white/5 transition-colors">
                              {row.map((cell, cIdx) => (
                                <td key={cIdx} className="p-2.5 sm:p-3.5 align-top font-medium leading-relaxed">
                                  {cell}
                                </td>
                              ))}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Main Formatted Theory Content */}
            <div className={`prose max-w-none pt-2 ${fontClass}`}>
              {topic.theoryContent ? (
                renderFormattedContent(topic.theoryContent)
              ) : (
                <div className={`p-8 text-center rounded-2xl border ${themeCardBg} space-y-3`}>
                  <BookOpen className="h-10 w-10 text-amber-400 mx-auto" />
                  <h4 className="text-base font-bold">Comprehensive Study Notes Ready</h4>
                  <p className="text-xs text-slate-400 max-w-md mx-auto leading-relaxed">
                    This topic is aligned with the exact examination syllabus. Additional notes, summaries, and revision points can be updated through the Admin Panel.
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Bottom Action Footer */}
          <div className="p-3.5 sm:p-5 border-t border-inherit flex flex-col sm:flex-row items-center justify-between gap-3 bg-black/20 shrink-0">
            <div className="flex items-center gap-2 text-xs text-slate-400">
              <span className="text-emerald-400 font-bold">●</span>
              <span>Theory Content Verified for {activeApp.name}</span>
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              {topic.hasPractice !== false && onStartPractice && (
                <button
                  onClick={() => {
                    onClose();
                    onStartPractice();
                  }}
                  className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 text-white text-xs font-black flex items-center justify-center gap-2 shadow-lg shadow-amber-900/40 transition-all cursor-pointer active:scale-95"
                >
                  <Zap className="h-4 w-4" /> Jump to Practice MCQs
                </button>
              )}

              <button
                onClick={onClose}
                className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold transition-all cursor-pointer"
              >
                Done Reading
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
