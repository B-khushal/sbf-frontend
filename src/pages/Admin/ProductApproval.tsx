import { PageHeader } from '@/components/dashboard/PageHeader';
import { SoftButton } from '@/components/dashboard/SoftButton';
import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { CheckCircle, XCircle, AlertTriangle, RefreshCw, Eye } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useCurrency } from "@/contexts/CurrencyContext";
import api from "@/services/api";
import { useNavigate } from "react-router-dom";
import { getImageUrl } from "@/config";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";

interface PendingProduct {
  _id: string;
  title: string;
  description: string;
  price: number;
  images: string[];
  category: string;
  countInStock: number;
  approvalStatus: string;
  vendor: {
    _id: string;
    storeName: string;
  };
  user: {
    name: string;
    email: string;
  };
  createdAt: string;
  updatedAt: string;
}

const ProductApproval: React.FC = () => {
  const [products, setProducts] = useState<PendingProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedProduct, setSelectedProduct] = useState<PendingProduct | null>(null);
  const [showRejectDialog, setShowRejectDialog] = useState(false);
  const [rejectionReason, setRejectionReason] = useState("");
  const [actionLoading, setActionLoading] = useState(false);
  
  const { toast } = useToast();
  const { formatPrice } = useCurrency();
  const navigate = useNavigate();

  useEffect(() => {
    fetchPendingProducts();
  }, []);

  const fetchPendingProducts = async () => {
    try {
      setLoading(true);
      const { data } = await api.get("/products/admin/pending-approval");
      setProducts(data.products || []);
    } catch (error) {
      console.error("Error fetching pending products:", error);
      toast({
        title: "Error",
        description: "Failed to fetch pending products",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (productId: string) => {
    try {
      setActionLoading(true);
      await api.put(`/products/admin/${productId}/approve`);
      
      toast({
        title: "Success",
        description: "Product approved successfully",
      });
      
      fetchPendingProducts();
    } catch (error) {
      console.error("Error approving product:", error);
      toast({
        title: "Error",
        description: "Failed to approve product",
        variant: "destructive",
      });
    } finally {
      setActionLoading(false);
    }
  };

  const handleReject = async () => {
    if (!selectedProduct || !rejectionReason.trim()) {
      toast({
        title: "Error",
        description: "Please provide a reason for rejection",
        variant: "destructive",
      });
      return;
    }
    
    try {
      setActionLoading(true);
      await api.put(`/products/admin/${selectedProduct._id}/reject`, {
        reason: rejectionReason,
      });
      
      toast({
        title: "Success",
        description: "Product rejected",
      });
      
      setShowRejectDialog(false);
      setSelectedProduct(null);
      setRejectionReason("");
      fetchPendingProducts();
    } catch (error) {
      console.error("Error rejecting product:", error);
      toast({
        title: "Error",
        description: "Failed to reject product",
        variant: "destructive",
      });
    } finally {
      setActionLoading(false);
    }
  };

  const openRejectDialog = (product: PendingProduct) => {
    setSelectedProduct(product);
    setShowRejectDialog(true);
  };

  const viewProduct = (productId: string) => {
    navigate(`/product/${productId}`);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Vendor Catalog Quality & Approvals"
        subtitle="Review, audit, verify ingredient details, and approve marketplace vendor product listings."
        breadcrumbs={[
          { label: 'Admin', href: '/admin' },
          { label: 'Catalog', href: '/admin/products' },
          { label: 'Product Approvals' },
        ]}
        statusBadge={{
          label: `${products.length} Pending Submissions`,
          variant: products.length > 0 ? 'warning' : 'success',
        }}
        actions={
          <SoftButton
            variant="secondary"
            icon={RefreshCw}
            onClick={fetchPendingProducts}
            disabled={loading}
          >
            Refresh Queue
          </SoftButton>
        }
      />

      {products.length === 0 && !loading && (
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            No pending products for approval
          </AlertDescription>
        </Alert>
      )}

      {products.length > 0 && (
        <Card className="rounded-2xl border-0 shadow-[8px_8px_24px_rgba(166,180,200,0.45),-8px_-8px_24px_rgba(255,255,255,0.95)] bg-white">
          <CardHeader>
            <CardTitle>Pending Products ({products.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="responsive-table-wrap">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Image</TableHead>
                    <TableHead>Product</TableHead>
                    <TableHead>Vendor</TableHead>
                    <TableHead>Price</TableHead>
                    <TableHead>Stock</TableHead>
                    <TableHead>Submitted</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center h-24">
                        Loading...
                      </TableCell>
                    </TableRow>
                  ) : (
                    products.map((product) => (
                      <TableRow key={product._id}>
                        <TableCell>
                          <img
                            src={getImageUrl(product.images?.[0])}
                            alt={product.title}
                            className="h-16 w-16 object-cover rounded-md"
                          />
                        </TableCell>
                        <TableCell>
                          <div>
                            <div className="font-medium">{product.title}</div>
                            <div className="text-sm text-muted-foreground">
                              {product.category}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div>
                            <div className="font-medium">{product.vendor?.storeName || 'N/A'}</div>
                            <div className="text-sm text-muted-foreground">
                              {product.user?.email}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>₹{Number(product.price || 0).toFixed(2)}</TableCell>
                        <TableCell>
                          <Badge variant={product.countInStock > 10 ? "default" : "destructive"}>
                            {product.countInStock}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {new Date(product.createdAt).toLocaleDateString()}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex flex-wrap justify-end gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => viewProduct(product._id)}
                              className="touch-action-btn"
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="default"
                              onClick={() => handleApprove(product._id)}
                              disabled={actionLoading}
                              className="touch-action-btn"
                            >
                              <CheckCircle className="h-4 w-4 mr-1" />
                              Approve
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => openRejectDialog(product)}
                              disabled={actionLoading}
                              className="touch-action-btn"
                            >
                              <XCircle className="h-4 w-4 mr-1" />
                              Reject
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Reject Dialog */}
      <Dialog open={showRejectDialog} onOpenChange={setShowRejectDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject Product</DialogTitle>
            <DialogDescription>
              Please provide a reason for rejecting "{selectedProduct?.title}".
              This will be sent to the vendor.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <Textarea
              placeholder="Enter rejection reason..."
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              rows={4}
            />
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setShowRejectDialog(false);
                setRejectionReason("");
                setSelectedProduct(null);
              }}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleReject}
              disabled={actionLoading || !rejectionReason.trim()}
            >
              Reject Product
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ProductApproval;
