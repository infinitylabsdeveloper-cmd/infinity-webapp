/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import {
  Plus,
  Trash2,
  Edit2,
  CheckCircle2,
  Sparkles,
  Award,
  Clock,
  HelpCircle,
  X,
  Search,
  Filter,
  Eye,
  Save
} from 'lucide-react';
import { AppConfig, Question, CurrentAffairsItem, MockTest, MockTestConfig, AppState } from '../types';
import {
  fetchMockTestsFromFirestore,
  saveMockTestToFirestore,
  deleteMockTestFromFirestore,
  generateMockTestQuestions
} from '../services/mockTestService';
import { MathText } from './MathText';

interface AdminMockTestManagerProps {
  apps?: AppConfig[];
  questions?: Question[];
  currentAffairs?: CurrentAffairsItem[];
  adminEmail: string;
  state?: AppState;
  activeApp?: AppConfig;
  onSaveState?: (newState: AppState) => Promise<void>;
  logAuditAction?: (action: string, targetId: string, targetType: any, details?: string) => Promise<void>;
}

export const AdminMockTestManager: React.FC<AdminMockTestManagerProps> = ({
  apps = [],
  questions = [],
  currentAffairs = [],
  adminEmail,
  state,
  activeApp,
  onSaveState,
  logAuditAction
}) => {
  const resolvedApps = apps.length > 0 ? apps : state?.apps || [];
  const resolvedQuestions = questions.length > 0 ? questions : state?.questions || [];
  const resolvedCa = currentAffairs.length > 0 ? currentAffairs : state?.currentAffairs || [];

  const [tests, setTests] = useState<MockTest[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedAppId, setSelectedAppId] = useState<string>(activeApp?.id || resolvedApps[0]?.id || 'all');

  // Modal / Creator State
  const [isEditorOpen, setIsEditorOpen] = useState<boolean>(false);
  const [editingTestId, setEditingTestId] = useState<string | null>(null);

  // Editor Form Fields
  const [title, setTitle] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [targetAppId, setTargetAppId] = useState<string>(resolvedApps[0]?.id || 'all');
  const [stage, setStage] = useState<'prelims' | 'mains' | 'both'>('prelims');
  const [questionCount, setQuestionCount] = useState<number>(50);
  const [durationMinutes, setDurationMinutes] = useState<number>(60);
  const [positiveMarks, setPositiveMarks] = useState<number>(2);
  const [negativeMarks, setNegativeMarks] = useState<number>(0.66);
  const [status, setStatus] = useState<'draft' | 'published' | 'archived'>('published');

  // Selected Question Snapshot for this test
  const [selectedQuestionsSnapshot, setSelectedQuestionsSnapshot] = useState<Question[]>([]);
  const [isGeneratingQuestions, setIsGeneratingQuestions] = useState<boolean>(false);

  const loadOfficialTests = async () => {
    setLoading(true);
    try {
      const allTests = await fetchMockTestsFromFirestore(
        selectedAppId === 'all' ? undefined : selectedAppId
      );
      setTests(allTests);
    } catch (e) {
      console.error('Failed to load official tests:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOfficialTests();
  }, [selectedAppId]);

  // Open Editor for new test
  const handleOpenNew = () => {
    setEditingTestId(null);
    setTitle('');
    setDescription('');
    setTargetAppId(selectedAppId === 'all' ? resolvedApps[0]?.id || 'all' : selectedAppId);
    setStage('prelims');
    setQuestionCount(30);
    setDurationMinutes(40);
    setPositiveMarks(2);
    setNegativeMarks(0.66);
    setStatus('published');
    setSelectedQuestionsSnapshot([]);
    setIsEditorOpen(true);
  };

  // Open Editor for existing test
  const handleEdit = (test: MockTest) => {
    setEditingTestId(test.id);
    setTitle(test.title);
    setDescription(test.description || '');
    setTargetAppId(test.appId);
    setStage(test.config.stage || 'prelims');
    setQuestionCount(test.questionsCount);
    setDurationMinutes(test.durationMinutes);
    setPositiveMarks(test.positiveMarks);
    setNegativeMarks(test.negativeMarks);
    setStatus((test.status as any) || 'published');
    setSelectedQuestionsSnapshot(test.questions || []);
    setIsEditorOpen(true);
  };

  // Auto-generate questions for snapshot
  const handleAutoAssemble = () => {
    setIsGeneratingQuestions(true);
    const draftConfig: MockTestConfig = {
      testType: 'full_length',
      stage,
      questionCount,
      durationMinutes,
      totalMarks: questionCount * positiveMarks,
      positiveMarks,
      negativeMarks
    };

    const { selectedQuestions } = generateMockTestQuestions(
      draftConfig,
      resolvedQuestions,
      resolvedCa,
      targetAppId
    );

    setSelectedQuestionsSnapshot(selectedQuestions);
    setIsGeneratingQuestions(false);
  };

  // Save official test
  const handleSave = async () => {
    if (!title.trim()) {
      alert('Please enter a title for the official mock test.');
      return;
    }

    let finalQs = selectedQuestionsSnapshot;

    if (finalQs.length === 0) {
      const draftConfig: MockTestConfig = {
        testType: 'full_length',
        stage,
        questionCount,
        durationMinutes,
        totalMarks: questionCount * positiveMarks,
        positiveMarks,
        negativeMarks
      };
      const { selectedQuestions } = generateMockTestQuestions(
        draftConfig,
        resolvedQuestions,
        resolvedCa,
        targetAppId
      );
      finalQs = selectedQuestions;
    }

    if (finalQs.length === 0) {
      alert('No questions available to create this test.');
      return;
    }

    const matchedApp = resolvedApps.find((a) => a.id === targetAppId);

    const testObject: MockTest = {
      id: editingTestId || `official_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      title,
      description,
      appId: targetAppId,
      appName: matchedApp?.name || 'Competitive Exams',
      creatorType: 'admin',
      creatorUserId: adminEmail,
      creatorUserName: 'Exam Board Admin',
      status,
      isOfficial: true,
      config: {
        testType: 'full_length',
        stage,
        questionCount: finalQs.length,
        durationMinutes,
        totalMarks: Number((finalQs.length * positiveMarks).toFixed(2)),
        positiveMarks,
        negativeMarks
      },
      questionIds: finalQs.map((q) => q.id),
      questions: finalQs,
      questionsCount: finalQs.length,
      durationMinutes,
      totalMarks: Number((finalQs.length * positiveMarks).toFixed(2)),
      positiveMarks,
      negativeMarks,
      createdAt: new Date().toISOString()
    };

    await saveMockTestToFirestore(testObject);
    setIsEditorOpen(false);
    loadOfficialTests();
  };

  // Delete test
  const handleDelete = async (id: string) => {
    if (window.confirm('Delete this official mock test?')) {
      await deleteMockTestFromFirestore(id);
      setTests((prev) => prev.filter((t) => t.id !== id));
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Controls - Luxurious Light Theme */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-3xl border border-slate-200 shadow-xs">
        <div className="flex items-center space-x-3">
          <div className="p-2.5 bg-amber-50 text-amber-700 rounded-2xl border border-amber-200 shadow-2xs">
            <Award className="w-5 h-5 text-[#C5A059]" />
          </div>
          <div>
            <h3 className="text-sm font-black text-slate-900">Official Mock Test Manager</h3>
            <p className="text-xs text-slate-500 font-medium">
              Create, publish, and schedule official exam mock papers for students.
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <select
            value={selectedAppId}
            onChange={(e) => setSelectedAppId(e.target.value)}
            className="bg-[#FAF8F5] border border-slate-200 text-xs text-slate-900 font-bold rounded-xl px-3.5 py-2.5 shadow-2xs cursor-pointer"
          >
            <option value="all">All App Categories</option>
            {resolvedApps.map((app) => (
              <option key={app.id} value={app.id}>
                {app.name}
              </option>
            ))}
          </select>

          <button
            onClick={handleOpenNew}
            className="px-4.5 py-2.5 bg-[#0F2942] hover:bg-blue-900 text-white rounded-xl text-xs font-black shadow-md flex items-center space-x-1.5 cursor-pointer"
          >
            <Plus className="w-4 h-4 text-[#C5A059]" />
            <span>Create Official Test</span>
          </button>
        </div>
      </div>

      {/* Tests Table */}
      {loading ? (
        <div className="py-12 text-center text-xs text-slate-500 font-medium">Loading tests...</div>
      ) : tests.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-3xl p-8 text-center text-xs text-slate-500 shadow-xs">
          No official tests published for this app yet. Click "Create Official Test" above.
        </div>
      ) : (
        <div className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-xs">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 bg-[#FAF8F5] text-slate-500 font-black uppercase tracking-wider text-[11px]">
                <th className="py-4 px-5">Test Title</th>
                <th className="py-4 px-5">Target App</th>
                <th className="py-4 px-5">Stage</th>
                <th className="py-4 px-5 text-center">Questions</th>
                <th className="py-4 px-5 text-center">Duration</th>
                <th className="py-4 px-5 text-center">Marks (+/-)</th>
                <th className="py-4 px-5 text-center">Status</th>
                <th className="py-4 px-5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {tests.map((t) => (
                <tr key={t.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-4 px-5 font-black text-slate-900">{t.title}</td>
                  <td className="py-4 px-5 text-slate-600 font-medium">{t.appName || t.appId}</td>
                  <td className="py-4 px-5 text-indigo-700 font-bold uppercase">{t.config.stage || 'Prelims'}</td>
                  <td className="py-4 px-5 text-center font-black text-slate-900">{t.questionsCount} Qs</td>
                  <td className="py-4 px-5 text-center text-slate-700 font-semibold">{t.durationMinutes}m</td>
                  <td className="py-4 px-5 text-center">
                    <span className="text-emerald-700 font-black">+{t.positiveMarks}</span> /{' '}
                    <span className="text-rose-700 font-black">-{t.negativeMarks}</span>
                  </td>
                  <td className="py-4 px-5 text-center">
                    <span
                      className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${
                        t.status === 'published'
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : 'bg-slate-100 text-slate-600 border border-slate-200'
                      }`}
                    >
                      {t.status}
                    </span>
                  </td>
                  <td className="py-4 px-5 text-right space-x-1.5">
                    <button
                      onClick={() => handleEdit(t)}
                      className="p-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl transition-colors cursor-pointer"
                      title="Edit"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(t.id)}
                      className="p-2 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-xl transition-colors cursor-pointer"
                      title="Delete"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Test Creation & Editing Modal - Luxurious Light Theme */}
      {isEditorOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="bg-white border border-slate-200 rounded-[2.5rem] w-full max-w-2xl shadow-2xl p-6 sm:p-8 text-slate-900 space-y-6 max-h-[90vh] overflow-y-auto custom-scrollbar my-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-amber-50 rounded-xl border border-amber-200 text-[#C5A059]">
                  <Sparkles className="w-5 h-5" />
                </div>
                <h3 className="text-lg font-black text-slate-900 tracking-tight">
                  {editingTestId ? 'Edit Official Mock Test' : 'Create Official Mock Test'}
                </h3>
              </div>
              <button onClick={() => setIsEditorOpen(false)} className="p-2 text-slate-400 hover:text-slate-900 rounded-xl hover:bg-slate-100 transition-colors cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 text-xs font-medium">
              <div>
                <label className="block text-slate-700 mb-1 font-black">Title</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. UPSC Prelims General Studies Official Mock - 1"
                  className="w-full bg-[#FAF8F5] border border-slate-200 rounded-2xl px-4 py-3 text-slate-900 font-semibold focus:outline-none focus:ring-2 focus:ring-[#0F2942]"
                />
              </div>

              <div>
                <label className="block text-slate-700 mb-1 font-black">Description</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={2}
                  placeholder="Test instructions and syllabus coverage..."
                  className="w-full bg-[#FAF8F5] border border-slate-200 rounded-2xl px-4 py-3 text-slate-900 font-semibold focus:outline-none focus:ring-2 focus:ring-[#0F2942]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 mb-1 font-black">Target App</label>
                  <select
                    value={targetAppId}
                    onChange={(e) => setTargetAppId(e.target.value)}
                    className="w-full bg-[#FAF8F5] border border-slate-200 rounded-2xl px-4 py-3 text-slate-900 font-semibold focus:outline-none focus:ring-2 focus:ring-[#0F2942]"
                  >
                    {resolvedApps.map((a) => (
                      <option key={a.id} value={a.id}>
                        {a.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-slate-700 mb-1 font-black">Stage</label>
                  <select
                    value={stage}
                    onChange={(e) => setStage(e.target.value as any)}
                    className="w-full bg-[#FAF8F5] border border-slate-200 rounded-2xl px-4 py-3 text-slate-900 font-semibold focus:outline-none focus:ring-2 focus:ring-[#0F2942]"
                  >
                    <option value="prelims">Prelims</option>
                    <option value="mains">Mains</option>
                    <option value="both">Both</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-4 gap-2">
                <div>
                  <label className="block text-slate-700 mb-1 font-black">Question Count</label>
                  <input
                    type="number"
                    value={questionCount}
                    onChange={(e) => setQuestionCount(parseInt(e.target.value) || 10)}
                    className="w-full bg-[#FAF8F5] border border-slate-200 rounded-2xl px-3 py-2.5 text-center text-slate-900 font-black"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 mb-1 font-black">Duration (Mins)</label>
                  <input
                    type="number"
                    value={durationMinutes}
                    onChange={(e) => setDurationMinutes(parseInt(e.target.value) || 15)}
                    className="w-full bg-[#FAF8F5] border border-slate-200 rounded-2xl px-3 py-2.5 text-center text-slate-900 font-black"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 mb-1 font-black">+ Positive</label>
                  <input
                    type="number"
                    step="0.5"
                    value={positiveMarks}
                    onChange={(e) => setPositiveMarks(parseFloat(e.target.value) || 1)}
                    className="w-full bg-emerald-50 border border-emerald-200 rounded-2xl px-3 py-2.5 text-center text-emerald-700 font-black"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 mb-1 font-black">- Negative</label>
                  <input
                    type="number"
                    step="0.05"
                    value={negativeMarks}
                    onChange={(e) => setNegativeMarks(parseFloat(e.target.value) || 0)}
                    className="w-full bg-rose-50 border border-rose-200 rounded-2xl px-3 py-2.5 text-center text-rose-700 font-black"
                  />
                </div>
              </div>

              {/* Question Snapshot Preview */}
              <div className="bg-[#FAF8F5] p-4 rounded-2xl border border-slate-200 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-black text-slate-800">
                    Selected Questions ({selectedQuestionsSnapshot.length})
                  </span>
                  <button
                    type="button"
                    onClick={handleAutoAssemble}
                    className="px-3.5 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-xl text-xs font-black border border-indigo-200 cursor-pointer shadow-2xs transition-colors"
                  >
                    Auto-Assemble Questions
                  </button>
                </div>
                {selectedQuestionsSnapshot.length > 0 && (
                  <div className="max-h-36 overflow-y-auto space-y-1 text-xs text-slate-600 pr-1 custom-scrollbar">
                    {selectedQuestionsSnapshot.slice(0, 10).map((q, i) => (
                      <div key={q.id} className="truncate">
                        {i + 1}. {q.questionText}
                      </div>
                    ))}
                    {selectedQuestionsSnapshot.length > 10 && (
                      <div className="text-indigo-600 font-black">
                        + {selectedQuestionsSnapshot.length - 10} more questions
                      </div>
                    )}
                  </div>
                )}
              </div>

              <div>
                <label className="block text-slate-700 mb-1 font-black">Publish Status</label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as any)}
                  className="w-full bg-[#FAF8F5] border border-slate-200 rounded-2xl px-4 py-3 text-slate-900 font-semibold focus:outline-none focus:ring-2 focus:ring-[#0F2942]"
                >
                  <option value="published">Published (Visible to Students)</option>
                  <option value="draft">Draft (Hidden)</option>
                  <option value="archived">Archived</option>
                </select>
              </div>
            </div>

            <div className="flex justify-end space-x-3 pt-3 border-t border-slate-100">
              <button
                onClick={() => setIsEditorOpen(false)}
                className="px-5 py-2.5 border border-slate-200 hover:bg-slate-50 rounded-xl text-xs font-black text-slate-700 cursor-pointer transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                className="px-6 py-2.5 bg-[#0F2942] hover:bg-blue-900 text-white font-black text-xs rounded-xl shadow-md flex items-center space-x-2 cursor-pointer transition-colors"
              >
                <Save className="w-4 h-4 text-[#C5A059]" />
                <span>Save Test</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminMockTestManager;
