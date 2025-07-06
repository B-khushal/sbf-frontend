import React, { useState, useEffect } from 'react';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import { Switch } from '../ui/switch';
import { Card } from '../ui/card';
import { Plus, Trash2, ChevronDown, ChevronUp, Edit2, Save, X } from 'lucide-react';
import { toast } from 'sonner';

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

interface CategoryManagerProps {
  initialCategories: Category[];
  onSave: (categories: Category[]) => Promise<void>;
}

export const CategoryManager: React.FC<CategoryManagerProps> = ({ initialCategories, onSave }) => {
  const [categories, setCategories] = useState<Category[]>(initialCategories);
  const [editingCategory, setEditingCategory] = useState<string | null>(null);
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());
  const [newCategory, setNewCategory] = useState<Partial<Category>>({
    name: '',
    slug: '',
    description: '',
    isActive: true,
  });

  useEffect(() => {
    setCategories(initialCategories);
  }, [initialCategories]);

  const handleDragEnd = (result: any) => {
    if (!result.destination) return;

    const items = Array.from(categories);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    // Update order numbers
    const updatedItems = items.map((item, index) => ({
      ...item,
      order: index,
    }));

    setCategories(updatedItems);
    handleSaveCategories(updatedItems);
  };

  const handleAddCategory = () => {
    if (!newCategory.name || !newCategory.slug) {
      toast.error('Name and slug are required');
      return;
    }

    const slugExists = categories.some(cat => cat.slug === newCategory.slug);
    if (slugExists) {
      toast.error('Slug must be unique');
      return;
    }

    const newCategoryItem: Category = {
      ...newCategory as Category,
      order: categories.length,
      isActive: true,
    };

    const updatedCategories = [...categories, newCategoryItem];
    setCategories(updatedCategories);
    handleSaveCategories(updatedCategories);
    setNewCategory({ name: '', slug: '', description: '', isActive: true });
  };

  const handleAddSubcategory = (parentId: string) => {
    const parentCategory = categories.find(cat => cat._id === parentId);
    if (!parentCategory) return;

    const newSubcategory: Category = {
      name: 'New Subcategory',
      slug: 'new-subcategory-' + Date.now(),
      order: parentCategory.subcategories?.length || 0,
      isActive: true,
      parentCategory: parentId,
    };

    const updatedCategories = categories.map(cat => {
      if (cat._id === parentId) {
        return {
          ...cat,
          subcategories: [...(cat.subcategories || []), newSubcategory],
        };
      }
      return cat;
    });

    setCategories(updatedCategories);
    handleSaveCategories(updatedCategories);
    setExpandedCategories(new Set([...expandedCategories, parentId]));
  };

  const handleUpdateCategory = (id: string, updates: Partial<Category>) => {
    const updatedCategories = categories.map(cat => {
      if (cat._id === id) {
        return { ...cat, ...updates };
      }
      if (cat.subcategories) {
        const updatedSubcategories = cat.subcategories.map(sub =>
          sub._id === id ? { ...sub, ...updates } : sub
        );
        return { ...cat, subcategories: updatedSubcategories };
      }
      return cat;
    });

    setCategories(updatedCategories);
    handleSaveCategories(updatedCategories);
  };

  const handleDeleteCategory = (id: string) => {
    const hasSubcategories = categories.find(cat => cat._id === id)?.subcategories?.length > 0;
    if (hasSubcategories) {
      toast.error('Cannot delete category with subcategories');
      return;
    }

    const updatedCategories = categories.filter(cat => cat._id !== id);
    setCategories(updatedCategories);
    handleSaveCategories(updatedCategories);
  };

  const handleSaveCategories = async (updatedCategories: Category[]) => {
    try {
      await onSave(updatedCategories);
      toast.success('Categories updated successfully');
    } catch (error) {
      toast.error('Failed to update categories');
      console.error('Error saving categories:', error);
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
          />
          <Input
            placeholder="Slug"
            value={newCategory.slug}
            onChange={(e) => setNewCategory(prev => ({ ...prev, slug: e.target.value }))}
          />
          <div className="md:col-span-2">
            <Textarea
              placeholder="Description"
              value={newCategory.description}
              onChange={(e) => setNewCategory(prev => ({ ...prev, description: e.target.value }))}
            />
          </div>
          <div className="md:col-span-2 flex justify-end">
            <Button onClick={handleAddCategory}>
              <Plus className="w-4 h-4 mr-2" />
              Add Category
            </Button>
          </div>
        </div>
      </Card>

      <DragDropContext onDragEnd={handleDragEnd}>
        <Droppable droppableId="categories">
          {(provided) => (
            <div {...provided.droppableProps} ref={provided.innerRef} className="space-y-4">
              {categories.map((category, index) => (
                <Draggable
                  key={category._id || index.toString()}
                  draggableId={category._id || index.toString()}
                  index={index}
                >
                  {(provided) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.draggableProps}
                      {...provided.dragHandleProps}
                    >
                      <Card className="p-4">
                        <div className="flex items-center justify-between">
                          {editingCategory === category._id ? (
                            <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4">
                              <Input
                                value={category.name}
                                onChange={(e) => handleUpdateCategory(category._id!, { name: e.target.value })}
                                placeholder="Category Name"
                              />
                              <Input
                                value={category.slug}
                                onChange={(e) => handleUpdateCategory(category._id!, { slug: e.target.value })}
                                placeholder="Slug"
                              />
                              <div className="md:col-span-2">
                                <Textarea
                                  value={category.description}
                                  onChange={(e) => handleUpdateCategory(category._id!, { description: e.target.value })}
                                  placeholder="Description"
                                />
                              </div>
                            </div>
                          ) : (
                            <div className="flex-1">
                              <h4 className="font-semibold">{category.name}</h4>
                              <p className="text-sm text-gray-500">{category.slug}</p>
                            </div>
                          )}
                          <div className="flex items-center space-x-2">
                            <Switch
                              checked={category.isActive}
                              onCheckedChange={(checked) => handleUpdateCategory(category._id!, { isActive: checked })}
                            />
                            {editingCategory === category._id ? (
                              <>
                                <Button
                                  variant="outline"
                                  size="icon"
                                  onClick={() => setEditingCategory(null)}
                                >
                                  <Save className="w-4 h-4" />
                                </Button>
                                <Button
                                  variant="outline"
                                  size="icon"
                                  onClick={() => setEditingCategory(null)}
                                >
                                  <X className="w-4 h-4" />
                                </Button>
                              </>
                            ) : (
                              <Button
                                variant="outline"
                                size="icon"
                                onClick={() => setEditingCategory(category._id!)}
                              >
                                <Edit2 className="w-4 h-4" />
                              </Button>
                            )}
                            <Button
                              variant="outline"
                              size="icon"
                              onClick={() => toggleExpanded(category._id!)}
                            >
                              {expandedCategories.has(category._id!) ? (
                                <ChevronUp className="w-4 h-4" />
                              ) : (
                                <ChevronDown className="w-4 h-4" />
                              )}
                            </Button>
                            <Button
                              variant="destructive"
                              size="icon"
                              onClick={() => handleDeleteCategory(category._id!)}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>

                        {expandedCategories.has(category._id!) && (
                          <div className="mt-4 pl-6 border-l-2 border-gray-200">
                            <div className="mb-4">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleAddSubcategory(category._id!)}
                              >
                                <Plus className="w-4 h-4 mr-2" />
                                Add Subcategory
                              </Button>
                            </div>
                            {category.subcategories?.map((subcategory, subIndex) => (
                              <Card key={subcategory._id || subIndex} className="p-4 mb-2">
                                <div className="flex items-center justify-between">
                                  <div>
                                    <h5 className="font-medium">{subcategory.name}</h5>
                                    <p className="text-sm text-gray-500">{subcategory.slug}</p>
                                  </div>
                                  <div className="flex items-center space-x-2">
                                    <Switch
                                      checked={subcategory.isActive}
                                      onCheckedChange={(checked) =>
                                        handleUpdateCategory(subcategory._id!, { isActive: checked })
                                      }
                                    />
                                    <Button
                                      variant="destructive"
                                      size="icon"
                                      onClick={() => handleDeleteCategory(subcategory._id!)}
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
                  )}
                </Draggable>
              ))}
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      </DragDropContext>
    </div>
  );
}; 