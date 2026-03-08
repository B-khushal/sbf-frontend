import React, { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { PlusCircle, Edit, Trash2, MoreHorizontal, Search, RefreshCw, ChevronLeft, ChevronRight } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { getVendorProducts, deleteVendorProduct } from '@/services/vendorService';
import { getImageUrl } from '@/config';
import { Input } from '@/components/ui/input';
import { useNavigate } from 'react-router-dom';
import { useCurrency } from '@/contexts/CurrencyContext';

interface Product {
  _id: string;
  title: string;
  images: string[];
  price: number;
  countInStock: number;
  stock: number;
  category: string;
  status: 'active' | 'archived' | 'draft';
  isFeatured: boolean;
  approvalStatus?: 'pending' | 'approved' | 'rejected';
  rejectionReason?: string;
}

const ITEMS_PER_PAGE = 10;

const VendorProducts: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalProducts, setTotalProducts] = useState(0);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [productToDelete, setProductToDelete] = useState<Product | null>(null);
  const [deleting, setDeleting] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();
  const { formatPrice, convertPrice } = useCurrency();

  const fetchProducts = useCallback(async (page = currentPage) => {
    try {
      setLoading(true);
      const params: any = { page, limit: ITEMS_PER_PAGE };
      if (searchTerm) params.search = searchTerm;
      if (categoryFilter !== 'all') params.category = categoryFilter;
      if (statusFilter !== 'all') params.status = statusFilter;

      const data = await getVendorProducts(params);
      setProducts(data.products || []);
      setTotalPages(data.totalPages || Math.ceil((data.total || data.products?.length || 0) / ITEMS_PER_PAGE));
      setTotalProducts(data.total || data.products?.length || 0);
      setCurrentPage(page);
    } catch (error) {
      toast({
        title: 'Error fetching products',
        description: 'Could not load your products. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  }, [searchTerm, categoryFilter, statusFilter, currentPage, toast]);

  useEffect(() => {
    fetchProducts(1);
  }, [categoryFilter, statusFilter]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchProducts(1);
  };

  const handleAddProduct = () => {
    navigate('/vendor/products/new');
  };

  const handleEditProduct = (productId: string) => {
    navigate(`/vendor/products/edit/${productId}`);
  };

  const handleDeleteClick = (product: Product) => {
    setProductToDelete(product);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!productToDelete) return;
    try {
      setDeleting(true);
      await deleteVendorProduct(productToDelete._id);
      toast({
        title: 'Product Deleted',
        description: `"${productToDelete.title}" has been deleted successfully.`,
      });
      setDeleteDialogOpen(false);
      setProductToDelete(null);
      fetchProducts(currentPage);
    } catch (error: any) {
      toast({
        title: 'Delete Failed',
        description: error?.message || 'Could not delete the product. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setDeleting(false);
    }
  };

  const getStatusVariant = (status: string): "default" | "secondary" | "outline" | "destructive" => {
    switch (status) {
      case 'active': return 'default';
      case 'archived': return 'secondary';
      case 'draft': return 'outline';
      default: return 'secondary';
    }
  };

  const getApprovalVariant = (status?: string): "default" | "secondary" | "destructive" => {
    switch (status) {
      case 'approved': return 'default';
      case 'rejected': return 'destructive';
      default: return 'secondary';
    }
  };

  return (
    <div className="space-y-6">
      <div className="responsive-toolbar">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold">My Products</h1>
          <p className="text-gray-500 mt-1">{totalProducts} product{totalProducts !== 1 ? 's' : ''} total</p>
        </div>
        <Button onClick={handleAddProduct}>
          <PlusCircle className="mr-2 h-4 w-4" />
          Add Product
        </Button>
      </div>

      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4">
        <form onSubmit={handleSearch} className="flex-1 flex gap-2">
          <Input
            placeholder="Search products..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <Button type="submit" variant="outline" size="icon">
            <Search className="h-4 w-4" />
          </Button>
        </form>
        <Select value={statusFilter} onValueChange={(val) => { setStatusFilter(val); setCurrentPage(1); }}>
          <SelectTrigger className="w-full sm:w-[150px]">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="draft">Draft</SelectItem>
            <SelectItem value="archived">Archived</SelectItem>
          </SelectContent>
        </Select>
        <Button variant="ghost" size="icon" onClick={() => fetchProducts(currentPage)} className="touch-action-btn self-end sm:self-auto">
          <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
        </Button>
      </div>

      <div className="responsive-table-wrap">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[80px]">Image</TableHead>
              <TableHead>Title</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Approval</TableHead>
              <TableHead>Stock</TableHead>
              <TableHead>Price</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center h-24">
                  <div className="flex items-center justify-center gap-2">
                    <RefreshCw className="h-5 w-5 animate-spin text-primary" />
                    Loading products...
                  </div>
                </TableCell>
              </TableRow>
            ) : products.length > 0 ? (
              products.map((product) => (
                <TableRow key={product._id} className="hover:bg-gray-50">
                  <TableCell>
                    <img
                      src={getImageUrl(product.images?.[0])}
                      alt={product.title}
                      className="h-12 w-12 object-cover rounded-md"
                    />
                  </TableCell>
                  <TableCell className="font-medium max-w-[200px] truncate">{product.title}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className="capitalize">{product.category}</Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant={getStatusVariant(product.status)}>
                      {product.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant={getApprovalVariant(product.approvalStatus)}>
                      {product.approvalStatus || 'pending'}
                    </Badge>
                    {product.approvalStatus === 'rejected' && product.rejectionReason && (
                      <p className="text-xs text-red-500 mt-1 max-w-[120px] truncate" title={product.rejectionReason}>
                        {product.rejectionReason}
                      </p>
                    )}
                  </TableCell>
                  <TableCell>
                    <span className={`font-medium ${(product.countInStock ?? product.stock) <= 5 ? 'text-red-600' : 'text-gray-900'}`}>
                      {product.countInStock ?? product.stock}
                    </span>
                  </TableCell>
                  <TableCell>{formatPrice(convertPrice(product.price))}</TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="touch-action-btn p-0">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleEditProduct(product._id)}>
                          <Edit className="mr-2 h-4 w-4" />
                          <span>Edit</span>
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          className="text-red-600 focus:text-red-600"
                          onClick={() => handleDeleteClick(product)}
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          <span>Delete</span>
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={8} className="text-center h-24">
                  <div className="flex flex-col items-center justify-center gap-2 py-4">
                    <p className="text-gray-500">No products found.</p>
                    <Button variant="outline" size="sm" onClick={handleAddProduct}>
                      <PlusCircle className="mr-2 h-4 w-4" />
                      Add Your First Product
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between px-2">
          <p className="text-sm text-gray-500">
            Page {currentPage} of {totalPages}
          </p>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => fetchProducts(currentPage - 1)}
              disabled={currentPage <= 1 || loading}
            >
              <ChevronLeft className="h-4 w-4 mr-1" />
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => fetchProducts(currentPage + 1)}
              disabled={currentPage >= totalPages || loading}
            >
              Next
              <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          </div>
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Product</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete <strong>"{productToDelete?.title}"</strong>? This action cannot be undone
              and will permanently remove the product from your store.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              disabled={deleting}
              className="bg-red-600 hover:bg-red-700 focus:ring-red-600"
            >
              {deleting ? 'Deleting...' : 'Delete Product'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default VendorProducts;
