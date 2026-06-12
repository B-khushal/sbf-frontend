import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { Upload, ArrowLeft, Loader2, X } from 'lucide-react';
import categoryService, { Category } from '@/services/categoryService';
import api from '@/services/api';

const CategoryForm: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const isEditMode = Boolean(id);

  // Loading states
  const [loading, setLoading] = useState(isEditMode);
  const [submitting, setSubmitting] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  // Categories list (for parent selection)
  const [categories, setCategories] = useState<Category[]>([]);

  // Form fields
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [description, setDescription] = useState('');
  const [image, setImage] = useState('');
  const [seoTitle, setSeoTitle] = useState('');
  const [seoDescription, setSeoDescription] = useState('');
  const [status, setStatus] = useState<'active' | 'inactive'>('active');
  const [sortOrder, setSortOrder] = useState<number>(0);
  const [parentId, setParentId] = useState<string>('null');
  const [showInShop, setShowInShop] = useState(true);

  // Load parent categories and category data on edit
  useEffect(() => {
    const loadData = async () => {
      try {
        const allCats = await categoryService.getCategories();
        setCategories(allCats);

        if (isEditMode && id) {
          const cat = await categoryService.getCategoryById(id);
          if (cat) {
            setName(cat.name);
            setSlug(cat.slug);
            setDescription(cat.description || '');
            setImage(cat.image || '');
            setSeoTitle(cat.seoTitle || '');
            setSeoDescription(cat.seoDescription || '');
            setStatus(cat.status);
            setSortOrder(cat.sortOrder);
            setParentId(cat.parentId?._id || cat.parentId || 'null');
            setShowInShop(cat.showInShop !== undefined ? cat.showInShop : true);
          }
        }
      } catch (err) {
        console.error('Error loading category data:', err);
        toast({
          variant: 'destructive',
          title: 'Error',
          description: 'Failed to load category data',
        });
        navigate('/admin/categories');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [id, isEditMode, navigate, toast]);

  // Auto-generate slug from name (only in add mode)
  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setName(value);
    
    if (!isEditMode) {
      const generatedSlug = value
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)+/g, '');
      setSlug(generatedSlug);
    }
  };

  const handleSlugChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSlug(value.toLowerCase().replace(/[^a-z0-9-]+/g, ''));
  };

  // Image upload handler
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('image', file);

    try {
      setIsUploading(true);
      const response = await api.post('/uploads', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        params: { type: 'product' }
      });
      
      setImage(response.data.imageUrl);
      toast({
        title: 'Success',
        description: 'Category image uploaded successfully',
      });
    } catch (err) {
      console.error('Image upload failed:', err);
      toast({
        variant: 'destructive',
        title: 'Upload Failed',
        description: 'Failed to upload image',
      });
    } finally {
      setIsUploading(false);
    }
  };

  // Form Submit handler
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      toast({ variant: 'destructive', title: 'Validation Error', description: 'Category name is required' });
      return;
    }

    if (!slug.trim()) {
      toast({ variant: 'destructive', title: 'Validation Error', description: 'Category slug is required' });
      return;
    }

    const payload: Partial<Category> = {
      name: name.trim(),
      slug: slug.trim(),
      description: description.trim(),
      image,
      seoTitle: seoTitle.trim() || name.trim(),
      seoDescription: seoDescription.trim() || description.trim(),
      status,
      sortOrder,
      parentId: parentId === 'null' ? null : parentId,
      showInShop,
    };

    try {
      setSubmitting(true);
      if (isEditMode && id) {
        await categoryService.updateCategory(id, payload);
        toast({ title: 'Success', description: 'Category updated successfully' });
      } else {
        await categoryService.createCategory(payload);
        toast({ title: 'Success', description: 'Category created successfully' });
      }
      navigate('/admin/categories');
    } catch (err: any) {
      console.error('Error saving category:', err);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: err.response?.data?.message || 'Failed to save category',
      });
    } finally {
      setSubmitting(false);
    }
  };

  // Filter possible parent categories (cannot select itself or subcategories as parent)
  const parentCategories = categories.filter(c => {
    const cid = c._id || c.id;
    return cid !== id && !c.parentId;
  });

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 bg-white rounded-2xl border shadow-sm min-h-[50vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary mb-3" />
        <p className="text-muted-foreground text-sm">Loading category data...</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 max-w-4xl space-y-6">
      {/* Header bar */}
      <div className="flex items-center space-x-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate('/admin/categories')}
          className="rounded-full border border-gray-200"
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            {isEditMode ? 'Edit Category' : 'Create Category'}
          </h1>
          <p className="text-sm text-muted-foreground">
            {isEditMode ? 'Modify category meta info and configurations' : 'Setup a new category for products'}
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card className="shadow-sm border-gray-100">
          <CardHeader>
            <CardTitle>Basic Information</CardTitle>
            <CardDescription>Enter the general details of the category</CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="category-name">Category Name *</Label>
                <Input
                  id="category-name"
                  value={name}
                  onChange={handleNameChange}
                  placeholder="e.g. Roses, Birthday, Baskets"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="category-slug">Category Slug (auto-generated) *</Label>
                <Input
                  id="category-slug"
                  value={slug}
                  onChange={handleSlugChange}
                  placeholder="e.g. roses, birthday, baskets"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="category-description">Description</Label>
              <Textarea
                id="category-description"
                value={description}
                onChange={e => setDescription(e.target.value)}
                placeholder="Brief summary of this category collections..."
                rows={3}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Parent Category Selection */}
              <div className="space-y-2">
                <Label htmlFor="category-parent">Parent Category (leave empty for Primary)</Label>
                <Select value={parentId} onValueChange={setParentId}>
                  <SelectTrigger id="category-parent">
                    <SelectValue placeholder="Parent category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="null">None (Primary Category)</SelectItem>
                    {parentCategories.map(parent => (
                      <SelectItem key={parent._id || parent.id} value={parent._id || parent.id || ''}>
                        {parent.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Status, Display in Shop, & Ordering */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div className="space-y-2">
                  <Label>Status</Label>
                  <div className="flex items-center space-x-2 h-10 border rounded-md px-3 bg-white">
                    <Switch
                      id="category-status"
                      checked={status === 'active'}
                      onCheckedChange={checked => setStatus(checked ? 'active' : 'inactive')}
                    />
                    <Label htmlFor="category-status" className="font-normal cursor-pointer text-xs">
                      {status === 'active' ? 'Active' : 'Inactive'}
                    </Label>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Display in Shop Page</Label>
                  <div className="flex items-center space-x-2 h-10 border rounded-md px-3 bg-white">
                    <Switch
                      id="category-show-in-shop"
                      checked={showInShop}
                      onCheckedChange={setShowInShop}
                    />
                    <Label htmlFor="category-show-in-shop" className="font-normal cursor-pointer text-xs">
                      {showInShop ? 'Show' : 'Hide'}
                    </Label>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="category-order">Sort Order</Label>
                  <Input
                    id="category-order"
                    type="number"
                    value={sortOrder}
                    onChange={e => setSortOrder(Number(e.target.value))}
                    min="0"
                  />
                </div>
              </div>
            </div>

            {/* Image Upload */}
            <div className="space-y-2">
              <Label>Category Image</Label>
              <div className="flex flex-col gap-4 border p-4 rounded-xl bg-gray-50/50">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-lg border bg-white overflow-hidden flex-shrink-0">
                    {image ? (
                      <img src={image} alt="Preview" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-[10px] text-gray-400 font-bold bg-gray-55">
                        Preview
                      </div>
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <Label
                        htmlFor="category-image-file"
                        className="inline-flex h-9 items-center justify-center rounded-md border border-input bg-white px-3 py-2 text-sm font-medium hover:bg-accent cursor-pointer gap-1.5"
                      >
                        <Upload className="h-4 w-4" />
                        {isUploading ? 'Uploading...' : 'Choose Category Image'}
                      </Label>
                      <input
                        id="category-image-file"
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        className="hidden"
                        disabled={isUploading}
                      />
                      {image && (
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => setImage('')}
                          className="h-9 text-red-650 hover:text-red-700 hover:bg-red-50 border-red-200"
                        >
                          <X className="h-4 w-4 mr-1" />
                          Remove
                        </Button>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground mt-1.5">
                      JPEG, PNG or WebP files are supported. Max size 5MB.
                    </p>
                  </div>
                </div>

                <div className="relative flex items-center">
                  <div className="flex-grow border-t border-gray-200"></div>
                  <span className="flex-shrink mx-4 text-gray-400 text-[10px] font-bold uppercase tracking-wider">OR</span>
                  <div className="flex-grow border-t border-gray-200"></div>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="category-image-url" className="text-xs font-semibold text-gray-750">Image URL</Label>
                  <Input
                    id="category-image-url"
                    type="url"
                    value={image}
                    onChange={(e) => setImage(e.target.value)}
                    placeholder="https://example.com/image.jpg"
                    className="bg-white"
                  />
                  <p className="text-[11px] text-muted-foreground">
                    Or paste a direct URL link to an online image.
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* SEO Metas Card */}
        <Card className="shadow-sm border-purple-100 bg-purple-50/10">
          <CardHeader>
            <CardTitle className="text-purple-900 text-lg flex items-center gap-2">
              SEO Meta Settings
            </CardTitle>
            <CardDescription className="text-purple-650">Set search engine details for better organic listings</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="seo-title" className="text-purple-950">SEO Title</Label>
              <Input
                id="seo-title"
                value={seoTitle}
                onChange={e => setSeoTitle(e.target.value)}
                placeholder="Defaults to category name..."
                className="border-purple-100 focus-visible:ring-purple-300"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="seo-desc" className="text-purple-950">SEO Description</Label>
              <Textarea
                id="seo-desc"
                value={seoDescription}
                onChange={e => setSeoDescription(e.target.value)}
                placeholder="Defaults to category description..."
                rows={2}
                className="border-purple-100 focus-visible:ring-purple-300"
              />
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end gap-3 pt-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate('/admin/categories')}
            disabled={submitting}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            className="bg-primary hover:bg-primary/95 text-white"
            disabled={submitting}
          >
            {submitting ? (
              <span className="flex items-center gap-1.5">
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                Saving...
              </span>
            ) : (
              'Save Category'
            )}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default CategoryForm;
