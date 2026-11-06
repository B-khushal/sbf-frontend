import React from 'react';
import { 
  Database, 
  Server, 
  Activity, 
  Layers, 
  HardDrive, 
  CheckCircle2, 
  AlertTriangle, 
  Clock, 
  ArrowRight, 
  ShieldCheck, 
  RefreshCw,
  ExternalLink,
  Flame,
  Zap
} from 'lucide-react';
import { OverviewData } from '@/services/dbMigrationService';
import { NeumorphicCard, StatCard, SoftButton, StatusBadge } from '@/components/dashboard';

interface OverviewTabProps {
  data: OverviewData | null;
  loading: boolean;
  onRefresh: () => void;
  onNavigateTab: (tab: string) => void;
}

export const OverviewTab: React.FC<OverviewTabProps> = ({
  data,
  loading,
  onRefresh,
  onNavigateTab
}) => {
  const source = data?.source;
  const dest = data?.destination;
  const stats = data?.stats;

  const isSourceConnected = source?.configured && source.diagnostics?.success;
  const isDestConnected = dest?.configured && dest.diagnostics?.success;

  return (
    <div className="space-y-6">
      {/* Top Banner Alert / Status */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 rounded-2xl bg-gradient-to-r from-rose-500/10 via-amber-500/10 to-indigo-500/10 border border-rose-200/40 dark:border-rose-900/40 sbf-neumo-raised-sm">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-rose-600 to-amber-500 flex items-center justify-center text-white shadow-md">
            <Zap className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              Production Database Migration & Synchronization
              <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-rose-600 text-white">
                HQ Pro
              </span>
            </h4>
            <p className="text-xs text-slate-600 dark:text-slate-300">
              Safe, high-throughput PostgreSQL data streaming engine with strict read-only source enforcement.
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <SoftButton
            variant="raised"
            size="sm"
            onClick={onRefresh}
            loading={loading}
            icon={RefreshCw}
          >
            Refresh Metrics
          </SoftButton>
          <SoftButton
            variant="primary"
            size="sm"
            onClick={() => onNavigateTab('config')}
            icon={ArrowRight}
          >
            Start Migration
          </SoftButton>
        </div>
      </div>

      {/* Primary KPI Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Source Database"
          value={isSourceConnected ? (source?.diagnostics?.databaseSize || 'Connected') : 'Disconnected'}
          subtitle={isSourceConnected ? `${source?.diagnostics?.totalTables || 0} tables • ${source?.diagnostics?.estimatedRecords?.toLocaleString() || 0} rows` : 'Configure connection'}
          icon={Server}
          variant={isSourceConnected ? 'rose' : 'danger'}
          badge={isSourceConnected ? 'READ ONLY' : 'OFFLINE'}
        />

        <StatCard
          title="Destination Database"
          value={isDestConnected ? (dest?.diagnostics?.databaseSize || 'Connected') : 'Disconnected'}
          subtitle={isDestConnected ? `${dest?.diagnostics?.totalTables || 0} tables • ${dest?.diagnostics?.estimatedRecords?.toLocaleString() || 0} rows` : 'Configure connection'}
          icon={Database}
          variant={isDestConnected ? 'emerald' : 'amber'}
          badge={isDestConnected ? 'TARGET' : 'OFFLINE'}
        />

        <StatCard
          title="Last Successful Run"
          value={stats?.lastSuccessfulMigration ? new Date(stats.lastSuccessfulMigration).toLocaleDateString() : 'Never'}
          subtitle={stats?.lastSuccessfulMigration ? new Date(stats.lastSuccessfulMigration).toLocaleTimeString() : 'No runs recorded'}
          icon={Clock}
          variant="indigo"
          badge={`${stats?.totalMigrationsCount || 0} Runs`}
        />

        <StatCard
          title="Total Transferred"
          value={stats?.totalRecordsTransferredAllTime ? stats.totalRecordsTransferredAllTime.toLocaleString() : '0'}
          subtitle="All-time verified records"
          icon={Layers}
          variant="amber"
          badge="Audit Logged"
        />
      </div>

      {/* Side-by-Side Database Comparison Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Source Database Card */}
        <NeumorphicCard
          headerTitle="Source Database (Remote / Production)"
          headerDescription="Source of truth. Enforced with strict read-only lock."
          headerIcon={Server}
          headerAction={
            <StatusBadge
              status={isSourceConnected ? 'success' : 'danger'}
              label={isSourceConnected ? 'Connected (Read-Only)' : 'Disconnected'}
            />
          }
        >
          <div className="space-y-4 text-xs">
            <div className="p-3 rounded-2xl bg-slate-50/80 dark:bg-slate-900/60 border border-slate-200/60 dark:border-slate-800/60 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-slate-500 font-semibold">Masked URL:</span>
                <span className="font-mono text-slate-800 dark:text-slate-200 truncate max-w-[260px]">
                  {source?.maskedUrl || 'Not configured'}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500 font-semibold">Host & Port:</span>
                <span className="font-mono text-slate-800 dark:text-slate-200">
                  {source?.host ? `${source.host}:${source.port}` : '—'}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500 font-semibold">Database Name:</span>
                <span className="font-bold text-rose-600 dark:text-rose-400">
                  {source?.database || '—'}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500 font-semibold">PostgreSQL Version:</span>
                <span className="text-slate-700 dark:text-slate-300">
                  {source?.diagnostics?.pgVersion ? `PostgreSQL ${source.diagnostics.pgVersion}` : '—'}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500 font-semibold">Round-trip Latency:</span>
                <span className="font-bold text-emerald-600 dark:text-emerald-400">
                  {source?.diagnostics?.latencyMs ? `${source.diagnostics.latencyMs} ms` : '—'}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500 font-semibold">SSL Encryption:</span>
                <span className="text-slate-700 dark:text-slate-300">
                  {source?.sslActive ? 'TLS / SSL Active' : 'Plaintext / Disabled'}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2 text-center">
              <div className="p-2.5 rounded-xl bg-white/70 dark:bg-slate-800/70 border border-slate-200/50">
                <p className="text-[10px] text-slate-400 uppercase font-bold">Tables</p>
                <p className="text-base font-extrabold text-slate-900 dark:text-white mt-0.5">
                  {source?.diagnostics?.totalTables ?? '—'}
                </p>
              </div>
              <div className="p-2.5 rounded-xl bg-white/70 dark:bg-slate-800/70 border border-slate-200/50">
                <p className="text-[10px] text-slate-400 uppercase font-bold">Est. Records</p>
                <p className="text-base font-extrabold text-slate-900 dark:text-white mt-0.5">
                  {source?.diagnostics?.estimatedRecords ? source.diagnostics.estimatedRecords.toLocaleString() : '—'}
                </p>
              </div>
              <div className="p-2.5 rounded-xl bg-white/70 dark:bg-slate-800/70 border border-slate-200/50">
                <p className="text-[10px] text-slate-400 uppercase font-bold">DB Size</p>
                <p className="text-base font-extrabold text-slate-900 dark:text-white mt-0.5">
                  {source?.diagnostics?.databaseSize || '—'}
                </p>
              </div>
            </div>

            <div className="pt-2 flex gap-2">
              <SoftButton
                variant="raised"
                size="sm"
                className="flex-1"
                onClick={() => onNavigateTab('connections')}
              >
                Edit Connection
              </SoftButton>
              <SoftButton
                variant="raised"
                size="sm"
                className="flex-1"
                onClick={() => onNavigateTab('explorer')}
              >
                Inspect Tables
              </SoftButton>
            </div>
          </div>
        </NeumorphicCard>

        {/* Destination Database Card */}
        <NeumorphicCard
          headerTitle="Destination Database (Local / Target)"
          headerDescription="Target instance where data and schemas are synchronized."
          headerIcon={Database}
          headerAction={
            <StatusBadge
              status={isDestConnected ? 'success' : 'amber'}
              label={isDestConnected ? 'Connected (Writable)' : 'Disconnected'}
            />
          }
        >
          <div className="space-y-4 text-xs">
            <div className="p-3 rounded-2xl bg-slate-50/80 dark:bg-slate-900/60 border border-slate-200/60 dark:border-slate-800/60 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-slate-500 font-semibold">Masked URL:</span>
                <span className="font-mono text-slate-800 dark:text-slate-200 truncate max-w-[260px]">
                  {dest?.maskedUrl || 'Not configured'}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500 font-semibold">Host & Port:</span>
                <span className="font-mono text-slate-800 dark:text-slate-200">
                  {dest?.host ? `${dest.host}:${dest.port}` : '—'}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500 font-semibold">Database Name:</span>
                <span className="font-bold text-emerald-600 dark:text-emerald-400">
                  {dest?.database || '—'}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500 font-semibold">PostgreSQL Version:</span>
                <span className="text-slate-700 dark:text-slate-300">
                  {dest?.diagnostics?.pgVersion ? `PostgreSQL ${dest.diagnostics.pgVersion}` : '—'}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500 font-semibold">Round-trip Latency:</span>
                <span className="font-bold text-emerald-600 dark:text-emerald-400">
                  {dest?.diagnostics?.latencyMs ? `${dest.diagnostics.latencyMs} ms` : '—'}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500 font-semibold">SSL Encryption:</span>
                <span className="text-slate-700 dark:text-slate-300">
                  {dest?.sslActive ? 'TLS / SSL Active' : 'Local / Disabled'}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2 text-center">
              <div className="p-2.5 rounded-xl bg-white/70 dark:bg-slate-800/70 border border-slate-200/50">
                <p className="text-[10px] text-slate-400 uppercase font-bold">Tables</p>
                <p className="text-base font-extrabold text-slate-900 dark:text-white mt-0.5">
                  {dest?.diagnostics?.totalTables ?? '—'}
                </p>
              </div>
              <div className="p-2.5 rounded-xl bg-white/70 dark:bg-slate-800/70 border border-slate-200/50">
                <p className="text-[10px] text-slate-400 uppercase font-bold">Est. Records</p>
                <p className="text-base font-extrabold text-slate-900 dark:text-white mt-0.5">
                  {dest?.diagnostics?.estimatedRecords ? dest.diagnostics.estimatedRecords.toLocaleString() : '—'}
                </p>
              </div>
              <div className="p-2.5 rounded-xl bg-white/70 dark:bg-slate-800/70 border border-slate-200/50">
                <p className="text-[10px] text-slate-400 uppercase font-bold">DB Size</p>
                <p className="text-base font-extrabold text-slate-900 dark:text-white mt-0.5">
                  {dest?.diagnostics?.databaseSize || '—'}
                </p>
              </div>
            </div>

            <div className="pt-2 flex gap-2">
              <SoftButton
                variant="raised"
                size="sm"
                className="flex-1"
                onClick={() => onNavigateTab('connections')}
              >
                Edit Connection
              </SoftButton>
              <SoftButton
                variant="raised"
                size="sm"
                className="flex-1"
                onClick={() => onNavigateTab('diff')}
              >
                Compare Schemas
              </SoftButton>
            </div>
          </div>
        </NeumorphicCard>
      </div>

      {/* Safety & Protocol Guarantees */}
      <NeumorphicCard
        variant="raised-sm"
        headerTitle="Data Safety & Integrity Architecture"
        headerDescription="Strict enterprise protections enforced by SBF database migration engine."
        headerIcon={ShieldCheck}
      >
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          <div className="p-3 rounded-2xl bg-rose-50/50 dark:bg-rose-950/20 border border-rose-200/40">
            <h5 className="font-bold text-rose-800 dark:text-rose-300 flex items-center gap-1.5 mb-1">
              <CheckCircle2 className="w-4 h-4 text-rose-600" />
              Strict Read-Only Source
            </h5>
            <p className="text-slate-600 dark:text-slate-400">
              Source database sessions are locked with <code>default_transaction_read_only = on</code>. Zero writes, alters, or drops can ever execute against production.
            </p>
          </div>

          <div className="p-3 rounded-2xl bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-200/40">
            <h5 className="font-bold text-emerald-800 dark:text-emerald-300 flex items-center gap-1.5 mb-1">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              Foreign Key Graph Sorting
            </h5>
            <p className="text-slate-600 dark:text-slate-400">
              Tables are automatically sorted topologically so parents (Users, Products) are streamed before dependent children (Orders, Items).
            </p>
          </div>

          <div className="p-3 rounded-2xl bg-amber-50/50 dark:bg-amber-950/20 border border-amber-200/40">
            <h5 className="font-bold text-amber-800 dark:text-amber-300 flex items-center gap-1.5 mb-1">
              <CheckCircle2 className="w-4 h-4 text-amber-600" />
              Automatic Sequence Alignment
            </h5>
            <p className="text-slate-600 dark:text-slate-400">
              PostgreSQL sequences are inspected and calibrated to <code>max(id)</code> to ensure ongoing application operations never encounter duplicate key collisions.
            </p>
          </div>
        </div>
      </NeumorphicCard>
    </div>
  );
};

