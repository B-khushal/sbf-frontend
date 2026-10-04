import React, { useEffect, useState } from 'react';
import { useParams, useSearchParams, useNavigate } from 'react-router-dom';
import api from '@/services/api';
import { API_URL } from '@/config';
import { Download, CheckCircle2, AlertCircle, RefreshCw, ArrowLeft, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';

export const InvoiceDownloadRedirect: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [errorMessage, setErrorMessage] = useState<string>('');

  const tokenFromQuery = searchParams.get('token');
  const emailFromQuery = searchParams.get('email');
  const phoneFromQuery = searchParams.get('phone');

  const downloadInvoice = async () => {
    if (!id) {
      setStatus('error');
      setErrorMessage('Order ID is missing.');
      return;
    }

    try {
      setStatus('loading');

      // Build params if provided via query
      const params: Record<string, string> = {};
      if (tokenFromQuery) params.token = tokenFromQuery;
      if (emailFromQuery) params.email = emailFromQuery;
      if (phoneFromQuery) params.phone = phoneFromQuery;

      const response = await api.get(`/orders/${id}/invoice`, {
        params,
        responseType: 'blob'
      });

      const blob = new Blob([response.data], { type: 'application/pdf' });
      const blobUrl = window.URL.createObjectURL(blob);

      // Extract filename from header if available
      let filename = `Invoice-${id}.pdf`;
      const disposition = response.headers?.['content-disposition'];
      if (disposition) {
        const match = disposition.match(/filename="?([^";]+)"?/);
        if (match && match[1]) filename = match[1];
      }

      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      setTimeout(() => {
        window.URL.revokeObjectURL(blobUrl);
      }, 10000);

      setStatus('success');
    } catch (err: any) {
      console.error('Invoice download failed:', err);

      // Attempt fallback redirect directly to backend API
      const token = tokenFromQuery || localStorage.getItem('token');
      const directUrl = `${API_URL}/orders/${id}/invoice${token ? `?token=${encodeURIComponent(token)}` : ''}`;

      // If we got 403 or 401, check if opening direct URL helps or show error
      if (err?.response?.status === 403) {
        setStatus('error');
        setErrorMessage('You are not authorized to download this invoice. Please log in with the account that placed the order or provide the billing email/phone.');
      } else {
        // Fallback: try opening backend direct URL
        window.location.href = directUrl;
      }
    }
  };

  useEffect(() => {
    downloadInvoice();
  }, [id]);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white dark:bg-slate-900 rounded-3xl p-8 shadow-xl border border-slate-200 dark:border-slate-800 text-center">
        
        {status === 'loading' && (
          <div className="py-6 space-y-4">
            <div className="w-16 h-16 rounded-2xl bg-primary/10 text-primary mx-auto flex items-center justify-center animate-pulse">
              <FileText className="w-8 h-8" />
            </div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">
              Preparing Your Invoice
            </h2>
            <p className="text-sm text-slate-500">
              Generating high-resolution PDF for order #{id}...
            </p>
            <div className="flex items-center justify-center gap-2 text-xs text-slate-400 pt-2">
              <RefreshCw className="w-4 h-4 animate-spin text-primary" />
              <span>Downloading automatically...</span>
            </div>
          </div>
        )}

        {status === 'success' && (
          <div className="py-6 space-y-4">
            <div className="w-16 h-16 rounded-2xl bg-emerald-100 dark:bg-emerald-950/50 text-emerald-600 mx-auto flex items-center justify-center">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">
              Invoice Downloaded!
            </h2>
            <p className="text-sm text-slate-500">
              Your invoice PDF for order #{id} has been saved to your downloads folder.
            </p>
            <div className="pt-4 flex flex-col gap-2">
              <Button
                variant="outline"
                onClick={downloadInvoice}
                className="w-full rounded-xl"
              >
                <Download className="w-4 h-4 mr-2" /> Download Again
              </Button>
              <Button
                variant="ghost"
                onClick={() => navigate('/admin/orders')}
                className="w-full text-slate-600"
              >
                <ArrowLeft className="w-4 h-4 mr-2" /> Return to Orders
              </Button>
            </div>
          </div>
        )}

        {status === 'error' && (
          <div className="py-6 space-y-4">
            <div className="w-16 h-16 rounded-2xl bg-rose-100 dark:bg-rose-950/50 text-rose-600 mx-auto flex items-center justify-center">
              <AlertCircle className="w-8 h-8" />
            </div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">
              Could Not Download Invoice
            </h2>
            <p className="text-sm text-slate-500">
              {errorMessage || 'There was an issue retrieving the invoice for this order.'}
            </p>
            <div className="pt-4 flex flex-col gap-2">
              <Button
                onClick={downloadInvoice}
                className="w-full rounded-xl"
              >
                <RefreshCw className="w-4 h-4 mr-2" /> Try Again
              </Button>
              <Button
                variant="ghost"
                onClick={() => navigate('/admin/orders')}
                className="w-full text-slate-600"
              >
                <ArrowLeft className="w-4 h-4 mr-2" /> Back to Admin
              </Button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default InvoiceDownloadRedirect;
