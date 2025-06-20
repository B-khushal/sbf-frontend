import React, { useEffect, useState } from "react";
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors } from "@dnd-kit/core";
import { arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy } from "@dnd-kit/sortable";
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
import { Plus, Trash2, Eye, EyeOff, GripVertical, Save, RefreshCw } from "lucide-react";
import api from "../services/api";
import { useToast } from "../hooks/use-toast";

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
  const [homeSections, setHomeSections] = useState<HomeSection[]>([]);
  const [categories, setCategories] = useState<Category[]>([
    {
      id: 'bouquets',
      name: 'Bouquets',
      description: 'Handcrafted floral arrangements',
      image: 'https://images.unsplash.com/photo-1582794543139-8ac9cb0f7b11?ixlib=rb-4.0.3&q=85&w=800&auto=format&fit=crop',
      link: '/shop/bouquets',
      enabled: true,
      order: 0,
    },
    {
      id: 'plants',
      name: 'Plants',
      description: 'Indoor and outdoor greenery',
      image: 'https://images.unsplash.com/photo-1533038590840-1cde6e668a91?ixlib=rb-4.0.3&q=85&w=800&auto=format&fit=crop',
      link: '/shop/plants',
      enabled: true,
      order: 1,
    },
    {
      id: 'gifts',
      name: 'Gifts',
      description: 'Thoughtful presents for any occasion',
      image: 'https://images.unsplash.com/photo-1549465220-1a8b9238cd48?ixlib=rb-4.0.3&q=85&w=800&auto=format&fit=crop',
      link: '/shop/gifts',
      enabled: true,
      order: 2,
    },
    {
      id: 'baskets',
      name: 'Baskets',
      description: 'Thoughtful presents for any occasion',
      image: '/images/d3.jpg',
      link: '/shop/baskets',
      enabled: true,
      order: 3,
    },
    {
      id: 'birthday',
      name: 'Birthday',
      description: 'Perfect floral gifts',
      image: 'https://images.unsplash.com/photo-1464349095431-e9a21285b5f3?ixlib=rb-4.0.3&q=85&w=800&auto=format&fit=crop',
      link: '/shop/birthday',
      enabled: true,
      order: 4,
    },
    {
      id: 'anniversary',
      name: 'Anniversary',
      description: 'Romantic arrangements',
      image: 'https://images.unsplash.com/photo-1519378058457-4c29a0a2efac?ixlib=rb-4.0.3&q=85&w=800&auto=format&fit=crop',
      link: '/shop/anniversary',
      enabled: true,
      order: 5,
    },
  ]);
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
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  useEffect(() => {
    fetchAllSettings();
  }, []);

  const fetchAllSettings = async () => {
    try {
      setLoading(true);
      
      // Fetch all settings in parallel
      const [sectionsRes, categoriesRes, headerRes, footerRes] = await Promise.allSettled([
        api.get("/settings/home-sections"),
        api.get("/settings/categories"),
        api.get("/settings/header"),
        api.get("/settings/footer"),
      ]);

      // Handle home sections
      if (sectionsRes.status === 'fulfilled') {
        setHomeSections(sectionsRes.value.data || [
          { id: 'hero', type: 'hero', title: 'Hero Section', subtitle: 'Main banner area', enabled: true, order: 0 },
          { id: 'categories', type: 'categories', title: 'Categories', subtitle: 'Product categories showcase', enabled: true, order: 1 },
          { id: 'featured', type: 'featured', title: 'Featured Collection', subtitle: 'Explore our most popular floral arrangements', enabled: true, order: 2 },
          { id: 'new', type: 'new', title: 'New Arrivals', subtitle: 'Discover our latest seasonal additions', enabled: true, order: 3 },
          { id: 'philosophy', type: 'philosophy', title: 'Artfully Crafted Botanical Experiences', subtitle: 'Every arrangement we create is a unique work of art, designed to bring beauty and tranquility into your everyday spaces.', enabled: true, order: 4 }
        ]);
      }

      // Handle categories
      if (categoriesRes.status === 'fulfilled') {
        setCategories(categoriesRes.value.data || []);
      }

      // Handle header settings
      if (headerRes.status === 'fulfilled') {
        setHeaderSettings(headerRes.value.data);
      }

      // Handle footer settings
      if (footerRes.status === 'fulfilled') {
        setFooterSettings(footerRes.value.data);
      }

    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load settings",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDragEnd = (event: any, type: 'sections' | 'categories') => {
    const { active, over } = event;

    if (active.id !== over.id) {
      if (type === 'sections') {
        setHomeSections((items) => {
          const oldIndex = items.findIndex((item) => item.id === active.id);
          const newIndex = items.findIndex((item) => item.id === over.id);
          const newItems = arrayMove(items, oldIndex, newIndex);
          return newItems.map((item, index) => ({ ...item, order: index }));
        });
      } else {
        setCategories((items) => {
          const oldIndex = items.findIndex((item) => item.id === active.id);
          const newIndex = items.findIndex((item) => item.id === over.id);
          const newItems = arrayMove(items, oldIndex, newIndex);
          return newItems.map((item, index) => ({ ...item, order: index }));
        });
      }
    }
  };

  const toggleSectionEnabled = (id: string, type: 'sections' | 'categories') => {
    if (type === 'sections') {
      setHomeSections(prev => 
        prev.map(section => 
          section.id === id ? { ...section, enabled: !section.enabled } : section
        )
      );
    } else {
      setCategories(prev => 
        prev.map(category => 
          category.id === id ? { ...category, enabled: !category.enabled } : category
        )
      );
    }
  };

  const updateSectionContent = (id: string, field: string, value: string) => {
    setHomeSections(prev => 
      prev.map(section => 
        section.id === id ? { ...section, [field]: value } : section
      )
    );
  };

  const updateCategoryContent = (id: string, field: string, value: string) => {
    setCategories(prev => 
      prev.map(category => 
        category.id === id ? { ...category, [field]: value } : category
      )
    );
  };

  const addNewSection = () => {
    const newSection: HomeSection = {
      id: `custom-${Date.now()}`,
      type: 'custom',
      title: 'New Section',
      subtitle: 'Section description',
      enabled: true,
      order: homeSections.length,
    };
    setHomeSections(prev => [...prev, newSection]);
  };

  const addNewCategory = () => {
    const newCategory: Category = {
      id: `category-${Date.now()}`,
      name: 'New Category',
      description: 'Category description',
      image: 'https://images.unsplash.com/photo-1582794543139-8ac9cb0f7b11?ixlib=rb-4.0.3&q=85&w=800&auto=format&fit=crop',
      link: '/shop/new-category',
      enabled: true,
      order: categories.length,
    };
    setCategories(prev => [...prev, newCategory]);
  };

  const deleteSection = (id: string) => {
    setHomeSections(prev => prev.filter(section => section.id !== id));
  };

  const deleteCategory = (id: string) => {
    setCategories(prev => prev.filter(category => category.id !== id));
  };

  const saveAllSettings = async () => {
    try {
      setSaving(true);
      
      // Save each setting type
      await Promise.allSettled([
        api.put("/settings/home-sections", { sections: homeSections }),
        api.put("/settings/categories", { categories }),
        api.put("/settings/header", headerSettings),
        api.put("/settings/footer", footerSettings),
      ]);
      
      toast({
        title: "Success",
        description: "All settings saved successfully",
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to save settings",
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-2" />
          <p>Loading settings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Website Settings</h1>
          <p className="text-muted-foreground">Manage your website content and layout</p>
        </div>
        <Button onClick={saveAllSettings} disabled={saving} className="gap-2">
          {saving ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
          {saving ? "Saving..." : "Save All Changes"}
        </Button>
      </div>

      <Tabs defaultValue="sections" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="sections">Home Sections</TabsTrigger>
          <TabsTrigger value="categories">Categories</TabsTrigger>
          <TabsTrigger value="header">Header</TabsTrigger>
          <TabsTrigger value="footer">Footer</TabsTrigger>
        </TabsList>

        <TabsContent value="sections" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Home Page Sections</CardTitle>
                  <p className="text-sm text-muted-foreground">Drag to reorder, toggle to enable/disable</p>
                </div>
                <Button onClick={addNewSection} size="sm" className="gap-2">
                  <Plus className="h-4 w-4" />
                  Add Section
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <DndContext 
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragEnd={(event) => handleDragEnd(event, 'sections')}
              >
                <SortableContext items={homeSections.map(s => s.id)} strategy={verticalListSortingStrategy}>
                  <div className="space-y-4">
                    {homeSections.map((section) => (
                      <SortableItem key={section.id} id={section.id}>
                        <Card className={`${!section.enabled ? 'opacity-50' : ''}`}>
                          <CardContent className="p-4">
                            <div className="flex items-center gap-4">
                              <GripVertical className="h-5 w-5 text-muted-foreground cursor-grab" />
                              <div className="flex-1 space-y-3">
                                <div className="flex items-center gap-3">
                                  <Switch
                                    checked={section.enabled}
                                    onCheckedChange={() => toggleSectionEnabled(section.id, 'sections')}
                                  />
                                  <Badge variant="outline">{section.type}</Badge>
                                  {section.enabled ? (
                                    <Eye className="h-4 w-4 text-green-600" />
                                  ) : (
                                    <EyeOff className="h-4 w-4 text-muted-foreground" />
                                  )}
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                  <div>
                                    <Label htmlFor={`title-${section.id}`}>Title</Label>
                                    <Input
                                      id={`title-${section.id}`}
                                      value={section.title || ""}
                                      onChange={(e) => updateSectionContent(section.id, "title", e.target.value)}
                                      placeholder="Section title"
                                    />
                                  </div>
                                  <div>
                                    <Label htmlFor={`subtitle-${section.id}`}>Subtitle</Label>
                                    <Textarea
                                      id={`subtitle-${section.id}`}
                                      value={section.subtitle || ""}
                                      onChange={(e) => updateSectionContent(section.id, "subtitle", e.target.value)}
                                      placeholder="Section subtitle"
                                      rows={2}
                                    />
                                  </div>
                                </div>
                              </div>
                              {section.type === 'custom' && (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => deleteSection(section.id)}
                                  className="text-red-600 hover:text-red-700"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              )}
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

        <TabsContent value="categories" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Categories</CardTitle>
                  <p className="text-sm text-muted-foreground">Manage category display and order</p>
                </div>
                <Button onClick={addNewCategory} size="sm" className="gap-2">
                  <Plus className="h-4 w-4" />
                  Add Category
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <DndContext 
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragEnd={(event) => handleDragEnd(event, 'categories')}
              >
                <SortableContext items={categories.map(c => c.id)} strategy={verticalListSortingStrategy}>
                  <div className="space-y-4">
                    {categories.map((category) => (
                      <SortableItem key={category.id} id={category.id}>
                        <Card className={`${!category.enabled ? 'opacity-50' : ''}`}>
                          <CardContent className="p-4">
                            <div className="flex items-center gap-4">
                              <GripVertical className="h-5 w-5 text-muted-foreground cursor-grab" />
                              <div className="flex-1 space-y-3">
                                <div className="flex items-center gap-3">
                                  <Switch
                                    checked={category.enabled}
                                    onCheckedChange={() => toggleSectionEnabled(category.id, 'categories')}
                                  />
                                  {category.enabled ? (
                                    <Eye className="h-4 w-4 text-green-600" />
                                  ) : (
                                    <EyeOff className="h-4 w-4 text-muted-foreground" />
                                  )}
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                  <div>
                                    <Label htmlFor={`name-${category.id}`}>Name</Label>
                                    <Input
                                      id={`name-${category.id}`}
                                      value={category.name}
                                      onChange={(e) => updateCategoryContent(category.id, "name", e.target.value)}
                                      placeholder="Category name"
                                    />
                                  </div>
                                  <div>
                                    <Label htmlFor={`description-${category.id}`}>Description</Label>
                                    <Input
                                      id={`description-${category.id}`}
                                      value={category.description}
                                      onChange={(e) => updateCategoryContent(category.id, "description", e.target.value)}
                                      placeholder="Category description"
                                    />
                                  </div>
                                  <div>
                                    <Label htmlFor={`link-${category.id}`}>Link</Label>
                                    <Input
                                      id={`link-${category.id}`}
                                      value={category.link}
                                      onChange={(e) => updateCategoryContent(category.id, "link", e.target.value)}
                                      placeholder="/shop/category"
                                    />
                                  </div>
                                </div>
                                <div>
                                  <Label htmlFor={`image-${category.id}`}>Image URL</Label>
                                  <Input
                                    id={`image-${category.id}`}
                                    value={category.image}
                                    onChange={(e) => updateCategoryContent(category.id, "image", e.target.value)}
                                    placeholder="Image URL"
                                  />
                                </div>
                              </div>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => deleteCategory(category.id)}
                                className="text-red-600 hover:text-red-700"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
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

        <TabsContent value="header" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Header Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <Label htmlFor="logo">Logo URL</Label>
                <Input
                  id="logo"
                  value={headerSettings.logo}
                  onChange={(e) => setHeaderSettings(prev => ({ ...prev, logo: e.target.value }))}
                  placeholder="Logo image URL"
                />
              </div>
              
              <div>
                <Label htmlFor="searchPlaceholder">Search Placeholder</Label>
                <Input
                  id="searchPlaceholder"
                  value={headerSettings.searchPlaceholder}
                  onChange={(e) => setHeaderSettings(prev => ({ ...prev, searchPlaceholder: e.target.value }))}
                  placeholder="Search placeholder text"
                />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="flex items-center space-x-2">
                  <Switch
                    id="showWishlist"
                    checked={headerSettings.showWishlist}
                    onCheckedChange={(checked) => setHeaderSettings(prev => ({ ...prev, showWishlist: checked }))}
                  />
                  <Label htmlFor="showWishlist">Show Wishlist</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    id="showCart"
                    checked={headerSettings.showCart}
                    onCheckedChange={(checked) => setHeaderSettings(prev => ({ ...prev, showCart: checked }))}
                  />
                  <Label htmlFor="showCart">Show Cart</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    id="showCurrencyConverter"
                    checked={headerSettings.showCurrencyConverter}
                    onCheckedChange={(checked) => setHeaderSettings(prev => ({ ...prev, showCurrencyConverter: checked }))}
                  />
                  <Label htmlFor="showCurrencyConverter">Show Currency Converter</Label>
                </div>
              </div>

              <Separator />

              <div>
                <h3 className="text-lg font-medium mb-3">Navigation Items</h3>
                <div className="space-y-3">
                  {headerSettings.navigationItems.map((item, index) => (
                    <div key={item.id} className="flex items-center gap-3 p-3 border rounded">
                      <Switch
                        checked={item.enabled}
                        onCheckedChange={(checked) => {
                          const newItems = [...headerSettings.navigationItems];
                          newItems[index].enabled = checked;
                          setHeaderSettings(prev => ({ ...prev, navigationItems: newItems }));
                        }}
                      />
                      <Input
                        value={item.label}
                        onChange={(e) => {
                          const newItems = [...headerSettings.navigationItems];
                          newItems[index].label = e.target.value;
                          setHeaderSettings(prev => ({ ...prev, navigationItems: newItems }));
                        }}
                        placeholder="Label"
                        className="flex-1"
                      />
                      <Input
                        value={item.href}
                        onChange={(e) => {
                          const newItems = [...headerSettings.navigationItems];
                          newItems[index].href = e.target.value;
                          setHeaderSettings(prev => ({ ...prev, navigationItems: newItems }));
                        }}
                        placeholder="URL"
                        className="flex-1"
                      />
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="footer" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Footer Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="companyName">Company Name</Label>
                  <Input
                    id="companyName"
                    value={footerSettings.companyName}
                    onChange={(e) => setFooterSettings(prev => ({ ...prev, companyName: e.target.value }))}
                  />
                </div>
                <div>
                  <Label htmlFor="copyright">Copyright Text</Label>
                  <Input
                    id="copyright"
                    value={footerSettings.copyright}
                    onChange={(e) => setFooterSettings(prev => ({ ...prev, copyright: e.target.value }))}
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={footerSettings.description}
                  onChange={(e) => setFooterSettings(prev => ({ ...prev, description: e.target.value }))}
                  rows={3}
                />
              </div>

              <Separator />

              <div>
                <h3 className="text-lg font-medium mb-3">Contact Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      value={footerSettings.contactInfo.email}
                      onChange={(e) => setFooterSettings(prev => ({
                        ...prev,
                        contactInfo: { ...prev.contactInfo, email: e.target.value }
                      }))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="phone">Phone</Label>
                    <Input
                      id="phone"
                      value={footerSettings.contactInfo.phone}
                      onChange={(e) => setFooterSettings(prev => ({
                        ...prev,
                        contactInfo: { ...prev.contactInfo, phone: e.target.value }
                      }))}
                    />
                  </div>
                </div>
                <div className="mt-4">
                  <Label htmlFor="address">Address</Label>
                  <Textarea
                    id="address"
                    value={footerSettings.contactInfo.address}
                    onChange={(e) => setFooterSettings(prev => ({
                      ...prev,
                      contactInfo: { ...prev.contactInfo, address: e.target.value }
                    }))}
                    rows={3}
                  />
                </div>
              </div>

              <Separator />

              <div>
                <div className="flex items-center space-x-2 mb-3">
                  <Switch
                    id="showMap"
                    checked={footerSettings.showMap}
                    onCheckedChange={(checked) => setFooterSettings(prev => ({ ...prev, showMap: checked }))}
                  />
                  <Label htmlFor="showMap">Show Map</Label>
                </div>
                {footerSettings.showMap && (
                  <div>
                    <Label htmlFor="mapEmbedUrl">Map Embed URL</Label>
                    <Textarea
                      id="mapEmbedUrl"
                      value={footerSettings.mapEmbedUrl}
                      onChange={(e) => setFooterSettings(prev => ({ ...prev, mapEmbedUrl: e.target.value }))}
                      rows={3}
                    />
                  </div>
                )}
              </div>

              <Separator />

              <div>
                <h3 className="text-lg font-medium mb-3">Social Links</h3>
                <div className="space-y-3">
                  {footerSettings.socialLinks.map((link, index) => (
                    <div key={link.platform} className="flex items-center gap-3 p-3 border rounded">
                      <Switch
                        checked={link.enabled}
                        onCheckedChange={(checked) => {
                          const newLinks = [...footerSettings.socialLinks];
                          newLinks[index].enabled = checked;
                          setFooterSettings(prev => ({ ...prev, socialLinks: newLinks }));
                        }}
                      />
                      <Input
                        value={link.platform}
                        onChange={(e) => {
                          const newLinks = [...footerSettings.socialLinks];
                          newLinks[index].platform = e.target.value;
                          setFooterSettings(prev => ({ ...prev, socialLinks: newLinks }));
                        }}
                        placeholder="Platform"
                        className="w-32"
                      />
                      <Input
                        value={link.url}
                        onChange={(e) => {
                          const newLinks = [...footerSettings.socialLinks];
                          newLinks[index].url = e.target.value;
                          setFooterSettings(prev => ({ ...prev, socialLinks: newLinks }));
                        }}
                        placeholder="URL"
                        className="flex-1"
                      />
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminSettingsPage;
