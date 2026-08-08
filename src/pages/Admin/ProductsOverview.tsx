import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import productService, { OverviewStats, ProductData } from "@/services/productService";
import { getImageUrl } from "@/config";
import {
  Package,
  CheckCircle,
  AlertTriangle,
  EyeOff,
  FileText,
  Star,
  Clock,
  Plus,
  Flower2,
  Cake,
  Sprout,
  Boxes,
  Gift,
  Download,
  Upload,
  Layers,
  TrendingUp,
  RefreshCw,
  ArrowRight,
  ShieldAlert
} from "lucide-react";

const ProductsOverview: React.FC = () => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<OverviewStats | null>(null);

  const fetchOverviewData = async () => {
    try {
      setLoading(true);
      const data = await productService.getOverviewStats();
      setStats(data);
    } catch (error: any) {
      console.error("Error fetching overview stats:", error);
      toast({
        variant: "destructive",
        title: "Error Loading Overview",
        description: error.message || "Failed to load catalog stats.",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOverviewData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center space-y-3">
          <div className="w-12 h-12 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-sm text-slate-500 font-medium">Loading Products Overview...</p>
        </div>
      </div>
    );
  }

  const topCards = [
    { title: "Total Products", value: stats?.totalProducts || 0, icon: Package, color: "text-blue-600", bg: "bg-blue-50 dark:bg-blue-950/40" },
    { title: "Active Products", value: stats?.activeProducts || 0, icon: CheckCircle, color: "text-emerald-600", bg: "bg-emerald-50 dark:bg-emerald-950/40" },
    { title: "Out of Stock", value: stats?.outOfStock || 0, icon: AlertTriangle, color: "text-rose-600", bg: "bg-rose-50 dark:bg-rose-950/40" },
    { title: "Hidden Products", value: stats?.hiddenProducts || 0, icon: EyeOff, color: "text-amber-600", bg: "bg-amber-50 dark:bg-amber-950/40" },
    { title: "Draft Products", value: stats?.draftProducts || 0, icon: FileText, color: "text-slate-600", bg: "bg-slate-100 dark:bg-slate-800/40" },
    { title: "Low Inventory", value: stats?.lowInventoryCount || 0, icon: ShieldAlert, color: "text-orange-600", bg: "bg-orange-50 dark:bg-orange-950/40" },
    { title: "Average Rating", value: `${stats?.averageRating || 0.0} ★`, icon: Star, color: "text-yellow-600", bg: "bg-yellow-50 dark:bg-yellow-950/40" },
    { title: "Pending Review", value: stats?.pendingReviewCount || 0, icon: Clock, color: "text-purple-600", bg: "bg-purple-50 dark:bg-purple-950/40" },
  ];

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header & Refresh */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
            Catalog Overview
          </h1>
          <p className="text-sm text-muted-foreground">
            Central management hub for all product types, inventory, and catalog performance.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={fetchOverviewData}
            className="flex items-center gap-1.5"
          >
            <RefreshCw className="h-4 w-4" />
            Refresh
          </Button>
          <Link to="/admin/products/new">
            <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700 text-white flex items-center gap-1.5 shadow-sm">
              <Plus className="h-4 w-4" />
              Add Product
            </Button>
          </Link>
        </div>
      </div>

      {/* Top 8 Analytics Metric Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-4 gap-4">
        {topCards.map((card, i) => {
          const Icon = card.icon;
          return (
            <Card key={i} className="border-slate-200/80 dark:border-slate-800 shadow-sm hover:shadow-md transition-shadow">
              <CardContent className="p-4 flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-slate-500">{card.title}</p>
                  <p className="text-xl font-bold text-slate-900 dark:text-slate-100 mt-1">{card.value}</p>
                </div>
                <div className={`p-2.5 rounded-xl ${card.bg}`}>
                  <Icon className={`h-5 w-5 ${card.color}`} />
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Quick Action Hub */}
      <Card className="border-slate-200/80 dark:border-slate-800 shadow-sm bg-gradient-to-r from-slate-900 to-slate-800 text-white">
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-semibold flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-emerald-400" />
            Catalog Quick Actions
          </CardTitle>
          <CardDescription className="text-slate-300 text-xs">
            Quickly create specific product categories, multi-item combos, or perform batch operations.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2.5">
            <Link to="/admin/products/new?type=bouquet">
              <Button variant="secondary" size="sm" className="w-full flex-col h-auto py-2.5 px-2 bg-white/10 hover:bg-white/20 text-white border-0">
                <Flower2 className="h-4 w-4 mb-1 text-pink-400" />
                <span className="text-[11px]">Add Bouquet</span>
              </Button>
            </Link>
            <Link to="/admin/products/new?type=cake">
              <Button variant="secondary" size="sm" className="w-full flex-col h-auto py-2.5 px-2 bg-white/10 hover:bg-white/20 text-white border-0">
                <Cake className="h-4 w-4 mb-1 text-amber-400" />
                <span className="text-[11px]">Add Cake</span>
              </Button>
            </Link>
            <Link to="/admin/products/new?type=plant">
              <Button variant="secondary" size="sm" className="w-full flex-col h-auto py-2.5 px-2 bg-white/10 hover:bg-white/20 text-white border-0">
                <Sprout className="h-4 w-4 mb-1 text-emerald-400" />
                <span className="text-[11px]">Add Plant</span>
              </Button>
            </Link>
            <Link to="/admin/products/new?category=combos">
              <Button variant="secondary" size="sm" className="w-full flex-col h-auto py-2.5 px-2 bg-white/10 hover:bg-white/20 text-white border-0">
                <Boxes className="h-4 w-4 mb-1 text-blue-400" />
                <span className="text-[11px]">Create Combo</span>
              </Button>
            </Link>
            <Link to="/admin/products/hampers">
              <Button variant="secondary" size="sm" className="w-full flex-col h-auto py-2.5 px-2 bg-white/10 hover:bg-white/20 text-white border-0">
                <Gift className="h-4 w-4 mb-1 text-purple-400" />
                <span className="text-[11px]">Create Hamper</span>
              </Button>
            </Link>
            <Link to="/admin/products/collections">
              <Button variant="secondary" size="sm" className="w-full flex-col h-auto py-2.5 px-2 bg-white/10 hover:bg-white/20 text-white border-0">
                <Layers className="h-4 w-4 mb-1 text-cyan-400" />
                <span className="text-[11px]">Collections</span>
              </Button>
            </Link>
            <Link to="/admin/products/inventory">
              <Button variant="secondary" size="sm" className="w-full flex-col h-auto py-2.5 px-2 bg-white/10 hover:bg-white/20 text-white border-0">
                <Upload className="h-4 w-4 mb-1 text-teal-400" />
                <span className="text-[11px]">Inventory Log</span>
              </Button>
            </Link>
            <Link to="/admin/products/bouquets">
              <Button variant="secondary" size="sm" className="w-full flex-col h-auto py-2.5 px-2 bg-white/10 hover:bg-white/20 text-white border-0">
                <Download className="h-4 w-4 mb-1 text-slate-300" />
                <span className="text-[11px]">Export Catalog</span>
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>

      {/* Main Charts & Analytics Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Product Type Breakdown */}
        <Card className="border-slate-200/80 dark:border-slate-800 shadow-sm">
          <CardHeader>
            <CardTitle className="text-base font-semibold">Product Type Distribution</CardTitle>
            <CardDescription className="text-xs">Catalog balance across merchandise types.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {stats && Object.entries(stats.typeDistribution).map(([type, count]) => {
              const total = stats.totalProducts || 1;
              const percent = Math.round((count / total) * 100);
              return (
                <div key={type} className="space-y-1.5">
                  <div className="flex justify-between text-xs font-medium">
                    <span className="capitalize">{type}s</span>
                    <span className="text-slate-500">{count} ({percent}%)</span>
                  </div>
                  <Progress value={percent} className="h-2" />
                </div>
              );
            })}
          </CardContent>
        </Card>

        {/* Category Breakdown */}
        <Card className="border-slate-200/80 dark:border-slate-800 shadow-sm">
          <CardHeader>
            <CardTitle className="text-base font-semibold">Category Distribution</CardTitle>
            <CardDescription className="text-xs">Product allocation by main category.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 max-h-[300px] overflow-y-auto">
            {stats && Object.entries(stats.categoryDistribution).map(([cat, count]) => (
              <div key={cat} className="flex items-center justify-between py-2 border-b border-slate-100 dark:border-slate-800/60 last:border-0">
                <span className="text-xs font-medium text-slate-700 dark:text-slate-300 truncate max-w-[200px]">
                  {cat}
                </span>
                <Badge variant="secondary" className="text-xs font-semibold">
                  {count} items
                </Badge>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Inventory Status Overview */}
        <Card className="border-slate-200/80 dark:border-slate-800 shadow-sm">
          <CardHeader>
            <CardTitle className="text-base font-semibold">Inventory Health</CardTitle>
            <CardDescription className="text-xs">Real-time stock level status.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-3 bg-emerald-50 dark:bg-emerald-950/30 rounded-lg flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-emerald-800 dark:text-emerald-300">In Stock Items</p>
                <p className="text-lg font-bold text-emerald-900 dark:text-emerald-100">
                  {(stats?.totalProducts || 0) - (stats?.outOfStock || 0) - (stats?.lowInventoryCount || 0)}
                </p>
              </div>
              <CheckCircle className="h-6 w-6 text-emerald-600" />
            </div>

            <div className="p-3 bg-orange-50 dark:bg-orange-950/30 rounded-lg flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-orange-800 dark:text-orange-300">Low Stock Alert (≤ 5)</p>
                <p className="text-lg font-bold text-orange-900 dark:text-orange-100">
                  {stats?.lowInventoryCount || 0}
                </p>
              </div>
              <ShieldAlert className="h-6 w-6 text-orange-600" />
            </div>

            <div className="p-3 bg-rose-50 dark:bg-rose-950/30 rounded-lg flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-rose-800 dark:text-rose-300">Out of Stock</p>
                <p className="text-lg font-bold text-rose-900 dark:text-rose-100">
                  {stats?.outOfStock || 0}
                </p>
              </div>
              <AlertTriangle className="h-6 w-6 text-rose-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recently Added & Recently Updated Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recently Added Products */}
        <Card className="border-slate-200/80 dark:border-slate-800 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-base font-semibold">Recently Added Products</CardTitle>
              <CardDescription className="text-xs">Latest additions to the product catalog.</CardDescription>
            </div>
            <Link to="/admin/products/bouquets">
              <Button variant="ghost" size="sm" className="text-xs text-emerald-600 hover:text-emerald-700 flex items-center gap-1">
                View All <ArrowRight className="h-3.5 w-3.5" />
              </Button>
            </Link>
          </CardHeader>
          <CardContent className="space-y-3">
            {stats?.recentlyAdded && stats.recentlyAdded.length > 0 ? (
              stats.recentlyAdded.map((product) => (
                <div key={product._id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                  <img
                    src={getImageUrl(product.images?.[0])}
                    alt={product.title}
                    className="w-10 h-10 object-cover rounded-md border border-slate-200 dark:border-slate-700"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-slate-900 dark:text-slate-100 truncate">{product.title}</p>
                    <p className="text-[11px] text-muted-foreground">₹{product.price} • {product.category}</p>
                  </div>
                  <Badge variant={product.hidden ? "outline" : "default"} className="text-[10px]">
                    {product.catalogType || 'bouquet'}
                  </Badge>
                </div>
              ))
            ) : (
              <p className="text-xs text-muted-foreground py-4 text-center">No recent products available.</p>
            )}
          </CardContent>
        </Card>

        {/* Recently Updated Products */}
        <Card className="border-slate-200/80 dark:border-slate-800 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-base font-semibold">Recently Updated Products</CardTitle>
              <CardDescription className="text-xs">Modifications and stock updates history.</CardDescription>
            </div>
            <Link to="/admin/products/inventory">
              <Button variant="ghost" size="sm" className="text-xs text-emerald-600 hover:text-emerald-700 flex items-center gap-1">
                Inventory Log <ArrowRight className="h-3.5 w-3.5" />
              </Button>
            </Link>
          </CardHeader>
          <CardContent className="space-y-3">
            {stats?.recentlyUpdated && stats.recentlyUpdated.length > 0 ? (
              stats.recentlyUpdated.map((product) => (
                <div key={product._id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                  <img
                    src={getImageUrl(product.images?.[0])}
                    alt={product.title}
                    className="w-10 h-10 object-cover rounded-md border border-slate-200 dark:border-slate-700"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-slate-900 dark:text-slate-100 truncate">{product.title}</p>
                    <p className="text-[11px] text-muted-foreground">Stock: {product.countInStock} • Updated recently</p>
                  </div>
                  <Badge variant={product.countInStock > 0 ? "secondary" : "destructive"} className="text-[10px]">
                    {product.countInStock > 0 ? `${product.countInStock} in stock` : "Out of stock"}
                  </Badge>
                </div>
              ))
            ) : (
              <p className="text-xs text-muted-foreground py-4 text-center">No recent updates logged.</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ProductsOverview;
