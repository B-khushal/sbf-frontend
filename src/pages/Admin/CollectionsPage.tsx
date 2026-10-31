import React, { useEffect, useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import collectionService, { CollectionData } from "@/services/collectionService";
import { Layers, Plus, Edit, Trash2, RefreshCw, Sparkles, FolderTree, ArrowUpDown } from "lucide-react";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { StatCard } from "@/components/dashboard/StatCard";
import { SoftButton } from "@/components/dashboard/SoftButton";
import { StatusBadge } from "@/components/dashboard/StatusBadge";

const CollectionsPage: React.FC = () => {
  const { toast } = useToast();
  const [collections, setCollections] = useState<CollectionData[]>([]);
  const [loading, setLoading] = useState(true);

  // Dialog state
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingCollection, setEditingCollection] = useState<CollectionData | null>(null);

  // Form State
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [bannerImage, setBannerImage] = useState("");
  const [displayPriority, setDisplayPriority] = useState<number>(0);
  const [saving, setSaving] = useState(false);

  const fetchCollections = async () => {
    try {
      setLoading(true);
      const data = await collectionService.getCollections();
      setCollections(data);
    } catch (error: any) {
      console.error("Error fetching collections:", error);
      toast({
        variant: "destructive",
        title: "Failed to Load Collections",
        description: error.message,
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCollections();
  }, []);

  const handleOpenModal = (col?: CollectionData) => {
    if (col) {
      setEditingCollection(col);
      setName(col.name);
      setDescription(col.description || "");
      setBannerImage(col.bannerImage || "");
      setDisplayPriority(col.displayPriority || 0);
    } else {
      setEditingCollection(null);
      setName("");
      setDescription("");
      setBannerImage("");
      setDisplayPriority(0);
    }
    setDialogOpen(true);
  };

  const handleSaveCollection = async () => {
    if (!name.trim()) {
      return toast({
        variant: "destructive",
        title: "Validation Error",
        description: "Collection name required.",
      });
    }

    try {
      setSaving(true);
      if (editingCollection) {
        await collectionService.updateCollection(editingCollection._id!, {
          name,
          description,
          bannerImage,
          displayPriority,
        });
        toast({
          title: "Collection Updated",
          description: `${name} updated successfully.`,
        });
      } else {
        await collectionService.createCollection({
          name,
          description,
          bannerImage,
          displayPriority,
        });
        toast({
          title: "Collection Created",
          description: `${name} created successfully.`,
        });
      }
      setDialogOpen(false);
      fetchCollections();
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Save Failed",
        description: error.message,
      });
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteCollection = async (id: string, nameStr: string) => {
    if (!window.confirm(`Are you sure you want to delete collection "${nameStr}"?`))
      return;
    try {
      await collectionService.deleteCollection(id);
      toast({
        title: "Collection Removed",
        description: `${nameStr} has been deleted.`,
      });
      fetchCollections();
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Delete Failed",
        description: error.message,
      });
    }
  };

  const stats = useMemo(() => {
    const withImages = collections.filter((c) => Boolean(c.bannerImage)).length;
    return {
      total: collections.length,
      withImages,
    };
  }, [collections]);

  return (
    <div className="space-y-6 w-full max-w-7xl 2xl:max-w-9xl 3xl:max-w-11xl 4xl:max-w-qhd mx-auto">
      {/* Neumorphic Page Header */}
      <PageHeader
        breadcrumbs={[
          { label: "Admin", href: "/admin" },
          { label: "Products", href: "/admin/products" },
          { label: "Collections" },
        ]}
        title="Product Collections Curations"
        description="Group products into curated seasonal & promotional collections (Trending, Best Sellers, Luxury, Festival Specials)."
        liveStatus={{ label: `${collections.length} Curations Live`, ping: true }}
        actions={
          <div className="flex items-center gap-2.5">
            <SoftButton
              variant="default"
              size="sm"
              icon={RefreshCw}
              onClick={fetchCollections}
            >
              Refresh
            </SoftButton>
            <SoftButton
              variant="primary"
              size="sm"
              icon={Plus}
              onClick={() => handleOpenModal()}
            >
              Create Collection
            </SoftButton>
          </div>
        }
      />

      {/* KPI Stats Row */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        <StatCard
          title="Total Collections"
          value={stats.total}
          icon={Layers}
          color="blue"
          subtitle="Active marketing themes"
        />
        <StatCard
          title="Banner Ready"
          value={stats.withImages}
          icon={Sparkles}
          color="emerald"
          subtitle="With custom cover art"
        />
        <StatCard
          title="Storefront Placement"
          value="Hero / Grid"
          icon={FolderTree}
          color="purple"
          subtitle="Dynamic priority order"
        />
      </div>

      {/* Collections Neumorphic Table Card */}
      <div className="rounded-2xl border border-white/80 dark:border-slate-800 shadow-[6px_6px_18px_rgba(163,177,198,0.22),-6px_-6px_18px_rgba(255,255,255,0.8)] bg-[#f4f7fb] dark:bg-slate-900 overflow-hidden transition-all">
        <Table>
          <TableHeader className="bg-[#edf1f7] dark:bg-slate-800/60 border-b border-slate-200/80 dark:border-slate-800">
            <TableRow>
              <TableHead className="font-semibold text-xs text-slate-700 dark:text-slate-300">
                Collection Details
              </TableHead>
              <TableHead className="font-semibold text-xs text-slate-700 dark:text-slate-300">
                URL Slug
              </TableHead>
              <TableHead className="font-semibold text-xs text-slate-700 dark:text-slate-300">
                Display Order
              </TableHead>
              <TableHead className="font-semibold text-xs text-slate-700 dark:text-slate-300">
                Status
              </TableHead>
              <TableHead className="text-right font-semibold text-xs text-slate-700 dark:text-slate-300">
                Actions
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell
                  colSpan={5}
                  className="text-center py-10 text-xs text-slate-500"
                >
                  Loading collections...
                </TableCell>
              </TableRow>
            ) : collections.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={5}
                  className="text-center py-10 text-xs text-slate-500"
                >
                  No custom collections created yet. Click "Create Collection" to get started.
                </TableCell>
              </TableRow>
            ) : (
              collections.map((col) => (
                <TableRow
                  key={col._id}
                  className="hover:bg-white/60 dark:hover:bg-slate-800/40 transition-colors border-b border-slate-100 dark:border-slate-800/50"
                >
                  <TableCell>
                    <div className="flex items-center gap-3">
                      {col.bannerImage ? (
                        <img
                          src={col.bannerImage}
                          alt={col.name}
                          className="w-10 h-10 object-cover rounded-xl shadow-xs"
                        />
                      ) : (
                        <div className="w-10 h-10 bg-[#edf1f7] dark:bg-slate-800 rounded-xl flex items-center justify-center text-slate-400 shadow-[inset_1px_1px_3px_rgba(163,177,198,0.3)]">
                          <Layers className="h-4 w-4" />
                        </div>
                      )}
                      <div>
                        <p className="font-semibold text-xs text-slate-900 dark:text-slate-100">
                          {col.name}
                        </p>
                        <p className="text-[11px] text-muted-foreground line-clamp-1">
                          {col.description || "No description configured."}
                        </p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <code className="text-[11px] bg-[#edf1f7] dark:bg-slate-800 px-2.5 py-1 rounded-lg text-slate-700 dark:text-slate-300 font-mono shadow-[inset_1px_1px_3px_rgba(163,177,198,0.2)]">
                      {col.slug}
                    </code>
                  </TableCell>
                  <TableCell>
                    <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-slate-200/60 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                      Priority: {col.displayPriority || 0}
                    </span>
                  </TableCell>
                  <TableCell>
                    <StatusBadge status="active" />
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <SoftButton
                        variant="default"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => handleOpenModal(col)}
                      >
                        <Edit className="h-3.5 w-3.5" />
                      </SoftButton>
                      <SoftButton
                        variant="danger"
                        size="icon"
                        className="h-8 w-8 text-rose-600"
                        onClick={() => handleDeleteCollection(col._id!, col.name)}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </SoftButton>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Collection Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-md rounded-2xl border border-white/80 dark:border-slate-800 shadow-[8px_8px_24px_rgba(163,177,198,0.3),-8px_-8px_24px_rgba(255,255,255,0.9)] bg-[#f4f7fb] dark:bg-slate-900">
          <DialogHeader>
            <DialogTitle className="text-base font-bold text-slate-900 dark:text-slate-100">
              {editingCollection ? "Edit Collection" : "Create New Collection"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-3.5 py-2 text-xs">
            <div>
              <Label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                Collection Title *
              </Label>
              <input
                type="text"
                placeholder="e.g. Best Sellers 2026"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full mt-1 px-3 py-2 text-xs rounded-xl border border-slate-200/80 dark:border-slate-800 bg-[#edf1f7] dark:bg-slate-950 text-slate-800 dark:text-slate-100 shadow-[inset_2px_2px_4px_rgba(163,177,198,0.3),inset_-2px_-2px_4px_rgba(255,255,255,0.8)] focus:outline-none focus:ring-1 focus:ring-rose-500"
              />
            </div>
            <div>
              <Label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                Description
              </Label>
              <textarea
                rows={3}
                placeholder="Short curation summary for shoppers..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full mt-1 p-3 text-xs rounded-xl border border-slate-200/80 dark:border-slate-800 bg-[#edf1f7] dark:bg-slate-950 text-slate-800 dark:text-slate-100 shadow-[inset_2px_2px_4px_rgba(163,177,198,0.3),inset_-2px_-2px_4px_rgba(255,255,255,0.8)] focus:outline-none focus:ring-1 focus:ring-rose-500"
              />
            </div>
            <div>
              <Label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                Banner Image URL
              </Label>
              <input
                type="text"
                placeholder="https://res.cloudinary.com/..."
                value={bannerImage}
                onChange={(e) => setBannerImage(e.target.value)}
                className="w-full mt-1 px-3 py-2 text-xs rounded-xl border border-slate-200/80 dark:border-slate-800 bg-[#edf1f7] dark:bg-slate-950 text-slate-800 dark:text-slate-100 shadow-[inset_2px_2px_4px_rgba(163,177,198,0.3),inset_-2px_-2px_4px_rgba(255,255,255,0.8)] focus:outline-none focus:ring-1 focus:ring-rose-500"
              />
            </div>
            <div>
              <Label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                Display Priority (Higher renders first)
              </Label>
              <input
                type="number"
                value={displayPriority}
                onChange={(e) => setDisplayPriority(Number(e.target.value))}
                className="w-full mt-1 px-3 py-2 text-xs rounded-xl border border-slate-200/80 dark:border-slate-800 bg-[#edf1f7] dark:bg-slate-950 text-slate-800 dark:text-slate-100 shadow-[inset_2px_2px_4px_rgba(163,177,198,0.3),inset_-2px_-2px_4px_rgba(255,255,255,0.8)] focus:outline-none focus:ring-1 focus:ring-rose-500"
              />
            </div>
          </div>
          <DialogFooter className="gap-2">
            <SoftButton
              variant="default"
              size="sm"
              onClick={() => setDialogOpen(false)}
            >
              Cancel
            </SoftButton>
            <SoftButton
              variant="primary"
              size="sm"
              onClick={handleSaveCollection}
              disabled={saving}
            >
              {saving ? "Saving..." : "Save Collection"}
            </SoftButton>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CollectionsPage;
