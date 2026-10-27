import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  HelpCircle,
  Plus,
  Search,
  Edit2,
  Trash2,
  Eye,
  CheckCircle2,
  XCircle,
  Star,
  RefreshCw,
  FolderPlus,
  ExternalLink,
  SlidersHorizontal,
  ThumbsUp,
  Tag,
  MapPin,
  Laptop,
  Smartphone
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import faqService, { FaqCategory, FaqItem } from '@/services/faqService';

const LOCATION_OPTIONS = [
  { id: 'faq_page', label: 'Dedicated FAQ Page (/faq)' },
  { id: 'home', label: 'Homepage' },
  { id: 'product', label: 'Product Details' },
  { id: 'category', label: 'Bouquet & Flower Category' },
  { id: 'cakes', label: 'Cakes Category' },
  { id: 'combos', label: 'Combos Category' },
  { id: 'contact', label: 'Contact Us Page' },
];

export const FaqManagement: React.FC = () => {
  const { toast } = useToast();

  const [faqs, setFaqs] = useState<FaqItem[]>([]);
  const [categories, setCategories] = useState<FaqCategory[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'published' | 'draft'>('all');
  const [locationFilter, setLocationFilter] = useState('all');

  // Modals
  const [showFaqModal, setShowFaqModal] = useState(false);
  const [editingFaq, setEditingFaq] = useState<FaqItem | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deletingFaq, setDeletingFaq] = useState<FaqItem | null>(null);
  const [showCategoryModal, setShowCategoryModal] = useState(false);

  // Preview device mode in modal
  const [previewDevice, setPreviewDevice] = useState<'desktop' | 'mobile'>('desktop');
  const [activeFormTab, setActiveFormTab] = useState<'edit' | 'preview'>('edit');

  // Form State
  const [formData, setFormData] = useState({
    question: '',
    answer: '',
    categoryId: '',
    keywords: '',
    displayLocations: ['faq_page'],
    isPublished: true,
    isFeatured: false,
    displayOrder: 0,
    slug: '',
    seoTitle: '',
    seoDescription: '',
  });

  // Category Form State
  const [categoryFormData, setCategoryFormData] = useState({
    name: '',
    slug: '',
    description: '',
    icon: 'HelpCircle',
    displayOrder: 0,
  });

  const loadData = async () => {
    try {
      setLoading(true);
      const res = await faqService.getAdminFaqs({
        search: search || undefined,
        categoryId: selectedCategory !== 'all' ? selectedCategory : undefined,
        status: statusFilter,
        location: locationFilter !== 'all' ? locationFilter : undefined,
        limit: 150,
      });

      setFaqs(res.data || []);
      setCategories(res.categories || []);
    } catch (err: any) {
      console.error('Failed to load admin FAQs:', err);
      toast({
        variant: 'destructive',
        title: 'Error loading FAQs',
        description: err.response?.data?.message || err.message,
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [selectedCategory, statusFilter, locationFilter]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    loadData();
  };

  const handleOpenCreateModal = () => {
    setEditingFaq(null);
    setFormData({
      question: '',
      answer: '',
      categoryId: categories[0]?.id || '',
      keywords: '',
      displayLocations: ['faq_page'],
      isPublished: true,
      isFeatured: false,
      displayOrder: faqs.length + 1,
      slug: '',
      seoTitle: '',
      seoDescription: '',
    });
    setActiveFormTab('edit');
    setShowFaqModal(true);
  };

  const handleOpenEditModal = (faq: FaqItem) => {
    setEditingFaq(faq);
    setFormData({
      question: faq.question,
      answer: faq.answer,
      categoryId: faq.categoryId,
      keywords: (faq.keywords || []).join(', '),
      displayLocations: faq.displayLocations || ['faq_page'],
      isPublished: faq.isPublished,
      isFeatured: faq.isFeatured,
      displayOrder: faq.displayOrder,
      slug: faq.slug,
      seoTitle: faq.seoTitle || '',
      seoDescription: faq.seoDescription || '',
    });
    setActiveFormTab('edit');
    setShowFaqModal(true);
  };

  const handleSaveFaq = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.question.trim() || !formData.answer.trim() || !formData.categoryId) {
      toast({
        variant: 'destructive',
        title: 'Validation Error',
        description: 'Question, answer, and category are required.',
      });
      return;
    }

    try {
      const payload: Partial<FaqItem> = {
        question: formData.question.trim(),
        answer: formData.answer.trim(),
        categoryId: formData.categoryId,
        keywords: formData.keywords
          ? formData.keywords.split(',').map((k) => k.trim()).filter(Boolean)
          : [],
        displayLocations: formData.displayLocations,
        isPublished: formData.isPublished,
        isFeatured: formData.isFeatured,
        displayOrder: Number(formData.displayOrder) || 0,
        slug: formData.slug.trim() || undefined,
        seoTitle: formData.seoTitle.trim() || undefined,
        seoDescription: formData.seoDescription.trim() || undefined,
      };

      if (editingFaq) {
        await faqService.updateFaq(editingFaq.id, payload);
        toast({ title: 'FAQ updated successfully!' });
      } else {
        await faqService.createFaq(payload);
        toast({ title: 'FAQ created successfully!' });
      }

      setShowFaqModal(false);
      loadData();
    } catch (err: any) {
      toast({
        variant: 'destructive',
        title: 'Failed to save FAQ',
        description: err.response?.data?.message || err.message,
      });
    }
  };

  const handleTogglePublish = async (faq: FaqItem) => {
    try {
      const updated = await faqService.togglePublish(faq.id);
      setFaqs((prev) =>
        prev.map((f) => (f.id === faq.id ? { ...f, isPublished: updated.isPublished } : f))
      );
      toast({
        title: updated.isPublished ? 'FAQ Published' : 'FAQ Unpublished (Draft)',
      });
    } catch (err: any) {
      toast({
        variant: 'destructive',
        title: 'Failed to toggle status',
        description: err.response?.data?.message || err.message,
      });
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deletingFaq) return;
    try {
      await faqService.deleteFaq(deletingFaq.id);
      toast({ title: 'FAQ deleted successfully' });
      setShowDeleteModal(false);
      setDeletingFaq(null);
      loadData();
    } catch (err: any) {
      toast({
        variant: 'destructive',
        title: 'Failed to delete FAQ',
        description: err.response?.data?.message || err.message,
      });
    }
  };

  const handleCreateCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!categoryFormData.name.trim()) return;

    try {
      await faqService.createCategory(categoryFormData);
      toast({ title: 'Category created successfully!' });
      setShowCategoryModal(false);
      setCategoryFormData({
        name: '',
        slug: '',
        description: '',
        icon: 'HelpCircle',
        displayOrder: 0,
      });
      loadData();
    } catch (err: any) {
      toast({
        variant: 'destructive',
        title: 'Failed to create category',
        description: err.response?.data?.message || err.message,
      });
    }
  };

  // Stats
  const publishedCount = useMemo(() => faqs.filter((f) => f.isPublished).length, [faqs]);
  const draftCount = useMemo(() => faqs.filter((f) => !f.isPublished).length, [faqs]);
  const featuredCount = useMemo(() => faqs.filter((f) => f.isFeatured).length, [faqs]);

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-gray-900 flex items-center gap-2">
            <HelpCircle className="w-8 h-8 text-rose-600" />
            FAQ Management
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Create, categorize, reorder, and manage customer support FAQs across Spring Blossoms Florist.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={() => setShowCategoryModal(true)}
            className="rounded-xl border-gray-300"
          >
            <FolderPlus className="w-4 h-4 mr-2 text-rose-600" />
            New Category
          </Button>

          <Button
            onClick={handleOpenCreateModal}
            className="bg-rose-700 hover:bg-rose-800 text-white rounded-xl shadow-sm"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add New FAQ
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <Card className="rounded-2xl border-gray-200">
          <CardContent className="p-4 sm:p-5">
            <p className="text-xs text-gray-500 font-medium">Total Questions</p>
            <p className="text-2xl sm:text-3xl font-extrabold text-gray-900 mt-1">{faqs.length}</p>
          </CardContent>
        </Card>
        <Card className="rounded-2xl border-gray-200">
          <CardContent className="p-4 sm:p-5">
            <p className="text-xs text-emerald-600 font-medium">Published Live</p>
            <p className="text-2xl sm:text-3xl font-extrabold text-emerald-700 mt-1">{publishedCount}</p>
          </CardContent>
        </Card>
        <Card className="rounded-2xl border-gray-200">
          <CardContent className="p-4 sm:p-5">
            <p className="text-xs text-amber-600 font-medium">Drafts / Inactive</p>
            <p className="text-2xl sm:text-3xl font-extrabold text-amber-700 mt-1">{draftCount}</p>
          </CardContent>
        </Card>
        <Card className="rounded-2xl border-gray-200">
          <CardContent className="p-4 sm:p-5">
            <p className="text-xs text-rose-600 font-medium">Categories</p>
            <p className="text-2xl sm:text-3xl font-extrabold text-rose-700 mt-1">{categories.length}</p>
          </CardContent>
        </Card>
      </div>

      {/* Search & Filters */}
      <Card className="rounded-2xl border-gray-200 shadow-2xs">
        <CardContent className="p-4 sm:p-5 space-y-4">
          <form onSubmit={handleSearchSubmit} className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                type="text"
                placeholder="Search FAQs by question, answer, or keywords..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10 rounded-xl"
              />
            </div>
            <Button type="submit" variant="secondary" className="rounded-xl">
              Search
            </Button>
            {search && (
              <Button
                type="button"
                variant="ghost"
                onClick={() => {
                  setSearch('');
                  loadData();
                }}
                className="rounded-xl"
              >
                Clear
              </Button>
            )}
          </form>

          {/* Filter Bar */}
          <div className="flex flex-wrap items-center gap-3 pt-2 border-t border-gray-100 text-xs sm:text-sm">
            <span className="text-gray-500 font-medium">Filters:</span>

            {/* Category Filter */}
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-48 h-9 rounded-xl text-xs">
                <SelectValue placeholder="All Categories" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories ({faqs.length})</SelectItem>
                {categories.map((c) => (
                  <SelectItem key={c.id} value={c.id}>
                    {c.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Status Filter */}
            <Select value={statusFilter} onValueChange={(val: any) => setStatusFilter(val)}>
              <SelectTrigger className="w-36 h-9 rounded-xl text-xs">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="published">Published Only</SelectItem>
                <SelectItem value="draft">Drafts Only</SelectItem>
              </SelectContent>
            </Select>

            {/* Location Filter */}
            <Select value={locationFilter} onValueChange={setLocationFilter}>
              <SelectTrigger className="w-44 h-9 rounded-xl text-xs">
                <SelectValue placeholder="Display Location" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Locations</SelectItem>
                {LOCATION_OPTIONS.map((loc) => (
                  <SelectItem key={loc.id} value={loc.id}>
                    {loc.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Button
              variant="outline"
              size="sm"
              onClick={loadData}
              className="ml-auto rounded-xl h-9 text-xs"
            >
              <RefreshCw className="w-3.5 h-3.5 mr-1" />
              Refresh
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* FAQs List Table */}
      <Card className="rounded-2xl border-gray-200 overflow-hidden shadow-2xs">
        <CardHeader className="bg-gray-50/50 border-b border-gray-100 py-4 px-6 flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-base font-bold text-gray-900">
              FAQs List ({faqs.length})
            </CardTitle>
            <CardDescription className="text-xs">
              Showing matching questions sorted by display order.
            </CardDescription>
          </div>
          <Link
            to="/faq"
            target="_blank"
            className="text-xs font-semibold text-rose-700 hover:text-rose-800 inline-flex items-center gap-1"
          >
            <span>View Public /faq Page</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </Link>
        </CardHeader>

        <CardContent className="p-0">
          {loading ? (
            <div className="p-8 text-center text-gray-500">Loading FAQs...</div>
          ) : faqs.length === 0 ? (
            <div className="p-12 text-center text-gray-500 space-y-3">
              <HelpCircle className="w-10 h-10 mx-auto text-gray-400" />
              <p className="text-base font-semibold text-gray-700">No questions found</p>
              <p className="text-xs text-gray-500 max-w-sm mx-auto">
                No FAQs match your current search and filter combination. Try adjusting filters or create a new question.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {faqs.map((faq) => (
                <div
                  key={faq.id}
                  className="p-4 sm:p-5 hover:bg-gray-50/70 transition-colors flex flex-col md:flex-row md:items-center justify-between gap-4"
                >
                  <div className="flex-1 space-y-1.5 pr-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge variant="outline" className="text-xs bg-rose-50 text-rose-800 border-rose-200">
                        {faq.category?.name || 'Uncategorized'}
                      </Badge>
                      {faq.isFeatured && (
                        <Badge className="text-xs bg-amber-500 text-white flex items-center gap-1">
                          <Star className="w-3 h-3 fill-current" />
                          Featured
                        </Badge>
                      )}
                      <span className="text-xs text-gray-400">Order: #{faq.displayOrder}</span>
                    </div>

                    <h3 className="text-base font-bold text-gray-900 leading-snug">
                      {faq.question}
                    </h3>

                    <p className="text-xs sm:text-sm text-gray-600 line-clamp-2 leading-relaxed">
                      {faq.answer.replace(/<[^>]+>/g, ' ')}
                    </p>

                    {/* Locations & keywords pills */}
                    <div className="flex flex-wrap items-center gap-1.5 pt-1 text-xs text-gray-500">
                      <span className="font-medium text-gray-400">Locations:</span>
                      {(faq.displayLocations || []).map((loc) => (
                        <span key={loc} className="px-2 py-0.5 rounded bg-gray-100 text-gray-600 text-[11px]">
                          {loc}
                        </span>
                      ))}
                      <span className="text-gray-300 ml-2">|</span>
                      <span className="text-emerald-700 inline-flex items-center gap-1 text-[11px] ml-1">
                        <ThumbsUp className="w-3 h-3" /> {faq.helpfulCount} helpful
                      </span>
                    </div>
                  </div>

                  {/* Actions & Status */}
                  <div className="flex items-center gap-3 shrink-0 self-end md:self-center">
                    <div className="flex items-center gap-2">
                      <Switch
                        checked={faq.isPublished}
                        onCheckedChange={() => handleTogglePublish(faq)}
                        aria-label="Toggle publish"
                      />
                      <span className={`text-xs font-medium ${faq.isPublished ? 'text-emerald-700' : 'text-gray-400'}`}>
                        {faq.isPublished ? 'Published' : 'Draft'}
                      </span>
                    </div>

                    <div className="flex items-center gap-1 pl-2 border-l border-gray-200">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleOpenEditModal(faq)}
                        className="h-8 w-8 p-0 text-gray-600 hover:text-rose-700"
                        title="Edit FAQ"
                      >
                        <Edit2 className="w-4 h-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => {
                          setDeletingFaq(faq);
                          setShowDeleteModal(true);
                        }}
                        className="h-8 w-8 p-0 text-gray-600 hover:text-red-700"
                        title="Delete FAQ"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* CREATE / EDIT FAQ MODAL */}
      <Dialog open={showFaqModal} onOpenChange={setShowFaqModal}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto rounded-3xl">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold">
              {editingFaq ? 'Edit Frequently Asked Question' : 'Create New FAQ'}
            </DialogTitle>
            <DialogDescription>
              Configure question, answer, category placement, and SEO attributes.
            </DialogDescription>
          </DialogHeader>

          <Tabs value={activeFormTab} onValueChange={(v: any) => setActiveFormTab(v)} className="w-full">
            <TabsList className="grid grid-cols-2 mb-4">
              <TabsTrigger value="edit">Editor &amp; Settings</TabsTrigger>
              <TabsTrigger value="preview">Live Preview</TabsTrigger>
            </TabsList>

            <TabsContent value="edit">
              <form onSubmit={handleSaveFaq} className="space-y-4">
                {/* Question */}
                <div className="space-y-1.5">
                  <Label htmlFor="question" className="text-sm font-semibold">
                    Question <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="question"
                    value={formData.question}
                    onChange={(e) => setFormData({ ...formData, question: e.target.value })}
                    placeholder="e.g. Do you deliver flowers in Secunderabad?"
                    required
                    className="rounded-xl"
                  />
                </div>

                {/* Category & Display Order */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="category" className="text-sm font-semibold">
                      Category <span className="text-red-500">*</span>
                    </Label>
                    <Select
                      value={formData.categoryId}
                      onValueChange={(val) => setFormData({ ...formData, categoryId: val })}
                    >
                      <SelectTrigger id="category" className="rounded-xl">
                        <SelectValue placeholder="Select Category" />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map((c) => (
                          <SelectItem key={c.id} value={c.id}>
                            {c.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="displayOrder" className="text-sm font-semibold">
                      Sort Display Order
                    </Label>
                    <Input
                      id="displayOrder"
                      type="number"
                      value={formData.displayOrder}
                      onChange={(e) => setFormData({ ...formData, displayOrder: parseInt(e.target.value, 10) || 0 })}
                      className="rounded-xl"
                    />
                  </div>
                </div>

                {/* Answer with HTML formatting support */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="answer" className="text-sm font-semibold">
                      Answer <span className="text-red-500">*</span>
                    </Label>
                    <span className="text-xs text-gray-400">Supports basic HTML (e.g. &lt;strong&gt;, &lt;br/&gt;)</span>
                  </div>
                  <Textarea
                    id="answer"
                    rows={6}
                    value={formData.answer}
                    onChange={(e) => setFormData({ ...formData, answer: e.target.value })}
                    placeholder="Write a clear, customer-friendly answer matching Spring Blossoms Florist policies..."
                    required
                    className="rounded-xl font-mono text-sm leading-relaxed"
                  />
                </div>

                {/* Display Locations Checkboxes */}
                <div className="space-y-2 pt-2 border-t border-gray-100">
                  <Label className="text-sm font-semibold">Display Locations</Label>
                  <p className="text-xs text-gray-500">
                    Choose which contextual sections across the site this question should appear in:
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                    {LOCATION_OPTIONS.map((loc) => {
                      const checked = formData.displayLocations.includes(loc.id);
                      return (
                        <label
                          key={loc.id}
                          className="flex items-center gap-2 p-2 rounded-lg border border-gray-100 hover:bg-gray-50 cursor-pointer text-xs"
                        >
                          <Checkbox
                            checked={checked}
                            onCheckedChange={(val) => {
                              const next = val
                                ? [...formData.displayLocations, loc.id]
                                : formData.displayLocations.filter((id) => id !== loc.id);
                              setFormData({ ...formData, displayLocations: next });
                            }}
                          />
                          <span>{loc.label}</span>
                        </label>
                      );
                    })}
                  </div>
                </div>

                {/* Keywords */}
                <div className="space-y-1.5">
                  <Label htmlFor="keywords" className="text-sm font-semibold">
                    Search Keywords &amp; Synonyms
                  </Label>
                  <Input
                    id="keywords"
                    value={formData.keywords}
                    onChange={(e) => setFormData({ ...formData, keywords: e.target.value })}
                    placeholder="e.g. delivery fee, secunderabad, charges, shipping cost"
                    className="rounded-xl"
                  />
                  <p className="text-xs text-gray-400">Separate keywords with commas</p>
                </div>

                {/* Toggles */}
                <div className="flex flex-wrap items-center gap-6 pt-2">
                  <label className="flex items-center gap-2 cursor-pointer text-sm">
                    <Switch
                      checked={formData.isPublished}
                      onCheckedChange={(val) => setFormData({ ...formData, isPublished: val })}
                    />
                    <span className="font-medium text-gray-800">Publish Immediately</span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer text-sm">
                    <Switch
                      checked={formData.isFeatured}
                      onCheckedChange={(val) => setFormData({ ...formData, isFeatured: val })}
                    />
                    <span className="font-medium text-gray-800">Feature on Homepage FAQ</span>
                  </label>
                </div>

                <DialogFooter className="pt-4 border-t border-gray-100">
                  <Button type="button" variant="outline" onClick={() => setShowFaqModal(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" className="bg-rose-700 hover:bg-rose-800 text-white">
                    {editingFaq ? 'Save Changes' : 'Create FAQ'}
                  </Button>
                </DialogFooter>
              </form>
            </TabsContent>

            {/* PREVIEW TAB */}
            <TabsContent value="preview" className="space-y-4">
              <div className="flex items-center justify-between bg-gray-100 p-2 rounded-xl text-xs">
                <span className="text-gray-600 font-medium">Device Preview:</span>
                <div className="flex items-center gap-1">
                  <Button
                    size="sm"
                    variant={previewDevice === 'desktop' ? 'default' : 'ghost'}
                    onClick={() => setPreviewDevice('desktop')}
                    className="h-7 text-xs"
                  >
                    <Laptop className="w-3.5 h-3.5 mr-1" /> Desktop
                  </Button>
                  <Button
                    size="sm"
                    variant={previewDevice === 'mobile' ? 'default' : 'ghost'}
                    onClick={() => setPreviewDevice('mobile')}
                    className="h-7 text-xs"
                  >
                    <Smartphone className="w-3.5 h-3.5 mr-1" /> Mobile
                  </Button>
                </div>
              </div>

              <div className={`mx-auto transition-all ${previewDevice === 'mobile' ? 'max-w-sm' : 'w-full'}`}>
                <div className="bg-white p-5 rounded-2xl border border-rose-200 shadow-md">
                  <span className="text-[11px] font-semibold uppercase tracking-wider text-rose-700 bg-rose-50 px-2 py-0.5 rounded-md">
                    {categories.find((c) => c.id === formData.categoryId)?.name || 'Category'}
                  </span>
                  <h3 className="text-base sm:text-lg font-bold text-gray-900 mt-2 mb-3">
                    {formData.question || 'Your question will appear here'}
                  </h3>
                  <div
                    className="prose prose-sm text-gray-700 text-sm leading-relaxed border-t border-gray-50 pt-3"
                    dangerouslySetInnerHTML={{
                      __html: formData.answer || '<p>Your answer preview will appear here.</p>',
                    }}
                  />
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </DialogContent>
      </Dialog>

      {/* CREATE CATEGORY MODAL */}
      <Dialog open={showCategoryModal} onOpenChange={setShowCategoryModal}>
        <DialogContent className="max-w-md rounded-3xl">
          <DialogHeader>
            <DialogTitle>Add New FAQ Category</DialogTitle>
            <DialogDescription>
              Categories group questions on the /faq page and within the admin console.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleCreateCategory} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="catName">Category Name *</Label>
              <Input
                id="catName"
                value={categoryFormData.name}
                onChange={(e) => setCategoryFormData({ ...categoryFormData, name: e.target.value })}
                placeholder="e.g. Wedding & Corporate Orders"
                required
                className="rounded-xl"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="catDesc">Description</Label>
              <Input
                id="catDesc"
                value={categoryFormData.description}
                onChange={(e) => setCategoryFormData({ ...categoryFormData, description: e.target.value })}
                placeholder="Short summary for customer guidance"
                className="rounded-xl"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="catIcon">Icon Name</Label>
              <Input
                id="catIcon"
                value={categoryFormData.icon}
                onChange={(e) => setCategoryFormData({ ...categoryFormData, icon: e.target.value })}
                placeholder="e.g. Gift, Truck, ShoppingBag, Heart"
                className="rounded-xl"
              />
            </div>

            <DialogFooter className="pt-2">
              <Button type="button" variant="outline" onClick={() => setShowCategoryModal(false)}>
                Cancel
              </Button>
              <Button type="submit" className="bg-rose-700 hover:bg-rose-800 text-white">
                Create Category
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* DELETE CONFIRMATION MODAL */}
      <Dialog open={showDeleteModal} onOpenChange={setShowDeleteModal}>
        <DialogContent className="max-w-md rounded-2xl">
          <DialogHeader>
            <DialogTitle className="text-red-700">Delete FAQ?</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this question? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>

          {deletingFaq && (
            <p className="font-semibold text-gray-800 text-sm bg-gray-50 p-3 rounded-xl">
              &ldquo;{deletingFaq.question}&rdquo;
            </p>
          )}

          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setShowDeleteModal(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeleteConfirm}>
              Delete Question
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default FaqManagement;
