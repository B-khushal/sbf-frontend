import React from 'react';
import { 
  Shield, 
  Lock, 
  Key, 
  CheckCircle2, 
  Server, 
  AlertTriangle, 
  Sliders, 
  Database,
  FileCheck
} from 'lucide-react';
import { NeumorphicCard, StatusBadge } from '@/components/dashboard';

export const SettingsTab: React.FC = () => {
  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex items-center justify-between p-4 rounded-3xl bg-[var(--sbf-card)] border border-slate-200/60 dark:border-slate-800/60 sbf-neumo-raised-sm">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 flex items-center justify-center border border-slate-200/50">
            <Shield className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              Enterprise Security & Engine Protocols
              <StatusBadge status="success" label="HARDENED" />
            </h4>
            <p className="text-xs text-slate-500">
              Active system policies governing database access controls, cryptographic storage, and network boundaries.
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
        {/* Access Control & RBAC Card */}
        <NeumorphicCard
          headerTitle="Role-Based Access Control (RBAC)"
          headerDescription="Tier 1 Platform Administrator clearance policy."
          headerIcon={Lock}
          variant="raised"
        >
          <div className="space-y-3">
            <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/50 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-slate-500 font-semibold">Authorized Role:</span>
                <span className="font-bold text-rose-600 dark:text-rose-400">Platform Administrator</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500 font-semibold">Store Managers / Staff:</span>
                <span className="font-bold text-slate-500">Access Denied (403 Forbidden)</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500 font-semibold">Vendors / Customers:</span>
                <span className="font-bold text-slate-500">Access Denied (403 Forbidden)</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500 font-semibold">Session Validation:</span>
                <span className="text-emerald-600 font-bold">JWT Bearer + Token Revocation Audit</span>
              </div>
            </div>
            <p className="text-slate-500 text-[11px]">
              Every API request under <code>/api/admin/db-migration/*</code> verifies Platform Administrator privileges on the backend before executing any database action.
            </p>
          </div>
        </NeumorphicCard>

        {/* Cryptography & Data Protection */}
        <NeumorphicCard
          headerTitle="Credential Cryptography"
          headerDescription="Storage encryption and redaction standards."
          headerIcon={Key}
          variant="raised"
        >
          <div className="space-y-3">
            <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/50 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-slate-500 font-semibold">Encryption Cipher:</span>
                <span className="font-bold text-indigo-600 dark:text-indigo-400">AES-256-GCM (96-bit IV)</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500 font-semibold">Password Storage:</span>
                <span className="text-emerald-600 font-bold">Zero Plaintext Persistence</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500 font-semibold">Frontend Transmission:</span>
                <span className="text-emerald-600 font-bold">Strictly Redacted (Masked URLs)</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500 font-semibold">Log & Error Scrubber:</span>
                <span className="text-emerald-600 font-bold">Regex Redaction Active</span>
              </div>
            </div>
            <p className="text-slate-500 text-[11px]">
              Connection strings are never saved in cleartext or logged into system standard output. Passwords are automatically masked as <code>••••••••</code> in all API payloads.
            </p>
          </div>
        </NeumorphicCard>

        {/* Source Read-Only Safeguard */}
        <NeumorphicCard
          headerTitle="Source Database Read-Only Enforcement"
          headerDescription="Guaranteed non-destructive production safety."
          headerIcon={Server}
          variant="raised"
        >
          <div className="space-y-3">
            <div className="p-3 rounded-2xl bg-rose-50/50 dark:bg-rose-950/20 border border-rose-200/50 space-y-2 text-rose-950 dark:text-rose-200">
              <div className="flex items-center gap-2 font-bold">
                <CheckCircle2 className="w-4 h-4 text-rose-600" />
                Session Parameter: <code>default_transaction_read_only = on</code>
              </div>
              <div className="flex items-center gap-2 font-bold">
                <CheckCircle2 className="w-4 h-4 text-rose-600" />
                Explicit SQL Write Prevention
              </div>
              <div className="flex items-center gap-2 font-bold">
                <CheckCircle2 className="w-4 h-4 text-rose-600" />
                No <code>DROP</code>, <code>TRUNCATE</code>, <code>ALTER</code> or <code>INSERT</code> on Source
              </div>
            </div>
            <p className="text-slate-500 text-[11px]">
              Every connection client established with the Source database issues a read-only transaction lock prior to executing queries, making accidental writes physically impossible.
            </p>
          </div>
        </NeumorphicCard>

        {/* Engine Timeouts & Rate Limits */}
        <NeumorphicCard
          headerTitle="Network Timeouts & Resource Throttling"
          headerDescription="Prevents database connection starvation and DDoS."
          headerIcon={Sliders}
          variant="raised"
        >
          <div className="space-y-3">
            <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/50 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-slate-500 font-semibold">Test Connection Timeout:</span>
                <span className="font-bold text-slate-800 dark:text-slate-200">10,000 ms (10 seconds)</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500 font-semibold">Batch Query Timeout:</span>
                <span className="font-bold text-slate-800 dark:text-slate-200">60,000 ms (60 seconds)</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500 font-semibold">API Rate Limiting:</span>
                <span className="font-bold text-slate-800 dark:text-slate-200">30 requests / minute</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500 font-semibold">Snapshot Retain Count:</span>
                <span className="font-bold text-slate-800 dark:text-slate-200">5 most recent snapshots</span>
              </div>
            </div>
            <p className="text-slate-500 text-[11px]">
              Automatic retry logic allows up to 3 recoverable attempts for transient network glitches before marking a table batch as failed.
            </p>
          </div>
        </NeumorphicCard>
      </div>
    </div>
  );
};

