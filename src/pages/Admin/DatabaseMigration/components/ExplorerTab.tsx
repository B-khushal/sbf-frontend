import React, { useState, useEffect } from 'react';
import { 
  Database, 
  Server, 
  Search, 
  RefreshCw, 
  Key, 
  Link as LinkIcon, 
  Table, 
  FileText, 
  ChevronRight, 
  ChevronDown, 
  HardDrive,
  Hash,
  ShieldAlert,
  Sparkles
} from 'lucide-react';
import { DatabaseInspection, TableMeta, dbMigrationService } from '@/services/dbMigrationService';
import { NeumorphicCard, SoftButton, SearchInput, StatusBadge } from '@/components/dashboard';
import { useToast } from '@/hooks/use-toast';

interface ExplorerTabProps {
  sourceConfigured: boolean;
  destConfigured: boolean;
}

export const ExplorerTab: React.FC<ExplorerTabProps> = ({
  sourceConfigured,
  destConfigured
}) => {
  const { toast } = useToast();
  const [selectedTarget, setSelectedTarget] = useState<'source' | 'destination'>('source');
  const [inspection, setInspection] = useState<DatabaseInspection | null>(null);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSchema, setSelectedSchema] = useState<string>('all');
  const [expandedTable, setExpandedTable] = useState<string | null>(null);
  const [exactCounts, setExactCounts] = useState(false);

  const fetchInspection = async (target: 'source' | 'destination', exact: boolean = false) => {
    setLoading(true);
    try {
      const data = await dbMigrationService.inspectDatabase(target, exact);
      setInspection(data);
      if (data.tables.length > 0 && !expandedTable) {
        setExpandedTable(data.tables[0].fullName);
      }
    } catch (err: any) {
      toast({
        title: 'Inspection Failed',
        description: err.response?.data?.error || err.message,
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInspection(selectedTarget, exactCounts);
  }, [selectedTarget]);

  const handleTargetChange = (target: 'source' | 'destination') => {
    setSelectedTarget(target);
    setExpandedTable(null);
  };

  const filteredTables = (inspection?.tables || []).filter(table => {
    const matchesSearch = table.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          table.schema.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesSchema = selectedSchema === 'all' || table.schema === selectedSchema;
    return matchesSearch && matchesSchema;
  });

  const activeTableMeta = (inspection?.tables || []).find(t => t.fullName === expandedTable);

  return (
    <div className="space-y-6">
      {/* Target Toggle & Filter Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 p-4 rounded-3xl bg-[var(--sbf-card)] border border-slate-200/60 dark:border-slate-800/60 sbf-neumo-raised-sm">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => handleTargetChange('source')}
            className={`flex items-center gap-2 px-4 py-2 rounded-2xl text-xs font-bold transition-all ${
              selectedTarget === 'source'
                ? 'bg-rose-600 text-white shadow-md'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200'
            }`}
          >
            <Server className="w-3.5 h-3.5" />
            Source Database (Remote)
          </button>
          <button
            type="button"
            onClick={() => handleTargetChange('destination')}
            className={`flex items-center gap-2 px-4 py-2 rounded-2xl text-xs font-bold transition-all ${
              selectedTarget === 'destination'
                ? 'bg-emerald-600 text-white shadow-md'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200'
            }`}
          >
            <Database className="w-3.5 h-3.5" />
            Destination Database (Local)
          </button>
        </div>

        <div className="flex items-center gap-2">
          {inspection?.schemas && inspection.schemas.length > 1 && (
            <select
              value={selectedSchema}
              onChange={(e) => setSelectedSchema(e.target.value)}
              className="px-3 py-2 rounded-xl text-xs font-bold bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800"
            >
              <option value="all">All Schemas ({inspection.schemas.length})</option>
              {inspection.schemas.map(s => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          )}

          <SoftButton
            variant="raised"
            size="sm"
            onClick={() => fetchInspection(selectedTarget, exactCounts)}
            loading={loading}
            icon={RefreshCw}
          >
            Refresh
          </SoftButton>
        </div>
      </div>

      {/* Main Split View: Table List on Left, Selected Table Details on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Table Directory (4 Cols) */}
        <div className="lg:col-span-5 space-y-3">
          <div className="relative">
            <SearchInput
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onClear={() => setSearchQuery('')}
              placeholder="Search tables..."
              className="w-full"
            />
          </div>

          <div className="max-h-[600px] overflow-y-auto space-y-2 pr-1 scrollbar-thin">
            {loading ? (
              <div className="p-8 text-center text-xs text-slate-400">
                <RefreshCw className="w-5 h-5 animate-spin mx-auto mb-2 text-rose-500" />
                Introspecting database tables...
              </div>
            ) : filteredTables.length === 0 ? (
              <div className="p-8 text-center text-xs text-slate-400 bg-slate-50/50 dark:bg-slate-900/30 rounded-2xl border border-dashed">
                No tables found matching criteria.
              </div>
            ) : (
              filteredTables.map(t => {
                const isSelected = expandedTable === t.fullName;
                return (
                  <div
                    key={t.fullName}
                    onClick={() => setExpandedTable(t.fullName)}
                    className={`p-3 rounded-2xl cursor-pointer transition-all border text-xs ${
                      isSelected
                        ? 'bg-rose-50/90 dark:bg-rose-950/40 border-rose-300 dark:border-rose-800 shadow-sm'
                        : 'bg-white dark:bg-slate-900 border-slate-200/60 dark:border-slate-800/60 hover:bg-slate-50 dark:hover:bg-slate-850'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 font-bold text-slate-900 dark:text-white truncate">
                        <Table className={`w-3.5 h-3.5 shrink-0 ${isSelected ? 'text-rose-600' : 'text-slate-400'}`} />
                        <span className="truncate">{t.name}</span>
                        {t.schema !== 'public' && (
                          <span className="text-[10px] text-slate-400 font-normal">({t.schema})</span>
                        )}
                      </div>
                      <span className="font-mono text-[11px] text-slate-500 font-semibold shrink-0">
                        {t.exactRows !== null ? `${t.exactRows.toLocaleString()} rows` : `~${t.estimatedRows.toLocaleString()} rows`}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-[10px] text-slate-400 mt-1 pl-5.5">
                      <span>{t.columns.length} columns • {t.primaryKey.length > 0 ? `PK (${t.primaryKey.join(',')})` : 'No PK'}</span>
                      <span className="font-mono">{t.prettySize}</span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Selected Table Structure Details (7 Cols) */}
        <div className="lg:col-span-7">
          {activeTableMeta ? (
            <NeumorphicCard
              headerTitle={
                <div className="flex items-center gap-2">
                  <span className="font-mono text-rose-600 dark:text-rose-400">{activeTableMeta.fullName}</span>
                </div>
              }
              headerDescription={`${activeTableMeta.columns.length} Columns • ${activeTableMeta.primaryKey.length > 0 ? `Primary Key: [${activeTableMeta.primaryKey.join(', ')}]` : 'No Primary Key'} • ${activeTableMeta.prettySize}`}
              headerIcon={Table}
              headerAction={
                <span className="px-2.5 py-1 rounded-xl text-xs font-bold font-mono bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200">
                  {activeTableMeta.exactRows !== null ? `${activeTableMeta.exactRows.toLocaleString()} records` : `~${activeTableMeta.estimatedRows.toLocaleString()} records`}
                </span>
              }
            >
              <div className="space-y-4 text-xs">
                {/* Columns Table */}
                <div>
                  <h5 className="font-bold text-slate-800 dark:text-slate-200 mb-2 flex items-center gap-1.5">
                    <FileText className="w-3.5 h-3.5 text-rose-600" />
                    Column Definitions
                  </h5>
                  <div className="overflow-x-auto rounded-2xl border border-slate-200/70 dark:border-slate-800/70">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-slate-100/70 dark:bg-slate-800/70 text-[11px] text-slate-500 font-bold uppercase">
                        <tr>
                          <th className="py-2 px-3">#</th>
                          <th className="py-2 px-3">Column Name</th>
                          <th className="py-2 px-3">Type</th>
                          <th className="py-2 px-3">Nullable</th>
                          <th className="py-2 px-3">Default</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-mono text-[11px]">
                        {activeTableMeta.columns.map((col, idx) => {
                          const isPk = activeTableMeta.primaryKey.includes(col.name);
                          return (
                            <tr key={col.name} className={isPk ? 'bg-amber-50/30 dark:bg-amber-950/10' : ''}>
                              <td className="py-2 px-3 text-slate-400">{col.position}</td>
                              <td className="py-2 px-3 font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                                {isPk && <Key className="w-3 h-3 text-amber-500 shrink-0" />}
                                {col.name}
                              </td>
                              <td className="py-2 px-3 text-rose-600 dark:text-rose-400">
                                {col.udtName}
                                {col.charMaxLength ? `(${col.charMaxLength})` : ''}
                              </td>
                              <td className="py-2 px-3 text-slate-500">
                                {col.isNullable ? 'YES' : 'NO'}
                              </td>
                              <td className="py-2 px-3 text-slate-400 truncate max-w-[150px]">
                                {col.defaultValue || '—'}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Foreign Keys & Constraints */}
                {activeTableMeta.foreignKeys.length > 0 && (
                  <div>
                    <h5 className="font-bold text-slate-800 dark:text-slate-200 mb-2 flex items-center gap-1.5">
                      <LinkIcon className="w-3.5 h-3.5 text-indigo-600" />
                      Foreign Key Relationships ({activeTableMeta.foreignKeys.length})
                    </h5>
                    <div className="space-y-1.5">
                      {activeTableMeta.foreignKeys.map((fk, idx) => (
                        <div key={idx} className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-900/50 border border-slate-200/50 flex items-center justify-between text-[11px]">
                          <div>
                            <span className="font-mono font-bold text-slate-800 dark:text-slate-200">{fk.column}</span>
                            <span className="text-slate-400 mx-1.5">references</span>
                            <span className="font-mono font-bold text-indigo-600 dark:text-indigo-400">{fk.foreignTable}({fk.foreignColumn})</span>
                          </div>
                          <span className="text-[10px] text-slate-400 uppercase">
                            ON DELETE {fk.deleteRule}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Indexes */}
                {activeTableMeta.indexes.length > 0 && (
                  <div>
                    <h5 className="font-bold text-slate-800 dark:text-slate-200 mb-2 flex items-center gap-1.5">
                      <Hash className="w-3.5 h-3.5 text-amber-600" />
                      Indexes ({activeTableMeta.indexes.length})
                    </h5>
                    <div className="space-y-1.5">
                      {activeTableMeta.indexes.map((idx, i) => (
                        <div key={i} className="p-2 rounded-xl bg-slate-50 dark:bg-slate-900/50 border border-slate-200/50 text-[11px] font-mono">
                          <div className="flex items-center justify-between font-bold text-slate-800 dark:text-slate-200">
                            <span>{idx.name}</span>
                            {idx.isUnique && (
                              <span className="text-[9px] px-1.5 py-0.5 rounded-md bg-amber-100 text-amber-800 uppercase font-sans">
                                Unique
                              </span>
                            )}
                          </div>
                          <p className="text-[10px] text-slate-400 mt-0.5 truncate">{idx.definition}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </NeumorphicCard>
          ) : (
            <div className="h-full flex items-center justify-center p-12 text-center text-slate-400 border border-dashed rounded-3xl">
              Select a table from the directory to inspect its columns, keys, and indexes.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

