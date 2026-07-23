import React, { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import collectionService, { CollectionData } from "@/services/collectionService";
import { Layers, Plus, Edit, Trash2, RefreshCw, Eye, EyeOff } from "lucide-react";

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
      return toast({ variant: "destructive", title: "Validation Error", description: "Collection name required." });
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
        toast({ title: "Collection Updated", description: `${name} updated successfully.` });
      } else {
        await collectionService.createCollection({
          name,
          description,
          bannerImage,
          displayPriority,
        });
        toast({ title: "Collection Created", description: `${name} created successfully.` });
      }
      setDialogOpen(false);
      fetchCollections();
    } catch (error: any) {
      toast({ variant: "destructive", title: "Save Failed", description: error.message });
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteCollection = async (id: string, nameStr: string) => {
    if (!window.confirm(`Are you sure you want to delete collection "${nameStr}"?`)) return;
    try {
      await collectionService.deleteCollection(id);
      toast({ title: "Collection Removed", description: `${nameStr} has been deleted.` });
      fetchCollections();
    } catch (error: any) {
      toast({ variant: "destructive", title: "Delete Failed", description: error.message });
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-cyan-100 dark:bg-cyan-950/40 rounded-xl text-cyan-600">
            <Layers className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
              Product Collections Curations
            </h1>
            <p className="text-xs text-muted-foreground">
              Group products into curated marketing collections (Trending, Best Sellers, Luxury, Festival Specials).
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={fetchCollections} className="text-xs gap-1.5">
            <RefreshCw className="h-3.5 w-3.5" /> Refresh
          </Button>
          <Button
            size="sm"
            onClick={() => handleOpenModal()}
            className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs gap-1.5"
          >
            <Plus className="h-3.5 w-3.5" /> Create Collection
          </Button>
        </div>
      </div>

      {/* Collections List Table */}
      <Card className="border-slate-200/80 dark:border-slate-800 shadow-sm overflow-hidden">
        <Table>
          <TableHeader className="bg-slate-50 dark:bg-slate-800/50">
            <TableRow>
              <TableHead className="min-w-[180px]">Collection Name</TableHead>
              <TableHead>Slug</TableHead>
              <TableHead>Display Priority</TableHead>
              <TableHead>Visibility</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8 text-xs text-slate-500">
                  Loading collections...
                </TableCell>
              </TableRow>
            ) : collections.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8 text-xs text-slate-500">
                  No custom collections created yet. Click "Create Collection" to get started.
                </TableCell>
              </TableRow>
            ) : collections.map(col => (
              <TableRow key={col._id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                <TableCell>
                  <div className="flex items-center gap-2.5">
                    {col.bannerImage ? (
                      <img src={col.bannerImage} alt={col.name} className="w-8 h-8 object-cover rounded" />
                    ) : (
                      <div className="w-8 h-8 bg-slate-100 dark:bg-slate-800 rounded flex items-center justify-center text-slate-400">
                        <Layers className="h-4 w-4" />
                      </div>
                    )}
                    <div>
                      <p className="font-semibold text-xs text-slate-900 dark:text-slate-100">{col.name}</p>
                      <p className="text-[11px] text-muted-foreground line-clamp-1">{col.description || "No description"}</p>
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <code className="text-[11px] bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded text-slate-700 dark:text-slate-300">
                    {col.slug}
                  </code>
                </TableCell>
                <TableCell>
                  <Badge variant="outline" className="text-[10px]">Priority: {col.displayPriority || 0}</Badge>
                </TableCell>
                <TableCell>
                  <Badge className="bg-emerald-600 text-white text-[10px]">Published</Badge>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-1">
                    <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => handleOpenModal(col)}>
                      <Edit className="h-3.5 w-3.5" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-7 w-7 text-rose-500" onClick={() => handleDeleteCollection(col._id!, col.name)}>
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>

      {/* Collection Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-base">{editingCollection ? "Edit Collection" : "Create New Collection"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-3 py-2 text-xs">
            <div>
              <Label className="text-xs">Collection Title *</Label>
              <Input
                placeholder="e.g. Best Sellers 2026"
                value={name}
                onChange={e => setName(e.target.value)}
                className="h-8 text-xs mt-1"
              />
            </div>
            <div>
              <Label className="text-xs">Description</Label>
              <Textarea
                placeholder="Short curation summary..."
                value={description}
                onChange={e => setDescription(e.target.value)}
                className="text-xs mt-1"
              />
            </div>
            <div>
              <Label className="text-xs">Banner Image URL</Label>
              <Input
                placeholder="https://res.cloudinary.com/..."
                value={bannerImage}
                onChange={e => setBannerImage(e.target.value)}
                className="h-8 text-xs mt-1"
              />
            </div>
            <div>
              <Label className="text-xs">Display Priority (Order)</Label>
              <Input
                type="number"
                value={displayPriority}
                onChange={e => setDisplayPriority(Number(e.target.value))}
                className="h-8 text-xs mt-1"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" size="sm" onClick={() => setDialogOpen(false)} className="text-xs">
              Cancel
            </Button>
            <Button size="sm" onClick={handleSaveCollection} disabled={saving} className="bg-emerald-600 text-white text-xs">
              {saving ? "Saving..." : "Save Collection"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CollectionsPage;
