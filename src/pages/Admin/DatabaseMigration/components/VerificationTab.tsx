import React, { useState, useEffect } from 'react';
import { 
  CheckCircle2, 
  XCircle, 
  AlertTriangle, 
  RefreshCw, 
  ShieldCheck, 
  Layers, 
  FileCheck, 
  ArrowRight,
  Search,
  ExternalLink
} from 'lucide-react';
import { VerificationReport, dbMigrationService } from '@/services/dbMigrationService';
import { NeumorphicCard, SoftButton, SearchInput, StatusBadge } from '@/components/dashboard';
import { useToast } from '@/hooks/use-toast';

interface VerificationTabProps {
  report: VerificationReport | null;
  onRefresh: () => void;
}

export const VerificationTab: React.FC<VerificationTabProps> = ({
  report: initialReport,
  onRefresh
}) => {
  const { toast } = useToast();
  const [report, setReport] = useState<VerificationReport | null>(initialReport);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'PASSED' | 'WARNING' | 'FAILED'>('all');

  useEffect(() => {
    if (initialReport) setReport(initialReport);
  }, [initialReport]);

  const handleRunManualVerification = async () => {
    setLoading(true);
    try {
      const result = await dbMigrationService.verifyMigration();
      setReport(result);
      if (result.overallStatus === 'PASSED') {
        toast({ title: 'Verification Passed', description: '100% record and structure match across all tables.' });
      } else {
        toast({
          title: `Verification ${result.overallStatus}`,
          description: `${result.summary.inconsistenciesCount} issues detected. Check report details.`,
          variant: 'destructive'
        });
      }
    } catch (err: any) {
      toast({ title: 'Verification Error', description: err.message, variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const filteredResults = (report?.tableResults || []).filter(item => {
    const matchesSearch = item.tableName.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === 'all' || item.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 rounded-3xl bg-[var(--sbf-card)] border border-slate-200/60 dark:border-slate-800/60 sbf-neumo-raised-sm">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center border border-emerald-200/50">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              Automated Post-Migration Verification & Consistency
              {report && (
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase ${
                  report.overallStatus === 'PASSED'
                    ? 'bg-emerald-100 text-emerald-800'
                    : report.overallStatus === 'WARNING'
                    ? 'bg-amber-100 text-amber-800'
                    : 'bg-rose-100 text-rose-800'
                }`}>
                  {report.overallStatus}
                </span>
              )}
            </h4>
            <p className="text-xs text-slate-500">
              Validates row count parity, primary key preservation, foreign key integrity, and sequence calibration.
            </p>
          </div>
        </div>

        <SoftButton
          variant="raised"
          size="sm"
          onClick={handleRunManualVerification}
          loading={loading}
          icon={RefreshCw}
        >
          Run Full Verification Check
        </SoftButton>
      </div>

      {report ? (
        <>
          {/* Summary KPI Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800/60 sbf-neumo-raised-sm text-center">
              <span className="text-[10px] font-bold text-slate-400 uppercase">Tables Verified</span>
              <p className="text-2xl font-black text-slate-900 dark:text-white mt-1">
                {report.summary.totalTablesChecked}
              </p>
              <span className="text-[10px] text-slate-500">
                {report.summary.passedTables} passed • {report.summary.failedTables} failed
              </span>
            </div>

            <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800/60 sbf-neumo-raised-sm text-center">
              <span className="text-[10px] font-bold text-slate-400 uppercase">Source Total Rows</span>
              <p className="text-2xl font-black text-rose-600 dark:text-rose-400 mt-1 font-mono">
                {report.summary.totalSourceRecords.toLocaleString()}
              </p>
              <span className="text-[10px] text-slate-500">evaluated rows</span>
            </div>

            <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800/60 sbf-neumo-raised-sm text-center">
              <span className="text-[10px] font-bold text-slate-400 uppercase">Destination Total Rows</span>
              <p className="text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-1 font-mono">
                {report.summary.totalDestRecords.toLocaleString()}
              </p>
              <span className="text-[10px] text-slate-500">synchronized rows</span>
            </div>

            <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800/60 sbf-neumo-raised-sm text-center">
              <span className="text-[10px] font-bold text-slate-400 uppercase">Consistency Delta</span>
              <p className={`text-2xl font-black mt-1 font-mono ${
                report.summary.recordsDelta === 0 ? 'text-emerald-600' : 'text-rose-600'
              }`}>
                {report.summary.recordsDelta === 0 ? '0 (100% Match)' : `${report.summary.recordsDelta} rows`}
              </p>
              <span className="text-[10px] text-slate-500">
                {report.summary.inconsistenciesCount} detected anomalies
              </span>
            </div>
          </div>

          {/* Table Verification Results */}
          <NeumorphicCard
            headerTitle={`Table Verification Results (${filteredResults.length})`}
            headerDescription="Detailed breakdown of row parity, primary keys, and sequences for each synchronized table."
            headerIcon={FileCheck}
            headerAction={
              <div className="flex items-center gap-2">
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value as any)}
                  className="px-2.5 py-1 rounded-xl text-xs font-bold bg-slate-100 dark:bg-slate-800 border-none"
                >
                  <option value="all">All Tables</option>
                  <option value="PASSED">Passed Only</option>
                  <option value="WARNING">Warnings Only</option>
                  <option value="FAILED">Failed Only</option>
                </select>
                <div className="w-48">
                  <SearchInput
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    onClear={() => setSearch('')}
                    placeholder="Filter tables..."
                    className="w-full text-xs"
                  />
                </div>
              </div>
            }
          >
            <div className="overflow-x-auto rounded-2xl border border-slate-200/70 dark:border-slate-800/70">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-100/70 dark:bg-slate-800/70 text-[11px] text-slate-500 font-bold uppercase">
                  <tr>
                    <th className="py-2.5 px-3">Status</th>
                    <th className="py-2.5 px-3">Table Name</th>
                    <th className="py-2.5 px-3">Source Rows</th>
                    <th className="py-2.5 px-3">Dest Rows</th>
                    <th className="py-2.5 px-3">PK Match</th>
                    <th className="py-2.5 px-3">Sequence Sync</th>
                    <th className="py-2.5 px-3">Audit Notes</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-mono text-[11px]">
                  {filteredResults.map(t => {
                    const isPassed = t.status === 'PASSED';
                    const isWarn = t.status === 'WARNING';
                    return (
                      <tr key={t.tableName} className="hover:bg-slate-50 dark:hover:bg-slate-850">
                        <td className="py-2.5 px-3">
                          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-sans font-bold uppercase ${
                            isPassed
                              ? 'bg-emerald-100 text-emerald-800'
                              : isWarn
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-rose-100 text-rose-800'
                          }`}>
                            {isPassed ? <CheckCircle2 className="w-3 h-3 text-emerald-600" /> : <AlertTriangle className="w-3 h-3" />}
                            {t.status}
                          </span>
                        </td>
                        <td className="py-2.5 px-3 font-bold text-slate-900 dark:text-white">
                          {t.tableName}
                        </td>
                        <td className="py-2.5 px-3 text-slate-700 dark:text-slate-300">
                          {t.sourceRows.toLocaleString()}
                        </td>
                        <td className="py-2.5 px-3 font-bold text-emerald-600 dark:text-emerald-400">
                          {t.destRows.toLocaleString()}
                        </td>
                        <td className="py-2.5 px-3 font-sans">
                          {t.pkMatch ? (
                            <span className="text-emerald-600 font-bold">YES</span>
                          ) : (
                            <span className="text-rose-600 font-bold">NO</span>
                          )}
                        </td>
                        <td className="py-2.5 px-3 font-sans">
                          {t.sequenceSynced ? (
                            <span className="text-emerald-600 font-bold">CALIBRATED</span>
                          ) : (
                            <span className="text-amber-600 font-bold">MISALIGNED</span>
                          )}
                        </td>
                        <td className="py-2.5 px-3 font-sans text-slate-500 text-[10px]">
                          {t.notes && t.notes.length > 0 ? t.notes.join('; ') : 'Parity verified'}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </NeumorphicCard>
        </>
      ) : (
        <div className="p-12 text-center text-slate-400 border border-dashed rounded-3xl space-y-3">
          <ShieldCheck className="w-8 h-8 mx-auto text-slate-400 opacity-60" />
          <h4 className="text-base font-bold text-slate-700 dark:text-slate-300">
            No Verification Report Generated Yet
          </h4>
          <p className="text-xs max-w-md mx-auto">
            Verification runs automatically at the end of each migration job. You can also run an on-demand verification at any time using the button above.
          </p>
          <SoftButton
            variant="primary"
            size="md"
            onClick={handleRunManualVerification}
            loading={loading}
            icon={RefreshCw}
          >
            Run Verification Now
          </SoftButton>
        </div>
      )}
    </div>
  );
};

