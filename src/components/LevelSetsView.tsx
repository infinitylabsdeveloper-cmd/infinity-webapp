import React, { useMemo } from 'react';
import { AppConfig, Question } from '../types';
import { Layers, CheckCircle2, PlayCircle } from 'lucide-react';
import { motion } from 'motion/react';

interface LevelSetsViewProps {
  activeApp: AppConfig;
  subjectId: string;
  unitId?: string;
  topicId?: string;
  questions: Question[];
  onSelectSet: (setId: number, setName: string, qList: Question[]) => void;
  title: string;
  subtitle: string;
}

const SET_THEMES = [
  {
    bg: 'bg-[#FFF1CC]',
    border: 'border-amber-300 hover:border-amber-400',
    iconBg: 'bg-white text-indigo-600 border-amber-200',
    btnBg: 'bg-indigo-600 hover:bg-indigo-500',
  },
  {
    bg: 'bg-[#D8F7F5]',
    border: 'border-teal-300 hover:border-teal-400',
    iconBg: 'bg-white text-teal-600 border-teal-200',
    btnBg: 'bg-emerald-600 hover:bg-emerald-500',
  },
  {
    bg: 'bg-[#EDE7FF]',
    border: 'border-violet-300 hover:border-violet-400',
    iconBg: 'bg-white text-violet-600 border-violet-200',
    btnBg: 'bg-violet-600 hover:bg-violet-500',
  },
  {
    bg: 'bg-[#FFE0EA]',
    border: 'border-pink-300 hover:border-pink-400',
    iconBg: 'bg-white text-rose-600 border-pink-200',
    btnBg: 'bg-rose-600 hover:bg-rose-500',
  },
];

const QUESTIONS_PER_SET = 10;

export default function LevelSetsView({
  activeApp,
  subjectId,
  unitId = '',
  topicId = '',
  questions,
  onSelectSet,
  title,
  subtitle
}: LevelSetsViewProps) {
  
  const relevantQuestions = useMemo(() => {
    return (questions || []).filter(q => 
      q && 
      q.appId === activeApp?.id && 
      q.subjectId === subjectId &&
      (unitId ? q.unitId === unitId : (!q.unitId || q.unitId === '')) &&
      (topicId ? q.topicId === topicId : (!q.topicId || q.topicId === ''))
    );
  }, [questions, activeApp?.id, subjectId, unitId, topicId]);

  const sets = useMemo(() => {
    const result = [];
    
    // Group by setName
    const groupedBySetName: Record<string, Question[]> = {};
    const questionsWithoutSetName: Question[] = [];

    relevantQuestions.forEach(q => {
      if (q.setName) {
        if (!groupedBySetName[q.setName]) groupedBySetName[q.setName] = [];
        groupedBySetName[q.setName].push(q);
      } else {
        questionsWithoutSetName.push(q);
      }
    });

    let currentSetId = 1;

    // First, process named sets
    Object.keys(groupedBySetName).sort().forEach(setName => {
      const subset = groupedBySetName[setName];
      const theme = SET_THEMES[(currentSetId - 1) % SET_THEMES.length];
      
      const setCompletedKey = `completed_set_${activeApp?.id}_${subjectId}_${unitId}_${topicId}_setName_${setName}`;
      const isCompleted = localStorage.getItem(setCompletedKey) === 'true';
      
      result.push({
        id: currentSetId++,
        name: setName,
        range: `${subset.length} Questions`,
        questions: subset,
        isCompleted,
        theme
      });
    });

    // Then, chunk questions without a set name
    const totalQNoName = questionsWithoutSetName.length;
    const numSetsNoName = Math.ceil(totalQNoName / QUESTIONS_PER_SET);

    for (let i = 0; i < numSetsNoName; i++) {
      const start = i * QUESTIONS_PER_SET;
      const end = Math.min(start + QUESTIONS_PER_SET, totalQNoName);
      const subset = questionsWithoutSetName.slice(start, end);
      const setNumber = currentSetId++;
      const theme = SET_THEMES[(setNumber - 1) % SET_THEMES.length];
      
      // Check completion
      const setCompletedKey = `completed_set_${activeApp?.id}_${subjectId}_${unitId}_${topicId}_set_${setNumber}`;
      const isCompleted = localStorage.getItem(setCompletedKey) === 'true';
      
      result.push({
        id: setNumber,
        name: `Set ${setNumber}`,
        range: `Q ${start + 1} - ${end}`,
        questions: subset,
        isCompleted,
        theme
      });
    }
    return result;
  }, [relevantQuestions, activeApp?.id, subjectId, unitId, topicId]);

  if (relevantQuestions.length === 0) return null;

  return (
    <div className="space-y-4 pt-4">
      <div className="flex items-center gap-3 px-2">
        <div className="h-10 w-10 rounded-2xl bg-[#FFF1CC] border border-amber-300 flex items-center justify-center text-amber-700 shadow-2xs">
          <Layers className="h-5 w-5" />
        </div>
        <div>
          <h3 className="text-lg font-black text-[#1E1B4B]">{title}</h3>
          <p className="text-xs font-medium text-slate-600">{subtitle}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 px-2 pb-8">
        {sets.map((set) => (
          <motion.div
            key={set.id}
            whileHover={{ y: -2 }}
            className={`relative group overflow-hidden rounded-2xl ${set.theme.bg} border-2 ${set.theme.border} p-4 transition-all shadow-sm`}
          >
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-3 min-w-0">
                <div className={`h-10 w-10 rounded-xl ${set.theme.iconBg} border flex items-center justify-center shrink-0 shadow-2xs`}>
                  {set.isCompleted ? <CheckCircle2 className="h-5 w-5 text-emerald-600" /> : <PlayCircle className="h-5 w-5" />}
                </div>
                <div className="min-w-0">
                  <div className="text-sm font-black text-[#1E1B4B] flex items-center gap-2 truncate">
                    <span className="truncate">{set.name}</span>
                    {set.isCompleted && <span className="text-[10px] px-1.5 py-0.5 bg-emerald-100 text-emerald-800 border border-emerald-300 rounded-md font-bold shrink-0">COMPLETED</span>}
                  </div>
                  <div className="text-[10px] font-bold text-slate-600 uppercase tracking-widest">{set.range} • {set.questions.length} MCQs</div>
                </div>
              </div>
              
              <button
                onClick={() => onSelectSet(set.id, set.name, set.questions)}
                className={`px-4 py-2 rounded-xl text-xs font-black text-white transition-all shadow-md ${set.theme.btnBg} active:scale-95 shrink-0 cursor-pointer`}
              >
                Practice
              </button>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
