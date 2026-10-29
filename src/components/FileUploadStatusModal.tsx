import React from 'react';
import { CheckCircle2, AlertTriangle, X, FileText, Download, BarChart2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export interface FileUploadStatusModalProps {
  isOpen: boolean;
  onClose: () => void;
  status: 'success' | 'error';
  fileName: string;
  fileType?: string;
  fileSize?: string;
  title?: string;
  message: string;
  details?: {
    total?: number;
    successCount?: number;
    failedCount?: number;
    duplicatesCount?: number;
  };
  onViewReport?: () => void;
}

export const FileUploadStatusModal: React.FC<FileUploadStatusModalProps> = ({
  isOpen,
  onClose,
  status,
  fileName,
  fileType,
  fileSize,
  title,
  message,
  details,
  onViewReport,
}) => {
  if (!isOpen) return null;

  const isSuccess = status === 'success';

  return (
    <AnimatePresence>
      <div 
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xs"
        role="dialog"
        aria-modal="true"
        aria-labelledby="upload-status-title"
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 12 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 12 }}
          transition={{ duration: 0.18 }}
          className="bg-white rounded-3xl p-6 sm:p-7 max-w-lg w-full shadow-2xl border border-slate-200 overflow-hidden relative font-sans text-slate-800"
        >
          {/* Top highlight bar */}
          <div
            className={`absolute top-0 left-0 right-0 h-2 ${
              isSuccess
                ? 'bg-gradient-to-r from-emerald-500 to-teal-600'
                : 'bg-gradient-to-r from-rose-500 to-amber-600'
            }`}
          />

          {/* Close button */}
          <button
            onClick={onClose}
            aria-label="Close dialog"
            className="absolute top-5 right-5 p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Icon & Title */}
          <div className="flex items-start gap-4 mt-2">
            <div
              className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 shadow-sm ${
                isSuccess
                  ? 'bg-emerald-50 text-emerald-600 border border-emerald-200'
                  : 'bg-rose-50 text-rose-600 border border-rose-200'
              }`}
            >
              {isSuccess ? <CheckCircle2 className="w-6 h-6" /> : <AlertTriangle className="w-6 h-6" />}
            </div>

            <div className="min-w-0 pr-6">
              <span
                className={`text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md inline-block mb-1 ${
                  isSuccess
                    ? 'bg-emerald-100 text-emerald-800'
                    : 'bg-rose-100 text-rose-800'
                }`}
              >
                {isSuccess ? 'Upload Successful' : 'Upload Failed'}
              </span>
              <h3 id="upload-status-title" className="text-base sm:text-lg font-black text-slate-900 tracking-tight leading-snug">
                {title || (isSuccess ? 'File Processed Successfully' : 'File Upload Encountered Errors')}
              </h3>
            </div>
          </div>

          {/* File Metadata Card */}
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-3.5 mt-5 space-y-2">
            <div className="flex items-center gap-2.5">
              <FileText className="w-4 h-4 text-slate-500 shrink-0" />
              <div className="min-w-0 flex-1">
                <p className="text-xs font-bold text-slate-900 truncate" title={fileName}>
                  {fileName}
                </p>
                <div className="flex items-center gap-2 text-[10px] text-slate-500 font-medium mt-0.5">
                  {fileType && <span className="uppercase font-mono font-bold bg-white px-1.5 py-0.5 rounded border border-slate-200">{fileType}</span>}
                  {fileSize && <span>{fileSize}</span>}
                </div>
              </div>
            </div>
          </div>

          {/* Message */}
          <p className="text-xs sm:text-sm text-slate-600 font-medium leading-relaxed mt-4">
            {message}
          </p>

          {/* Detailed Metric Pills if available */}
          {details && (
            <div className="grid grid-cols-3 gap-2 mt-4 text-center">
              {details.total !== undefined && (
                <div className="bg-slate-100 p-2.5 rounded-xl border border-slate-200">
                  <div className="text-[10px] font-bold text-slate-500 uppercase">Total Detected</div>
                  <div className="text-sm font-black text-slate-900 mt-0.5">{details.total}</div>
                </div>
              )}
              {details.successCount !== undefined && (
                <div className="bg-emerald-50 p-2.5 rounded-xl border border-emerald-200">
                  <div className="text-[10px] font-bold text-emerald-700 uppercase">Saved</div>
                  <div className="text-sm font-black text-emerald-700 mt-0.5">{details.successCount}</div>
                </div>
              )}
              {details.failedCount !== undefined && (
                <div className="bg-rose-50 p-2.5 rounded-xl border border-rose-200">
                  <div className="text-[10px] font-bold text-rose-700 uppercase">Rejected / Failed</div>
                  <div className="text-sm font-black text-rose-700 mt-0.5">{details.failedCount}</div>
                </div>
              )}
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-3 mt-6 pt-4 border-t border-slate-100">
            {onViewReport && (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onViewReport();
                }}
                className="px-4 py-2.5 rounded-xl text-xs font-black bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <BarChart2 className="w-3.5 h-3.5" />
                <span>View Detailed Report</span>
              </button>
            )}

            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl text-xs font-black bg-slate-900 hover:bg-slate-800 text-white shadow-md transition-all cursor-pointer"
            >
              Close
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default FileUploadStatusModal;
