import React, { useState, useEffect } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { DollarSign, Banknote, Calendar, RefreshCw, TrendingUp, Clock, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { getVendorPayouts } from '@/services/vendorService';
import { useCurrency } from '@/contexts/CurrencyContext';

interface Payout {
  _id: string;
  payoutDate: string;
  amount: number;
  status: 'paid' | 'pending' | 'processing' | 'failed';
  transactionId?: string;
  method?: string;
}

interface PayoutsData {
    payouts: Payout[];
    summary: {
        totalEarned: number;
        totalPaid: number;
        pendingPayout: number;
        nextPayoutDate: string;
    }
}

const VendorPayouts: React.FC = () => {
  const [payoutsData, setPayoutsData] = useState<PayoutsData | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const { formatPrice } = useCurrency();

  const fetchPayouts = async () => {
    try {
      setLoading(true);
      const data = await getVendorPayouts();
      setPayoutsData(data);
    } catch (error) {
      toast({
        title: 'Error fetching payouts',
        description: 'Could not load your payout information.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPayouts();
  }, []);

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      paid: { 
        label: 'Paid', 
        className: 'bg-green-100 text-green-800 hover:bg-green-200',
        icon: CheckCircle 
      },
      pending: { 
        label: 'Pending', 
        className: 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200',
        icon: Clock 
      },
      processing: { 
        label: 'Processing', 
        className: 'bg-blue-100 text-blue-800 hover:bg-blue-200',
        icon: RefreshCw 
      },
      failed: { 
        label: 'Failed', 
        className: 'bg-red-100 text-red-800 hover:bg-red-200',
        icon: XCircle 
      },
    };

    const config = statusConfig[status as keyof typeof statusConfig] || { 
      label: status, 
      className: 'bg-gray-100 text-gray-800',
      icon: AlertCircle 
    };
    
    const Icon = config.icon;

    return (
      <Badge className={config.className}>
        <Icon className="h-3 w-3 mr-1" />
        {config.label}
      </Badge>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-4">
          <RefreshCw className="h-8 w-8 animate-spin text-primary" />
          <p className="text-gray-600">Loading payout information...</p>
        </div>
      </div>
    );
  }
  
  if(!payoutsData){
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <DollarSign className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-600">No payout information available.</p>
        </div>
      </div>
    );
  }
  
  const { summary, payouts } = payoutsData;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Payouts</h1>
          <p className="text-gray-500 mt-1">Track your earnings and payment history</p>
        </div>
        <Button variant="outline" size="sm" onClick={fetchPayouts} disabled={loading}>
          <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Earned</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatPrice(summary.totalEarned)}</div>
            <p className="text-xs text-muted-foreground mt-1">
              lifetime earnings
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Paid</CardTitle>
            <CheckCircle className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatPrice(summary.totalPaid)}</div>
            <p className="text-xs text-muted-foreground mt-1">
              successfully transferred
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Payout</CardTitle>
            <Banknote className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatPrice(summary.pendingPayout)}</div>
            <p className="text-xs text-muted-foreground mt-1">
              awaiting transfer
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Next Payout</CardTitle>
            <Calendar className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {new Date(summary.nextPayoutDate).toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric'
              })}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              scheduled date
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Payout History */}
      <Card>
        <CardHeader>
          <CardTitle>Payout History</CardTitle>
          <CardDescription>View all your past and pending payouts</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <div className="responsive-table-wrap rounded-none border-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Method</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Transaction ID</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {payouts && payouts.length > 0 ? (
                  payouts.map((payout) => (
                    <TableRow key={payout._id} className="hover:bg-gray-50">
                      <TableCell className="font-medium">
                        {new Date(payout.payoutDate).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric'
                        })}
                      </TableCell>
                      <TableCell className="font-semibold">
                        {formatPrice(payout.amount)}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{payout.method || 'Bank Transfer'}</Badge>
                      </TableCell>
                      <TableCell>{getStatusBadge(payout.status)}</TableCell>
                      <TableCell className="font-mono text-xs text-gray-600">
                        {payout.transactionId || 'N/A'}
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={5} className="h-32 text-center text-gray-500">
                      <div className="flex flex-col items-center justify-center">
                        <DollarSign className="h-12 w-12 text-gray-300 mb-2" />
                        <p>No payout history yet</p>
                        <p className="text-sm">Your payout history will appear here</p>
                      </div>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Info Card */}
      <Card className="bg-blue-50 border-blue-200">
        <CardContent className="pt-6">
          <div className="flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-blue-600 mt-0.5" />
            <div>
              <h4 className="font-semibold text-blue-900 mb-1">Payment Information</h4>
              <p className="text-sm text-blue-800">
                Payouts are processed automatically on a bi-weekly schedule. Pending amounts will be transferred to your registered bank account. 
                Ensure your banking details are up to date in your settings.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default VendorPayouts; 
