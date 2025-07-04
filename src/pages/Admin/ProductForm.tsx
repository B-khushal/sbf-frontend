import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import type { ProductData } from '@/services/productService';
import productService from '@/services/productService';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Loader2, Trash2, ArrowLeft, Upload, Image as ImageIcon, Plus, X } from 'lucide-react';
import api from '../../services/api';
import axios from 'axios'; // Keep for axios.isAxiosError
import ProductFeaturesToggle from '@/components/ui/ProductFeaturesToggle';
import { getImageUrl } from '@/config';

type FormErrors = Partial<Record<keyof ProductData, string>>;


const CATEGORIES = [
  'Bouquets',
  'Flowers',
  'Plants',
  'Gifts',
  'Occasions',
  'Baskets',
  'Chocolate Baskets',
  'Chocolate Bouquets',
  'Chocolate Gift Sets',
  'Premium Chocolates',
  'Anniversary',
  'Birthday',
  'Wedding',
  'Funeral',
  'Congratulations',
  'Get Well',
  'Sympathy',
  'Condolence',
  'Memorial Flowers',
  'Peaceful Arrangements',
  'Roses',
  'Sunflowers',
  'Tulips',
  'Orchids',
  'Lilies',
  'Cakes',
  'Bunches',
  'Gift Hampers',
  'Fruit Baskets',
  'Flower Baskets',
  'Mixed Baskets',
  'Mixed Arrangements',
  'Premium Collections',
  'Seasonal Specials',
  'Corporate Gifts',
  'Baby Shower',
  'Housewarming',
  'Thank You',
  'Apology',
  'Graduation',
  'Valentine\'s Day',
  'Mother\'s Day',
  'Father\'s Day',
  'Christmas',
  'New Year',
  'Diwali',
  'Holi',
  'Raksha Bandhan',
  'Party Arrangements',
  'Kids Birthday',
  'Birthday Cakes',
  'Romantic Bouquets',
  'Love Arrangements',
  'Anniversary Gifts',
  'Fruit Baskets',
  'Flower Baskets',
  'Mixed Baskets',
  'Gift Hampers',
  'Gift Sets',
  'Chocolates',
  'Combo Packs',
  'Premium Collections',
  'Indoor Plants',
  'Succulents',
  'Garden Plants',
  'Air Purifying',
  'Sympathy Bouquets',
  'Condolence Arrangements',
  'Memorial Flowers',
  'Peaceful Arrangements',
  'Wedding',
  'Graduation',
  'Baby Shower',
  'Housewarming'
];

const PRODUCT_DETAILS_OPTIONS = [
  'Freshly sourced',
  'Hand-picked quality',
  'Premium grade',
  'Long-lasting',
  'Fragrant variety',
  'Seasonal specialty',
  'Organic certified',
  'Locally grown',
  'Indoor plant',
  'Outdoor plant',
  'Low maintenance',
  'High maintenance',
  'Pet-friendly',
  'Air purifying',
  'Fast growing',
  'Slow growing',
  'Flowering plant',
  'Non-flowering plant',
  'Succulent variety',
  'Tropical species',
  'Drought resistant',
  'Shade tolerant',
  'Sun loving',
  'Winter hardy'
];

const CARE_INSTRUCTIONS_OPTIONS = [
  'Water daily',
  'Water weekly',
  'Water when soil is dry',
  'Mist regularly',
  'Keep soil moist',
  'Allow soil to dry between watering',
  'Place in bright, indirect light',
  'Place in direct sunlight',
  'Keep in shade',
  'Rotate weekly for even growth',
  'Fertilize monthly',
  'Fertilize bi-weekly during growing season',
  'Prune dead flowers regularly',
  'Trim yellowing leaves',
  'Keep away from drafts',
  'Maintain humidity levels',
  'Room temperature 65-75°F',
  'Cool temperature preferred',
  'Repot annually',
  'Repot when rootbound',
  'Keep away from pets',
  'Non-toxic to pets',
  'Handle with gloves',
  'Store in cool, dry place'
];

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_FILE_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

const initialFormData: ProductData = {
  title: '',
  description: '',
  price: 0,
  discount: 0,
  category: '',
  categories: [],
  countInStock: 0,
  images: [],
  details: [],
  careInstructions: [],
      isNewArrival: false,
    isFeatured: false,
    hidden: true  // 🔒 New products are hidden by default until admin makes them visible
};

const ProductForm = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { toast } = useToast();
  const isEditMode = Boolean(id);

  const [formData, setFormData] = useState<ProductData>(initialFormData);
  const [errors, setErrors] = useState<FormErrors>({});
  const [isLoading, setIsLoading] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<number[]>([]);

  const fetchProductData = async () => {
    try {
      const token = getAuthToken();
      const data = await productService.getProductById(id);
      // Ensure categories is an array
      if (!data.categories) {
        data.categories = [];
      }
      setFormData(data);
      setUploadProgress(new Array(data.images.length).fill(100));
    } catch (error) {
      console.error('Error fetching product:', error);
      if (axios.isAxiosError(error)) {
        if (error.response?.status === 404) {
          toast({
            title: "Product Not Found",
            description: "The product you're trying to edit doesn't exist or has been deleted.",
            variant: "destructive",
            duration: 5000,
          });
          setTimeout(() => {
            navigate('/admin/products');
          }, 2000);
        } else if (error.response?.status === 401) {
          toast({
            title: "Authentication Error",
            description: "You are not authorized. Please log in again.",
            variant: "destructive",
          });
          localStorage.removeItem('userData');
          sessionStorage.removeItem('userData');
          setTimeout(() => {
            navigate('/login');
          }, 2000);
        } else {
          toast({
            title: "Error",
            description: error.response?.data?.message || "Failed to fetch product data. Please try again.",
            variant: "destructive",
            duration: 5000,
          });
        }
      }
    }
  };

  const getAuthToken = () => {
    // Try userData first (from our recent changes)
    const userData = localStorage.getItem('userData') || sessionStorage.getItem('userData');
    if (userData) {
      try {
        const parsed = JSON.parse(userData);
        if (parsed.token) return parsed.token;
      } catch (err) {
        console.error('Error parsing userData:', err);
      }
    }
    
    // Fall back to user (from the existing auth system)
    const user = localStorage.getItem('user');
    if (user) {
      try {
        const parsed = JSON.parse(user);
        if (parsed.token) return parsed.token;
      } catch (err) {
        console.error('Error parsing user data:', err);
      }
    }
    
    // Finally, try direct token storage
    const token = localStorage.getItem('token');
    if (token) return token;
    
    return null;
  };

  useEffect(() => {
    const checkAuth = setTimeout(() => {
      const userData = localStorage.getItem('userData') || sessionStorage.getItem('userData');
      const user = localStorage.getItem('user');
      const token = localStorage.getItem('token');
      const isAuthenticated = localStorage.getItem('isAuthenticated') === 'true';
      
      if (!userData && !user && !token && !isAuthenticated) {
        sessionStorage.setItem('returnPath', window.location.pathname);
        toast({
          title: "Authentication Required",
          description: "Please log in to access this page",
          variant: "destructive",
        });
        navigate('/login');
        return;
      }

      let isAdmin = false;
      
      try {
        if (userData) {
          const parsed = JSON.parse(userData);
          isAdmin = parsed.role === 'admin';
        } else if (user) {
          const parsed = JSON.parse(user);
          isAdmin = parsed.role === 'admin';
        }
        
        const storedRole = localStorage.getItem('role');
        if (storedRole === 'admin') isAdmin = true;
        
        if (!isAdmin) {
          toast({
            title: "Access Denied",
            description: "You don't have permission to access this page",
            variant: "destructive",
          });
          navigate('/');
          return;
        }
        
        if (isEditMode) {
          fetchProductData();
        }
      } catch (err) {
        console.error('Error checking auth role:', err);
      }
    }, 500);
    
    return () => clearTimeout(checkAuth);
  }, []);

  const validateForm = () => {
    const newErrors: FormErrors = {};

    if (!formData.title.trim()) {
      newErrors.title = 'Title is required';
    }

    if (!formData.description.trim()) {
      newErrors.description = 'Description is required';
    }

    if (formData.price <= 0) {
      newErrors.price = 'Price must be greater than 0';
    }

    if (formData.countInStock < 0) {
      newErrors.countInStock = 'Stock cannot be negative';
    }

    if (!formData.category) {
      newErrors.category = 'Primary category is required';
    }

    if (formData.images.length === 0 || !formData.images[0]) {
      newErrors.images = 'At least one image is required';
    }

    setErrors(newErrors);
    return newErrors;
  };

  const uploadImage = async (file: File, index: number) => {
    if (file.size > MAX_FILE_SIZE) {
      toast({
        title: "File Too Large",
        description: `Image must be less than ${MAX_FILE_SIZE / 1024 / 1024}MB`,
        variant: "destructive",
      });
      return null;
    }

    if (!ALLOWED_FILE_TYPES.includes(file.type)) {
      toast({
        title: "Invalid File Type",
        description: "Only JPEG, PNG, and WebP images are allowed",
        variant: "destructive",
      });
      return null;
    }

    const uploadFormData = new FormData();
    uploadFormData.append('image', file);

    try {
      // Debug authentication state
      const token = getAuthToken();
      const userData = localStorage.getItem('userData') || sessionStorage.getItem('userData');
      const user = localStorage.getItem('user');
      
      console.log('=== UPLOAD DEBUG INFO ===');
      console.log('File name:', file.name);
      console.log('File size:', file.size);
      console.log('File type:', file.type);
      console.log('Token exists:', !!token);
      console.log('Token preview:', token ? token.substring(0, 20) + '...' : 'None');
      console.log('UserData exists:', !!userData);
      console.log('User exists:', !!user);
      
      if (userData) {
        try {
          const parsed = JSON.parse(userData);
          console.log('UserData role:', parsed.role);
          console.log('UserData has token:', !!parsed.token);
        } catch (e) {
          console.log('Error parsing userData:', e);
        }
      }
      
      if (user) {
        try {
          const parsed = JSON.parse(user);
          console.log('User role:', parsed.role);
          console.log('User has token:', !!parsed.token);
        } catch (e) {
          console.log('Error parsing user:', e);
        }
      }
      
      console.log('========================');
      
      const response = await api.post('/uploads', uploadFormData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        onUploadProgress: (progressEvent) => {
          if (progressEvent.total) {
            const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
            setUploadProgress(prev => {
              const newProgress = [...prev];
              newProgress[index] = percentCompleted;
              return newProgress;
            });
          }
        }
      });

      console.log('✅ Upload successful:', response.data);
      
      const imageUrl = response.data.imageUrl;
      
      // Validate the returned URL
      if (!imageUrl) {
        throw new Error('No image URL returned from server');
      }
      
      console.log('📸 Image URL received:', imageUrl);
      
      // Show success toast
      toast({
        title: "Upload Successful",
        description: `Image uploaded successfully: ${file.name}`,
        variant: "default",
      });

      return imageUrl;
    } catch (error: any) {
      console.error('❌ Upload error:', error);
      setUploadProgress(prev => {
        const newProgress = [...prev];
        newProgress[index] = 0;
        return newProgress;
      });
      
      let errorMessage = "Failed to upload image. Please try again.";
      
      if (error.response?.status === 401) {
        errorMessage = "Authentication failed. Please log in again.";
        console.error('🔐 Authentication error - redirecting to login');
        setTimeout(() => navigate('/login'), 2000);
      } else if (error.response?.status === 403) {
        errorMessage = "You don't have permission to upload images.";
        console.error('🚫 Permission denied for upload');
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
        console.error('📝 Server error message:', error.response.data.message);
      } else if (error.message) {
        errorMessage = error.message;
        console.error('💥 Error message:', error.message);
      }
      
      toast({
        title: "Upload Failed",
        description: errorMessage,
        variant: "destructive",
      });
      return null;
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>, index: number) => {
    const file = e.target.files?.[0];
    if (!file) return;

    console.log('🎯 Starting file upload for index:', index);
    console.log('📁 File selected:', file.name);

    setIsUploading(true);
    const imageUrl = await uploadImage(file, index);
    
    if (imageUrl) {
      console.log('🔄 Updating form data with new image URL:', imageUrl);
      
      setFormData(prev => {
        const newImages = [...prev.images];
        newImages[index] = imageUrl;
        
        console.log('📋 Updated images array:', newImages);
        
        return { ...prev, images: newImages };
      });
      
      console.log('✅ Form state updated successfully');
      
      // Clear any previous errors for images
      if (errors.images) {
        setErrors(prev => {
          const newErrors = { ...prev };
          delete newErrors.images;
          return newErrors;
        });
      }
    } else {
      console.log('❌ Upload failed, form state not updated');
    }
    
    setIsUploading(false);
    
    // Clear the file input to allow re-uploading the same file
    e.target.value = '';
  };

  const addImageField = () => {
    setFormData(prev => ({
      ...prev,
      images: [...prev.images, '']
    }));
    setUploadProgress(prev => [...prev, 0]);
  };

  const removeImageField = (index: number) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }));
    setUploadProgress(prev => prev.filter((_, i) => i !== index));
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'price' || name === 'discount' || name === 'countInStock'
        ? Number(value)
        : value
    }));
  };

  const handleSwitchChange = (name: string) => (checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      [name]: checked
    }));
  };

  const handleCategoryChange = (value: string) => {
    setFormData(prev => ({
      ...prev,
      category: value
    }));
  };

  // New handlers for multiple categories
  const handleAddCategory = (categoryToAdd: string) => {
    if (!categoryToAdd || formData.categories?.includes(categoryToAdd)) return;
    
    setFormData(prev => ({
      ...prev,
      categories: [...(prev.categories || []), categoryToAdd]
    }));
  };

  const handleRemoveCategory = (categoryToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      categories: (prev.categories || []).filter(cat => cat !== categoryToRemove)
    }));
  };

  const getAvailableCategories = () => {
    return CATEGORIES.filter(cat => !(formData.categories || []).includes(cat));
  };

  const handleDetailChange = (index: number, value: string) => {
    setFormData(prev => {
      const newDetails = [...(prev.details || [])];
      newDetails[index] = value;
      return {
        ...prev,
        details: newDetails
      };
    });
  };

  const addDetail = () => {
    setFormData(prev => ({
      ...prev,
      details: [...(prev.details || []), '']
    }));
  };
  
  const removeDetail = (index: number) => {
    setFormData(prev => ({
      ...prev,
      details: (prev.details || []).filter((_, i) => i !== index)
    }));
  };

  const handleCareInstructionChange = (index: number, value: string) => {
    setFormData(prev => {
      const newInstructions = [...(prev.careInstructions || [])];
      newInstructions[index] = value;
      return {
        ...prev,
        careInstructions: newInstructions
      };
    });
  };

  const addCareInstruction = () => {
    setFormData(prev => ({
      ...prev,
      careInstructions: [...(prev.careInstructions || []), '']
    }));
  };
  
  const removeCareInstruction = (index: number) => {
    setFormData(prev => ({
      ...prev,
      careInstructions: (prev.careInstructions || []).filter((_, i) => i !== index)
    }));
  };

  const handleNewArrivalChange = (checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      isNewArrival: checked
    }));
  };

  const handleFeaturedChange = (checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      isFeatured: checked
    }));
  };

  const handleHiddenChange = (checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      hidden: checked
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const validationErrors = validateForm();
    
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    try {
      setIsLoading(true);
      
      const productData = {
        ...formData,
        isNewArrival: Boolean(formData.isNewArrival),
        isFeatured: Boolean(formData.isFeatured),
        hidden: Boolean(formData.hidden),
        categories: formData.categories || []
      };
      
      if (isEditMode) {
        await productService.updateProduct(id, productData);
        toast({
          title: "Success",
          description: "Product updated successfully",
          variant: "default",
        });
      } else {
        await productService.createProduct(productData);
        toast({
          title: "Success",
          description: "Product created successfully",
          variant: "default",
        });
      }
      navigate('/admin/products');
    } catch (error) {
      console.error('Error saving product:', error);
      if (axios.isAxiosError(error)) {
        if (error.response?.status === 401) {
          toast({
            title: "Authentication Error",
            description: "You are not authorized. Please log in again.",
            variant: "destructive",
          });
          localStorage.removeItem('userData');
          sessionStorage.removeItem('userData');
          setTimeout(() => {
            navigate('/login');
          }, 2000);
        } else {
          toast({
            title: "Error",
            description: error.response?.data?.message || "Failed to save product. Please try again.",
            variant: "destructive",
          });
        }
      } else {
        toast({
          title: "Error",
          description: "An unexpected error occurred. Please try again.",
          variant: "destructive",
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto py-8">
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate('/admin/products')}
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h1 className="text-2xl font-bold">
            {isEditMode ? 'Edit Product' : 'Add New Product'}
          </h1>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Information */}
        <Card>
          <CardHeader>
            <CardTitle>Basic Information</CardTitle>
            <CardDescription>Enter the basic details of the product</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Product Title *</Label>
              <Input
                id="title"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                placeholder="Enter product title"
              />
              {errors.title && (
                <p className="text-sm text-red-500">{errors.title}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description *</Label>
              <Textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                placeholder="Enter product description"
                rows={4}
              />
              {errors.description && (
                <p className="text-sm text-red-500">{errors.description}</p>
              )}
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="price">Price *</Label>
                <Input
                  id="price"
                  name="price"
                  type="number"
                  value={formData.price}
                  onChange={handleInputChange}
                  placeholder="Enter price"
                  min="0"
                  step="0.01"
                />
                {errors.price && (
                  <p className="text-sm text-red-500">{errors.price}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="discount">Discount (%)</Label>
                <Input
                  id="discount"
                  name="discount"
                  type="number"
                  value={formData.discount}
                  onChange={handleInputChange}
                  placeholder="Enter discount percentage"
                  min="0"
                  max="100"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="countInStock">Stock Quantity *</Label>
                <Input
                  id="countInStock"
                  name="countInStock"
                  type="number"
                  value={formData.countInStock}
                  onChange={handleInputChange}
                  placeholder="Enter stock quantity"
                  min="0"
                />
                {errors.countInStock && (
                  <p className="text-sm text-red-500">{errors.countInStock}</p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Categories & Features */}
        <Card>
          <CardHeader>
            <CardTitle>Categories & Features</CardTitle>
            <CardDescription>Select primary category and additional categories, then set product features</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Primary Category */}
            <div className="space-y-2">
              <Label htmlFor="category">Primary Category *</Label>
              <Select
                value={formData.category}
                onValueChange={handleCategoryChange}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select primary category" />
                </SelectTrigger>
                <SelectContent>
                  {CATEGORIES.map((category) => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.category && (
                <p className="text-sm text-red-500">{errors.category}</p>
              )}
            </div>

            {/* Multiple Categories */}
            <div className="space-y-4">
              <Label>Additional Categories</Label>
              <div className="space-y-3">
                {/* Current Categories */}
                {formData.categories && formData.categories.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {formData.categories.map((category, index) => (
                      <Badge
                        key={index}
                        variant="secondary"
                        className="flex items-center gap-1 px-3 py-1"
                      >
                        {category}
                        <X
                          className="h-3 w-3 cursor-pointer hover:text-red-500"
                          onClick={() => handleRemoveCategory(category)}
                        />
                      </Badge>
                    ))}
                  </div>
                )}

                {/* Add Category */}
                <div className="flex gap-2">
                  <Select
                    onValueChange={handleAddCategory}
                    value=""
                  >
                    <SelectTrigger className="flex-1">
                      <SelectValue placeholder="Add additional category" />
                    </SelectTrigger>
                    <SelectContent>
                      {getAvailableCategories().map((category) => (
                        <SelectItem key={category} value={category}>
                          {category}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <p className="text-sm text-muted-foreground">
                  Add multiple categories to make your product discoverable in different sections
                </p>
              </div>
            </div>

            {!isEditMode && (
              <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg relative z-50">
                <p className="text-sm text-blue-800">
                  <span className="font-medium">ℹ️ Note:</span> New products are hidden by default. 
                  Turn off "Hide Product from Public View" when you're ready to make this product visible to customers.
                </p>
              </div>
            )}
            <div className="space-y-4 relative z-50">
              <ProductFeaturesToggle
                isNewArrival={Boolean(formData.isNewArrival)}
                isFeatured={Boolean(formData.isFeatured)}
                hidden={Boolean(formData.hidden)}
                onNewArrivalChange={handleNewArrivalChange}
                onFeaturedChange={handleFeaturedChange}
                onHiddenChange={handleHiddenChange}
              />
            </div>
          </CardContent>
        </Card>

        {/* Product Images */}
        <Card>
          <CardHeader>
            <CardTitle>Product Images</CardTitle>
            <CardDescription>Upload product images (Max 5MB each)</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {formData.images.map((image, index) => (
              <div key={index} className="space-y-2">
                <div className="flex items-center space-x-2">
                  <Label
                    htmlFor={`image-upload-${index}`}
                    className="flex flex-1 items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 cursor-pointer"
                  >
                    <span className="flex items-center">
                      {image ? (
                        <>
                          <ImageIcon className="h-4 w-4 mr-2" />
                          {image.substring(image.lastIndexOf('/') + 1)}
                        </>
                      ) : (
                        <>
                          <Upload className="h-4 w-4 mr-2" />
                          Choose file...
                        </>
                      )}
                    </span>
                  </Label>
                  <input
                    id={`image-upload-${index}`}
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleFileChange(e, index)}
                    className="hidden"
                    disabled={isUploading}
                  />
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => removeImageField(index)}
                    disabled={isUploading}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
                {uploadProgress[index] > 0 && uploadProgress[index] < 100 && (
                  <div className="w-full bg-gray-200 rounded-full h-2.5">
                    <div
                      className="bg-blue-600 h-2.5 rounded-full"
                      style={{ width: `${uploadProgress[index]}%` }}
                    ></div>
                  </div>
                )}
                {image && (
                  <div className="mt-2">
                    <img
                      src={getImageUrl(image)}
                      alt={`Preview ${index}`}
                      className="h-20 w-20 object-cover rounded-md"
                    />
                  </div>
                )}
              </div>
            ))}
            {errors.images && (
              <p className="text-sm text-red-500">{errors.images}</p>
            )}
            <Button
              type="button"
              variant="outline"
              onClick={addImageField}
              disabled={isUploading || formData.images.length >= 10}
            >
              Add Image (Max 10)
            </Button>
          </CardContent>
        </Card>

        {/* Product Details */}
        <Card>
          <CardHeader>
            <CardTitle>Product Details</CardTitle>
            <CardDescription>Select product characteristics and specifications</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {(formData.details || []).map((detail, index) => (
              <div key={index} className="flex items-center space-x-2">
                <Select
                  value={detail}
                  onValueChange={(value) => handleDetailChange(index, value)}
                >
                  <SelectTrigger className="flex-1">
                    <SelectValue placeholder="Select a product detail" />
                  </SelectTrigger>
                  <SelectContent>
                    {PRODUCT_DETAILS_OPTIONS.map((option) => (
                      <SelectItem key={option} value={option}>
                        {option}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => removeDetail(index)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
            <Button
              type="button"
              variant="outline"
              onClick={addDetail}
            >
              Add Detail
            </Button>
          </CardContent>
        </Card>

        {/* Care Instructions */}
        <Card>
          <CardHeader>
            <CardTitle>Care Instructions</CardTitle>
            <CardDescription>Add care and maintenance instructions for customers</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {(formData.careInstructions || []).map((instruction, index) => (
              <div key={index} className="flex items-center space-x-2">
                <Select
                  value={instruction}
                  onValueChange={(value) => handleCareInstructionChange(index, value)}
                >
                  <SelectTrigger className="flex-1">
                    <SelectValue placeholder="Select a care instruction" />
                  </SelectTrigger>
                  <SelectContent>
                    {CARE_INSTRUCTIONS_OPTIONS.map((option) => (
                      <SelectItem key={option} value={option}>
                        {option}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => removeCareInstruction(index)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
            <Button
              type="button"
              variant="outline"
              onClick={addCareInstruction}
            >
              Add Care Instruction
            </Button>
          </CardContent>
        </Card>

        <div className="flex justify-end space-x-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate('/admin/products')}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={isLoading || isUploading}>
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {isEditMode ? 'Updating...' : 'Creating...'}
              </>
            ) : isEditMode ? 'Update Product' : 'Create Product'}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default ProductForm;