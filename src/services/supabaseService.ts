import { supabase, isSupabaseConfigured } from '../lib/supabase';

// ---------------------------------------------------------------------------
// 1. User Profiles & Role Synchronization
// ---------------------------------------------------------------------------
export async function syncUserProfileToSupabase(user: any, additionalData: Record<string, any> = {}) {
  if (!user || (!user.id && !user.uid)) return null;
  const userId = user.id || user.uid;
  const isAuthorizedAdmin = Boolean(
    user.email && String(user.email).toLowerCase() === 'sobhadhanaraju0@gmail.com'
  );

  const payload = {
    id: userId,
    uid: userId,
    email: user.email || additionalData.email || '',
    phone_number: user.phone || user.phoneNumber || additionalData.phoneNumber || '',
    display_name: user.user_metadata?.full_name || user.displayName || additionalData.displayName || '',
    role: isAuthorizedAdmin ? 'admin' : 'student',
    is_premium: isAuthorizedAdmin ? true : false,
    last_login_at: new Date().toISOString(),
    ...additionalData,
  };

  if (!isSupabaseConfigured) {
    localStorage.setItem(`aspirant_supabase_user_${userId}`, JSON.stringify(payload));
    return payload;
  }

  try {
    const { data, error } = await supabase
      .from('users')
      .upsert(payload, { onConflict: 'id' })
      .select()
      .single();

    if (error) {
      console.warn('Notice syncing user profile to Supabase:', error.message);
      localStorage.setItem(`aspirant_supabase_user_${userId}`, JSON.stringify(payload));
      return payload;
    }
    return data;
  } catch (err) {
    console.warn('Supabase profile sync exception:', err);
    return payload;
  }
}

export async function getUserProfileFromSupabase(userId: string) {
  if (!isSupabaseConfigured) {
    const cached = localStorage.getItem(`aspirant_supabase_user_${userId}`);
    return cached ? JSON.parse(cached) : null;
  }

  try {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .maybeSingle();

    if (error || !data) {
      const cached = localStorage.getItem(`aspirant_supabase_user_${userId}`);
      return cached ? JSON.parse(cached) : null;
    }
    return data;
  } catch (err) {
    console.warn('Notice fetching user profile from Supabase:', err);
    return null;
  }
}

// ---------------------------------------------------------------------------
// 2. Questions / MCQs Cloud Persistence
// ---------------------------------------------------------------------------
export async function fetchQuestionsFromSupabase(filter?: {
  appId?: string;
  subjectId?: string;
  unitId?: string;
  topicId?: string;
  subtopic?: string;
}) {
  if (!isSupabaseConfigured) return [];

  try {
    let query = supabase.from('questions').select('*');

    if (filter?.appId) query = query.eq('app_id', filter.appId);
    if (filter?.subjectId) query = query.eq('subject_id', filter.subjectId);
    if (filter?.unitId) query = query.eq('unit_id', filter.unitId);
    if (filter?.topicId) query = query.eq('topic_id', filter.topicId);
    if (filter?.subtopic) query = query.ilike('subtopic', filter.subtopic);

    const { data, error } = await query;
    if (error) {
      console.warn('Notice fetching MCQs from Supabase:', error.message);
      return [];
    }
    return data || [];
  } catch (err) {
    console.warn('Supabase question query exception:', err);
    return [];
  }
}

export async function bulkUploadQuestionsToSupabase(questions: any[]) {
  if (!isSupabaseConfigured || !questions.length) return true;

  try {
    const records = questions.map((q) => ({
      id: q.id || `q_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
      app_id: q.appId || 'all',
      subject_id: q.subjectId || '',
      unit_id: q.unitId || '',
      topic_id: q.topicId || '',
      subtopic: q.subtopic || 'General Practice',
      question: q.question || '',
      question_telugu: q.questionTelugu || null,
      options: q.options || [],
      options_telugu: q.optionsTelugu || null,
      correct_option: Number(q.correctOption ?? q.correctIndex ?? 0),
      explanation: q.explanation || null,
      explanation_telugu: q.explanationTelugu || null,
      difficulty: q.difficulty || 'medium',
      created_at: new Date().toISOString(),
    }));

    const { error } = await supabase.from('questions').upsert(records, { onConflict: 'id' });
    if (error) {
      console.warn('Notice bulk inserting questions to Supabase:', error.message);
    }
    return true;
  } catch (err) {
    console.warn('Supabase question bulk upload exception:', err);
    return true;
  }
}

// ---------------------------------------------------------------------------
// 3. Current Affairs Compendiums
// ---------------------------------------------------------------------------
export async function fetchCurrentAffairsFromSupabase(appId?: string) {
  if (!isSupabaseConfigured) return [];

  try {
    let query = supabase.from('current_affairs').select('*').order('published_date', { ascending: false });
    if (appId) {
      query = query.or(`app_id.eq.${appId},app_id.eq.all`);
    }

    const { data, error } = await query;
    if (error) {
      console.warn('Notice fetching current affairs from Supabase:', error.message);
      return [];
    }
    return data || [];
  } catch (err) {
    console.warn('Supabase current affairs exception:', err);
    return [];
  }
}

export async function saveCurrentAffairToSupabase(item: {
  appId: string;
  month: string;
  title: string;
  content: string;
  publishedDate: string;
}) {
  const docId = `ca_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`;
  const record = {
    id: docId,
    app_id: item.appId || 'all',
    month: item.month,
    title: item.title,
    content: item.content,
    published_date: item.publishedDate || new Date().toISOString(),
    created_at: new Date().toISOString(),
  };

  if (!isSupabaseConfigured) return docId;

  try {
    const { error } = await supabase.from('current_affairs').insert([record]);
    if (error) {
      console.warn('Notice saving current affair to Supabase:', error.message);
    }
    return docId;
  } catch (err) {
    console.warn('Supabase current affair insert exception:', err);
    return docId;
  }
}

// ---------------------------------------------------------------------------
// 4. Mock Tests & Test Attempts
// ---------------------------------------------------------------------------
export async function fetchMockTestsFromSupabase(appId?: string, userId?: string) {
  if (!isSupabaseConfigured) return [];

  try {
    const { data, error } = await supabase.from('mock_tests').select('*');
    if (error) {
      console.warn('Notice fetching mock tests from Supabase:', error.message);
      return [];
    }

    return (data || []).filter((test: any) => {
      if (appId && test.app_id && test.app_id !== appId && test.app_id !== 'all') return false;
      if (test.is_official || test.status === 'published') return true;
      if (userId && test.creator_user_id === userId) return true;
      return false;
    });
  } catch (err) {
    console.warn('Supabase mock test query exception:', err);
    return [];
  }
}

export async function saveMockTestToSupabase(mockTest: any) {
  const docId = mockTest.id || `mt_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`;
  const record = {
    id: docId,
    app_id: mockTest.appId || 'all',
    title: mockTest.title,
    description: mockTest.description || '',
    duration_minutes: Number(mockTest.durationMinutes || 60),
    total_questions: Number(mockTest.totalQuestions || 50),
    questions: mockTest.questions || [],
    is_official: Boolean(mockTest.isOfficial),
    creator_user_id: mockTest.creatorUserId || null,
    status: mockTest.status || 'published',
    created_at: mockTest.createdAt || new Date().toISOString(),
  };

  if (!isSupabaseConfigured) return record;

  try {
    await supabase.from('mock_tests').upsert(record, { onConflict: 'id' });
    return record;
  } catch (err) {
    console.warn('Supabase mock test save exception:', err);
    return record;
  }
}

// ---------------------------------------------------------------------------
// 5. Bookmarks & Saved Drills
// ---------------------------------------------------------------------------
export async function fetchBookmarksFromSupabase(userId: string, appId?: string) {
  if (!isSupabaseConfigured) return [];

  try {
    let query = supabase.from('bookmarks').select('*').eq('user_id', userId);
    if (appId) {
      query = query.or(`app_id.eq.${appId},app_id.eq.all`);
    }

    const { data, error } = await query;
    if (error) {
      console.warn('Notice fetching bookmarks from Supabase:', error.message);
      return [];
    }
    return data || [];
  } catch (err) {
    console.warn('Supabase bookmark query exception:', err);
    return [];
  }
}

export async function saveBookmarkToSupabase(bookmark: any) {
  const docId = bookmark.id || `${bookmark.userId}_${bookmark.itemType}_${bookmark.itemId}`;
  const record = {
    id: docId,
    user_id: bookmark.userId,
    app_id: bookmark.appId || 'all',
    item_type: bookmark.itemType || 'question',
    item_id: bookmark.itemId,
    title: bookmark.title || '',
    content: bookmark.content || {},
    created_at: new Date().toISOString(),
  };

  if (!isSupabaseConfigured) return record;

  try {
    await supabase.from('bookmarks').upsert(record, { onConflict: 'id' });
    return record;
  } catch (err) {
    console.warn('Supabase bookmark save exception:', err);
    return record;
  }
}

export async function deleteBookmarkFromSupabase(id: string) {
  if (!isSupabaseConfigured) return true;

  try {
    await supabase.from('bookmarks').delete().eq('id', id);
    return true;
  } catch (err) {
    console.warn('Supabase bookmark delete exception:', err);
    return true;
  }
}

// ---------------------------------------------------------------------------
// 6. Purchases & Subscription Validation
// ---------------------------------------------------------------------------
export async function recordPurchaseInSupabase(purchase: Record<string, any>) {
  const purchaseId = purchase.orderId || purchase.id || `pur_${Date.now()}`;
  const record = {
    id: purchaseId,
    user_id: purchase.userId || null,
    order_id: purchase.orderId || purchase.razorpay_order_id || purchaseId,
    payment_id: purchase.paymentId || purchase.razorpay_payment_id || null,
    plan_id: purchase.planId || 'sub-offline-99',
    plan_name: purchase.planName || 'Premium Pass',
    amount: Number(purchase.amount || purchase.amountSubunits / 100 || 99),
    currency: purchase.currency || 'INR',
    status: purchase.status || 'completed',
    created_at: purchase.createdAt || new Date().toISOString(),
  };

  if (!isSupabaseConfigured) return purchaseId;

  try {
    await supabase.from('purchases').upsert(record, { onConflict: 'id' });
    return purchaseId;
  } catch (err) {
    console.warn('Supabase purchase record exception:', err);
    return purchaseId;
  }
}

export async function fetchUserPurchasesFromSupabase(userId: string) {
  if (!isSupabaseConfigured) return [];

  try {
    const { data, error } = await supabase
      .from('purchases')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      console.warn('Notice fetching purchases from Supabase:', error.message);
      return [];
    }
    return data || [];
  } catch (err) {
    console.warn('Supabase purchase query exception:', err);
    return [];
  }
}
