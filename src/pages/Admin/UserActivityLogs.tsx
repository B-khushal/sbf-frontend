import React, { useEffect, useMemo, useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  ArrowDown,
  ArrowUp,
  ChevronsLeft,
  ChevronsRight,
  Download,
  FileSpreadsheet,
  Search,
} from 'lucide-react';
import api from '@/services/api';
import { useToast } from '@/hooks/use-toast';

type ActivityLogRow = {
  id: string;
  logId: string;
  userId?: string;
  userName?: string;
  email?: string;
  actionType: string;
  url: string;
  method: string;
  timestamp: string;
  ipAddress?: string;
  device?: string;
  status: 'Success' | 'Failed';
  sessionId?: string;
  metadata?: Record<string, unknown>;
};

type PaginationInfo = {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
};

type SortBy = 'timestamp' | 'user' | 'actionType';
type SortOrder = 'asc' | 'desc';

const METHOD_OPTIONS = ['all', 'GET', 'POST', 'PUT', 'PATCH', 'DELETE'];
const STATUS_OPTIONS = ['all', 'Success', 'Failed'];
const PAGE_SIZE_OPTIONS = ['10', '25', '50'];

const UserActivityLogs: React.FC = () => {
  const { toast } = useToast();

  const [logs, setLogs] = useState<ActivityLogRow[]>([]);
  const [actionTypes, setActionTypes] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const [searchTerm, setSearchTerm] = useState('');
  const [actionTypeFilter, setActionTypeFilter] = useState('all');
  const [urlFilter, setUrlFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [methodFilter, setMethodFilter] = useState('all');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');

  const [sortBy, setSortBy] = useState<SortBy>('timestamp');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');

  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);
  const [pagination, setPagination] = useState<PaginationInfo>({
    page: 1,
    limit: 25,
    total: 0,
    totalPages: 1,
  });

  const buildQueryParams = () => {
    const params = new URLSearchParams();

    params.append('page', String(page));
    params.append('limit', String(pageSize));
    params.append('sortBy', sortBy);
    params.append('sortOrder', sortOrder);

    if (searchTerm.trim()) params.append('search', searchTerm.trim());
    if (actionTypeFilter !== 'all') params.append('actionType', actionTypeFilter);
    if (urlFilter.trim()) params.append('url', urlFilter.trim());
    if (statusFilter !== 'all') params.append('status', statusFilter);
    if (methodFilter !== 'all') params.append('method', methodFilter);
    if (dateFrom) params.append('dateFrom', dateFrom);
    if (dateTo) params.append('dateTo', dateTo);

    return params;
  };

  const fetchLogs = async () => {
    try {
      setIsLoading(true);
      const params = buildQueryParams();
      const response = await api.get(`/admin/logs?${params.toString()}`);

      if (response.data?.success) {
        setLogs(response.data.logs || []);
        setActionTypes(response.data.filters?.actionTypes || []);
        setPagination({
          page: response.data.pagination?.page || 1,
          limit: response.data.pagination?.limit || pageSize,
          total: response.data.pagination?.total || 0,
          totalPages: response.data.pagination?.totalPages || 1,
        });
      }
    } catch (error) {
      console.error('Error fetching activity logs:', error);
      toast({
        title: 'Error',
        description: 'Failed to load activity logs.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    void fetchLogs();
  }, [page, pageSize, sortBy, sortOrder]);

  useEffect(() => {
    setPage(1);
  }, [searchTerm, actionTypeFilter, urlFilter, statusFilter, methodFilter, dateFrom, dateTo]);

  useEffect(() => {
    void fetchLogs();
  }, [searchTerm, actionTypeFilter, urlFilter, statusFilter, methodFilter, dateFrom, dateTo]);

  const toggleSort = (column: SortBy) => {
    if (sortBy === column) {
      setSortOrder((prev) => (prev === 'asc' ? 'desc' : 'asc'));
      return;
    }

    setSortBy(column);
    setSortOrder(column === 'timestamp' ? 'desc' : 'asc');
  };

  const sortIndicator = (column: SortBy) => {
    if (sortBy !== column) return null;
    return sortOrder === 'asc' ? <ArrowUp className="h-3.5 w-3.5" /> : <ArrowDown className="h-3.5 w-3.5" />;
  };

  const formatDateTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  };

  const getStatusVariant = (status: ActivityLogRow['status']) => {
    if (status === 'Failed') return 'destructive';
    return 'default';
  };

  const exportRows = useMemo(() => {
    return logs.map((log) => ({
      logId: log.logId,
      userName: log.userName || '-',
      email: log.email || '-',
      actionType: log.actionType,
      url: log.url,
      method: log.method,
      timestamp: formatDateTime(log.timestamp),
      ipAddress: log.ipAddress || '-',
      device: log.device || '-',
      status: log.status,
      sessionId: log.sessionId || '-',
    }));
  }, [logs]);

  const exportToCSV = () => {
    try {
      const headers = [
        'Log ID',
        'User',
        'Email',
        'Action',
        'URL',
        'Method',
        'Timestamp',
        'IP Address',
        'Device',
        'Status',
        'Session ID',
      ];

      const rows = [
        headers,
        ...exportRows.map((row) => [
          row.logId,
          row.userName,
          row.email,
          row.actionType,
          row.url,
          row.method,
          row.timestamp,
          row.ipAddress,
          row.device,
          row.status,
          row.sessionId,
        ]),
      ];

      const csvContent = rows
        .map((row) =>
          row
            .map((cell) => {
              const value = String(cell || '');
              return value.includes(',') || value.includes('"') || value.includes('\n')
                ? `"${value.replace(/"/g, '""')}"`
                : value;
            })
            .join(',')
        )
        .join('\n');

      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `activity-logs-${new Date().toISOString().slice(0, 10)}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      toast({
        title: 'Success',
        description: 'Activity logs exported as CSV.',
      });
    } catch (error) {
      console.error('CSV export failed:', error);
      toast({
        title: 'Error',
        description: 'Failed to export CSV.',
        variant: 'destructive',
      });
    }
  };

  const exportToExcel = () => {
    try {
      const headers = [
        'Log ID',
        'User',
        'Email',
        'Action',
        'URL',
        'Method',
        'Timestamp',
        'IP Address',
        'Device',
        'Status',
        'Session ID',
      ];

      const tableRows = exportRows
        .map(
          (row) =>
            `<tr><td>${row.logId}</td><td>${row.userName}</td><td>${row.email}</td><td>${row.actionType}</td><td>${row.url}</td><td>${row.method}</td><td>${row.timestamp}</td><td>${row.ipAddress}</td><td>${row.device}</td><td>${row.status}</td><td>${row.sessionId}</td></tr>`
        )
        .join('');

      const html = `
        <table>
          <thead>
            <tr>${headers.map((h) => `<th>${h}</th>`).join('')}</tr>
          </thead>
          <tbody>
            ${tableRows}
          </tbody>
        </table>
      `;

      const blob = new Blob([html], { type: 'application/vnd.ms-excel;charset=utf-8;' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `activity-logs-${new Date().toISOString().slice(0, 10)}.xls`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      toast({
        title: 'Success',
        description: 'Activity logs exported as Excel.',
      });
    } catch (error) {
      console.error('Excel export failed:', error);
      toast({
        title: 'Error',
        description: 'Failed to export Excel file.',
        variant: 'destructive',
      });
    }
  };

  const clearFilters = () => {
    setSearchTerm('');
    setActionTypeFilter('all');
    setUrlFilter('');
    setStatusFilter('all');
    setMethodFilter('all');
    setDateFrom('');
    setDateTo('');
    setPage(1);
    setSortBy('timestamp');
    setSortOrder('desc');
  };

  const fromIndex = pagination.total === 0 ? 0 : (pagination.page - 1) * pagination.limit + 1;
  const toIndex = Math.min(pagination.page * pagination.limit, pagination.total);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="pb-4">
          <div className="responsive-toolbar">
            <CardTitle className="text-xl sm:text-2xl font-bold">User Activity Logs</CardTitle>
            <div className="flex w-full md:w-auto flex-wrap items-center gap-2">
              <Button variant="outline" onClick={exportToCSV} className="gap-2">
                <Download className="h-4 w-4" />
                Export CSV
              </Button>
              <Button variant="outline" onClick={exportToExcel} className="gap-2">
                <FileSpreadsheet className="h-4 w-4" />
                Export Excel
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-7 mt-4">
            <div className="relative xl:col-span-2">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                className="pl-10"
                placeholder="Search user/email/session..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <Select value={actionTypeFilter} onValueChange={setActionTypeFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Action" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Actions</SelectItem>
                {actionTypes.map((action) => (
                  <SelectItem key={action} value={action}>
                    {action}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Input
              placeholder="Filter URL"
              value={urlFilter}
              onChange={(e) => setUrlFilter(e.target.value)}
            />

            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                {STATUS_OPTIONS.map((status) => (
                  <SelectItem key={status} value={status}>
                    {status === 'all' ? 'All Status' : status}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={methodFilter} onValueChange={setMethodFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Method" />
              </SelectTrigger>
              <SelectContent>
                {METHOD_OPTIONS.map((method) => (
                  <SelectItem key={method} value={method}>
                    {method === 'all' ? 'All Methods' : method}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Button variant="ghost" onClick={clearFilters}>Reset</Button>
          </div>

          <div className="grid grid-cols-1 gap-3 md:grid-cols-2 mt-3">
            <Input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} />
            <Input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} />
          </div>
        </CardHeader>

        <CardContent>
          <div className="rounded-md border overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Log ID</TableHead>
                  <TableHead>
                    <button type="button" onClick={() => toggleSort('user')} className="inline-flex items-center gap-1 font-medium">
                      User {sortIndicator('user')}
                    </button>
                  </TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>
                    <button type="button" onClick={() => toggleSort('actionType')} className="inline-flex items-center gap-1 font-medium">
                      Action {sortIndicator('actionType')}
                    </button>
                  </TableHead>
                  <TableHead>URL</TableHead>
                  <TableHead>Method</TableHead>
                  <TableHead>
                    <button type="button" onClick={() => toggleSort('timestamp')} className="inline-flex items-center gap-1 font-medium">
                      Timestamp {sortIndicator('timestamp')}
                    </button>
                  </TableHead>
                  <TableHead>IP</TableHead>
                  <TableHead>Device</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Session</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={11} className="py-8 text-center text-muted-foreground">
                      Loading activity logs...
                    </TableCell>
                  </TableRow>
                ) : logs.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={11} className="py-8 text-center text-muted-foreground">
                      No activity logs found.
                    </TableCell>
                  </TableRow>
                ) : (
                  logs.map((log, index) => (
                    <TableRow key={log.logId} className={index % 2 === 0 ? 'bg-muted/20' : ''}>
                      <TableCell className="font-mono text-xs">{log.logId.slice(-8)}</TableCell>
                      <TableCell>{log.userName || '-'}</TableCell>
                      <TableCell>{log.email || '-'}</TableCell>
                      <TableCell>{log.actionType}</TableCell>
                      <TableCell className="max-w-[260px] truncate" title={log.url}>{log.url || '-'}</TableCell>
                      <TableCell>{log.method || '-'}</TableCell>
                      <TableCell>{formatDateTime(log.timestamp)}</TableCell>
                      <TableCell>{log.ipAddress || '-'}</TableCell>
                      <TableCell className="max-w-[220px] truncate" title={log.device || ''}>{log.device || '-'}</TableCell>
                      <TableCell>
                        <Badge variant={getStatusVariant(log.status)}>{log.status}</Badge>
                      </TableCell>
                      <TableCell className="font-mono text-xs">{log.sessionId || '-'}</TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between mt-6 px-3 sm:px-4 py-3 bg-muted/20 rounded-lg">
            <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
              <div className="text-sm text-muted-foreground">
                Showing {fromIndex}-{toIndex} of {pagination.total} logs
              </div>
              <Select
                value={String(pageSize)}
                onValueChange={(value) => {
                  setPageSize(parseInt(value, 10));
                  setPage(1);
                }}
              >
                <SelectTrigger className="w-full sm:w-36">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {PAGE_SIZE_OPTIONS.map((size) => (
                    <SelectItem key={size} value={size}>
                      {size} per page
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="icon"
                onClick={() => setPage(1)}
                disabled={pagination.page <= 1}
              >
                <ChevronsLeft className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage((prev) => Math.max(1, prev - 1))}
                disabled={pagination.page <= 1}
              >
                Prev
              </Button>
              <span className="text-sm min-w-[100px] text-center">
                Page {pagination.page} of {pagination.totalPages || 1}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage((prev) => Math.min(pagination.totalPages || 1, prev + 1))}
                disabled={pagination.page >= (pagination.totalPages || 1)}
              >
                Next
              </Button>
              <Button
                variant="outline"
                size="icon"
                onClick={() => setPage(pagination.totalPages || 1)}
                disabled={pagination.page >= (pagination.totalPages || 1)}
              >
                <ChevronsRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default UserActivityLogs;
