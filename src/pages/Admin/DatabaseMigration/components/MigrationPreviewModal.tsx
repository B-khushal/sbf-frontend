import React, { useState } from 'react';
import { 
  AlertTriangle, 
  ShieldAlert, 
  CheckCircle2, 
  X, 
  Database, 
  Server, 
  Layers, 
  HardDrive,
  ArrowRight,
  ShieldCheck,
  FileCheck
} from 'lucide-react';
import { SoftButton } from '@/components/dashboard';

interface MigrationPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  previewData: any;
  loading: boolean;
  sourceMasked: string;
  destMasked: string;
}

export const MigrationPreviewModal: React.FC<MigrationPreviewModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  previewData,
  loading,
  sourceMasked,
  destMasked
}) => {
  const [typedConfirmation, setTypedConfirmation] = useState('');
  const [agreeCheckbox, setAgreeCheckbox] = useState(false);

  if (!isOpen || !previewData) return null;

  const isDestructive = previewData.conflictStrategy === 'replace' || previewData.willOverwrite;
  const isConfirmDisabled = isDestructive
    ? (typedConfirmation.trim().toUpperCase() !== 'CONFIRM' || !agreeCheckbox)
    : false;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="w-full max-w-2xl bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800/80 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className={`p-5 flex items-center justify-between border-b ${
          isDestructive
            ? 'bg-rose-50/70 dark:bg-rose-950/40 border-rose-200/60 dark:border-rose-900/40'
            : 'bg-slate-50 dark:bg-slate-800/60 border-slate-200/60 dark:border-slate-800/60'
        }`}>
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-2xl flex items-center justify-center ${
              isDestructive
                ? 'bg-rose-600 text-white'
                : 'bg-indigo-600 text-white'
            }`}>
              {isDestructive ? <ShieldAlert className="w-5 h-5" /> : <FileCheck className="w-5 h-5" />}
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                {isDestructive ? 'Destructive Migration Pre-Flight Confirmation' : 'Migration Pre-Flight Review'}
              </h3>
              <p className="text-xs text-slate-500">
                Verify target parameters and schema impact before starting backend transfer.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-600 hover:bg-slate-200/50"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-4 text-xs">
          {/* Destructive Warning */}
          {isDestructive && (
            <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-900/60 text-rose-900 dark:text-rose-200 space-y-2">
              <div className="flex items-center gap-2 font-black text-sm text-rose-700 dark:text-rose-300">
                <AlertTriangle className="w-4 h-4" />
                CAUTION: DESTINATION DATA WILL BE REPLACED / OVERWRITTEN
              </div>
              <p>
                You have chosen the <strong>'{previewData.conflictStrategy}'</strong> strategy. Destination tables will be truncated or updated with incoming source data. An automatic snapshot backup will be taken before execution.
              </p>
            </div>
          )}

          {/* Database Targets Card */}
          <div className="grid grid-cols-2 gap-3 p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-800/60">
            <div>
              <span className="text-[10px] text-slate-400 uppercase font-bold block mb-1">
                Source Database (Read-Only)
              </span>
              <p className="font-mono font-bold text-rose-600 dark:text-rose-400 truncate">
                {sourceMasked}
              </p>
            </div>
            <div>
              <span className="text-[10px] text-slate-400 uppercase font-bold block mb-1">
                Destination Database (Target)
              </span>
              <p className="font-mono font-bold text-emerald-600 dark:text-emerald-400 truncate">
                {destMasked}
              </p>
            </div>
          </div>

          {/* Migration Summary Stats */}
          <div className="grid grid-cols-3 gap-3 text-center">
            <div className="p-3 rounded-2xl bg-white dark:bg-slate-800/80 border border-slate-200/60 dark:border-slate-700/60">
              <span className="text-[10px] text-slate-400 uppercase font-bold">Selected Tables</span>
              <p className="text-xl font-black text-slate-900 dark:text-white mt-0.5">
                {previewData.selectedTablesCount}
              </p>
            </div>
            <div className="p-3 rounded-2xl bg-white dark:bg-slate-800/80 border border-slate-200/60 dark:border-slate-700/60">
              <span className="text-[10px] text-slate-400 uppercase font-bold">Estimated Rows</span>
              <p className="text-xl font-black text-slate-900 dark:text-white mt-0.5">
                {previewData.estimatedTotalRecords?.toLocaleString()}
              </p>
            </div>
            <div className="p-3 rounded-2xl bg-white dark:bg-slate-800/80 border border-slate-200/60 dark:border-slate-700/60">
              <span className="text-[10px] text-slate-400 uppercase font-bold">Strategy</span>
              <p className="text-xl font-black text-indigo-600 dark:text-indigo-400 uppercase mt-0.5">
                {previewData.conflictStrategy}
              </p>
            </div>
          </div>

          {/* Table List Scrollable */}
          <div>
            <span className="font-bold text-slate-800 dark:text-slate-200 block mb-2">
              Tables to be Migrated ({previewData.selectedTables?.length || 0}):
            </span>
            <div className="max-h-36 overflow-y-auto rounded-xl border border-slate-200/70 dark:border-slate-800/70 divide-y divide-slate-100 dark:divide-slate-800 p-1 font-mono text-[11px]">
              {previewData.selectedTables?.map((t: any) => (
                <div key={t.fullName} className="py-1 px-2 flex items-center justify-between">
                  <span className="text-slate-700 dark:text-slate-300">{t.fullName}</span>
                  <span className="text-slate-400">~{t.estimatedRows} rows ({t.prettySize})</span>
                </div>
              ))}
            </div>
          </div>

          {/* Mandatory Confirmation Input for destructive operations */}
          {isDestructive && (
            <div className="space-y-3 pt-2">
              <label className="flex items-start gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={agreeCheckbox}
                  onChange={(e) => setAgreeCheckbox(e.target.checked)}
                  className="mt-0.5 rounded text-rose-600 focus:ring-rose-500"
                />
                <span className="text-slate-700 dark:text-slate-300">
                  I understand that this action modifies the destination database. A safety snapshot backup will be created.
                </span>
              </label>

              <div>
                <label className="block font-bold text-slate-800 dark:text-slate-200 mb-1">
                  Type <code>CONFIRM</code> to unlock execution:
                </label>
                <input
                  type="text"
                  value={typedConfirmation}
                  onChange={(e) => setTypedConfirmation(e.target.value)}
                  placeholder="CONFIRM"
                  className="w-full px-3 py-2 rounded-xl border border-rose-300 dark:border-rose-800 font-mono text-xs focus:ring-2 focus:ring-rose-500 uppercase tracking-wider"
                />
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-slate-200/60 dark:border-slate-800/60 bg-slate-50 dark:bg-slate-900/40 flex items-center justify-end gap-2">
          <SoftButton variant="raised" size="md" onClick={onClose} disabled={loading}>
            Cancel
          </SoftButton>
          <SoftButton
            variant={isDestructive ? 'danger' : 'primary'}
            size="md"
            onClick={onConfirm}
            loading={loading}
            disabled={isConfirmDisabled}
            icon={ArrowRight}
          >
            Execute Migration Now
          </SoftButton>
        </div>
      </div>
    </div>
  );
};

