import React, { useState } from 'react';
import { 
  Server, 
  Database, 
  Shield, 
  CheckCircle2, 
  XCircle, 
  Activity, 
  Eye, 
  EyeOff, 
  Lock, 
  RefreshCw, 
  Trash2, 
  AlertTriangle,
  Info,
  Check,
  Zap
} from 'lucide-react';
import { DatabaseProfile, dbMigrationService } from '@/services/dbMigrationService';
import { NeumorphicCard, SoftButton, StatusBadge } from '@/components/dashboard';
import { useToast } from '@/hooks/use-toast';

interface ConnectionsTabProps {
  sourceProfile: DatabaseProfile | null;
  destProfile: DatabaseProfile | null;
  onRefresh: () => void;
}

export const ConnectionsTab: React.FC<ConnectionsTabProps> = ({
  sourceProfile,
  destProfile,
  onRefresh
}) => {
  const { toast } = useToast();

  // Source DB state - empty by default with placeholder
  const [sourceUrl, setSourceUrl] = useState('');
  const [sourceSslMode, setSourceSslMode] = useState<'require' | 'prefer' | 'disable'>('require');
  const [sourceRejectUnauthorized, setSourceRejectUnauthorized] = useState(false);
  const [isTestingSource, setIsTestingSource] = useState(false);
  const [isSavingSource, setIsSavingSource] = useState(false);
  const [sourceTestResult, setSourceTestResult] = useState<any>(null);

  // Destination DB state - empty by default with placeholder
  const [destUrl, setDestUrl] = useState('');
  const [destSslMode, setDestSslMode] = useState<'require' | 'prefer' | 'disable'>('disable');
  const [destRejectUnauthorized, setDestRejectUnauthorized] = useState(false);
  const [isTestingDest, setIsTestingDest] = useState(false);
  const [isSavingDest, setIsSavingDest] = useState(false);
  const [destTestResult, setDestTestResult] = useState<any>(null);

  // Test Connection Handler
  const handleTest = async (target: 'source' | 'destination') => {
    const url = target === 'source' ? sourceUrl : destUrl;
    if (!url || !url.trim()) {
      toast({
        title: 'Connection URL Required',
        description: `Please enter the ${target} PostgreSQL connection URL before testing.`,
        variant: 'destructive'
      });
      return;
    }

    const sslConfig = target === 'source' ? {
      mode: sourceSslMode,
      rejectUnauthorized: sourceRejectUnauthorized
    } : {
      mode: destSslMode,
      rejectUnauthorized: destRejectUnauthorized
    };

    if (target === 'source') {
      setIsTestingSource(true);
      setSourceTestResult(null);
    } else {
      setIsTestingDest(true);
      setDestTestResult(null);
    }

    try {
      const result = await dbMigrationService.testConnection(target, url.trim(), sslConfig);
      if (target === 'source') {
        setSourceTestResult(result);
      } else {
        setDestTestResult(result);
      }

      if (result.success) {
        toast({
          title: `${target.toUpperCase()} Connection Successful!`,
          description: `Connected in ${result.latencyMs}ms (${result.pgVersion}, ${result.totalTables} tables found).`
        });
      } else {
        toast({
          title: `${target.toUpperCase()} Connection Failed`,
          description: result.error || 'Could not establish connection to PostgreSQL server.',
          variant: 'destructive'
        });
      }
    } catch (err: any) {
      const errorMsg = err.response?.data?.error || err.message || 'Connection test failed';
      const failObj = { success: false, error: errorMsg };
      if (target === 'source') setSourceTestResult(failObj);
      else setDestTestResult(failObj);

      toast({
        title: `${target.toUpperCase()} Connection Error`,
        description: errorMsg,
        variant: 'destructive'
      });
    } finally {
      if (target === 'source') setIsTestingSource(false);
      else setIsTestingDest(false);
    }
  };

  // Save Connection Handler
  const handleSave = async (target: 'source' | 'destination') => {
    const url = target === 'source' ? sourceUrl : destUrl;
    if (!url || !url.trim()) {
      toast({
        title: 'Connection URL Required',
        description: `Please enter the ${target} PostgreSQL connection URL.`,
        variant: 'destructive'
      });
      return;
    }

    const sslConfig = target === 'source' ? {
      mode: sourceSslMode,
      rejectUnauthorized: sourceRejectUnauthorized
    } : {
      mode: destSslMode,
      rejectUnauthorized: destRejectUnauthorized
    };

    if (target === 'source') setIsSavingSource(true);
    else setIsSavingDest(true);

    try {
      const res = await dbMigrationService.saveConnection(target, url.trim(), sslConfig);
      if (res.success) {
        toast({
          title: `${target.toUpperCase()} Configuration Saved`,
          description: 'Credentials have been encrypted using AES-256-GCM.'
        });
        // Clear plaintext input after successful save for maximum security
        if (target === 'source') setSourceUrl('');
        else setDestUrl('');
        onRefresh();
      }
    } catch (err: any) {
      toast({
        title: 'Failed to Save Configuration',
        description: err.response?.data?.error || err.message,
        variant: 'destructive'
      });
    } finally {
      if (target === 'source') setIsSavingSource(false);
      else setIsSavingDest(false);
    }
  };

  // Clear Connection Handler
  const handleClear = async (target: 'source' | 'destination') => {
    if (!window.confirm(`Are you sure you want to disconnect and clear the ${target} database profile?`)) {
      return;
    }

    try {
      await dbMigrationService.clearConnection(target);
      toast({
        title: `${target.toUpperCase()} Profile Cleared`,
        description: 'Connection parameters have been erased from server memory.'
      });
      if (target === 'source') setSourceTestResult(null);
      else setDestTestResult(null);
      onRefresh();
    } catch (err: any) {
      toast({
        title: 'Clear Failed',
        description: err.message,
        variant: 'destructive'
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* Security Advisory Card */}
      <div className="p-4 rounded-2xl bg-amber-50/60 dark:bg-amber-950/20 border border-amber-200/60 dark:border-amber-900/40 text-xs flex items-start gap-3">
        <Lock className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
        <div>
          <h5 className="font-bold text-amber-900 dark:text-amber-200">
            Zero-Trust Credential Security Protocol
          </h5>
          <p className="text-amber-800/90 dark:text-amber-300/80 mt-0.5">
            Database credentials are encrypted server-side with AES-256-GCM. Raw credentials are never transmitted back to the browser or logged in console logs. Source connections are permanently enforced as read-only.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* SOURCE DATABASE CONFIGURATION */}
        <NeumorphicCard
          headerTitle="Source Database (Server / Production)"
          headerDescription="Remote production database to extract data from."
          headerIcon={Server}
          headerAction={
            sourceProfile?.configured ? (
              <SoftButton
                variant="danger"
                size="sm"
                onClick={() => handleClear('source')}
                icon={Trash2}
              >
                Disconnect
              </SoftButton>
            ) : null
          }
        >
          <div className="space-y-4 text-xs">
            {sourceProfile?.configured && (
              <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/60 dark:border-slate-800/60 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-slate-500">Active Profile:</span>
                  <StatusBadge status="success" label="Securely Saved (Encrypted)" />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">Masked URL:</span>
                  <code className="text-rose-600 dark:text-rose-400 font-mono text-[11px] font-bold">
                    {sourceProfile.maskedUrl}
                  </code>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">Target Server:</span>
                  <span className="text-slate-700 dark:text-slate-300 font-medium">
                    {sourceProfile.host}:{sourceProfile.port} / {sourceProfile.database}
                  </span>
                </div>
                {sourceProfile.diagnostics && (
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">Latency & Tables:</span>
                    <span className="text-emerald-600 dark:text-emerald-400 font-bold">
                      {sourceProfile.diagnostics.latencyMs}ms • {sourceProfile.diagnostics.totalTables} tables
                    </span>
                  </div>
                )}
              </div>
            )}

            <div>
              <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1.5">
                {sourceProfile?.configured ? 'Update Connection URL' : 'Source Connection URL *'}
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={sourceUrl}
                  onChange={(e) => setSourceUrl(e.target.value)}
                  placeholder="postgresql://postgres:ddkka2006@187.127.150.217:5432/sbflorist"
                  className="w-full px-3.5 py-2.5 rounded-xl text-xs font-mono bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 focus:outline-hidden focus:ring-2 focus:ring-rose-500 shadow-inner"
                />
              </div>
              <p className="text-[11px] text-slate-400 mt-1">
                Leave empty or paste remote server PostgreSQL URL.
              </p>
            </div>

            {/* SSL Settings */}
            <div className="p-3 rounded-2xl bg-slate-50/70 dark:bg-slate-900/40 border border-slate-200/50 space-y-2">
              <span className="font-bold text-slate-800 dark:text-slate-200 block">
                SSL / TLS Configuration
              </span>
              <div className="grid grid-cols-3 gap-2">
                {(['require', 'prefer', 'disable'] as const).map(mode => (
                  <button
                    key={mode}
                    type="button"
                    onClick={() => setSourceSslMode(mode)}
                    className={`py-1.5 px-2 rounded-lg font-bold capitalize transition-all ${
                      sourceSslMode === mode
                        ? 'bg-rose-600 text-white shadow-xs'
                        : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700'
                    }`}
                  >
                    {mode}
                  </button>
                ))}
              </div>
              <label className="flex items-center gap-2 cursor-pointer pt-1">
                <input
                  type="checkbox"
                  checked={!sourceRejectUnauthorized}
                  onChange={(e) => setSourceRejectUnauthorized(!e.target.checked)}
                  className="rounded text-rose-600 focus:ring-rose-500"
                />
                <span className="text-[11px] text-slate-600 dark:text-slate-400">
                  Allow self-signed / cloud CA certificates (<code>rejectUnauthorized: false</code>)
                </span>
              </label>
            </div>

            {/* Test Results Output */}
            {sourceTestResult && (
              <div className={`p-3 rounded-xl border text-xs ${
                sourceTestResult.success
                  ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                  : 'bg-rose-50 text-rose-800 border-rose-200'
              }`}>
                <div className="flex items-center gap-1.5 font-bold mb-1">
                  {sourceTestResult.success ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  ) : (
                    <XCircle className="w-4 h-4 text-rose-600" />
                  )}
                  {sourceTestResult.success ? 'Source Connection Verified' : 'Connection Failed'}
                </div>
                {sourceTestResult.success ? (
                  <div className="space-y-0.5 text-[11px]">
                    <p>• Latency: {sourceTestResult.latencyMs} ms</p>
                    <p>• Database: {sourceTestResult.databaseName} (PostgreSQL {sourceTestResult.pgVersion})</p>
                    <p>• Schema: {sourceTestResult.totalTables} base tables, ~{sourceTestResult.estimatedRecords?.toLocaleString()} records</p>
                    <p>• Enforced Read-Only: YES</p>
                  </div>
                ) : (
                  <p className="text-[11px]">{sourceTestResult.error}</p>
                )}
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex items-center gap-2 pt-2">
              <SoftButton
                variant="raised"
                size="md"
                onClick={() => handleTest('source')}
                loading={isTestingSource}
                icon={Zap}
                className="flex-1"
              >
                Test Connection
              </SoftButton>
              <SoftButton
                variant="primary"
                size="md"
                onClick={() => handleSave('source')}
                loading={isSavingSource}
                icon={Check}
                className="flex-1"
              >
                Save & Encrypt
              </SoftButton>
            </div>
          </div>
        </NeumorphicCard>

        {/* DESTINATION DATABASE CONFIGURATION */}
        <NeumorphicCard
          headerTitle="Destination Database (Local PostgreSQL)"
          headerDescription="Target PostgreSQL database where data will be imported."
          headerIcon={Database}
          headerAction={
            destProfile?.configured ? (
              <SoftButton
                variant="danger"
                size="sm"
                onClick={() => handleClear('destination')}
                icon={Trash2}
              >
                Disconnect
              </SoftButton>
            ) : null
          }
        >
          <div className="space-y-4 text-xs">
            {destProfile?.configured && (
              <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/60 dark:border-slate-800/60 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-slate-500">Active Profile:</span>
                  <StatusBadge status="success" label="Securely Saved (Encrypted)" />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">Masked URL:</span>
                  <code className="text-emerald-600 dark:text-emerald-400 font-mono text-[11px] font-bold">
                    {destProfile.maskedUrl}
                  </code>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">Target Server:</span>
                  <span className="text-slate-700 dark:text-slate-300 font-medium">
                    {destProfile.host}:{destProfile.port} / {destProfile.database}
                  </span>
                </div>
                {destProfile.diagnostics && (
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">Latency & Tables:</span>
                    <span className="text-emerald-600 dark:text-emerald-400 font-bold">
                      {destProfile.diagnostics.latencyMs}ms • {destProfile.diagnostics.totalTables} tables
                    </span>
                  </div>
                )}
              </div>
            )}

            <div>
              <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1.5">
                {destProfile?.configured ? 'Update Connection URL' : 'Destination Connection URL *'}
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={destUrl}
                  onChange={(e) => setDestUrl(e.target.value)}
                  placeholder="postgresql://postgres:khushal893@localhost:5432/sbflorist_db"
                  className="w-full px-3.5 py-2.5 rounded-xl text-xs font-mono bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 focus:outline-hidden focus:ring-2 focus:ring-emerald-500 shadow-inner"
                />
              </div>
              <p className="text-[11px] text-slate-400 mt-1">
                Leave empty or paste local PostgreSQL instance URL.
              </p>
            </div>

            {/* SSL Settings */}
            <div className="p-3 rounded-2xl bg-slate-50/70 dark:bg-slate-900/40 border border-slate-200/50 space-y-2">
              <span className="font-bold text-slate-800 dark:text-slate-200 block">
                SSL / TLS Configuration
              </span>
              <div className="grid grid-cols-3 gap-2">
                {(['require', 'prefer', 'disable'] as const).map(mode => (
                  <button
                    key={mode}
                    type="button"
                    onClick={() => setDestSslMode(mode)}
                    className={`py-1.5 px-2 rounded-lg font-bold capitalize transition-all ${
                      destSslMode === mode
                        ? 'bg-emerald-600 text-white shadow-xs'
                        : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700'
                    }`}
                  >
                    {mode}
                  </button>
                ))}
              </div>
              <label className="flex items-center gap-2 cursor-pointer pt-1">
                <input
                  type="checkbox"
                  checked={!destRejectUnauthorized}
                  onChange={(e) => setDestRejectUnauthorized(!e.target.checked)}
                  className="rounded text-emerald-600 focus:ring-emerald-500"
                />
                <span className="text-[11px] text-slate-600 dark:text-slate-400">
                  Allow self-signed / cloud CA certificates (<code>rejectUnauthorized: false</code>)
                </span>
              </label>
            </div>

            {/* Test Results Output */}
            {destTestResult && (
              <div className={`p-3 rounded-xl border text-xs ${
                destTestResult.success
                  ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                  : 'bg-rose-50 text-rose-800 border-rose-200'
              }`}>
                <div className="flex items-center gap-1.5 font-bold mb-1">
                  {destTestResult.success ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  ) : (
                    <XCircle className="w-4 h-4 text-rose-600" />
                  )}
                  {destTestResult.success ? 'Destination Connection Verified' : 'Connection Failed'}
                </div>
                {destTestResult.success ? (
                  <div className="space-y-0.5 text-[11px]">
                    <p>• Latency: {destTestResult.latencyMs} ms</p>
                    <p>• Database: {destTestResult.databaseName} (PostgreSQL {destTestResult.pgVersion})</p>
                    <p>• Schema: {destTestResult.totalTables} base tables, ~{destTestResult.estimatedRecords?.toLocaleString()} records</p>
                    <p>• Access: Read & Write</p>
                  </div>
                ) : (
                  <p className="text-[11px]">{destTestResult.error}</p>
                )}
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex items-center gap-2 pt-2">
              <SoftButton
                variant="raised"
                size="md"
                onClick={() => handleTest('destination')}
                loading={isTestingDest}
                icon={Zap}
                className="flex-1"
              >
                Test Connection
              </SoftButton>
              <SoftButton
                variant="primary"
                size="md"
                onClick={() => handleSave('destination')}
                loading={isSavingDest}
                icon={Check}
                className="flex-1"
              >
                Save & Encrypt
              </SoftButton>
            </div>
          </div>
        </NeumorphicCard>
      </div>
    </div>
  );
};

