import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { Upload, ArrowLeft, Loader2, X, FolderTree, Sparkles } from 'lucide-react';
import categoryService, { Category } from '@/services/categoryService';
import api from '@/services/api';
import { PageHeader } from '@/components/dashboard/PageHeader';
import { SoftButton } from '@/components/dashboard/SoftButton';

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
            let parentIdVal = 'null';
            if (typeof cat.parentId === 'string' && cat.parentId.trim()) {
              parentIdVal = cat.parentId.trim();
            } else if (cat.parentId && typeof cat.parentId === 'object') {
              parentIdVal = (cat.parentId as any)._id || (cat.parentId as any).id || 'null';
            }
            setParentId(parentIdVal);
            setShowInShop(
              cat.showInShop !== undefined
                ? Boolean(cat.showInShop)
                : cat.isFeatured !== undefined
                ? Boolean(cat.isFeatured)
                : true
            );
          }
        }
      } catch (err) {
        console.error('Error loading category data:', err);
        toast({
          variant: 'destructive',
          title: 'Error',
          description: 'Failed to load category information',
        });
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [id, isEditMode]);

  // Handle Name Input -> Auto Generate Slug
  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newName = e.target.value;
    setName(newName);
    if (!isEditMode) {
      setSlug(
        newName
          .toLowerCase()
          .trim()
          .replace(/[^\w\s-]/g, '')
          .replace(/[\s_-]+/g, '-')
          .replace(/^-+|-+$/g, '')
      );
    }
  };

  const handleSlugChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSlug(
      e.target.value
        .toLowerCase()
        .replace(/[^\w\s-]/g, '')
        .replace(/[\s_-]+/g, '-')
    );
  };

  // Image Upload handler via SBF api
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast({
        variant: 'destructive',
        title: 'Invalid File',
        description: 'Please upload an image file (JPEG, PNG, WebP)',
      });
      return;
    }

    try {
      setIsUploading(true);
      const formData = new FormData();
      formData.append('image', file);

      const res = await api.post('/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      if (res.data?.url || res.data?.imageUrl) {
        setImage(res.data.url || res.data.imageUrl);
        toast({
          title: 'Success',
          description: 'Image uploaded successfully',
        });
      }
    } catch (err: any) {
      console.error('Upload error:', err);
      toast({
        variant: 'destructive',
        title: 'Upload Failed',
        description: err.response?.data?.message || 'Failed to upload image',
      });
    } finally {
      setIsUploading(false);
    }
  };

  // Form Submit handler
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      toast({
        variant: 'destructive',
        title: 'Validation Error',
        description: 'Category name is required',
      });
      return;
    }

    if (!slug.trim()) {
      toast({
        variant: 'destructive',
        title: 'Validation Error',
        description: 'Category slug is required',
      });
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
        toast({
          title: 'Success',
          description: 'Category updated successfully',
        });
      } else {
        await categoryService.createCategory(payload);
        toast({
          title: 'Success',
          description: 'Category created successfully',
        });
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

  const parentCategories = categories.filter((c) => {
    const cid = c._id || c.id;
    return cid !== id && !c.parentId;
  });

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 rounded-2xl border border-white/80 shadow-[6px_6px_18px_rgba(163,177,198,0.22)] bg-[#f4f7fb] min-h-[50vh]">
        <Loader2 className="h-8 w-8 animate-spin text-rose-600 mb-3" />
        <p className="text-muted-foreground text-sm font-medium">
          Loading category data...
        </p>
      </div>
    );
  }

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6">
      {/* Neumorphic Header */}
      <PageHeader
        breadcrumbs={[
          { label: 'Admin', href: '/admin' },
          { label: 'Categories', href: '/admin/categories' },
          { label: isEditMode ? `Edit ${name}` : 'New Category' },
        ]}
        title={isEditMode ? `Edit Category: ${name}` : 'Create New Category'}
        description={
          isEditMode
            ? 'Modify taxonomy hierarchy, parent links, SEO routes, and storefront visibility.'
            : 'Configure a new product classification node for florist catalog navigation.'
        }
        actions={
          <SoftButton
            variant="default"
            size="sm"
            icon={ArrowLeft}
            onClick={() => navigate('/admin/categories')}
          >
            Back to Categories
          </SoftButton>
        }
      />

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Information Card */}
        <div className="sbf-card rounded-2xl border border-white/80 dark:border-slate-800 shadow-[6px_6px_18px_rgba(163,177,198,0.22),-6px_-6px_18px_rgba(255,255,255,0.8)] bg-[#f4f7fb] dark:bg-slate-900 p-6 space-y-5">
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <FolderTree className="h-4 w-4 text-rose-500" /> Basic Information
            </h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              Enter primary classification details and permalink slug.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                Category Name *
              </Label>
              <input
                type="text"
                value={name}
                onChange={handleNameChange}
                placeholder="e.g. Roses, Birthday, Baskets"
                required
                className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200/70 dark:border-slate-800 bg-[#edf1f7] dark:bg-slate-950 text-slate-800 dark:text-slate-100 shadow-[inset_2px_2px_4px_rgba(163,177,198,0.25),inset_-2px_-2px_4px_rgba(255,255,255,0.8)] focus:outline-none focus:ring-1 focus:ring-rose-500"
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                Category Slug *
              </Label>
              <input
                type="text"
                value={slug}
                onChange={handleSlugChange}
                placeholder="e.g. roses, birthday, baskets"
                required
                className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200/70 dark:border-slate-800 bg-[#edf1f7] dark:bg-slate-950 text-slate-800 dark:text-slate-100 font-mono shadow-[inset_2px_2px_4px_rgba(163,177,198,0.25),inset_-2px_-2px_4px_rgba(255,255,255,0.8)] focus:outline-none focus:ring-1 focus:ring-rose-500"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
              Description
            </Label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Brief summary of this category collection for shoppers..."
              className="w-full p-3 text-xs rounded-xl border border-slate-200/70 dark:border-slate-800 bg-[#edf1f7] dark:bg-slate-950 text-slate-800 dark:text-slate-100 shadow-[inset_2px_2px_4px_rgba(163,177,198,0.25),inset_-2px_-2px_4px_rgba(255,255,255,0.8)] focus:outline-none focus:ring-1 focus:ring-rose-500"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
            {/* Parent Category Selection */}
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                Parent Category (Optional)
              </Label>
              <Select value={parentId} onValueChange={setParentId}>
                <SelectTrigger className="h-9 text-xs rounded-xl bg-[#edf1f7] dark:bg-slate-950 border-slate-200/70 dark:border-slate-800 shadow-[inset_2px_2px_4px_rgba(163,177,198,0.2),inset_-2px_-2px_4px_rgba(255,255,255,0.8)]">
                  <SelectValue placeholder="Parent category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="null">None (Primary Category)</SelectItem>
                  {parentCategories.map((parent) => (
                    <SelectItem
                      key={parent._id || parent.id}
                      value={parent._id || parent.id || ''}
                    >
                      {parent.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Status, Display in Shop, & Ordering */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Status
                </Label>
                <div className="flex items-center space-x-2 h-9 border border-slate-200/70 dark:border-slate-800 rounded-xl px-3 bg-[#edf1f7] dark:bg-slate-950 shadow-[inset_1px_1px_3px_rgba(163,177,198,0.2)]">
                  <Switch
                    checked={status === 'active'}
                    onCheckedChange={(checked) =>
                      setStatus(checked ? 'active' : 'inactive')
                    }
                  />
                  <span className="text-xs font-medium text-slate-700 dark:text-slate-300">
                    {status === 'active' ? 'Active' : 'Inactive'}
                  </span>
                </div>
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  In Shop
                </Label>
                <div className="flex items-center space-x-2 h-9 border border-slate-200/70 dark:border-slate-800 rounded-xl px-3 bg-[#edf1f7] dark:bg-slate-950 shadow-[inset_1px_1px_3px_rgba(163,177,198,0.2)]">
                  <Switch
                    checked={showInShop}
                    onCheckedChange={setShowInShop}
                  />
                  <span className="text-xs font-medium text-slate-700 dark:text-slate-300">
                    {showInShop ? 'Show' : 'Hide'}
                  </span>
                </div>
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Sort Order
                </Label>
                <input
                  type="number"
                  value={sortOrder}
                  onChange={(e) => setSortOrder(Number(e.target.value))}
                  min="0"
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200/70 dark:border-slate-800 bg-[#edf1f7] dark:bg-slate-950 text-slate-800 dark:text-slate-100 shadow-[inset_2px_2px_4px_rgba(163,177,198,0.25),inset_-2px_-2px_4px_rgba(255,255,255,0.8)] focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* Image Upload Area */}
          <div className="space-y-2 pt-2 border-t border-slate-200/60 dark:border-slate-800">
            <Label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
              Category Image
            </Label>
            <div className="p-4 rounded-xl border border-white/80 dark:border-slate-800 bg-[#edf1f7] dark:bg-slate-950 shadow-[inset_2px_2px_5px_rgba(163,177,198,0.2),inset_-2px_-2px_5px_rgba(255,255,255,0.8)] space-y-3">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-xl border border-white bg-white overflow-hidden shadow-xs flex-shrink-0 flex items-center justify-center">
                  {image ? (
                    <img
                      src={image}
                      alt="Preview"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="text-[10px] text-slate-400 font-bold">
                      No Image
                    </span>
                  )}
                </div>
                <div className="flex-1 space-y-1">
                  <div className="flex items-center gap-2">
                    <label
                      htmlFor="category-image-file"
                      className="inline-flex h-8 items-center justify-center rounded-xl border border-slate-200/70 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 shadow-sm hover:bg-slate-50 cursor-pointer gap-1.5 transition-all"
                    >
                      <Upload className="h-3.5 w-3.5 text-rose-500" />
                      {isUploading ? 'Uploading...' : 'Upload Image'}
                    </label>
                    <input
                      id="category-image-file"
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                      disabled={isUploading}
                    />
                    {image && (
                      <SoftButton
                        type="button"
                        variant="danger"
                        size="sm"
                        icon={X}
                        onClick={() => setImage('')}
                      >
                        Remove
                      </SoftButton>
                    )}
                  </div>
                  <p className="text-[11px] text-muted-foreground">
                    JPEG, PNG or WebP supported. Max size 5MB.
                  </p>
                </div>
              </div>

              <div className="space-y-1">
                <Label className="text-[11px] font-semibold text-slate-600 dark:text-slate-400">
                  Or Direct Image URL
                </Label>
                <input
                  type="url"
                  value={image}
                  onChange={(e) => setImage(e.target.value)}
                  placeholder="https://res.cloudinary.com/..."
                  className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-200/70 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 shadow-[inset_1px_1px_3px_rgba(0,0,0,0.06)] focus:outline-none"
                />
              </div>
            </div>
          </div>
        </div>

        {/* SEO Meta Settings Card */}
        <div className="sbf-card rounded-2xl border border-white/80 dark:border-slate-800 shadow-[6px_6px_18px_rgba(163,177,198,0.22),-6px_-6px_18px_rgba(255,255,255,0.8)] bg-[#f4f7fb] dark:bg-slate-900 p-6 space-y-4">
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-purple-500" /> Search Engine Optimization (SEO)
            </h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              Customize title tags and meta descriptions for search engine indexation.
            </p>
          </div>

          <div className="space-y-3.5">
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                SEO Title
              </Label>
              <input
                type="text"
                value={seoTitle}
                onChange={(e) => setSeoTitle(e.target.value)}
                placeholder="Defaults to category name..."
                className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200/70 dark:border-slate-800 bg-[#edf1f7] dark:bg-slate-950 text-slate-800 dark:text-slate-100 shadow-[inset_2px_2px_4px_rgba(163,177,198,0.25),inset_-2px_-2px_4px_rgba(255,255,255,0.8)] focus:outline-none focus:ring-1 focus:ring-purple-500"
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                SEO Description
              </Label>
              <textarea
                rows={2}
                value={seoDescription}
                onChange={(e) => setSeoDescription(e.target.value)}
                placeholder="Defaults to category description..."
                className="w-full p-3 text-xs rounded-xl border border-slate-200/70 dark:border-slate-800 bg-[#edf1f7] dark:bg-slate-950 text-slate-800 dark:text-slate-100 shadow-[inset_2px_2px_4px_rgba(163,177,198,0.25),inset_-2px_-2px_4px_rgba(255,255,255,0.8)] focus:outline-none focus:ring-1 focus:ring-purple-500"
              />
            </div>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex justify-end gap-3 pt-2">
          <SoftButton
            type="button"
            variant="default"
            size="md"
            onClick={() => navigate('/admin/categories')}
            disabled={submitting}
          >
            Cancel
          </SoftButton>
          <SoftButton
            type="submit"
            variant="primary"
            size="md"
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
          </SoftButton>
        </div>
      </form>
    </div>
  );
};

export default CategoryForm;
