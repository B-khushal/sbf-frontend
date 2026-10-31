import React, { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import productService, { OverviewStats, ProductData } from "@/services/productService";
import { getImageUrl } from "@/config";
import AdminProducts from "./Products";
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
  ShieldAlert,
  LayoutDashboard,
  Sparkles
} from "lucide-react";
import {
  NeumorphicCard,
  StatCard,
  SoftButton,
  PageHeader
} from "@/components/dashboard";

const ProductsOverview: React.FC = () => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<OverviewStats | null>(null);
  const [searchParams, setSearchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState<string>(searchParams.get("tab") || "overview");

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
      <div className="flex flex-col items-center justify-center min-h-[50vh] bg-[var(--sbf-canvas)]">
        <div className="w-16 h-16 rounded-2xl sbf-neumo-raised flex items-center justify-center mb-4">
          <div className="w-8 h-8 border-3 border-rose-600 border-t-transparent rounded-full animate-spin" />
        </div>
        <p className="text-sm text-slate-700 font-semibold">Loading Florist Catalog Overview...</p>
      </div>
    );
  }

  const topCards = [
    { title: "Total Catalog", value: stats?.totalProducts || 0, icon: Package, color: "text-rose-600", bg: "bg-rose-50" },
    { title: "Active Live", value: stats?.activeProducts || 0, icon: CheckCircle, color: "text-emerald-600", bg: "bg-emerald-50" },
    { title: "Out of Stock", value: stats?.outOfStock || 0, icon: AlertTriangle, color: "text-rose-600", bg: "bg-rose-50" },
    { title: "Hidden Items", value: stats?.hiddenProducts || 0, icon: EyeOff, color: "text-amber-600", bg: "bg-amber-50" },
    { title: "Draft Items", value: stats?.draftProducts || 0, icon: FileText, color: "text-slate-600", bg: "bg-slate-100" },
    { title: "Low Inventory", value: stats?.lowInventoryCount || 0, icon: ShieldAlert, color: "text-orange-600", bg: "bg-orange-50" },
    { title: "Average Rating", value: `${stats?.averageRating || 0.0} ★`, icon: Star, color: "text-yellow-600", bg: "bg-yellow-50" },
    { title: "Pending Review", value: stats?.pendingReviewCount || 0, icon: Clock, color: "text-purple-600", bg: "bg-purple-50" },
  ];

  return (
    <div className="space-y-6 w-full max-w-7xl 2xl:max-w-9xl mx-auto">
      <Tabs
        value={activeTab}
        onValueChange={(val) => {
          setActiveTab(val);
          setSearchParams(val === "overview" ? {} : { tab: val });
        }}
        className="space-y-6"
      >
        {/* Header & Tabs */}
        <PageHeader
          title="Product Catalog Command"
          subtitle="Central management hub for all florist arrangements, cakes, plants, combos & inventory health"
          badge={
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-rose-50 text-rose-700 border border-rose-200/60 shadow-sm">
              <Sparkles className="w-3 h-3 text-rose-600 animate-pulse" />
              <span>Catalog Live</span>
            </div>
          }
          actions={
            <div className="flex flex-wrap items-center gap-2">
              <TabsList className="p-1 rounded-xl sbf-neumo-inset-sm bg-[var(--sbf-card)] border-none h-9">
                <TabsTrigger
                  value="overview"
                  className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1 rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-rose-600"
                >
                  <LayoutDashboard className="h-3.5 w-3.5" /> Overview
                </TabsTrigger>
                <TabsTrigger
                  value="table"
                  className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1 rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-rose-600"
                >
                  <Boxes className="h-3.5 w-3.5" /> All Products ({stats?.totalProducts || 181})
                </TabsTrigger>
              </TabsList>
              
              <SoftButton
                variant="raised"
                size="icon"
                onClick={fetchOverviewData}
                title="Refresh catalog metrics"
              >
                <RefreshCw className="h-4 w-4 text-slate-600" />
              </SoftButton>

              <Link to="/admin/products/new">
                <SoftButton size="sm" variant="primary">
                  <Plus className="h-4 w-4 mr-1.5" />
                  Add Product
                </SoftButton>
              </Link>
            </div>
          }
        />

        <TabsContent value="overview" className="space-y-6 mt-0">
          {/* Top 8 Analytics Metric Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-4 2xl:grid-cols-8 gap-3 sm:gap-4">
            {topCards.map((card, i) => {
              const Icon = card.icon;
              return (
                <div
                  key={i}
                  onClick={() => {
                    if (card.title.includes("Product") || card.title.includes("Catalog") || card.title.includes("Live")) {
                      setActiveTab("table");
                    }
                  }}
                  className={`p-3.5 rounded-2xl sbf-neumo-raised-sm bg-[var(--sbf-card)] flex items-center justify-between transition-all duration-200 ${
                    card.title.includes("Product") || card.title.includes("Catalog") || card.title.includes("Live")
                      ? "cursor-pointer hover:scale-[1.02] hover:border-rose-400"
                      : ""
                  }`}
                >
                  <div className="min-w-0 pr-2">
                    <p className="text-[11px] font-semibold text-slate-500 truncate">{card.title}</p>
                    <p className="text-lg font-black text-slate-900 font-mono mt-0.5 truncate">{card.value}</p>
                  </div>
                  <div className={`w-9 h-9 rounded-xl sbf-neumo-inset-sm flex items-center justify-center shrink-0 ${card.bg}`}>
                    <Icon className={`h-4.5 w-4.5 ${card.color}`} />
                  </div>
                </div>
              );
            })}
          </div>

          {/* Quick Action Hub */}
          <NeumorphicCard
            title="Catalog Quick Actions"
            description="Quickly create bouquets, designer cakes, combos, or run batch export workflows"
            headerIcon={TrendingUp}
            variant="raised"
          >
            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2.5 pt-1">
              <Link to="/admin/products/new?type=bouquet">
                <div className="p-3 rounded-xl sbf-neumo-raised-hover bg-[var(--sbf-card)] flex flex-col items-center gap-1.5 text-center group">
                  <div className="w-8 h-8 rounded-lg sbf-neumo-inset-sm flex items-center justify-center text-pink-500 group-hover:scale-110 transition-transform">
                    <Flower2 className="h-4 w-4" />
                  </div>
                  <span className="text-[11px] font-bold text-slate-800">Add Bouquet</span>
                </div>
              </Link>

              <Link to="/admin/products/new?type=cake">
                <div className="p-3 rounded-xl sbf-neumo-raised-hover bg-[var(--sbf-card)] flex flex-col items-center gap-1.5 text-center group">
                  <div className="w-8 h-8 rounded-lg sbf-neumo-inset-sm flex items-center justify-center text-amber-500 group-hover:scale-110 transition-transform">
                    <Cake className="h-4 w-4" />
                  </div>
                  <span className="text-[11px] font-bold text-slate-800">Add Cake</span>
                </div>
              </Link>

              <Link to="/admin/products/new?type=plant">
                <div className="p-3 rounded-xl sbf-neumo-raised-hover bg-[var(--sbf-card)] flex flex-col items-center gap-1.5 text-center group">
                  <div className="w-8 h-8 rounded-lg sbf-neumo-inset-sm flex items-center justify-center text-emerald-500 group-hover:scale-110 transition-transform">
                    <Sprout className="h-4 w-4" />
                  </div>
                  <span className="text-[11px] font-bold text-slate-800">Add Plant</span>
                </div>
              </Link>

              <Link to="/admin/products/new?category=combos">
                <div className="p-3 rounded-xl sbf-neumo-raised-hover bg-[var(--sbf-card)] flex flex-col items-center gap-1.5 text-center group">
                  <div className="w-8 h-8 rounded-lg sbf-neumo-inset-sm flex items-center justify-center text-blue-500 group-hover:scale-110 transition-transform">
                    <Boxes className="h-4 w-4" />
                  </div>
                  <span className="text-[11px] font-bold text-slate-800">Create Combo</span>
                </div>
              </Link>

              <Link to="/admin/products/hampers">
                <div className="p-3 rounded-xl sbf-neumo-raised-hover bg-[var(--sbf-card)] flex flex-col items-center gap-1.5 text-center group">
                  <div className="w-8 h-8 rounded-lg sbf-neumo-inset-sm flex items-center justify-center text-purple-500 group-hover:scale-110 transition-transform">
                    <Gift className="h-4 w-4" />
                  </div>
                  <span className="text-[11px] font-bold text-slate-800">Create Hamper</span>
                </div>
              </Link>

              <Link to="/admin/products/collections">
                <div className="p-3 rounded-xl sbf-neumo-raised-hover bg-[var(--sbf-card)] flex flex-col items-center gap-1.5 text-center group">
                  <div className="w-8 h-8 rounded-lg sbf-neumo-inset-sm flex items-center justify-center text-cyan-500 group-hover:scale-110 transition-transform">
                    <Layers className="h-4 w-4" />
                  </div>
                  <span className="text-[11px] font-bold text-slate-800">Collections</span>
                </div>
              </Link>

              <Link to="/admin/products/inventory">
                <div className="p-3 rounded-xl sbf-neumo-raised-hover bg-[var(--sbf-card)] flex flex-col items-center gap-1.5 text-center group">
                  <div className="w-8 h-8 rounded-lg sbf-neumo-inset-sm flex items-center justify-center text-teal-500 group-hover:scale-110 transition-transform">
                    <Upload className="h-4 w-4" />
                  </div>
                  <span className="text-[11px] font-bold text-slate-800">Inventory Log</span>
                </div>
              </Link>

              <Link to="/admin/products/bouquets">
                <div className="p-3 rounded-xl sbf-neumo-raised-hover bg-[var(--sbf-card)] flex flex-col items-center gap-1.5 text-center group">
                  <div className="w-8 h-8 rounded-lg sbf-neumo-inset-sm flex items-center justify-center text-slate-500 group-hover:scale-110 transition-transform">
                    <Download className="h-4 w-4" />
                  </div>
                  <span className="text-[11px] font-bold text-slate-800">Export Catalog</span>
                </div>
              </Link>
            </div>
          </NeumorphicCard>

          {/* Main Charts & Analytics Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Product Type Breakdown */}
            <NeumorphicCard
              title="Product Type Distribution"
              description="Catalog balance across merchandise types"
              headerIcon={Layers}
              variant="raised"
            >
              <div className="space-y-4 pt-1">
                {stats && Object.entries(stats.typeDistribution).map(([type, count]) => {
                  const total = stats.totalProducts || 1;
                  const percent = Math.round((count / total) * 100);
                  return (
                    <div key={type} className="space-y-1.5">
                      <div className="flex justify-between text-xs font-semibold">
                        <span className="capitalize text-slate-700">{type}s</span>
                        <span className="text-slate-500 font-mono">{count} ({percent}%)</span>
                      </div>
                      <div className="w-full h-2 rounded-full sbf-neumo-inset-sm bg-[var(--sbf-card)] p-0.5 overflow-hidden">
                        <div
                          className="h-full rounded-full bg-rose-500 transition-all duration-500"
                          style={{ width: `${percent}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </NeumorphicCard>

            {/* Category Breakdown */}
            <NeumorphicCard
              title="Category Distribution"
              description="Product allocation by main storefront category"
              headerIcon={Boxes}
              variant="raised"
            >
              <div className="space-y-2.5 max-h-[290px] overflow-y-auto pr-1 pt-1">
                {stats && Object.entries(stats.categoryDistribution).map(([cat, count]) => (
                  <div
                    key={cat}
                    className="flex items-center justify-between p-2.5 rounded-xl sbf-neumo-inset-sm bg-[var(--sbf-card)]"
                  >
                    <span className="text-xs font-semibold text-slate-700 truncate max-w-[200px]">
                      {cat}
                    </span>
                    <span className="text-xs font-bold font-mono text-slate-900 bg-white px-2 py-0.5 rounded-lg shadow-xs">
                      {count} items
                    </span>
                  </div>
                ))}
              </div>
            </NeumorphicCard>

            {/* Inventory Status Overview */}
            <NeumorphicCard
              title="Inventory Health"
              description="Real-time stock level status across catalog"
              headerIcon={ShieldAlert}
              variant="raised"
            >
              <div className="space-y-3 pt-1">
                <div className="p-3.5 rounded-xl sbf-neumo-inset-sm bg-emerald-50/70 border border-emerald-200/50 flex items-center justify-between">
                  <div>
                    <p className="text-xs font-bold text-emerald-800">In Stock Items</p>
                    <p className="text-lg font-black text-emerald-900 font-mono mt-0.5">
                      {(stats?.totalProducts || 0) - (stats?.outOfStock || 0) - (stats?.lowInventoryCount || 0)}
                    </p>
                  </div>
                  <CheckCircle className="h-6 w-6 text-emerald-600" />
                </div>

                <div className="p-3.5 rounded-xl sbf-neumo-inset-sm bg-amber-50/70 border border-amber-200/50 flex items-center justify-between">
                  <div>
                    <p className="text-xs font-bold text-amber-800">Low Stock Alert (≤ 5)</p>
                    <p className="text-lg font-black text-amber-900 font-mono mt-0.5">
                      {stats?.lowInventoryCount || 0}
                    </p>
                  </div>
                  <ShieldAlert className="h-6 w-6 text-amber-600" />
                </div>

                <div className="p-3.5 rounded-xl sbf-neumo-inset-sm bg-rose-50/70 border border-rose-200/50 flex items-center justify-between">
                  <div>
                    <p className="text-xs font-bold text-rose-800">Out of Stock</p>
                    <p className="text-lg font-black text-rose-900 font-mono mt-0.5">
                      {stats?.outOfStock || 0}
                    </p>
                  </div>
                  <AlertTriangle className="h-6 w-6 text-rose-600" />
                </div>
              </div>
            </NeumorphicCard>
          </div>

          {/* Recently Added & Recently Updated Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Recently Added Products */}
            <NeumorphicCard
              title="Recently Added Arrangements"
              description="Latest creations published to the catalog"
              headerIcon={Package}
              headerActions={
                <Link to="/admin/products/all">
                  <SoftButton variant="ghost" size="sm" className="text-xs text-rose-600 font-bold">
                    View All <ArrowRight className="h-3.5 w-3.5 ml-1" />
                  </SoftButton>
                </Link>
              }
              variant="raised"
            >
              <div className="space-y-2.5 pt-1">
                {stats?.recentlyAdded && stats.recentlyAdded.length > 0 ? (
                  stats.recentlyAdded.map((product) => (
                    <div
                      key={product._id}
                      className="flex items-center gap-3 p-2.5 rounded-xl sbf-neumo-inset-sm bg-[var(--sbf-card)]"
                    >
                      <img
                        src={getImageUrl(product.images?.[0])}
                        alt={product.title}
                        className="w-10 h-10 object-cover rounded-lg sbf-neumo-raised-sm shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-bold text-slate-800 truncate">{product.title}</p>
                        <p className="text-[11px] text-slate-500 font-mono">₹{product.price} • {product.category}</p>
                      </div>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-white shadow-xs text-slate-700 capitalize">
                        {product.catalogType || 'bouquet'}
                      </span>
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-slate-400 py-4 text-center">No recent products available.</p>
                )}
              </div>
            </NeumorphicCard>

            {/* Recently Updated Products */}
            <NeumorphicCard
              title="Recently Updated Products"
              description="Stock adjustments and catalog revision logs"
              headerIcon={Clock}
              headerActions={
                <Link to="/admin/products/inventory">
                  <SoftButton variant="ghost" size="sm" className="text-xs text-rose-600 font-bold">
                    Inventory Log <ArrowRight className="h-3.5 w-3.5 ml-1" />
                  </SoftButton>
                </Link>
              }
              variant="raised"
            >
              <div className="space-y-2.5 pt-1">
                {stats?.recentlyUpdated && stats.recentlyUpdated.length > 0 ? (
                  stats.recentlyUpdated.map((product) => (
                    <div
                      key={product._id}
                      className="flex items-center gap-3 p-2.5 rounded-xl sbf-neumo-inset-sm bg-[var(--sbf-card)]"
                    >
                      <img
                        src={getImageUrl(product.images?.[0])}
                        alt={product.title}
                        className="w-10 h-10 object-cover rounded-lg sbf-neumo-raised-sm shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-bold text-slate-800 truncate">{product.title}</p>
                        <p className="text-[11px] text-slate-500 font-mono">Stock: {product.countInStock} units</p>
                      </div>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          product.countInStock > 0 ? "bg-emerald-50 text-emerald-700 border border-emerald-200" : "bg-rose-50 text-rose-700 border border-rose-200"
                        }`}
                      >
                        {product.countInStock > 0 ? `${product.countInStock} in stock` : "Out of stock"}
                      </span>
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-slate-400 py-4 text-center">No recent updates logged.</p>
                )}
              </div>
            </NeumorphicCard>
          </div>
        </TabsContent>

        <TabsContent value="table" className="mt-0">
          <AdminProducts />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ProductsOverview;
