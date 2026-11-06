import React, { useState, useEffect } from 'react';
import { 
  Layers, 
  CheckSquare, 
  Square, 
  Search, 
  Sliders, 
  ShieldAlert, 
  RefreshCw, 
  ArrowRight, 
  Database, 
  Table, 
  Settings2,
  HardDrive,
  Copy,
  Zap
} from 'lucide-react';
import { TableMeta, dbMigrationService } from '@/services/dbMigrationService';
import { NeumorphicCard, SoftButton, SearchInput } from '@/components/dashboard';
import { MigrationPreviewModal } from './MigrationPreviewModal';
import { useToast } from '@/hooks/use-toast';

interface MigrationConfigTabProps {
  sourceConfigured: boolean;
  destConfigured: boolean;
  sourceMasked: string;
  destMasked: string;
  initialMode?: 'complete' | 'selective' | 'data_only';
  onStartExecution: (migrationId: string) => void;
}

export const MigrationConfigTab: React.FC<MigrationConfigTabProps> = ({
  sourceConfigured,
  destConfigured,
  sourceMasked,
  destMasked,
  initialMode = 'complete',
  onStartExecution
}) => {
  const { toast } = useToast();

  const [mode, setMode] = useState<'complete' | 'selective' | 'data_only'>(initialMode);
  const [conflictStrategy, setConflictStrategy] = useState<'upsert' | 'skip' | 'replace' | 'insert'>('upsert');
  const [batchSize, setBatchSize] = useState<number>(1000);
  const [createBackup, setCreateBackup] = useState(true);

  const [availableTables, setAvailableTables] = useState<TableMeta[]>([]);
  const [selectedTables, setSelectedTables] = useState<string[]>([]);
  const [tableSearch, setTableSearch] = useState('');
  const [loadingTables, setLoadingTables] = useState(false);

  // Preview Modal State
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [previewData, setPreviewData] = useState<any>(null);
  const [loadingPreview, setLoadingPreview] = useState(false);
  const [startingMigration, setStartingMigration] = useState(false);

  // Fetch available source tables for selection
  const loadSourceTables = async () => {
    if (!sourceConfigured) return;
    setLoadingTables(true);
    try {
      const data = await dbMigrationService.inspectDatabase('source', false);
      if (data.success) {
        setAvailableTables(data.tables);
        if (selectedTables.length === 0) {
          setSelectedTables(data.tables.map(t => t.fullName));
        }
      }
    } catch (e: any) {
      console.warn('Could not inspect source tables:', e.message);
    } finally {
      setLoadingTables(false);
    }
  };

  useEffect(() => {
    loadSourceTables();
  }, [sourceConfigured]);

  const handleToggleTable = (fullName: string) => {
    setSelectedTables(prev => 
      prev.includes(fullName) ? prev.filter(t => t !== fullName) : [...prev, fullName]
    );
  };

  const handleSelectAll = () => {
    setSelectedTables(availableTables.map(t => t.fullName));
  };

  const handleDeselectAll = () => {
    setSelectedTables([]);
  };

  const filteredTables = availableTables.filter(t => 
    t.name.toLowerCase().includes(tableSearch.toLowerCase()) ||
    t.schema.toLowerCase().includes(tableSearch.toLowerCase())
  );

  // Trigger Pre-Flight Preview
  const handleOpenPreview = async () => {
    if (!sourceConfigured || !destConfigured) {
      toast({
        title: 'Connections Required',
        description: 'Both Source and Destination databases must be configured and connected.',
        variant: 'destructive'
      });
      return;
    }

    if (mode === 'selective' && selectedTables.length === 0) {
      toast({
        title: 'No Tables Selected',
        description: 'Please select at least one table for selective migration.',
        variant: 'destructive'
      });
      return;
    }

    setLoadingPreview(true);
    try {
      const res = await dbMigrationService.previewMigration({
        mode,
        selectedTables: mode === 'selective' ? selectedTables : availableTables.map(t => t.fullName),
        conflictStrategy
      });
      if (res.success) {
        setPreviewData(res.preview);
        setIsPreviewOpen(true);
      }
    } catch (err: any) {
      toast({
        title: 'Preview Failed',
        description: err.response?.data?.error || err.message,
        variant: 'destructive'
      });
    } finally {
      setLoadingPreview(false);
    }
  };

  // Execute Migration
  const handleConfirmExecute = async () => {
    setStartingMigration(true);
    try {
      const res = await dbMigrationService.startMigration({
        mode,
        selectedTables: mode === 'selective' ? selectedTables : availableTables.map(t => t.fullName),
        conflictStrategy,
        batchSize,
        createBackup
      });

      if (res.success) {
        setIsPreviewOpen(false);
        toast({
          title: '🚀 Migration Job Started',
          description: `Background worker running for ${res.totalTables} tables.`
        });
        onStartExecution(res.migrationId);
      }
    } catch (err: any) {
      toast({
        title: 'Failed to Launch Migration',
        description: err.response?.data?.error || err.message,
        variant: 'destructive'
      });
    } finally {
      setStartingMigration(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Mode Selector Card */}
      <NeumorphicCard
        headerTitle="Select Migration Workflow Mode"
        headerDescription="Choose the operational scope of your database synchronization."
        headerIcon={Layers}
        variant="raised"
      >
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          {/* Mode A: Complete */}
          <div
            onClick={() => setMode('complete')}
            className={`p-4 rounded-2xl cursor-pointer border transition-all ${
              mode === 'complete'
                ? 'bg-rose-50/90 dark:bg-rose-950/40 border-rose-400 dark:border-rose-800 shadow-md ring-2 ring-rose-500/20'
                : 'bg-white dark:bg-slate-900 border-slate-200/60 dark:border-slate-800/60 hover:bg-slate-50'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="font-extrabold text-sm text-slate-900 dark:text-white">
                A. Complete DB Migration
              </span>
              <span className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                mode === 'complete' ? 'border-rose-600 bg-rose-600 text-white' : 'border-slate-300'
              }`}>
                {mode === 'complete' && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
              </span>
            </div>
            <p className="text-slate-500 text-[11px] leading-relaxed">
              Transfers entire schema structures, all tables, primary & foreign keys, sequences, indexes, and full dataset.
            </p>
          </div>

          {/* Mode B: Selective */}
          <div
            onClick={() => setMode('selective')}
            className={`p-4 rounded-2xl cursor-pointer border transition-all ${
              mode === 'selective'
                ? 'bg-rose-50/90 dark:bg-rose-950/40 border-rose-400 dark:border-rose-800 shadow-md ring-2 ring-rose-500/20'
                : 'bg-white dark:bg-slate-900 border-slate-200/60 dark:border-slate-800/60 hover:bg-slate-50'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="font-extrabold text-sm text-slate-900 dark:text-white">
                B. Selective Table Migration
              </span>
              <span className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                mode === 'selective' ? 'border-rose-600 bg-rose-600 text-white' : 'border-slate-300'
              }`}>
                {mode === 'selective' && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
              </span>
            </div>
            <p className="text-slate-500 text-[11px] leading-relaxed">
              Allows selecting specific individual tables or subsets with automatic foreign key dependency resolution.
            </p>
          </div>

          {/* Mode C: Data-Only */}
          <div
            onClick={() => setMode('data_only')}
            className={`p-4 rounded-2xl cursor-pointer border transition-all ${
              mode === 'data_only'
                ? 'bg-rose-50/90 dark:bg-rose-950/40 border-rose-400 dark:border-rose-800 shadow-md ring-2 ring-rose-500/20'
                : 'bg-white dark:bg-slate-900 border-slate-200/60 dark:border-slate-800/60 hover:bg-slate-50'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="font-extrabold text-sm text-slate-900 dark:text-white">
                C. Data-Only Sync
              </span>
              <span className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                mode === 'data_only' ? 'border-rose-600 bg-rose-600 text-white' : 'border-slate-300'
              }`}>
                {mode === 'data_only' && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
              </span>
            </div>
            <p className="text-slate-500 text-[11px] leading-relaxed">
              Transfers records only without altering existing destination DDL or column definitions. Ideal for delta syncs.
            </p>
          </div>
        </div>
      </NeumorphicCard>

      {/* Selective Table Picker (Shown for Selective mode) */}
      {mode === 'selective' && (
        <NeumorphicCard
          headerTitle={`Select Tables to Transfer (${selectedTables.length}/${availableTables.length})`}
          headerDescription="Select tables to migrate. Foreign key dependencies are automatically sorted."
          headerIcon={Table}
          headerAction={
            <div className="flex items-center gap-2">
              <SoftButton variant="raised" size="sm" onClick={handleSelectAll}>
                Select All
              </SoftButton>
              <SoftButton variant="raised" size="sm" onClick={handleDeselectAll}>
                Deselect All
              </SoftButton>
            </div>
          }
        >
          <div className="space-y-3 text-xs">
            <SearchInput
              value={tableSearch}
              onChange={(e) => setTableSearch(e.target.value)}
              onClear={() => setTableSearch('')}
              placeholder="Search by table name..."
              className="w-full text-xs"
            />

            <div className="max-h-72 overflow-y-auto rounded-2xl border border-slate-200/70 dark:border-slate-800/70 divide-y divide-slate-100 dark:divide-slate-800 scrollbar-thin">
              {filteredTables.map(t => {
                const isChecked = selectedTables.includes(t.fullName);
                return (
                  <div
                    key={t.fullName}
                    onClick={() => handleToggleTable(t.fullName)}
                    className="p-2.5 px-3 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-850 cursor-pointer select-none"
                  >
                    <div className="flex items-center gap-2.5">
                      {isChecked ? (
                        <CheckSquare className="w-4 h-4 text-rose-600 shrink-0" />
                      ) : (
                        <Square className="w-4 h-4 text-slate-300 shrink-0" />
                      )}
                      <span className="font-mono font-bold text-slate-900 dark:text-white">
                        {t.fullName}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 text-slate-500 font-mono text-[11px]">
                      <span>~{t.estimatedRows.toLocaleString()} rows</span>
                      <span>{t.prettySize}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </NeumorphicCard>
      )}

      {/* Advanced Execution Settings */}
      <NeumorphicCard
        headerTitle="Transfer & Conflict Resolution Configuration"
        headerDescription="Fine-tune stream batching, upsert strategy, and safety snapshot policies."
        headerIcon={Settings2}
        variant="raised"
      >
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-xs">
          {/* Conflict Strategy */}
          <div>
            <label className="block font-bold text-slate-800 dark:text-slate-200 mb-1.5">
              Conflict Resolution Strategy
            </label>
            <select
              value={conflictStrategy}
              onChange={(e) => setConflictStrategy(e.target.value as any)}
              className="w-full px-3 py-2 rounded-xl text-xs font-semibold bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800"
            >
              <option value="upsert">UPSERT (Insert missing or update existing on PK conflict)</option>
              <option value="skip">SKIP (Insert missing records, do nothing if exists)</option>
              <option value="replace">REPLACE (Truncate destination table before import) [Destructive]</option>
              <option value="insert">INSERT (Standard direct batch insert)</option>
            </select>
            <p className="text-[10px] text-slate-400 mt-1">
              Controls behavior when records with identical primary keys already exist in the destination table.
            </p>
          </div>

          {/* Batch Size */}
          <div>
            <label className="block font-bold text-slate-800 dark:text-slate-200 mb-1.5">
              Streaming Batch Size
            </label>
            <select
              value={batchSize}
              onChange={(e) => setBatchSize(parseInt(e.target.value, 10))}
              className="w-full px-3 py-2 rounded-xl text-xs font-semibold bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800"
            >
              <option value="500">500 rows / batch (Low Memory)</option>
              <option value="1000">1,000 rows / batch (Recommended Default)</option>
              <option value="2500">2,500 rows / batch (High Throughput)</option>
              <option value="5000">5,000 rows / batch (Maximum Speed)</option>
            </select>
            <p className="text-[10px] text-slate-400 mt-1">
              Memory-safe chunk streaming. Rows are processed and freed batch by batch.
            </p>
          </div>

          {/* Destination Backup Toggle */}
          <div>
            <label className="block font-bold text-slate-800 dark:text-slate-200 mb-1.5">
              Safety Snapshot Backup
            </label>
            <label className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 cursor-pointer">
              <input
                type="checkbox"
                checked={createBackup}
                onChange={(e) => setCreateBackup(e.target.checked)}
                className="rounded text-rose-600 focus:ring-rose-500"
              />
              <span className="font-semibold text-slate-700 dark:text-slate-300">
                Backup destination tables before overwrite
              </span>
            </label>
            <p className="text-[10px] text-slate-400 mt-1">
              Captures a compressed gzipped JSON snapshot on disk before destructive operations.
            </p>
          </div>
        </div>
      </NeumorphicCard>

      {/* Bottom Action Bar */}
      <div className="flex items-center justify-between p-4 rounded-3xl bg-[var(--sbf-card)] border border-slate-200/60 dark:border-slate-800/60 sbf-neumo-raised-sm">
        <div className="text-xs">
          <span className="font-bold text-slate-800 dark:text-slate-200 block">
            Ready to review migration parameters
          </span>
          <span className="text-slate-500">
            Clicking preview triggers pre-flight safety analysis without writing data.
          </span>
        </div>

        <SoftButton
          variant="primary"
          size="lg"
          onClick={handleOpenPreview}
          loading={loadingPreview}
          icon={ArrowRight}
        >
          Review & Launch Migration
        </SoftButton>
      </div>

      {/* Confirmation Modal */}
      <MigrationPreviewModal
        isOpen={isPreviewOpen}
        onClose={() => setIsPreviewOpen(false)}
        onConfirm={handleConfirmExecute}
        previewData={previewData}
        loading={startingMigration}
        sourceMasked={sourceMasked}
        destMasked={destMasked}
      />
    </div>
  );
};

