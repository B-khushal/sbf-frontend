import api from './api';
import { API_URL } from '../config';

export interface DatabaseProfile {
  configured: boolean;
  target: 'source' | 'destination';
  maskedUrl: string | null;
  database: string | null;
  host: string | null;
  port: number | null;
  user: string | null;
  sslActive: boolean;
  sslMode: string;
  savedAt?: string;
  diagnostics?: {
    success: boolean;
    latencyMs: number;
    pgVersion: string;
    fullVersion: string;
    databaseName: string;
    host: string;
    port: number;
    serverIp: string;
    totalTables: number;
    estimatedRecords: number;
    databaseSize: string;
    sslActive: boolean;
    readOnlyEnforced?: boolean;
    testedAt: string;
  } | null;
}

export interface OverviewData {
  success: boolean;
  source: DatabaseProfile;
  destination: DatabaseProfile;
  stats: {
    lastSuccessfulMigration: string | null;
    totalMigrationsCount: number;
    totalRecordsTransferredAllTime: number;
    activeJobRunning: boolean;
  };
  activeJob: MigrationStatus;
}

export interface TableColumn {
  name: string;
  position: number;
  defaultValue: string | null;
  isNullable: boolean;
  dataType: string;
  udtName: string;
  charMaxLength: number | null;
  precision: number | null;
  scale: number | null;
}

export interface ForeignKeyInfo {
  column: string;
  constraintName: string;
  foreignTable: string;
  foreignColumn: string;
  updateRule: string;
  deleteRule: string;
}

export interface TableIndex {
  name: string;
  definition: string;
  isUnique: boolean;
}

export interface TableMeta {
  schema: string;
  name: string;
  fullName: string;
  estimatedRows: number;
  exactRows: number | null;
  totalBytes: number;
  prettySize: string;
  columns: TableColumn[];
  primaryKey: string[];
  foreignKeys: ForeignKeyInfo[];
  indexes: TableIndex[];
}

export interface DatabaseInspection {
  success: boolean;
  target: 'source' | 'destination';
  schemas: string[];
  tables: TableMeta[];
  summary: {
    totalSchemas: number;
    totalTables: number;
    totalRecords: number;
    totalBytes: number;
    inspectedAt: string;
  };
  error?: string;
}

export interface SchemaComparison {
  success: boolean;
  syncStatus: 'in_sync' | 'tables_missing' | 'diverged';
  summary: {
    sourceTablesCount: number;
    destTablesCount: number;
    sourceTotalRecords: number;
    destTotalRecords: number;
    missingTablesCount: number;
    extraTablesCount: number;
    matchingTablesCount: number;
    tablesWithDifferencesCount: number;
    comparedAt: string;
  };
  missingTablesInDest: Array<{
    fullName: string;
    schema: string;
    name: string;
    sourceRows: number;
    sourceSize: string;
  }>;
  extraTablesInDest: Array<{
    fullName: string;
    schema: string;
    name: string;
    destRows: number;
    destSize: string;
  }>;
  matchingTables: Array<{
    fullName: string;
    schema: string;
    name: string;
    sourceRows: number;
    destRows: number;
    rowDelta: number;
    pkMatch: boolean;
    sourceColumnsCount: number;
    destColumnsCount: number;
    hasColumnDifferences: boolean;
    columnDifferences?: {
      hasDifferences: boolean;
      missingInDest: TableColumn[];
      missingInSource: TableColumn[];
      typeMismatches: Array<{ column: string; sourceType: string; destType: string }>;
    };
  }>;
  tableDifferences: Array<any>;
  source: DatabaseInspection | null;
  destination: DatabaseInspection | null;
  error?: string;
}

export interface MigrationStatus {
  status: 'idle' | 'starting' | 'running' | 'paused' | 'cancelling' | 'completed' | 'failed' | 'cancelled';
  active: boolean;
  migrationId: string | null;
  progress: number;
  stage: string;
  currentTable: string | null;
  tablesCompleted: number;
  totalTables: number;
  recordsTransferred: number;
  totalEstimatedRecords: number;
  transferSpeed: number;
  elapsedTimeMs: number;
  estimatedRemainingTimeMs: number;
  successfulTables: string[];
  failedTables: Array<{ table: string; error: string }>;
  isPaused: boolean;
  isCancelled: boolean;
  recentLogs: Array<{ timestamp: string; message: string; type: 'info' | 'warning' | 'error' }>;
}

export interface VerificationReport {
  success: boolean;
  overallStatus: 'PASSED' | 'WARNING' | 'FAILED';
  verificationDurationMs: number;
  summary: {
    totalTablesChecked: number;
    passedTables: number;
    warningTables: number;
    failedTables: number;
    totalSourceRecords: number;
    totalDestRecords: number;
    recordsDelta: number;
    inconsistenciesCount: number;
  };
  tableResults: Array<{
    tableName: string;
    schema: string;
    table: string;
    sourceExists: boolean;
    destExists: boolean;
    sourceRows: number;
    destRows: number;
    rowMatch: boolean;
    pkMatch: boolean;
    fkIntegrity: boolean;
    sequenceSynced: boolean;
    status: 'PASSED' | 'WARNING' | 'FAILED';
    notes: string[];
  }>;
  detectedInconsistencies: Array<{ table?: string; issue: string }>;
  verifiedAt: string;
  error?: string;
}

export interface MigrationHistoryItem {
  migrationId: string;
  startedBy: string;
  startedById?: string | null;
  sourceIdentifier: string;
  destIdentifier: string;
  migrationType: 'complete' | 'selective' | 'data_only';
  conflictStrategy: string;
  batchSize: number;
  tablesSelected: string[];
  totalEstimatedRecords: number;
  recordsTransferred: number;
  startedAt: string;
  completedAt: string | null;
  durationMs: number;
  status: 'in_progress' | 'completed' | 'failed' | 'cancelled';
  errorDetails?: string | null;
  verificationReport?: VerificationReport | null;
  hasLogs: boolean;
}

// Normalize base URL so we never get /api/api
const getNormalizedApiBase = () => {
  const base = API_URL.replace(/\/+$/, '');
  return base.endsWith('/api') ? base : `${base}/api`;
};

export const dbMigrationService = {
  // 1. Overview
  async getOverview(): Promise<OverviewData> {
    const res = await api.get('/admin/db-migration/overview');
    return res.data;
  },

  // 2. Connections
  async testConnection(target: 'source' | 'destination', connectionString: string, sslConfig: any = {}) {
    const res = await api.post('/admin/db-migration/connections/test', {
      target,
      connectionString,
      sslConfig
    });
    return res.data;
  },

  async saveConnection(target: 'source' | 'destination', connectionString: string, sslConfig: any = {}) {
    const res = await api.post('/admin/db-migration/connections/save', {
      target,
      connectionString,
      sslConfig
    });
    return res.data;
  },

  async getConnections(): Promise<{ success: boolean; source: DatabaseProfile; destination: DatabaseProfile }> {
    const res = await api.get('/admin/db-migration/connections');
    return res.data;
  },

  async clearConnection(target: 'source' | 'destination') {
    const res = await api.delete(`/admin/db-migration/connections/${target}`);
    return res.data;
  },

  // 3. Inspection & Diff
  async inspectDatabase(target: 'source' | 'destination', exact: boolean = false): Promise<DatabaseInspection> {
    const res = await api.get(`/admin/db-migration/inspect/${target}?exact=${exact}`);
    return res.data;
  },

  async compareDatabases(exact: boolean = false): Promise<SchemaComparison> {
    const res = await api.get(`/admin/db-migration/compare?exact=${exact}`);
    return res.data;
  },

  // 4. Preview & Planning
  async previewMigration(payload: {
    mode: 'complete' | 'selective' | 'data_only';
    selectedTables?: string[];
    conflictStrategy?: string;
  }) {
    const res = await api.post('/admin/db-migration/preview', payload);
    return res.data;
  },

  // 5. Execution Controls
  async startMigration(payload: {
    mode: 'complete' | 'selective' | 'data_only';
    selectedTables?: string[];
    conflictStrategy?: string;
    batchSize?: number;
    createBackup?: boolean;
  }) {
    const res = await api.post('/admin/db-migration/start', payload);
    return res.data;
  },

  async pauseMigration() {
    const res = await api.post('/admin/db-migration/pause');
    return res.data;
  },

  async resumeMigration() {
    const res = await api.post('/admin/db-migration/resume');
    return res.data;
  },

  async cancelMigration() {
    const res = await api.post('/admin/db-migration/cancel');
    return res.data;
  },

  async getStatus(): Promise<{ success: boolean; status: MigrationStatus }> {
    const res = await api.get('/admin/db-migration/status');
    return res.data;
  },

  // 6. SSE Stream
  subscribeToProgress(
    onMessage: (status: MigrationStatus) => void,
    onError?: (err: any) => void
  ): () => void {
    const token = localStorage.getItem('token') || '';
    const apiBase = getNormalizedApiBase();
    const sseUrl = `${apiBase}/admin/db-migration/stream?token=${encodeURIComponent(token)}`;
    const eventSource = new EventSource(sseUrl, { withCredentials: true });

    eventSource.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        onMessage(data);
      } catch (e) {
        // ignore parse error for heartbeat
      }
    };

    eventSource.onerror = (err) => {
      if (onError) onError(err);
    };

    return () => {
      eventSource.close();
    };
  },

  // 7. Verification & History
  async verifyMigration(tables?: string[]): Promise<VerificationReport> {
    const res = await api.post('/admin/db-migration/verify', { tables });
    return res.data;
  },

  async getHistory(): Promise<{ success: boolean; history: MigrationHistoryItem[] }> {
    const res = await api.get('/admin/db-migration/history');
    return res.data;
  },

  async getHistoryDetails(migrationId: string): Promise<{ success: boolean; details: MigrationHistoryItem }> {
    const res = await api.get(`/admin/db-migration/history/${migrationId}`);
    return res.data;
  },

  async getMigrationLogs(migrationId: string): Promise<{ success: boolean; logs: string }> {
    const res = await api.get(`/admin/db-migration/history/${migrationId}/logs`);
    return res.data;
  },

  getDownloadLogsUrl(migrationId: string): string {
    const token = localStorage.getItem('token') || '';
    const apiBase = getNormalizedApiBase();
    return `${apiBase}/admin/db-migration/history/${migrationId}/logs?download=true&token=${encodeURIComponent(token)}`;
  },

  async deleteHistory(migrationId: string) {
    const res = await api.delete(`/admin/db-migration/history/${migrationId}`);
    return res.data;
  }
};

export default dbMigrationService;
