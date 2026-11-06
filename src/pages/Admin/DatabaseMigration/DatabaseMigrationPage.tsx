import React, { useState, useEffect } from 'react';
import { 
  Database, 
  Server, 
  LayoutDashboard, 
  GitCompare, 
  Sliders, 
  Play, 
  ShieldCheck, 
  Clock, 
  Shield, 
  Table, 
  Zap, 
  RefreshCw,
  AlertTriangle
} from 'lucide-react';
import { PageHeader, SoftButton } from '@/components/dashboard';
import { OverviewData, MigrationStatus, dbMigrationService } from '@/services/dbMigrationService';
import { OverviewTab } from './components/OverviewTab';
import { ConnectionsTab } from './components/ConnectionsTab';
import { ExplorerTab } from './components/ExplorerTab';
import { SchemaDiffTab } from './components/SchemaDiffTab';
import { MigrationConfigTab } from './components/MigrationConfigTab';
import { ExecutionTab } from './components/ExecutionTab';
import { VerificationTab } from './components/VerificationTab';
import { HistoryTab } from './components/HistoryTab';
import { SettingsTab } from './components/SettingsTab';
import { useToast } from '@/hooks/use-toast';

export const DatabaseMigrationPage: React.FC = () => {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState<string>('overview');
  const [overviewData, setOverviewData] = useState<OverviewData | null>(null);
  const [migrationStatus, setMigrationStatus] = useState<MigrationStatus | null>(null);
  const [loading, setLoading] = useState(false);

  // Fetch overview
  const fetchOverview = async () => {
    setLoading(true);
    try {
      const data = await dbMigrationService.getOverview();
      setOverviewData(data);
      if (data.activeJob) {
        setMigrationStatus(data.activeJob);
      }
    } catch (err: any) {
      toast({
        title: 'Failed to load database overview',
        description: err.response?.data?.error || err.message,
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOverview();
  }, []);

  // Subscribe to real-time SSE updates
  useEffect(() => {
    const unsubscribe = dbMigrationService.subscribeToProgress(
      (status) => {
        setMigrationStatus(status);
        if (status.status === 'completed' && activeTab === 'execution') {
          // If just completed, fetch updated overview
          fetchOverview();
        }
      },
      (err) => {
        console.warn('SSE connection disconnected:', err);
      }
    );

    return () => {
      unsubscribe();
    };
  }, [activeTab]);

  const isJobActive = migrationStatus?.active;

  const tabs = [
    { id: 'overview', label: 'Overview', icon: LayoutDashboard },
    { id: 'connections', label: 'Connections', icon: Server, badge: overviewData?.source?.configured && overviewData?.destination?.configured ? 'Active' : 'Setup' },
    { id: 'explorer', label: 'Explorer', icon: Table },
    { id: 'diff', label: 'Schema Diff', icon: GitCompare },
    { id: 'config', label: 'Configure', icon: Sliders },
    { id: 'execution', label: 'Execution & Live', icon: Zap, isLive: isJobActive },
    { id: 'verification', label: 'Verification', icon: ShieldCheck },
    { id: 'history', label: 'History', icon: Clock },
    { id: 'settings', label: 'Security & Settings', icon: Shield }
  ];

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Page Header */}
      <PageHeader
        title="Database Migration & Transfer Control"
        description="Production-grade PostgreSQL streaming migration engine with schema comparison, live progress, and integrity verification."
        badge="Platform Admin"
        actions={
          <SoftButton
            variant="raised"
            size="sm"
            onClick={fetchOverview}
            loading={loading}
            icon={RefreshCw}
          >
            Refresh
          </SoftButton>
        }
      />

      {/* Active Job Floating / Sticky Banner */}
      {isJobActive && activeTab !== 'execution' && (
        <div className="p-3.5 px-4 rounded-2xl bg-gradient-to-r from-rose-600 to-indigo-600 text-white flex items-center justify-between shadow-lg animate-pulse">
          <div className="flex items-center gap-3">
            <Zap className="w-5 h-5 text-amber-300" />
            <div>
              <p className="text-xs font-bold">
                Active Migration Running: {migrationStatus?.stage.replace('_', ' ').toUpperCase()} ({migrationStatus?.progress}%)
              </p>
              <p className="text-[11px] text-white/80">
                {migrationStatus?.currentTable ? `Table: ${migrationStatus.currentTable} • ` : ''}
                {migrationStatus?.recordsTransferred.toLocaleString()} records transferred
              </p>
            </div>
          </div>
          <SoftButton
            variant="raised"
            size="sm"
            className="bg-white text-rose-600 hover:bg-slate-100 font-bold text-xs"
            onClick={() => setActiveTab('execution')}
          >
            Open Live Terminal
          </SoftButton>
        </div>
      )}

      {/* Navigation Sub-Tabs Bar */}
      <div className="flex items-center gap-1.5 p-1.5 rounded-3xl bg-[var(--sbf-card)] border border-slate-200/60 dark:border-slate-800/60 sbf-neumo-raised-sm overflow-x-auto scrollbar-none">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-2xl text-xs font-bold transition-all whitespace-nowrap shrink-0 ${
                isActive
                  ? 'bg-rose-600 text-white shadow-md'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/60'
              }`}
            >
              <Icon className="w-4 h-4 stroke-[2.2]" />
              <span>{tab.label}</span>
              {tab.isLive && (
                <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
              )}
              {tab.badge && !isActive && (
                <span className="text-[9px] px-1.5 py-0.2 rounded-full bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300">
                  {tab.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Tab Panels */}
      {activeTab === 'overview' && (
        <OverviewTab
          data={overviewData}
          loading={loading}
          onRefresh={fetchOverview}
          onNavigateTab={(tab) => setActiveTab(tab)}
        />
      )}

      {activeTab === 'connections' && (
        <ConnectionsTab
          sourceProfile={overviewData?.source || null}
          destProfile={overviewData?.destination || null}
          onRefresh={fetchOverview}
        />
      )}

      {activeTab === 'explorer' && (
        <ExplorerTab
          sourceConfigured={!!overviewData?.source?.configured}
          destConfigured={!!overviewData?.destination?.configured}
        />
      )}

      {activeTab === 'diff' && (
        <SchemaDiffTab
          onNavigateToMigrate={(mode) => {
            setActiveTab('config');
          }}
        />
      )}

      {activeTab === 'config' && (
        <MigrationConfigTab
          sourceConfigured={!!overviewData?.source?.configured}
          destConfigured={!!overviewData?.destination?.configured}
          sourceMasked={overviewData?.source?.maskedUrl || 'Unconfigured'}
          destMasked={overviewData?.destination?.maskedUrl || 'Unconfigured'}
          onStartExecution={(migrationId) => {
            setActiveTab('execution');
          }}
        />
      )}

      {activeTab === 'execution' && (
        <ExecutionTab
          migrationStatus={migrationStatus}
          onRefreshStatus={fetchOverview}
          onViewVerification={() => setActiveTab('verification')}
        />
      )}

      {activeTab === 'verification' && (
        <VerificationTab
          report={migrationStatus?.verificationReport || null}
          onRefresh={fetchOverview}
        />
      )}

      {activeTab === 'history' && (
        <HistoryTab />
      )}

      {activeTab === 'settings' && (
        <SettingsTab />
      )}
    </div>
  );
};

export default DatabaseMigrationPage;

