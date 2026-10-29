/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import {
  collection,
  doc,
  getDocs,
  setDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit
} from 'firebase/firestore';
import { db } from '../lib/firebase';
import {
  MockTest,
  MockTestConfig,
  MockTestAttempt,
  Question,
  CurrentAffairsItem,
  Subject,
  Unit,
  Topic
} from '../types';

const LOCAL_STORAGE_TESTS_KEY = 'app_custom_mock_tests_v2';
const LOCAL_STORAGE_ATTEMPTS_KEY = 'app_mock_attempts_v2';

/**
 * Intelligent Question Selection Engine
 */
export function countAvailableQuestions(
  config: Partial<MockTestConfig>,
  questions: Question[],
  currentAffairs: CurrentAffairsItem[],
  appId?: string
): { totalMcqCount: number; totalCaCount: number; subjectCounts: Record<string, number> } {
  // Filter questions by appId if specified
  let eligibleQuestions = questions.filter((q) => !appId || q.appId === appId || q.appId === 'all');

  // Stage filter if applicable
  if (config.stage && config.stage !== 'both') {
    eligibleQuestions = eligibleQuestions.filter(
      (q) => !q.category || q.category === 'both' || q.category === config.stage
    );
  }

  // Difficulty filter if specified and exists on question
  if (config.difficulty && config.difficulty !== 'mixed') {
    // If questions have difficulty property in future
  }

  const subjectCounts: Record<string, number> = {};

  if (config.subjects && config.subjects.length > 0) {
    let matchedQuestions: Question[] = [];

    config.subjects.forEach((subjConfig) => {
      let subjQuestions = eligibleQuestions.filter((q) => q.subjectId === subjConfig.subjectId);

      // Unit level filter
      if (subjConfig.unitIds && subjConfig.unitIds.length > 0) {
        subjQuestions = subjQuestions.filter((q) => subjConfig.unitIds?.includes(q.unitId));
      }

      // Topic level filter
      if (subjConfig.topicIds && subjConfig.topicIds.length > 0) {
        subjQuestions = subjQuestions.filter((q) => subjConfig.topicIds?.includes(q.topicId));
      }

      subjectCounts[subjConfig.subjectId] = subjQuestions.length;
      matchedQuestions = matchedQuestions.concat(subjQuestions);
    });

    // Deduplicate
    const uniqueIds = new Set(matchedQuestions.map((q) => q.id));
    eligibleQuestions = eligibleQuestions.filter((q) => uniqueIds.has(q.id));
  }

  // Current Affairs question estimation
  let eligibleCaCount = 0;
  if (config.caConfig?.months && config.caConfig.months.length > 0) {
    const selectedMonths = new Set(config.caConfig.months);
    const matchedCa = currentAffairs.filter((ca) => selectedMonths.has(ca.month));
    eligibleCaCount = matchedCa.length;
  }

  return {
    totalMcqCount: eligibleQuestions.length,
    totalCaCount: eligibleCaCount,
    subjectCounts
  };
}

/**
 * Generate Question Snapshot for a Mock Test based on user selection
 */
export function generateMockTestQuestions(
  config: MockTestConfig,
  questions: Question[],
  currentAffairs: CurrentAffairsItem[],
  appId?: string
): { selectedQuestions: Question[]; warning?: string } {
  let eligibleQuestions = questions.filter((q) => !appId || q.appId === appId || q.appId === 'all');

  // Stage filter
  if (config.stage && config.stage !== 'both') {
    eligibleQuestions = eligibleQuestions.filter(
      (q) => !q.category || q.category === 'both' || q.category === config.stage
    );
  }

  let finalQuestions: Question[] = [];
  let warningMessage: string | undefined;

  // Handle Current Affairs Test type
  if (config.testType === 'current_affairs') {
    if (config.caConfig?.months && config.caConfig.months.length > 0) {
      const selectedMonths = new Set(config.caConfig.months);
      const matchedCa = currentAffairs.filter((ca) => selectedMonths.has(ca.month));

      // Convert CA items into formatted Questions for testing
      const caAsQuestions: Question[] = matchedCa.map((ca, idx) => ({
        id: `ca_mcq_${ca.id}_${idx}`,
        appId: appId || ca.appIds?.[0] || 'all',
        subjectId: 'current_affairs',
        unitId: ca.month,
        topicId: ca.category || 'General',
        subtopic: ca.title,
        questionText: `${ca.title}\n\n${ca.summary}`,
        options: {
          A: 'Statement I is correct',
          B: 'Statement II is correct',
          C: 'Both Statement I and II are correct',
          D: 'Neither Statement I nor II is correct'
        },
        correctOption: 'C',
        explanation: `${ca.content || ca.summary}\n\nPublished: ${ca.publishedDate}`,
        category: 'prelims',
        language: ca.language || 'en'
      }));

      finalQuestions = shuffleArray(caAsQuestions).slice(0, config.questionCount);
    }
  } else {
    // Subject/Unit/Topic/Full length/Custom mixed selection
    let candidatePool: Question[] = [];

    if (config.subjects && config.subjects.length > 0) {
      config.subjects.forEach((subjConfig) => {
        let pool = eligibleQuestions.filter((q) => q.subjectId === subjConfig.subjectId);

        if (subjConfig.unitIds && subjConfig.unitIds.length > 0) {
          pool = pool.filter((q) => subjConfig.unitIds?.includes(q.unitId));
        }

        if (subjConfig.topicIds && subjConfig.topicIds.length > 0) {
          pool = pool.filter((q) => subjConfig.topicIds?.includes(q.topicId));
        }

        const shuffledPool = shuffleArray(pool);
        const countToTake = subjConfig.questionCount || Math.ceil(config.questionCount / config.subjects!.length);
        candidatePool = candidatePool.concat(shuffledPool.slice(0, countToTake));
      });
    } else {
      candidatePool = eligibleQuestions;
    }

    // Deduplicate candidate pool
    const seen = new Set<string>();
    const uniquePool: Question[] = [];
    candidatePool.forEach((q) => {
      if (!seen.has(q.id)) {
        seen.add(q.id);
        uniquePool.push(q);
      }
    });

    const shuffled = shuffleArray(uniquePool);
    finalQuestions = shuffled.slice(0, config.questionCount);

    // If requested count is greater than available eligible questions
    if (finalQuestions.length < config.questionCount) {
      // Top up from general app questions if needed
      const remainingNeeded = config.questionCount - finalQuestions.length;
      const unusedQuestions = eligibleQuestions.filter((q) => !seen.has(q.id));
      const extra = shuffleArray(unusedQuestions).slice(0, remainingNeeded);
      finalQuestions = finalQuestions.concat(extra);

      if (finalQuestions.length < config.questionCount) {
        warningMessage = `Selected ${finalQuestions.length} questions (maximum available matching criteria out of ${config.questionCount} requested).`;
      }
    }
  }

  return {
    selectedQuestions: finalQuestions,
    warning: warningMessage
  };
}

/**
 * Utility function to shuffle an array (Fisher-Yates)
 */
function shuffleArray<T>(array: T[]): T[] {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

/**
 * Local Storage helpers for seamless fallback
 */
export function getLocalMockTests(): MockTest[] {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_TESTS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    console.error('Failed to read local mock tests:', e);
    return [];
  }
}

export function saveLocalMockTest(test: MockTest): void {
  try {
    const tests = getLocalMockTests();
    const existingIdx = tests.findIndex((t) => t.id === test.id);
    if (existingIdx >= 0) {
      tests[existingIdx] = test;
    } else {
      tests.unshift(test);
    }
    localStorage.setItem(LOCAL_STORAGE_TESTS_KEY, JSON.stringify(tests));
  } catch (e) {
    console.error('Failed to save local mock test:', e);
  }
}

export function deleteLocalMockTest(testId: string): void {
  try {
    const tests = getLocalMockTests().filter((t) => t.id !== testId);
    localStorage.setItem(LOCAL_STORAGE_TESTS_KEY, JSON.stringify(tests));
  } catch (e) {
    console.error('Failed to delete local mock test:', e);
  }
}

export function getLocalMockAttempts(): MockTestAttempt[] {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_ATTEMPTS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    console.error('Failed to read local mock attempts:', e);
    return [];
  }
}

export function saveLocalMockAttempt(attempt: MockTestAttempt): void {
  try {
    const attempts = getLocalMockAttempts();
    const existingIdx = attempts.findIndex((a) => a.id === attempt.id);
    if (existingIdx >= 0) {
      attempts[existingIdx] = attempt;
    } else {
      attempts.unshift(attempt);
    }
    localStorage.setItem(LOCAL_STORAGE_ATTEMPTS_KEY, JSON.stringify(attempts));
  } catch (e) {
    console.error('Failed to save local mock attempt:', e);
  }
}

export function deleteLocalMockAttempt(attemptId: string): void {
  try {
    const attempts = getLocalMockAttempts().filter((a) => a.id !== attemptId);
    localStorage.setItem(LOCAL_STORAGE_ATTEMPTS_KEY, JSON.stringify(attempts));
  } catch (e) {
    console.error('Failed to delete local mock attempt:', e);
  }
}

/**
 * Firestore Async operations with fallback to localStorage
 */
export async function fetchMockTestsFromFirestore(appId?: string): Promise<MockTest[]> {
  const localTests = getLocalMockTests();

  if (!db) {
    return appId ? localTests.filter((t) => t.appId === appId || t.appId === 'all') : localTests;
  }

  try {
    const colRef = collection(db, 'mockTests');
    let q;
    if (appId) {
      q = query(colRef, where('appId', 'in', [appId, 'all']));
    } else {
      q = query(colRef);
    }

    const snapshot = await getDocs(q);
    const firestoreTests: MockTest[] = [];
    snapshot.forEach((docSnap) => {
      firestoreTests.push({ id: docSnap.id, ...(docSnap.data() as any) } as MockTest);
    });


    // Merge Firestore tests with local custom tests (local custom tests take precedence or blend in)
    const combinedMap = new Map<string, MockTest>();
    firestoreTests.forEach((t) => combinedMap.set(t.id, t));
    localTests.forEach((t) => combinedMap.set(t.id, t));

    return Array.from(combinedMap.values()).sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  } catch (e) {
    console.warn('Firestore fetchMockTests failed, serving local tests:', e);
    return appId ? localTests.filter((t) => t.appId === appId || t.appId === 'all') : localTests;
  }
}

export async function saveMockTestToFirestore(mockTest: MockTest): Promise<void> {
  // Always save locally first for instant user feedback
  saveLocalMockTest(mockTest);

  if (!db) return;

  try {
    const docRef = doc(db, 'mockTests', mockTest.id);
    await setDoc(docRef, mockTest, { merge: true });
  } catch (e) {
    console.warn('Firestore saveMockTest failed, saved locally:', e);
  }
}

export async function deleteMockTestFromFirestore(testId: string): Promise<void> {
  deleteLocalMockTest(testId);

  if (!db) return;

  try {
    const docRef = doc(db, 'mockTests', testId);
    await deleteDoc(docRef);
  } catch (e) {
    console.warn('Firestore deleteMockTest failed, deleted locally:', e);
  }
}

export async function fetchMockAttemptsFromFirestore(
  userId?: string,
  appId?: string
): Promise<MockTestAttempt[]> {
  const localAttempts = getLocalMockAttempts();

  if (!db) {
    return localAttempts.filter(
      (a) => (!userId || a.userId === userId) && (!appId || a.appId === appId)
    );
  }

  try {
    const colRef = collection(db, 'mockTestAttempts');
    let q = query(colRef);

    if (userId) {
      q = query(colRef, where('userId', '==', userId));
    }

    const snapshot = await getDocs(q);
    const firestoreAttempts: MockTestAttempt[] = [];
    snapshot.forEach((docSnap) => {
      firestoreAttempts.push({ id: docSnap.id, ...(docSnap.data() as object) } as MockTestAttempt);
    });

    const combinedMap = new Map<string, MockTestAttempt>();
    firestoreAttempts.forEach((a) => combinedMap.set(a.id, a));
    localAttempts.forEach((a) => combinedMap.set(a.id, a));

    return Array.from(combinedMap.values()).sort(
      (a, b) => new Date(b.startedAt).getTime() - new Date(a.startedAt).getTime()
    );
  } catch (e) {
    console.warn('Firestore fetchMockAttempts failed, serving local attempts:', e);
    return localAttempts.filter(
      (a) => (!userId || a.userId === userId) && (!appId || a.appId === appId)
    );
  }
}

export async function saveMockAttemptToFirestore(attempt: MockTestAttempt): Promise<void> {
  saveLocalMockAttempt(attempt);

  if (!db) return;

  try {
    const docRef = doc(db, 'mockTestAttempts', attempt.id);
    await setDoc(docRef, attempt, { merge: true });
  } catch (e) {
    console.warn('Firestore saveMockAttempt failed, saved locally:', e);
  }
}

/**
 * Score calculation helper for a mock test attempt
 */
export function calculateAttemptScore(
  questions: Question[],
  userAnswers: Record<string, 'A' | 'B' | 'C' | 'D'>,
  positiveMarks: number,
  negativeMarks: number
): {
  totalQuestions: number;
  attemptedCount: number;
  correctCount: number;
  incorrectCount: number;
  unattemptedCount: number;
  score: number;
  accuracyPercentage: number;
  maxMarks: number;
  percentage: number;
  positiveMarksAwarded: number;
  negativeMarksDeducted: number;
} {
  const totalQuestions = questions.length;
  let attemptedCount = 0;
  let correctCount = 0;
  let incorrectCount = 0;

  questions.forEach((q) => {
    const ans = userAnswers[q.id];
    if (ans) {
      attemptedCount++;
      if (ans === q.correctOption) {
        correctCount++;
      } else {
        incorrectCount++;
      }
    }
  });

  const unattemptedCount = totalQuestions - attemptedCount;
  const positiveMarksAwarded = Number((correctCount * positiveMarks).toFixed(2));
  const negativeMarksDeducted = Number((incorrectCount * Math.abs(negativeMarks)).toFixed(2));
  const rawScore = positiveMarksAwarded - negativeMarksDeducted;
  const score = Number(Math.max(0, rawScore).toFixed(2));
  const maxMarks = Number((totalQuestions * positiveMarks).toFixed(2));
  const percentage = maxMarks > 0 ? Number(((score / maxMarks) * 100).toFixed(1)) : 0;
  const accuracyPercentage =
    attemptedCount > 0 ? Number(((correctCount / attemptedCount) * 100).toFixed(1)) : 0;

  return {
    totalQuestions,
    attemptedCount,
    correctCount,
    incorrectCount,
    unattemptedCount,
    score,
    accuracyPercentage,
    maxMarks,
    percentage,
    positiveMarksAwarded,
    negativeMarksDeducted
  };
}
