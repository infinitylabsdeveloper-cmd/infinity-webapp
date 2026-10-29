/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Question } from '../types';

/**
 * Replaces any LaTeX or literal \times with standard multiplication symbol ×
 */
export function replaceTimesWithSymbol(str: string): string {
  if (!str) return '';
  return str.replace(/\\{1,2}times(?![a-zA-Z])/g, '×');
}

/**
 * Normalizes text for comparison (stripping whitespace, lowercasing, removing prefixes like 'A)', '1.', etc.)
 */
function cleanTextForComparison(str: string): string {
  if (!str) return '';
  return String(str)
    .toLowerCase()
    .replace(/^(\([a-d0-9]\)|[a-d0-9][\)\.\:\-]|option\s+[a-d0-9])/i, '')
    .replace(/[^\p{L}\p{N}]/gu, '') // Keep letters & numbers in any language (Telugu, English, etc.)
    .trim();
}

/**
 * Resolves the exact correct option ('A' | 'B' | 'C' | 'D') from any raw question format.
 */
export function resolveCorrectOption(
  rawQ: any,
  optionsObj: { A: string; B: string; C: string; D: string }
): 'A' | 'B' | 'C' | 'D' {
  if (!rawQ || typeof rawQ !== 'object') return 'A';

  // Check if options array was provided with an object having isCorrect/correct
  if (Array.isArray(rawQ.options)) {
    const idx = rawQ.options.findIndex((opt: any) => opt && typeof opt === 'object' && (opt.isCorrect || opt.correct || opt.isRight || opt.selected));
    if (idx === 0) return 'A';
    if (idx === 1) return 'B';
    if (idx === 2) return 'C';
    if (idx === 3) return 'D';
  }

  // Find any candidate raw answer value
  const candidates = [
    rawQ.correctOption,
    rawQ.correct_option,
    rawQ.correctOpt,
    rawQ.correct_opt,
    rawQ.correctAnswer,
    rawQ.correct_answer,
    rawQ.correct,
    rawQ.answer,
    rawQ.answerKey,
    rawQ.ans_key,
    rawQ.ans,
    rawQ.right,
    rawQ.rightOption,
    rawQ.right_option,
    rawQ.rightAnswer,
    rawQ.right_answer,
    rawQ.key,
    rawQ.solution,
    rawQ.correct_choice,
    rawQ.correctChoice,
  ];

  let rawAns: any = null;
  for (const c of candidates) {
    if (c !== undefined && c !== null && String(c).trim() !== '') {
      rawAns = c;
      break;
    }
  }

  if (rawAns === null || rawAns === undefined) {
    return 'A'; // Default fallback only when no answer field exists at all
  }

  // 1. If it's a number
  if (typeof rawAns === 'number') {
    if (rawAns === 1) return 'A';
    if (rawAns === 2) return 'B';
    if (rawAns === 3) return 'C';
    if (rawAns === 4) return 'D';
    if (rawAns === 0) return 'A';
  }

  const rawStr = String(rawAns).trim();
  const upperStr = rawStr.toUpperCase();

  // 2. Direct exact letter match (A, B, C, D)
  if (upperStr === 'A') return 'A';
  if (upperStr === 'B') return 'B';
  if (upperStr === 'C') return 'C';
  if (upperStr === 'D') return 'D';

  // 3. Direct number as string ("1", "2", "3", "4", "0")
  if (rawStr === '1' || upperStr === 'ONE' || upperStr === 'OPTION 1' || upperStr === 'OPTION1') return 'A';
  if (rawStr === '2' || upperStr === 'TWO' || upperStr === 'OPTION 2' || upperStr === 'OPTION2') return 'B';
  if (rawStr === '3' || upperStr === 'THREE' || upperStr === 'OPTION 3' || upperStr === 'OPTION3') return 'C';
  if (rawStr === '4' || upperStr === 'FOUR' || upperStr === 'OPTION 4' || upperStr === 'OPTION4') return 'D';
  if (rawStr === '0' || upperStr === 'ZERO') return 'A';

  // 4. Prefix pattern match: "A)", "(A)", "A.", "Option A", "Option (A)", "Ans: A", "Answer: A", etc.
  const prefixMatch = upperStr.match(/^(?:OPTION|ANS(?:WER)?|KEY|CHOICE)?\s*[\:\-\.\)]*\s*\(?\s*([A-D])\s*[\)\.\:\-]/i) 
    || upperStr.match(/^(?:OPTION|ANS(?:WER)?|KEY|CHOICE)\s*\(?\s*([A-D])\s*\)?$/i)
    || upperStr.match(/^\(?\s*([A-D])\s*\)?$/i);

  if (prefixMatch && prefixMatch[1]) {
    const letter = prefixMatch[1].toUpperCase();
    if (letter === 'A' || letter === 'B' || letter === 'C' || letter === 'D') {
      return letter;
    }
  }

  // 5. Full text match against options text
  const cleanAns = cleanTextForComparison(rawStr);
  const cleanA = cleanTextForComparison(optionsObj.A);
  const cleanB = cleanTextForComparison(optionsObj.B);
  const cleanC = cleanTextForComparison(optionsObj.C);
  const cleanD = cleanTextForComparison(optionsObj.D);

  if (cleanAns.length > 0) {
    // Exact text equality
    if (cleanAns === cleanA) return 'A';
    if (cleanAns === cleanB) return 'B';
    if (cleanAns === cleanC) return 'C';
    if (cleanAns === cleanD) return 'D';

    // Substring match if text is distinctive
    if (cleanAns.length >= 3) {
      if (cleanA.length >= 3 && (cleanA === cleanAns || cleanA.startsWith(cleanAns) || cleanAns.startsWith(cleanA))) return 'A';
      if (cleanB.length >= 3 && (cleanB === cleanAns || cleanB.startsWith(cleanAns) || cleanAns.startsWith(cleanB))) return 'B';
      if (cleanC.length >= 3 && (cleanC === cleanAns || cleanC.startsWith(cleanAns) || cleanAns.startsWith(cleanC))) return 'C';
      if (cleanD.length >= 3 && (cleanD === cleanAns || cleanD.startsWith(cleanAns) || cleanAns.startsWith(cleanD))) return 'D';
    }
  }

  // 6. Look for standalone [A], (A), ' A ', ' B ', ' C ', ' D ' anywhere in string
  if (/\bA\b|\(A\)|\[A\]/i.test(upperStr) && !/\b[BCD]\b/i.test(upperStr)) return 'A';
  if (/\bB\b|\(B\)|\[B\]/i.test(upperStr) && !/\b[ACD]\b/i.test(upperStr)) return 'B';
  if (/\bC\b|\(C\)|\[C\]/i.test(upperStr) && !/\b[ABD]\b/i.test(upperStr)) return 'C';
  if (/\bD\b|\(D\)|\[D\]/i.test(upperStr) && !/\b[ABC]\b/i.test(upperStr)) return 'D';

  // If first character is A, B, C, D followed by space or punctuation
  if (/^[A-D][\s\.\,\:\-\)]/i.test(upperStr)) {
    const firstChar = upperStr.charAt(0);
    if (firstChar === 'A' || firstChar === 'B' || firstChar === 'C' || firstChar === 'D') {
      return firstChar;
    }
  }

  // 7. If still unresolved or defaulted to 'A', cross-verify with explanation if present
  const exp = String(rawQ.explanation || rawQ.solution || rawQ.explain || '').trim().toLowerCase();
  if (exp.length > 5) {
    const cleanExp = exp.replace(/[^\p{L}\p{N}\s]/gu, ' ').replace(/\s+/g, ' ');
    const scores = { A: 0, B: 0, C: 0, D: 0 };
    for (const key of ['A', 'B', 'C', 'D'] as const) {
      const cOpt = cleanTextForComparison(optionsObj[key]);
      if (cOpt.length >= 3) {
        if (cleanExp.includes(cOpt)) {
          scores[key] += 100 + cOpt.length;
        }
      }
    }
    let bestKey: 'A' | 'B' | 'C' | 'D' = 'A';
    let maxScore = 0;
    for (const [k, sc] of Object.entries(scores)) {
      if (sc > maxScore) {
        maxScore = sc;
        bestKey = k as 'A' | 'B' | 'C' | 'D';
      }
    }
    if (maxScore > 50) {
      return bestKey;
    }
  }

  return 'A';
}

/**
 * Extracts and maps options { A, B, C, D } from any raw JSON structure
 */
export function extractOptions(q: any): { A: string; B: string; C: string; D: string } {
  if (!q || typeof q !== 'object') {
    return { A: 'Option A', B: 'Option B', C: 'Option C', D: 'Option D' };
  }

  let optA = '';
  let optB = '';
  let optC = '';
  let optD = '';

  // 1. Array format: q.options = ["Berlin", "Madrid", ...] OR q.choices = [...]
  const rawArray = Array.isArray(q.options) 
    ? q.options 
    : Array.isArray(q.choices) 
    ? q.choices 
    : Array.isArray(q.optionList)
    ? q.optionList
    : null;

  if (rawArray) {
    const getVal = (item: any) => {
      if (item === null || item === undefined) return '';
      if (typeof item === 'object') {
        return String(item.text || item.optionText || item.value || item.title || item.name || item.content || '').trim();
      }
      return String(item).trim();
    };

    optA = getVal(rawArray[0]);
    optB = getVal(rawArray[1]);
    optC = getVal(rawArray[2]);
    optD = getVal(rawArray[3]);
  } else if (q.options && typeof q.options === 'object') {
    // 2. Object format: q.options = { A: "...", B: "..." }
    const o = q.options;
    optA = String(o.A ?? o.a ?? o.optA ?? o.optionA ?? o.option_a ?? o['1'] ?? o[0] ?? '').trim();
    optB = String(o.B ?? o.b ?? o.optB ?? o.optionB ?? o.option_b ?? o['2'] ?? o[1] ?? '').trim();
    optC = String(o.C ?? o.c ?? o.optC ?? o.optionC ?? o.option_c ?? o['3'] ?? o[2] ?? '').trim();
    optD = String(o.D ?? o.d ?? o.optD ?? o.optionD ?? o.option_d ?? o['4'] ?? o[3] ?? '').trim();
  }

  // 3. Top-level keys fallback
  if (!optA) optA = String(q.optionA ?? q.optA ?? q.option_a ?? q.opt_a ?? q.a ?? q.A ?? q.op1 ?? q.choice1 ?? '').trim();
  if (!optB) optB = String(q.optionB ?? q.optB ?? q.option_b ?? q.opt_b ?? q.b ?? q.B ?? q.op2 ?? q.choice2 ?? '').trim();
  if (!optC) optC = String(q.optionC ?? q.optC ?? q.option_c ?? q.opt_c ?? q.c ?? q.C ?? q.op3 ?? q.choice3 ?? '').trim();
  if (!optD) optD = String(q.optionD ?? q.optD ?? q.option_d ?? q.opt_d ?? q.d ?? q.D ?? q.op4 ?? q.choice4 ?? '').trim();

  const cleanOptionText = (str: string) => {
    return replaceTimesWithSymbol(
      str.replace(/^(\([a-d0-9]\)|[a-d0-9][\)\.\:\-]\s*)/i, '').trim()
    );
  };

  const finalA = cleanOptionText(optA) || optA || 'Option A';
  const finalB = cleanOptionText(optB) || optB || 'Option B';
  const finalC = cleanOptionText(optC) || optC || 'Option C';
  const finalD = cleanOptionText(optD) || optD || 'Option D';

  return {
    A: finalA,
    B: finalB,
    C: finalC,
    D: finalD
  };
}

/**
 * Deduplicates options in a question.
 * Ensures each question has only unique answer options without duplicates.
 * If the correctOption pointed to a duplicate, it is remapped to the unique option's key.
 */
export function deduplicateQuestionOptions(
  optionsObj: { A: string; B: string; C: string; D: string },
  correctOption: 'A' | 'B' | 'C' | 'D'
): { options: { A: string; B: string; C: string; D: string }; correctOption: 'A' | 'B' | 'C' | 'D' } {
  if (!optionsObj) {
    return { options: { A: '', B: '', C: '', D: '' }, correctOption: 'A' };
  }

  const validKeys: ('A' | 'B' | 'C' | 'D')[] = ['A', 'B', 'C', 'D'];
  const uniqueEntries: { originalKeys: ('A' | 'B' | 'C' | 'D')[]; text: string; isCorrect: boolean }[] = [];

  for (const k of validKeys) {
    const rawVal = optionsObj[k];
    if (rawVal !== undefined && rawVal !== null && String(rawVal).trim() !== '') {
      const text = String(rawVal).trim();
      const norm = text.toLowerCase().replace(/\s+/g, ' ');

      const existing = uniqueEntries.find(e => e.text.toLowerCase().replace(/\s+/g, ' ') === norm);
      if (existing) {
        existing.originalKeys.push(k);
        if (k === correctOption) {
          existing.isCorrect = true;
        }
      } else {
        uniqueEntries.push({
          originalKeys: [k],
          text,
          isCorrect: (k === correctOption)
        });
      }
    }
  }

  const newOptions: { A: string; B: string; C: string; D: string } = {
    A: '',
    B: '',
    C: '',
    D: ''
  };

  let newCorrect: 'A' | 'B' | 'C' | 'D' = 'A';
  let foundCorrect = false;

  uniqueEntries.forEach((entry, idx) => {
    if (idx < validKeys.length) {
      const targetKey = validKeys[idx];
      newOptions[targetKey] = entry.text;
      if (entry.isCorrect) {
        newCorrect = targetKey;
        foundCorrect = true;
      }
    }
  });

  return {
    options: newOptions,
    correctOption: foundCorrect ? newCorrect : (uniqueEntries.length > 0 ? 'A' : correctOption)
  };
}

/**
 * Universal Question Normalizer for practice arena, test engine, and admin import.
 */
export function normalizeSingleQuestion(
  q: any,
  fallbackIndex: number = 0,
  fallbackTopic: string = '',
  fallbackSubtopic: string = ''
): Question {
  if (!q || typeof q !== 'object') {
    return {
      id: `q-fallback-${fallbackIndex}`,
      appId: 'default',
      subjectId: '',
      unitId: '',
      topicId: '',
      subtopic: fallbackSubtopic || 'Practice Concept',
      questionText: `Practice Question #${fallbackIndex + 1} for ${fallbackTopic || 'this topic'}`,
      options: {
        A: 'Option A',
        B: 'Option B',
        C: 'Option C',
        D: 'Option D'
      },
      correctOption: 'A',
      explanation: ''
    };
  }

  const rawOptionsObj = extractOptions(q);
  const rawCorrectOption = resolveCorrectOption(q, rawOptionsObj);
  const { options: optionsObj, correctOption } = deduplicateQuestionOptions(rawOptionsObj, rawCorrectOption);

  const qText = replaceTimesWithSymbol(String(
    q.questionText ?? 
    q.question ?? 
    q.text ?? 
    q.q ?? 
    q.title ?? 
    q.statement ?? 
    `Practice Question #${fallbackIndex + 1}`
  ).trim());

  const explanation = replaceTimesWithSymbol(String(
    q.explanation ?? 
    q.solution ?? 
    q.explain ?? 
    q.analysis ?? 
    q.detail ?? 
    q.description ?? 
    ''
  ).trim());

  return {
    id: String(q.id || `q-norm-${Date.now()}-${fallbackIndex}-${Math.random().toString(36).substring(2, 6)}`),
    appId: String(q.appId || ''),
    subjectId: String(q.subjectId || ''),
    category: q.category === 'mains' ? 'mains' : 'prelims',
    unitId: String(q.unitId || ''),
    topicId: String(q.topicId || ''),
    subtopic: String(q.subtopic || q.subTopic || q.sub_topic || q.Subtopic || q.subtopicName || fallbackSubtopic || '').trim(),
    setName: q.setName ? String(q.setName).trim() : (q.set_name ? String(q.set_name).trim() : (q.set && /^\d+$/.test(String(q.set).trim()) ? `Set ${String(q.set).trim()}` : undefined)),
    questionText: qText,
    options: optionsObj,
    correctOption: correctOption,
    explanation: explanation,
    importBatchId: q.importBatchId ? String(q.importBatchId) : undefined,
    importFileName: q.importFileName || q.sourceFileName ? String(q.importFileName || q.sourceFileName) : undefined
  };
}
