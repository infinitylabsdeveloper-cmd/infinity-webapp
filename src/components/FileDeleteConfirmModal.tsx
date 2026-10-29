import React, { useState } from 'react';
import { Trash2, AlertTriangle, X, Loader2, FileWarning, CheckCircle2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export interface FileDeleteConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  fileName: string;
  fileDetails?: string;
  fileType?: string;
  recordCount?: number;
  onConfirmDelete: () => Promise<void>;
  title?: string;
  message?: string;
}

export const FileDeleteConfirmModal: React.FC<FileDeleteConfirmModalProps> = ({
  isOpen,
  onClose,
  fileName,
  fileDetails,
  fileType,
  recordCount,
  onConfirmDelete,
  title = 'Confirm File Deletion',
  message = 'Are you sure you want to delete this file? This action may not be reversible.',
}) => {
  const [isDeleting, setIsDeleting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleConfirm = async () => {
    if (isDeleting) return;
    setIsDeleting(true);
    setErrorMessage(null);
    try {
      await onConfirmDelete();
      // On success, the caller can close the modal or display post-deletion confirmation
      onClose();
    } catch (err: any) {
      console.error('File deletion error:', err);
      setErrorMessage(err?.message || 'Failed to delete the file. Please try again.');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <AnimatePresence>
      <div
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xs font-sans"
        role="dialog"
        aria-modal="true"
        aria-labelledby="delete-file-title"
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          transition={{ duration: 0.18 }}
          className="bg-white rounded-3xl p-6 sm:p-7 max-w-md w-full shadow-2xl border border-slate-200 overflow-hidden relative text-slate-800"
        >
          {/* Top highlight bar */}
          <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-rose-500 to-amber-500" />

          {/* Close button */}
          <button
            onClick={() => {
              if (!isDeleting) onClose();
            }}
            disabled={isDeleting}
            aria-label="Cancel and close dialog"
            className="absolute top-5 right-5 p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 disabled:opacity-40 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Header */}
          <div className="flex items-start gap-4 mt-2">
            <div className="w-12 h-12 rounded-2xl bg-rose-50 border border-rose-200 text-rose-600 flex items-center justify-center shrink-0 shadow-sm">
              <Trash2 className="w-6 h-6" />
            </div>

            <div className="min-w-0 pr-6">
              <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md inline-block mb-1 bg-rose-100 text-rose-800">
                Permanent Action
              </span>
              <h3 id="delete-file-title" className="text-base sm:text-lg font-black text-slate-900 tracking-tight leading-snug">
                {title}
              </h3>
            </div>
          </div>

          {/* File summary pill */}
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 mt-5 space-y-2">
            <div className="flex items-start gap-2.5">
              <FileWarning className="w-4 h-4 text-rose-500 mt-0.5 shrink-0" />
              <div className="min-w-0 flex-1">
                <p className="text-xs font-black text-slate-900 truncate" title={fileName}>
                  {fileName}
                </p>
                {fileDetails && (
                  <p className="text-[11px] text-slate-500 font-medium mt-0.5 leading-relaxed">
                    {fileDetails}
                  </p>
                )}
                <div className="flex items-center gap-2 mt-2 flex-wrap">
                  {fileType && (
                    <span className="text-[10px] font-mono font-bold bg-white px-2 py-0.5 rounded border border-slate-200 uppercase text-slate-600">
                      Type: {fileType}
                    </span>
                  )}
                  {recordCount !== undefined && (
                    <span className="text-[10px] font-bold bg-amber-50 text-amber-800 px-2 py-0.5 rounded border border-amber-200">
                      {recordCount} Records
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Warning Message */}
          <p className="text-xs sm:text-sm text-slate-600 font-medium leading-relaxed mt-4">
            {message}
          </p>

          {/* Error Message if deletion failed */}
          {errorMessage && (
            <div className="bg-rose-50 border border-rose-200 rounded-xl p-3 mt-4 text-xs text-rose-800 font-medium flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <span className="flex-1">{errorMessage}</span>
            </div>
          )}

          {/* Action buttons */}
          <div className="flex items-center justify-end gap-3 mt-6 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              disabled={isDeleting}
              className="px-4 py-2.5 rounded-xl text-xs font-black text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 transition-all cursor-pointer disabled:opacity-40"
            >
              Cancel
            </button>

            <button
              type="button"
              onClick={handleConfirm}
              disabled={isDeleting}
              className="px-5 py-2.5 rounded-xl text-xs font-black bg-rose-600 hover:bg-rose-700 active:scale-95 text-white shadow-md shadow-rose-600/20 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {isDeleting ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Deleting File...</span>
                </>
              ) : (
                <>
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Delete File</span>
                </>
              )}
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default FileDeleteConfirmModal;
