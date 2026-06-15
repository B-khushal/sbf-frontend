import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Edit, Trash2, Eye, EyeOff, AlertTriangle, Package, Search, Filter, X, Heart } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useCurrency } from "@/contexts/CurrencyContext";
import api from "@/services/api";
import { useNavigate } from "react-router-dom";
import productService, { ProductData } from "@/services/productService";
import { getImageUrl } from "@/config";

type Product = ProductData & {
  _id: string;
  hidden?: boolean;
};

const VALENTINE_CATEGORIES = [
  "Rose Day Specials",
  "Propose Day Specials",
  "Chocolate Day Specials",
  "Teddy Day Specials",
  "Promise Day Specials",
  "Hug Day Specials",
  "Valentine's Day Specials",
  "Celebration Day Specials",
  "Premium Rose Bouquets",
  "Luxury Flower Boxes",
  "Romantic Gift Hampers",
  "Chocolates & Flowers",
  "Teddy Combos",
  "Proposal Packages",
  "Couple Gift Combos",
  "Same Day Surprise Gifts",
  "Midnight Delivery Gifts"
];

const VALENTINE_DATES = [
  { value: "rose-day", label: "8 Feb – Rose Day" },
  { value: "propose-day", label: "9 Feb – Propose Day" },
  { value: "chocolate-day", label: "10 Feb – Chocolate Day" },
  { value: "teddy-day", label: "11 Feb – Teddy Day" },
  { value: "promise-day", label: "12 Feb – Promise Day" },
  { value: "hug-day", label: "13 Feb – Hug Day" },
  { value: "valentines-day", label: "14 Feb – Valentine's Day" },
  { value: "celebration-day", label: "15 Feb – Celebration Day" }
];

const AdminProducts: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [lowStockProducts, setLowStockProducts] = useState<Product[]>([]);
  const [showLowStockAlert, setShowLowStockAlert] = useState(false);
  const [categories, setCategories] = useState<string[]>([]);
  
  // Filter states
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [stockFilter, setStockFilter] = useState("all");
  const [featuredFilter, setFeaturedFilter] = useState("all");
  const [newFilter, setNewFilter] = useState("all");
  const [visibilityFilter, setVisibilityFilter] = useState("all");

  // Valentine's Selection and Dialog states
  const [selectedProductIds, setSelectedProductIds] = useState<string[]>([]);
  const [showCategoryDialog, setShowCategoryDialog] = useState(false);
  const [showDateDialog, setShowDateDialog] = useState(false);
  const [bulkCategories, setBulkCategories] = useState<string[]>([]);
  const [bulkDates, setBulkDates] = useState<string[]>([]);

  const toggleSelectProduct = (productId: string) => {
    setSelectedProductIds(prev =>
      prev.includes(productId) ? prev.filter(id => id !== productId) : [...prev, productId]
    );
  };

  const toggleSelectAll = () => {
    if (selectedProductIds.length === filteredProducts.length) {
      setSelectedProductIds([]);
    } else {
      setSelectedProductIds(filteredProducts.map(p => p._id));
    }
  };

  const handleBulkAction = async (action: string, value?: any) => {
    try {
      await productService.bulkUpdateValentineSettings(selectedProductIds, action, value);
      toast({
        title: "Success",
        description: "Bulk action applied successfully",
      });
      // Clear selection and dialogs
      setSelectedProductIds([]);
      setShowCategoryDialog(false);
      setShowDateDialog(false);
      setBulkCategories([]);
      setBulkDates([]);
      // Reload products list
      fetchProducts();
    } catch (error) {
      console.error("Error applying bulk action:", error);
      toast({
        title: "Error",
        description: "Failed to apply bulk action",
        variant: "destructive",
      });
    }
  };
  
  const { toast } = useToast();
  const { formatPrice, convertPrice } = useCurrency();
  const navigate = useNavigate();

  useEffect(() => {
    fetchProducts();
    fetchLowStockProducts();
    fetchCategories();
  }, []);

  // Apply filters whenever filter states change
  useEffect(() => {
    applyFilters();
  }, [products, searchTerm, selectedCategory, stockFilter, featuredFilter, newFilter, visibilityFilter]);

  const fetchProducts = async () => {
    try {
      const { data } = await api.get("/products/admin/list");
      const normalizedProducts = (data.products || []).map((product: any) => ({
        ...product,
        // Support both backend keys
        isNew: typeof product.isNew === 'boolean'
          ? product.isNew
          : Boolean(product.isNewArrival),
      }));
      setProducts(normalizedProducts);
    } catch (error) {
      console.error("Error fetching products:", error);
      toast({
        title: "Error",
        description: "Failed to fetch products",
        variant: "destructive",
      });
    }
  };

  const fetchLowStockProducts = async () => {
    try {
      const { data } = await api.get("/products/admin/low-stock?threshold=10");
      setLowStockProducts(data.products);
      setShowLowStockAlert(data.count > 0);
    } catch (error) {
      console.error("Error fetching low stock products:", error);
    }
  };

  const fetchCategories = async () => {
    try {
      const { data } = await api.get("/products/categories");
      if (data.categories && Array.isArray(data.categories)) {
        setCategories(data.categories);
      } else {
        // Fallback: extract unique categories from products
        const uniqueCategories = Array.from(
          new Set(products.map(product => product.category).filter(Boolean))
        );
        setCategories(uniqueCategories);
      }
    } catch (error) {
      console.error("Error fetching categories:", error);
      // Extract unique categories from products as fallback
      const uniqueCategories = Array.from(
        new Set(products.map(product => product.category).filter(Boolean))
      );
      setCategories(uniqueCategories);
    }
  };

  const applyFilters = () => {
    let filtered = [...products];

    // Search filter - include both primary category and additional categories
    if (searchTerm) {
      filtered = filtered.filter(product => {
        const titleMatch = product.title.toLowerCase().includes(searchTerm.toLowerCase());
        const primaryCategoryMatch = product.category?.toLowerCase().includes(searchTerm.toLowerCase());
        const additionalCategoriesMatch = product.categories?.some(cat => 
          cat.toLowerCase().includes(searchTerm.toLowerCase())
        );
        return titleMatch || primaryCategoryMatch || additionalCategoriesMatch;
      });
    }

    // Category filter - check both primary category and additional categories
    if (selectedCategory !== "all") {
      filtered = filtered.filter(product => {
        const primaryMatch = product.category?.toLowerCase() === selectedCategory.toLowerCase();
        const additionalMatch = product.categories?.some(cat => 
          cat.toLowerCase() === selectedCategory.toLowerCase()
        );
        return primaryMatch || additionalMatch;
      });
    }

    // Stock filter
    if (stockFilter !== "all") {
      switch (stockFilter) {
        case "in-stock":
          filtered = filtered.filter(product => product.countInStock > 10);
          break;
        case "low-stock":
          filtered = filtered.filter(product => product.countInStock > 0 && product.countInStock <= 10);
          break;
        case "out-of-stock":
          filtered = filtered.filter(product => product.countInStock === 0);
          break;
        case "critical":
          filtered = filtered.filter(product => product.countInStock > 0 && product.countInStock <= 5);
          break;
      }
    }

    // Featured filter
    if (featuredFilter !== "all") {
      filtered = filtered.filter(product => 
        featuredFilter === "featured" ? product.isFeatured : !product.isFeatured
      );
    }

    // New filter
    if (newFilter !== "all") {
      filtered = filtered.filter(product => 
        newFilter === "new" ? product.isNew : !product.isNew
      );
    }

    // Visibility filter
    if (visibilityFilter !== "all") {
      filtered = filtered.filter(product => 
        visibilityFilter === "visible" ? !product.hidden : product.hidden
      );
    }

    setFilteredProducts(filtered);
  };

  const clearAllFilters = () => {
    setSearchTerm("");
    setSelectedCategory("all");
    setStockFilter("all");
    setFeaturedFilter("all");
    setNewFilter("all");
    setVisibilityFilter("all");
  };

  const getActiveFiltersCount = () => {
    let count = 0;
    if (searchTerm) count++;
    if (selectedCategory !== "all") count++;
    if (stockFilter !== "all") count++;
    if (featuredFilter !== "all") count++;
    if (newFilter !== "all") count++;
    if (visibilityFilter !== "all") count++;
    return count;
  };

  const getStockBadge = (stock: number) => {
    if (stock === 0) {
      return <Badge variant="destructive">Out of Stock</Badge>;
    } else if (stock <= 5) {
      return <Badge variant="destructive">Critical: {stock}</Badge>;
    } else if (stock <= 10) {
      return <Badge variant="outline" className="border-yellow-500 text-yellow-600">Low: {stock}</Badge>;
    } else {
      return <Badge variant="secondary" className="bg-green-100 text-green-800">{stock}</Badge>;
    }
  };

  const toggleProductVisibility = async (productId: string) => {
    try {
      const { data } = await api.put(`/products/admin/${productId}/toggle-visibility`);
      
      // Update local state
      setProducts(products.map(product => 
        product._id === productId 
          ? { ...product, hidden: data.product.hidden }
          : product
      ));

      toast({
        title: "Success",
        description: data.message,
      });
    } catch (error) {
      console.error("Error toggling product visibility:", error);
      toast({
        title: "Error",
        description: "Failed to toggle product visibility",
        variant: "destructive",
      });
    }
  };

  const toggleProductNewStatus = async (productId: string) => {
    const currentProduct = products.find((product) => product._id === productId);
    if (!currentProduct) return;

    const nextIsNew = !Boolean(currentProduct.isNew);

    try {
      const updatePayload = {
        title: currentProduct.title,
        description: currentProduct.description,
        price: currentProduct.price,
        discount: currentProduct.discount || 0,
        category: currentProduct.category,
        categories: currentProduct.categories || [],
        countInStock: currentProduct.countInStock,
        images: currentProduct.images || [],
        details: currentProduct.details || [],
        careInstructions: currentProduct.careInstructions || [],
        isFeatured: Boolean(currentProduct.isFeatured),
        hidden: Boolean(currentProduct.hidden),
        isCustomizable: Boolean(currentProduct.isCustomizable),
        customizationOptions: currentProduct.customizationOptions || {},
        hasPriceVariants: Boolean(currentProduct.hasPriceVariants),
        priceVariants: currentProduct.priceVariants || [],
        comboItems: currentProduct.comboItems || [],
        comboName: currentProduct.comboName || '',
        comboDescription: currentProduct.comboDescription || '',
        comboSubcategory: currentProduct.comboSubcategory || '',
        // Send both fields for compatibility across backend versions.
        isNew: nextIsNew,
        isNewArrival: nextIsNew,
      };

      await api.put(`/products/${productId}`, updatePayload);

      setProducts(prev => prev.map(product =>
        product._id === productId
          ? { ...product, isNew: nextIsNew }
          : product
      ));

      // Sync with backend response source to avoid stale UI state.
      await fetchProducts();

      toast({
        title: "Success",
        description: `Product marked as ${nextIsNew ? "new" : "regular"}`,
      });
    } catch (error: any) {
      console.error("Error toggling new status:", error);
      toast({
        title: "Error",
        description: "Failed to toggle new status",
        variant: "destructive",
      });
    }
  };

  const toggleProductSameDayStatus = async (productId: string) => {
    const currentProduct = products.find((product) => product._id === productId);
    if (!currentProduct) return;

    const nextSameDay = currentProduct.sameDay === false;

    try {
      const updatePayload = {
        title: currentProduct.title,
        description: currentProduct.description,
        price: currentProduct.price,
        discount: currentProduct.discount || 0,
        category: currentProduct.category,
        categories: currentProduct.categories || [],
        countInStock: currentProduct.countInStock,
        images: currentProduct.images || [],
        details: currentProduct.details || [],
        careInstructions: currentProduct.careInstructions || [],
        isFeatured: Boolean(currentProduct.isFeatured),
        hidden: Boolean(currentProduct.hidden),
        isCustomizable: Boolean(currentProduct.isCustomizable),
        customizationOptions: currentProduct.customizationOptions || {},
        hasPriceVariants: Boolean(currentProduct.hasPriceVariants),
        priceVariants: currentProduct.priceVariants || [],
        comboItems: currentProduct.comboItems || [],
        comboName: currentProduct.comboName || '',
        comboDescription: currentProduct.comboDescription || '',
        comboSubcategory: currentProduct.comboSubcategory || '',
        isNew: Boolean(currentProduct.isNew),
        isNewArrival: Boolean(currentProduct.isNewArrival),
        sameDay: nextSameDay,
      };

      await api.put(`/products/${productId}`, updatePayload);

      setProducts(prev => prev.map(product =>
        product._id === productId
          ? { ...product, sameDay: nextSameDay }
          : product
      ));

      await fetchProducts();

      toast({
        title: "Success",
        description: `Product same-day delivery ${nextSameDay ? "enabled" : "disabled"}`,
      });
    } catch (error: any) {
      console.error("Error toggling same day status:", error);
      toast({
        title: "Error",
        description: "Failed to toggle same day status",
        variant: "destructive",
      });
    }
  };

  const handleDeleteProduct = async (id: string) => {
    try {
      await api.delete(`/products/${id}`);
      setProducts(products.filter((p) => p._id !== id));
      toast({ 
        title: "Success", 
        description: "Product deleted successfully" 
      });
    } catch (error) {
      console.error("Error deleting product:", error);
      toast({
        title: "Error",
        description: "Failed to delete product",
        variant: "destructive",
      });
    }
  };

  const getComboMaxPrice = (product: Product) => {
    if (product.category !== 'combos' || !product.comboItems) return product.price;
    let total = product.price;
    product.comboItems.forEach(item => {
      if (item.customizationOptions && item.customizationOptions.allowVariants && item.customizationOptions.variants && item.customizationOptions.variants.length > 0) {
        // Use the max variant price
        const maxVariant = item.customizationOptions.variants.reduce((max, v) => v.price > max ? v.price : max, 0);
        total += maxVariant;
      } else {
        total += item.price;
      }
    });
    return total;
  };

  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement>) => {
    const target = e.target as HTMLImageElement;
    if (product.images && product.images.length > 0) {
      target.src = `https://www.sbflorist.in${product.images[0]}`;
    } else {
      target.src = `https://www.sbflorist.in/uploads/${product.images[0]}`;
    }
  };

  return (
    <div className="space-y-6">
      <div className="responsive-toolbar">
        <h1 className="text-2xl sm:text-3xl font-bold">Products Management</h1>
        <Button onClick={() => navigate('/admin/products/new')}>
          <Plus className="mr-2 h-4 w-4" />
          Add New Product
        </Button>
      </div>

      {/* Bulk actions bar */}
      {selectedProductIds.length > 0 && (
        <Card className="border-pink-200 bg-pink-50/50 shadow-sm">
          <CardContent className="py-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="text-sm text-pink-800 font-medium">
              Selected <span className="font-bold text-pink-900">{selectedProductIds.length}</span> {selectedProductIds.length === 1 ? 'product' : 'products'} for bulk updates
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <Button size="sm" variant="outline" className="border-pink-200 bg-white hover:bg-pink-100 text-pink-700 hover:text-pink-800" onClick={() => handleBulkAction('addToShop')}>
                Add to Valentine Shop
              </Button>
              <Button size="sm" variant="outline" className="border-pink-200 bg-white hover:bg-pink-100 text-pink-700 hover:text-pink-800" onClick={() => handleBulkAction('removeFromShop')}>
                Remove from Shop
              </Button>
              <Button size="sm" variant="outline" className="border-pink-200 bg-white hover:bg-pink-100 text-pink-700 hover:text-pink-800" onClick={() => setShowCategoryDialog(true)}>
                Assign Categories
              </Button>
              <Button size="sm" variant="outline" className="border-pink-200 bg-white hover:bg-pink-100 text-pink-700 hover:text-pink-800" onClick={() => setShowDateDialog(true)}>
                Assign Dates
              </Button>
              <Button size="sm" variant="outline" className="border-pink-200 bg-white hover:bg-pink-100 text-pink-700 hover:text-pink-800" onClick={() => handleBulkAction('enableOffers')}>
                Enable Pricing/Offers
              </Button>
              <Button size="sm" variant="destructive" onClick={() => handleBulkAction('disableProducts')}>
                Disable Valentine Status
              </Button>
              <Button size="sm" variant="ghost" className="text-gray-500 hover:text-gray-700" onClick={() => setSelectedProductIds([])}>
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Categories Assignment Modal */}
      {showCategoryDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/55 backdrop-blur-sm p-4">
          <Card className="w-full max-w-lg border-2 border-pink-200 shadow-2xl">
            <CardHeader className="bg-pink-50/50 border-b border-pink-100">
              <CardTitle className="text-pink-800 flex items-center gap-2">❤️ Bulk Assign Valentine Categories</CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              <p className="text-sm text-gray-600">Select Valentine's categories to apply to all {selectedProductIds.length} selected products:</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-[300px] overflow-y-auto p-2 border border-pink-100 rounded-lg">
                {VALENTINE_CATEGORIES.map((category) => {
                  const isChecked = bulkCategories.includes(category);
                  return (
                    <div key={category} className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id={`bulk-cat-${category}`}
                        checked={isChecked}
                        onChange={() => {
                          setBulkCategories(prev =>
                            prev.includes(category) ? prev.filter(c => c !== category) : [...prev, category]
                          );
                        }}
                        className="h-4 w-4 rounded border-gray-300 text-pink-600 focus:ring-pink-500"
                      />
                      <label htmlFor={`bulk-cat-${category}`} className="text-sm text-gray-700 cursor-pointer">{category}</label>
                    </div>
                  );
                })}
              </div>
              <div className="flex justify-end gap-2 border-t pt-4">
                <Button variant="outline" onClick={() => { setShowCategoryDialog(false); setBulkCategories([]); }}>
                  Cancel
                </Button>
                <Button className="bg-pink-600 hover:bg-pink-700" onClick={() => handleBulkAction('assignCategories', bulkCategories)}>
                  Apply Categories
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Dates Assignment Modal */}
      {showDateDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/55 backdrop-blur-sm p-4">
          <Card className="w-full max-w-lg border-2 border-pink-200 shadow-2xl">
            <CardHeader className="bg-pink-50/50 border-b border-pink-100">
              <CardTitle className="text-pink-800 flex items-center gap-2">❤️ Bulk Assign Valentine Dates</CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              <p className="text-sm text-gray-600">Select delivery dates to make available for all {selectedProductIds.length} selected products:</p>
              <div className="space-y-2 max-h-[300px] overflow-y-auto p-2 border border-pink-100 rounded-lg">
                {VALENTINE_DATES.map((dateObj) => {
                  const isChecked = bulkDates.includes(dateObj.value);
                  return (
                    <div key={dateObj.value} className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id={`bulk-date-${dateObj.value}`}
                        checked={isChecked}
                        onChange={() => {
                          setBulkDates(prev =>
                            prev.includes(dateObj.value) ? prev.filter(d => d !== dateObj.value) : [...prev, dateObj.value]
                          );
                        }}
                        className="h-4 w-4 rounded border-gray-300 text-pink-600 focus:ring-pink-500"
                      />
                      <label htmlFor={`bulk-date-${dateObj.value}`} className="text-sm text-gray-700 cursor-pointer">{dateObj.label}</label>
                    </div>
                  );
                })}
              </div>
              <div className="flex justify-end gap-2 border-t pt-4">
                <Button variant="outline" onClick={() => { setShowDateDialog(false); setBulkDates([]); }}>
                  Cancel
                </Button>
                <Button className="bg-pink-600 hover:bg-pink-700" onClick={() => handleBulkAction('assignDates', bulkDates)}>
                  Apply Dates
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Low Stock Alert */}
      {showLowStockAlert && (
        <Alert className="mb-6 border-yellow-500 bg-yellow-50">
          <AlertTriangle className="h-4 w-4 text-yellow-600" />
          <AlertDescription className="text-yellow-800">
            <div className="flex items-center justify-between">
              <span>
                <strong>{lowStockProducts.length} products</strong> have low stock levels and need restocking.
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  const lowStockIds = lowStockProducts.map(p => p._id);
                  const lowStockRows = document.querySelectorAll(`[data-product-id]`);
                  lowStockRows.forEach(row => {
                    const productId = row.getAttribute('data-product-id');
                    if (lowStockIds.includes(productId)) {
                      row.scrollIntoView({ behavior: 'smooth', block: 'center' });
                      row.classList.add('ring-2', 'ring-yellow-400');
                      setTimeout(() => {
                        row.classList.remove('ring-2', 'ring-yellow-400');
                      }, 3000);
                    }
                  });
                }}
              >
                <Package className="mr-2 h-4 w-4" />
                Highlight Low Stock Items
              </Button>
            </div>
          </AlertDescription>
        </Alert>
      )}

      {/* Advanced Filters Section */}
      <Card className="mb-6">
        <CardHeader className="pb-4">
          <div className="responsive-toolbar">
            <CardTitle className="flex items-center gap-2">
              <Filter className="h-5 w-5" />
              Filter Products
              {getActiveFiltersCount() > 0 && (
                <Badge variant="secondary" className="ml-2">
                  {getActiveFiltersCount()} active
                </Badge>
              )}
            </CardTitle>
            {getActiveFiltersCount() > 0 && (
              <Button variant="outline" size="sm" onClick={clearAllFilters}>
                <X className="mr-2 h-4 w-4" />
                Clear All
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-6 gap-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search products..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Category Filter */}
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger>
                <SelectValue placeholder="All Categories" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                <SelectItem value="cakes">ðŸŽ‚ Cakes</SelectItem>
                <SelectItem value="baskets">ðŸ§º Baskets</SelectItem>
                <SelectItem value="chocolate-baskets">ðŸ« Chocolate Baskets</SelectItem>
                <SelectItem value="chocolate-bouquets">ðŸ« Chocolate Bouquets</SelectItem>
                <SelectItem value="bunches">ðŸ’ Bunches</SelectItem>
                <SelectItem value="anniversary">ðŸ’• Anniversary</SelectItem>
                <SelectItem value="birthday">ðŸŽˆ Birthday</SelectItem>
                <SelectItem value="wedding">ðŸ’’ Wedding</SelectItem>
                <SelectItem value="funeral">ðŸ•Šï¸ Funeral</SelectItem>
                <SelectItem value="congratulations">ðŸŽ‰ Congratulations</SelectItem>
                <SelectItem value="get-well">ðŸŒ¸ Get Well</SelectItem>
                <SelectItem value="sympathy">ðŸ’™ Sympathy</SelectItem>
                <SelectItem value="condolence">ðŸ•Šï¸ Condolence</SelectItem>
                <SelectItem value="roses">ðŸŒ¹ Roses</SelectItem>
                <SelectItem value="sunflowers">ðŸŒ» Sunflowers</SelectItem>
                <SelectItem value="tulips">ðŸŒ· Tulips</SelectItem>
                <SelectItem value="orchids">ðŸŒº Orchids</SelectItem>
                <SelectItem value="lilies">ðŸŒ¼ Lilies</SelectItem>
                <SelectItem value="combos">ðŸŽ Combos</SelectItem>
                <SelectItem value="gift-hampers">ðŸŽ Gift Hampers</SelectItem>
                <SelectItem value="fruit-baskets">ðŸŽ Fruit Baskets</SelectItem>
                <SelectItem value="mixed-arrangements">ðŸŒ¸ Mixed Arrangements</SelectItem>
                <SelectItem value="premium-collections">â­ Premium Collections</SelectItem>
                <SelectItem value="seasonal-specials">ðŸ‚ Seasonal Specials</SelectItem>
                <SelectItem value="corporate-gifts">ðŸ¢ Corporate Gifts</SelectItem>
                <SelectItem value="baby-shower">ðŸ‘¶ Baby Shower</SelectItem>
                <SelectItem value="housewarming">ðŸ  Housewarming</SelectItem>
                <SelectItem value="thank-you">ðŸ™ Thank You</SelectItem>
                <SelectItem value="apology">ðŸ˜” Apology</SelectItem>
                <SelectItem value="graduation">ðŸŽ“ Graduation</SelectItem>
                <SelectItem value="valentines-day">ðŸ’ Valentine's Day</SelectItem>
                <SelectItem value="mothers-day">ðŸŒ· Mother's Day</SelectItem>
                <SelectItem value="fathers-day">ðŸ‘¨â€ðŸ‘§â€ðŸ‘¦ Father's Day</SelectItem>
                <SelectItem value="christmas">ðŸŽ„ Christmas</SelectItem>
                <SelectItem value="new-year">ðŸŽ† New Year</SelectItem>
                <SelectItem value="diwali">ðŸª” Diwali</SelectItem>
                <SelectItem value="holi">ðŸŽ¨ Holi</SelectItem>
                <SelectItem value="raksha-bandhan">ðŸª¢ Raksha Bandhan</SelectItem>
                {categories.map((category) => (
                  <SelectItem key={category} value={category.toLowerCase()}>
                    {category.charAt(0).toUpperCase() + category.slice(1)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Stock Filter */}
            <Select value={stockFilter} onValueChange={setStockFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Stock Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Stock Levels</SelectItem>
                <SelectItem value="in-stock">âœ… In Stock (10+)</SelectItem>
                <SelectItem value="low-stock">âš ï¸ Low Stock (1-10)</SelectItem>
                <SelectItem value="critical">ðŸš¨ Critical (1-5)</SelectItem>
                <SelectItem value="out-of-stock">âŒ Out of Stock</SelectItem>
              </SelectContent>
            </Select>

            {/* Featured Filter */}
            <Select value={featuredFilter} onValueChange={setFeaturedFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Featured Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Products</SelectItem>
                <SelectItem value="featured">â­ Featured Only</SelectItem>
                <SelectItem value="not-featured">ðŸ“‹ Not Featured</SelectItem>
              </SelectContent>
            </Select>

            {/* New Filter */}
            <Select value={newFilter} onValueChange={setNewFilter}>
              <SelectTrigger>
                <SelectValue placeholder="New Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Products</SelectItem>
                <SelectItem value="new">ðŸ†• New Products</SelectItem>
                <SelectItem value="not-new">ðŸ“¦ Regular Products</SelectItem>
              </SelectContent>
            </Select>

            {/* Visibility Filter */}
            <Select value={visibilityFilter} onValueChange={setVisibilityFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Visibility" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Products</SelectItem>
                <SelectItem value="visible">ðŸ‘ï¸ Visible</SelectItem>
                <SelectItem value="hidden">ðŸ™ˆ Hidden</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Results Summary */}
      <div className="mb-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        <div className="text-sm text-muted-foreground">
          Showing <strong>{filteredProducts.length}</strong> of <strong>{products.length}</strong> products
          {getActiveFiltersCount() > 0 && " (filtered)"}
        </div>
        <div className="text-sm text-muted-foreground">
          Categories: <strong>{categories.length}</strong>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Products ({filteredProducts.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {filteredProducts.length === 0 ? (
            <div className="text-center py-12">
              <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-muted-foreground mb-2">No products found</h3>
              <p className="text-sm text-muted-foreground mb-4">
                {getActiveFiltersCount() > 0 
                  ? "Try adjusting your filters to see more results"
                  : "Start by adding your first product"
                }
              </p>
              {getActiveFiltersCount() > 0 ? (
                <Button variant="outline" onClick={clearAllFilters}>
                  Clear Filters
                </Button>
              ) : (
                <Button onClick={() => navigate('/admin/products/new')}>
                  <Plus className="mr-2 h-4 w-4" />
                  Add First Product
                </Button>
              )}
            </div>
          ) : (
            <div className="responsive-table-wrap border-0 rounded-none">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[50px]">
                    <input
                      type="checkbox"
                      checked={selectedProductIds.length === filteredProducts.length && filteredProducts.length > 0}
                      onChange={toggleSelectAll}
                      className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary cursor-pointer"
                    />
                  </TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Price</TableHead>
                  <TableHead>Discount</TableHead>
                  <TableHead>Final Price</TableHead>
                  <TableHead>Stock</TableHead>
                  <TableHead>Featured</TableHead>
                  <TableHead>New</TableHead>
                  <TableHead>Same Day</TableHead>
                  <TableHead>Visibility</TableHead>
                  <TableHead>❤️ Valentine Product</TableHead>
                  <TableHead>Valentine Categories</TableHead>
                  <TableHead>Valentine Dates</TableHead>
                  <TableHead>Valentine Status</TableHead>
                  <TableHead>Image</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredProducts.map((product) => {
                  const finalPrice = product.discount
                    ? convertPrice(product.price * (1 - product.discount / 100))
                    : convertPrice(product.price);

                  // Construct the proper image URL using utility function with minimal cache busting
                  const imageUrl = getImageUrl(product.images?.[0], { bustCache: false });

                  return (
                    <TableRow 
                      key={product._id} 
                      className={`${product.hidden ? "opacity-60 bg-muted/30" : ""} ${selectedProductIds.includes(product._id) ? "bg-pink-50/20" : ""}`}
                      data-product-id={product._id}
                    >
                      <TableCell>
                        <input
                          type="checkbox"
                          checked={selectedProductIds.includes(product._id)}
                          onChange={() => toggleSelectProduct(product._id)}
                          className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary cursor-pointer"
                        />
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {product.title}
                          {product.hidden && <Badge variant="secondary">Hidden</Badge>}
                          {product.countInStock === 0 && <Badge variant="destructive">Out of Stock</Badge>}
                          {product.countInStock > 0 && product.countInStock <= 5 && <Badge variant="outline" className="border-red-500 text-red-600">Critical Stock</Badge>}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1">
                          <Badge variant="default" className="bg-primary">
                            {product.category}
                          </Badge>
                          {product.categories && product.categories.length > 0 && 
                            product.categories.map((category, idx) => (
                              <Badge key={idx} variant="outline" className="text-xs">
                                {category}
                              </Badge>
                            ))
                          }
                        </div>
                      </TableCell>
                      <TableCell className={product.discount > 0 ? "text-red-600 font-bold" : "text-black font-bold"}>
                        {product.category === 'combos' && product.comboItems && product.comboItems.length > 0 ? (
                          formatPrice(convertPrice(getComboMaxPrice(product)))
                        ) : (
                          formatPrice(convertPrice(product.price))
                        )}
                      </TableCell>
                      <TableCell>{product.discount ? `${product.discount}%` : "0%"}</TableCell>
                      <TableCell className="font-bold text-primary">{formatPrice(finalPrice)}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {getStockBadge(product.countInStock)}
                          {product.countInStock <= 10 && product.countInStock > 0 && (
                            <AlertTriangle className="h-4 w-4 text-yellow-500" />
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="text-xs text-muted-foreground">
                          {product.isFeatured ? "Featured" : "Regular"}
                        </span>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Switch
                            checked={Boolean(product.isNew)}
                            onCheckedChange={() => toggleProductNewStatus(product._id)}
                            className="data-[state=checked]:bg-blue-600"
                          />
                          <span className="text-xs text-muted-foreground">
                            {product.isNew ? "New" : "Regular"}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Switch
                            checked={product.sameDay !== false}
                            onCheckedChange={() => toggleProductSameDayStatus(product._id)}
                            className="data-[state=checked]:bg-emerald-600"
                          />
                          <span className="text-xs text-muted-foreground">
                            {product.sameDay !== false ? "Yes" : "No"}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Switch
                            checked={!product.hidden}
                            onCheckedChange={() => toggleProductVisibility(product._id)}
                            className="data-[state=checked]:bg-green-600"
                          />
                          {product.hidden ? (
                            <EyeOff className="h-4 w-4 text-muted-foreground" />
                          ) : (
                            <Eye className="h-4 w-4 text-green-600" />
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        {product.isValentineProduct ? (
                          <Badge variant="secondary" className="bg-pink-100 text-pink-700 font-semibold border-pink-200 animate-pulse">
                            ❤️ Yes
                          </Badge>
                        ) : (
                          <span className="text-gray-400">No</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="max-w-[200px] truncate" title={product.valentineCategories?.join(', ')}>
                          {product.valentineCategories && product.valentineCategories.length > 0 ? (
                            product.valentineCategories.join(', ')
                          ) : (
                            <span className="text-gray-400">-</span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="max-w-[150px] truncate" title={product.availableDates?.join(', ')}>
                          {product.availableDates && product.availableDates.length > 0 ? (
                            product.availableDates.map(d => d.replace('-day', ' Day')).join(', ')
                          ) : (
                            <span className="text-gray-400">-</span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        {product.isValentineProduct ? (
                          product.showInValentineShop ? (
                            <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                              ✓ Active
                            </Badge>
                          ) : (
                            <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
                              ✕ Disabled
                            </Badge>
                          )
                        ) : (
                          <span className="text-gray-400">-</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="relative w-16 h-16 rounded overflow-hidden border bg-muted">
                          {product.images?.[0] ? (
                            <img 
                              src={imageUrl} 
                              alt={product.title} 
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                const target = e.target as HTMLImageElement;
                                // Try different URL constructions if the first one fails
                                if (!target.src.includes('placeholder')) {
                                  if (product.images?.[0]?.startsWith('/uploads/')) {
                                                            target.src = `https://www.sbflorist.in${product.images[0]}`;
                                  } else if (product.images?.[0] && !product.images[0].startsWith('http')) {
                        target.src = `https://www.sbflorist.in/uploads/${product.images[0]}`;
                                  } else {
                                    target.src = "/images/placeholder.jpg";
                                  }
                                } else {
                                  // Already tried alternatives, show placeholder icon
                                  target.style.display = 'none';
                                  const parent = target.parentElement;
                                  if (parent && !parent.querySelector('.fallback-icon')) {
                                    const fallback = document.createElement('div');
                                    fallback.className = 'fallback-icon absolute inset-0 flex items-center justify-center bg-gray-100';
                                    fallback.innerHTML = '<svg class="h-6 w-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>';
                                    parent.appendChild(fallback);
                                  }
                                }
                              }}
                            />
                          ) : (
                            <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
                              <Package className="h-6 w-6 text-gray-400" />
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1">
                          <Button variant="ghost" size="sm" onClick={() => navigate(`/admin/products/edit/${product._id}`)} className="touch-action-btn">
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm" onClick={() => handleDeleteProduct(product._id)} className="touch-action-btn">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminProducts;


