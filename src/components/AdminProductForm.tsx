import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Save, X, Upload, Plus, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import api from "@/services/api";

// Predefined categories
const CATEGORIES = [
  { value: "flowers", label: "Flowers" },
  { value: "birthday", label: "Birthday" },
  { value: "anniversary", label: "Anniversary" },
  { value: "baskets", label: "Baskets" },
  { value: "gifts", label: "Gifts" },
  { value: "plants", label: "Plants" },
];

type Product = {
  _id?: string;
  title: string;
  category: string;
  price: number;
  discount?: number;
  countInStock: number;
  description: string;
  details: string[];
  images: string[];
  isFeatured: boolean;
  isNew: boolean;
};

type Props = {
  product?: Product | null;
  productToEdit?: Product | null;  // Alternative prop name used in VendorProducts
  onClose?: () => void;
  onSave?: () => void;
  onSuccess?: () => void;  // Alternative callback used in VendorProducts
};

const AdminProductForm: React.FC<Props> = ({ 
  product, 
  productToEdit,
  onClose, 
  onSave,
  onSuccess 
}) => {
  const { toast } = useToast();
  const productData = product || productToEdit;
  const isEditing = !!productData;

  const [formData, setFormData] = useState<Product>({
    _id: productData?._id || undefined,
    title: productData?.title || "",
    category: productData?.category || "",
    price: productData?.price || 0,
    discount: productData?.discount || 0,
    countInStock: productData?.countInStock || 0,
    description: productData?.description || "",
    details: productData?.details || [],
    images: productData?.images || [],
    isFeatured: productData?.isFeatured || false,
    isNew: productData?.isNew || false,
  });

  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [newDetail, setNewDetail] = useState("");

  // ✅ Handle Image Uploads
  const handleImageUpload = async (): Promise<string[]> => {
    // If no new files are selected, return the current images
    if (selectedFiles.length === 0) {
      return formData.images;
    }

    const uploadedUrls: string[] = [];

    for (const file of selectedFiles) {
      const fileData = new FormData();
      fileData.append("image", file);

      try {
        const { data } = await api.post("/uploads", fileData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        uploadedUrls.push(data.imageUrl);
      } catch (error: any) {
        toast({ title: "Upload failed", description: "Error uploading image." });
        return formData.images; // Return existing images if upload fails
      }
    }

    return [...formData.images, ...uploadedUrls];
  };

  // ✅ Handle Product Submission
  const handleSubmit = async () => {
    setIsSubmitting(true);

    if (!formData.title || !formData.category || !formData.description || formData.price <= 0 || formData.countInStock < 0) {
      toast({ title: "Missing fields", description: "Please fill all fields correctly." });
      setIsSubmitting(false);
      return;
    }

    let finalImages = formData.images; // Keep existing images

    // ✅ Only upload images if new images are selected
    if (selectedFiles.length > 0) {
      const uploadedImages = await handleImageUpload();
      if (uploadedImages.length === 0) {
        toast({ title: "Image Upload Failed", description: "Please try again." });
        setIsSubmitting(false);
        return;
      }
      finalImages = [...uploadedImages]; // ✅ Replace with newly uploaded images
    }
  

    const updatedProduct = { 
      ...formData,
      images: finalImages,
      details: formData.details.filter((d) => typeof d === 'string' && d.trim() !== ""),
    };

    try {
      let response;
      if (isEditing) {
        response = await api.put(`/products/${productData?._id}`, updatedProduct);
        toast({ title: "Product updated", description: "Changes saved successfully." });
      } else {
        response = await api.post("/products", updatedProduct);
        toast({ title: "Product added", description: "New product created." });
      }

      // Call the appropriate callback
      if (onSuccess) {
        onSuccess();
      } else {
        onSave?.();
        onClose?.();
      }
    } catch (error: any) {
      toast({ title: "Error", description: "Failed to save product." });
    }
    setIsSubmitting(false);
  };

  // ✅ Handle Adding Details
  const addDetail = () => {
    if (newDetail.trim() !== "") {
      setFormData({ ...formData, details: [...formData.details, newDetail] });
      setNewDetail("");
    }
  };

  // ✅ Handle Removing Details
  const removeDetail = (index: number) => {
    setFormData({ ...formData, details: formData.details.filter((_, i) => i !== index) });
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addDetail();
    }
  };

  return (
    <div className="flex flex-col h-[80vh]">
      <div className="flex-none p-6 pb-2">
        <h2 className="text-xl font-semibold mb-4">{isEditing ? "Edit Product" : "Add New Product"}</h2>
      </div>

      <ScrollArea className="flex-grow px-6">
        <div className="space-y-4 pr-4">
          {/* Product Name */}
          <div>
            <label className="text-sm font-medium">Product Name</label>
            <Input 
              placeholder="Enter product name" 
              value={formData.title} 
              onChange={(e) => setFormData({ ...formData, title: e.target.value })} 
            />
          </div>

          {/* Category Dropdown */}
          <div>
            <label className="text-sm font-medium">Category</label>
            <Select
              value={formData.category}
              onValueChange={(value) => setFormData({ ...formData, category: value })}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select a category" />
              </SelectTrigger>
              <SelectContent>
                {CATEGORIES.map((category) => (
                  <SelectItem key={category.value} value={category.value}>
                    {category.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Price & Discount */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium">Price (INR)</label>
              <Input 
                type="number" 
                value={formData.price} 
                onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })} 
              />
            </div>
            <div>
              <label className="text-sm font-medium">Discount (%)</label>
              <Input 
                type="number" 
                value={formData.discount} 
                onChange={(e) => setFormData({ ...formData, discount: Number(e.target.value) })} 
              />
            </div>
          </div>

          {/* Stock Quantity */}
          <div>
            <label className="text-sm font-medium">Stock Quantity</label>
            <Input 
              type="number" 
              value={formData.countInStock} 
              onChange={(e) => setFormData({ ...formData, countInStock: Number(e.target.value) })} 
            />
          </div>

          {/* Description */}
          <div>
            <label className="text-sm font-medium">Description</label>
            <textarea 
              placeholder="Enter product description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="min-h-[100px] border rounded-md p-2 w-full resize-y"
              rows={4}
            />
          </div>

          {/* Details */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Details & Care Instructions</label>
            <div className="flex gap-2">
              <Input 
                placeholder="Add details or care instructions" 
                value={newDetail} 
                onChange={(e) => setNewDetail(e.target.value)}
                onKeyPress={handleKeyPress}
              />
              <Button 
                variant="outline" 
                onClick={addDetail}
                className="flex-none"
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            <div className="max-h-[200px] overflow-y-auto rounded-md border bg-background p-1">
              {formData.details.length > 0 ? (
                <ul className="space-y-1">
                  {formData.details.map((detail, index) => (
                    <li 
                      key={index} 
                      className="flex items-center justify-between p-2 rounded-md bg-muted/40 hover:bg-muted/60 transition-colors"
                    >
                      <span className="text-sm">{detail}</span>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => removeDetail(index)}
                        className="h-8 w-8 p-0"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-muted-foreground p-2 text-center">
                  No details added yet
                </p>
              )}
            </div>
          </div>

          {/* Featured and New Checkboxes */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="isFeatured"
                checked={formData.isFeatured}
                onCheckedChange={(checked) => 
                  setFormData({ ...formData, isFeatured: checked as boolean })
                }
              />
              <label
                htmlFor="isFeatured"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                Featured Product
              </label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="isNew"
                checked={formData.isNew}
                onCheckedChange={(checked) => 
                  setFormData({ ...formData, isNew: checked as boolean })
                }
              />
              <label
                htmlFor="isNew"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                New Arrival
              </label>
            </div>
          </div>

          {/* Image Upload */}
          <div>
            <label className="text-sm font-medium">Upload Images</label>
            <Input
              type="file"
              multiple
              accept="image/*"
              onChange={(e) => {
                if (e.target.files) {
                  setSelectedFiles(Array.from(e.target.files));
                }
              }}
            />
            {selectedFiles.length > 0 && (
              <p className="text-sm text-muted-foreground mt-2">
                {selectedFiles.length} image(s) selected
              </p>
            )}
          </div>
        </div>
      </ScrollArea>

      {/* Submit Buttons - Fixed at bottom */}
      <div className="flex-none p-6 pt-2 border-t bg-background">
        <div className="flex justify-end gap-2">
          <Button 
            variant="ghost" 
            onClick={onSuccess ? () => onSuccess() : onClose} 
            disabled={isSubmitting}
          >
            <X className="h-4 w-4 mr-2" /> Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={isSubmitting}>
            <Save className="h-4 w-4 mr-2" /> {isEditing ? "Update Product" : "Save Product"}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default AdminProductForm;
