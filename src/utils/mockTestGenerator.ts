import { Question, CurrentAffairsItem, MockTestConfig, MockTestSubjectConfig, AppConfig } from '../types';

export interface QuestionPoolResult {
  availableQuestions: Question[];
  totalAvailable: number;
  breakdown: Record<string, number>;
}

/**
 * Filter questions based on app, language, and subject/unit/topic criteria
 */
export function getFilteredQuestionBank(
  allQuestions: Question[],
  appId: string,
  selectedLanguage?: string
): Question[] {
  return (allQuestions || []).filter(q => {
    if (!q || !q.id || !q.questionText) return false;
    // App isolation check
    if (q.appId && q.appId !== appId && q.appId !== 'all') return false;
    // Language check (if question language specified)
    if (selectedLanguage && q.language && q.language !== selectedLanguage && selectedLanguage !== 'en') {
      // Allow fallback if question has no language specified
      if (q.language && q.language !== 'en' && q.language !== selectedLanguage) return false;
    }
    return true;
  });
}

/**
 * Calculate available question counts for subjects, units, topics, and current affairs
 */
export function calculateAvailableQuestionPool(
  allQuestions: Question[],
  allCa: CurrentAffairsItem[],
  appId: string,
  config: Partial<MockTestConfig>,
  selectedLanguage?: string
): QuestionPoolResult {
  const bank = getFilteredQuestionBank(allQuestions, appId, selectedLanguage);
  const breakdown: Record<string, number> = {};
  const matchingQuestionIds = new Set<string>();

  // 1. Check Subject/Unit/Topic selections
  if (config.subjects && config.subjects.length > 0) {
    config.subjects.forEach(subjConfig => {
      const sId = subjConfig.subjectId;
      const uIds = new Set(subjConfig.unitIds || []);
      const tIds = new Set(subjConfig.topicIds || []);

      const matched = bank.filter(q => {
        // Subject match
        const subjectMatch = q.subjectId === sId;
        if (!subjectMatch) return false;

        // If specific units selected, enforce unit match
        if (uIds.size > 0 && q.unitId && !uIds.has(q.unitId)) {
          return false;
        }

        // If specific topics selected, enforce topic match
        if (tIds.size > 0 && q.topicId && !tIds.has(q.topicId)) {
          return false;
        }

        // Difficulty filter if specified
        if (config.difficulty && config.difficulty !== 'mixed') {
          // If question has difficulty level tag
          if ((q as any).difficulty && (q as any).difficulty !== config.difficulty) {
            return false;
          }
        }

        // Stage filter if specified
        if (config.stage && config.stage !== 'both' && q.category) {
          if (q.category !== 'both' && q.category !== config.stage) {
            return false;
          }
        }

        return true;
      });

      breakdown[sId] = matched.length;
      matched.forEach(q => matchingQuestionIds.add(q.id));
    });
  } else {
    // General full bank match
    bank.forEach(q => {
      if (config.stage && config.stage !== 'both' && q.category) {
        if (q.category !== 'both' && q.category !== config.stage) return;
      }
      matchingQuestionIds.add(q.id);
    });
    breakdown['all'] = bank.length;
  }

  // 2. Check Monthly Current Affairs
  if (config.caConfig && config.caConfig.months && config.caConfig.months.length > 0) {
    config.caConfig.months.forEach(m => {
      const caItems = (allCa || []).filter(c => {
        if (!c) return false;
        const appMatch = !c.appIds || c.appIds.includes(appId) || c.appIds.includes('all');
        const monthMatch = c.month === m || c.publishedDate?.includes(m);
        return appMatch && monthMatch && c.status !== 'disabled' && c.status !== 'draft';
      });
      breakdown[`ca-${m}`] = caItems.length * 2; // Each CA item can yield ~2 high yield questions
    });
  }

  const matchingQuestions = bank.filter(q => matchingQuestionIds.has(q.id));

  return {
    availableQuestions: matchingQuestions,
    totalAvailable: matchingQuestions.length,
    breakdown
  };
}

/**
 * Fisher-Yates array shuffle helper
 */
export function shuffleArray<T>(array: T[]): T[] {
  const result = [...array];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

/**
 * Convert Current Affairs items into high-yield mock test questions
 */
export function convertCaToQuestions(
  caItems: CurrentAffairsItem[],
  appId: string,
  targetCount: number
): Question[] {
  const generated: Question[] = [];
  const shuffledCa = shuffleArray(caItems);

  for (let i = 0; i < shuffledCa.length && generated.length < targetCount; i++) {
    const item = shuffledCa[i];
    if (!item.title || !item.content) continue;

    // Create a structured question from the CA title & summary/content
    const qText = `[Current Affairs - ${item.month || 'Recent'}] Which of the following statements regarding "${item.title}" is correct?`;
    
    // Generate distractors based on content snippet
    const optionA = `It pertains to ${item.summary?.substring(0, 80) || item.title}.`;
    const optionB = `It was officially announced for international diplomacy only.`;
    const optionC = `It replaces all prior statutory guidelines without parliamentary enactment.`;
    const optionD = `None of the above statements are accurate.`;

    generated.push({
      id: `ca-q-${item.id}-${i}`,
      appId: appId,
      subjectId: 'current-affairs',
      unitId: 'ca-unit-1',
      topicId: 'ca-topic-1',
      subtopic: item.category || 'National & State Current Affairs',
      questionText: qText,
      options: {
        A: optionA,
        B: optionB,
        C: optionC,
        D: optionD
      },
      correctOption: 'A',
      explanation: `**Exam Context (${item.publishedDate || item.month}):**\n${item.content}\n\nKey Takeaway: ${item.summary || item.title}`,
      category: 'prelims',
      language: item.language || 'en'
    });
  }

  return generated;
}

/**
 * Option shuffling helper: randomizes options A, B, C, D order without altering correct option answer
 */
export function shuffleQuestionOptions(question: Question): Question {
  if (!question.options || !question.correctOption) return question;

  const currentCorrectText = question.options[question.correctOption];
  const optionEntries = [
    question.options.A,
    question.options.B,
    question.options.C,
    question.options.D
  ].filter(Boolean);

  if (optionEntries.length < 4) return question;

  const shuffledTexts = shuffleArray(optionEntries);
  const keys: ('A' | 'B' | 'C' | 'D')[] = ['A', 'B', 'C', 'D'];
  
  let newCorrectOption: 'A' | 'B' | 'C' | 'D' = 'A';
  const newOptionsObj: { A: string; B: string; C: string; D: string } = {
    A: '',
    B: '',
    C: '',
    D: ''
  };

  keys.forEach((key, idx) => {
    newOptionsObj[key] = shuffledTexts[idx];
    if (shuffledTexts[idx] === currentCorrectText) {
      newCorrectOption = key;
    }
  });

  return {
    ...question,
    options: newOptionsObj,
    correctOption: newCorrectOption
  };
}

/**
 * Intelligent Question Selection Core Algorithm
 */
export function generateMockTestQuestions(
  allQuestions: Question[],
  allCa: CurrentAffairsItem[],
  appId: string,
  config: MockTestConfig,
  selectedLanguage?: string
): { questions: Question[]; actualCount: number; error?: string } {
  const bank = getFilteredQuestionBank(allQuestions, appId, selectedLanguage);
  const selectedQuestionIds = new Set<string>();
  const finalQuestions: Question[] = [];

  // Handle Current Affairs portion first if configured
  if (config.caConfig && config.caConfig.totalCaQuestions > 0 && config.caConfig.months.length > 0) {
    const targetCaCount = config.caConfig.totalCaQuestions;
    const matchingCaItems = (allCa || []).filter(c => {
      if (!c) return false;
      const monthMatch = config.caConfig?.months.includes(c.month) || 
                         config.caConfig?.months.some(m => c.publishedDate?.includes(m));
      return monthMatch && c.status !== 'disabled' && c.status !== 'draft';
    });

    const caQuestions = convertCaToQuestions(matchingCaItems, appId, targetCaCount);
    caQuestions.forEach(q => {
      selectedQuestionIds.add(q.id);
      finalQuestions.push(q);
    });
  }

  const remainingNeeded = config.questionCount - finalQuestions.length;

  if (remainingNeeded > 0) {
    if (config.sections && config.sections.length > 0) {
      config.sections.forEach(sec => {
        const sId = sec.subjectId;
        const uId = sec.unitId;
        const tId = sec.topicId;
        const targetCount = sec.questionCount || 10;

        const eligible = bank.filter(q => {
          if (selectedQuestionIds.has(q.id)) return false;
          if (sId && q.subjectId !== sId) return false;
          if (uId && q.unitId !== uId) return false;
          if (tId && q.topicId !== tId) return false;
          if (config.stage && config.stage !== 'both' && q.category) {
            if (q.category !== 'both' && q.category !== config.stage) return false;
          }
          return true;
        });

        const shuffled = shuffleArray(eligible);
        const picked = shuffled.slice(0, targetCount);

        picked.forEach(q => {
          selectedQuestionIds.add(q.id);
          finalQuestions.push(shuffleQuestionOptions(q));
        });
      });
    } else if (config.subjects && config.subjects.length > 0) {
      // Distribute remaining count among subjects according to subject configs or evenly
      config.subjects.forEach(subjConfig => {
        const sId = subjConfig.subjectId;
        const uIds = new Set(subjConfig.unitIds || []);
        const tIds = new Set(subjConfig.topicIds || []);

        const targetForSubject = subjConfig.questionCount > 0 
          ? subjConfig.questionCount 
          : Math.ceil(remainingNeeded / config.subjects!.length);

        const eligible = bank.filter(q => {
          if (selectedQuestionIds.has(q.id)) return false;
          if (q.subjectId !== sId) return false;
          if (uIds.size > 0 && q.unitId && !uIds.has(q.unitId)) return false;
          if (tIds.size > 0 && q.topicId && !tIds.has(q.topicId)) return false;
          if (config.stage && config.stage !== 'both' && q.category) {
            if (q.category !== 'both' && q.category !== config.stage) return false;
          }
          return true;
        });

        const shuffled = shuffleArray(eligible);
        const picked = shuffled.slice(0, targetForSubject);

        picked.forEach(q => {
          selectedQuestionIds.add(q.id);
          finalQuestions.push(shuffleQuestionOptions(q));
        });
      });
    } else {
      // Full length or unrestricted picking from entire bank
      const eligible = bank.filter(q => {
        if (selectedQuestionIds.has(q.id)) return false;
        if (config.stage && config.stage !== 'both' && q.category) {
          if (q.category !== 'both' && q.category !== config.stage) return false;
        }
        return true;
      });

      const shuffled = shuffleArray(eligible);
      const picked = shuffled.slice(0, remainingNeeded);

      picked.forEach(q => {
        selectedQuestionIds.add(q.id);
        finalQuestions.push(shuffleQuestionOptions(q));
      });
    }
  }

  // Final check for requested count
  if (finalQuestions.length < config.questionCount) {
    return {
      questions: shuffleArray(finalQuestions),
      actualCount: finalQuestions.length,
      error: `Only ${finalQuestions.length} matching questions were found in the question bank for this configuration (requested: ${config.questionCount}). Please reduce the question count or expand selected subjects/units/topics.`
    };
  }

  return {
    questions: shuffleArray(finalQuestions).slice(0, config.questionCount),
    actualCount: config.questionCount
  };
}

/**
 * Validate configuration numbers, total marks, and duration
 */
export function validateTestConfiguration(config: Partial<MockTestConfig>): {
  isValid: boolean;
  errors: string[];
  suggestedTotalMarks?: number;
} {
  const errors: string[] = [];
  const qCount = config.questionCount || 0;
  const pMarks = config.positiveMarks || 0;
  const nMarks = config.negativeMarks || 0;
  const tMarks = config.totalMarks || 0;
  const duration = config.durationMinutes || 0;

  if (qCount <= 0) {
    errors.push('Total questions must be greater than 0.');
  }

  if (duration <= 0) {
    errors.push('Exam duration must be at least 1 minute.');
  }

  if (pMarks <= 0) {
    errors.push('Positive marks per question must be greater than 0.');
  }

  if (nMarks < 0) {
    errors.push('Negative marks cannot be a negative value.');
  }

  const expectedMarks = qCount * pMarks;
  if (tMarks > 0 && Math.abs(expectedMarks - tMarks) > 0.01) {
    errors.push(
      `Total marks mismatch: ${qCount} questions × ${pMarks} marks/question = ${expectedMarks} total marks, but custom total marks is set to ${tMarks}.`
    );
  }

  return {
    isValid: errors.length === 0,
    errors,
    suggestedTotalMarks: expectedMarks
  };
}
