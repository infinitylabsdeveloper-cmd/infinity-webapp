/// <reference types="vite/client" />
import { 
  collection, 
  getDocs, 
  addDoc, 
  setDoc, 
  doc, 
  getDoc, 
  query, 
  where, 
  deleteDoc,
  Timestamp 
} from 'firebase/firestore';
import rawConfig from '../../firebase-applet-config.json';
import { app, db, auth, firebaseConfig, databaseId, isFirebaseConfigured } from './firebaseConfig';

export { app, db, auth, isFirebaseConfigured };

// Construct clean reusable Firebase configuration from environment variables or config file
export const getFirebaseConfig = () => {
  return {
    ...firebaseConfig,
    firestoreDatabaseId: databaseId,
  };
};

const resolvedConfig = getFirebaseConfig();

import { 
  GoogleAuthProvider, 
  signInWithPopup, 
  signOut as firebaseSignOut,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
  updateProfile,
  onAuthStateChanged,
  RecaptchaVerifier,
  signInWithPhoneNumber,
  ConfirmationResult,
  User
} from 'firebase/auth';

export type { ConfirmationResult, User };
export { RecaptchaVerifier };

export const AUTHORIZED_ADMIN_EMAIL = 'sobhadhanaraju0@gmail.com';

// ---------------------------------------------------------------------------
// Firebase Authentication Methods: Email/Password, Google, Reset, Profile
// ---------------------------------------------------------------------------

export async function registerWithEmailPassword(email: string, pass: string, displayName?: string) {
  if (!auth || !isFirebaseConfigured) {
    const localUser = {
      uid: `local_${Date.now()}`,
      email: email.trim(),
      displayName: displayName || email.split('@')[0],
      emailVerified: true
    } as unknown as User;
    localStorage.setItem('aspirant_user_email', email.trim());
    localStorage.setItem('aspirant_user_uid', localUser.uid);
    await syncUserProfileToFirestore(localUser, { displayName: displayName || email.split('@')[0] });
    return localUser;
  }
  const cred = await createUserWithEmailAndPassword(auth, email.trim(), pass);
  if (displayName && cred.user) {
    try {
      await updateProfile(cred.user, { displayName });
    } catch (e) {
      console.warn('Could not update display name:', e);
    }
  }
  // Sync user profile document in Firestore
  await syncUserProfileToFirestore(cred.user, { displayName: displayName || email.split('@')[0] });
  return cred.user;
}

export async function loginWithEmailPassword(email: string, pass: string) {
  if (!auth || !isFirebaseConfigured) {
    const localUser = {
      uid: localStorage.getItem('aspirant_user_uid') || `local_${Date.now()}`,
      email: email.trim(),
      displayName: email.split('@')[0],
      emailVerified: true
    } as unknown as User;
    localStorage.setItem('aspirant_user_email', email.trim());
    localStorage.setItem('aspirant_user_uid', localUser.uid);
    await syncUserProfileToFirestore(localUser);
    return localUser;
  }
  const cred = await signInWithEmailAndPassword(auth, email.trim(), pass);
  // Update last active
  if (cred.user) {
    await syncUserProfileToFirestore(cred.user);
  }
  return cred.user;
}

export async function resetUserPassword(email: string) {
  if (!auth || !isFirebaseConfigured) {
    return Promise.resolve();
  }
  return await sendPasswordResetEmail(auth, email.trim());
}

export async function logoutUser() {
  if (!auth || !isFirebaseConfigured) {
    return Promise.resolve();
  }
  return await firebaseSignOut(auth);
}

export function subscribeToAuthChanges(callback: (user: User | null) => void) {
  if (!auth || !isFirebaseConfigured) {
    const email = localStorage.getItem('aspirant_user_email');
    const uid = localStorage.getItem('aspirant_user_uid');
    if (email && uid) {
      callback({
        uid,
        email,
        displayName: email.split('@')[0],
        emailVerified: true
      } as unknown as User);
    } else {
      callback(null);
    }
    return () => {};
  }
  return onAuthStateChanged(auth, callback);
}

// ---------------------------------------------------------------------------
// Firebase Phone Authentication (reCAPTCHA, E.164 +91, SMS & Test Numbers)
// ---------------------------------------------------------------------------

export function createRecaptchaVerifier(containerId: string): RecaptchaVerifier | null {
  if (typeof window === 'undefined' || !auth) return null;
  try {
    if ((window as any).recaptchaVerifier) {
      try {
        (window as any).recaptchaVerifier.clear();
      } catch (e) {
        console.warn('Notice clearing prior recaptcha:', e);
      }
      (window as any).recaptchaVerifier = null;
    }

    const containerEl = document.getElementById(containerId);
    if (containerEl) {
      containerEl.innerHTML = '';
    }

    const verifier = new RecaptchaVerifier(auth, containerId, {
      size: 'invisible',
      callback: () => {
        console.log('[Firebase Phone Auth] reCAPTCHA verified successfully');
      },
      'expired-callback': () => {
        console.warn('[Firebase Phone Auth] reCAPTCHA expired, will auto-refresh on retry');
      }
    });

    (window as any).recaptchaVerifier = verifier;
    return verifier;
  } catch (err) {
    console.warn('Failed to initialize RecaptchaVerifier:', err);
    return null;
  }
}

export async function requestFirebasePhoneOtp(
  phoneNumber: string,
  appVerifier: RecaptchaVerifier
): Promise<{ success: boolean; confirmationResult?: ConfirmationResult; error?: string; errorCode?: string; formattedPhone: string }> {
  const cleanDigits = String(phoneNumber || '').replace(/\D/g, '');
  let formattedPhone = cleanDigits;

  if (cleanDigits.length === 10) {
    formattedPhone = `+91${cleanDigits}`;
  } else if (cleanDigits.length === 12 && cleanDigits.startsWith('91')) {
    formattedPhone = `+${cleanDigits}`;
  } else if (String(phoneNumber).trim().startsWith('+')) {
    formattedPhone = String(phoneNumber).trim();
  } else {
    formattedPhone = `+91${cleanDigits}`;
  }

  try {
    const confirmationResult = await signInWithPhoneNumber(auth, formattedPhone, appVerifier);
    return {
      success: true,
      confirmationResult,
      formattedPhone
    };
  } catch (err: any) {
    console.error('[Firebase Phone Auth] Send OTP Error:', err);
    const code = err.code || '';
    let userMsg = 'Failed to send OTP via Firebase SMS.';

    if (code === 'auth/invalid-phone-number') {
      userMsg = 'Invalid phone number format. Please enter a valid 10-digit Indian mobile number.';
    } else if (code === 'auth/missing-phone-number') {
      userMsg = 'Phone number is required.';
    } else if (code === 'auth/quota-exceeded') {
      userMsg = 'Firebase SMS quota exceeded. Free tier limit reached. Please configure test phone numbers in Firebase Console or use Email/Google login.';
    } else if (code === 'auth/too-many-requests') {
      userMsg = 'Too many requests from this device or number. Please wait a few moments before trying again.';
    } else if (code === 'auth/captcha-check-failed') {
      userMsg = 'reCAPTCHA verification failed. Please refresh the page and try again.';
    } else if (code === 'auth/unauthorized-domain') {
      const currentHost = typeof window !== 'undefined' ? window.location.hostname : 'current domain';
      userMsg = `Domain not authorized in Firebase Console! Please add "${currentHost}" in Firebase Console -> Authentication -> Settings -> Authorized Domains.`;
    } else if (code === 'auth/operation-not-allowed') {
      userMsg = 'Phone Authentication is not enabled in Firebase Console. Please enable "Phone" in Firebase Console -> Authentication -> Sign-in method.';
    } else if (code === 'auth/network-request-failed') {
      userMsg = 'Network connection failed. Please check your internet connection.';
    } else if (err.message) {
      userMsg = err.message;
    }

    return {
      success: false,
      error: userMsg,
      errorCode: code,
      formattedPhone
    };
  }
}

export async function verifyFirebasePhoneOtp(
  confirmationResult: ConfirmationResult,
  otpCode: string,
  phoneNumber: string
): Promise<{ success: boolean; user?: User; error?: string; errorCode?: string }> {
  try {
    const cred = await confirmationResult.confirm(otpCode.trim());
    if (cred.user) {
      // Sync user in Firestore
      await syncUserProfileToFirestore(cred.user, {
        phoneNumber: cred.user.phoneNumber || phoneNumber
      });
      return {
        success: true,
        user: cred.user
      };
    }
    return {
      success: false,
      error: 'Unable to verify code. Please try again.'
    };
  } catch (err: any) {
    console.error('[Firebase Phone Auth] Verify OTP Error:', err);
    const code = err.code || '';
    let userMsg = 'Verification failed.';

    if (code === 'auth/invalid-verification-code') {
      userMsg = 'Incorrect 6-digit OTP code. Please check the SMS or test code and try again.';
    } else if (code === 'auth/code-expired') {
      userMsg = 'The verification code has expired. Please request a new OTP.';
    } else if (code === 'auth/user-disabled') {
      userMsg = 'This account has been disabled. Please contact support.';
    } else if (err.message) {
      userMsg = err.message;
    }

    return {
      success: false,
      error: userMsg,
      errorCode: code
    };
  }
}

// ---------------------------------------------------------------------------
// User Profile & Document Sync in Firestore
// ---------------------------------------------------------------------------
export async function syncUserProfileToFirestore(user: User, additionalData: Record<string, any> = {}) {
  try {
    if (!user || !user.uid) return null;
    const isAuthorizedAdmin = Boolean(user.email && user.email.toLowerCase() === AUTHORIZED_ADMIN_EMAIL.toLowerCase());

    const payload: Record<string, any> = {
      uid: user.uid,
      email: user.email || '',
      displayName: user.displayName || additionalData.displayName || '',
      phoneNumber: user.phoneNumber || additionalData.phoneNumber || '',
      photoURL: user.photoURL || '',
      lastLoginAt: new Date().toISOString(),
      isPremium: isAuthorizedAdmin ? true : false,
      role: isAuthorizedAdmin ? 'admin' : 'student',
      ...additionalData
    };

    if (!db || !isFirebaseConfigured) {
      localStorage.setItem(`aspirant_user_profile_${user.uid}`, JSON.stringify(payload));
      return payload;
    }

    const userDocRef = doc(db, 'users', user.uid);
    const existingSnap = await getDoc(userDocRef);

    if (!existingSnap.exists()) {
      payload.createdAt = new Date().toISOString();
    }

    await setDoc(userDocRef, payload, { merge: true });
    return payload;
  } catch (err) {
    console.warn('User profile sync notice:', err);
    return null;
  }
}

export async function getUserProfileFromFirestore(uid: string) {
  try {
    if (!db || !isFirebaseConfigured) {
      const cached = localStorage.getItem(`aspirant_user_profile_${uid}`);
      return cached ? JSON.parse(cached) : null;
    }
    const userDocRef = doc(db, 'users', uid);
    const snap = await getDoc(userDocRef);
    if (snap.exists()) {
      return snap.data();
    }
    return null;
  } catch (err) {
    console.warn('Failed to fetch user profile:', err);
    return null;
  }
}





// Helper functions for Current Affairs
export async function fetchCurrentAffairsFromFirestore() {
  if (!db || !isFirebaseConfigured) return [];
  try {
    const querySnapshot = await getDocs(collection(db, 'currentAffairs'));
    const items: any[] = [];
    querySnapshot.forEach((docSnap) => {
      items.push({ id: docSnap.id, ...docSnap.data() });
    });
    return items;
  } catch (err) {
    console.warn('Notice fetching current affairs:', err);
    return [];
  }
}

export async function saveCurrentAffairToFirestore(item: { appId: string; month: string; title: string; content: string; publishedDate: string }) {
  if (!db || !isFirebaseConfigured) return `ca_${Date.now()}`;
  try {
    const docRef = await addDoc(collection(db, 'currentAffairs'), {
      ...item,
      createdAt: Timestamp.now()
    });
    return docRef.id;
  } catch (err) {
    console.warn('Notice saving current affair:', err);
    return `ca_${Date.now()}`;
  }
}

export async function bulkUploadCurrentAffairsToFirestore(items: any[]) {
  if (!db || !isFirebaseConfigured) return true;
  try {
    for (const item of items) {
      await addDoc(collection(db, 'currentAffairs'), {
        ...item,
        createdAt: Timestamp.now()
      });
    }
    return true;
  } catch (err) {
    console.warn('Notice bulk uploading current affairs:', err);
    return true;
  }
}

// Helper functions for Questions / MCQs
export async function fetchQuestionsFromFirestore(filter?: {
  appId?: string;
  subjectId?: string;
  unitId?: string;
  topicId?: string;
  subtopic?: string;
}) {
  if (!db || !isFirebaseConfigured) return [];
  try {
    const qRef = collection(db, 'questions');
    const constraints: any[] = [];
    if (filter?.appId) constraints.push(where('appId', '==', filter.appId));
    if (filter?.subjectId) constraints.push(where('subjectId', '==', filter.subjectId));
    if (filter?.unitId) constraints.push(where('unitId', '==', filter.unitId));
    if (filter?.topicId) constraints.push(where('topicId', '==', filter.topicId));
    if (filter?.subtopic) constraints.push(where('subtopic', '==', filter.subtopic));

    const q = constraints.length > 0 ? query(qRef, ...constraints) : qRef;
    const querySnapshot = await getDocs(q);
    const items: any[] = [];
    querySnapshot.forEach((docSnap) => {
      items.push({ id: docSnap.id, ...docSnap.data() });
    });
    return items;
  } catch (err) {
    console.warn('Notice fetching questions:', err);
    return [];
  }
}

export async function bulkUploadQuestionsToFirestore(questions: any[]) {
  if (!db || !isFirebaseConfigured) return true;
  try {
    for (const q of questions) {
      await addDoc(collection(db, 'questions'), {
        ...q,
        createdAt: Timestamp.now()
      });
    }
    return true;
  } catch (err) {
    console.warn('Notice bulk uploading questions:', err);
    return true;
  }
}

// Helper functions for Mock Tests
export async function fetchMockTestsFromFirestore(appId?: string, userId?: string) {
  if (!db || !isFirebaseConfigured) return [];
  try {
    const mtRef = collection(db, 'mockTests');
    const querySnapshot = await getDocs(mtRef);
    const items: any[] = [];
    querySnapshot.forEach((docSnap) => {
      const data = docSnap.data();
      if (appId && data.appId && data.appId !== appId && data.appId !== 'all') {
        return;
      }
      if (data.isOfficial || data.status === 'published') {
        items.push({ id: docSnap.id, ...data });
      } else if (userId && data.creatorUserId === userId) {
        items.push({ id: docSnap.id, ...data });
      }
    });
    return items;
  } catch (err) {
    console.warn('Notice fetching mock tests:', err);
    return [];
  }
}

export async function saveMockTestToFirestore(mockTest: any) {
  const docId = mockTest.id || `mt-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
  const mockTestWithId = {
    ...mockTest,
    id: docId,
    createdAt: mockTest.createdAt || new Date().toISOString()
  };
  if (!db || !isFirebaseConfigured) return mockTestWithId;
  try {
    await setDoc(doc(db, 'mockTests', docId), mockTestWithId);
    return mockTestWithId;
  } catch (err) {
    console.warn('Notice saving mock test:', err);
    return mockTestWithId;
  }
}

export async function updateMockTestInFirestore(id: string, updates: any) {
  if (!db || !isFirebaseConfigured) return true;
  try {
    await setDoc(doc(db, 'mockTests', id), {
      ...updates,
      updatedAt: new Date().toISOString()
    }, { merge: true });
    return true;
  } catch (err) {
    console.warn('Notice updating mock test:', err);
    return true;
  }
}

export async function deleteMockTestFromFirestore(id: string) {
  if (!db || !isFirebaseConfigured) return true;
  try {
    await deleteDoc(doc(db, 'mockTests', id));
    return true;
  } catch (err) {
    console.warn('Notice deleting mock test:', err);
    return true;
  }
}

export async function saveMockTestAttemptToFirestore(attempt: any) {
  const attemptId = attempt.id || `mta-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
  const dataWithId = {
    ...attempt,
    id: attemptId
  };
  if (!db || !isFirebaseConfigured) return dataWithId;
  try {
    await setDoc(doc(db, 'mockTestAttempts', attemptId), dataWithId);
    return dataWithId;
  } catch (err) {
    console.warn('Notice saving mock test attempt:', err);
    return dataWithId;
  }
}

export async function fetchMockTestAttemptsFromFirestore(appId?: string, userId?: string) {
  if (!db || !isFirebaseConfigured) return [];
  try {
    const ref = collection(db, 'mockTestAttempts');
    const querySnapshot = await getDocs(ref);
    const items: any[] = [];
    querySnapshot.forEach((docSnap) => {
      const d = docSnap.data();
      if (appId && d.appId && d.appId !== appId) return;
      if (userId && d.userId && d.userId !== userId) return;
      items.push({ id: docSnap.id, ...d });
    });
    return items;
  } catch (err) {
    console.warn('Notice fetching mock test attempts:', err);
    return [];
  }
}

// Bookmark helper functions
export async function fetchBookmarksFromFirestore(userId: string, appId?: string) {
  if (!db || !isFirebaseConfigured) return [];
  try {
    const ref = collection(db, 'bookmarks');
    const querySnapshot = await getDocs(ref);
    const items: any[] = [];
    querySnapshot.forEach((docSnap) => {
      const d = docSnap.data();
      if (d.userId === userId) {
        if (!appId || d.appId === appId || d.appId === 'all') {
          items.push({ id: docSnap.id, ...d });
        }
      }
    });
    return items;
  } catch (err) {
    console.warn('Notice fetching bookmarks:', err);
    return [];
  }
}

export async function saveBookmarkToFirestore(bookmark: any) {
  const docId = bookmark.id || `${bookmark.userId}_${bookmark.itemType}_${bookmark.itemId}`;
  const dataWithId = {
    ...bookmark,
    id: docId
  };
  if (!db || !isFirebaseConfigured) return dataWithId;
  try {
    await setDoc(doc(db, 'bookmarks', docId), dataWithId);
    return dataWithId;
  } catch (err) {
    console.warn('Notice saving bookmark:', err);
    return dataWithId;
  }
}

export async function deleteBookmarkFromFirestore(id: string) {
  if (!db || !isFirebaseConfigured) return true;
  try {
    await deleteDoc(doc(db, 'bookmarks', id));
    return true;
  } catch (err) {
    console.warn('Notice deleting bookmark:', err);
    return true;
  }
}

export async function deleteMultipleBookmarksFromFirestore(ids: string[]) {
  if (!db || !isFirebaseConfigured) return true;
  try {
    for (const id of ids) {
      await deleteDoc(doc(db, 'bookmarks', id));
    }
    return true;
  } catch (err) {
    console.warn('Notice bulk deleting bookmarks:', err);
    return true;
  }
}

// ---------------------------------------------------------------------------
// Practice History & Exam Results Persistence
// ---------------------------------------------------------------------------
export async function savePracticeResultToFirestore(result: {
  userId: string;
  appId: string;
  subjectId: string;
  unitId?: string;
  topicId?: string;
  subtopic?: string;
  score: number;
  total: number;
  accuracy: number;
  timeSpentSeconds: number;
  answers: Record<string, any>;
}) {
  if (!db || !isFirebaseConfigured) return `pr_${Date.now()}`;
  try {
    const docRef = await addDoc(collection(db, 'practiceResults'), {
      ...result,
      createdAt: new Date().toISOString(),
      timestamp: Timestamp.now()
    });
    return docRef.id;
  } catch (err) {
    console.warn('Notice saving practice result:', err);
    return `pr_${Date.now()}`;
  }
}

export async function fetchUserPracticeHistoryFromFirestore(userId: string, appId?: string) {
  if (!db || !isFirebaseConfigured) return [];
  try {
    const ref = collection(db, 'practiceResults');
    const constraints: any[] = [where('userId', '==', userId)];
    if (appId) constraints.push(where('appId', '==', appId));

    const q = query(ref, ...constraints);
    const snap = await getDocs(q);
    const results: any[] = [];
    snap.forEach((d) => results.push({ id: d.id, ...d.data() }));
    return results;
  } catch (err) {
    console.warn('Notice fetching practice history:', err);
    return [];
  }
}

// ---------------------------------------------------------------------------
// Subscriptions & Purchases Sync
// ---------------------------------------------------------------------------
export async function recordPurchaseInFirestore(purchase: Record<string, any>) {
  const purchaseId = purchase.orderId || purchase.id || `pur_${Date.now()}`;
  if (!db || !isFirebaseConfigured) return purchaseId;
  try {
    await setDoc(doc(db, 'purchases', purchaseId), {
      ...purchase,
      id: purchaseId,
      timestamp: Timestamp.now(),
      createdAt: purchase.createdAt || new Date().toISOString()
    });
    return purchaseId;
  } catch (err) {
    console.warn('Notice recording purchase:', err);
    return purchaseId;
  }
}

export async function fetchUserPurchasesFromFirestore(userId: string, appId?: string) {
  if (!db || !isFirebaseConfigured) return [];
  try {
    const ref = collection(db, 'purchases');
    const snap = await getDocs(ref);
    const results: any[] = [];
    snap.forEach((d) => {
      const data = d.data();
      if (data.userId === userId || data.email === userId) {
        if (!appId || data.appId === appId || data.appId === 'all') {
          results.push({ id: d.id, ...data });
        }
      }
    });
    return results;
  } catch (err) {
    console.warn('Notice fetching purchases:', err);
    return [];
  }
}

// ---------------------------------------------------------------------------
// Subjects & Syllabus Cloud Sync
// ---------------------------------------------------------------------------
export async function syncAppSyllabusToFirestore(appId: string, syllabus: any[]) {
  if (!db || !isFirebaseConfigured) return true;
  try {
    await setDoc(doc(db, 'appSyllabus', appId), {
      appId,
      syllabus,
      updatedAt: new Date().toISOString(),
      timestamp: Timestamp.now()
    }, { merge: true });
    return true;
  } catch (err) {
    console.warn('Notice syncing syllabus:', err);
    return true;
  }
}

export async function fetchAppSyllabusFromFirestore(appId: string) {
  if (!db || !isFirebaseConfigured) return null;
  try {
    const docSnap = await getDoc(doc(db, 'appSyllabus', appId));
    if (docSnap.exists()) {
      return docSnap.data().syllabus || null;
    }
    return null;
  } catch (err) {
    console.warn('Notice fetching syllabus:', err);
    return null;
  }
}


