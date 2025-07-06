import React, { useState, useEffect } from 'react';
import { motion, Reorder } from 'framer-motion';
import { Plus, Trash2, Edit2, MoveVertical, Image as ImageIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

type Category = {
  _id: string;
  name: string;
  slug: string;
  description: string;
  order: number;
  isActive: boolean;
  image: string | null;
  parentCategory: string | null;
};

type CategoryFormData = Omit<Category, '_id'>;

const defaultFormData: CategoryFormData = {
  name: '',
  slug: '',
  description: '',
  order: 0,
  isActive: true,
  image: null,
  parentCategory: null,
};

interface CategoryManagerProps {
  categories: Category[];
  onAddCategory: (category: CategoryFormData) => Promise<void>;
  onUpdateCategory: (id: string, category: Partial<CategoryFormData>) => Promise<void>;
  onDeleteCategory: (id: string) => Promise<void>;
  onReorderCategories: (categoryIds: string[]) => Promise<void>;
}

export const CategoryManager: React.FC<CategoryManagerProps> = ({
  categories,
  onAddCategory,
  onUpdateCategory,
  onDeleteCategory,
  onReorderCategories,
}) => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [formData, setFormData] = useState<CategoryFormData>(defaultFormData);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSwitchChange = (checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      isActive: checked,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (editingCategory) {
        await onUpdateCategory(editingCategory._id, formData);
        toast({
          title: 'Category updated',
          description: 'The category has been updated successfully.',
        });
      } else {
        await onAddCategory(formData);
        toast({
          title: 'Category added',
          description: 'The new category has been added successfully.',
        });
      }
      setIsDialogOpen(false);
      setFormData(defaultFormData);
      setEditingCategory(null);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to save category. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = (category: Category) => {
    setEditingCategory(category);
    setFormData({
      name: category.name,
      slug: category.slug,
      description: category.description,
      order: category.order,
      isActive: category.isActive,
      image: category.image,
      parentCategory: category.parentCategory,
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this category?')) return;

    try {
      await onDeleteCategory(id);
      toast({
        title: 'Category deleted',
        description: 'The category has been deleted successfully.',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to delete category. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const handleReorder = async (reorderedCategories: Category[]) => {
    try {
      await onReorderCategories(reorderedCategories.map(cat => cat._id));
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to reorder categories. Please try again.',
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold tracking-tight">Categories</h2>
        <Button onClick={() => {
          setEditingCategory(null);
          setFormData(defaultFormData);
          setIsDialogOpen(true);
        }}>
          <Plus className="h-4 w-4 mr-2" />
          Add Category
        </Button>
      </div>

      <Reorder.Group
        axis="y"
        values={categories}
        onReorder={handleReorder}
        className="space-y-2"
      >
        {categories.map((category) => (
          <Reorder.Item
            key={category._id}
            value={category}
            className={cn(
              "flex items-center justify-between p-4 rounded-lg border bg-card",
              !category.isActive && "opacity-60"
            )}
          >
            <div className="flex items-center gap-4">
              <MoveVertical className="h-5 w-5 text-muted-foreground cursor-move" />
              {category.image && (
                <img
                  src={category.image}
                  alt={category.name}
                  className="h-10 w-10 rounded-md object-cover"
                />
              )}
              {!category.image && (
                <div className="h-10 w-10 rounded-md bg-muted flex items-center justify-center">
                  <ImageIcon className="h-5 w-5 text-muted-foreground" />
                </div>
              )}
              <div>
                <h3 className="font-medium">{category.name}</h3>
                <p className="text-sm text-muted-foreground">{category.description}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => handleEdit(category)}
              >
                <Edit2 className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => handleDelete(category._id)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </Reorder.Item>
        ))}
      </Reorder.Group>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingCategory ? 'Edit Category' : 'Add Category'}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="slug">Slug</Label>
              <Input
                id="slug"
                name="slug"
                value={formData.slug}
                onChange={handleInputChange}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Input
                id="description"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="image">Image URL</Label>
              <Input
                id="image"
                name="image"
                value={formData.image || ''}
                onChange={handleInputChange}
              />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="isActive">Active</Label>
              <Switch
                id="isActive"
                checked={formData.isActive}
                onCheckedChange={handleSwitchChange}
              />
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? 'Saving...' : editingCategory ? 'Update' : 'Add'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CategoryManager; 