import React, { useState, useEffect } from 'react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import { Switch } from '../ui/switch';
import { Card } from '../ui/card';
import { Plus, Trash2, ChevronDown, ChevronUp, Edit2, Save, X } from 'lucide-react';
import { toast } from 'sonner';
import { getCategories, updateCategories, addCategory, updateCategory, deleteCategory } from '@/services/api';

interface Category {
  _id?: string;
  name: string;
  slug: string;
  description?: string;
  order: number;
  isActive: boolean;
  parentCategory?: string;
  image?: string;
  subcategories?: Category[];
}

interface SortableItemProps {
  category: Category;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
  onToggleExpand: (id: string) => void;
  onToggleActive: (id: string, active: boolean) => void;
  onUpdate: (id: string, updates: Partial<Category>) => void;
  onAddSubcategory: (id: string) => void;
  isExpanded: boolean;
  isEditing: boolean;
}

const SortableItem: React.FC<SortableItemProps> = ({
  category,
  onEdit,
  onDelete,
  onToggleExpand,
  onToggleActive,
  onUpdate,
  onAddSubcategory,
  isExpanded,
  isEditing
}) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({ id: category._id || '' });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div ref={setNodeRef} style={style} {...attributes}>
      <Card className="p-4 mb-2">
        <div className="flex items-center justify-between" {...listeners}>
          {isEditing ? (
            <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                value={category.name}
                onChange={(e) => onUpdate(category._id!, { name: e.target.value })}
                placeholder="Category Name"
              />
              <Input
                value={category.slug}
                onChange={(e) => onUpdate(category._id!, { slug: e.target.value })}
                placeholder="Slug"
              />
              <div className="md:col-span-2">
                <Textarea
                  value={category.description}
                  onChange={(e) => onUpdate(category._id!, { description: e.target.value })}
                  placeholder="Description"
                />
              </div>
            </div>
          ) : (
            <div className="flex-1">
              <h4 className="font-semibold">{category.name}</h4>
              <p className="text-sm text-gray-500">{category.slug}</p>
              {category.description && (
                <p className="text-sm text-gray-600 mt-1">{category.description}</p>
              )}
            </div>
          )}
          <div className="flex items-center space-x-2">
            <Switch
              checked={category.isActive}
              onCheckedChange={(checked) => onToggleActive(category._id!, checked)}
            />
            {isEditing ? (
              <>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => onEdit(category._id!)}
                >
                  <Save className="w-4 h-4" />
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => onEdit(category._id!)}
                >
                  <X className="w-4 h-4" />
                </Button>
              </>
            ) : (
              <Button
                variant="outline"
                size="icon"
                onClick={() => onEdit(category._id!)}
              >
                <Edit2 className="w-4 h-4" />
              </Button>
            )}
            <Button
              variant="outline"
              size="icon"
              onClick={() => onToggleExpand(category._id!)}
            >
              {isExpanded ? (
                <ChevronUp className="w-4 h-4" />
              ) : (
                <ChevronDown className="w-4 h-4" />
              )}
            </Button>
            <Button
              variant="destructive"
              size="icon"
              onClick={() => onDelete(category._id!)}
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {isExpanded && (
          <div className="mt-4 pl-6 border-l-2 border-gray-200">
            <div className="mb-4">
              <Button
                variant="outline"
                size="sm"
                onClick={() => onAddSubcategory(category._id!)}
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Subcategory
              </Button>
            </div>
            {category.subcategories?.map((subcategory, index) => (
              <Card key={subcategory._id || index} className="p-4 mb-2">
                <div className="flex items-center justify-between">
                  <div>
                    <h5 className="font-medium">{subcategory.name}</h5>
                    <p className="text-sm text-gray-500">{subcategory.slug}</p>
                    {subcategory.description && (
                      <p className="text-sm text-gray-600 mt-1">{subcategory.description}</p>
                    )}
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch
                      checked={subcategory.isActive}
                      onCheckedChange={(checked) =>
                        onToggleActive(subcategory._id!, checked)
                      }
                    />
                    <Button
                      variant="destructive"
                      size="icon"
                      onClick={() => onDelete(subcategory._id!)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
};

export const CategoryManager: React.FC = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [editingCategory, setEditingCategory] = useState<string | null>(null);
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());
  const [newCategory, setNewCategory] = useState<Partial<Category>>({
    name: '',
    slug: '',
    description: '',
    isActive: true,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await getCategories();
      setCategories(response);
    } catch (error) {
      console.error('Error fetching categories:', error);
      setError('Failed to load categories');
      toast.error('Failed to load categories');
    } finally {
      setLoading(false);
    }
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    
    if (!over || active.id === over.id) {
      return;
    }

    const oldIndex = categories.findIndex(cat => cat._id === active.id);
    const newIndex = categories.findIndex(cat => cat._id === over.id);

    const updatedCategories = arrayMove(categories, oldIndex, newIndex).map(
      (cat, index) => ({ ...cat, order: index })
    );

    setCategories(updatedCategories);
    try {
      await updateCategories(updatedCategories);
    } catch (error) {
      // Revert on error
      setCategories(categories);
      toast.error('Failed to reorder categories');
    }
  };

  const handleAddCategory = async () => {
    if (!newCategory.name || !newCategory.slug) {
      toast.error('Name and slug are required');
      return;
    }

    const slugExists = categories.some(cat => cat.slug === newCategory.slug);
    if (slugExists) {
      toast.error('Slug must be unique');
      return;
    }

    try {
      setIsSubmitting(true);
      const response = await addCategory(newCategory);
      setCategories([...categories, response.data]);
      setNewCategory({ name: '', slug: '', description: '', isActive: true });
      toast.success('Category added successfully');
    } catch (error) {
      console.error('Error adding category:', error);
      toast.error('Failed to add category');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateCategory = async (id: string, updates: Partial<Category>) => {
    try {
      setIsSubmitting(true);
      const response = await updateCategory(id, updates);
      setCategories(categories.map(cat => 
        cat._id === id ? response.data : cat
      ));
      toast.success('Category updated successfully');
    } catch (error) {
      console.error('Error updating category:', error);
      toast.error('Failed to update category');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteCategory = async (id: string) => {
    const categoryToDelete = categories.find(cat => cat._id === id);
    if (!categoryToDelete) return;

    const hasSubcategories = categoryToDelete.subcategories?.length > 0;
    if (hasSubcategories) {
      toast.error('Cannot delete category with subcategories');
      return;
    }

    try {
      setIsSubmitting(true);
      await deleteCategory(id);
      setCategories(categories.filter(cat => cat._id !== id));
      toast.success('Category deleted successfully');
    } catch (error) {
      console.error('Error deleting category:', error);
      toast.error('Failed to delete category');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAddSubcategory = async (parentId: string) => {
    const parentCategory = categories.find(cat => cat._id === parentId);
    if (!parentCategory) return;

    const newSubcategory: Category = {
      name: 'New Subcategory',
      slug: 'new-subcategory-' + Date.now(),
      order: parentCategory.subcategories?.length || 0,
      isActive: true,
      parentCategory: parentId,
    };

    try {
      setIsSubmitting(true);
      const response = await addCategory(newSubcategory);
      setCategories(categories.map(cat => {
        if (cat._id === parentId) {
          return {
            ...cat,
            subcategories: [...(cat.subcategories || []), response.data],
          };
        }
        return cat;
      }));
      setExpandedCategories(new Set([...expandedCategories, parentId]));
      toast.success('Subcategory added successfully');
    } catch (error) {
      console.error('Error adding subcategory:', error);
      toast.error('Failed to add subcategory');
    } finally {
      setIsSubmitting(false);
    }
  };

  const toggleExpanded = (id: string) => {
    const newExpanded = new Set(expandedCategories);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpandedCategories(newExpanded);
  };

  const generateSlug = (name: string) => {
    return name.toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-red-500 mb-4">{error}</p>
        <Button
          onClick={fetchCategories}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Try Again
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Add New Category</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            placeholder="Category Name"
            value={newCategory.name}
            onChange={(e) => {
              const name = e.target.value;
              setNewCategory(prev => ({
                ...prev,
                name,
                slug: generateSlug(name),
              }));
            }}
            disabled={isSubmitting}
          />
          <Input
            placeholder="Slug"
            value={newCategory.slug}
            onChange={(e) => setNewCategory(prev => ({ ...prev, slug: e.target.value }))}
            disabled={isSubmitting}
          />
          <div className="md:col-span-2">
            <Textarea
              placeholder="Description"
              value={newCategory.description}
              onChange={(e) => setNewCategory(prev => ({ ...prev, description: e.target.value }))}
              disabled={isSubmitting}
            />
          </div>
          <div className="md:col-span-2 flex justify-end">
            <Button 
              onClick={handleAddCategory}
              disabled={isSubmitting || !newCategory.name || !newCategory.slug}
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Category
            </Button>
          </div>
        </div>
      </Card>

      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext
          items={categories.map(cat => cat._id || '')}
          strategy={verticalListSortingStrategy}
        >
          <div className="space-y-4">
            {categories.map((category) => (
              <SortableItem
                key={category._id}
                category={category}
                onEdit={setEditingCategory}
                onDelete={handleDeleteCategory}
                onToggleExpand={toggleExpanded}
                onToggleActive={(id, active) => handleUpdateCategory(id, { isActive: active })}
                onUpdate={handleUpdateCategory}
                onAddSubcategory={handleAddSubcategory}
                isExpanded={expandedCategories.has(category._id!)}
                isEditing={editingCategory === category._id}
              />
            ))}
          </div>
        </SortableContext>
      </DndContext>
    </div>
  );
}; 