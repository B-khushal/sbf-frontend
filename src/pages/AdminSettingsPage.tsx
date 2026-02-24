import { useEffect, useRef, useState } from "react";
import { DndContext, closestCenter, PointerSensor, useSensor, useSensors, TouchSensor } from "@dnd-kit/core";
import { arrayMove, SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { SortableHandle, SortableItem } from "../components/ui/SortableItem";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Textarea } from "../components/ui/textarea";
import { Switch } from "../components/ui/switch";
import { Label } from "../components/ui/label";
import { Badge } from "../components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import { Separator } from "../components/ui/separator";
import { 
  Plus, 
  Trash2, 
  Eye, 
  EyeOff, 
  GripVertical, 
  Save, 
  RefreshCw, 
  Upload, 
  Image as ImageIcon,
  Edit,
  Settings,
  ShoppingBag,
  Bell,
  Send,
  ChevronLeft,
  ChevronRight
} from "lucide-react";
import api from "../services/api";
import { uploadImage } from "../services/uploadService";
import { useToast } from "../hooks/use-toast";
import { ImageUpload } from "@/components/ui/ImageUpload";
import { useSettings } from "../contexts/SettingsContext";

interface HeroSlide {
  id: number;
  title: string;
  subtitle: string;
  image: string;
  ctaText: string;
  ctaLink: string;
  enabled: boolean;
  order: number;
}

interface HomeSection {
  id: string;
  type: string;
  title: string;
  subtitle: string;
  enabled: boolean;
  order: number;
  content?: any;
}

interface Category {
  id: string;
  name: string;
  description: string;
  image: string;
  link: string;
  enabled: boolean;
  order: number;
}

interface HeaderSettings {
  logo: string;
  navigationItems: Array<{
    id: string;
    label: string;
    href: string;
    enabled: boolean;
    order: number;
  }>;
  searchPlaceholder: string;
  showWishlist: boolean;
  showCart: boolean;
  showCurrencyConverter: boolean;
}

interface FooterSettings {
  companyName: string;
  description: string;
  socialLinks: Array<{
    platform: string;
    url: string;
    enabled: boolean;
  }>;
  contactInfo: {
    email: string;
    phone: string;
    address: string;
  };
  links: Array<{
    section: string;
    items: Array<{
      label: string;
      href: string;
      enabled: boolean;
    }>;
  }>;
  copyright: string;
  showMap: boolean;
  mapEmbedUrl: string;
}

const AdminSettingsPage: React.FC = () => {
  const { toast } = useToast();
  const { refetchSettings } = useSettings();
  const tabsScrollRef = useRef<HTMLDivElement | null>(null);
  const [canScrollTabsLeft, setCanScrollTabsLeft] = useState(false);
  const [canScrollTabsRight, setCanScrollTabsRight] = useState(false);
  
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [uploadingImage, setUploadingImage] = useState<string | null>(null);
  
  // FCM Push Notifications state
  const [adminDevices, setAdminDevices] = useState<any[]>([]);
  const [selectedDeviceId, setSelectedDeviceId] = useState<string | null>(null);
  
  // State for all settings
  const [heroSlides, setHeroSlides] = useState<HeroSlide[]>([]);
  const [homeSections, setHomeSections] = useState<HomeSection[]>([
    { 
      id: "offers", 
      type: "offers", 
      title: "Exclusive Offers", 
      subtitle: "Don't miss out on our special deals", 
      enabled: true,
      order: 3 
    }
  ]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [shopCategories, setShopCategories] = useState<Category[]>([]);
  const [headerSettings, setHeaderSettings] = useState<HeaderSettings>({
    logo: "/placeholder.svg",
    navigationItems: [
      { id: "shop", label: "Shop", href: "/shop", enabled: true, order: 0 },
      { id: "about", label: "About", href: "/about", enabled: true, order: 1 },
      { id: "contact", label: "Contact", href: "/contact", enabled: true, order: 2 },
    ],
    searchPlaceholder: "Search for flowers...",
    showWishlist: true,
    showCart: true,
    showCurrencyConverter: true,
  });
  const [footerSettings, setFooterSettings] = useState<FooterSettings>({
    companyName: "Spring Blossoms Florist",
    description: "Curated floral arrangements and botanical gifts for every occasion, crafted with care and delivered with love.",
    socialLinks: [
      { platform: "Instagram", url: "https://www.instagram.com/sbf_india", enabled: true },
      { platform: "Facebook", url: "#", enabled: true },
      { platform: "Twitter", url: "#", enabled: true },
    ],
    contactInfo: {
      email: "2006sbf@gmail.com",
      phone: "+91 9849589710",
      address: "Door No. 12-2-786/A & B, Najam Centre, Pillar No. 32,Rethi Bowli, Mehdipatnam, Hyderabad, Telangana 500028"
    },
    links: [
      {
        section: "Shop",
        items: [
          { label: "Bouquets", href: "/shop/bouquets", enabled: true },
          { label: "Seasonal", href: "/shop/seasonal", enabled: true },
          { label: "Sale", href: "/shop/sale", enabled: true },
        ]
      },
      {
        section: "Company",
        items: [
          { label: "About Us", href: "/about", enabled: true },
          { label: "Blog", href: "/blog", enabled: true },
          { label: "Contact", href: "/contact", enabled: true },
        ]
      }
    ],
    copyright: `© ${new Date().getFullYear()} Spring Blossoms Florist. All rights reserved.`,
    showMap: true,
    mapEmbedUrl: "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3807.3484898316306!2d78.43144207424317!3d17.395055702585967!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3bcb971c17e5196b%3A0x78305a92a4153749!2sSpring%20Blossoms%20Florist!5e0!3m2!1sen!2sin!4v1744469050804!5m2!1sen!2sin"
  });

  // Simplified sensors configuration to avoid conflicts
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 10,
      },
    }),
    useSensor(TouchSensor, {
      activationConstraint: {
        delay: 250,
        tolerance: 5,
      },
    })
    // Removed KeyboardSensor to prevent input interference
  );

  useEffect(() => {
  const fetchAllSettings = async () => {
    try {
      setLoading(true);
        const response = await api.get("/settings/all");
        const data = response.data;
        
        if (data.heroSlides) {
          // Ensure all required properties are set
          const validatedSlides = data.heroSlides.map((slide: HeroSlide) => ({
            ...slide,
            enabled: typeof slide.enabled === 'boolean' ? slide.enabled : true,
            order: typeof slide.order === 'number' ? slide.order : 0
          }));
          setHeroSlides(validatedSlides);
        }

        let fetchedHomeSections = data.homeSections || [];

        // Ensure "offers" section exists
        const offersSectionExists = fetchedHomeSections.some(section => section.type === 'offers');
        if (!offersSectionExists) {
          fetchedHomeSections.push({
            id: "offers",
            type: "offers",
            title: "Exclusive Offers",
            subtitle: "Don't miss out on our special deals",
            enabled: true,
            order: 3 // Default order, can be adjusted
          });
        }
        
        // Sort sections by order
        fetchedHomeSections.sort((a, b) => a.order - b.order);

        setHomeSections(fetchedHomeSections);
        if (data.categories) setCategories(data.categories);
        if (data.shopCategories) setShopCategories(data.shopCategories);
        if (data.headerSettings) setHeaderSettings(data.headerSettings);
        if (data.footerSettings) setFooterSettings(data.footerSettings);
        
        toast({
          title: "Settings loaded",
          description: "All settings have been loaded successfully",
        });
    } catch (error) {
        console.error("Error fetching settings:", error);
      toast({
        title: "Error",
        description: "Failed to load settings",
          variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

    fetchAllSettings();
  }, []);

  // Fetch admin devices for push notifications
  useEffect(() => {
    const fetchAdminDevices = async () => {
      try {
        const response = await api.get('/device-tokens/admin-devices');
        setAdminDevices(response.data.data || []);
        
        // Auto-select first device if available
        if (response.data.data && response.data.data.length > 0) {
          setSelectedDeviceId(response.data.data[0].id);
        }
      } catch (error) {
        console.error('Failed to fetch admin devices:', error);
        // Silently fail - devices list will be empty
      }
    };

    fetchAdminDevices();
  }, []);

  const updateSlide = (slideId: number, field: keyof HeroSlide, value: string | boolean | number) => {
    console.log('Updating slide:', { slideId, field, value });
    setHeroSlides(prev => {
      const slideIndex = prev.findIndex(slide => slide.id === slideId);
      if (slideIndex === -1) {
        console.error('Slide not found:', slideId);
        return prev;
      }

      const updatedSlides = [...prev];
      const updatedSlide = { ...updatedSlides[slideIndex], [field]: value };
      updatedSlides[slideIndex] = updatedSlide;
      
      console.log('Updated slide:', updatedSlide);
      return updatedSlides;
    });
  };

  const addNewSlide = () => {
    const newSlide: HeroSlide = {
      id: Math.max(...heroSlides.map(s => s.id || 0), 0) + 1,
      title: "New Slide",
      subtitle: "Add your subtitle here",
      image: "https://placehold.co/800x400?text=Add+Image",
      ctaText: "Shop Now",
      ctaLink: "/shop",
      enabled: true,
      order: heroSlides.length
    };
    console.log('Adding new slide:', newSlide);
    setHeroSlides(prev => [...prev, newSlide]);
  };

  const deleteSlide = (slideId: number) => {
    console.log('Deleting slide:', slideId);
    setHeroSlides(prev => {
      const newSlides = prev.filter(slide => slide.id !== slideId);
      console.log('Remaining slides:', newSlides);
      return newSlides;
    });
  };

  const handleSlidesDragEnd = (event: any) => {
    const { active, over } = event;
    if (active.id !== over?.id) {
      console.log('Reordering slides:', { from: active.id, to: over.id });
      setHeroSlides((items) => {
        const oldIndex = items.findIndex((item) => String(item.id) === active.id);
        const newIndex = items.findIndex((item) => String(item.id) === over.id);
        const reordered = arrayMove(items, oldIndex, newIndex);
        const updated = reordered.map((item, index) => ({ ...item, order: index }));
        console.log('Reordered slides:', updated);
        return updated;
      });
    }
  };

  // Home Sections Management
  const toggleSectionEnabled = (id: string) => {
    setHomeSections(prev => prev.map(section => 
          section.id === id ? { ...section, enabled: !section.enabled } : section
    ));
  };

  const updateSectionContent = (id: string, field: string, value: string) => {
    setHomeSections(prev => prev.map(section => 
        section.id === id ? { ...section, [field]: value } : section
    ));
  };

  const addNewSection = () => {
    const newSection: HomeSection = {
      id: `custom-${Date.now()}`,
      type: "custom",
      title: "New Section",
      subtitle: "Add your subtitle here",
      enabled: true,
      order: homeSections.length,
    };
    setHomeSections(prev => [...prev, newSection]);
  };

  const deleteSection = (id: string) => {
    setHomeSections(prev => prev.filter(section => section.id !== id));
  };

  const handleSectionsDragEnd = (event: any) => {
    const { active, over } = event;
    if (active.id !== over?.id) {
      setHomeSections((items) => {
        const oldIndex = items.findIndex((item) => item.id === active.id);
        const newIndex = items.findIndex((item) => item.id === over.id);
        const reordered = arrayMove(items, oldIndex, newIndex);
        return reordered.map((item, index) => ({ ...item, order: index }));
      });
    }
  };

  // Categories Management
  const handleCategoryImageUpload = async (categoryId: string, file: File) => {
    try {
      setUploadingImage(`category-${categoryId}`);
      const formData = new FormData();
      formData.append('image', file);
      
      const response = await uploadImage(formData, 'category');
      const imageUrl = response.imageUrl;
      
      if (!imageUrl) {
        throw new Error('No image URL returned from server');
      }

      setCategories(prev => prev.map(category => 
        category.id === categoryId ? { ...category, image: imageUrl } : category
      ));
      
      toast({
        title: "Image uploaded",
        description: "Category image has been updated successfully",
      });
    } catch (error) {
      console.error("Error uploading category image:", error);
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to upload image",
        variant: "destructive",
      });
    } finally {
      setUploadingImage(null);
    }
  };

  // Shop Categories Management Functions
  const handleShopCategoryImageUpload = async (categoryId: string, file: File) => {
    try {
      setUploadingImage(`shop-category-${categoryId}`);
      const formData = new FormData();
      formData.append('image', file);
      
      const response = await uploadImage(formData, 'category');
      const imageUrl = response.imageUrl;
      
      if (!imageUrl) {
        throw new Error('No image URL returned from server');
      }

      setShopCategories(prev => prev.map(category => 
        category.id === categoryId ? { ...category, image: imageUrl } : category
      ));
      
      toast({
        title: "Image uploaded",
        description: "Shop category image has been updated successfully",
      });
    } catch (error) {
      console.error("Error uploading shop category image:", error);
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to upload image",
        variant: "destructive",
      });
    } finally {
      setUploadingImage(null);
    }
  };

  const toggleShopCategoryEnabled = (id: string) => {
    setShopCategories(prev => prev.map(category => 
      category.id === id ? { ...category, enabled: !category.enabled } : category
    ));
  };

  const updateShopCategoryContent = (id: string, field: string, value: string) => {
    setShopCategories(prev => prev.map(category => 
      category.id === id ? { ...category, [field]: value } : category
    ));
  };

  const addNewShopCategory = () => {
    const newCategory: Category = {
      id: `shop-category-${Date.now()}`,
      name: "New Shop Category",
      description: "Add description here",
      image: "/images/placeholder.jpg",
      link: "/shop/new-category",
      enabled: true,
      order: shopCategories.length,
    };
    setShopCategories(prev => [...prev, newCategory]);
  };

  const deleteShopCategory = (id: string) => {
    setShopCategories(prev => prev.filter(category => category.id !== id));
  };

  const handleShopCategoriesDragEnd = (event: any) => {
    const { active, over } = event;
    if (active.id !== over?.id) {
      setShopCategories((items) => {
        const oldIndex = items.findIndex((item) => item.id === active.id);
        const newIndex = items.findIndex((item) => item.id === over.id);
        const reordered = arrayMove(items, oldIndex, newIndex);
        return reordered.map((item, index) => ({ ...item, order: index }));
      });
    }
  };

  const toggleCategoryEnabled = (id: string) => {
    setCategories(prev => prev.map(category => 
      category.id === id ? { ...category, enabled: !category.enabled } : category
    ));
  };

  const updateCategoryContent = (id: string, field: string, value: string) => {
    setCategories(prev => prev.map(category => 
      category.id === id ? { ...category, [field]: value } : category
    ));
  };

  const addNewCategory = () => {
    const newCategory: Category = {
      id: `category-${Date.now()}`,
      name: "New Category",
      description: "Add description here",
      image: "/images/placeholder.jpg",
      link: "/shop/new-category",
      enabled: true,
      order: categories.length,
    };
    setCategories(prev => [...prev, newCategory]);
  };

  const deleteCategory = (id: string) => {
    setCategories(prev => prev.filter(category => category.id !== id));
  };

  const handleCategoriesDragEnd = (event: any) => {
    const { active, over } = event;
    if (active.id !== over?.id) {
      setCategories((items) => {
        const oldIndex = items.findIndex((item) => item.id === active.id);
        const newIndex = items.findIndex((item) => item.id === over.id);
        const reordered = arrayMove(items, oldIndex, newIndex);
        return reordered.map((item, index) => ({ ...item, order: index }));
      });
    }
  };

  const saveAllSettings = async () => {
    try {
      setSaving(true);
      await api.put("/settings/all", {
        heroSlides,
        homeSections,
        categories,
        shopCategories,
        headerSettings,
        footerSettings,
      });
      
      // Refetch settings to update the context
      await refetchSettings();
      
      toast({
        title: "Settings saved",
        description: "All settings have been saved successfully",
      });
    } catch (error) {
      console.error("Error saving settings:", error);
      
      // Extract error message from response if available
      const errorMessage = error.response?.data?.message || 'Failed to save settings';
      const detailedError = error.response?.data?.errors 
        ? Object.values(error.response.data.errors).join(', ')
        : error.response?.data?.error || error.message;
      
      toast({
        title: "Error",
        description: `${errorMessage}${detailedError ? `: ${detailedError}` : ''}`,
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  // Hero Slides Management
  const handleSlideImageUpload = async (slideId: number, file: File) => {
    try {
      setUploadingImage(`slide-${slideId}`);
      const formData = new FormData();
      formData.append('image', file);
      
      const response = await uploadImage(formData);
      const imageUrl = response.imageUrl;
      
      if (!imageUrl) {
        throw new Error('No image URL returned from server');
      }

      setHeroSlides(prev => prev.map(slide => 
        slide.id === slideId ? { ...slide, image: imageUrl } : slide
      ));
      
      toast({
        title: "Image uploaded",
        description: "Slide image has been updated successfully",
      });
    } catch (error) {
      console.error("Error uploading image:", error);
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to upload image",
        variant: "destructive",
      });
    } finally {
      setUploadingImage(null);
    }
  };

  const updateTabsScrollState = () => {
    const el = tabsScrollRef.current;
    if (!el) return;

    const maxScrollLeft = el.scrollWidth - el.clientWidth;
    setCanScrollTabsLeft(el.scrollLeft > 4);
    setCanScrollTabsRight(el.scrollLeft < maxScrollLeft - 4);
  };

  const scrollTabs = (direction: "left" | "right") => {
    const el = tabsScrollRef.current;
    if (!el) return;

    const amount = Math.max(180, Math.floor(el.clientWidth * 0.7));
    el.scrollBy({
      left: direction === "left" ? -amount : amount,
      behavior: "smooth",
    });
  };

  useEffect(() => {
    const el = tabsScrollRef.current;
    if (!el) return;

    const onScroll = () => updateTabsScrollState();
    const onResize = () => updateTabsScrollState();

    updateTabsScrollState();
    el.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onResize);

    return () => {
      el.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onResize);
    };
  }, []);

  if (loading) {
    return (
      <div className="container mx-auto p-3 sm:p-4 lg:p-6">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="flex flex-col items-center gap-4">
            <RefreshCw className="w-8 h-8 animate-spin text-primary" />
            <p className="text-lg text-gray-600">Loading settings...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-3 sm:p-4 lg:p-6 max-w-7xl">
      <div className="responsive-toolbar mb-6 sm:mb-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">Website Settings</h1>
          <p className="text-gray-600">Manage all aspects of your homepage including hero slides, sections, and content</p>
        </div>
        <Button 
          onClick={saveAllSettings} 
          disabled={saving}
          size="lg"
          className="bg-primary hover:bg-primary/90 w-full sm:w-auto"
        >
          {saving ? (
            <>
              <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Save className="w-4 h-4 mr-2" />
              Save All Settings
            </>
          )}
        </Button>
      </div>

      <Tabs defaultValue="hero-slides" className="space-y-6">
        <div className="relative">
          {canScrollTabsLeft && (
            <Button
              type="button"
              variant="outline"
              size="icon"
              onClick={() => scrollTabs("left")}
              className="absolute left-1 top-1/2 -translate-y-1/2 z-10 h-7 w-7 rounded-full bg-background/95 backdrop-blur touch-action-btn"
              aria-label="Scroll settings tabs left"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
          )}
          {canScrollTabsRight && (
            <Button
              type="button"
              variant="outline"
              size="icon"
              onClick={() => scrollTabs("right")}
              className="absolute right-1 top-1/2 -translate-y-1/2 z-10 h-7 w-7 rounded-full bg-background/95 backdrop-blur touch-action-btn"
              aria-label="Scroll settings tabs right"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          )}
          <TabsList
            ref={tabsScrollRef}
            className="w-full overflow-x-auto no-scrollbar inline-flex h-auto p-1 gap-1 justify-start px-9 sm:px-1"
          >
          <TabsTrigger className="shrink-0 whitespace-nowrap text-xs sm:text-sm" value="hero-slides">Hero Slides</TabsTrigger>
          <TabsTrigger className="shrink-0 whitespace-nowrap text-xs sm:text-sm" value="sections">Page Sections</TabsTrigger>
          <TabsTrigger className="shrink-0 whitespace-nowrap text-xs sm:text-sm" value="shop-categories">Shop Categories</TabsTrigger>
          <TabsTrigger className="shrink-0 whitespace-nowrap text-xs sm:text-sm" value="categories">Home Categories</TabsTrigger>
          <TabsTrigger className="shrink-0 whitespace-nowrap text-xs sm:text-sm" value="header">Header</TabsTrigger>
          <TabsTrigger className="shrink-0 whitespace-nowrap text-xs sm:text-sm" value="footer">Footer</TabsTrigger>
          <TabsTrigger className="shrink-0 whitespace-nowrap text-xs sm:text-sm" value="notifications">App Notifications</TabsTrigger>
          </TabsList>
        </div>

        {/* Hero Slides Tab */}
        <TabsContent value="hero-slides" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <ImageIcon className="w-5 h-5" />
                    Hero Slides Management
                  </CardTitle>
                  <p className="text-sm text-gray-600 mt-1">
                    Manage the main banner slides on your homepage
                  </p>
                </div>
                <Button onClick={addNewSlide} variant="outline">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Slide
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <DndContext 
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragEnd={handleSlidesDragEnd}
              >
                <SortableContext items={heroSlides.map(s => String(s.id))} strategy={verticalListSortingStrategy}>
                  <div className="space-y-4">
                    {heroSlides.map((slide) => (
                      <SortableItem key={slide.id} id={String(slide.id)}>
                        <Card className="border-2 border-dashed border-gray-200 hover:border-primary/50 transition-colors">
                          <CardContent className="p-4 sm:p-6">
                            <div className="flex flex-wrap items-center gap-3 sm:gap-4 mb-4">
                              <SortableHandle>
                                <GripVertical className="w-5 h-5 text-gray-400" />
                              </SortableHandle>
                              <Badge variant={slide.enabled ? "default" : "secondary"}>
                                Slide {slide.id}
                              </Badge>
                              <div className="flex items-center gap-2">
                                  <Switch
                                  id={`slide-enabled-${slide.id}`}
                                  checked={slide.enabled}
                                  onCheckedChange={(checked) => updateSlide(slide.id, 'enabled', checked)}
                                />
                                <Label htmlFor={`slide-enabled-${slide.id}`} className="text-sm">
                                  {slide.enabled ? 'Enabled' : 'Disabled'}
                                </Label>
                              </div>
                              <div className="ml-auto">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => deleteSlide(slide.id)}
                                  className="text-red-600 hover:text-red-700 touch-action-btn"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              </div>
                            </div>

                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                              {/* Image Upload Section */}
                              <div className="space-y-4">
                                <Label className="text-base font-medium">Slide Image</Label>
                                <div className="relative group">
                                  <img
                                    src={slide.image}
                                    alt={slide.title}
                                    className="w-full h-48 object-cover rounded-lg border"
                                    onError={(e) => {
                                      const target = e.target as HTMLImageElement;
                                      target.src = 'https://placehold.co/800x400?text=Image+Not+Found';
                                    }}
                                  />
                                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center">
                                    <Label
                                      htmlFor={`slide-image-${slide.id}`}
                                      className="cursor-pointer bg-white text-black px-4 py-2 rounded-lg font-medium hover:bg-gray-100 transition-colors"
                                    >
                                      {uploadingImage === `slide-${slide.id}` ? (
                                        <>
                                          <RefreshCw className="w-4 h-4 mr-2 animate-spin inline" />
                                          Uploading...
                                        </>
                                      ) : (
                                        <>
                                          <Upload className="w-4 h-4 mr-2 inline" />
                                          Change Image
                                        </>
                                      )}
                                    </Label>
                                    <input
                                      id={`slide-image-${slide.id}`}
                                      type="file"
                                      accept="image/*"
                                      className="hidden"
                                      onChange={(e) => {
                                        const file = e.target.files?.[0];
                                        if (file) {
                                          handleSlideImageUpload(slide.id, file);
                                          e.target.value = ''; // Reset input
                                        }
                                      }}
                                    />
                                </div>
                                </div>
                              </div>

                              {/* Content Section */}
                              <div className="space-y-4">
                                <div className="space-y-2">
                                  <Label htmlFor={`slide-title-${slide.id}`}>Title</Label>
                                    <Input
                                    type="text"
                                    id={`slide-title-${slide.id}`}
                                    value={slide.title || ''}
                                    onChange={(e) => updateSlide(slide.id, 'title', e.target.value)}
                                    placeholder="Enter slide title"
                                    />
                                  </div>

                                <div className="space-y-2">
                                  <Label htmlFor={`slide-subtitle-${slide.id}`}>Subtitle</Label>
                                    <Textarea
                                    id={`slide-subtitle-${slide.id}`}
                                    value={slide.subtitle || ''}
                                    onChange={(e) => updateSlide(slide.id, 'subtitle', e.target.value)}
                                    placeholder="Enter slide subtitle"
                                    rows={3}
                                    />
                                  </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                  <div className="space-y-2">
                                    <Label htmlFor={`slide-cta-${slide.id}`}>Button Text</Label>
                                    <Input
                                      type="text"
                                      id={`slide-cta-${slide.id}`}
                                      value={slide.ctaText || ''}
                                      onChange={(e) => updateSlide(slide.id, 'ctaText', e.target.value)}
                                      placeholder="Shop Now"
                                    />
                                </div>

                                  <div className="space-y-2">
                                    <Label htmlFor={`slide-link-${slide.id}`}>Button Link</Label>
                                    <Input
                                      type="text"
                                      id={`slide-link-${slide.id}`}
                                      value={slide.ctaLink || ''}
                                      onChange={(e) => updateSlide(slide.id, 'ctaLink', e.target.value)}
                                      placeholder="/shop"
                                    />
                              </div>
                                </div>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      </SortableItem>
                    ))}
                  </div>
                </SortableContext>
              </DndContext>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Page Sections Tab */}
        <TabsContent value="sections" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Settings className="w-5 h-5" />
                    Page Sections Management
                  </CardTitle>
                  <p className="text-sm text-gray-600 mt-1">
                    Control which sections appear on your homepage and their content
                  </p>
                </div>
                <Button onClick={addNewSection} variant="outline">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Section
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragEnd={handleSectionsDragEnd}
              >
                <SortableContext items={homeSections.map(s => s.id)} strategy={verticalListSortingStrategy}>
                  <div className="space-y-4">
                    {homeSections.map((section) => (
                      <SortableItem key={section.id} id={section.id}>
                        <Card key={section.id} className="border-2 border-dashed border-gray-200 hover:border-primary/50 transition-colors">
                          <CardContent className="p-4 sm:p-6">
                            <div className="flex flex-wrap items-center gap-3 sm:gap-4 mb-4">
                              <SortableHandle>
                                <GripVertical className="w-5 h-5 text-gray-400" />
                              </SortableHandle>
                              <Badge variant={section.enabled ? "default" : "secondary"}>
                                {section.type}
                              </Badge>
                              <Switch
                                checked={section.enabled}
                                onCheckedChange={() => toggleSectionEnabled(section.id)}
                              />
                              <Label className="text-sm">
                                {section.enabled ? 'Enabled' : 'Disabled'}
                              </Label>
                              <div className="ml-auto flex gap-2">
                                {section.enabled ? 
                                  <Eye className="w-4 h-4 text-green-600" /> : 
                                  <EyeOff className="w-4 h-4 text-gray-400" />
                                }
                              {section.type === 'custom' && (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => deleteSection(section.id)}
                                    className="text-red-600 hover:text-red-700 touch-action-btn"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </Button>
                              )}
                            </div>
                            </div>

                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                              <div className="space-y-2">
                                <Label htmlFor={`section-title-${section.id}`}>Section Title</Label>
                                <Input
                                  id={`section-title-${section.id}`}
                                  value={section.title}
                                  onChange={(e) => updateSectionContent(section.id, 'title', e.target.value)}
                                  placeholder="Enter section title"
                                />
                              </div>

                              <div className="space-y-2">
                                <Label htmlFor={`section-subtitle-${section.id}`}>Section Subtitle</Label>
                                <Textarea
                                  id={`section-subtitle-${section.id}`}
                                  value={section.subtitle}
                                  onChange={(e) => updateSectionContent(section.id, 'subtitle', e.target.value)}
                                  placeholder="Enter section subtitle"
                                  rows={2}
                                />
                              </div>
                            </div>

                            {section.type === 'philosophy' && (
                              <div className="mt-4 space-y-4">
                                <Separator />
                                <Label className="text-base font-medium">Philosophy Section Image</Label>
                                <div className="relative group w-full max-w-md">
                                  <img
                                    src={section.content?.image || '/placeholder.svg'}
                                    alt="Philosophy section"
                                    className="w-full h-32 object-cover rounded-lg border"
                                  />
                                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center">
                                    <Label
                                      htmlFor={`philosophy-image`}
                                      className="cursor-pointer bg-white text-black px-4 py-2 rounded-lg font-medium hover:bg-gray-100 transition-colors"
                                    >
                                      <Upload className="w-4 h-4 mr-2 inline" />
                                      Change Image
                                    </Label>
                                    <input
                                      id={`philosophy-image`}
                                      type="file"
                                      accept="image/*"
                                      className="hidden"
                                      onChange={async (e) => {
                                        const file = e.target.files?.[0];
                                        if (file) {
                                          try {
                                            const formData = new FormData();
                                            formData.append('image', file);
                                            const response = await uploadImage(formData);
                                            updateSectionContent(section.id, 'content', {
                                              ...(section.content || {}),
                                              image: response.imageUrl
                                            });
                                            toast({
                                              title: "Image uploaded",
                                              description: "Philosophy section image updated successfully",
                                            });
                                          } catch (error) {
                                            toast({
                                              title: "Error",
                                              description: "Failed to upload image",
                                              variant: "destructive",
                                            });
                                          }
                                        }
                                      }}
                                    />
                                  </div>
                                </div>
                              </div>
                            )}
                          </CardContent>
                        </Card>
                      </SortableItem>
                    ))}
                  </div>
                </SortableContext>
              </DndContext>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Shop Categories Tab */}
        <TabsContent value="shop-categories" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <ShoppingBag className="w-5 h-5" />
                    Shop Page Categories Management
                  </CardTitle>
                  <p className="text-sm text-gray-600 mt-1">
                    Manage product categories displayed on the shop page with Cloudinary image uploads
                  </p>
                </div>
                <Button onClick={addNewShopCategory} variant="outline">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Shop Category
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <DndContext 
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragEnd={handleShopCategoriesDragEnd}
              >
                <SortableContext items={shopCategories.map(c => c.id)} strategy={verticalListSortingStrategy}>
                  <div className="space-y-4">
                    {shopCategories.map((category) => (
                      <SortableItem key={category.id} id={category.id}>
                        <Card className="border-2 border-dashed border-gray-200 hover:border-primary/50 transition-colors">
                          <CardContent className="p-4 sm:p-6">
                            <div className="flex flex-wrap items-center gap-3 sm:gap-4 mb-4">
                              <SortableHandle>
                                <GripVertical className="w-5 h-5 text-gray-400" />
                              </SortableHandle>
                              <Badge variant={category.enabled ? "default" : "secondary"}>
                                {category.name}
                              </Badge>
                              <Switch
                                checked={category.enabled}
                                onCheckedChange={() => toggleShopCategoryEnabled(category.id)}
                              />
                              <Label className="text-sm">
                                {category.enabled ? 'Enabled' : 'Disabled'}
                              </Label>
                              <div className="ml-auto flex gap-2">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => deleteShopCategory(category.id)}
                                  className="text-red-600 hover:text-red-700 touch-action-btn"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              </div>
                            </div>

                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                              {/* Image Upload */}
                              <div className="space-y-4">
                                <div className="relative">
                                  <ImageUpload
                                    currentImage={category.image}
                                    onImageUpload={(file) => handleShopCategoryImageUpload(category.id, file)}
                                    isUploading={uploadingImage === `shop-category-${category.id}`}
                                    aspectRatio="landscape"
                                    placeholder="Upload shop category image"
                                  />
                                </div>
                              </div>

                              {/* Content Section */}
                              <div className="space-y-4">
                                <div className="space-y-2">
                                  <Label htmlFor={`shop-category-name-${category.id}`}>Category Name</Label>
                                  <Input
                                    id={`shop-category-name-${category.id}`}
                                    value={category.name}
                                    onChange={(e) => updateShopCategoryContent(category.id, 'name', e.target.value)}
                                    placeholder="Enter category name"
                                  />
                                </div>

                                <div className="space-y-2">
                                  <Label htmlFor={`shop-category-description-${category.id}`}>Description</Label>
                                  <Textarea
                                    id={`shop-category-description-${category.id}`}
                                    value={category.description}
                                    onChange={(e) => updateShopCategoryContent(category.id, 'description', e.target.value)}
                                    placeholder="Enter category description"
                                    rows={2}
                                  />
                                </div>

                                <div className="space-y-2">
                                  <Label htmlFor={`shop-category-link-${category.id}`}>Category Link</Label>
                                  <Input
                                    id={`shop-category-link-${category.id}`}
                                    value={category.link}
                                    onChange={(e) => updateShopCategoryContent(category.id, 'link', e.target.value)}
                                    placeholder="Enter category link (e.g., /shop/roses)"
                                  />
                                </div>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      </SortableItem>
                    ))}
                  </div>
                </SortableContext>
              </DndContext>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Home Categories Tab */}
        <TabsContent value="categories" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Edit className="w-5 h-5" />
                    Categories Management
                  </CardTitle>
                  <p className="text-sm text-gray-600 mt-1">
                    Manage product categories displayed on the homepage
                  </p>
                </div>
                <Button onClick={addNewCategory} variant="outline">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Category
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <DndContext 
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragEnd={handleCategoriesDragEnd}
              >
                <SortableContext items={categories.map(c => c.id)} strategy={verticalListSortingStrategy}>
                  <div className="space-y-4">
                    {categories.map((category) => (
                      <SortableItem key={category.id} id={category.id}>
                        <Card key={category.id} className="border-2 border-dashed border-gray-200 hover:border-primary/50 transition-colors">
                          <CardContent className="p-4 sm:p-6">
                            <div className="flex flex-wrap items-center gap-3 sm:gap-4 mb-4">
                              <SortableHandle>
                                <GripVertical className="w-5 h-5 text-gray-400" />
                              </SortableHandle>
                              <Badge variant={category.enabled ? "default" : "secondary"}>
                                {category.name}
                              </Badge>
                                  <Switch
                                    checked={category.enabled}
                                onCheckedChange={() => toggleCategoryEnabled(category.id)}
                              />
                              <Label className="text-sm">
                                {category.enabled ? 'Enabled' : 'Disabled'}
                              </Label>
                              <div className="ml-auto flex gap-2">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => deleteCategory(category.id)}
                                  className="text-red-600 hover:text-red-700 touch-action-btn"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                              {/* Image Upload */}
                              <div className="space-y-4">
                                <div className="relative">
                                  <ImageUpload
                                    currentImage={category.image}
                                    onImageUpload={(file) => handleCategoryImageUpload(category.id, file)}
                                    isUploading={uploadingImage === `category-${category.id}`}
                                    aspectRatio="landscape"
                                    placeholder="Upload category image"
                                  />
                                </div>
                              </div>

                              {/* Content Section */}
                              <div className="space-y-4">
                                <div className="space-y-2">
                                  <Label htmlFor={`category-name-${category.id}`}>Category Name</Label>
                                    <Input
                                    id={`category-name-${category.id}`}
                                      value={category.name}
                                    onChange={(e) => updateCategoryContent(category.id, 'name', e.target.value)}
                                    placeholder="Enter category name"
                                    />
                                  </div>

                                <div className="space-y-2">
                                  <Label htmlFor={`category-description-${category.id}`}>Description</Label>
                                  <Textarea
                                    id={`category-description-${category.id}`}
                                      value={category.description}
                                    onChange={(e) => updateCategoryContent(category.id, 'description', e.target.value)}
                                    placeholder="Enter category description"
                                    rows={2}
                                    />
                                  </div>

                                <div className="space-y-2">
                                  <Label htmlFor={`category-link-${category.id}`}>Category Link</Label>
                                    <Input
                                    id={`category-link-${category.id}`}
                                      value={category.link}
                                    onChange={(e) => updateCategoryContent(category.id, 'link', e.target.value)}
                                    placeholder="/shop/category-name"
                                    />
                                  </div>
                                </div>
                            </div>
                          </CardContent>
                        </Card>
                      </SortableItem>
                    ))}
                  </div>
                </SortableContext>
              </DndContext>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Header Settings Tab */}
        <TabsContent value="header" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Header Settings</CardTitle>
              <p className="text-sm text-gray-600">Configure your website header and navigation</p>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="logo-url">Logo</Label>
                  <ImageUpload
                    currentImage={headerSettings.logo}
                    onImageUpload={async (file) => {
                      const formData = new FormData();
                      formData.append('image', file);
                      const response = await uploadImage(formData, 'logo');
                      if (response.imageUrl) {
                        setHeaderSettings(prev => ({ ...prev, logo: response.imageUrl }));
                        toast({ title: 'Logo updated', description: 'Logo image uploaded successfully.' });
                      } else {
                        toast({ title: 'Error', description: 'Failed to upload logo image', variant: 'destructive' });
                      }
                    }}
                    aspectRatio="square"
                    placeholder="Upload logo image"
                  />
                </div>
              
                <div className="space-y-2">
                  <Label htmlFor="search-placeholder">Search Placeholder</Label>
                <Input
                    id="search-placeholder"
                  value={headerSettings.searchPlaceholder}
                  onChange={(e) => setHeaderSettings(prev => ({ ...prev, searchPlaceholder: e.target.value }))}
                    placeholder="Search for flowers..."
                />
              </div>

                <div className="space-y-4">
                  <Label className="text-base font-medium">Header Features</Label>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="flex items-center space-x-2">
                  <Switch
                        id="show-wishlist"
                    checked={headerSettings.showWishlist}
                    onCheckedChange={(checked) => setHeaderSettings(prev => ({ ...prev, showWishlist: checked }))}
                  />
                      <Label htmlFor="show-wishlist">Show Wishlist</Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                        id="show-cart"
                    checked={headerSettings.showCart}
                    onCheckedChange={(checked) => setHeaderSettings(prev => ({ ...prev, showCart: checked }))}
                  />
                      <Label htmlFor="show-cart">Show Cart</Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                        id="show-currency"
                    checked={headerSettings.showCurrencyConverter}
                    onCheckedChange={(checked) => setHeaderSettings(prev => ({ ...prev, showCurrencyConverter: checked }))}
                  />
                      <Label htmlFor="show-currency">Show Currency Converter</Label>
                </div>
              </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Footer Settings Tab */}
        <TabsContent value="footer" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Footer Settings</CardTitle>
              <p className="text-sm text-gray-600">Configure your website footer information</p>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="company-name">Company Name</Label>
                  <Input
                      id="company-name"
                    value={footerSettings.companyName}
                    onChange={(e) => setFooterSettings(prev => ({ ...prev, companyName: e.target.value }))}
                      placeholder="Spring Blossoms Florist"
                  />
                </div>

                  <div className="space-y-2">
                    <Label htmlFor="company-description">Company Description</Label>
                    <Textarea
                      id="company-description"
                      value={footerSettings.description}
                      onChange={(e) => setFooterSettings(prev => ({ ...prev, description: e.target.value }))}
                      placeholder="Company description"
                      rows={3}
                    />
                  </div>

                  <div className="space-y-2">
                  <Label htmlFor="copyright">Copyright Text</Label>
                  <Input
                    id="copyright"
                    value={footerSettings.copyright}
                    onChange={(e) => setFooterSettings(prev => ({ ...prev, copyright: e.target.value }))}
                      placeholder="© 2024 Spring Blossoms Florist. All rights reserved."
                  />
                </div>
              </div>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="contact-email">Contact Email</Label>
                    <Input
                      id="contact-email"
                      value={footerSettings.contactInfo.email}
                      onChange={(e) => setFooterSettings(prev => ({
                        ...prev,
                        contactInfo: { ...prev.contactInfo, email: e.target.value }
                      }))}
                      placeholder="contact@example.com"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="contact-phone">Contact Phone</Label>
                    <Input
                      id="contact-phone"
                      value={footerSettings.contactInfo.phone}
                      onChange={(e) => setFooterSettings(prev => ({
                        ...prev,
                        contactInfo: { ...prev.contactInfo, phone: e.target.value }
                      }))}
                      placeholder="+91 9849589710"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="contact-address">Contact Address</Label>
                  <Textarea
                      id="contact-address"
                    value={footerSettings.contactInfo.address}
                    onChange={(e) => setFooterSettings(prev => ({
                      ...prev,
                      contactInfo: { ...prev.contactInfo, address: e.target.value }
                    }))}
                      placeholder="Business address"
                    rows={3}
                  />
                  </div>
                </div>
              </div>

              <Separator />

              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Switch
                    id="show-map"
                    checked={footerSettings.showMap}
                    onCheckedChange={(checked) => setFooterSettings(prev => ({ ...prev, showMap: checked }))}
                  />
                  <Label htmlFor="show-map">Show Google Map</Label>
                </div>

                {footerSettings.showMap && (
                  <div className="space-y-2">
                    <Label htmlFor="map-embed">Google Map Embed URL</Label>
                    <Textarea
                      id="map-embed"
                      value={footerSettings.mapEmbedUrl}
                      onChange={(e) => setFooterSettings(prev => ({ ...prev, mapEmbedUrl: e.target.value }))}
                      placeholder="Google Maps embed URL"
                      rows={2}
                    />
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* App Notifications Tab */}
        <TabsContent value="notifications" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Bell className="w-5 h-5" />
                    Mobile App Push Notifications
                  </CardTitle>
                  <p className="text-sm text-gray-600 mt-1">
                    Send test notifications to registered admin devices
                  </p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={async () => {
                    try {
                      const response = await api.get('/device-tokens/admin-devices');
                      const devices = response.data.data || [];
                      setAdminDevices(devices);
                      if (devices.length > 0 && !selectedDeviceId) {
                        setSelectedDeviceId(devices[0].id);
                      }
                      toast({
                        title: "✅ Devices Refreshed",
                        description: `Found ${devices.length} registered admin device(s)`,
                      });
                    } catch (error: any) {
                      console.error('Failed to fetch devices:', error);
                      toast({
                        variant: "destructive",
                        title: "Failed to Fetch Devices",
                        description: error.response?.data?.message || "Could not load registered devices",
                      });
                    }
                  }}
                  className="w-full sm:w-auto touch-action-btn"
                >
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Refresh Devices
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-sm text-blue-800">
                  <strong>Note:</strong> Select a registered device below to send a test notification.
                  Devices are automatically registered when admins log in to the mobile app.
                </p>
              </div>

              {/* Registered Devices List */}
              <div className="space-y-3">
                <Label className="text-sm font-medium">Registered Admin Devices ({adminDevices.length})</Label>
                {adminDevices.length === 0 ? (
                  <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 sm:p-6 text-center">
                    <Bell className="w-12 h-12 mx-auto text-gray-400 mb-3" />
                    <p className="text-sm text-gray-600 mb-2">No devices registered yet</p>
                    <p className="text-xs text-gray-500">
                      Admins need to log in to the mobile app first to register their devices
                    </p>
                  </div>
                ) : (
                  <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
                    {adminDevices.map((device: any) => (
                      <div
                        key={device.id}
                        className={`border rounded-lg p-3 cursor-pointer transition-all ${
                          selectedDeviceId === device.id
                            ? 'border-blue-500 bg-blue-50 shadow-sm'
                            : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                        }`}
                        onClick={() => setSelectedDeviceId(device.id)}
                      >
                        <div className="flex items-start sm:items-center justify-between gap-2">
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <span className="font-medium text-sm">{device.user?.name || 'Unknown User'}</span>
                              <Badge variant={device.deviceType === 'android' ? 'default' : 'secondary'} className="text-xs">
                                {device.deviceType}
                              </Badge>
                            </div>
                            <p className="text-xs text-gray-500 mt-1">{device.user?.email}</p>
                            <p className="text-xs text-gray-400 mt-1">
                              Last used: {new Date(device.lastUsed).toLocaleString()}
                            </p>
                          </div>
                          {selectedDeviceId === device.id && (
                            <div className="w-5 h-5 rounded-full bg-blue-500 flex items-center justify-center">
                              <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                              </svg>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <Separator />

              {/* Test Notification Form */}
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="test-notif-title">Notification Title</Label>
                  <Input
                    id="test-notif-title"
                    placeholder="Enter notification title"
                    defaultValue="🧪 Test Notification"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="test-notif-body">Notification Body</Label>
                  <Textarea
                    id="test-notif-body"
                    placeholder="Enter notification message"
                    defaultValue="This is a test push notification from SBF Florist Admin Panel"
                    rows={3}
                  />
                </div>

                <div className="flex flex-col sm:flex-row gap-3">
                  <Button
                    onClick={async () => {
                      if (!selectedDeviceId) {
                        toast({
                          variant: "destructive",
                          title: "❌ No Device Selected",
                          description: "Please select a device first, or refresh if no devices are shown",
                        });
                        return;
                      }

                      const titleInput = document.getElementById('test-notif-title') as HTMLInputElement;
                      const bodyInput = document.getElementById('test-notif-body') as HTMLTextAreaElement;
                      
                      const title = titleInput?.value || '🧪 Test Notification';
                      const body = bodyInput?.value || 'This is a test notification';

                      try {
                        const response = await api.post('/device-tokens/test-by-id', {
                          deviceId: selectedDeviceId,
                          title,
                          body,
                          data: {
                            source: 'admin_panel',
                            timestamp: new Date().toISOString()
                          }
                        });

                        if (response.data.success) {
                          toast({
                            title: "✅ Notification Sent!",
                            description: "Test notification sent successfully to the selected device!",
                          });
                        }
                      } catch (error: any) {
                        console.error('Failed to send test notification:', error);
                        
                        const errorMessage = error.response?.data?.message || 
                                           error.response?.data?.error || 
                                           "Failed to send notification. Device may no longer be registered.";
                        
                        toast({
                          variant: "destructive",
                          title: "❌ Failed to Send",
                          description: errorMessage,
                        });
                      }
                    }}
                    className="w-full sm:flex-1 touch-action-btn"
                    disabled={!selectedDeviceId}
                  >
                    <Send className="w-4 h-4 mr-2" />
                    Send Test Notification
                  </Button>
                </div>
              </div>

              <Separator />

              <div className="space-y-3">
                <h4 className="font-medium text-sm">How to Register Your Device:</h4>
                <ol className="text-sm text-gray-600 space-y-2 pl-5 list-decimal">
                  <li>Open the mobile app and log in as admin</li>
                  <li>Go to Settings → Notifications</li>
                  <li>Enable push notifications and grant permission</li>
                  <li>Your device will be automatically registered</li>
                  <li>Return here and click "Refresh Devices" to see your device</li>
                  <li>Select your device and click "Send Test Notification"</li>
                </ol>
              </div>

              <Separator />

              <div className="space-y-3">
                <h4 className="font-medium text-sm">Firebase Configuration Status:</h4>
                <div className="flex items-center gap-2">
                  {process.env.NODE_ENV === 'development' ? (
                    <Badge variant="outline" className="bg-yellow-50 text-yellow-800 border-yellow-200">
                      Development Mode
                    </Badge>
                  ) : (
                    <Badge variant="default" className="bg-green-50 text-green-800 border-green-200">
                      Production Mode
                    </Badge>
                  )}
                </div>
                <p className="text-xs text-gray-500">
                  Push notifications are configured on the backend. Check server logs for Firebase initialization status.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminSettingsPage;
