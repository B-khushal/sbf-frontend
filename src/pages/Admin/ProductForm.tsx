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
import { Loader2, Trash2, ArrowLeft, Upload, Image as ImageIcon, Plus, X, Wand2, Flower2, Gift, Camera, Hash, MessageSquare, IndianRupee, AlertCircle, ChevronDown, ChevronUp, Heart } from 'lucide-react';
import api from '../../services/api';
import axios from 'axios'; // Keep for axios.isAxiosError
import ProductFeaturesToggle from '@/components/ui/ProductFeaturesToggle';
import { getImageUrl } from '@/config';
import { PRIMARY_CATEGORIES, getAdditionalCategoryOptions, getSubcategoryOptions, normalizeCategoryKey } from '@/utils/categoryTaxonomy';
import categoryService, { Category } from '@/services/categoryService';

type FormErrors = {
  [key in keyof ProductData]?: string;
};

const CATEGORIES = PRIMARY_CATEGORIES;

const COMBO_SUBCATEGORIES = [
  { value: "cake-combo", label: "Cake Combo" },
  { value: "flower-combo", label: "Flower Combo" },
  { value: "chocolate-combo", label: "Chocolate Combo" },
  { value: "plant-combo", label: "Plant Combo" },
  { value: "custom-combo", label: "Custom Combo" },
];

const VALENTINE_CATEGORIES = [
  "Rose Day Specials",
  "Propose Day Specials",
  "Chocolate Day Specials",
  "Teddy Day Specials",
  "Promise Day Specials",
  "Hug Day Specials",
  "Valentine's Day Specials",
  "Celebration Day Specials",
  "Premium Rose Bouquets",
  "Luxury Flower Boxes",
  "Romantic Gift Hampers",
  "Chocolates & Flowers",
  "Teddy Combos",
  "Proposal Packages",
  "Couple Gift Combos",
  "Same Day Surprise Gifts",
  "Midnight Delivery Gifts"
];

const VALENTINE_SECTIONS = [
  "Featured Valentine's Products",
  "Trending Valentine's Products",
  "Best Sellers",
  "Recommended Gifts",
  "Limited Edition Collection",
  "Romantic Combos",
  "Premium Luxury Collection",
  "Staff Picks",
  "New Arrivals"
];

const VALENTINE_DATES = [
  { value: "rose-day", label: "8 Feb – Rose Day" },
  { value: "propose-day", label: "9 Feb – Propose Day" },
  { value: "chocolate-day", label: "10 Feb – Chocolate Day" },
  { value: "teddy-day", label: "11 Feb – Teddy Day" },
  { value: "promise-day", label: "12 Feb – Promise Day" },
  { value: "hug-day", label: "13 Feb – Hug Day" },
  { value: "valentines-day", label: "14 Feb – Valentine's Day" },
  { value: "celebration-day", label: "15 Feb – Celebration Day" }
];

const VALENTINE_BADGES = [
  "Valentine's Special",
  "Bestseller",
  "Trending",
  "Limited Edition",
  "Premium Choice",
  "Most Loved",
  "Romantic Pick",
  "Staff Favourite"
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
  sameDay: true,
  isCustomizable: false,
  hasPriceVariants: false,
  priceVariants: [],
  subcategory: '',
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
    previewImage: "",
    useSameFlowerImage: false,
    flowerGroupImage: "",
    useSameChocolateImage: false,
    chocolateGroupImage: ""
  },
  comboItems: [],
  comboName: '',
  comboDescription: '',
  comboSubcategory: '',
  isValentineProduct: false,
  showInValentineShop: false,
  valentineCategories: [],
  valentineSections: [],
  availableDates: [],
  valentineBadge: '',
  featureInValentineHero: false,
  enableValentinePricing: false,
  dateWiseStock: {},
  dateWisePricing: {},
  valentineSeoTitle: '',
  valentineSeoDescription: '',
  valentineSlug: '',
};

const ProductForm = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { id } = useParams();
  const { toast } = useToast();
  const isEditMode = Boolean(id);
  const [isValentineSectionOpen, setIsValentineSectionOpen] = useState(true);
  
  // Determine if user is admin or vendor based on current path
  const isVendorPath = location.pathname.includes('/vendor/');
  const [userRole, setUserRole] = useState<string>('');
  
  // Helper function to get the correct products list route based on user role
  const getProductsListRoute = () => {
    return isVendorPath ? '/vendor/products' : '/admin/products';
  };

  const [formData, setFormData] = useState<ProductData>(initialFormData);
  const [dbCategories, setDbCategories] = useState<Category[]>([]);

  const getSubcategories = (parentSlug: string) => {
    const parent = dbCategories.find(c => c.slug === parentSlug);
    if (!parent) return [];
    const parentIdStr = parent._id || parent.id;
    return dbCategories.filter(c => {
      if (!c.parentId) return false;
      const childParentId = typeof c.parentId === 'object' ? (c.parentId._id || c.parentId.id) : c.parentId;
      return childParentId === parentIdStr;
    });
  };

  const [errors, setErrors] = useState<FormErrors>({});
  const [isLoading, setIsLoading] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isDataLoaded, setIsDataLoaded] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<number[]>([]);
  const [newFlowerAddon, setNewFlowerAddon] = useState({ name: "", price: 0, image: "" });
  const [newChocolateAddon, setNewChocolateAddon] = useState({ name: "", price: 0, image: "" });

  const [isUploadingPreview, setIsUploadingPreview] = useState(false);
  const [isUploadingFlowerGroup, setIsUploadingFlowerGroup] = useState(false);
  const [isUploadingChocolateGroup, setIsUploadingChocolateGroup] = useState(false);
  const [isUploadingNewFlower, setIsUploadingNewFlower] = useState(false);
  const [isUploadingNewChocolate, setIsUploadingNewChocolate] = useState(false);
  
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
      
      // Fetch dynamic categories first
      const cats = await categoryService.getCategories({ status: 'active' });
      setDbCategories(cats);

      const data = await productService.getProductById(id);
      
      // Ensure categories is an array
      if (!data.categories) {
        data.categories = [];
      }

      if (!data.subcategory) {
        const parent = cats.find(c => c.slug === data.category);
        let subcategories: Category[] = [];
        if (parent) {
          const parentIdStr = parent._id || parent.id;
          subcategories = cats.filter(c => {
            if (!c.parentId) return false;
            const childParentId = typeof c.parentId === 'object' ? (c.parentId._id || c.parentId.id) : c.parentId;
            return childParentId === parentIdStr;
          });
        }
        const existingMatch = (data.categories || []).find((item) =>
          subcategories.some((subcategory) => subcategory.slug === item)
        );
        data.subcategory = existingMatch || '';
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
          previewImage: "",
          useSameFlowerImage: false,
          flowerGroupImage: "",
          useSameChocolateImage: false,
          chocolateGroupImage: ""
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
        subcategory: data.subcategory || '',
        details: Array.isArray(data.details) ? data.details : [],
        careInstructions: Array.isArray(data.careInstructions) ? data.careInstructions : [],
        images: Array.isArray(data.images) ? data.images : [],
        comboItems: Array.isArray(data.comboItems) ? data.comboItems : [],
        sameDay: data.sameDay !== undefined ? Boolean(data.sameDay) : true,
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
          previewImage: "",
          useSameFlowerImage: false,
          flowerGroupImage: "",
          useSameChocolateImage: false,
          chocolateGroupImage: ""
        },
        isValentineProduct: Boolean(data.isValentineProduct),
        showInValentineShop: Boolean(data.showInValentineShop),
        valentineCategories: Array.isArray(data.valentineCategories) ? data.valentineCategories : [],
        valentineSections: Array.isArray(data.valentineSections) ? data.valentineSections : [],
        availableDates: Array.isArray(data.availableDates) ? data.availableDates : [],
        valentineBadge: data.valentineBadge || '',
        featureInValentineHero: Boolean(data.featureInValentineHero),
        enableValentinePricing: Boolean(data.enableValentinePricing),
        dateWiseStock: data.dateWiseStock || {},
        dateWisePricing: data.dateWisePricing || {},
        valentineSeoTitle: data.valentineSeoTitle || '',
        valentineSeoDescription: data.valentineSeoDescription || '',
        valentineSlug: data.valentineSlug || '',
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
          // Fetch dynamic categories for new product creation too
          categoryService.getCategories({ status: 'active' })
            .then(cats => setDbCategories(cats))
            .catch(err => console.error('Error fetching categories:', err))
            .finally(() => setIsDataLoaded(true));
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

    if (formData.category && getSubcategories(formData.category).length > 0 && !formData.subcategory) {
      newErrors.subcategory = 'Subcategory is required';
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

    // Validate Valentine's settings if enabled
    if (formData.isValentineProduct) {
      if (!formData.valentineCategories || formData.valentineCategories.length === 0) {
        newErrors.valentineCategories = "At least one Valentine's category is required";
      }
      if (!formData.availableDates || formData.availableDates.length === 0) {
        newErrors.availableDates = "At least one Valentine's date is required";
      }
      if (formData.showInValentineShop === undefined) {
        newErrors.showInValentineShop = "Valentine's visibility setting is required";
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
        timeout: 30000, // 1.5 minutes timeout for slow uploads
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

  const handleUploadImage = async (file: File) => {
    if (!file) return null;
    if (file.size > MAX_FILE_SIZE) {
      toast({
        title: "File Too Large",
        description: "Maximum image size is 5MB",
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
      const response = await api.post('/uploads', uploadFormData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        params: {
          type: 'product'
        },
        timeout: 120000 // 2 minutes timeout for slow uploads
      });
      return response.data.imageUrl;
    } catch (error) {
      console.error('Error uploading image:', error);
      toast({
        title: "Upload Failed",
        description: "Failed to upload image. Please try again.",
        variant: "destructive",
      });
      return null;
    }
  };

  const handlePreviewImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUploadingPreview(true);
    const url = await handleUploadImage(file);
    if (url) {
      setFormData(prev => ({
        ...prev,
        customizationOptions: {
          ...prev.customizationOptions,
          previewImage: url
        }
      }));
      toast({ title: "Success", description: "Preview image uploaded successfully" });
    }
    setIsUploadingPreview(false);
    e.target.value = '';
  };

  const handleFlowerGroupImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUploadingFlowerGroup(true);
    const url = await handleUploadImage(file);
    if (url) {
      setFormData(prev => ({
        ...prev,
        customizationOptions: {
          ...prev.customizationOptions,
          flowerGroupImage: url
        }
      }));
      toast({ title: "Success", description: "Flower group image uploaded successfully" });
    }
    setIsUploadingFlowerGroup(false);
    e.target.value = '';
  };

  const handleChocolateGroupImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUploadingChocolateGroup(true);
    const url = await handleUploadImage(file);
    if (url) {
      setFormData(prev => ({
        ...prev,
        customizationOptions: {
          ...prev.customizationOptions,
          chocolateGroupImage: url
        }
      }));
      toast({ title: "Success", description: "Chocolate group image uploaded successfully" });
    }
    setIsUploadingChocolateGroup(false);
    e.target.value = '';
  };

  const handleNewFlowerImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUploadingNewFlower(true);
    const url = await handleUploadImage(file);
    if (url) {
      setNewFlowerAddon(prev => ({ ...prev, image: url }));
      toast({ title: "Success", description: "Flower image uploaded successfully" });
    }
    setIsUploadingNewFlower(false);
    e.target.value = '';
  };

  const handleNewChocolateImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUploadingNewChocolate(true);
    const url = await handleUploadImage(file);
    if (url) {
      setNewChocolateAddon(prev => ({ ...prev, image: url }));
      toast({ title: "Success", description: "Chocolate image uploaded successfully" });
    }
    setIsUploadingNewChocolate(false);
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
      category: value,
      subcategory: getSubcategories(value).some((sub) => sub.slug === prev.subcategory)
        ? prev.subcategory
        : ''
    }));
  };

  const handleSubcategoryChange = (value: string) => {
    setFormData(prev => ({
      ...prev,
      subcategory: value
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
    const excluded = new Set([formData.category, formData.subcategory]);
    return dbCategories
      .filter(cat => !excluded.has(cat.slug))
      .filter(cat => !(formData.categories || []).includes(cat.slug))
      .map(cat => ({
        value: cat.slug,
        label: cat.name
      }));
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

  const handleSameDayChange = (checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      sameDay: checked
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
        subcategory: formData.subcategory || '',
        categories: formData.categories || [],
        customizationOptions: formData.isCustomizable ? {
          allowPhotoUpload: Boolean(formData.customizationOptions?.allowPhotoUpload),
          allowNumberInput: Boolean(formData.customizationOptions?.allowNumberInput),
          numberInputLabel: formData.customizationOptions?.numberInputLabel || "Enter number",
          allowMessageCard: Boolean(formData.customizationOptions?.allowMessageCard),
          messageCardPrice: Number(formData.customizationOptions?.messageCardPrice) || 0,
          addons: {
            flowers: (formData.customizationOptions?.addons?.flowers || []).map(f => ({
              ...f,
              image: formData.customizationOptions?.useSameFlowerImage 
                ? (formData.customizationOptions?.flowerGroupImage || "") 
                : (f.image || "")
            })),
            chocolates: (formData.customizationOptions?.addons?.chocolates || []).map(c => ({
              ...c,
              image: formData.customizationOptions?.useSameChocolateImage 
                ? (formData.customizationOptions?.chocolateGroupImage || "") 
                : (c.image || "")
            }))
          },
          previewImage: formData.customizationOptions?.previewImage || "",
          useSameFlowerImage: Boolean(formData.customizationOptions?.useSameFlowerImage),
          flowerGroupImage: formData.customizationOptions?.flowerGroupImage || "",
          useSameChocolateImage: Boolean(formData.customizationOptions?.useSameChocolateImage),
          chocolateGroupImage: formData.customizationOptions?.chocolateGroupImage || ""
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
      setNewFlowerAddon({ name: "", price: 0, image: "" });
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
      setNewChocolateAddon({ name: "", price: 0, image: "" });
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
                <SelectContent disablePortal>
                  {dbCategories.filter(c => !c.parentId).map((category) => (
                    <SelectItem key={category.slug} value={category.slug}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.category && (
                <p className="text-sm text-red-500">{errors.category}</p>
              )}
            </div>

            {/* Subcategory */}
            {formData.category && getSubcategories(formData.category).length > 0 && (
              <div className="space-y-2">
                <Label htmlFor="subcategory">Subcategory *</Label>
                <Select
                  value={formData.subcategory}
                  onValueChange={handleSubcategoryChange}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select subcategory" />
                  </SelectTrigger>
                  <SelectContent disablePortal>
                    {getSubcategories(formData.category).map((subcategory) => (
                      <SelectItem key={subcategory.slug} value={subcategory.slug}>
                        {subcategory.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.subcategory && (
                  <p className="text-sm text-red-500">{errors.subcategory}</p>
                )}
              </div>
            )}

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
                  <SelectContent disablePortal>
                    {COMBO_SUBCATEGORIES.map((subcategory) => (
                      <SelectItem key={subcategory.value} value={subcategory.value}>
                        {subcategory.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {/* Additional Categories */}
            <div className="space-y-4">
              <Label>Additional Categories</Label>
              <div className="space-y-3">
                {/* Current Categories */}
                {formData.categories && formData.categories.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {formData.categories.filter((category) => normalizeCategoryKey(category) !== normalizeCategoryKey(formData.subcategory)).map((category, index) => {
                      const dbCat = dbCategories.find(c => c.slug === category);
                      return (
                        <Badge
                          key={index}
                          variant="secondary"
                          className="flex items-center gap-1 px-3 py-1"
                        >
                          {dbCat ? dbCat.name : category}
                          <X
                            className="h-3 w-3 cursor-pointer hover:text-red-500"
                            onClick={() => handleRemoveCategory(category)}
                          />
                        </Badge>
                      );
                    })}
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
                    <SelectContent disablePortal>
                      {getAvailableCategories().map((category) => (
                        <SelectItem key={category.value} value={category.value}>
                          {category.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <p className="text-sm text-muted-foreground">
                  Add optional category tags beyond the main subcategory
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
                sameDay={formData.sameDay !== false}
                onNewArrivalChange={handleNewArrivalChange}
                onFeaturedChange={handleFeaturedChange}
                onHiddenChange={handleHiddenChange}
                onSameDayChange={handleSameDayChange}
              />
            </div>
          </CardContent>
        </Card>

        {/* ❤️ Valentine's Settings */}
        <Card className={`transition-all duration-300 border-2 ${formData.isValentineProduct ? 'border-pink-200 bg-gradient-to-br from-pink-50/50 to-rose-50/50 shadow-md shadow-pink-100/55' : 'border-gray-200'}`}>
          <CardHeader className="cursor-pointer select-none" onClick={() => setIsValentineSectionOpen(!isValentineSectionOpen)}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={`flex h-10 w-10 items-center justify-center rounded-full transition-colors ${formData.isValentineProduct ? 'bg-pink-100 text-pink-600' : 'bg-gray-100 text-gray-500'}`}>
                  <Heart className={`h-5 w-5 ${formData.isValentineProduct ? 'fill-pink-500 stroke-pink-600 animate-pulse' : ''}`} />
                </div>
                <div>
                  <CardTitle className={`flex items-center gap-2 ${formData.isValentineProduct ? 'text-pink-800' : ''}`}>
                    ❤️ Valentine's Settings
                  </CardTitle>
                  <CardDescription className={formData.isValentineProduct ? 'text-pink-600' : ''}>
                    Configure Valentine's collections, visibility, date-wise pricing, inventory, and banner promotion
                  </CardDescription>
                </div>
              </div>
              <div className="text-muted-foreground">
                {isValentineSectionOpen ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
              </div>
            </div>
          </CardHeader>
          
          {isValentineSectionOpen && (
            <CardContent className="space-y-6">
              {/* Enable Valentine's Product Toggle */}
              <div className={`flex items-center justify-between rounded-lg border p-4 transition-colors ${formData.isValentineProduct ? 'border-pink-200 bg-white shadow-sm' : 'border-gray-200 bg-gray-50'}`}>
                <div className="space-y-1">
                  <Label htmlFor="isValentineProductToggle" className="text-base font-semibold">Enable for Valentine's Collection</Label>
                  <p className="text-sm text-muted-foreground">Activate this product in the Valentine's campaign ecosystem</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`text-sm font-medium ${formData.isValentineProduct ? 'text-pink-600' : 'text-muted-foreground'}`}>
                    {formData.isValentineProduct ? 'ON' : 'OFF'}
                  </span>
                  <Switch
                    id="isValentineProductToggle"
                    type="button"
                    checked={formData.isValentineProduct}
                    onCheckedChange={(checked) => {
                      setFormData(prev => ({
                        ...prev,
                        isValentineProduct: checked,
                        productType: checked ? 'valentine' : 'regular'
                      }));
                      // Reset errors for Valentine settings if toggled OFF
                      if (!checked) {
                        setErrors(prev => {
                          const newErrors = { ...prev };
                          delete newErrors.valentineCategories;
                          delete newErrors.availableDates;
                          delete newErrors.showInValentineShop;
                          return newErrors;
                        });
                      }
                    }}
                    className="data-[state=checked]:bg-pink-600"
                  />
                </div>
              </div>

              {formData.isValentineProduct && (
                <div className="space-y-6 pt-4 border-t border-pink-100">
                  {/* 2. Valentine's Shop Visibility */}
                  <div className="flex items-center justify-between rounded-lg border border-pink-200 bg-white p-4">
                    <div className="space-y-1">
                      <Label htmlFor="showInValentineShop" className="text-base font-medium">Show in Valentine's Shop</Label>
                      <p className="text-sm text-muted-foreground">Automatically display this product on /valentine-shop</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`text-sm font-medium ${formData.showInValentineShop ? 'text-pink-600 font-bold' : 'text-muted-foreground'}`}>
                        {formData.showInValentineShop ? 'ON' : 'OFF'}
                      </span>
                      <Switch
                        id="showInValentineShop"
                        type="button"
                        checked={formData.showInValentineShop}
                        onCheckedChange={(checked) => setFormData(prev => ({ ...prev, showInValentineShop: checked }))}
                        className="data-[state=checked]:bg-pink-600"
                      />
                    </div>
                  </div>

                  {/* 3. Valentine's Collection Assignment */}
                  <div className="space-y-3">
                    <Label className="text-sm font-semibold text-gray-900">Assign Valentine's Categories *</Label>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2 bg-white p-4 rounded-lg border border-pink-200">
                      {VALENTINE_CATEGORIES.map((category) => {
                        const isChecked = (formData.valentineCategories || []).includes(category);
                        return (
                          <div key={category} className="flex items-center space-x-2">
                            <input
                              type="checkbox"
                              id={`val-cat-${category}`}
                              checked={isChecked}
                              onChange={() => {
                                setFormData(prev => {
                                  const list = prev.valentineCategories || [];
                                  const updated = list.includes(category)
                                    ? list.filter(c => c !== category)
                                    : [...list, category];
                                  return { ...prev, valentineCategories: updated };
                                });
                              }}
                              className="h-4 w-4 rounded border-gray-300 text-pink-600 focus:ring-pink-500"
                            />
                            <Label htmlFor={`val-cat-${category}`} className="text-sm text-gray-700 cursor-pointer">
                              {category}
                            </Label>
                          </div>
                        );
                      })}
                    </div>
                    {errors.valentineCategories && (
                      <p className="text-sm text-red-500 font-medium">{errors.valentineCategories}</p>
                    )}
                  </div>

                  {/* 4. Valentine's Landing Page Placement */}
                  <div className="space-y-3">
                    <Label className="text-sm font-semibold text-gray-900">Display In Valentine's Sections</Label>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2 bg-white p-4 rounded-lg border border-pink-200">
                      {VALENTINE_SECTIONS.map((section) => {
                        const isChecked = (formData.valentineSections || []).includes(section);
                        return (
                          <div key={section} className="flex items-center space-x-2">
                            <input
                              type="checkbox"
                              id={`val-sec-${section}`}
                              checked={isChecked}
                              onChange={() => {
                                setFormData(prev => {
                                  const list = prev.valentineSections || [];
                                  const updated = list.includes(section)
                                    ? list.filter(s => s !== section)
                                    : [...list, section];
                                  return { ...prev, valentineSections: updated };
                                });
                              }}
                              className="h-4 w-4 rounded border-gray-300 text-pink-600 focus:ring-pink-500"
                            />
                            <Label htmlFor={`val-sec-${section}`} className="text-sm text-gray-700 cursor-pointer">
                              {section}
                            </Label>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* 5. Valentine's Date Assignment */}
                  <div className="space-y-3">
                    <Label className="text-sm font-semibold text-gray-900">Available For Dates *</Label>
                    <p className="text-xs text-muted-foreground">Only selected dates will be available during checkout for this product</p>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 bg-white p-4 rounded-lg border border-pink-200">
                      {VALENTINE_DATES.map((dateObj) => {
                        const isChecked = (formData.availableDates || []).includes(dateObj.value);
                        return (
                          <div key={dateObj.value} className="flex items-center space-x-2">
                            <input
                              type="checkbox"
                              id={`val-date-${dateObj.value}`}
                              checked={isChecked}
                              onChange={() => {
                                setFormData(prev => {
                                  const list = prev.availableDates || [];
                                  const updated = list.includes(dateObj.value)
                                    ? list.filter(d => d !== dateObj.value)
                                    : [...list, dateObj.value];
                                  return { ...prev, availableDates: updated };
                                });
                              }}
                              className="h-4 w-4 rounded border-gray-300 text-pink-600 focus:ring-pink-500"
                            />
                            <Label htmlFor={`val-date-${dateObj.value}`} className="text-sm text-gray-700 cursor-pointer">
                              {dateObj.label}
                            </Label>
                          </div>
                        );
                      })}
                    </div>
                    {errors.availableDates && (
                      <p className="text-sm text-red-500 font-medium">{errors.availableDates}</p>
                    )}
                  </div>

                  {/* 6. Valentine's Product Badge System */}
                  <div className="space-y-2">
                    <Label htmlFor="valentineBadge" className="text-sm font-semibold text-gray-900">Valentine Badge</Label>
                    <Select
                      value={formData.valentineBadge || 'none'}
                      onValueChange={(val) => setFormData(prev => ({ ...prev, valentineBadge: val === 'none' ? '' : val }))}
                    >
                      <SelectTrigger className="w-full md:max-w-md bg-white border-pink-200">
                        <SelectValue placeholder="Select Valentine Badge" />
                      </SelectTrigger>
                      <SelectContent disablePortal>
                        <SelectItem value="none">None</SelectItem>
                        {VALENTINE_BADGES.map((badge) => (
                          <SelectItem key={badge} value={badge}>
                            {badge}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* 7. Valentine's Banner Product Toggle */}
                  <div className="flex items-center justify-between rounded-lg border border-pink-200 bg-white p-4">
                    <div className="space-y-1">
                      <Label htmlFor="featureInValentineHero" className="text-base font-medium">Feature In Valentine's Hero Banner</Label>
                      <p className="text-sm text-muted-foreground">Make this product available for selection in Valentine's Hero Banners</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`text-sm font-medium ${formData.featureInValentineHero ? 'text-pink-600 font-bold' : 'text-muted-foreground'}`}>
                        {formData.featureInValentineHero ? 'ON' : 'OFF'}
                      </span>
                      <Switch
                        id="featureInValentineHero"
                        type="button"
                        checked={formData.featureInValentineHero}
                        onCheckedChange={(checked) => setFormData(prev => ({ ...prev, featureInValentineHero: checked }))}
                        className="data-[state=checked]:bg-pink-600"
                      />
                    </div>
                  </div>

                  {/* 8. Valentine's Pricing Controls */}
                  <div className="space-y-4 rounded-lg border border-pink-200 bg-white p-4">
                    <div className="flex items-center justify-between border-b border-pink-100 pb-3">
                      <div className="space-y-1">
                        <Label htmlFor="enableValentinePricing" className="text-base font-medium">Enable Valentine's Pricing</Label>
                        <p className="text-sm text-muted-foreground">Define different prices based on the delivery date</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`text-sm font-medium ${formData.enableValentinePricing ? 'text-pink-600 font-bold' : 'text-muted-foreground'}`}>
                          {formData.enableValentinePricing ? 'ON' : 'OFF'}
                        </span>
                        <Switch
                          id="enableValentinePricing"
                          type="button"
                          checked={formData.enableValentinePricing}
                          onCheckedChange={(checked) => setFormData(prev => ({ ...prev, enableValentinePricing: checked }))}
                          className="data-[state=checked]:bg-pink-600"
                        />
                      </div>
                    </div>

                    {formData.enableValentinePricing && (
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 pt-2">
                        {VALENTINE_DATES.map((dateObj) => {
                          const currentVal = formData.dateWisePricing?.[dateObj.value] ?? '';
                          return (
                            <div key={dateObj.value} className="space-y-2">
                              <Label className="text-xs font-semibold text-gray-700">{dateObj.label.split(' – ')[1]} Price (₹)</Label>
                              <Input
                                type="number"
                                placeholder={`Price for ${dateObj.label.split(' – ')[0]}`}
                                value={currentVal}
                                onChange={(e) => {
                                  const val = e.target.value;
                                  setFormData(prev => ({
                                    ...prev,
                                    dateWisePricing: {
                                      ...(prev.dateWisePricing || {}),
                                      [dateObj.value]: val === '' ? 0 : parseFloat(val)
                                    }
                                  }));
                                }}
                                className="border-pink-200 focus:border-pink-500 focus:ring-pink-500"
                              />
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>

                  {/* 9. Valentine's Inventory Controls */}
                  <div className="space-y-4 rounded-lg border border-pink-200 bg-white p-4">
                    <div>
                      <Label className="text-base font-semibold text-gray-900">Valentine Inventory</Label>
                      <p className="text-sm text-muted-foreground">Manage date-wise stock limits. Product shows "Sold Out For Selected Date" when stock is zero.</p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 pt-2">
                      {VALENTINE_DATES.map((dateObj) => {
                        const currentVal = formData.dateWiseStock?.[dateObj.value] ?? '';
                        return (
                          <div key={dateObj.value} className="space-y-2">
                            <Label className="text-xs font-semibold text-gray-700">{dateObj.label.split(' – ')[1]} Stock</Label>
                            <Input
                              type="number"
                              placeholder={`Stock for ${dateObj.label.split(' – ')[0]}`}
                              value={currentVal}
                              onChange={(e) => {
                                const val = e.target.value;
                                setFormData(prev => ({
                                  ...prev,
                                  dateWiseStock: {
                                    ...(prev.dateWiseStock || {}),
                                    [dateObj.value]: val === '' ? 0 : parseInt(val, 10)
                                  }
                                }));
                              }}
                              className="border-pink-200 focus:border-pink-500 focus:ring-pink-500"
                            />
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* 10. Valentine's SEO Controls */}
                  <div className="space-y-4 rounded-lg border border-pink-200 bg-white p-4">
                    <div>
                      <Label className="text-base font-semibold text-gray-900">Valentine's SEO Controls</Label>
                      <p className="text-sm text-muted-foreground">Customize meta data and URL route for campaign SEO purposes (/valentine-product/product-name)</p>
                    </div>
                    <div className="space-y-3 pt-2">
                      <div className="space-y-2">
                        <Label htmlFor="valentineSeoTitle">Valentine SEO Title</Label>
                        <Input
                          id="valentineSeoTitle"
                          placeholder="e.g. Premium White Roses - Valentine Specials"
                          value={formData.valentineSeoTitle || ''}
                          onChange={(e) => setFormData(prev => ({ ...prev, valentineSeoTitle: e.target.value }))}
                          className="border-pink-200"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="valentineSeoDescription">Valentine SEO Description</Label>
                        <Textarea
                          id="valentineSeoDescription"
                          placeholder="Detailed SEO description highlighting Valentine's Day features, pricing and delivery details..."
                          value={formData.valentineSeoDescription || ''}
                          onChange={(e) => setFormData(prev => ({ ...prev, valentineSeoDescription: e.target.value }))}
                          rows={3}
                          className="border-pink-200"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="valentineSlug">Valentine Product URL Slug</Label>
                        <Input
                          id="valentineSlug"
                          placeholder="e.g. pure-elegance-white-rose-valentine"
                          value={formData.valentineSlug || ''}
                          onChange={(e) => setFormData(prev => ({ ...prev, valentineSlug: e.target.value }))}
                          className="border-pink-200"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          )}
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
                  <SelectContent disablePortal>
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
                  <SelectContent disablePortal>
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
                    <div className="flex items-center justify-between flex-wrap gap-2">
                      <div className="flex items-center space-x-2">
                        <Flower2 className="h-5 w-5 text-green-600" />
                        <Label className="text-base font-medium text-green-800">Flower Add-ons</Label>
                      </div>
                      <div className="flex items-center space-x-2 bg-white/60 px-3 py-1.5 rounded-lg border border-green-205">
                        <Switch
                          id="useSameFlowerImage"
                          checked={formData.customizationOptions?.useSameFlowerImage || false}
                          onCheckedChange={(checked) => 
                            setFormData(prev => ({
                              ...prev,
                              customizationOptions: {
                                ...prev.customizationOptions,
                                useSameFlowerImage: checked
                              }
                            }))
                          }
                        />
                        <Label htmlFor="useSameFlowerImage" className="text-xs font-semibold text-green-800 cursor-pointer">Use same image for all flowers</Label>
                      </div>
                    </div>

                    {formData.customizationOptions?.useSameFlowerImage && (
                      <div className="space-y-1.5 p-3 bg-white rounded-lg border border-green-200 shadow-sm">
                        <Label className="text-xs font-semibold text-green-850">Group Flower Image</Label>
                        <div className="flex items-center gap-2">
                          <div className="relative flex-1">
                            <Input
                              type="text"
                              placeholder="Group image URL or upload file..."
                              value={formData.customizationOptions?.flowerGroupImage || ""}
                              onChange={(e) => 
                                setFormData(prev => ({
                                  ...prev,
                                  customizationOptions: {
                                    ...prev.customizationOptions,
                                    flowerGroupImage: e.target.value
                                  }
                                }))
                              }
                              className="text-xs h-9 pr-10 bg-slate-50"
                            />
                            <label className="absolute right-2 top-1/2 -translate-y-1/2 cursor-pointer p-1 rounded hover:bg-gray-150 text-gray-400">
                              {isUploadingFlowerGroup ? (
                                <Loader2 className="h-3.5 w-3.5 animate-spin text-blue-500" />
                              ) : (
                                <Upload className="h-3.5 w-3.5" />
                              )}
                              <input
                                type="file"
                                accept="image/*"
                                onChange={handleFlowerGroupImageUpload}
                                disabled={isUploadingFlowerGroup}
                                className="hidden"
                              />
                            </label>
                          </div>
                          {formData.customizationOptions?.flowerGroupImage && (
                            <div className="relative">
                              <img
                                src={getImageUrl(formData.customizationOptions.flowerGroupImage)}
                                alt="Group Flower"
                                className="h-9 w-9 object-cover rounded-md border"
                              />
                              <button
                                type="button"
                                onClick={() => setFormData(prev => ({
                                  ...prev,
                                  customizationOptions: {
                                    ...prev.customizationOptions,
                                    flowerGroupImage: ""
                                  }
                                }))}
                                className="absolute -top-1.5 -right-1.5 bg-red-500 text-white rounded-full p-0.5"
                              >
                                <X className="h-2 w-2" />
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    <div className="space-y-2.5 bg-white/40 p-3 rounded-lg border border-green-200/50">
                      <div className="flex space-x-2">
                        <Input
                          placeholder="Flower name (e.g., 'Red Roses')"
                          value={newFlowerAddon.name}
                          onChange={(e) => setNewFlowerAddon(prev => ({ ...prev, name: e.target.value }))}
                          className="flex-1 text-sm h-10"
                        />
                        <div className="flex items-center space-x-1">
                          <IndianRupee className="h-4 w-4 text-gray-400" />
                          <Input
                            type="number"
                            placeholder="Price"
                            value={newFlowerAddon.price || ""}
                            onChange={(e) => setNewFlowerAddon(prev => ({ ...prev, price: parseFloat(e.target.value) || 0 }))}
                            className="w-24 text-sm h-10"
                          />
                        </div>
                      </div>
                      
                      {!formData.customizationOptions?.useSameFlowerImage && (
                        <div className="flex items-center gap-2">
                          <div className="relative flex-1">
                            <Input
                              placeholder="Image URL or upload file..."
                              value={newFlowerAddon.image || ""}
                              onChange={(e) => setNewFlowerAddon(prev => ({ ...prev, image: e.target.value }))}
                              className="text-xs h-9 pr-10"
                            />
                            <label className="absolute right-2 top-1/2 -translate-y-1/2 cursor-pointer p-1 rounded hover:bg-gray-100 text-gray-500">
                              {isUploadingNewFlower ? (
                                <Loader2 className="h-3.5 w-3.5 animate-spin text-blue-500" />
                              ) : (
                                <Upload className="h-3.5 w-3.5" />
                              )}
                              <input
                                type="file"
                                accept="image/*"
                                onChange={handleNewFlowerImageUpload}
                                disabled={isUploadingNewFlower}
                                className="hidden"
                              />
                            </label>
                          </div>
                          {newFlowerAddon.image && (
                            <div className="relative">
                              <img
                                src={getImageUrl(newFlowerAddon.image)}
                                alt="Flower Preview"
                                className="h-9 w-9 object-cover rounded-md border"
                              />
                              <button
                                type="button"
                                onClick={() => setNewFlowerAddon(prev => ({ ...prev, image: "" }))}
                                className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full p-0.5"
                              >
                                <X className="h-2.5 w-2.5" />
                              </button>
                            </div>
                          )}
                        </div>
                      )}
                      
                      <Button 
                        type="button" 
                        onClick={addFlowerAddon} 
                        size="sm"
                        className="bg-green-600 hover:bg-green-700 w-full"
                      >
                        <Plus className="h-4 w-4 mr-2" /> Add Flower Option
                      </Button>
                    </div>

                    <div className="space-y-2 mt-3">
                      {formData.customizationOptions?.addons?.flowers.map((flower, index) => (
                        <div key={index} className="flex items-center justify-between bg-white p-3 rounded-lg border border-green-200 shadow-sm flex-wrap gap-2">
                          <div className="flex items-center space-x-3 min-w-0 flex-1">
                            {flower.image ? (
                              <img
                                src={getImageUrl(flower.image)}
                                alt={flower.name}
                                className="h-10 w-10 object-cover rounded-md border flex-shrink-0"
                              />
                            ) : (
                              <Flower2 className="h-5 w-5 text-green-600 flex-shrink-0" />
                            )}
                            <div className="flex flex-col min-w-0">
                              <span className="font-semibold text-sm text-gray-800 truncate">{flower.name}</span>
                              <span className="text-xs text-gray-500 font-medium">₹{flower.price}</span>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            {!formData.customizationOptions?.useSameFlowerImage && (
                              <div className="relative w-36">
                                <Input
                                  placeholder="Edit image url..."
                                  value={flower.image || ""}
                                  onChange={(e) => {
                                    const val = e.target.value;
                                    setFormData(prev => {
                                      const updatedFlowers = [...(prev.customizationOptions.addons?.flowers || [])];
                                      updatedFlowers[index] = { ...updatedFlowers[index], image: val };
                                      return {
                                        ...prev,
                                        customizationOptions: {
                                          ...prev.customizationOptions,
                                          addons: {
                                            ...prev.customizationOptions.addons,
                                            flowers: updatedFlowers
                                          }
                                        }
                                      };
                                    });
                                  }}
                                  className="text-[10px] h-7 pr-7"
                                />
                                <label className="absolute right-1.5 top-1/2 -translate-y-1/2 cursor-pointer p-0.5 rounded hover:bg-gray-150 text-gray-400">
                                  <Upload className="h-3 w-3" />
                                  <input
                                    type="file"
                                    accept="image/*"
                                    onChange={async (e) => {
                                      const file = e.target.files?.[0];
                                      if (!file) return;
                                      const url = await handleUploadImage(file);
                                      if (url) {
                                        setFormData(prev => {
                                          const updatedFlowers = [...(prev.customizationOptions.addons?.flowers || [])];
                                          updatedFlowers[index] = { ...updatedFlowers[index], image: url };
                                          return {
                                            ...prev,
                                            customizationOptions: {
                                              ...prev.customizationOptions,
                                              addons: {
                                                ...prev.customizationOptions.addons,
                                                flowers: updatedFlowers
                                              }
                                            }
                                          };
                                        });
                                        toast({ title: "Success", description: "Image uploaded" });
                                      }
                                    }}
                                    className="hidden"
                                  />
                                </label>
                              </div>
                            )}
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => removeAddon('flower', index)}
                              className="text-red-500 hover:text-red-700 hover:bg-red-50 h-8 w-8 p-0"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Chocolate Add-ons */}
                  <div className="space-y-3 rounded-lg border border-orange-200 bg-orange-50 p-4">
                    <div className="flex items-center justify-between flex-wrap gap-2">
                      <div className="flex items-center space-x-2">
                        <Gift className="h-5 w-5 text-orange-600" />
                        <Label className="text-base font-medium text-orange-800">Chocolate Add-ons</Label>
                      </div>
                      <div className="flex items-center space-x-2 bg-white/60 px-3 py-1.5 rounded-lg border border-orange-205">
                        <Switch
                          id="useSameChocolateImage"
                          checked={formData.customizationOptions?.useSameChocolateImage || false}
                          onCheckedChange={(checked) => 
                            setFormData(prev => ({
                              ...prev,
                              customizationOptions: {
                                ...prev.customizationOptions,
                                useSameChocolateImage: checked
                              }
                            }))
                          }
                        />
                        <Label htmlFor="useSameChocolateImage" className="text-xs font-semibold text-orange-800 cursor-pointer">Use same image for all chocolates</Label>
                      </div>
                    </div>

                    {formData.customizationOptions?.useSameChocolateImage && (
                      <div className="space-y-1.5 p-3 bg-white rounded-lg border border-orange-200 shadow-sm">
                        <Label className="text-xs font-semibold text-orange-850">Group Chocolate Image</Label>
                        <div className="flex items-center gap-2">
                          <div className="relative flex-1">
                            <Input
                              type="text"
                              placeholder="Group image URL or upload file..."
                              value={formData.customizationOptions?.chocolateGroupImage || ""}
                              onChange={(e) => 
                                setFormData(prev => ({
                                  ...prev,
                                  customizationOptions: {
                                    ...prev.customizationOptions,
                                    chocolateGroupImage: e.target.value
                                  }
                                }))
                              }
                              className="text-xs h-9 pr-10 bg-slate-50"
                            />
                            <label className="absolute right-2 top-1/2 -translate-y-1/2 cursor-pointer p-1 rounded hover:bg-gray-150 text-gray-400">
                              {isUploadingChocolateGroup ? (
                                <Loader2 className="h-3.5 w-3.5 animate-spin text-blue-500" />
                              ) : (
                                <Upload className="h-3.5 w-3.5" />
                              )}
                              <input
                                type="file"
                                accept="image/*"
                                onChange={handleChocolateGroupImageUpload}
                                disabled={isUploadingChocolateGroup}
                                className="hidden"
                              />
                            </label>
                          </div>
                          {formData.customizationOptions?.chocolateGroupImage && (
                            <div className="relative">
                              <img
                                src={getImageUrl(formData.customizationOptions.chocolateGroupImage)}
                                alt="Group Chocolate"
                                className="h-9 w-9 object-cover rounded-md border"
                              />
                              <button
                                type="button"
                                onClick={() => setFormData(prev => ({
                                  ...prev,
                                  customizationOptions: {
                                    ...prev.customizationOptions,
                                    chocolateGroupImage: ""
                                  }
                                }))}
                                className="absolute -top-1.5 -right-1.5 bg-red-500 text-white rounded-full p-0.5"
                              >
                                <X className="h-2 w-2" />
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    <div className="space-y-2.5 bg-white/40 p-3 rounded-lg border border-orange-200/50">
                      <div className="flex space-x-2">
                        <Input
                          placeholder="Chocolate name (e.g., 'Dark Chocolate Truffles')"
                          value={newChocolateAddon.name}
                          onChange={(e) => setNewChocolateAddon(prev => ({ ...prev, name: e.target.value }))}
                          className="flex-1 text-sm h-10"
                        />
                        <div className="flex items-center space-x-1">
                          <IndianRupee className="h-4 w-4 text-gray-400" />
                          <Input
                            type="number"
                            placeholder="Price"
                            value={newChocolateAddon.price || ""}
                            onChange={(e) => setNewChocolateAddon(prev => ({ ...prev, price: parseFloat(e.target.value) || 0 }))}
                            className="w-24 text-sm h-10"
                          />
                        </div>
                      </div>
                      
                      {!formData.customizationOptions?.useSameChocolateImage && (
                        <div className="flex items-center gap-2">
                          <div className="relative flex-1">
                            <Input
                              placeholder="Image URL or upload file..."
                              value={newChocolateAddon.image || ""}
                              onChange={(e) => setNewChocolateAddon(prev => ({ ...prev, image: e.target.value }))}
                              className="text-xs h-9 pr-10"
                            />
                            <label className="absolute right-2 top-1/2 -translate-y-1/2 cursor-pointer p-1 rounded hover:bg-gray-100 text-gray-500">
                              {isUploadingNewChocolate ? (
                                <Loader2 className="h-3.5 w-3.5 animate-spin text-blue-500" />
                              ) : (
                                <Upload className="h-3.5 w-3.5" />
                              )}
                              <input
                                type="file"
                                accept="image/*"
                                onChange={handleNewChocolateImageUpload}
                                disabled={isUploadingNewChocolate}
                                className="hidden"
                              />
                            </label>
                          </div>
                          {newChocolateAddon.image && (
                            <div className="relative">
                              <img
                                src={getImageUrl(newChocolateAddon.image)}
                                alt="Chocolate Preview"
                                className="h-9 w-9 object-cover rounded-md border"
                              />
                              <button
                                type="button"
                                onClick={() => setNewChocolateAddon(prev => ({ ...prev, image: "" }))}
                                className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full p-0.5"
                              >
                                <X className="h-2.5 w-2.5" />
                              </button>
                            </div>
                          )}
                        </div>
                      )}
                      
                      <Button 
                        type="button" 
                        onClick={addChocolateAddon} 
                        size="sm"
                        className="bg-orange-600 hover:bg-orange-700 w-full"
                      >
                        <Plus className="h-4 w-4 mr-2" /> Add Chocolate Option
                      </Button>
                    </div>

                    <div className="space-y-2 mt-3">
                      {formData.customizationOptions?.addons?.chocolates.map((chocolate, index) => (
                        <div key={index} className="flex items-center justify-between bg-white p-3 rounded-lg border border-orange-200 shadow-sm flex-wrap gap-2">
                          <div className="flex items-center space-x-3 min-w-0 flex-1">
                            {chocolate.image ? (
                              <img
                                src={getImageUrl(chocolate.image)}
                                alt={chocolate.name}
                                className="h-10 w-10 object-cover rounded-md border flex-shrink-0"
                              />
                            ) : (
                              <Gift className="h-5 w-5 text-orange-600 flex-shrink-0" />
                            )}
                            <div className="flex flex-col min-w-0">
                              <span className="font-semibold text-sm text-gray-800 truncate">{chocolate.name}</span>
                              <span className="text-xs text-gray-500 font-medium">₹{chocolate.price}</span>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            {!formData.customizationOptions?.useSameChocolateImage && (
                              <div className="relative w-36">
                                <Input
                                  placeholder="Edit image url..."
                                  value={chocolate.image || ""}
                                  onChange={(e) => {
                                    const val = e.target.value;
                                    setFormData(prev => {
                                      const updatedChocolates = [...(prev.customizationOptions.addons?.chocolates || [])];
                                      updatedChocolates[index] = { ...updatedChocolates[index], image: val };
                                      return {
                                        ...prev,
                                        customizationOptions: {
                                          ...prev.customizationOptions,
                                          addons: {
                                            ...prev.customizationOptions.addons,
                                            chocolates: updatedChocolates
                                          }
                                        }
                                      };
                                    });
                                  }}
                                  className="text-[10px] h-7 pr-7"
                                />
                                <label className="absolute right-1.5 top-1/2 -translate-y-1/2 cursor-pointer p-0.5 rounded hover:bg-gray-150 text-gray-400">
                                  <Upload className="h-3 w-3" />
                                  <input
                                    type="file"
                                    accept="image/*"
                                    onChange={async (e) => {
                                      const file = e.target.files?.[0];
                                      if (!file) return;
                                      const url = await handleUploadImage(file);
                                      if (url) {
                                        setFormData(prev => {
                                          const updatedChocolates = [...(prev.customizationOptions.addons?.chocolates || [])];
                                          updatedChocolates[index] = { ...updatedChocolates[index], image: url };
                                          return {
                                            ...prev,
                                            customizationOptions: {
                                              ...prev.customizationOptions,
                                              addons: {
                                                ...prev.customizationOptions.addons,
                                                chocolates: updatedChocolates
                                              }
                                            }
                                          };
                                        });
                                        toast({ title: "Success", description: "Image uploaded" });
                                      }
                                    }}
                                    className="hidden"
                                  />
                                </label>
                              </div>
                            )}
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => removeAddon('chocolate', index)}
                              className="text-red-500 hover:text-red-750 hover:bg-red-50 h-8 w-8 p-0"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <Separator />

                {/* Preview Image */}
                <div className="space-y-3">
                  <Label className="text-base font-medium">Preview Image</Label>
                  <p className="text-sm text-gray-500">Image URL or upload for the customization preview</p>
                  
                  <div className="flex items-center space-x-2">
                    <div className="relative flex-1">
                      <Input
                        type="text"
                        placeholder="https://example.com/preview-image.jpg"
                        value={formData.customizationOptions?.previewImage || ""}
                        onChange={(e) => 
                          setFormData(prev => ({
                            ...prev,
                            customizationOptions: {
                              ...prev.customizationOptions,
                              previewImage: e.target.value
                            }
                          }))
                        }
                        className="pr-10"
                      />
                      <label className="absolute right-2 top-1/2 -translate-y-1/2 cursor-pointer p-1.5 rounded-md hover:bg-gray-100 text-gray-500 flex items-center justify-center">
                        {isUploadingPreview ? (
                          <Loader2 className="h-4 w-4 animate-spin text-blue-500" />
                        ) : (
                          <Upload className="h-4 w-4" />
                        )}
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handlePreviewImageUpload}
                          disabled={isUploadingPreview}
                          className="hidden"
                        />
                      </label>
                    </div>
                  </div>
                  
                  {formData.customizationOptions?.previewImage && (
                    <div className="mt-2 relative inline-block">
                      <img
                        src={getImageUrl(formData.customizationOptions.previewImage)}
                        alt="Customization Preview"
                        className="h-20 w-20 object-cover rounded-md border"
                      />
                      <button
                        type="button"
                        onClick={() => setFormData(prev => ({
                          ...prev,
                          customizationOptions: {
                            ...prev.customizationOptions,
                            previewImage: ""
                          }
                        }))}
                        className="absolute -top-1.5 -right-1.5 bg-red-500 text-white rounded-full p-0.5 hover:bg-red-600 transition-colors shadow-sm"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  )}
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
