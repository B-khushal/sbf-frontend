import React, { useState, useEffect } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { DollarSign, Banknote, Calendar } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { getVendorPayouts } from '@/services/vendorService';
import { useCurrency } from '@/contexts/CurrencyContext';

interface Payout {
  _id: string;
  payoutDate: string;
  amount: number;
  status: 'Paid' | 'Pending' | 'Failed';
  transactionId?: string;
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

  useEffect(() => {
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

    fetchPayouts();
  }, [toast]);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Paid':
        return <Badge className="bg-green-100 text-green-800">Paid</Badge>;
      case 'Pending':
        return <Badge className="bg-yellow-100 text-yellow-800">Pending</Badge>;
      case 'Failed':
        return <Badge variant="destructive">Failed</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  if (loading) {
    return <div className="p-6">Loading payout information...</div>;
  }
  
  if(!payoutsData){
      return <div className="p-6">No payout information available.</div>;
  }
  
  const { summary, payouts } = payoutsData;

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-3xl font-bold">Payouts</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Paid Out</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
                <p className="text-2xl font-bold">{formatPrice(summary.totalPaid)}</p>
            </CardContent>
        </Card>
        <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Pending Payout</CardTitle>
                <Banknote className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
                <p className="text-2xl font-bold">{formatPrice(summary.pendingPayout)}</p>
            </CardContent>
        </Card>
        <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Next Payout Date</CardTitle>
                <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
                <p className="text-2xl font-bold">{new Date(summary.nextPayoutDate).toLocaleDateString()}</p>
            </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Payout History</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Transaction ID</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
                {payouts.map((payout) => (
                    <TableRow key={payout._id}>
                        <TableCell>{new Date(payout.payoutDate).toLocaleDateString()}</TableCell>
                        <TableCell>{formatPrice(payout.amount)}</TableCell>
                        <TableCell>{getStatusBadge(payout.status)}</TableCell>
                        <TableCell className="font-mono text-xs">{payout.transactionId || 'N/A'}</TableCell>
                    </TableRow>
                ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default VendorPayouts; 