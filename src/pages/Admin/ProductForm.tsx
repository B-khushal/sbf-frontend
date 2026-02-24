import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import type { ProductData, AddonOption, CustomizationOptions } from '@/services/productService';
import productService from '@/services/productService';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { Loader2, Trash2, ArrowLeft, Upload, Image as ImageIcon, Plus, X, Wand2, Flower2, Gift, Camera, Hash, MessageSquare, IndianRupee, AlertCircle } from 'lucide-react';
import api from '../../services/api';
import axios from 'axios'; // Keep for axios.isAxiosError
import ProductFeaturesToggle from '@/components/ui/ProductFeaturesToggle';
import { getImageUrl } from '@/config';

type FormErrors = {
  [key in keyof ProductData]?: string;
};

const CATEGORIES = [
  { value: "bouquets", label: "Bouquets" },
  { value: "flowers", label: "Flowers" },
  { value: "plants", label: "Plants" },
  { value: "combos", label: "Combos" },
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
  { value: "condolence-arrangements", label: "Condolence Arrangements" }
];

const COMBO_SUBCATEGORIES = [
  { value: "cake-combo", label: "Cake Combo" },
  { value: "flower-combo", label: "Flower Combo" },
  { value: "chocolate-combo", label: "Chocolate Combo" },
  { value: "plant-combo", label: "Plant Combo" },
  { value: "custom-combo", label: "Custom Combo" },
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

interface PriceVariant {
  label: string;
  price: number;
  stock: number;
}

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
  hidden: false,
  isCustomizable: false,
  hasPriceVariants: false,
  priceVariants: [],
  customizationOptions: {
    allowPhotoUpload: false,
    allowNumberInput: false,
    numberInputLabel: "Enter number",
    allowMessageCard: false,
    messageCardPrice: 0,
    addons: {
      flowers: [],
      chocolates: []
    },
    previewImage: ""
  },
  comboItems: [],
  comboName: '',
  comboDescription: '',
  comboSubcategory: '',
};

const ProductForm = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { id } = useParams();
  const { toast } = useToast();
  const isEditMode = Boolean(id);
  
  // Determine if user is admin or vendor based on current path
  const isVendorPath = location.pathname.includes('/vendor/');
  const [userRole, setUserRole] = useState<string>('');
  
  // Helper function to get the correct products list route based on user role
  const getProductsListRoute = () => {
    return isVendorPath ? '/vendor/products' : '/admin/products';
  };

  const [formData, setFormData] = useState<ProductData>(initialFormData);
  const [errors, setErrors] = useState<FormErrors>({});
  const [isLoading, setIsLoading] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isDataLoaded, setIsDataLoaded] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<number[]>([]);
  const [newFlowerAddon, setNewFlowerAddon] = useState({ name: "", price: 0 });
  const [newChocolateAddon, setNewChocolateAddon] = useState({ name: "", price: 0 });
  
  // Combo form state
  const [newComboItem, setNewComboItem] = useState({
    name: "",
    description: "",
    image: "",
    price: 0,
    quantity: 1,
    notes: "",
    customizationOptions: {
      allowMessage: false,
      messageLabel: "Message",
      allowColorChoice: false,
      colorOptions: [],
      allowSizeChoice: false,
      sizeOptions: [],
      allowQuantity: false,
      maxQuantity: 1,
      allowPhotoUpload: false,
      allowCustomText: false,
      customTextLabel: "Custom Text",
      allowAddons: false,
      addonOptions: [],
      allowVariants: false,
      variantLabel: "Size",
      variants: []
    }
  });
  const [newColorOption, setNewColorOption] = useState("");
  const [newSizeOption, setNewSizeOption] = useState("");
  const [newAddonOption, setNewAddonOption] = useState("");
  const [newVariant, setNewVariant] = useState({ name: "", price: 0, description: "" });
  const [comboTotalPrice, setComboTotalPrice] = useState(0);
  const [newPriceVariant, setNewPriceVariant] = useState<PriceVariant>({
    label: '',
    price: 0,
    stock: 0
  });

  const fetchProductData = async () => {
    try {
      const token = getAuthToken();
      const data = await productService.getProductById(id);
      
      // Ensure categories is an array
      if (!data.categories) {
        data.categories = [];
      }
      
      // Ensure customization options are properly set
      if (!data.customizationOptions) {
        data.customizationOptions = {
          allowPhotoUpload: false,
          allowNumberInput: false,
          numberInputLabel: "Enter number",
          allowMessageCard: false,
          messageCardPrice: 0,
          addons: {
            flowers: [],
            chocolates: []
          },
          previewImage: ""
        };
      }
      
      // Ensure addons arrays exist
      if (!data.customizationOptions.addons) {
        data.customizationOptions.addons = {
          flowers: [],
          chocolates: []
        };
      }
      
      if (!Array.isArray(data.customizationOptions.addons.flowers)) {
        data.customizationOptions.addons.flowers = [];
      }
      
      if (!Array.isArray(data.customizationOptions.addons.chocolates)) {
        data.customizationOptions.addons.chocolates = [];
      }
      
      // Defensive patch for price variants
      if (typeof data.hasPriceVariants !== 'boolean') data.hasPriceVariants = false;
      if (!Array.isArray(data.priceVariants)) data.priceVariants = [];
      
      console.log('Fetched product data:', {
        title: data.title,
        isCustomizable: data.isCustomizable,
        hasPriceVariants: data.hasPriceVariants,
        priceVariants: data.priceVariants,
        priceVariantsCount: data.priceVariants?.length || 0,
        customizationOptions: data.customizationOptions
      });
      
      // Ensure all required fields are properly set
      const processedData = {
        ...data,
        hasPriceVariants: Boolean(data.hasPriceVariants),
        priceVariants: Array.isArray(data.priceVariants) ? data.priceVariants : [],
        categories: Array.isArray(data.categories) ? data.categories : [],
        details: Array.isArray(data.details) ? data.details : [],
        careInstructions: Array.isArray(data.careInstructions) ? data.careInstructions : [],
        images: Array.isArray(data.images) ? data.images : [],
        comboItems: Array.isArray(data.comboItems) ? data.comboItems : [],
        customizationOptions: data.customizationOptions || {
          allowPhotoUpload: false,
          allowNumberInput: false,
          numberInputLabel: "Enter number",
          allowMessageCard: false,
          messageCardPrice: 0,
          addons: {
            flowers: [],
            chocolates: []
          },
          previewImage: ""
        }
      };

      setFormData(processedData);
      setUploadProgress(new Array(processedData.images.length).fill(100));
      setIsDataLoaded(true);
      
      console.log('Form data set:', {
        hasPriceVariants: processedData.hasPriceVariants,
        priceVariants: processedData.priceVariants,
        priceVariantsCount: processedData.priceVariants?.length || 0
      });
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
            navigate(getProductsListRoute());
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

      let currentUserRole = '';
      let hasAccess = false;
      
      try {
        if (userData) {
          const parsed = JSON.parse(userData);
          currentUserRole = parsed.role;
          hasAccess = parsed.role === 'admin' || parsed.role === 'vendor';
        } else if (user) {
          const parsed = JSON.parse(user);
          currentUserRole = parsed.role;
          hasAccess = parsed.role === 'admin' || parsed.role === 'vendor';
        }
        
        const storedRole = localStorage.getItem('role');
        if (storedRole === 'admin' || storedRole === 'vendor') {
          currentUserRole = storedRole;
          hasAccess = true;
        }
        
        setUserRole(currentUserRole);
        
        if (!hasAccess) {
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
        } else {
          // For new products, mark data as loaded immediately
          setIsDataLoaded(true);
        }
      } catch (err) {
        console.error('Error checking auth role:', err);
      }
    }, 500);
    
    return () => clearTimeout(checkAuth);
  }, []);

  // Monitor formData changes for debugging
  useEffect(() => {
    if (isEditMode) {
      console.log('FormData changed:', {
        hasPriceVariants: formData.hasPriceVariants,
        priceVariants: formData.priceVariants,
        priceVariantsCount: formData.priceVariants?.length || 0
      });
    }
  }, [formData.hasPriceVariants, formData.priceVariants, isEditMode]);

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

    if (formData.hasPriceVariants && formData.priceVariants.length === 0) {
      newErrors.priceVariants = "At least one price variant is required when variants are enabled";
    }

    // Validate individual price variants
    if (formData.hasPriceVariants && formData.priceVariants.length > 0) {
      for (let i = 0; i < formData.priceVariants.length; i++) {
        const variant = formData.priceVariants[i];
        if (!variant.label.trim()) {
          newErrors.priceVariants = `Variant ${i + 1} must have a label`;
          break;
        }
        if (variant.price <= 0) {
          newErrors.priceVariants = `Variant ${i + 1} must have a price greater than 0`;
          break;
        }
        if (variant.stock < 0) {
          newErrors.priceVariants = `Variant ${i + 1} cannot have negative stock`;
          break;
        }
      }
    }

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
        params: {
          type: 'product'  // Specify product type for 50MB limit
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
    if (name === 'hasPriceVariants') {
      setFormData(prev => ({
        ...prev,
        hasPriceVariants: checked,
        priceVariants: checked ? prev.priceVariants : []
      }));
      
      // Clear any price variant related errors when disabling variants
      if (!checked) {
        setErrors(prev => {
          const newErrors = { ...prev };
          delete newErrors.priceVariants;
          return newErrors;
        });
      }
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: checked
      }));
    }
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
    return CATEGORIES.filter(cat => !(formData.categories || []).includes(cat.value));
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

  const handleComboSubcategoryChange = (value: string) => {
    setFormData(prev => ({
      ...prev,
      comboSubcategory: value
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
        comboSubcategory: formData.comboSubcategory || '', // <-- ensure it's included
        // Send both keys so backend variants persist consistently.
        isNew: Boolean(formData.isNewArrival),
        isNewArrival: Boolean(formData.isNewArrival),
        isFeatured: Boolean(formData.isFeatured),
        hidden: Boolean(formData.hidden),
        isCustomizable: Boolean(formData.isCustomizable),
        hasPriceVariants: Boolean(formData.hasPriceVariants),
        priceVariants: formData.priceVariants || [],
        categories: formData.categories || [],
        customizationOptions: formData.isCustomizable ? {
          allowPhotoUpload: Boolean(formData.customizationOptions?.allowPhotoUpload),
          allowNumberInput: Boolean(formData.customizationOptions?.allowNumberInput),
          numberInputLabel: formData.customizationOptions?.numberInputLabel || "Enter number",
          allowMessageCard: Boolean(formData.customizationOptions?.allowMessageCard),
          messageCardPrice: Number(formData.customizationOptions?.messageCardPrice) || 0,
          addons: {
            flowers: formData.customizationOptions?.addons?.flowers || [],
            chocolates: formData.customizationOptions?.addons?.chocolates || []
          },
          previewImage: formData.customizationOptions?.previewImage || ""
        } : undefined
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
      navigate(getProductsListRoute());
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

  const addFlowerAddon = () => {
    if (newFlowerAddon.name && newFlowerAddon.price > 0) {
      setFormData(prev => ({
        ...prev,
        customizationOptions: {
          ...prev.customizationOptions,
          addons: {
            ...prev.customizationOptions.addons,
            flowers: [...prev.customizationOptions.addons.flowers, { ...newFlowerAddon, type: 'flower' }]
          }
        }
      }));
      setNewFlowerAddon({ name: "", price: 0 });
    }
  };

  const addChocolateAddon = () => {
    if (newChocolateAddon.name && newChocolateAddon.price > 0) {
      setFormData(prev => ({
        ...prev,
        customizationOptions: {
          ...prev.customizationOptions,
          addons: {
            ...prev.customizationOptions.addons,
            chocolates: [...prev.customizationOptions.addons.chocolates, { ...newChocolateAddon, type: 'chocolate' }]
          }
        }
      }));
      setNewChocolateAddon({ name: "", price: 0 });
    }
  };

  const removeAddon = (type: 'flower' | 'chocolate', index: number) => {
    setFormData(prev => ({
      ...prev,
      customizationOptions: {
        ...prev.customizationOptions,
        addons: {
          ...prev.customizationOptions.addons,
          [type === 'flower' ? 'flowers' : 'chocolates']: prev.customizationOptions.addons[type === 'flower' ? 'flowers' : 'chocolates'].filter((_, i) => i !== index)
        }
      }
    }));
  };

  // Combo item handlers
  const addComboItem = () => {
    if (newComboItem.name.trim() && newComboItem.price >= 0) {
      setFormData(prev => ({
        ...prev,
        comboItems: [...(prev.comboItems || []), { ...newComboItem }]
      }));
      setNewComboItem({
        name: "",
        description: "",
        image: "",
        price: 0,
        quantity: 1,
        notes: "",
        customizationOptions: {
          allowMessage: false,
          messageLabel: "Message",
          allowColorChoice: false,
          colorOptions: [],
          allowSizeChoice: false,
          sizeOptions: [],
          allowQuantity: false,
          maxQuantity: 1,
          allowPhotoUpload: false,
          allowCustomText: false,
          customTextLabel: "Custom Text",
          allowAddons: false,
          addonOptions: [],
          allowVariants: false,
          variantLabel: "Size",
          variants: []
        }
      });
    }
  };

  const removeComboItem = (index: number) => {
    setFormData(prev => ({
      ...prev,
      comboItems: (prev.comboItems || []).filter((_, i) => i !== index)
    }));
  };

  const updateComboItem = (index: number, field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      comboItems: (prev.comboItems || []).map((item, i) => 
        i === index ? { ...item, [field]: value } : item
      )
    }));
  };

  const updateComboItemCustomization = (itemIndex: number, field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      comboItems: (prev.comboItems || []).map((item, i) => 
        i === itemIndex ? {
          ...item,
          customizationOptions: {
            ...item.customizationOptions,
            [field]: value
          }
        } : item
      )
    }));
  };

  const addColorOption = (itemIndex: number) => {
    if (newColorOption.trim()) {
      setFormData(prev => ({
        ...prev,
        comboItems: (prev.comboItems || []).map((item, i) => 
          i === itemIndex ? {
            ...item,
            customizationOptions: {
              ...item.customizationOptions,
              colorOptions: [...item.customizationOptions.colorOptions, newColorOption.trim()]
            }
          } : item
        )
      }));
      setNewColorOption("");
    }
  };

  const removeColorOption = (itemIndex: number, colorIndex: number) => {
    setFormData(prev => ({
      ...prev,
      comboItems: (prev.comboItems || []).map((item, i) => 
        i === itemIndex ? {
          ...item,
          customizationOptions: {
            ...item.customizationOptions,
            colorOptions: item.customizationOptions.colorOptions.filter((_, ci) => ci !== colorIndex)
          }
        } : item
      )
    }));
  };

  const addSizeOption = (itemIndex: number) => {
    if (newSizeOption.trim()) {
      setFormData(prev => ({
        ...prev,
        comboItems: (prev.comboItems || []).map((item, i) => 
          i === itemIndex ? {
            ...item,
            customizationOptions: {
              ...item.customizationOptions,
              sizeOptions: [...item.customizationOptions.sizeOptions, newSizeOption.trim()]
            }
          } : item
        )
      }));
      setNewSizeOption("");
    }
  };

  const removeSizeOption = (itemIndex: number, sizeIndex: number) => {
    setFormData(prev => ({
      ...prev,
      comboItems: (prev.comboItems || []).map((item, i) => 
        i === itemIndex ? {
          ...item,
          customizationOptions: {
            ...item.customizationOptions,
            sizeOptions: item.customizationOptions.sizeOptions.filter((_, si) => si !== sizeIndex)
          }
        } : item
      )
    }));
  };

  const addAddonOption = (itemIndex: number) => {
    if (newAddonOption.trim()) {
      setFormData(prev => ({
        ...prev,
        comboItems: (prev.comboItems || []).map((item, i) => 
          i === itemIndex ? {
            ...item,
            customizationOptions: {
              ...item.customizationOptions,
              addonOptions: [...item.customizationOptions.addonOptions, newAddonOption.trim()]
            }
          } : item
        )
      }));
      setNewAddonOption("");
    }
  };

  const removeAddonOption = (itemIndex: number, addonIndex: number) => {
    setFormData(prev => ({
      ...prev,
      comboItems: (prev.comboItems || []).map((item, i) => 
        i === itemIndex ? {
          ...item,
          customizationOptions: {
            ...item.customizationOptions,
            addonOptions: item.customizationOptions.addonOptions.filter((_, ai) => ai !== addonIndex)
          }
        } : item
      )
    }));
  };

  // Variant handlers
  const addVariant = (itemIndex: number) => {
    if (newVariant.name.trim() && newVariant.price >= 0) {
      setFormData(prev => ({
        ...prev,
        comboItems: (prev.comboItems || []).map((item, i) => 
          i === itemIndex ? {
            ...item,
            customizationOptions: {
              ...item.customizationOptions,
              variants: [...(item.customizationOptions.variants || []), { ...newVariant }]
            }
          } : item
        )
      }));
      setNewVariant({ name: "", price: 0, description: "" });
    }
  };

  const removeVariant = (itemIndex: number, variantIndex: number) => {
    setFormData(prev => ({
      ...prev,
      comboItems: (prev.comboItems || []).map((item, i) => 
        i === itemIndex ? {
          ...item,
          customizationOptions: {
            ...item.customizationOptions,
            variants: (item.customizationOptions.variants || []).filter((_, index) => index !== variantIndex)
          }
        } : item
      )
    }));
  };

  // Calculate total combo price
  const calculateComboTotalPrice = useCallback(() => {
    if (formData.category !== "combos" || !formData.comboItems || formData.comboItems.length === 0) {
      return formData.price;
    }

    let total = formData.price; // Base price

    // Add individual item prices
    formData.comboItems.forEach(item => {
      total += item.price * item.quantity;
    });

    return total;
  }, [formData.category, formData.price, formData.comboItems]);

  // Update total price when combo items change
  useEffect(() => {
    const total = calculateComboTotalPrice();
    setComboTotalPrice(total);
  }, [calculateComboTotalPrice]);

  const handlePriceVariantChange = (field: keyof PriceVariant, value: string | number) => {
    setNewPriceVariant(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const addPriceVariant = () => {
    if (!newPriceVariant.label.trim()) {
      toast({
        title: "Validation Error",
        description: "Please enter a label for the variant",
        variant: "destructive"
      });
      return;
    }

    if (newPriceVariant.price <= 0) {
      toast({
        title: "Validation Error",
        description: "Please enter a price greater than 0",
        variant: "destructive"
      });
      return;
    }

    if (newPriceVariant.stock < 0) {
      toast({
        title: "Validation Error",
        description: "Stock cannot be negative",
        variant: "destructive"
      });
      return;
    }

    // Check for duplicate labels
    if (formData.priceVariants.some(variant => variant.label.toLowerCase() === newPriceVariant.label.toLowerCase())) {
      toast({
        title: "Validation Error",
        description: "A variant with this label already exists",
        variant: "destructive"
      });
      return;
    }

    setFormData(prev => ({
      ...prev,
      priceVariants: [...(prev.priceVariants || []), { ...newPriceVariant }]
    }));

    setNewPriceVariant({
      label: '',
      price: 0,
      stock: 0
    });

    // Clear any existing price variant errors
    if (errors.priceVariants) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors.priceVariants;
        return newErrors;
      });
    }

    toast({
      title: "Success",
      description: `Added variant: ${newPriceVariant.label}`,
      variant: "default"
    });
  };

  const removePriceVariant = (index: number) => {
    setFormData(prev => ({
      ...prev,
      priceVariants: prev.priceVariants.filter((_, i) => i !== index)
    }));
  };

  // Show loading state while data is being fetched in edit mode
  if (isEditMode && !isDataLoaded) {
    return (
      <div className="container mx-auto py-8">
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate(getProductsListRoute())}
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <h1 className="text-2xl font-bold">Edit Product</h1>
          </div>
        </div>
        
        <div className="flex items-center justify-center py-20">
          <div className="flex items-center space-x-2">
            <Loader2 className="h-6 w-6 animate-spin" />
            <span>Loading product data...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8">
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate(getProductsListRoute())}
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h1 className="text-2xl font-bold">
            {isEditMode ? 'Edit Product' : 'Add New Product'}
          </h1>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8 pb-10">
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

        {/* Price Variants */}
        <Card className="border-2 border-dashed border-purple-200 bg-gradient-to-br from-purple-50 to-pink-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-3 text-purple-800">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-purple-100">
                <IndianRupee className="h-5 w-5 text-purple-600" />
              </div>
              Price Variants
            </CardTitle>
            <CardDescription className="text-purple-600">
              Add multiple price variants for different sizes or quantities
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Main Toggle */}
            <div className="flex items-center justify-between rounded-lg border border-purple-200 bg-white p-4">
              <div className="flex items-center space-x-3">
                <Switch
                  id="hasPriceVariants"
                  checked={formData.hasPriceVariants}
                  onCheckedChange={(checked) => handleSwitchChange('hasPriceVariants')(checked)}
                />
                <div>
                  <Label htmlFor="hasPriceVariants" className="text-base font-medium">Enable Price Variants</Label>
                  <p className="text-sm text-gray-500">Allow different prices for different sizes/quantities</p>
                </div>
              </div>
              {formData.hasPriceVariants && (
                <Badge variant="secondary" className="bg-purple-100 text-purple-700">
                  <IndianRupee className="mr-1 h-3 w-3" />
                  Multiple Prices
                </Badge>
              )}
            </div>

            {formData.hasPriceVariants && (
              <div className="space-y-6 rounded-lg border border-purple-200 bg-white p-6">
                {/* Add New Variant */}
                <div className="space-y-4">
                  <h4 className="font-medium text-gray-900">Add New Variant</h4>
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                    <div className="space-y-2">
                      <Label>Label</Label>
                      <Input
                        placeholder="e.g., Small, Medium, Large"
                        value={newPriceVariant.label}
                        onChange={(e) => handlePriceVariantChange('label', e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Price (₹)</Label>
                      <Input
                        type="number"
                        placeholder="Enter price"
                        value={newPriceVariant.price}
                        onChange={(e) => handlePriceVariantChange('price', Number(e.target.value))}
                        min="0"
                        step="0.01"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Stock</Label>
                      <Input
                        type="number"
                        placeholder="Enter stock"
                        value={newPriceVariant.stock}
                        onChange={(e) => handlePriceVariantChange('stock', Number(e.target.value))}
                        min="0"
                      />
                    </div>
                  </div>
                  <Button 
                    type="button" 
                    onClick={addPriceVariant}
                    className="w-full bg-purple-600 hover:bg-purple-700"
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    Add Variant
                  </Button>
                </div>

                {/* Existing Variants */}
                {formData.priceVariants.length > 0 && (
                  <div className="space-y-4">
                    <h4 className="font-medium text-gray-900">Current Variants</h4>
                    <div className="space-y-3">
                      {formData.priceVariants.map((variant, index) => (
                        <div
                          key={index}
                          className="flex items-center justify-between rounded-lg border border-gray-200 bg-gray-50 p-4"
                        >
                          <div className="flex-1 space-y-1">
                            <div className="flex items-center gap-2">
                              <span className="font-medium text-gray-900">{variant.label}</span>
                              <Badge variant="outline" className="bg-purple-50 text-purple-700">
                                ₹{variant.price}
                              </Badge>
                            </div>
                            <div className="text-sm text-gray-500">
                              Stock: {variant.stock} units
                            </div>
                          </div>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => removePriceVariant(index)}
                            className="text-red-500 hover:text-red-700 hover:bg-red-50"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Price Variants Error Display */}
                {errors.priceVariants && (
                  <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                    <p className="text-sm text-red-600 flex items-center gap-2">
                      <AlertCircle className="h-4 w-4" />
                      {errors.priceVariants}
                    </p>
                  </div>
                )}
              </div>
            )}
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
                    <SelectItem key={category.value} value={category.value}>
                      {category.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.category && (
                <p className="text-sm text-red-500">{errors.category}</p>
              )}
            </div>
            {/* Combo Subcategory Dropdown */}
            {formData.category === 'combos' && (
              <div className="space-y-2">
                <Label htmlFor="comboSubcategory">Combo Subcategory *</Label>
                <Select
                  value={formData.comboSubcategory}
                  onValueChange={handleComboSubcategoryChange}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select combo subcategory" />
                  </SelectTrigger>
                  <SelectContent>
                    {COMBO_SUBCATEGORIES.map((subcategory) => (
                      <SelectItem key={subcategory.value} value={subcategory.value}>
                        {subcategory.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

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
                        <SelectItem key={category.value} value={category.value}>
                          {category.label}
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

        {/* Enhanced Customization Section */}
        <Card className="border-2 border-dashed border-purple-200 bg-gradient-to-br from-purple-50 to-pink-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-3 text-purple-800">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-purple-100">
                <Wand2 className="h-5 w-5 text-purple-600" />
              </div>
              Product Customization
            </CardTitle>
            <CardDescription className="text-purple-600">
              Enable customers to personalize this product with photos, messages, and add-ons
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Main Toggle */}
            <div className="flex items-center justify-between rounded-lg border border-purple-200 bg-white p-4">
              <div className="flex items-center space-x-3">
                <Switch
                  id="isCustomizable"
                  checked={formData.isCustomizable}
                  onCheckedChange={(checked) => 
                    setFormData(prev => ({ ...prev, isCustomizable: checked }))
                  }
                />
                <div>
                  <Label htmlFor="isCustomizable" className="text-base font-medium">Enable Product Customization</Label>
                  <p className="text-sm text-gray-500">Allow customers to personalize this product</p>
                </div>
              </div>
              {formData.isCustomizable && (
                <Badge variant="secondary" className="bg-purple-100 text-purple-700">
                  <Wand2 className="mr-1 h-3 w-3" />
                  Customizable
                </Badge>
              )}
            </div>

            {formData.isCustomizable && (
              <div className="space-y-6 rounded-lg border border-purple-200 bg-white p-6">
                {/* Photo Upload Option */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100">
                        <Camera className="h-4 w-4 text-blue-600" />
                      </div>
                      <div>
                        <Label htmlFor="allowPhotoUpload" className="text-base font-medium">Photo Upload</Label>
                        <p className="text-sm text-gray-500">Allow customers to upload personal photos</p>
                      </div>
                    </div>
                    <Switch
                      id="allowPhotoUpload"
                      checked={formData.customizationOptions?.allowPhotoUpload}
                      onCheckedChange={(checked) => 
                        setFormData(prev => ({
                          ...prev,
                          customizationOptions: {
                            ...prev.customizationOptions,
                            allowPhotoUpload: checked
                          }
                        }))
                      }
                    />
                  </div>
                </div>

                <Separator />

                {/* Number Input Option */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-green-100">
                        <Hash className="h-4 w-4 text-green-600" />
                      </div>
                      <div>
                        <Label htmlFor="allowNumberInput" className="text-base font-medium">Number Input</Label>
                        <p className="text-sm text-gray-500">Allow customers to enter custom numbers (age, quantity, etc.)</p>
                      </div>
                    </div>
                    <Switch
                      id="allowNumberInput"
                      checked={formData.customizationOptions?.allowNumberInput}
                      onCheckedChange={(checked) => 
                        setFormData(prev => ({
                          ...prev,
                          customizationOptions: {
                            ...prev.customizationOptions,
                            allowNumberInput: checked
                          }
                        }))
                      }
                    />
                  </div>
                  {formData.customizationOptions?.allowNumberInput && (
                    <div className="ml-11">
                      <Input
                        placeholder="Number input label (e.g., 'Enter age', 'Quantity')"
                        value={formData.customizationOptions?.numberInputLabel}
                        onChange={(e) => 
                          setFormData(prev => ({
                            ...prev,
                            customizationOptions: {
                              ...prev.customizationOptions,
                              numberInputLabel: e.target.value
                            }
                          }))
                        }
                        className="max-w-md"
                      />
                    </div>
                  )}
                </div>

                <Separator />

                {/* Message Card Option */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-yellow-100">
                        <MessageSquare className="h-4 w-4 text-yellow-600" />
                      </div>
                      <div>
                        <Label htmlFor="allowMessageCard" className="text-base font-medium">Message Card</Label>
                        <p className="text-sm text-gray-500">Allow customers to add personalized messages</p>
                      </div>
                    </div>
                    <Switch
                      id="allowMessageCard"
                      checked={formData.customizationOptions?.allowMessageCard}
                      onCheckedChange={(checked) => 
                        setFormData(prev => ({
                          ...prev,
                          customizationOptions: {
                            ...prev.customizationOptions,
                            allowMessageCard: checked
                          }
                        }))
                      }
                    />
                  </div>
                  {formData.customizationOptions?.allowMessageCard && (
                    <div className="ml-11 flex items-center space-x-2">
                      <IndianRupee className="h-4 w-4 text-gray-400" />
                      <Input
                        type="number"
                        placeholder="Message card price"
                        value={formData.customizationOptions?.messageCardPrice}
                        onChange={(e) => 
                          setFormData(prev => ({
                            ...prev,
                            customizationOptions: {
                              ...prev.customizationOptions,
                              messageCardPrice: parseFloat(e.target.value) || 0
                            }
                          }))
                        }
                        className="w-32"
                      />
                    </div>
                  )}
                </div>

                <Separator />

                {/* Add-ons Section */}
                <div className="space-y-4">
                  <h4 className="text-lg font-semibold text-gray-800">Add-ons</h4>
                  
                  {/* Flower Add-ons */}
                  <div className="space-y-3 rounded-lg border border-green-200 bg-green-50 p-4">
                    <div className="flex items-center space-x-2">
                      <Flower2 className="h-5 w-5 text-green-600" />
                      <Label className="text-base font-medium text-green-800">Flower Add-ons</Label>
                    </div>
                    <div className="flex space-x-2">
                      <Input
                        placeholder="Flower name (e.g., 'Red Roses')"
                        value={newFlowerAddon.name}
                        onChange={(e) => setNewFlowerAddon(prev => ({ ...prev, name: e.target.value }))}
                        className="flex-1"
                      />
                      <div className="flex items-center space-x-1">
                        <IndianRupee className="h-4 w-4 text-gray-400" />
                        <Input
                          type="number"
                          placeholder="Price"
                          value={newFlowerAddon.price}
                          onChange={(e) => setNewFlowerAddon(prev => ({ ...prev, price: parseFloat(e.target.value) || 0 }))}
                          className="w-24"
                        />
                      </div>
                      <Button 
                        type="button" 
                        onClick={addFlowerAddon} 
                        size="sm"
                        className="bg-green-600 hover:bg-green-700"
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                    <div className="space-y-2">
                      {formData.customizationOptions?.addons?.flowers.map((flower, index) => (
                        <div key={index} className="flex items-center justify-between bg-white p-3 rounded-lg border border-green-200">
                          <div className="flex items-center space-x-2">
                            <Flower2 className="h-4 w-4 text-green-600" />
                            <span className="font-medium">{flower.name}</span>
                            <Badge variant="outline" className="text-green-700 border-green-300">
                              ₹{flower.price}
                            </Badge>
                          </div>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => removeAddon('flower', index)}
                            className="text-red-500 hover:text-red-700 hover:bg-red-50"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Chocolate Add-ons */}
                  <div className="space-y-3 rounded-lg border border-orange-200 bg-orange-50 p-4">
                    <div className="flex items-center space-x-2">
                      <Gift className="h-5 w-5 text-orange-600" />
                      <Label className="text-base font-medium text-orange-800">Chocolate Add-ons</Label>
                    </div>
                    <div className="flex space-x-2">
                      <Input
                        placeholder="Chocolate name (e.g., 'Dark Chocolate Truffles')"
                        value={newChocolateAddon.name}
                        onChange={(e) => setNewChocolateAddon(prev => ({ ...prev, name: e.target.value }))}
                        className="flex-1"
                      />
                      <div className="flex items-center space-x-1">
                        <IndianRupee className="h-4 w-4 text-gray-400" />
                        <Input
                          type="number"
                          placeholder="Price"
                          value={newChocolateAddon.price}
                          onChange={(e) => setNewChocolateAddon(prev => ({ ...prev, price: parseFloat(e.target.value) || 0 }))}
                          className="w-24"
                        />
                      </div>
                      <Button 
                        type="button" 
                        onClick={addChocolateAddon} 
                        size="sm"
                        className="bg-orange-600 hover:bg-orange-700"
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                    <div className="space-y-2">
                      {formData.customizationOptions?.addons?.chocolates.map((chocolate, index) => (
                        <div key={index} className="flex items-center justify-between bg-white p-3 rounded-lg border border-orange-200">
                          <div className="flex items-center space-x-2">
                            <Gift className="h-4 w-4 text-orange-600" />
                            <span className="font-medium">{chocolate.name}</span>
                            <Badge variant="outline" className="text-orange-700 border-orange-300">
                              ₹{chocolate.price}
                            </Badge>
                          </div>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => removeAddon('chocolate', index)}
                            className="text-red-500 hover:text-red-700 hover:bg-red-50"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <Separator />

                {/* Preview Image */}
                <div className="space-y-3">
                  <Label className="text-base font-medium">Preview Image</Label>
                  <p className="text-sm text-gray-500">URL for the customization preview image</p>
                  <Input
                    type="text"
                    placeholder="https://example.com/preview-image.jpg"
                    value={formData.customizationOptions?.previewImage}
                    onChange={(e) => 
                      setFormData(prev => ({
                        ...prev,
                        customizationOptions: {
                          ...prev.customizationOptions,
                          previewImage: e.target.value
                        }
                      }))
                    }
                  />
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Combo Items Section - Only show when category is "combos" */}
        {formData.category === "combos" && (
          <Card className="border-2 border-dashed border-blue-200 bg-gradient-to-br from-blue-50 to-indigo-50">
            <CardHeader>
              <CardTitle className="flex items-center gap-3 text-blue-800">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100">
                  <Gift className="h-5 w-5 text-blue-600" />
                </div>
                Combo Items
              </CardTitle>
              <CardDescription className="text-blue-600">
                Add multiple items to create a perfect combo package
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Combo Name and Description */}
              <div className="space-y-4 rounded-lg border border-blue-200 bg-white p-4">
                <h4 className="text-lg font-semibold text-gray-800">Combo Details</h4>
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="comboName">Combo Name</Label>
                    <Input
                      id="comboName"
                      value={formData.comboName || ""}
                      onChange={(e) => setFormData(prev => ({ ...prev, comboName: e.target.value }))}
                      placeholder="e.g., Birthday Special Combo"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="comboDescription">Combo Description</Label>
                    <Textarea
                      id="comboDescription"
                      value={formData.comboDescription || ""}
                      onChange={(e) => setFormData(prev => ({ ...prev, comboDescription: e.target.value }))}
                      placeholder="Describe what's included in this combo"
                      rows={2}
                    />
                  </div>
                </div>
              </div>

              {/* Add New Combo Item */}
              <div className="space-y-4 rounded-lg border border-blue-200 bg-white p-4">
                <h4 className="text-lg font-semibold text-gray-800">Add New Item</h4>
                <div className="space-y-4">
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="newItemName">Item Name *</Label>
                      <Input
                        id="newItemName"
                        value={newComboItem.name}
                        onChange={(e) => setNewComboItem(prev => ({ ...prev, name: e.target.value }))}
                        placeholder="e.g., Red Roses, Chocolate Cake"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="newItemImage">Item Image URL</Label>
                      <Input
                        id="newItemImage"
                        value={newComboItem.image}
                        onChange={(e) => setNewComboItem(prev => ({ ...prev, image: e.target.value }))}
                        placeholder="https://example.com/image.jpg"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="newItemDescription">Item Description</Label>
                    <Textarea
                      id="newItemDescription"
                      value={newComboItem.description}
                      onChange={(e) => setNewComboItem(prev => ({ ...prev, description: e.target.value }))}
                      placeholder="Describe this item"
                      rows={2}
                    />
                  </div>
                  
                  {/* Pricing and Quantity Fields */}
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                    <div className="space-y-2">
                      <Label htmlFor="newItemPrice">Item Price (₹) *</Label>
                      <Input
                        id="newItemPrice"
                        type="number"
                        value={newComboItem.price}
                        onChange={(e) => setNewComboItem(prev => ({ ...prev, price: Number(e.target.value) }))}
                        placeholder="0"
                        min="0"
                        step="0.01"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="newItemQuantity">Default Quantity</Label>
                      <Input
                        id="newItemQuantity"
                        type="number"
                        value={newComboItem.quantity}
                        onChange={(e) => setNewComboItem(prev => ({ ...prev, quantity: Number(e.target.value) }))}
                        placeholder="1"
                        min="1"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="newItemNotes">Notes (Optional)</Label>
                      <Input
                        id="newItemNotes"
                        value={newComboItem.notes}
                        onChange={(e) => setNewComboItem(prev => ({ ...prev, notes: e.target.value }))}
                        placeholder="Special instructions or notes"
                      />
                    </div>
                  </div>
                  
                  {/* Customization Options for New Item */}
                  <div className="space-y-4 rounded-lg border border-gray-200 bg-gray-50 p-4">
                    <h5 className="font-medium text-gray-800">Customization Options</h5>
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                      <div className="flex items-center space-x-2">
                        <Switch
                          id="allowMessage"
                          checked={newComboItem.customizationOptions.allowMessage}
                          onCheckedChange={(checked) => 
                            setNewComboItem(prev => ({
                              ...prev,
                              customizationOptions: {
                                ...prev.customizationOptions,
                                allowMessage: checked
                              }
                            }))
                          }
                        />
                        <Label htmlFor="allowMessage">Allow Message</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Switch
                          id="allowColorChoice"
                          checked={newComboItem.customizationOptions.allowColorChoice}
                          onCheckedChange={(checked) => 
                            setNewComboItem(prev => ({
                              ...prev,
                              customizationOptions: {
                                ...prev.customizationOptions,
                                allowColorChoice: checked
                              }
                            }))
                          }
                        />
                        <Label htmlFor="allowColorChoice">Allow Color Choice</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Switch
                          id="allowSizeChoice"
                          checked={newComboItem.customizationOptions.allowSizeChoice}
                          onCheckedChange={(checked) => 
                            setNewComboItem(prev => ({
                              ...prev,
                              customizationOptions: {
                                ...prev.customizationOptions,
                                allowSizeChoice: checked
                              }
                            }))
                          }
                        />
                        <Label htmlFor="allowSizeChoice">Allow Size Choice</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Switch
                          id="allowQuantity"
                          checked={newComboItem.customizationOptions.allowQuantity}
                          onCheckedChange={(checked) => 
                            setNewComboItem(prev => ({
                              ...prev,
                              customizationOptions: {
                                ...prev.customizationOptions,
                                allowQuantity: checked
                              }
                            }))
                          }
                        />
                        <Label htmlFor="allowQuantity">Allow Quantity</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Switch
                          id="allowPhotoUpload"
                          checked={newComboItem.customizationOptions.allowPhotoUpload}
                          onCheckedChange={(checked) => 
                            setNewComboItem(prev => ({
                              ...prev,
                              customizationOptions: {
                                ...prev.customizationOptions,
                                allowPhotoUpload: checked
                              }
                            }))
                          }
                        />
                        <Label htmlFor="allowPhotoUpload">Allow Photo Upload</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Switch
                          id="allowCustomText"
                          checked={newComboItem.customizationOptions.allowCustomText}
                          onCheckedChange={(checked) => 
                            setNewComboItem(prev => ({
                              ...prev,
                              customizationOptions: {
                                ...prev.customizationOptions,
                                allowCustomText: checked
                              }
                            }))
                          }
                        />
                        <Label htmlFor="allowCustomText">Allow Custom Text</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Switch
                          id="allowAddons"
                          checked={newComboItem.customizationOptions.allowAddons}
                          onCheckedChange={(checked) => 
                            setNewComboItem(prev => ({
                              ...prev,
                              customizationOptions: {
                                ...prev.customizationOptions,
                                allowAddons: checked
                              }
                            }))
                          }
                        />
                        <Label htmlFor="allowAddons">Allow Add-ons</Label>
                      </div>
                    </div>

                    {/* Conditional fields based on switches */}
                    {newComboItem.customizationOptions.allowMessage && (
                      <div className="space-y-2">
                        <Label htmlFor="messageLabel">Message Label</Label>
                        <Input
                          id="messageLabel"
                          value={newComboItem.customizationOptions.messageLabel}
                          onChange={(e) => 
                            setNewComboItem(prev => ({
                              ...prev,
                              customizationOptions: {
                                ...prev.customizationOptions,
                                messageLabel: e.target.value
                              }
                            }))
                          }
                          placeholder="e.g., Birthday Message"
                        />
                      </div>
                    )}

                    {newComboItem.customizationOptions.allowColorChoice && (
                      <div className="space-y-2">
                        <Label>Color Options</Label>
                        <div className="flex space-x-2">
                          <Input
                            value={newColorOption}
                            onChange={(e) => setNewColorOption(e.target.value)}
                            placeholder="e.g., Red, Pink, White"
                          />
                          <Button type="button" onClick={() => addColorOption(-1)} size="sm">
                            <Plus className="h-4 w-4" />
                          </Button>
                        </div>
                        {newComboItem.customizationOptions.colorOptions.length > 0 && (
                          <div className="flex flex-wrap gap-2">
                            {newComboItem.customizationOptions.colorOptions.map((color, index) => (
                              <Badge key={index} variant="outline" className="flex items-center gap-1">
                                {color}
                                <X
                                  className="h-3 w-3 cursor-pointer"
                                  onClick={() => {
                                    setNewComboItem(prev => ({
                                      ...prev,
                                      customizationOptions: {
                                        ...prev.customizationOptions,
                                        colorOptions: prev.customizationOptions.colorOptions.filter((_, i) => i !== index)
                                      }
                                    }));
                                  }}
                                />
                              </Badge>
                            ))}
                          </div>
                        )}
                      </div>
                    )}

                    {newComboItem.customizationOptions.allowSizeChoice && (
                      <div className="space-y-2">
                        <Label>Size Options</Label>
                        <div className="flex space-x-2">
                          <Input
                            value={newSizeOption}
                            onChange={(e) => setNewSizeOption(e.target.value)}
                            placeholder="e.g., Small, Medium, Large"
                          />
                          <Button type="button" onClick={() => addSizeOption(-1)} size="sm">
                            <Plus className="h-4 w-4" />
                          </Button>
                        </div>
                        {newComboItem.customizationOptions.sizeOptions.length > 0 && (
                          <div className="flex flex-wrap gap-2">
                            {newComboItem.customizationOptions.sizeOptions.map((size, index) => (
                              <Badge key={index} variant="outline" className="flex items-center gap-1">
                                {size}
                                <X
                                  className="h-3 w-3 cursor-pointer"
                                  onClick={() => {
                                    setNewComboItem(prev => ({
                                      ...prev,
                                      customizationOptions: {
                                        ...prev.customizationOptions,
                                        sizeOptions: prev.customizationOptions.sizeOptions.filter((_, i) => i !== index)
                                      }
                                    }));
                                  }}
                                />
                              </Badge>
                            ))}
                          </div>
                        )}
                      </div>
                    )}

                    {newComboItem.customizationOptions.allowQuantity && (
                      <div className="space-y-2">
                        <Label htmlFor="maxQuantity">Maximum Quantity</Label>
                        <Input
                          id="maxQuantity"
                          type="number"
                          value={newComboItem.customizationOptions.maxQuantity}
                          onChange={(e) => 
                            setNewComboItem(prev => ({
                              ...prev,
                              customizationOptions: {
                                ...prev.customizationOptions,
                                maxQuantity: parseInt(e.target.value) || 1
                              }
                            }))
                          }
                          min="1"
                          max="10"
                        />
                      </div>
                    )}

                    {newComboItem.customizationOptions.allowCustomText && (
                      <div className="space-y-2">
                        <Label htmlFor="customTextLabel">Custom Text Label</Label>
                        <Input
                          id="customTextLabel"
                          value={newComboItem.customizationOptions.customTextLabel}
                          onChange={(e) => 
                            setNewComboItem(prev => ({
                              ...prev,
                              customizationOptions: {
                                ...prev.customizationOptions,
                                customTextLabel: e.target.value
                              }
                            }))
                          }
                          placeholder="e.g., Custom Message"
                        />
                      </div>
                    )}

                    {newComboItem.customizationOptions.allowAddons && (
                      <div className="space-y-2">
                        <Label>Add-on Options</Label>
                        <div className="flex space-x-2">
                          <Input
                            value={newAddonOption}
                            onChange={(e) => setNewAddonOption(e.target.value)}
                            placeholder="e.g., Extra Flowers, Premium Wrapping"
                          />
                          <Button type="button" onClick={() => addAddonOption(-1)} size="sm">
                            <Plus className="h-4 w-4" />
                          </Button>
                        </div>
                        {newComboItem.customizationOptions.addonOptions.length > 0 && (
                          <div className="flex flex-wrap gap-2">
                            {newComboItem.customizationOptions.addonOptions.map((addon, index) => (
                              <Badge key={index} variant="outline" className="flex items-center gap-1">
                                {addon}
                                <X
                                  className="h-3 w-3 cursor-pointer"
                                  onClick={() => {
                                    setNewComboItem(prev => ({
                                      ...prev,
                                      customizationOptions: {
                                        ...prev.customizationOptions,
                                        addonOptions: prev.customizationOptions.addonOptions.filter((_, i) => i !== index)
                                      }
                                    }));
                                  }}
                                />
                              </Badge>
                            ))}
                          </div>
                        )}
                      </div>
                    )}

                    {/* Pricing Variants Section */}
                    <div className="space-y-4 rounded-lg border border-orange-200 bg-orange-50 p-4">
                      <div className="flex items-center space-x-2">
                        <Switch
                          id="allowVariants"
                          checked={newComboItem.customizationOptions.allowVariants}
                          onCheckedChange={(checked) => 
                            setNewComboItem(prev => ({
                              ...prev,
                              customizationOptions: {
                                ...prev.customizationOptions,
                                allowVariants: checked
                              }
                            }))
                          }
                        />
                        <Label htmlFor="allowVariants" className="font-medium text-orange-800">Enable Pricing Variants</Label>
                      </div>
                      
                      {newComboItem.customizationOptions.allowVariants && (
                        <div className="space-y-4">
                          <div className="space-y-2">
                            <Label htmlFor="variantLabel">Variant Label</Label>
                            <Input
                              id="variantLabel"
                              value={newComboItem.customizationOptions.variantLabel}
                              onChange={(e) => 
                                setNewComboItem(prev => ({
                                  ...prev,
                                  customizationOptions: {
                                    ...prev.customizationOptions,
                                    variantLabel: e.target.value
                                  }
                                }))
                              }
                              placeholder="e.g., Size, Weight, Type"
                            />
                          </div>
                          
                          <div className="space-y-2">
                            <Label>Add Variant</Label>
                            <div className="grid grid-cols-1 gap-2 md:grid-cols-3">
                              <Input
                                value={newVariant.name}
                                onChange={(e) => setNewVariant(prev => ({ ...prev, name: e.target.value }))}
                                placeholder="e.g., 1kg, Large, Premium"
                              />
                              <Input
                                type="number"
                                value={newVariant.price}
                                onChange={(e) => setNewVariant(prev => ({ ...prev, price: Number(e.target.value) }))}
                                placeholder="Price"
                                min="0"
                                step="0.01"
                              />
                              <Input
                                value={newVariant.description}
                                onChange={(e) => setNewVariant(prev => ({ ...prev, description: e.target.value }))}
                                placeholder="Description (optional)"
                              />
                            </div>
                            <Button type="button" onClick={() => addVariant(-1)} size="sm" className="bg-orange-600 hover:bg-orange-700">
                              <Plus className="h-4 w-4" />
                              Add Variant
                            </Button>
                          </div>
                          
                          {newComboItem.customizationOptions.variants && newComboItem.customizationOptions.variants.length > 0 && (
                            <div className="space-y-2">
                              <Label>Current Variants</Label>
                              <div className="space-y-2">
                                {newComboItem.customizationOptions.variants.map((variant, index) => (
                                  <div key={index} className="flex items-center justify-between rounded-lg border border-orange-200 bg-white p-3">
                                    <div className="flex-1">
                                      <div className="font-medium">{variant.name}</div>
                                      <div className="text-sm text-gray-600">₹{variant.price}</div>
                                      {variant.description && (
                                        <div className="text-xs text-gray-500">{variant.description}</div>
                                      )}
                                    </div>
                                    <Button
                                      type="button"
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => {
                                        setNewComboItem(prev => ({
                                          ...prev,
                                          customizationOptions: {
                                            ...prev.customizationOptions,
                                            variants: prev.customizationOptions.variants.filter((_, i) => i !== index)
                                          }
                                        }));
                                      }}
                                    >
                                      <X className="h-4 w-4" />
                                    </Button>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  <Button
                    type="button"
                    onClick={addComboItem}
                    className="w-full bg-blue-600 hover:bg-blue-700"
                    disabled={!newComboItem.name.trim()}
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    Add Item to Combo
                  </Button>
                </div>
              </div>

              {/* Existing Combo Items */}
              {(formData.comboItems || []).length > 0 && (
                <div className="space-y-4">
                  <h4 className="text-lg font-semibold text-gray-800">Combo Items ({formData.comboItems?.length})</h4>
                  <div className="space-y-4">
                    {(formData.comboItems || []).map((item, index) => (
                      <div key={index} className="rounded-lg border border-gray-200 bg-white p-4">
                        <div className="flex items-start justify-between">
                          <div className="flex-1 space-y-3">
                            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                              <div className="space-y-2">
                                <Label>Item Name</Label>
                                <Input
                                  value={item.name}
                                  onChange={(e) => updateComboItem(index, 'name', e.target.value)}
                                  placeholder="Item name"
                                />
                              </div>
                              <div className="space-y-2">
                                <Label>Item Image URL</Label>
                                <Input
                                  value={item.image}
                                  onChange={(e) => updateComboItem(index, 'image', e.target.value)}
                                  placeholder="Image URL"
                                />
                              </div>
                            </div>
                            <div className="space-y-2">
                              <Label>Description</Label>
                              <Textarea
                                value={item.description}
                                onChange={(e) => updateComboItem(index, 'description', e.target.value)}
                                placeholder="Item description"
                                rows={2}
                              />
                            </div>
                            
                            {/* Pricing and Quantity Fields for Existing Items */}
                            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                              <div className="space-y-2">
                                <Label>Item Price (₹)</Label>
                                <Input
                                  type="number"
                                  value={item.price || 0}
                                  onChange={(e) => updateComboItem(index, 'price', Number(e.target.value))}
                                  placeholder="0"
                                  min="0"
                                  step="0.01"
                                />
                              </div>
                              <div className="space-y-2">
                                <Label>Default Quantity</Label>
                                <Input
                                  type="number"
                                  value={item.quantity || 1}
                                  onChange={(e) => updateComboItem(index, 'quantity', Number(e.target.value))}
                                  placeholder="1"
                                  min="1"
                                />
                              </div>
                              <div className="space-y-2">
                                <Label>Notes (Optional)</Label>
                                <Input
                                  value={item.notes || ""}
                                  onChange={(e) => updateComboItem(index, 'notes', e.target.value)}
                                  placeholder="Special instructions or notes"
                                />
                              </div>
                            </div>
                            
                            {/* Customization Options for Existing Item */}
                            <div className="space-y-3 rounded-lg border border-gray-200 bg-gray-50 p-3">
                              <h5 className="font-medium text-gray-800">Customization Options</h5>
                              <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3">
                                <div className="flex items-center space-x-2">
                                  <Switch
                                    checked={item.customizationOptions.allowMessage}
                                    onCheckedChange={(checked) => updateComboItemCustomization(index, 'allowMessage', checked)}
                                  />
                                  <Label>Allow Message</Label>
                                </div>
                                <div className="flex items-center space-x-2">
                                  <Switch
                                    checked={item.customizationOptions.allowColorChoice}
                                    onCheckedChange={(checked) => updateComboItemCustomization(index, 'allowColorChoice', checked)}
                                  />
                                  <Label>Allow Color Choice</Label>
                                </div>
                                <div className="flex items-center space-x-2">
                                  <Switch
                                    checked={item.customizationOptions.allowSizeChoice}
                                    onCheckedChange={(checked) => updateComboItemCustomization(index, 'allowSizeChoice', checked)}
                                  />
                                  <Label>Allow Size Choice</Label>
                                </div>
                                <div className="flex items-center space-x-2">
                                  <Switch
                                    checked={item.customizationOptions.allowQuantity}
                                    onCheckedChange={(checked) => updateComboItemCustomization(index, 'allowQuantity', checked)}
                                  />
                                  <Label>Allow Quantity</Label>
                                </div>
                                <div className="flex items-center space-x-2">
                                  <Switch
                                    checked={item.customizationOptions.allowPhotoUpload}
                                    onCheckedChange={(checked) => updateComboItemCustomization(index, 'allowPhotoUpload', checked)}
                                  />
                                  <Label>Allow Photo Upload</Label>
                                </div>
                                <div className="flex items-center space-x-2">
                                  <Switch
                                    checked={item.customizationOptions.allowCustomText}
                                    onCheckedChange={(checked) => updateComboItemCustomization(index, 'allowCustomText', checked)}
                                  />
                                  <Label>Allow Custom Text</Label>
                                </div>
                                <div className="flex items-center space-x-2">
                                  <Switch
                                    checked={item.customizationOptions.allowAddons}
                                    onCheckedChange={(checked) => updateComboItemCustomization(index, 'allowAddons', checked)}
                                  />
                                  <Label>Allow Add-ons</Label>
                                </div>
                              </div>

                              {/* Conditional fields for existing items */}
                              {item.customizationOptions.allowMessage && (
                                <div className="space-y-2">
                                  <Label>Message Label</Label>
                                  <Input
                                    value={item.customizationOptions.messageLabel}
                                    onChange={(e) => updateComboItemCustomization(index, 'messageLabel', e.target.value)}
                                    placeholder="Message label"
                                  />
                                </div>
                              )}

                              {item.customizationOptions.allowColorChoice && (
                                <div className="space-y-2">
                                  <Label>Color Options</Label>
                                  <div className="flex space-x-2">
                                    <Input
                                      value={newColorOption}
                                      onChange={(e) => setNewColorOption(e.target.value)}
                                      placeholder="Add color option"
                                    />
                                    <Button type="button" onClick={() => addColorOption(index)} size="sm">
                                      <Plus className="h-4 w-4" />
                                    </Button>
                                  </div>
                                  {item.customizationOptions.colorOptions.length > 0 && (
                                    <div className="flex flex-wrap gap-2">
                                      {item.customizationOptions.colorOptions.map((color, colorIndex) => (
                                        <Badge key={colorIndex} variant="outline" className="flex items-center gap-1">
                                          {color}
                                          <X
                                            className="h-3 w-3 cursor-pointer"
                                            onClick={() => removeColorOption(index, colorIndex)}
                                          />
                                        </Badge>
                                      ))}
                                    </div>
                                  )}
                                </div>
                              )}

                              {item.customizationOptions.allowSizeChoice && (
                                <div className="space-y-2">
                                  <Label>Size Options</Label>
                                  <div className="flex space-x-2">
                                    <Input
                                      value={newSizeOption}
                                      onChange={(e) => setNewSizeOption(e.target.value)}
                                      placeholder="Add size option"
                                    />
                                    <Button type="button" onClick={() => addSizeOption(index)} size="sm">
                                      <Plus className="h-4 w-4" />
                                    </Button>
                                  </div>
                                  {item.customizationOptions.sizeOptions.length > 0 && (
                                    <div className="flex flex-wrap gap-2">
                                      {item.customizationOptions.sizeOptions.map((size, sizeIndex) => (
                                        <Badge key={sizeIndex} variant="outline" className="flex items-center gap-1">
                                          {size}
                                          <X
                                            className="h-3 w-3 cursor-pointer"
                                            onClick={() => removeSizeOption(index, sizeIndex)}
                                          />
                                        </Badge>
                                      ))}
                                    </div>
                                  )}
                                </div>
                              )}

                              {item.customizationOptions.allowQuantity && (
                                <div className="space-y-2">
                                  <Label>Maximum Quantity</Label>
                                  <Input
                                    type="number"
                                    value={item.customizationOptions.maxQuantity}
                                    onChange={(e) => updateComboItemCustomization(index, 'maxQuantity', parseInt(e.target.value) || 1)}
                                    min="1"
                                    max="10"
                                  />
                                </div>
                              )}

                              {item.customizationOptions.allowCustomText && (
                                <div className="space-y-2">
                                  <Label>Custom Text Label</Label>
                                  <Input
                                    value={item.customizationOptions.customTextLabel}
                                    onChange={(e) => updateComboItemCustomization(index, 'customTextLabel', e.target.value)}
                                    placeholder="Custom text label"
                                  />
                                </div>
                              )}

                              {item.customizationOptions.allowAddons && (
                                <div className="space-y-2">
                                  <Label>Add-on Options</Label>
                                  <div className="flex space-x-2">
                                    <Input
                                      value={newAddonOption}
                                      onChange={(e) => setNewAddonOption(e.target.value)}
                                      placeholder="Add add-on option"
                                    />
                                    <Button type="button" onClick={() => addAddonOption(index)} size="sm">
                                      <Plus className="h-4 w-4" />
                                    </Button>
                                  </div>
                                  {item.customizationOptions.addonOptions.length > 0 && (
                                    <div className="flex flex-wrap gap-2">
                                      {item.customizationOptions.addonOptions.map((addon, addonIndex) => (
                                        <Badge key={addonIndex} variant="outline" className="flex items-center gap-1">
                                          {addon}
                                          <X
                                            className="h-3 w-3 cursor-pointer"
                                            onClick={() => removeAddonOption(index, addonIndex)}
                                          />
                                        </Badge>
                                      ))}
                                    </div>
                                  )}
                                </div>
                              )}

                              {/* Pricing Variants for Existing Items */}
                              <div className="space-y-4 rounded-lg border border-orange-200 bg-orange-50 p-4">
                                <div className="flex items-center space-x-2">
                                  <Switch
                                    checked={item.customizationOptions.allowVariants || false}
                                    onCheckedChange={(checked) => updateComboItemCustomization(index, 'allowVariants', checked)}
                                  />
                                  <Label className="font-medium text-orange-800">Enable Pricing Variants</Label>
                                </div>
                                
                                {item.customizationOptions.allowVariants && (
                                  <div className="space-y-4">
                                    <div className="space-y-2">
                                      <Label>Variant Label</Label>
                                      <Input
                                        value={item.customizationOptions.variantLabel || "Size"}
                                        onChange={(e) => updateComboItemCustomization(index, 'variantLabel', e.target.value)}
                                        placeholder="e.g., Size, Weight, Type"
                                      />
                                    </div>
                                    
                                    <div className="space-y-2">
                                      <Label>Add Variant</Label>
                                      <div className="grid grid-cols-1 gap-2 md:grid-cols-3">
                                        <Input
                                          value={newVariant.name}
                                          onChange={(e) => setNewVariant(prev => ({ ...prev, name: e.target.value }))}
                                          placeholder="e.g., 1kg, Large, Premium"
                                        />
                                        <Input
                                          type="number"
                                          value={newVariant.price}
                                          onChange={(e) => setNewVariant(prev => ({ ...prev, price: Number(e.target.value) }))}
                                          placeholder="Price"
                                          min="0"
                                          step="0.01"
                                        />
                                        <Input
                                          value={newVariant.description}
                                          onChange={(e) => setNewVariant(prev => ({ ...prev, description: e.target.value }))}
                                          placeholder="Description (optional)"
                                        />
                                      </div>
                                      <Button type="button" onClick={() => addVariant(index)} size="sm" className="bg-orange-600 hover:bg-orange-700">
                                        <Plus className="h-4 w-4" />
                                        Add Variant
                                      </Button>
                                    </div>
                                    
                                    {item.customizationOptions.variants && item.customizationOptions.variants.length > 0 && (
                                      <div className="space-y-2">
                                        <Label>Current Variants</Label>
                                        <div className="space-y-2">
                                          {item.customizationOptions.variants.map((variant, variantIndex) => (
                                            <div key={variantIndex} className="flex items-center justify-between rounded-lg border border-orange-200 bg-white p-3">
                                              <div className="flex-1">
                                                <div className="font-medium">{variant.name}</div>
                                                <div className="text-sm text-gray-600">₹{variant.price}</div>
                                                {variant.description && (
                                                  <div className="text-xs text-gray-500">{variant.description}</div>
                                                )}
                                              </div>
                                              <Button
                                                type="button"
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => removeVariant(index, variantIndex)}
                                              >
                                                <X className="h-4 w-4" />
                                              </Button>
                                            </div>
                                          ))}
                                        </div>
                                      </div>
                                    )}
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => removeComboItem(index)}
                            className="text-red-500 hover:text-red-700 hover:bg-red-50"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Real-time Pricing Breakdown */}
              {formData.category === "combos" && (formData.comboItems || []).length > 0 && (
                <div className="space-y-4 rounded-lg border border-green-200 bg-green-50 p-4">
                  <h4 className="text-lg font-semibold text-green-800 flex items-center gap-2">
                    <IndianRupee className="h-5 w-5" />
                    Combo Pricing Breakdown
                  </h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Base Price:</span>
                      <span className="font-medium">₹{formData.price}</span>
                    </div>
                    {(formData.comboItems || []).map((item, index) => (
                      <div key={index} className="flex justify-between">
                        <span className="text-gray-600">+ {item.name} (Qty: {item.quantity}):</span>
                        <span className="font-medium">₹{item.price * item.quantity}</span>
                      </div>
                    ))}
                    <Separator />
                    <div className="flex justify-between text-lg font-bold text-green-800">
                      <span>Total Combo Price:</span>
                      <span>₹{comboTotalPrice}</span>
                    </div>
                    <p className="text-xs text-green-600 mt-2">
                      💡 This price will be automatically updated as you add or modify combo items
                    </p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        <div className="flex justify-end space-x-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate(getProductsListRoute())}
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
