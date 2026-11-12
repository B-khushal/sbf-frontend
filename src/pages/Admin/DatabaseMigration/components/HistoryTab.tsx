import React, { useState, useEffect } from 'react';
import { 
  Clock, 
  FileText, 
  Download, 
  Trash2, 
  Eye, 
  CheckCircle2, 
  XCircle, 
  AlertTriangle, 
  RefreshCw,
  X,
  Layers,
  ArrowRight
} from 'lucide-react';
import { MigrationHistoryItem, dbMigrationService } from '@/services/dbMigrationService';
import { NeumorphicCard, SoftButton, StatusBadge } from '@/components/dashboard';
import { useToast } from '@/hooks/use-toast';

export const HistoryTab: React.FC = () => {
  const { toast } = useToast();
  const [history, setHistory] = useState<MigrationHistoryItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedItem, setSelectedItem] = useState<MigrationHistoryItem | null>(null);

  const fetchHistory = async () => {
    setLoading(true);
    try {
      const res = await dbMigrationService.getHistory();
      if (res.success) {
        setHistory(res.history);
      }
    } catch (err: any) {
      toast({ title: 'Failed to load history', description: err.message, variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  const handleDelete = async (migrationId: string) => {
    if (!window.confirm(`Delete migration record ${migrationId}?`)) return;
    try {
      await dbMigrationService.deleteHistory(migrationId);
      toast({ title: 'Record Deleted', description: 'Migration log and history entry removed.' });
      fetchHistory();
      if (selectedItem?.migrationId === migrationId) {
        setSelectedItem(null);
      }
    } catch (e: any) {
      toast({ title: 'Delete failed', description: e.message, variant: 'destructive' });
    }
  };

  const formatDuration = (ms: number) => {
    if (!ms) return '—';
    const s = Math.round(ms / 1000);
    if (s < 60) return `${s}s`;
    const m = Math.floor(s / 60);
    return `${m}m ${s % 60}s`;
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex items-center justify-between p-4 rounded-3xl bg-[var(--sbf-card)] border border-slate-200/60 dark:border-slate-800/60 sbf-neumo-raised-sm">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 flex items-center justify-center border border-indigo-200/50">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-slate-900 dark:text-white">
              Migration Audit Logs & Historic Runs ({history.length})
            </h4>
            <p className="text-xs text-slate-500">
              Immutable historical logs, execution metrics, and verification reports for all completed transfers.
            </p>
          </div>
        </div>

        <SoftButton
          variant="raised"
          size="sm"
          onClick={fetchHistory}
          loading={loading}
          icon={RefreshCw}
        >
          Refresh
        </SoftButton>
      </div>

      {history.length === 0 ? (
        <div className="p-12 text-center text-slate-400 border border-dashed rounded-3xl space-y-2">
          <Clock className="w-8 h-8 mx-auto text-slate-400 opacity-60" />
          <h4 className="text-base font-bold text-slate-700 dark:text-slate-300">
            No Migration History Recorded
          </h4>
          <p className="text-xs max-w-sm mx-auto">
            Once you execute a migration, full audit logs and verification reports will be securely preserved here.
          </p>
        </div>
      ) : (
        <NeumorphicCard variant="raised">
          <div className="overflow-x-auto rounded-2xl border border-slate-200/70 dark:border-slate-800/70">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-100/70 dark:bg-slate-800/70 text-[11px] text-slate-500 font-bold uppercase">
                <tr>
                  <th className="py-2.5 px-3">Status</th>
                  <th className="py-2.5 px-3">Migration ID</th>
                  <th className="py-2.5 px-3">Type</th>
                  <th className="py-2.5 px-3">Started By</th>
                  <th className="py-2.5 px-3">Tables</th>
                  <th className="py-2.5 px-3">Records</th>
                  <th className="py-2.5 px-3">Duration</th>
                  <th className="py-2.5 px-3">Timestamp</th>
                  <th className="py-2.5 px-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-mono text-[11px]">
                {history.map(item => {
                  const isDone = item.status === 'completed';
                  const isFail = item.status === 'failed';
                  const isCancel = item.status === 'cancelled';
                  return (
                    <tr key={item.migrationId} className="hover:bg-slate-50 dark:hover:bg-slate-850">
                      <td className="py-2.5 px-3">
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-sans font-bold uppercase ${
                          isDone
                            ? 'bg-emerald-100 text-emerald-800'
                            : isFail
                            ? 'bg-rose-100 text-rose-800'
                            : isCancel
                            ? 'bg-slate-100 text-slate-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}>
                          {isDone ? <CheckCircle2 className="w-3 h-3 text-emerald-600" /> : <AlertTriangle className="w-3 h-3" />}
                          {item.status}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 font-bold text-slate-900 dark:text-white">
                        {item.migrationId}
                      </td>
                      <td className="py-2.5 px-3 font-sans capitalize text-slate-700 dark:text-slate-300">
                        {item.migrationType}
                      </td>
                      <td className="py-2.5 px-3 font-sans text-slate-600 dark:text-slate-400">
                        {item.startedBy}
                      </td>
                      <td className="py-2.5 px-3 text-slate-700 dark:text-slate-300">
                        {item.tablesSelected?.length || 0}
                      </td>
                      <td className="py-2.5 px-3 font-bold text-emerald-600 dark:text-emerald-400">
                        {item.recordsTransferred.toLocaleString()}
                      </td>
                      <td className="py-2.5 px-3 text-slate-500">
                        {formatDuration(item.durationMs)}
                      </td>
                      <td className="py-2.5 px-3 text-slate-400 text-[10px]">
                        {new Date(item.startedAt).toLocaleString()}
                      </td>
                      <td className="py-2.5 px-3 text-right font-sans">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            type="button"
                            onClick={() => setSelectedItem(item)}
                            className="p-1 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300"
                            title="View Run Details"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>
                          <a
                            href={dbMigrationService.getDownloadLogsUrl(item.migrationId)}
                            target="_blank"
                            rel="noreferrer"
                            className="p-1 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300"
                            title="Download Execution Log"
                          >
                            <Download className="w-3.5 h-3.5" />
                          </a>
                          <button
                            type="button"
                            onClick={() => handleDelete(item.migrationId)}
                            className="p-1 rounded-lg hover:bg-rose-100 text-rose-600"
                            title="Delete History Entry"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </NeumorphicCard>
      )}

      {/* Details Modal */}
      {selectedItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="w-full max-w-xl bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl p-6 space-y-4 text-xs">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200/60 dark:border-slate-800/60">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  Migration Details: {selectedItem.migrationId}
                </h3>
                <p className="text-slate-400 font-mono text-[10px]">
                  Started: {new Date(selectedItem.startedAt).toLocaleString()}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setSelectedItem(null)}
                className="w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:bg-slate-100"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3 p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/50">
              <div>
                <span className="text-[10px] text-slate-400 uppercase font-bold">Source Identifier</span>
                <p className="font-mono text-slate-800 dark:text-slate-200">{selectedItem.sourceIdentifier}</p>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 uppercase font-bold">Destination Identifier</span>
                <p className="font-mono text-slate-800 dark:text-slate-200">{selectedItem.destIdentifier}</p>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2 text-center font-mono">
              <div className="p-2.5 rounded-xl border border-slate-200/50">
                <span className="text-[10px] text-slate-400 uppercase font-sans">Type</span>
                <p className="font-bold text-slate-800 dark:text-slate-200 capitalize mt-0.5">{selectedItem.migrationType}</p>
              </div>
              <div className="p-2.5 rounded-xl border border-slate-200/50">
                <span className="text-[10px] text-slate-400 uppercase font-sans">Transferred</span>
                <p className="font-bold text-emerald-600 mt-0.5">{selectedItem.recordsTransferred.toLocaleString()}</p>
              </div>
              <div className="p-2.5 rounded-xl border border-slate-200/50">
                <span className="text-[10px] text-slate-400 uppercase font-sans">Duration</span>
                <p className="font-bold text-slate-800 dark:text-slate-200 mt-0.5">{formatDuration(selectedItem.durationMs)}</p>
              </div>
            </div>

            {selectedItem.errorDetails && (
              <div className="p-3 rounded-2xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-800">
                <span className="text-[10px] text-rose-600 dark:text-rose-400 uppercase font-bold block mb-1">
                  Error / Warning Details
                </span>
                <p className="font-mono text-[11px] text-rose-700 dark:text-rose-300 break-words whitespace-pre-wrap max-h-28 overflow-y-auto">
                  {selectedItem.errorDetails}
                </p>
              </div>
            )}

            <div>
              <span className="font-bold text-slate-800 dark:text-slate-200 block mb-1">
                Tables Processed ({selectedItem.tablesSelected?.length || 0}):
              </span>
              <div className="max-h-36 overflow-y-auto p-2 rounded-xl bg-slate-50 dark:bg-slate-800/40 font-mono text-[11px] space-y-0.5">
                {selectedItem.tablesSelected?.map(t => (
                  <div key={t} className="text-slate-600 dark:text-slate-400">• {t}</div>
                ))}
              </div>
            </div>

            <div className="pt-2 flex justify-end gap-2">
              <a
                href={dbMigrationService.getDownloadLogsUrl(selectedItem.migrationId)}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 font-bold text-slate-700 dark:text-slate-300"
              >
                <Download className="w-3.5 h-3.5" />
                Download Log File
              </a>
              <SoftButton variant="raised" size="sm" onClick={() => setSelectedItem(null)}>
                Close
              </SoftButton>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

