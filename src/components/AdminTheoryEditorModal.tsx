import React, { useState } from 'react';
import { Topic, TopicTheoryTable } from '../types';
import { 
  X, BookOpen, Layers, CheckCircle2, 
  Save, Eye, Edit3, Plus, Trash2, 
  Table as TableIcon, Sparkles, Check, 
  HelpCircle, AlertCircle, ArrowRight
} from 'lucide-react';
import { 
  SAMPLE_THEORY_TABLE_CONSTITUTION, 
  SAMPLE_THEORY_TABLE_AP_REORGANISATION, 
  SAMPLE_THEORY_TABLE_FIVE_YEAR_PLANS 
} from '../lib/allIndiaExamRegistry';

interface AdminTheoryEditorModalProps {
  isOpen: boolean;
  onClose: () => void;
  subjectName: string;
  unitName: string;
  topic: Topic;
  onSave: (updatedTopicFields: Partial<Topic>) => void;
}

export default function AdminTheoryEditorModal({
  isOpen,
  onClose,
  subjectName,
  unitName,
  topic,
  onSave
}: AdminTheoryEditorModalProps) {
  const [activeTab, setActiveTab] = useState<'editor' | 'preview'>('editor');
  
  // Options State
  const [hasTheory, setHasTheory] = useState<boolean>(topic.hasTheory === true || !!topic.theoryContent);
  const [hasPractice, setHasPractice] = useState<boolean>(topic.hasPractice !== false);
  
  // Content State
  const [theoryTitle, setTheoryTitle] = useState<string>(topic.theoryTitle || topic.name || '');
  const [theorySummary, setTheorySummary] = useState<string>(topic.theorySummary || '');
  const [theoryContent, setTheoryContent] = useState<string>(topic.theoryContent || '');
  const [keyTakeawaysText, setKeyTakeawaysText] = useState<string>(
    topic.keyTakeaways ? topic.keyTakeaways.join('\n') : ''
  );
  const [theoryTables, setTheoryTables] = useState<TopicTheoryTable[]>(topic.theoryTables || []);

  // Table Generator Modal State
  const [isAddingTable, setIsAddingTable] = useState<boolean>(false);
  const [newTableTitle, setNewTableTitle] = useState<string>('');
  const [newTableHeaders, setNewTableHeaders] = useState<string>('Article / Topic, Key Statutory Provision, Examination Significance');
  const [newTableRows, setNewTableRows] = useState<string>(
    'Article 14 - 18, Right to Equality, Prohibits discrimination and ensures equal opportunity\nArticle 21, Right to Life and Personal Liberty, Expanded to include right to privacy and livelihood\nArticle 32, Right to Constitutional Remedies, Writs: Habeas Corpus, Mandamus, Certiorari'
  );

  if (!isOpen) return null;

  // Insert formatting helper
  const insertFormatting = (prefix: string, suffix: string = '', defaultText: string = 'text') => {
    setTheoryContent(prev => {
      return prev ? `${prev}\n\n${prefix}${defaultText}${suffix}` : `${prefix}${defaultText}${suffix}`;
    });
  };

  // Add Table to topic
  const handleAddCustomTable = (e: React.FormEvent) => {
    e.preventDefault();
    const headers = newTableHeaders.split(',').map(h => h.trim()).filter(Boolean);
    if (headers.length === 0) {
      alert('Please provide at least 1 column header.');
      return;
    }

    const rows = newTableRows
      .split('\n')
      .map(r => r.split(',').map(c => c.trim()))
      .filter(r => r.length > 0 && r.some(c => c !== ''));

    const newTbl: TopicTheoryTable = {
      title: newTableTitle.trim() || undefined,
      headers,
      rows
    };

    setTheoryTables(prev => [...prev, newTbl]);
    setIsAddingTable(false);
    setNewTableTitle('');
  };

  // Remove Table
  const handleRemoveTable = (index: number) => {
    setTheoryTables(prev => prev.filter((_, i) => i !== index));
  };

  // Pre-built Exam Templates loader
  const handleLoadTemplate = (type: 'constitution' | 'reorganisation' | 'economy') => {
    if (type === 'constitution') {
      setTheoryTables(prev => [...prev, SAMPLE_THEORY_TABLE_CONSTITUTION]);
      setTheoryContent(prev => 
        (prev ? `${prev}\n\n` : '') + 
        `### Constitutional Governance & Articles Overview\n\nThe Constitution of India is the supreme law of the land. Key fundamental rights (Articles 12-35) and Directive Principles (Articles 36-51) form the bedrock of civil services examination questions.\n\n* **Supremacy of Constitution:** Enforced through judicial review under Article 13.\n* **Basic Structure Doctrine:** Established in Kesavananda Bharati case (1973).`
      );
    } else if (type === 'reorganisation') {
      setTheoryTables(prev => [...prev, SAMPLE_THEORY_TABLE_AP_REORGANISATION]);
      setTheoryContent(prev => 
        (prev ? `${prev}\n\n` : '') + 
        `### Andhra Pradesh Reorganisation Act, 2014 Analysis\n\nThe statutory provisions of the AP Reorganisation Act 2014 cover key commitments regarding the Polavaram irrigation project (Section 90), industrial incentives, and tax concessions for backward regions.`
      );
    } else if (type === 'economy') {
      setTheoryTables(prev => [...prev, SAMPLE_THEORY_TABLE_FIVE_YEAR_PLANS]);
      setTheoryContent(prev => 
        (prev ? `${prev}\n\n` : '') + 
        `### Indian Economic Planning: From Planning Commission to NITI Aayog\n\nIndian economic development transitioned from centralized five-year plans to cooperative federalism and think-tank advisory mechanisms under NITI Aayog.`
      );
    }
  };

  // Save handler
  const handleSave = () => {
    const takeaways = keyTakeawaysText
      .split('\n')
      .map(s => s.trim().replace(/^[•*-]\s*/, ''))
      .filter(Boolean);

    onSave({
      hasTheory,
      hasPractice,
      theoryTitle: theoryTitle.trim() || undefined,
      theorySummary: theorySummary.trim() || undefined,
      theoryContent: theoryContent.trim() || undefined,
      theoryTables: theoryTables.length > 0 ? theoryTables : undefined,
      keyTakeaways: takeaways.length > 0 ? takeaways : undefined
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-950/85 backdrop-blur-md overflow-y-auto font-sans">
      <div className="w-full max-w-4xl max-h-[92vh] flex flex-col bg-white rounded-3xl border border-slate-200 shadow-2xl overflow-hidden">
        {/* Header Bar */}
        <div className="p-4 sm:p-6 border-b border-slate-100 flex items-center justify-between gap-4 bg-slate-50/70 shrink-0">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-1.5 rounded-lg bg-amber-500 text-white font-black text-xs shadow-xs">
                📖 THEORY & PRACTICE
              </span>
              <h3 className="text-base sm:text-lg font-black text-slate-900 tracking-tight">
                Topic Options & Theory Notes Editor
              </h3>
            </div>
            <p className="text-xs text-slate-500 mt-0.5 truncate max-w-xl">
              {subjectName} / {unitName} / <strong className="text-slate-700 font-bold">{topic.name}</strong>
            </p>
          </div>

          <div className="flex items-center gap-2">
            {/* View Switcher: Editor / Preview */}
            <div className="flex items-center bg-slate-200 p-1 rounded-xl text-xs font-bold">
              <button
                type="button"
                onClick={() => setActiveTab('editor')}
                className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 cursor-pointer ${
                  activeTab === 'editor' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Edit3 className="h-3.5 w-3.5" /> Editor
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('preview')}
                className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 cursor-pointer ${
                  activeTab === 'preview' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Eye className="h-3.5 w-3.5" /> Preview
              </button>
            </div>

            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-slate-600 rounded-xl hover:bg-slate-200 transition-colors cursor-pointer"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-8 space-y-6">
          {/* 1. Admin Options Control: Enable Theory & Enable Practice */}
          <div className="bg-slate-50 p-4 sm:p-5 rounded-2xl border border-slate-200 space-y-4">
            <h4 className="text-xs font-black uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
              <span>⚡ Topic Mode Configuration (Admin Controlled)</span>
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Option 1: Theory Notes */}
              <div className={`p-4 rounded-xl border-2 transition-all flex items-center justify-between gap-3 ${
                hasTheory ? 'bg-amber-50/60 border-amber-400 shadow-xs' : 'bg-white border-slate-200 opacity-75'
              }`}>
                <div className="space-y-0.5">
                  <div className="flex items-center gap-1.5">
                    <BookOpen className="h-4 w-4 text-amber-600" />
                    <span className="text-xs sm:text-sm font-black text-slate-900">Enable Theory Notes</span>
                  </div>
                  <p className="text-[11px] text-slate-500">
                    Show rich study notes, descriptions, and data tables on topic card
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setHasTheory(!hasTheory)}
                  className={`w-12 h-6 flex items-center rounded-full p-1 cursor-pointer transition-colors duration-200 ${
                    hasTheory ? 'bg-amber-500 justify-end' : 'bg-slate-300 justify-start'
                  }`}
                >
                  <div className="bg-white w-4 h-4 rounded-full shadow-md" />
                </button>
              </div>

              {/* Option 2: Practice MCQs */}
              <div className={`p-4 rounded-xl border-2 transition-all flex items-center justify-between gap-3 ${
                hasPractice ? 'bg-emerald-50/60 border-emerald-400 shadow-xs' : 'bg-white border-slate-200 opacity-75'
              }`}>
                <div className="space-y-0.5">
                  <div className="flex items-center gap-1.5">
                    <Layers className="h-4 w-4 text-emerald-600" />
                    <span className="text-xs sm:text-sm font-black text-slate-900">Enable Practice MCQs</span>
                  </div>
                  <p className="text-[11px] text-slate-500">
                    Enable 10-MCQ sequential practice sets and topic drills
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setHasPractice(!hasPractice)}
                  className={`w-12 h-6 flex items-center rounded-full p-1 cursor-pointer transition-colors duration-200 ${
                    hasPractice ? 'bg-emerald-500 justify-end' : 'bg-slate-300 justify-start'
                  }`}
                >
                  <div className="bg-white w-4 h-4 rounded-full shadow-md" />
                </button>
              </div>
            </div>

            {/* Mode Explanation Notice */}
            <div className="text-[11px] font-bold text-slate-600 bg-white p-3 rounded-xl border border-slate-200 flex items-center gap-2">
              <span className="text-amber-500 text-sm">💡</span>
              <span>
                {hasTheory && hasPractice 
                  ? 'Aspirants will see BOTH buttons on the topic card: "📖 Theory Notes" and "⚡ Practice MCQs".'
                  : hasTheory
                  ? 'Aspirants will see a single dedicated "📖 Study Theory Notes" button (Ideal for Mains / Subjective descriptive study).'
                  : hasPractice
                  ? 'Aspirants will see a single "⚡ Practice MCQs" button (Pure objective MCQ practice mode).'
                  : 'Neither is enabled. Please enable at least one option.'}
              </span>
            </div>
          </div>

          {activeTab === 'editor' ? (
            /* EDITOR MODE */
            <div className="space-y-6">
              {/* Theory Title & Summary */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="block text-[11px] font-black text-slate-500 uppercase tracking-wider">
                    Theory / Study Notes Title
                  </label>
                  <input
                    type="text"
                    value={theoryTitle}
                    onChange={(e) => setTheoryTitle(e.target.value)}
                    placeholder="e.g. Comprehensive Study Guide: Ancient Dynasties of Andhra Pradesh"
                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-bold text-slate-900 focus:ring-2 focus:ring-amber-500 outline-none"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block text-[11px] font-black text-slate-500 uppercase tracking-wider">
                    Quick Focus Summary (1-2 Sentences)
                  </label>
                  <input
                    type="text"
                    value={theorySummary}
                    onChange={(e) => setTheorySummary(e.target.value)}
                    placeholder="e.g. High-yield analytical notes covering political history, architecture, and administration..."
                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-medium text-slate-900 focus:ring-2 focus:ring-amber-500 outline-none"
                  />
                </div>
              </div>

              {/* Key Takeaways (Bullet Memory Hooks) */}
              <div className="space-y-1.5">
                <label className="block text-[11px] font-black text-slate-500 uppercase tracking-wider flex items-center justify-between">
                  <span>Key Examination Takeaways (1 bullet per line)</span>
                  <span className="text-slate-400 font-normal">Shown as checkmarked cards in student reader</span>
                </label>
                <textarea
                  rows={3}
                  value={keyTakeawaysText}
                  onChange={(e) => setKeyTakeawaysText(e.target.value)}
                  placeholder="Satavahanas introduced land grants with fiscal immunities (Brahmadeya).&#10;Amaravati school utilized dynamic white marble relief panels.&#10;Kakatiyas created the Deccan tank-irrigation network (Ramappa & Pakhal)."
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:ring-2 focus:ring-amber-500 outline-none font-mono"
                />
              </div>

              {/* Rich Text Toolbar & Content Area */}
              <div className="space-y-2">
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200 pb-2">
                  <label className="text-[11px] font-black text-slate-500 uppercase tracking-wider">
                    Theory Notes Body (Supports Markdown, Headings & Bold)
                  </label>

                  {/* Formatting Buttons */}
                  <div className="flex items-center gap-1 flex-wrap">
                    <button
                      type="button"
                      onClick={() => insertFormatting('**', '**', 'bold text')}
                      className="px-2 py-1 rounded bg-slate-100 hover:bg-slate-200 text-xs font-black cursor-pointer"
                      title="Bold text"
                    >
                      B
                    </button>
                    <button
                      type="button"
                      onClick={() => insertFormatting('*', '*', 'italic text')}
                      className="px-2 py-1 rounded bg-slate-100 hover:bg-slate-200 text-xs italic font-bold cursor-pointer"
                      title="Italic text"
                    >
                      I
                    </button>
                    <button
                      type="button"
                      onClick={() => insertFormatting('### ', '', 'Heading 3 Title')}
                      className="px-2 py-1 rounded bg-slate-100 hover:bg-slate-200 text-xs font-black cursor-pointer"
                      title="H3 Heading"
                    >
                      H3
                    </button>
                    <button
                      type="button"
                      onClick={() => insertFormatting('#### ', '', 'Heading 4 Subtitle')}
                      className="px-2 py-1 rounded bg-slate-100 hover:bg-slate-200 text-xs font-black cursor-pointer"
                      title="H4 Subheading"
                    >
                      H4
                    </button>
                    <button
                      type="button"
                      onClick={() => insertFormatting('* ', '', 'Bullet list item')}
                      className="px-2 py-1 rounded bg-slate-100 hover:bg-slate-200 text-xs font-bold cursor-pointer"
                      title="Bullet list"
                    >
                      • List
                    </button>
                    <button
                      type="button"
                      onClick={() => insertFormatting('> 💡 **Exam Alert:** ', '', 'Key point tested in APPSC / UPSC Prelims')}
                      className="px-2 py-1 rounded bg-amber-100 hover:bg-amber-200 text-amber-900 text-xs font-bold cursor-pointer"
                      title="Exam Alert Callout"
                    >
                      💡 Alert Box
                    </button>
                  </div>
                </div>

                <textarea
                  rows={9}
                  value={theoryContent}
                  onChange={(e) => setTheoryContent(e.target.value)}
                  placeholder="### Main Concepts & Historical Context&#10;&#10;Detailed explanation of the topic, historical milestones, constitutional provisions, administrative mechanisms, and analytical frameworks...&#10;&#10;#### Key Historical Figures & Contributions&#10;* **Ruler Name:** Specific contributions and inscriptions.&#10;* **Economic Factor:** Trade routes and agrarian systems."
                  className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl text-xs sm:text-sm font-medium text-slate-900 focus:ring-2 focus:ring-amber-500 outline-none leading-relaxed font-mono"
                />
              </div>

              {/* Pre-built Templates Quick Loader */}
              <div className="bg-amber-50/60 p-4 rounded-2xl border border-amber-200 flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-amber-600 shrink-0" />
                  <span className="text-xs font-bold text-amber-950">Quick-Load Verified Exam Capsules:</span>
                </div>
                <div className="flex items-center gap-2 flex-wrap">
                  <button
                    type="button"
                    onClick={() => handleLoadTemplate('constitution')}
                    className="px-2.5 py-1 bg-white hover:bg-amber-100 border border-amber-300 text-amber-900 rounded-lg text-xs font-bold transition-all cursor-pointer shadow-xs"
                  >
                    + Constitution & Articles
                  </button>
                  <button
                    type="button"
                    onClick={() => handleLoadTemplate('reorganisation')}
                    className="px-2.5 py-1 bg-white hover:bg-amber-100 border border-amber-300 text-amber-900 rounded-lg text-xs font-bold transition-all cursor-pointer shadow-xs"
                  >
                    + AP Reorganisation Act
                  </button>
                  <button
                    type="button"
                    onClick={() => handleLoadTemplate('economy')}
                    className="px-2.5 py-1 bg-white hover:bg-amber-100 border border-amber-300 text-amber-900 rounded-lg text-xs font-bold transition-all cursor-pointer shadow-xs"
                  >
                    + Five Year Plans vs NITI
                  </button>
                </div>
              </div>

              {/* Structured Tables Section */}
              <div className="space-y-4 pt-2">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-xs font-black uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                      <TableIcon className="h-4 w-4 text-indigo-600" />
                      <span>Structured Data & Comparison Tables ({theoryTables.length})</span>
                    </h4>
                    <p className="text-[11px] text-slate-500">
                      Comparison tables, article lists, historical chronologies, and statistical charts
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => setIsAddingTable(true)}
                    className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-black flex items-center gap-1.5 transition-all cursor-pointer shadow-xs"
                  >
                    <Plus className="h-3.5 w-3.5" /> Add Table
                  </button>
                </div>

                {/* Table Builder Modal / Inline Panel */}
                {isAddingTable && (
                  <div className="p-4 bg-indigo-50/70 border border-indigo-200 rounded-2xl space-y-3 animate-in fade-in duration-150">
                    <div className="flex items-center justify-between">
                      <h5 className="text-xs font-black text-indigo-950 uppercase tracking-wider">
                        Create New Structured Table
                      </h5>
                      <button
                        type="button"
                        onClick={() => setIsAddingTable(false)}
                        className="text-xs text-slate-400 hover:text-slate-600 font-bold"
                      >
                        Cancel
                      </button>
                    </div>

                    <div className="space-y-3">
                      <div>
                        <label className="block text-[10px] font-bold text-indigo-900 uppercase mb-1">
                          Table Title
                        </label>
                        <input
                          type="text"
                          value={newTableTitle}
                          onChange={(e) => setNewTableTitle(e.target.value)}
                          placeholder="e.g. Major Dynasties, Inscriptions & Architecture"
                          className="w-full p-2.5 bg-white border border-indigo-200 rounded-xl text-xs font-bold text-slate-900 outline-none"
                        />
                      </div>

                      <div>
                        <label className="block text-[10px] font-bold text-indigo-900 uppercase mb-1">
                          Column Headers (Comma-separated)
                        </label>
                        <input
                          type="text"
                          value={newTableHeaders}
                          onChange={(e) => setNewTableHeaders(e.target.value)}
                          placeholder="Dynasty, Capital, Key Inscription, Architecture"
                          className="w-full p-2.5 bg-white border border-indigo-200 rounded-xl text-xs font-medium text-slate-900 outline-none"
                        />
                      </div>

                      <div>
                        <label className="block text-[10px] font-bold text-indigo-900 uppercase mb-1">
                          Table Rows (1 row per line, comma-separated columns)
                        </label>
                        <textarea
                          rows={4}
                          value={newTableRows}
                          onChange={(e) => setNewTableRows(e.target.value)}
                          placeholder="Satavahanas, Amaravati, Nasik Inscription, Amaravati Stupa&#10;Kakatiyas, Warangal, Motupalli Inscription, Ramappa Temple"
                          className="w-full p-2.5 bg-white border border-indigo-200 rounded-xl text-xs font-medium text-slate-900 outline-none font-mono"
                        />
                      </div>

                      <div className="flex justify-end gap-2 pt-1">
                        <button
                          type="button"
                          onClick={() => setIsAddingTable(false)}
                          className="px-3 py-1.5 text-slate-600 bg-white border border-slate-200 rounded-xl text-xs font-bold cursor-pointer"
                        >
                          Cancel
                        </button>
                        <button
                          type="button"
                          onClick={handleAddCustomTable}
                          className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-black shadow-xs cursor-pointer"
                        >
                          Save Table to Topic
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* Render Existing Tables */}
                {theoryTables.length === 0 ? (
                  <div className="p-4 bg-slate-50 rounded-xl border border-dashed border-slate-200 text-center text-xs text-slate-400">
                    No structured tables added yet. Click "+ Add Table" or load a verified exam capsule above.
                  </div>
                ) : (
                  <div className="space-y-3">
                    {theoryTables.map((tbl, idx) => (
                      <div key={idx} className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
                        <div className="flex items-center justify-between">
                          <h5 className="text-xs font-black text-slate-800">
                            📊 {tbl.title || `Table ${idx + 1}`} ({tbl.rows.length} Rows)
                          </h5>
                          <button
                            type="button"
                            onClick={() => handleRemoveTable(idx)}
                            className="text-rose-500 hover:text-rose-700 text-xs font-bold flex items-center gap-1 cursor-pointer"
                          >
                            <Trash2 className="h-3.5 w-3.5" /> Remove
                          </button>
                        </div>
                        <div className="text-[11px] text-slate-500 flex items-center gap-1 flex-wrap">
                          <span className="font-bold text-slate-700">Columns:</span> {tbl.headers.join(' | ')}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ) : (
            /* PREVIEW MODE (Simulates student reader) */
            <div className="p-6 bg-slate-950 text-white rounded-2xl border border-slate-800 space-y-6">
              <div className="space-y-2 border-b border-slate-800 pb-4">
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase bg-amber-500/20 text-amber-400 border border-amber-500/30">
                    Preview: Theory Reader
                  </span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase bg-indigo-500/20 text-indigo-300">
                    {hasPractice ? 'MCQs Enabled' : 'Theory Only'}
                  </span>
                </div>
                <h2 className="text-xl sm:text-2xl font-black text-white">{theoryTitle}</h2>
                {theorySummary && (
                  <p className="text-xs text-slate-300 italic p-3 rounded-xl bg-slate-900 border border-slate-800">
                    💡 {theorySummary}
                  </p>
                )}
              </div>

              {keyTakeawaysText && (
                <div className="space-y-2">
                  <h4 className="text-xs font-black uppercase tracking-wider text-amber-400">
                    High-Yield Exam Takeaways
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {keyTakeawaysText.split('\n').filter(Boolean).map((pt, pIdx) => (
                      <div key={pIdx} className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-200 flex items-start gap-2">
                        <span className="text-emerald-400 font-bold">✓</span>
                        <span>{pt.replace(/^[•*-]\s*/, '')}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {theoryTables.length > 0 && (
                <div className="space-y-3">
                  {theoryTables.map((tbl, idx) => (
                    <div key={idx} className="rounded-xl border border-slate-800 overflow-hidden bg-slate-900">
                      {tbl.title && (
                        <div className="p-2.5 bg-amber-500/10 border-b border-slate-800 text-xs font-bold text-amber-400">
                          {tbl.title}
                        </div>
                      )}
                      <table className="w-full text-left text-xs">
                        <thead>
                          <tr className="bg-white/5 border-b border-slate-800 text-slate-300 font-bold">
                            {tbl.headers.map((h, hIdx) => (
                              <th key={hIdx} className="p-2">{h}</th>
                            ))}
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800">
                          {tbl.rows.map((row, rIdx) => (
                            <tr key={rIdx}>
                              {row.map((cell, cIdx) => (
                                <td key={cIdx} className="p-2 text-slate-300">{cell}</td>
                              ))}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ))}
                </div>
              )}

              <div className="text-xs text-slate-300 leading-relaxed whitespace-pre-line pt-2">
                {theoryContent || 'No body content entered yet.'}
              </div>
            </div>
          )}
        </div>

        {/* Footer Bar */}
        <div className="p-4 sm:p-5 border-t border-slate-100 flex items-center justify-between gap-3 bg-slate-50/80 shrink-0">
          <div className="text-xs text-slate-500">
            Changes will be saved into <strong className="text-slate-800 font-bold">"{topic.name}"</strong> syllabus.
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 bg-white border border-slate-200 text-slate-700 hover:bg-slate-100 rounded-xl text-xs font-bold transition-all cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSave}
              className="px-5 py-2.5 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-black shadow-md transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <Save className="h-4 w-4" /> Save Topic Options & Theory
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
