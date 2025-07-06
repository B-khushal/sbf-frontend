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
  { value: "bouquets", label: "Bouquets" },
  { value: "flowers", label: "Flowers" },
  { value: "plants", label: "Plants" },
  { value: "gifts", label: "Gifts" },
  { value: "occasions", label: "Occasions" },
  { value: "baskets", label: "Baskets" },
  { value: "chocolate-baskets", label: "Chocolate Baskets" },
  { value: "chocolate-bouquets", label: "Chocolate Bouquets" },
  { value: "chocolate-gift-sets", label: "Chocolate Gift Sets" },
  { value: "premium-chocolates", label: "Premium Chocolates" },
  { value: "anniversary", label: "Anniversary" },
  { value: "birthday", label: "Birthday" },
  { value: "wedding", label: "Wedding" },
  { value: "funeral", label: "Funeral" },
  { value: "congratulations", label: "Congratulations" },
  { value: "get-well", label: "Get Well" },
  { value: "sympathy", label: "Sympathy" },
  { value: "condolence", label: "Condolence" },
  { value: "memorial-flowers", label: "Memorial Flowers" },
  { value: "peaceful-arrangements", label: "Peaceful Arrangements" },
  { value: "roses", label: "Roses" },
  { value: "sunflowers", label: "Sunflowers" },
  { value: "tulips", label: "Tulips" },
  { value: "orchids", label: "Orchids" },
  { value: "lilies", label: "Lilies" },
  { value: "cakes", label: "Cakes" },
  { value: "bunches", label: "Bunches" },
  { value: "gift-hampers", label: "Gift Hampers" },
  { value: "fruit-baskets", label: "Fruit Baskets" },
  { value: "flower-baskets", label: "Flower Baskets" },
  { value: "mixed-baskets", label: "Mixed Baskets" },
  { value: "mixed-arrangements", label: "Mixed Arrangements" },
  { value: "premium-collections", label: "Premium Collections" },
  { value: "seasonal-specials", label: "Seasonal Specials" },
  { value: "corporate-gifts", label: "Corporate Gifts" },
  { value: "baby-shower", label: "Baby Shower" },
  { value: "housewarming", label: "Housewarming" },
  { value: "thank-you", label: "Thank You" },
  { value: "apology", label: "Apology" },
  { value: "graduation", label: "Graduation" },
  { value: "valentines-day", label: "Valentine's Day" },
  { value: "mothers-day", label: "Mother's Day" },
  { value: "fathers-day", label: "Father's Day" },
  { value: "christmas", label: "Christmas" },
  { value: "new-year", label: "New Year" },
  { value: "diwali", label: "Diwali" },
  { value: "holi", label: "Holi" },
  { value: "raksha-bandhan", label: "Raksha Bandhan" },
  { value: "party-arrangements", label: "Party Arrangements" },
  { value: "kids-birthday", label: "Kids Birthday" },
  { value: "birthday-cakes", label: "Birthday Cakes" },
  { value: "romantic-bouquets", label: "Romantic Bouquets" },
  { value: "love-arrangements", label: "Love Arrangements" },
  { value: "anniversary-gifts", label: "Anniversary Gifts" },
  { value: "gift-sets", label: "Gift Sets" },
  { value: "chocolates", label: "Chocolates" },
  { value: "combo-packs", label: "Combo Packs" },
  { value: "indoor-plants", label: "Indoor Plants" },
  { value: "succulents", label: "Succulents" },
  { value: "garden-plants", label: "Garden Plants" },
  { value: "air-purifying", label: "Air Purifying" },
  { value: "sympathy-bouquets", label: "Sympathy Bouquets" },
  { value: "condolence-arrangements", label: "Condolence Arrangements" },
  { value: "memorial-flowers", label: "Memorial Flowers" },
  { value: "peaceful-arrangements", label: "Peaceful Arrangements" }
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
  isCustomizable?: boolean;
  customizationOptions?: {
    allowPhotoUpload: boolean;
    allowCustomNumber: boolean;
    customNumberLabel: string;
    allowFlowerAddons: boolean;
    flowerAddons: Array<{
      name: string;
      price: number;
      description: string;
      image: string;
    }>;
    allowChocolateAddons: boolean;
    chocolateAddons: Array<{
      name: string;
      price: number;
      description: string;
      image: string;
    }>;
    allowMessageCard: boolean;
    messageCardPrice: number;
    baseLayoutImage: string;
  };
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
    isCustomizable: productData?.isCustomizable || false,
    customizationOptions: productData?.customizationOptions || {
      allowPhotoUpload: false,
      allowCustomNumber: false,
      customNumberLabel: "Number",
      allowFlowerAddons: false,
      flowerAddons: [],
      allowChocolateAddons: false,
      chocolateAddons: [],
      allowMessageCard: false,
      messageCardPrice: 0,
      baseLayoutImage: "",
    },
  });

  // Debug logging for customization options
  React.useEffect(() => {
    console.log('Form data updated:', {
      isCustomizable: formData.isCustomizable,
      customizationOptions: formData.customizationOptions
    });
  }, [formData.isCustomizable, formData.customizationOptions]);

  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [newDetail, setNewDetail] = useState("");
  const [uploadProgress, setUploadProgress] = useState<string>("");

  // Debug function to test upload connection
  const testUploadConnection = async () => {
    try {
      console.log('🔍 Testing upload connection...');
      const response = await api.get('/uploads');
      console.log('✅ Upload endpoint accessible:', response.data);
    } catch (error: any) {
      console.error('❌ Upload endpoint test failed:', error.response?.status, error.response?.data);
    }
  };

  // Test connection on component mount
  React.useEffect(() => {
    testUploadConnection();
  }, []);

  // ✅ Handle Image Uploads
  const handleImageUpload = async (): Promise<string[]> => {
    // If no new files are selected, return the current images
    if (selectedFiles.length === 0) {
      return formData.images;
    }

    const uploadedUrls: string[] = [];

    for (let i = 0; i < selectedFiles.length; i++) {
      const file = selectedFiles[i];
      const fileData = new FormData();
      fileData.append("image", file);

      try {
        setUploadProgress(`Uploading image ${i + 1} of ${selectedFiles.length}: ${file.name}`);
        console.log('📸 Uploading image:', file.name, 'Size:', file.size);
        
        const { data } = await api.post("/uploads", fileData);
        
        if (data && data.imageUrl) {
          console.log('✅ Image uploaded successfully:', data.imageUrl);
          uploadedUrls.push(data.imageUrl);
        } else {
          console.error('❌ Invalid response from upload service:', data);
          toast({ 
            title: "Upload failed", 
            description: "Invalid response from server." 
          });
          setUploadProgress("");
          return formData.images; // Return existing images if upload fails
        }
      } catch (error: any) {
        console.error('❌ Upload error:', error);
        const errorMessage = error.response?.data?.message || error.message || "Error uploading image.";
        toast({ 
          title: "Upload failed", 
          description: errorMessage 
        });
        setUploadProgress("");
        return formData.images; // Return existing images if upload fails
      }
    }

    setUploadProgress("");
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

    // ✅ Upload new images if selected
    if (selectedFiles.length > 0) {
      console.log('📸 Starting image upload process...');
      const uploadedImages = await handleImageUpload();
      
      if (uploadedImages.length === 0) {
        toast({ 
          title: "Image Upload Failed", 
          description: "Please try uploading images again." 
        });
        setIsSubmitting(false);
        return;
      }
      
      finalImages = uploadedImages;
      console.log('✅ Final images array:', finalImages);
    }

    const updatedProduct = { 
      ...formData,
      images: finalImages,
      details: formData.details.filter((d) => typeof d === 'string' && d.trim() !== ""),
    };

    try {
      console.log('💾 Saving product with images:', finalImages.length);
      
      let response;
      if (isEditing) {
        response = await api.put(`/products/${productData?._id}`, updatedProduct);
        toast({ title: "Product updated", description: "Changes saved successfully." });
      } else {
        response = await api.post("/products", updatedProduct);
        toast({ title: "Product added", description: "New product created." });
      }

      console.log('✅ Product saved successfully:', response.data);

      // Call the appropriate callback
      if (onSuccess) {
        onSuccess();
      } else {
        onSave?.();
        onClose?.();
      }
    } catch (error: any) {
      console.error('❌ Product save error:', error);
      const errorMessage = error.response?.data?.message || error.message || "Failed to save product.";
      toast({ title: "Error", description: errorMessage });
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

          {/* Customization Options */}
          <div className="space-y-4 border-t pt-4 bg-gray-50 p-4 rounded-lg">
            <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <span className="w-6 h-6 bg-purple-500 rounded-full flex items-center justify-center text-white text-sm">🎨</span>
              Customization Options
            </h3>
            <div className="flex items-center space-x-2 p-3 bg-white rounded-lg border">
              <Checkbox
                id="isCustomizable"
                checked={formData.isCustomizable || false}
                onCheckedChange={(checked) => {
                  console.log('Customizable checkbox changed:', checked);
                  setFormData({ 
                    ...formData, 
                    isCustomizable: checked as boolean,
                    customizationOptions: {
                      ...formData.customizationOptions!,
                      allowPhotoUpload: checked as boolean ? formData.customizationOptions?.allowPhotoUpload : false,
                      allowCustomNumber: checked as boolean ? formData.customizationOptions?.allowCustomNumber : false,
                      allowFlowerAddons: checked as boolean ? formData.customizationOptions?.allowFlowerAddons : false,
                      allowChocolateAddons: checked as boolean ? formData.customizationOptions?.allowChocolateAddons : false,
                      allowMessageCard: checked as boolean ? formData.customizationOptions?.allowMessageCard : false,
                    }
                  });
                }}
              />
              <label
                htmlFor="isCustomizable"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
              >
                Enable Product Customization
              </label>
            </div>

            {formData.isCustomizable && (
              <div className="space-y-4 pl-6 border-l-2 border-purple-200 bg-white p-4 rounded-lg mt-4">
                <p className="text-sm text-gray-600 mb-4">Configure which customization options are available for this product:</p>
                {/* Photo Upload Option */}
                <div className="flex items-center space-x-2 p-3 bg-gray-50 rounded-lg border">
                  <Checkbox
                    id="allowPhotoUpload"
                    checked={formData.customizationOptions?.allowPhotoUpload || false}
                    onCheckedChange={(checked) => 
                      setFormData({ 
                        ...formData, 
                        customizationOptions: {
                          ...formData.customizationOptions!,
                          allowPhotoUpload: checked as boolean
                        }
                      })
                    }
                  />
                  <label
                    htmlFor="allowPhotoUpload"
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer flex items-center gap-2"
                  >
                    <span className="text-blue-500">📸</span>
                    Allow Photo Upload
                  </label>
                </div>

                {/* Custom Number Option */}
                <div className="space-y-2">
                  <div className="flex items-center space-x-2 p-3 bg-gray-50 rounded-lg border">
                    <Checkbox
                      id="allowCustomNumber"
                      checked={formData.customizationOptions?.allowCustomNumber || false}
                      onCheckedChange={(checked) => 
                        setFormData({ 
                          ...formData, 
                          customizationOptions: {
                            ...formData.customizationOptions!,
                            allowCustomNumber: checked as boolean
                          }
                        })
                      }
                    />
                    <label
                      htmlFor="allowCustomNumber"
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer flex items-center gap-2"
                    >
                      <span className="text-green-500">🔢</span>
                      Allow Custom Number
                    </label>
                  </div>
                  {formData.customizationOptions?.allowCustomNumber && (
                    <Input
                      placeholder="Number label (e.g., Age, Anniversary)"
                      value={formData.customizationOptions?.customNumberLabel || "Number"}
                      onChange={(e) => 
                        setFormData({ 
                          ...formData, 
                          customizationOptions: {
                            ...formData.customizationOptions!,
                            customNumberLabel: e.target.value
                          }
                        })
                      }
                      className="ml-6"
                    />
                  )}
                </div>

                {/* Flower Addons */}
                <div className="space-y-2">
                  <div className="flex items-center space-x-2 p-3 bg-gray-50 rounded-lg border">
                    <Checkbox
                      id="allowFlowerAddons"
                      checked={formData.customizationOptions?.allowFlowerAddons || false}
                      onCheckedChange={(checked) => 
                        setFormData({ 
                          ...formData, 
                          customizationOptions: {
                            ...formData.customizationOptions!,
                            allowFlowerAddons: checked as boolean
                          }
                        })
                      }
                    />
                    <label
                      htmlFor="allowFlowerAddons"
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer flex items-center gap-2"
                    >
                      <span className="text-pink-500">🌸</span>
                      Allow Flower Addons
                    </label>
                  </div>
                  {formData.customizationOptions?.allowFlowerAddons && (
                    <div className="ml-6 space-y-2">
                      <p className="text-xs text-gray-600">Add flower options with prices</p>
                      {formData.customizationOptions?.flowerAddons?.map((flower, index) => (
                        <div key={index} className="flex gap-2 items-center">
                          <Input
                            placeholder="Flower name"
                            value={flower.name}
                            onChange={(e) => {
                              const updatedFlowers = [...(formData.customizationOptions?.flowerAddons || [])];
                              updatedFlowers[index] = { ...flower, name: e.target.value };
                              setFormData({
                                ...formData,
                                customizationOptions: {
                                  ...formData.customizationOptions!,
                                  flowerAddons: updatedFlowers
                                }
                              });
                            }}
                          />
                          <Input
                            type="number"
                            placeholder="Price"
                            value={flower.price}
                            onChange={(e) => {
                              const updatedFlowers = [...(formData.customizationOptions?.flowerAddons || [])];
                              updatedFlowers[index] = { ...flower, price: Number(e.target.value) };
                              setFormData({
                                ...formData,
                                customizationOptions: {
                                  ...formData.customizationOptions!,
                                  flowerAddons: updatedFlowers
                                }
                              });
                            }}
                            className="w-24"
                          />
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              const updatedFlowers = formData.customizationOptions?.flowerAddons?.filter((_, i) => i !== index) || [];
                              setFormData({
                                ...formData,
                                customizationOptions: {
                                  ...formData.customizationOptions!,
                                  flowerAddons: updatedFlowers
                                }
                              });
                            }}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          const newFlower = { name: '', price: 0, description: '', image: '' };
                          setFormData({
                            ...formData,
                            customizationOptions: {
                              ...formData.customizationOptions!,
                              flowerAddons: [...(formData.customizationOptions?.flowerAddons || []), newFlower]
                            }
                          });
                        }}
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Add Flower
                      </Button>
                    </div>
                  )}
                </div>

                {/* Chocolate Addons */}
                <div className="space-y-2">
                  <div className="flex items-center space-x-2 p-3 bg-gray-50 rounded-lg border">
                    <Checkbox
                      id="allowChocolateAddons"
                      checked={formData.customizationOptions?.allowChocolateAddons || false}
                      onCheckedChange={(checked) => 
                        setFormData({ 
                          ...formData, 
                          customizationOptions: {
                            ...formData.customizationOptions!,
                            allowChocolateAddons: checked as boolean
                          }
                        })
                      }
                    />
                    <label
                      htmlFor="allowChocolateAddons"
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer flex items-center gap-2"
                    >
                      <span className="text-yellow-500">🍫</span>
                      Allow Chocolate Addons
                    </label>
                  </div>
                  {formData.customizationOptions?.allowChocolateAddons && (
                    <div className="ml-6 space-y-2">
                      <p className="text-xs text-gray-600">Add chocolate options with prices</p>
                      {formData.customizationOptions?.chocolateAddons?.map((chocolate, index) => (
                        <div key={index} className="flex gap-2 items-center">
                          <Input
                            placeholder="Chocolate name"
                            value={chocolate.name}
                            onChange={(e) => {
                              const updatedChocolates = [...(formData.customizationOptions?.chocolateAddons || [])];
                              updatedChocolates[index] = { ...chocolate, name: e.target.value };
                              setFormData({
                                ...formData,
                                customizationOptions: {
                                  ...formData.customizationOptions!,
                                  chocolateAddons: updatedChocolates
                                }
                              });
                            }}
                          />
                          <Input
                            type="number"
                            placeholder="Price"
                            value={chocolate.price}
                            onChange={(e) => {
                              const updatedChocolates = [...(formData.customizationOptions?.chocolateAddons || [])];
                              updatedChocolates[index] = { ...chocolate, price: Number(e.target.value) };
                              setFormData({
                                ...formData,
                                customizationOptions: {
                                  ...formData.customizationOptions!,
                                  chocolateAddons: updatedChocolates
                                }
                              });
                            }}
                            className="w-24"
                          />
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              const updatedChocolates = formData.customizationOptions?.chocolateAddons?.filter((_, i) => i !== index) || [];
                              setFormData({
                                ...formData,
                                customizationOptions: {
                                  ...formData.customizationOptions!,
                                  chocolateAddons: updatedChocolates
                                }
                              });
                            }}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          const newChocolate = { name: '', price: 0, description: '', image: '' };
                          setFormData({
                            ...formData,
                            customizationOptions: {
                              ...formData.customizationOptions!,
                              chocolateAddons: [...(formData.customizationOptions?.chocolateAddons || []), newChocolate]
                            }
                          });
                        }}
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Add Chocolate
                      </Button>
                    </div>
                  )}
                </div>

                {/* Message Card */}
                <div className="space-y-2">
                  <div className="flex items-center space-x-2 p-3 bg-gray-50 rounded-lg border">
                    <Checkbox
                      id="allowMessageCard"
                      checked={formData.customizationOptions?.allowMessageCard || false}
                      onCheckedChange={(checked) => 
                        setFormData({ 
                          ...formData, 
                          customizationOptions: {
                            ...formData.customizationOptions!,
                            allowMessageCard: checked as boolean
                          }
                        })
                      }
                    />
                    <label
                      htmlFor="allowMessageCard"
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer flex items-center gap-2"
                    >
                      <span className="text-purple-500">✍️</span>
                      Allow Message Card
                    </label>
                  </div>
                  {formData.customizationOptions?.allowMessageCard && (
                    <div className="ml-6 space-y-2">
                      <Input
                        type="number"
                        placeholder="Message card price (0 for free)"
                        value={formData.customizationOptions?.messageCardPrice || 0}
                        onChange={(e) => 
                          setFormData({ 
                            ...formData, 
                            customizationOptions: {
                              ...formData.customizationOptions!,
                              messageCardPrice: Number(e.target.value)
                            }
                          })
                        }
                      />
                    </div>
                  )}
                </div>
              </div>
            )}
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
                  const files = Array.from(e.target.files);
                  console.log('📁 Selected files:', files.map(f => ({ name: f.name, size: f.size })));
                  setSelectedFiles(files);
                }
              }}
            />
            {selectedFiles.length > 0 && (
              <p className="text-sm text-muted-foreground mt-2">
                {selectedFiles.length} new image(s) selected for upload
              </p>
            )}
            
            {/* Test Upload Button */}
            {selectedFiles.length > 0 && (
              <Button 
                variant="outline" 
                size="sm" 
                onClick={async () => {
                  try {
                    const testFile = selectedFiles[0];
                    const fileData = new FormData();
                    fileData.append("image", testFile);
                    
                    console.log('🧪 Testing upload with file:', testFile.name);
                    const response = await api.post("/uploads", fileData);
                    console.log('✅ Test upload successful:', response.data);
                    toast({ title: "Test Upload Success", description: "Upload is working correctly!" });
                  } catch (error: any) {
                    console.error('❌ Test upload failed:', error);
                    toast({ 
                      title: "Test Upload Failed", 
                      description: error.response?.data?.message || error.message 
                    });
                  }
                }}
                className="mt-2"
              >
                Test Upload
              </Button>
            )}
            
            {/* Show current images if editing */}
            {isEditing && formData.images.length > 0 && (
              <div className="mt-4">
                <p className="text-sm font-medium mb-2">Current Images ({formData.images.length})</p>
                <div className="grid grid-cols-2 gap-2 max-h-32 overflow-y-auto">
                  {formData.images.map((image, index) => (
                    <div key={index} className="relative">
                      <img 
                        src={image} 
                        alt={`Product ${index + 1}`}
                        className="w-full h-20 object-cover rounded border"
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </ScrollArea>

      {/* Submit Buttons - Fixed at bottom */}
      <div className="flex-none p-6 pt-2 border-t bg-background">
        {uploadProgress && (
          <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-md">
            <p className="text-sm text-blue-700">{uploadProgress}</p>
          </div>
        )}
        <div className="flex justify-end gap-2">
          <Button 
            variant="ghost" 
            onClick={onSuccess ? () => onSuccess() : onClose} 
            disabled={isSubmitting}
          >
            <X className="h-4 w-4 mr-2" /> Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={isSubmitting}>
            <Save className="h-4 w-4 mr-2" /> 
            {isSubmitting 
              ? uploadProgress 
                ? "Uploading..." 
                : "Saving..." 
              : isEditing 
                ? "Update Product" 
                : "Save Product"
            }
          </Button>
        </div>
      </div>
    </div>
  );
};

export default AdminProductForm;
