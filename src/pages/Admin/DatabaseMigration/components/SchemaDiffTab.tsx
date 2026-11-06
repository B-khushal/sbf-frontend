import React, { useState, useEffect } from 'react';
import { 
  GitCompare, 
  AlertTriangle, 
  CheckCircle2, 
  XCircle, 
  RefreshCw, 
  ArrowRight, 
  Table, 
  Plus, 
  Minus, 
  Search,
  Layers,
  Sparkles
} from 'lucide-react';
import { SchemaComparison, dbMigrationService } from '@/services/dbMigrationService';
import { NeumorphicCard, SoftButton, StatusBadge, SearchInput } from '@/components/dashboard';
import { useToast } from '@/hooks/use-toast';

interface SchemaDiffTabProps {
  onNavigateToMigrate: (mode: 'complete' | 'selective') => void;
}

export const SchemaDiffTab: React.FC<SchemaDiffTabProps> = ({
  onNavigateToMigrate
}) => {
  const { toast } = useToast();
  const [diff, setDiff] = useState<SchemaComparison | null>(null);
  const [loading, setLoading] = useState(false);
  const [filterType, setFilterType] = useState<'all' | 'missing' | 'differences' | 'matching'>('all');
  const [search, setSearch] = useState('');

  const fetchDiff = async () => {
    setLoading(true);
    try {
      const data = await dbMigrationService.compareDatabases(false);
      setDiff(data);
    } catch (err: any) {
      toast({
        title: 'Comparison Failed',
        description: err.response?.data?.error || err.message,
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDiff();
  }, []);

  const missingTables = diff?.missingTablesInDest || [];
  const extraTables = diff?.extraTablesInDest || [];
  const matchingTables = diff?.matchingTables || [];
  const diffTables = diff?.tableDifferences || [];

  return (
    <div className="space-y-6">
      {/* Top Banner & Status */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 rounded-3xl bg-[var(--sbf-card)] border border-slate-200/60 dark:border-slate-800/60 sbf-neumo-raised-sm">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 flex items-center justify-center border border-indigo-200/50">
            <GitCompare className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              Schema & Structure Differential Analysis
              {diff && (
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase ${
                  diff.syncStatus === 'in_sync'
                    ? 'bg-emerald-100 text-emerald-800'
                    : diff.syncStatus === 'tables_missing'
                    ? 'bg-rose-100 text-rose-800'
                    : 'bg-amber-100 text-amber-800'
                }`}>
                  {diff.syncStatus.replace('_', ' ')}
                </span>
              )}
            </h4>
            <p className="text-xs text-slate-500">
              Evaluates table structures, column definitions, data types, and record volume divergences.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <SoftButton
            variant="raised"
            size="sm"
            onClick={fetchDiff}
            loading={loading}
            icon={RefreshCw}
          >
            Re-compare
          </SoftButton>
          {missingTables.length > 0 && (
            <SoftButton
              variant="primary"
              size="sm"
              onClick={() => onNavigateToMigrate('complete')}
              icon={ArrowRight}
            >
              Sync Missing Tables ({missingTables.length})
            </SoftButton>
          )}
        </div>
      </div>

      {/* Comparison KPI Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800/60 sbf-neumo-raised-sm">
          <span className="text-[10px] font-bold text-slate-400 uppercase">Missing in Destination</span>
          <p className="text-2xl font-black text-rose-600 dark:text-rose-400 mt-1">
            {diff?.summary?.missingTablesCount ?? '—'}
          </p>
          <span className="text-[10px] text-slate-500">Requires table creation</span>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800/60 sbf-neumo-raised-sm">
          <span className="text-[10px] font-bold text-slate-400 uppercase">Structural Differences</span>
          <p className="text-2xl font-black text-amber-600 dark:text-amber-400 mt-1">
            {diff?.summary?.tablesWithDifferencesCount ?? '—'}
          </p>
          <span className="text-[10px] text-slate-500">Type or column mismatches</span>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800/60 sbf-neumo-raised-sm">
          <span className="text-[10px] font-bold text-slate-400 uppercase">Matching Tables</span>
          <p className="text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-1">
            {diff?.summary?.matchingTablesCount ?? '—'}
          </p>
          <span className="text-[10px] text-slate-500">Identical schema layouts</span>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800/60 sbf-neumo-raised-sm">
          <span className="text-[10px] font-bold text-slate-400 uppercase">Extra in Destination</span>
          <p className="text-2xl font-black text-indigo-600 dark:text-indigo-400 mt-1">
            {diff?.summary?.extraTablesCount ?? '—'}
          </p>
          <span className="text-[10px] text-slate-500">Target-specific tables</span>
        </div>
      </div>

      {/* Filter Tabs & Search */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-slate-100 dark:bg-slate-800/70 text-xs font-bold">
          <button
            type="button"
            onClick={() => setFilterType('all')}
            className={`px-3 py-1.5 rounded-xl transition-all ${
              filterType === 'all' ? 'bg-white dark:bg-slate-900 shadow-xs text-rose-600' : 'text-slate-600'
            }`}
          >
            All Comparison
          </button>
          <button
            type="button"
            onClick={() => setFilterType('missing')}
            className={`px-3 py-1.5 rounded-xl transition-all ${
              filterType === 'missing' ? 'bg-white dark:bg-slate-900 shadow-xs text-rose-600' : 'text-slate-600'
            }`}
          >
            Missing Tables ({missingTables.length})
          </button>
          <button
            type="button"
            onClick={() => setFilterType('differences')}
            className={`px-3 py-1.5 rounded-xl transition-all ${
              filterType === 'differences' ? 'bg-white dark:bg-slate-900 shadow-xs text-amber-600' : 'text-slate-600'
            }`}
          >
            Structure Diffs ({diffTables.length})
          </button>
        </div>

        <div className="w-full sm:w-64">
          <SearchInput
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onClear={() => setSearch('')}
            placeholder="Filter tables..."
            className="w-full text-xs"
          />
        </div>
      </div>

      {/* Detailed Diff Sections */}
      {loading ? (
        <div className="p-12 text-center text-xs text-slate-400">
          <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-rose-600" />
          Analyzing source and destination schema differentials...
        </div>
      ) : (
        <div className="space-y-4">
          {/* 1. Missing Tables in Destination */}
          {(filterType === 'all' || filterType === 'missing') && missingTables.length > 0 && (
            <NeumorphicCard
              headerTitle={`Missing Tables in Destination (${missingTables.length})`}
              headerDescription="These tables exist on the source database but have not yet been created in the local database."
              headerIcon={XCircle}
              variant="raised"
            >
              <div className="divide-y divide-slate-100 dark:divide-slate-800 text-xs">
                {missingTables
                  .filter(t => t.name.toLowerCase().includes(search.toLowerCase()))
                  .map(t => (
                    <div key={t.fullName} className="py-2.5 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-rose-500" />
                        <span className="font-mono font-bold text-slate-900 dark:text-white">{t.fullName}</span>
                      </div>
                      <div className="flex items-center gap-4 text-slate-500 font-mono text-[11px]">
                        <span>~{t.sourceRows.toLocaleString()} rows</span>
                        <span>{t.sourceSize}</span>
                        <span className="px-2 py-0.5 rounded-md bg-rose-100 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 font-sans font-bold text-[10px]">
                          Needs Creation
                        </span>
                      </div>
                    </div>
                  ))}
              </div>
            </NeumorphicCard>
          )}

          {/* 2. Structural & Column Differences */}
          {(filterType === 'all' || filterType === 'differences') && diffTables.length > 0 && (
            <NeumorphicCard
              headerTitle={`Tables with Differences (${diffTables.length})`}
              headerDescription="Tables that exist in both databases but exhibit column type differences or record count divergence."
              headerIcon={AlertTriangle}
              variant="raised"
            >
              <div className="space-y-3 text-xs">
                {diffTables
                  .filter(t => t.name.toLowerCase().includes(search.toLowerCase()))
                  .map(t => (
                    <div key={t.fullName} className="p-3.5 rounded-2xl bg-slate-50/70 dark:bg-slate-900/40 border border-slate-200/60 dark:border-slate-800/60 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="font-mono font-bold text-slate-900 dark:text-white text-sm">
                          {t.fullName}
                        </span>
                        <div className="flex items-center gap-2 font-mono text-[11px]">
                          <span className="text-slate-500">Source: <strong>{t.sourceRows.toLocaleString()}</strong></span>
                          <span className="text-slate-400">|</span>
                          <span className="text-slate-500">Dest: <strong>{t.destRows.toLocaleString()}</strong></span>
                          {t.rowDelta !== 0 && (
                            <span className="text-rose-600 font-bold">
                              ({t.rowDelta > 0 ? `+${t.rowDelta}` : t.rowDelta} delta)
                            </span>
                          )}
                        </div>
                      </div>

                      {t.columnDifferences?.missingInDest?.length > 0 && (
                        <div className="p-2 rounded-xl bg-rose-50 text-rose-800 border border-rose-200 text-[11px]">
                          <strong className="block mb-0.5">Missing columns in destination:</strong>
                          {t.columnDifferences.missingInDest.map((c: any) => (
                            <span key={c.name} className="inline-block mr-2 font-mono">
                              + {c.name} ({c.udtName})
                            </span>
                          ))}
                        </div>
                      )}

                      {t.columnDifferences?.typeMismatches?.length > 0 && (
                        <div className="p-2 rounded-xl bg-amber-50 text-amber-800 border border-amber-200 text-[11px]">
                          <strong className="block mb-0.5">Data type mismatches:</strong>
                          {t.columnDifferences.typeMismatches.map((m: any) => (
                            <div key={m.column} className="font-mono">
                              • {m.column}: Source({m.sourceType}) vs Dest({m.destType})
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
              </div>
            </NeumorphicCard>
          )}

          {/* 3. Fully Matching Tables */}
          {(filterType === 'all' || filterType === 'matching') && (
            <NeumorphicCard
              headerTitle={`Matching Tables (${matchingTables.filter(t => !t.hasColumnDifferences).length})`}
              headerDescription="Tables with identical column schemas and matching primary keys."
              headerIcon={CheckCircle2}
              variant="raised-sm"
            >
              <div className="divide-y divide-slate-100 dark:divide-slate-800 text-xs">
                {matchingTables
                  .filter(t => !t.hasColumnDifferences && t.name.toLowerCase().includes(search.toLowerCase()))
                  .map(t => (
                    <div key={t.fullName} className="py-2 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                        <span className="font-mono text-slate-800 dark:text-slate-200">{t.fullName}</span>
                      </div>
                      <div className="flex items-center gap-3 text-slate-500 font-mono text-[11px]">
                        <span>{t.sourceColumnsCount} cols</span>
                        <span>{t.sourceRows} vs {t.destRows} rows</span>
                      </div>
                    </div>
                  ))}
              </div>
            </NeumorphicCard>
          )}
        </div>
      )}
    </div>
  );
};

