import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Save, X, Upload, Plus, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import api from "@/services/api";

type Product = {
  _id?: string;
  title: string;
  category: string;
  price: number;
  discount?: number;
  countInStock: number;
  description: string;
  details: string[];  // ✅ Add details field
  images: string[];
  isFeatured: boolean;
  isNew: boolean;
};

type Props = {
  product?: Product | null;
  onClose: () => void;
  onSave: () => void;
};

const AdminProductForm: React.FC<Props> = ({ product, onClose, onSave }) => {
  const { toast } = useToast();
  const isEditing = !!product;

  const [formData, setFormData] = useState<Product>({
    _id: product?._id || undefined,
    title: product?.title || "",
    category: product?.category || "",
    price: product?.price || 0,
    discount: product?.discount || 0,
    countInStock: product?.countInStock || 0,
    description: product?.description || "",
    details: product?.details || [],  // ✅ Initialize details array
    images: product?.images || [],
    isFeatured: product?.isFeatured || false,
    isNew: product?.isNew || false,
  });

  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [newDetail, setNewDetail] = useState(""); // ✅ State for adding new details

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
        response = await api.put(`/products/${product?._id}`, updatedProduct);
        toast({ title: "Product updated", description: "Changes saved successfully." });
      } else {
        response = await api.post("/products", updatedProduct);
        toast({ title: "Product added", description: "New product created." });
      }

      onSave();
      onClose();
    } catch (error: any) {
      toast({ title: "Error", description: "Failed to save product." });
    }
    setIsSubmitting(false);
  };

  // ✅ Handle Adding Details
  const addDetail = () => {
    if (newDetail.trim() !== "") {
      setFormData({ ...formData, details: [...formData.details, newDetail] });
      setNewDetail(""); // Clear input field after adding
    }
  };

  // ✅ Handle Removing Details
  const removeDetail = (index: number) => {
    setFormData({ ...formData, details: formData.details.filter((_, i) => i !== index) });
  };

  return (
    <div className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
      <h2 className="text-xl font-semibold">{isEditing ? "Edit Product" : "Add New Product"}</h2>

      {/* ✅ Product Name */}
      <div>
        <label className="text-sm font-medium">Product Name</label>
        <Input 
          placeholder="Enter product name" 
          value={formData.title} 
          onChange={(e) => setFormData({ ...formData, title: e.target.value })} 
        />
      </div>

      {/* ✅ Category */}
      <div>
        <label className="text-sm font-medium">Category</label>
        <Input 
          placeholder="Enter category" 
          value={formData.category} 
          onChange={(e) => setFormData({ ...formData, category: e.target.value })} 
        />
      </div>

      {/* ✅ Price & Discount */}
      <div className="grid grid-cols-2 gap-4">
        <Input type="number" placeholder="Price (INR)" value={formData.price} 
          onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })} />
        <Input type="number" placeholder="Discount (%)" value={formData.discount} 
          onChange={(e) => setFormData({ ...formData, discount: Number(e.target.value) })} />
      </div>

      {/* ✅ Stock Quantity */}
      <Input type="number" placeholder="Stock Quantity" value={formData.countInStock} 
        onChange={(e) => setFormData({ ...formData, countInStock: Number(e.target.value) })} />

      {/* ✅ Product Description */}
      <div>
        <label className="text-sm font-medium">Description</label>
        <textarea 
          placeholder="Enter product description"
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          className="border rounded-md p-2 w-full"
        />
      </div>

      {/* ✅ Product Details (Array) */}
      <div>
        <label className="text-sm font-medium">Details</label>
        <div className="flex gap-2">
          <Input placeholder="Add a detail" value={newDetail} 
            onChange={(e) => setNewDetail(e.target.value)} />
          <Button variant="outline" onClick={addDetail}><Plus /></Button>
        </div>
        <ul className="mt-2 space-y-2">
          {formData.details.map((detail, index) => (
            <li key={index} className="flex items-center justify-between border p-2 rounded-md">
              {detail}
              <Button variant="ghost" size="sm" onClick={() => removeDetail(index)}><Trash2 /></Button>
            </li>
          ))}
        </ul>
      </div>

      {/* ✅ Image Upload */}
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
      {/* ✅ Submit Buttons */}
      <div className="flex justify-end gap-2">
        <Button variant="ghost" onClick={onClose} disabled={isSubmitting}><X /> Cancel</Button>
        <Button onClick={handleSubmit} disabled={isSubmitting}><Save /> {isEditing ? "Update Product" : "Save Product"}</Button>
      </div>
    </div>
  );
};

export default AdminProductForm;
