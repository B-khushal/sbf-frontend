import { useEffect, useState } from "react";
import { DndContext, closestCenter, PointerSensor, useSensor, useSensors, TouchSensor } from "@dnd-kit/core";
import { arrayMove, SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { SortableItem } from "../components/ui/SortableItem";
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
  ShoppingBag
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
  
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [uploadingImage, setUploadingImage] = useState<string | null>(null);
  
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
    logo: "/images/logosbf.png",
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

  if (loading) {
    return (
      <div className="container mx-auto p-6">
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
    <div className="container mx-auto p-6 max-w-7xl">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Website Settings</h1>
          <p className="text-gray-600">Manage all aspects of your homepage including hero slides, sections, and content</p>
        </div>
        <Button 
          onClick={saveAllSettings} 
          disabled={saving}
          size="lg"
          className="bg-primary hover:bg-primary/90"
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
        <TabsList className="grid w-full grid-cols-6 lg:w-[720px]">
          <TabsTrigger value="hero-slides">Hero Slides</TabsTrigger>
          <TabsTrigger value="sections">Page Sections</TabsTrigger>
          <TabsTrigger value="shop-categories">Shop Categories</TabsTrigger>
          <TabsTrigger value="categories">Home Categories</TabsTrigger>
          <TabsTrigger value="header">Header</TabsTrigger>
          <TabsTrigger value="footer">Footer</TabsTrigger>
        </TabsList>

        {/* Hero Slides Tab */}
        <TabsContent value="hero-slides" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
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
                          <CardContent className="p-6">
                            <div className="flex items-center gap-4 mb-4">
                              <GripVertical className="w-5 h-5 text-gray-400 cursor-grab" />
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
                                  className="text-red-600 hover:text-red-700"
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

                                <div className="grid grid-cols-2 gap-4">
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
              <div className="flex justify-between items-center">
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
                          <CardContent className="p-6">
                            <div className="flex items-center gap-4 mb-4">
                              <GripVertical className="w-5 h-5 text-gray-400 cursor-grab" />
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
                                  className="text-red-600 hover:text-red-700"
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
                                    src={section.content?.image || '/images/d3.jpg'}
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
                                              ...section.content, 
                                              image: response.url 
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
              <div className="flex justify-between items-center">
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
                          <CardContent className="p-6">
                            <div className="flex items-center gap-4 mb-4">
                              <GripVertical className="w-5 h-5 text-gray-400 cursor-grab" />
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
                                  className="text-red-600 hover:text-red-700"
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
              <div className="flex justify-between items-center">
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
                          <CardContent className="p-6">
                            <div className="flex items-center gap-4 mb-4">
                              <GripVertical className="w-5 h-5 text-gray-400 cursor-grab" />
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
                                  className="text-red-600 hover:text-red-700"
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
                      const response = await uploadImage(formData);
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
      </Tabs>
    </div>
  );
};

export default AdminSettingsPage;