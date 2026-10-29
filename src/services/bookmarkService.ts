/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { BookmarkItem, Question, CurrentAffairsItem, AppConfig } from '../types';
import {
  fetchBookmarksFromFirestore,
  saveBookmarkToFirestore,
  deleteBookmarkFromFirestore,
  deleteMultipleBookmarksFromFirestore
} from '../lib/firebase';

const LOCAL_STORAGE_KEY = 'app_user_bookmarks_v1';

export function getLocalBookmarks(): BookmarkItem[] {
  try {
    const data = localStorage.getItem(LOCAL_STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch (err) {
    console.error('Error reading local bookmarks:', err);
    return [];
  }
}

export function saveLocalBookmarks(bookmarks: BookmarkItem[]): void {
  try {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(bookmarks));
  } catch (err) {
    console.error('Error saving local bookmarks:', err);
  }
}

export async function fetchBookmarks(userId: string, appId?: string): Promise<BookmarkItem[]> {
  try {
    const remote = await fetchBookmarksFromFirestore(userId, appId);
    const local = getLocalBookmarks().filter(
      (b) => b.userId === userId && (!appId || b.appId === appId || b.appId === 'all')
    );

    // Merge remote and local without duplicates
    const map = new Map<string, BookmarkItem>();
    [...remote, ...local].forEach((item) => {
      map.set(item.id, item);
    });

    const merged = Array.from(map.values()).sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );

    saveLocalBookmarks(merged);
    return merged;
  } catch (err) {
    console.warn('Falling back to local bookmarks:', err);
    return getLocalBookmarks().filter(
      (b) => b.userId === userId && (!appId || b.appId === appId || b.appId === 'all')
    );
  }
}

export function isBookmarked(bookmarks: BookmarkItem[], itemType: 'mcq' | 'current_affairs', itemId: string): boolean {
  if (!bookmarks || !Array.isArray(bookmarks)) return false;
  return bookmarks.some((b) => b.itemType === itemType && b.itemId === itemId);
}

export async function toggleBookmarkMCQ(params: {
  userId: string;
  appId: string;
  question: Question;
  currentBookmarks: BookmarkItem[];
  appConfig?: AppConfig;
}): Promise<{ updatedBookmarks: BookmarkItem[]; isBookmarkedNow: boolean }> {
  const { userId, appId, question, currentBookmarks, appConfig } = params;
  const bookmarkId = `${userId}_mcq_${question.id}`;
  const existing = currentBookmarks.find((b) => b.id === bookmarkId || (b.itemType === 'mcq' && b.itemId === question.id));

  if (existing) {
    // Unbookmark
    const updated = currentBookmarks.filter((b) => b.id !== existing.id);
    saveLocalBookmarks(updated);
    deleteBookmarkFromFirestore(existing.id).catch(() => {});
    return { updatedBookmarks: updated, isBookmarkedNow: false };
  } else {
    // Find subject/unit/topic names if available
    let subjectName = '';
    let unitName = '';
    let topicName = '';

    if (appConfig?.syllabus) {
      const subj = appConfig.syllabus.find((s) => s.id === question.subjectId);
      if (subj) {
        subjectName = subj.name;
        const unit = subj.units?.find((u) => u.id === question.unitId);
        if (unit) {
          unitName = unit.name;
          const topic = unit.topics?.find((t) => t.id === question.topicId);
          if (topic) topicName = topic.name;
        }
      }
    }

    const newBookmark: BookmarkItem = {
      id: bookmarkId,
      userId,
      appId,
      itemType: 'mcq',
      itemId: question.id,
      question: question,
      subjectId: question.subjectId,
      subjectName,
      unitId: question.unitId,
      unitName,
      topicId: question.topicId,
      topicName,
      category: question.category,
      createdAt: new Date().toISOString()
    };

    const updated = [newBookmark, ...currentBookmarks];
    saveLocalBookmarks(updated);
    saveBookmarkToFirestore(newBookmark).catch(() => {});
    return { updatedBookmarks: updated, isBookmarkedNow: true };
  }
}

export async function toggleBookmarkCA(params: {
  userId: string;
  appId: string;
  caItem: CurrentAffairsItem;
  currentBookmarks: BookmarkItem[];
}): Promise<{ updatedBookmarks: BookmarkItem[]; isBookmarkedNow: boolean }> {
  const { userId, appId, caItem, currentBookmarks } = params;
  const bookmarkId = `${userId}_ca_${caItem.id}`;
  const existing = currentBookmarks.find(
    (b) => b.id === bookmarkId || (b.itemType === 'current_affairs' && b.itemId === caItem.id)
  );

  if (existing) {
    // Unbookmark
    const updated = currentBookmarks.filter((b) => b.id !== existing.id);
    saveLocalBookmarks(updated);
    deleteBookmarkFromFirestore(existing.id).catch(() => {});
    return { updatedBookmarks: updated, isBookmarkedNow: false };
  } else {
    const newBookmark: BookmarkItem = {
      id: bookmarkId,
      userId,
      appId,
      itemType: 'current_affairs',
      itemId: caItem.id,
      currentAffairs: caItem,
      month: caItem.month,
      category: caItem.category,
      createdAt: new Date().toISOString()
    };

    const updated = [newBookmark, ...currentBookmarks];
    saveLocalBookmarks(updated);
    saveBookmarkToFirestore(newBookmark).catch(() => {});
    return { updatedBookmarks: updated, isBookmarkedNow: true };
  }
}

export async function removeBookmarks(ids: string[], currentBookmarks: BookmarkItem[]): Promise<BookmarkItem[]> {
  const updated = currentBookmarks.filter((b) => !ids.includes(b.id));
  saveLocalBookmarks(updated);
  deleteMultipleBookmarksFromFirestore(ids).catch(() => {});
  return updated;
}

export interface BookmarkStats {
  total: number;
  mcqCount: number;
  caCount: number;
  bySubject: Record<string, { id: string; name: string; count: number }>;
  byUnit: Record<string, { id: string; name: string; count: number }>;
  byTopic: Record<string, { id: string; name: string; count: number }>;
  byMonth: Record<string, number>;
  byCategory: Record<string, number>;
}

export function calculateBookmarkStats(bookmarks: BookmarkItem[]): BookmarkStats {
  const stats: BookmarkStats = {
    total: bookmarks.length,
    mcqCount: 0,
    caCount: 0,
    bySubject: {},
    byUnit: {},
    byTopic: {},
    byMonth: {},
    byCategory: {}
  };

  bookmarks.forEach((b) => {
    if (b.itemType === 'mcq') {
      stats.mcqCount++;
      if (b.subjectId) {
        const sName = b.subjectName || b.subjectId;
        stats.bySubject[b.subjectId] = {
          id: b.subjectId,
          name: sName,
          count: (stats.bySubject[b.subjectId]?.count || 0) + 1
        };
      }
      if (b.unitId) {
        const uName = b.unitName || b.unitId;
        stats.byUnit[b.unitId] = {
          id: b.unitId,
          name: uName,
          count: (stats.byUnit[b.unitId]?.count || 0) + 1
        };
      }
      if (b.topicId) {
        const tName = b.topicName || b.topicId;
        stats.byTopic[b.topicId] = {
          id: b.topicId,
          name: tName,
          count: (stats.byTopic[b.topicId]?.count || 0) + 1
        };
      }
    } else if (b.itemType === 'current_affairs') {
      stats.caCount++;
      if (b.month) {
        stats.byMonth[b.month] = (stats.byMonth[b.month] || 0) + 1;
      }
      if (b.category) {
        stats.byCategory[b.category] = (stats.byCategory[b.category] || 0) + 1;
      }
    }
  });

  return stats;
}

export function filterBookmarks(
  bookmarks: BookmarkItem[],
  filter: {
    itemType?: 'all' | 'mcq' | 'current_affairs';
    subjectId?: string;
    unitId?: string;
    topicId?: string;
    month?: string;
    searchQuery?: string;
    sortBy?: 'newest' | 'oldest' | 'subject';
  }
): BookmarkItem[] {
  let result = [...bookmarks];

  if (filter.itemType && filter.itemType !== 'all') {
    result = result.filter((b) => b.itemType === filter.itemType);
  }

  if (filter.subjectId) {
    result = result.filter((b) => b.subjectId === filter.subjectId);
  }

  if (filter.unitId) {
    result = result.filter((b) => b.unitId === filter.unitId);
  }

  if (filter.topicId) {
    result = result.filter((b) => b.topicId === filter.topicId);
  }

  if (filter.month) {
    result = result.filter((b) => b.month === filter.month);
  }

  if (filter.searchQuery && filter.searchQuery.trim()) {
    const q = filter.searchQuery.toLowerCase().trim();
    result = result.filter((b) => {
      if (b.itemType === 'mcq' && b.question) {
        return (
          b.question.questionText?.toLowerCase().includes(q) ||
          b.question.explanation?.toLowerCase().includes(q) ||
          b.subjectName?.toLowerCase().includes(q) ||
          b.topicName?.toLowerCase().includes(q)
        );
      }
      if (b.itemType === 'current_affairs' && b.currentAffairs) {
        return (
          b.currentAffairs.title?.toLowerCase().includes(q) ||
          b.currentAffairs.summary?.toLowerCase().includes(q) ||
          b.currentAffairs.content?.toLowerCase().includes(q) ||
          b.month?.toLowerCase().includes(q)
        );
      }
      return false;
    });
  }

  if (filter.sortBy === 'oldest') {
    result.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
  } else if (filter.sortBy === 'subject') {
    result.sort((a, b) => (a.subjectName || '').localeCompare(b.subjectName || ''));
  } else {
    // newest default
    result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  return result;
}
