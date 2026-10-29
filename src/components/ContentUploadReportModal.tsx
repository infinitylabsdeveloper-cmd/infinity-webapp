import React, { useState, useMemo } from 'react';
import { 
  X, Download, CheckCircle2, AlertTriangle, AlertCircle, 
  Search, ChevronLeft, ChevronRight, FileText, Layers, ListFilter
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export interface UploadRecordIssue {
  rowNumber: number | string;
  identifier?: string;
  recordSnippet?: string;
  field?: string;
  issueType: 'rejected' | 'failed' | 'duplicate';
  reason: string;
}

export interface SuccessfulRecordSummary {
  rowNumber: number | string;
  identifier?: string;
  title: string;
  details?: string;
}

export interface DetailedUploadReport {
  contentType: 'mcq' | 'syllabus' | 'current_affairs';
  fileName: string;
  fileType?: string;
  fileSize?: string;
  targetAppId: string;
  targetAppName: string;
  totalDetected: number;
  successfullyUploaded: number;
  rejectedCount: number;
  failedCount: number;
  duplicatesSkipped: number;
  issues: UploadRecordIssue[];
  successfulRecords?: SuccessfulRecordSummary[];
  timestamp: string;
}

export interface ContentUploadReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  report: DetailedUploadReport | null;
}

export const ContentUploadReportModal: React.FC<ContentUploadReportModalProps> = ({
  isOpen,
  onClose,
  report,
}) => {
  const [activeTab, setActiveTab] = useState<'issues' | 'success'>('issues');
  const [searchQuery, setSearchQuery] = useState('');
  const [issueTypeFilter, setIssueTypeFilter] = useState<'all' | 'rejected' | 'failed' | 'duplicate'>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 15;

  if (!isOpen || !report) return null;

  // Filter issues
  const filteredIssues = useMemo(() => {
    return report.issues.filter((issue) => {
      const matchType = issueTypeFilter === 'all' || issue.issueType === issueTypeFilter;
      const query = searchQuery.trim().toLowerCase();
      if (!query) return matchType;

      const rowMatch = String(issue.rowNumber).toLowerCase().includes(query);
      const reasonMatch = issue.reason.toLowerCase().includes(query);
      const identMatch = issue.identifier?.toLowerCase().includes(query) ?? false;
      const snippetMatch = issue.recordSnippet?.toLowerCase().includes(query) ?? false;
      const fieldMatch = issue.field?.toLowerCase().includes(query) ?? false;

      return matchType && (rowMatch || reasonMatch || identMatch || snippetMatch || fieldMatch);
    });
  }, [report.issues, issueTypeFilter, searchQuery]);

  const totalPages = Math.ceil(filteredIssues.length / pageSize) || 1;
  const paginatedIssues = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredIssues.slice(start, start + pageSize);
  }, [filteredIssues, currentPage]);

  // Export CSV of rejected/failed items
  const handleDownloadCsv = () => {
    if (!report.issues || report.issues.length === 0) return;

    const headers = ['Row Number', 'Record Identifier', 'Issue Type', 'Problematic Field', 'Actionable Reason', 'Record Snippet'];
    const rows = report.issues.map((iss) => [
      `"${String(iss.rowNumber).replace(/"/g, '""')}"`,
      `"${String(iss.identifier || '').replace(/"/g, '""')}"`,
      `"${String(iss.issueType).toUpperCase()}"`,
      `"${String(iss.field || '').replace(/"/g, '""')}"`,
      `"${String(iss.reason).replace(/"/g, '""')}"`,
      `"${String(iss.recordSnippet || '').replace(/"/g, '""')}"`,
    ]);

    const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    const cleanFileName = report.fileName.replace(/\.[^/.]+$/, '');
    link.setAttribute('download', `${cleanFileName}_Upload_Issues_Report_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const contentTypeLabel =
    report.contentType === 'mcq'
      ? 'MCQ Questions Upload'
      : report.contentType === 'syllabus'
      ? 'Syllabus (Subjects, Units, Topics) Upload'
      : 'Current Affairs Upload';

  return (
    <AnimatePresence>
      <div
        className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-950/80 backdrop-blur-xs font-sans text-slate-800"
        role="dialog"
        aria-modal="true"
        aria-labelledby="report-modal-title"
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          transition={{ duration: 0.2 }}
          className="bg-white rounded-3xl w-full max-w-5xl max-h-[92vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden relative"
        >
          {/* Header */}
          <div className="p-4 sm:p-6 border-b border-slate-200 bg-slate-50/70 flex items-start justify-between gap-4 shrink-0">
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="px-2.5 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider bg-indigo-100 text-indigo-800 border border-indigo-200">
                  {contentTypeLabel}
                </span>
                <span className="text-[11px] text-slate-500 font-medium">
                  {report.timestamp}
                </span>
              </div>
              <h2 id="report-modal-title" className="text-base sm:text-xl font-black text-slate-900 tracking-tight mt-1 truncate">
                Upload Verification & Processing Summary
              </h2>
              <p className="text-xs text-slate-500 font-medium mt-0.5 truncate">
                File: <strong className="text-slate-800 font-bold">{report.fileName}</strong> • Target App: <strong className="text-slate-800 font-bold">{report.targetAppName}</strong> ({report.targetAppId})
              </p>
            </div>

            <button
              onClick={onClose}
              aria-label="Close report modal"
              className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-200 transition-colors cursor-pointer shrink-0"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Metrics Summary Strip */}
          <div className="p-4 sm:p-6 bg-white border-b border-slate-200 shrink-0">
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
              {/* Total */}
              <div className="bg-slate-50 p-3 sm:p-4 rounded-2xl border border-slate-200 text-center">
                <span className="text-[10px] font-black text-slate-500 uppercase tracking-wider block">Total Detected</span>
                <span className="text-lg sm:text-2xl font-black text-slate-900 mt-1 block">{report.totalDetected}</span>
              </div>

              {/* Success */}
              <div className="bg-emerald-50/80 p-3 sm:p-4 rounded-2xl border border-emerald-200 text-center">
                <span className="text-[10px] font-black text-emerald-700 uppercase tracking-wider block">Uploaded & Saved</span>
                <span className="text-lg sm:text-2xl font-black text-emerald-700 mt-1 block">{report.successfullyUploaded}</span>
              </div>

              {/* Rejected */}
              <div className="bg-amber-50/80 p-3 sm:p-4 rounded-2xl border border-amber-200 text-center">
                <span className="text-[10px] font-black text-amber-700 uppercase tracking-wider block">Rejected (Invalid)</span>
                <span className="text-lg sm:text-2xl font-black text-amber-700 mt-1 block">{report.rejectedCount}</span>
              </div>

              {/* Failed */}
              <div className="bg-rose-50/80 p-3 sm:p-4 rounded-2xl border border-rose-200 text-center">
                <span className="text-[10px] font-black text-rose-700 uppercase tracking-wider block">Failed (DB Error)</span>
                <span className="text-lg sm:text-2xl font-black text-rose-700 mt-1 block">{report.failedCount}</span>
              </div>

              {/* Duplicates */}
              <div className="bg-indigo-50/80 p-3 sm:p-4 rounded-2xl border border-indigo-200 text-center col-span-2 sm:col-span-1">
                <span className="text-[10px] font-black text-indigo-700 uppercase tracking-wider block">Duplicates Skipped</span>
                <span className="text-lg sm:text-2xl font-black text-indigo-700 mt-1 block">{report.duplicatesSkipped}</span>
              </div>
            </div>
          </div>

          {/* Navigation Tabs & Actions Bar */}
          <div className="px-4 sm:px-6 py-3 bg-slate-50 border-b border-slate-200 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 shrink-0">
            <div className="flex items-center gap-2">
              <button
                onClick={() => { setActiveTab('issues'); setCurrentPage(1); }}
                className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer flex items-center gap-1.5 ${
                  activeTab === 'issues'
                    ? 'bg-slate-900 text-white shadow-sm'
                    : 'bg-white text-slate-600 hover:bg-slate-200 border border-slate-200'
                }`}
              >
                <AlertCircle className="w-3.5 h-3.5 text-amber-400" />
                <span>Issues & Rejections ({report.issues.length})</span>
              </button>

              {report.successfulRecords && report.successfulRecords.length > 0 && (
                <button
                  onClick={() => { setActiveTab('success'); setCurrentPage(1); }}
                  className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer flex items-center gap-1.5 ${
                    activeTab === 'success'
                      ? 'bg-slate-900 text-white shadow-sm'
                      : 'bg-white text-slate-600 hover:bg-slate-200 border border-slate-200'
                  }`}
                >
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Saved Records ({report.successfulRecords.length})</span>
                </button>
              )}
            </div>

            {report.issues.length > 0 && (
              <button
                onClick={handleDownloadCsv}
                className="px-4 py-2 rounded-xl text-xs font-black bg-emerald-600 hover:bg-emerald-500 text-white shadow-sm transition-all flex items-center justify-center gap-1.5 cursor-pointer self-start sm:self-auto shrink-0"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download Error Report (CSV)</span>
              </button>
            )}
          </div>

          {/* Content Area */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-white min-h-[260px]">
            {activeTab === 'issues' && (
              <div className="space-y-4">
                {/* Search & Issue Type Filter */}
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
                  <div className="relative flex-1">
                    <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
                      placeholder="Search rejected reasons, row numbers, or snippets..."
                      className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-indigo-500"
                    />
                  </div>

                  <div className="flex items-center gap-1 shrink-0">
                    <span className="text-[10px] font-black uppercase text-slate-400 px-1">Filter:</span>
                    {(['all', 'rejected', 'failed', 'duplicate'] as const).map((type) => (
                      <button
                        key={type}
                        onClick={() => { setIssueTypeFilter(type); setCurrentPage(1); }}
                        className={`px-2.5 py-1 rounded-lg text-[11px] font-bold capitalize transition-all cursor-pointer ${
                          issueTypeFilter === type
                            ? 'bg-indigo-600 text-white shadow-xs'
                            : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                        }`}
                      >
                        {type === 'all' ? 'All' : type}
                      </button>
                    ))}
                  </div>
                </div>

                {filteredIssues.length === 0 ? (
                  <div className="text-center py-12 space-y-2">
                    <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto" />
                    <h4 className="text-sm font-black text-slate-800">
                      {report.issues.length === 0
                        ? 'Zero Issues Detected!'
                        : 'No issues match the search criteria'}
                    </h4>
                    <p className="text-xs text-slate-500">
                      {report.issues.length === 0
                        ? 'All records complied with required fields and database validation rules.'
                        : 'Try adjusting your search query or type filter.'}
                    </p>
                  </div>
                ) : (
                  <div className="border border-slate-200 rounded-2xl overflow-hidden shadow-xs">
                    <div className="overflow-x-auto">
                      <table className="w-full text-left border-collapse text-xs">
                        <thead>
                          <tr className="bg-slate-50 border-b border-slate-200 text-[10px] font-black uppercase text-slate-500 tracking-wider">
                            <th className="py-3 px-3 w-16">Row #</th>
                            <th className="py-3 px-3 w-28">Type</th>
                            <th className="py-3 px-3">Actionable Reason & Missing Fields</th>
                            <th className="py-3 px-3">Record Snippet / Details</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {paginatedIssues.map((issue, idx) => (
                            <tr key={idx} className="hover:bg-slate-50/70 transition-colors">
                              <td className="py-2.5 px-3 font-mono font-bold text-slate-700 whitespace-nowrap">
                                #{issue.rowNumber}
                              </td>

                              <td className="py-2.5 px-3 whitespace-nowrap">
                                <span
                                  className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase inline-block ${
                                    issue.issueType === 'duplicate'
                                      ? 'bg-indigo-100 text-indigo-800 border border-indigo-200'
                                      : issue.issueType === 'failed'
                                      ? 'bg-rose-100 text-rose-800 border border-rose-200'
                                      : 'bg-amber-100 text-amber-800 border border-amber-200'
                                  }`}
                                >
                                  {issue.issueType}
                                </span>
                              </td>

                              <td className="py-2.5 px-3">
                                <div className="font-bold text-slate-900 leading-snug">
                                  {issue.reason}
                                </div>
                                {issue.field && (
                                  <div className="text-[11px] font-mono text-rose-600 mt-0.5">
                                    Field: <span className="underline">{issue.field}</span>
                                  </div>
                                )}
                              </td>

                              <td className="py-2.5 px-3 max-w-xs sm:max-w-md">
                                {issue.identifier && (
                                  <div className="text-[10px] font-mono text-slate-400">
                                    ID: {issue.identifier}
                                  </div>
                                )}
                                <div className="text-slate-600 font-medium text-[11px] truncate" title={issue.recordSnippet || ''}>
                                  {issue.recordSnippet || '—'}
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>

                    {/* Pagination */}
                    {totalPages > 1 && (
                      <div className="p-3 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs">
                        <span className="text-slate-500 font-medium">
                          Showing {(currentPage - 1) * pageSize + 1} to {Math.min(currentPage * pageSize, filteredIssues.length)} of {filteredIssues.length} issues
                        </span>
                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                            disabled={currentPage === 1}
                            className="p-1.5 rounded-lg bg-white border border-slate-200 hover:bg-slate-100 disabled:opacity-40 cursor-pointer"
                          >
                            <ChevronLeft className="w-4 h-4" />
                          </button>
                          <span className="px-2 font-bold text-slate-700">
                            Page {currentPage} of {totalPages}
                          </span>
                          <button
                            onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                            disabled={currentPage === totalPages}
                            className="p-1.5 rounded-lg bg-white border border-slate-200 hover:bg-slate-100 disabled:opacity-40 cursor-pointer"
                          >
                            <ChevronRight className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {activeTab === 'success' && report.successfulRecords && (
              <div className="space-y-3">
                <div className="text-xs text-slate-500 font-medium">
                  The following {report.successfulRecords.length} records were validated and successfully committed to database storage:
                </div>

                <div className="border border-slate-200 rounded-2xl overflow-hidden shadow-xs">
                  <div className="overflow-x-auto max-h-96">
                    <table className="w-full text-left border-collapse text-xs">
                      <thead className="sticky top-0 bg-slate-50 border-b border-slate-200 z-10">
                        <tr className="text-[10px] font-black uppercase text-slate-500 tracking-wider">
                          <th className="py-2.5 px-3 w-16">Row #</th>
                          <th className="py-2.5 px-3">Item Title / Question</th>
                          <th className="py-2.5 px-3">Target / Details</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {report.successfulRecords.map((item, idx) => (
                          <tr key={idx} className="hover:bg-slate-50/70">
                            <td className="py-2 px-3 font-mono font-bold text-slate-700">
                              #{item.rowNumber}
                            </td>
                            <td className="py-2 px-3 font-bold text-slate-900 max-w-sm truncate" title={item.title}>
                              {item.title}
                            </td>
                            <td className="py-2 px-3 text-slate-600 font-medium text-[11px] truncate">
                              {item.details || '—'}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="p-4 sm:p-5 border-t border-slate-200 bg-slate-50/80 flex items-center justify-between gap-3 shrink-0">
            <div className="text-xs text-slate-500 font-medium hidden sm:block">
              {report.rejectedCount + report.failedCount > 0
                ? 'Tip: Download the CSV report to fix rejected records, then re-upload.'
                : 'Upload passed all schema validations and database checks.'}
            </div>

            <button
              onClick={onClose}
              className="px-6 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-black shadow-md transition-all cursor-pointer w-full sm:w-auto"
            >
              Close Report
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default ContentUploadReportModal;
