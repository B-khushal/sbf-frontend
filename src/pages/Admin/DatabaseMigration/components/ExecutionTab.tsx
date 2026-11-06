import React, { useEffect, useRef, useState } from 'react';
import { 
  Play, 
  Pause, 
  Square, 
  Terminal, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  Zap, 
  Layers, 
  AlertTriangle, 
  RotateCcw,
  Download,
  Flame,
  Check
} from 'lucide-react';
import { MigrationStatus, dbMigrationService } from '@/services/dbMigrationService';
import { NeumorphicCard, SoftButton, StatusBadge } from '@/components/dashboard';
import { useToast } from '@/hooks/use-toast';

interface ExecutionTabProps {
  migrationStatus: MigrationStatus | null;
  onRefreshStatus: () => void;
  onViewVerification: () => void;
}

export const ExecutionTab: React.FC<ExecutionTabProps> = ({
  migrationStatus,
  onRefreshStatus,
  onViewVerification
}) => {
  const { toast } = useToast();
  const logTerminalRef = useRef<HTMLDivElement>(null);
  const [autoScroll, setAutoScroll] = useState(true);
  const [logFilter, setLogFilter] = useState<'all' | 'error' | 'warning'>('all');
  const [actionLoading, setActionLoading] = useState(false);

  // Auto-scroll logs terminal
  useEffect(() => {
    if (autoScroll && logTerminalRef.current) {
      logTerminalRef.current.scrollTop = logTerminalRef.current.scrollHeight;
    }
  }, [migrationStatus?.recentLogs, autoScroll]);

  const handlePause = async () => {
    setActionLoading(true);
    try {
      await dbMigrationService.pauseMigration();
      toast({ title: 'Migration Paused', description: 'Engine has paused between streaming batches.' });
      onRefreshStatus();
    } catch (e: any) {
      toast({ title: 'Failed to pause', description: e.message, variant: 'destructive' });
    } finally {
      setActionLoading(false);
    }
  };

  const handleResume = async () => {
    setActionLoading(true);
    try {
      await dbMigrationService.resumeMigration();
      toast({ title: 'Migration Resumed', description: 'Batch streaming is continuing.' });
      onRefreshStatus();
    } catch (e: any) {
      toast({ title: 'Failed to resume', description: e.message, variant: 'destructive' });
    } finally {
      setActionLoading(false);
    }
  };

  const handleCancel = async () => {
    if (!window.confirm('Are you sure you want to cancel the active migration? Any remaining tables will not be transferred.')) {
      return;
    }
    setActionLoading(true);
    try {
      await dbMigrationService.cancelMigration();
      toast({ title: 'Migration Cancelled', description: 'Halting current background job.' });
      onRefreshStatus();
    } catch (e: any) {
      toast({ title: 'Failed to cancel', description: e.message, variant: 'destructive' });
    } finally {
      setActionLoading(false);
    }
  };

  if (!migrationStatus || (migrationStatus.status === 'idle' && !migrationStatus.migrationId)) {
    return (
      <div className="p-12 text-center text-slate-400 border border-dashed rounded-3xl space-y-3">
        <Layers className="w-8 h-8 mx-auto text-slate-400 opacity-60" />
        <h4 className="text-base font-bold text-slate-700 dark:text-slate-300">
          No Migration Job Currently Running
        </h4>
        <p className="text-xs max-w-md mx-auto">
          Configure migration parameters in the <strong>Migration Configuration</strong> tab and launch a transfer to view live progress, throughput speed, and real-time logs here.
        </p>
      </div>
    );
  }

  const isRunning = migrationStatus.status === 'running' || migrationStatus.status === 'starting';
  const isPaused = migrationStatus.status === 'paused' || migrationStatus.isPaused;
  const isCompleted = migrationStatus.status === 'completed';
  const isFailed = migrationStatus.status === 'failed';
  const isCancelled = migrationStatus.status === 'cancelled';

  const formatDuration = (ms: number) => {
    if (!ms || ms < 0) return '0s';
    const seconds = Math.floor((ms / 1000) % 60);
    const minutes = Math.floor((ms / (1000 * 60)) % 60);
    const hours = Math.floor(ms / (1000 * 60 * 60));
    if (hours > 0) return `${hours}h ${minutes}m ${seconds}s`;
    if (minutes > 0) return `${minutes}m ${seconds}s`;
    return `${seconds}s`;
  };

  const filteredLogs = (migrationStatus.recentLogs || []).filter(l => {
    if (logFilter === 'error') return l.type === 'error';
    if (logFilter === 'warning') return l.type === 'warning' || l.type === 'error';
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Top Migration Status Banner */}
      <div className={`p-5 rounded-3xl border flex flex-col md:flex-row items-start md:items-center justify-between gap-4 sbf-neumo-raised-sm ${
        isCompleted
          ? 'bg-emerald-50/70 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-800'
          : isFailed
          ? 'bg-rose-50/70 dark:bg-rose-950/30 border-rose-200 dark:border-rose-800'
          : isPaused
          ? 'bg-amber-50/70 dark:bg-amber-950/30 border-amber-200 dark:border-amber-800'
          : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800'
      }`}>
        <div className="flex items-center gap-4">
          <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-white shrink-0 shadow-md ${
            isCompleted
              ? 'bg-emerald-600'
              : isFailed
              ? 'bg-rose-600'
              : isPaused
              ? 'bg-amber-600'
              : 'bg-gradient-to-tr from-rose-600 to-indigo-600 animate-pulse'
          }`}>
            {isCompleted ? <Check className="w-6 h-6" /> : isPaused ? <Pause className="w-6 h-6" /> : <Zap className="w-6 h-6" />}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-extrabold text-slate-900 dark:text-white capitalize">
                {migrationStatus.status.replace('_', ' ')}: {migrationStatus.stage.replace('_', ' ')}
              </h3>
              <span className="font-mono text-xs text-slate-400">({migrationStatus.migrationId})</span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              {migrationStatus.currentTable
                ? `Active Table: ${migrationStatus.currentTable} (${migrationStatus.tablesCompleted}/${migrationStatus.totalTables} completed)`
                : 'All assigned tables finished'}
            </p>
          </div>
        </div>

        {/* Live Controls */}
        <div className="flex items-center gap-2 shrink-0">
          {isRunning && (
            <SoftButton
              variant="raised"
              size="sm"
              onClick={handlePause}
              loading={actionLoading}
              icon={Pause}
            >
              Pause Stream
            </SoftButton>
          )}

          {isPaused && (
            <SoftButton
              variant="primary"
              size="sm"
              onClick={handleResume}
              loading={actionLoading}
              icon={Play}
            >
              Resume Stream
            </SoftButton>
          )}

          {(isRunning || isPaused) && (
            <SoftButton
              variant="danger"
              size="sm"
              onClick={handleCancel}
              loading={actionLoading}
              icon={Square}
            >
              Cancel Run
            </SoftButton>
          )}

          {isCompleted && (
            <SoftButton
              variant="primary"
              size="sm"
              onClick={onViewVerification}
              icon={CheckCircle2}
            >
              View Verification Report
            </SoftButton>
          )}
        </div>
      </div>

      {/* Progress Bar & High-Precision Real-Time Metrics */}
      <NeumorphicCard variant="raised">
        <div className="space-y-4">
          <div className="flex items-center justify-between text-xs font-bold text-slate-700 dark:text-slate-300">
            <span>Overall Migration Progress</span>
            <span className="text-sm font-extrabold text-rose-600 dark:text-rose-400 font-mono">
              {migrationStatus.progress}%
            </span>
          </div>

          {/* Progress Bar Track */}
          <div className="w-full h-4 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden p-0.5 sbf-neumo-inset-sm">
            <div
              className="h-full rounded-full bg-gradient-to-r from-rose-500 via-amber-500 to-emerald-500 transition-all duration-300"
              style={{ width: `${Math.max(2, Math.min(100, migrationStatus.progress))}%` }}
            />
          </div>

          {/* Metrics Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2 text-center text-xs">
            <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/50">
              <span className="text-[10px] text-slate-400 uppercase font-bold">Records Transferred</span>
              <p className="text-xl font-extrabold text-slate-900 dark:text-white mt-1 font-mono">
                {migrationStatus.recordsTransferred.toLocaleString()}
              </p>
              <span className="text-[10px] text-slate-400">
                of ~{migrationStatus.totalEstimatedRecords.toLocaleString()}
              </span>
            </div>

            <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/50">
              <span className="text-[10px] text-slate-400 uppercase font-bold">Throughput Speed</span>
              <p className="text-xl font-extrabold text-emerald-600 dark:text-emerald-400 mt-1 font-mono">
                {migrationStatus.transferSpeed.toLocaleString()}
              </p>
              <span className="text-[10px] text-slate-400">records / sec</span>
            </div>

            <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/50">
              <span className="text-[10px] text-slate-400 uppercase font-bold">Elapsed Time</span>
              <p className="text-xl font-extrabold text-indigo-600 dark:text-indigo-400 mt-1 font-mono">
                {formatDuration(migrationStatus.elapsedTimeMs)}
              </p>
              <span className="text-[10px] text-slate-400">active running time</span>
            </div>

            <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/50">
              <span className="text-[10px] text-slate-400 uppercase font-bold">Estimated Remaining</span>
              <p className="text-xl font-extrabold text-amber-600 dark:text-amber-400 mt-1 font-mono">
                {isRunning ? formatDuration(migrationStatus.estimatedRemainingTimeMs) : '—'}
              </p>
              <span className="text-[10px] text-slate-400">to completion</span>
            </div>
          </div>
        </div>
      </NeumorphicCard>

      {/* Real-time Terminal Log Viewer */}
      <NeumorphicCard
        headerTitle="Live Execution Terminal & Diagnostic Stream"
        headerDescription="Real-time Server-Sent Events output from the database migration worker."
        headerIcon={Terminal}
        headerAction={
          <div className="flex items-center gap-2">
            <select
              value={logFilter}
              onChange={(e) => setLogFilter(e.target.value as any)}
              className="px-2.5 py-1 rounded-xl text-xs font-bold bg-slate-100 dark:bg-slate-800 border-none"
            >
              <option value="all">All Logs ({migrationStatus.recentLogs?.length || 0})</option>
              <option value="warning">Warnings & Errors</option>
              <option value="error">Errors Only</option>
            </select>
            <label className="flex items-center gap-1.5 text-xs text-slate-500 cursor-pointer">
              <input
                type="checkbox"
                checked={autoScroll}
                onChange={(e) => setAutoScroll(e.target.checked)}
                className="rounded text-rose-600"
              />
              Auto-scroll
            </label>
            {migrationStatus.migrationId && (
              <a
                href={dbMigrationService.getDownloadLogsUrl(migrationStatus.migrationId)}
                target="_blank"
                rel="noreferrer"
                className="p-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300"
                title="Download full log file"
              >
                <Download className="w-4 h-4" />
              </a>
            )}
          </div>
        }
      >
        <div
          ref={logTerminalRef}
          className="h-80 overflow-y-auto rounded-2xl bg-slate-950 p-4 font-mono text-xs text-slate-200 space-y-1 scrollbar-thin border border-slate-800 shadow-inner"
        >
          {filteredLogs.length === 0 ? (
            <div className="text-slate-500 italic">Awaiting worker log emissions...</div>
          ) : (
            filteredLogs.map((log, idx) => {
              const isErr = log.type === 'error';
              const isWarn = log.type === 'warning';
              return (
                <div key={idx} className="flex items-start gap-2 leading-relaxed">
                  <span className="text-slate-500 select-none shrink-0 text-[10px]">
                    {new Date(log.timestamp).toLocaleTimeString()}
                  </span>
                  <span className={`break-all ${
                    isErr
                      ? 'text-rose-400 font-bold'
                      : isWarn
                      ? 'text-amber-400 font-semibold'
                      : 'text-slate-300'
                  }`}>
                    {log.message}
                  </span>
                </div>
              );
            })
          )}
        </div>
      </NeumorphicCard>
    </div>
  );
};

