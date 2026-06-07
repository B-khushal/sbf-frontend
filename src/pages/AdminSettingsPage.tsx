import { useEffect, useRef, useState, useMemo } from "react";
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
  Sparkles,
  Check,
  Undo,
  Redo,
  Search,
  Wand2,
  FileText,
  Sliders,
  LayoutGrid,
  AlertCircle,
  Monitor,
  Tablet,
  Smartphone,
  Download,
  UploadCloud,
  Layers,
  ChevronDown
} from "lucide-react";
import api from "../services/api";
import { uploadImage } from "../services/uploadService";
import { useToast } from "../hooks/use-toast";
import { ImageUpload } from "@/components/ui/ImageUpload";
import { useSettings } from "../contexts/SettingsContext";
import { cn } from "@/lib/utils";

const TABS = [
  { id: "hero-slides", label: "Hero Banners", icon: ImageIcon, desc: "Hero slideshow slides, CTA links, image overlays" },
  { id: "sections", label: "Section Builder", icon: Layers, desc: "Order and customize homepage collections & banners" },
  { id: "categories", label: "Category Details", icon: LayoutGrid, desc: "Manage catalog hierarchy, slugs, priority themes" },
  { id: "shop-categories", label: "Shop Categories", icon: LayoutGrid, desc: "Manage categories displayed in the shop catalog" },
  { id: "header", label: "Dynamic Header", icon: Settings, desc: "Logos, navigation items, announcements bar" },
  { id: "footer", label: "Footer Builder", icon: Sliders, desc: "Multi-column links, newsletter, payment cards" },
  { id: "notifications", label: "Floating Widgets", icon: Bell, desc: "Push messages, WhatsApp float, exit popup" },
  { id: "delivery", label: "Delivery Rules", icon: ShoppingBag, desc: "Shipping zones, free conditions, time slots" },
  { id: "global", label: "Global SEO", icon: FileText, desc: "Meta descriptions, GA, Pixel, Sitemap editor" },
  { id: "theme", label: "Theme Customizer", icon: Wand2, desc: "Brand primary & secondary colors, border radius" },
  { id: "product-display", label: "Products Card", icon: Edit, desc: "Hover animations, wishlist controls, grid columns" }
];

const TONES = ["Elegant & Soft", "Romantic & Warm", "Festive & Vibrant", "Modern & Sleek"];

const AdminSettingsPage = () => {
  const { toast } = useToast();
  const { refetchSettings } = useSettings();
  
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [uploadingImage, setUploadingImage] = useState<string | null>(null);

  const handleImageUpload = async (
    file: File,
    type: "hero" | "category" | "logo",
    uploadId: string,
    callback: (url: string) => void
  ) => {
    setUploadingImage(uploadId);
    try {
      const formData = new FormData();
      formData.append("image", file);
      const res = await uploadImage(formData, type);
      if (res && res.imageUrl) {
        callback(res.imageUrl);
        toast({
          title: "Upload Successful",
          description: "Image has been uploaded and applied."
        });
      } else {
        throw new Error("Invalid response from upload service");
      }
    } catch (err: any) {
      console.error("Image upload failed:", err);
      toast({
        title: "Upload Failed",
        description: err?.response?.data?.message || "An error occurred while uploading the image file.",
        variant: "destructive"
      });
    } finally {
      setUploadingImage(null);
    }
  };
  
  // Settings States
  const [localSettings, setLocalSettings] = useState<any>({});
  const [originalSettings, setOriginalSettings] = useState<any>({});
  
  // History Undo/Redo States
  const [historyStack, setHistoryStack] = useState<any[]>([]);
  const [historyIndex, setHistoryIndex] = useState<number>(-1);
  
  // UI Customizer states
  const [activeTab, setActiveTab] = useState("hero-slides");
  const [searchQuery, setSearchQuery] = useState("");
  const [autosave, setAutosave] = useState(() => {
    return localStorage.getItem("sbf_cms_autosave") === "true";
  });
  
  // Live Preview properties
  const [viewport, setViewport] = useState<"desktop" | "tablet" | "mobile">("desktop");
  const [iframeKey, setIframeKey] = useState(0);
  const [syncStatus, setSyncStatus] = useState<"connected" | "syncing" | "error">("connected");
  
  // AI Suggestions Popup state
  const [showAiModal, setShowAiModal] = useState(false);
  const [aiTone, setAiTone] = useState("Elegant & Soft");
  const [aiType, setAiType] = useState("hero-title");
  const [aiResult, setAiResult] = useState<string[]>([]);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiTargetField, setAiTargetField] = useState<{ type: string; id?: any; field: string } | null>(null);

  // Debounced autosave reference
  const autosaveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const iframeRef = useRef<HTMLIFrameElement | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 10 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 250, tolerance: 5 } })
  );

  // Detect server URLs
  const previewUrl = useMemo(() => {
    return window.location.hostname === "localhost" 
      ? window.location.origin 
      : "https://sbflorist.in";
  }, []);

  // Fetch all configurations
  useEffect(() => {
    const fetchAll = async () => {
      try {
        setLoading(true);
        const response = await api.get("/settings/all");
        const data = response.data;
        
        // Clean default nested fields
        const cleaned = {
          heroSlides: data.heroSlides || [],
          homeSections: data.homeSections || [],
          categories: data.categories || [],
          shopCategories: data.shopCategories || [],
          headerSettings: data.headerSettings || {},
          footerSettings: data.footerSettings || {},
          notificationsSettings: data.notificationsSettings || {
            whatsappFloating: { enabled: true, phoneNumber: "9949683222", position: "right", message: "Hello!" },
            popupCreator: { enabled: false, title: "Special Offer!" },
            exitIntentPopup: { enabled: false, title: "Don't Go!" }
          },
          globalSettings: data.globalSettings || {
            websiteTitle: "Spring Blossoms Florist",
            metaTitle: "Best Florist in Hyderabad",
            metaDescription: "Online bouquet delivery",
            robotsTxt: "User-agent: *\nAllow: /"
          },
          deliverySettings: data.deliverySettings || {
            firstOrderFree: true,
            deliveryChargeRules: [{ minOrderAmount: 0, charge: 150 }],
            timeSlots: [
              { time: "standard", enabled: true, label: "Standard (9 AM - 9 PM)", extraCharge: 0 },
              { time: "midnight", enabled: true, label: "Midnight (11:30 PM - 12:30 AM)", extraCharge: 150 }
            ],
            rushDelivery: { enabled: false, charge: 100 }
          },
          themeSettings: data.themeSettings || {
            primaryColor: "#7dd3fc",
            secondaryColor: "#f9a8d4",
            accentColor: "#86efac",
            borderRadius: 0.75,
            themePreset: "classic-bloom"
          },
          productDisplaySettings: data.productDisplaySettings || {
            cardLayout: "standard",
            gridColumnsDesktop: 4,
            gridColumnsMobile: 2,
            wishlistToggle: true,
            quickViewToggle: true
          }
        };

        setLocalSettings(cleaned);
        setOriginalSettings(cleaned);
        
        // Initialize history stack
        setHistoryStack([JSON.parse(JSON.stringify(cleaned))]);
        setHistoryIndex(0);
      } catch (err) {
        console.error("Failed loading settings", err);
        toast({
          title: "Error loading config",
          description: "Please check your server connection.",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, []);

  // Sync changes to live preview iframe via postMessage
  const postPreviewData = (settings: any) => {
    if (iframeRef.current && iframeRef.current.contentWindow) {
      setSyncStatus("syncing");
      iframeRef.current.contentWindow.postMessage(
        { type: "SBF_SETTINGS_PREVIEW", settings },
        "*"
      );
      setTimeout(() => setSyncStatus("connected"), 300);
    }
  };

  // Push updates to history stack
  const updateSettingsState = (updated: any) => {
    setLocalSettings(updated);
    postPreviewData(updated);

    // Save to undo/redo history
    const sliced = historyStack.slice(0, historyIndex + 1);
    const dup = JSON.parse(JSON.stringify(updated));
    setHistoryStack([...sliced, dup].slice(-25)); // Cap history size
    setHistoryIndex(Math.min(sliced.length, 24));

    // Handle autosave
    if (autosave) {
      if (autosaveTimeoutRef.current) clearTimeout(autosaveTimeoutRef.current);
      autosaveTimeoutRef.current = setTimeout(() => {
        saveSettingsToDatabase(updated, true);
      }, 2000);
    }
  };

  // Autosave config toggle
  const handleAutosaveToggle = (checked: boolean) => {
    setAutosave(checked);
    localStorage.setItem("sbf_cms_autosave", checked ? "true" : "false");
    toast({
      title: checked ? "Autosave Enabled" : "Autosave Disabled",
      description: checked ? "Drafts will be saved instantly on editing." : "Remember to save changes manually."
    });
  };

  // Check if there are changes between edited vs original state
  const hasChanges = useMemo(() => {
    return JSON.stringify(localSettings) !== JSON.stringify(originalSettings);
  }, [localSettings, originalSettings]);

  // Client-side Undo
  const handleUndo = () => {
    if (historyIndex > 0) {
      const prev = historyIndex - 1;
      setHistoryIndex(prev);
      const state = historyStack[prev];
      setLocalSettings(state);
      postPreviewData(state);
    }
  };

  // Client-side Redo
  const handleRedo = () => {
    if (historyIndex < historyStack.length - 1) {
      const next = historyIndex + 1;
      setHistoryIndex(next);
      const state = historyStack[next];
      setLocalSettings(state);
      postPreviewData(state);
    }
  };

  // Save drafts / Publish changes
  const saveSettingsToDatabase = async (settingsToSave = localSettings, isDraftSave = false) => {
    try {
      setSaving(true);
      const res = await api.put("/settings/all", {
        ...settingsToSave,
        isDraft: isDraftSave
      });
      
      if (res.data) {
        if (!isDraftSave) {
          setOriginalSettings(settingsToSave);
          await refetchSettings();
          toast({
            title: "Settings Published Live!",
            description: "Updates are now active on the public storefront.",
            className: "bg-green-600 text-white font-bold"
          });
        } else {
          toast({
            title: "Draft Autosaved",
            description: "Preview is synced."
          });
        }
      }
    } catch (err) {
      console.error("Save failure", err);
      toast({
        title: "Save Failed",
        description: "An error occurred while writing settings.",
        variant: "destructive"
      });
    } finally {
      setSaving(false);
    }
  };

  // Restore live configuration back to draft
  const discardDraftSettings = async () => {
    try {
      setLoading(true);
      await api.post("/settings/discard-draft");
      setLocalSettings(originalSettings);
      postPreviewData(originalSettings);
      toast({
        title: "Draft Discarded",
        description: "Reverted local configurations back to active live settings."
      });
    } catch (err) {
      toast({
        title: "Discard Failed",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  // Export configs to local JSON backup
  const handleExportJson = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(localSettings, null, 2));
    const downloadAnchor = document.createElement("a");
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `sbf-cms-backup-${new Date().toISOString().split('T')[0]}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    toast({
      title: "Configuration Exported",
      description: "Backup JSON has been downloaded."
    });
  };

  // Import JSON configurations
  const handleImportJson = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const parsed = JSON.parse(event.target?.result as string);
          if (parsed && typeof parsed === "object") {
            updateSettingsState({
              ...localSettings,
              ...parsed
            });
            toast({
              title: "Import Success",
              description: "Configuration variables merged. Review your preview."
            });
          }
        } catch (err) {
          toast({
            title: "Import Failed",
            description: "Invalid JSON configuration backup file.",
            variant: "destructive"
          });
        }
      };
      reader.readAsText(file);
    }
  };

  // AI suggestion copywriting generator
  const triggerAiSuggestions = (type: string, fieldName: string, slideIdOrSectionId?: any) => {
    setAiType(type);
    setAiTargetField({ type, id: slideIdOrSectionId, field: fieldName });
    setShowAiModal(true);

    // Seed mock premium recommendations based on input types
    let list: string[] = [];
    if (type === "hero-title") {
      list = [
        "Blooming Elegance, Crafted for Your Special Moments",
        "Experience the Magic of Premium Floristry in Hyderabad",
        "Elegance Handcrafted with Passion & Fresh Petals",
        "Bouquets of Pure Delight Delivered Straight to Their Hearts"
      ];
    } else if (type === "hero-subtitle") {
      list = [
        "Handcrafted fresh flower arrangements curated by our top floral architects, with premium same-day and midnight delivery options.",
        "Express your love, gratitude, or celebration with Hyderabad's most luxurious botanical arrangements and gourmet chocolate boxes.",
        "From premium roses to exotic orchids, explore our summer collection designed to spread radiant sunshine into every room."
      ];
    } else {
      list = [
        "Premium Roses", "Exotic Orchids Collection", "Aroma Botanicals", "Curated Gift Sets"
      ];
    }
    setAiResult(list);
  };

  const generateAiCopy = () => {
    setAiLoading(true);
    setTimeout(() => {
      // Simulate rich copy alternatives
      let generated: string[] = [];
      if (aiType === "hero-title") {
        if (aiTone === "Elegant & Soft") generated = ["Petals of Pure Harmony", "Whispering Blossoms of Grace", "Soft Floral Serenade"];
        if (aiTone === "Romantic & Warm") generated = ["Love in Full Bloom", "Signature Crimson Rose Deluxe", "Heartfelt Whispers Bouquet"];
        if (aiTone === "Festive & Vibrant") generated = ["Festival of Vibrant Petals", "Celebration Carousel Bouquet", "Radiant Floral Fiesta"];
        if (aiTone === "Modern & Sleek") generated = ["Minimalist Meadow", "Structured Orchids Concept", "Urban Botanical Luxury"];
      } else {
        generated = [
          "Curated fresh arrangements designed to elevate your everyday spaces. Hand-delivered across Hyderabad.",
          "Luxurious signatures crafted by local flower architects. Enjoy complimentary shipping for orders over ₹999."
        ];
      }
      setAiResult(generated);
      setAiLoading(false);
    }, 1200);
  };

  const applyAiCopy = (text: string) => {
    if (!aiTargetField) return;
    const { type, id, field } = aiTargetField;

    const copy = { ...localSettings };

    if (type === "hero-title" || type === "hero-subtitle" || field === "title" || field === "subtitle") {
      if (id !== undefined) {
        // Slide update
        copy.heroSlides = copy.heroSlides.map((s: any) => 
          s.id === id ? { ...s, [field]: text } : s
        );
      } else {
        // General text
        if (activeTab === "header") copy.headerSettings = { ...copy.headerSettings, [field]: text };
        if (activeTab === "footer") copy.footerSettings = { ...copy.footerSettings, [field]: text };
      }
    }
    updateSettingsState(copy);
    setShowAiModal(false);
    toast({ title: "AI Copy Applied", description: "Successfully updated editing draft." });
  };

  // SEO Audit calculation
  const seoAuditScore = useMemo(() => {
    let score = 0;
    const s = localSettings.globalSettings || {};
    if (s.websiteTitle) score += 20;
    if (s.metaTitle && s.metaTitle.length > 10) score += 20;
    if (s.metaDescription && s.metaDescription.length > 50) score += 20;
    if (s.favicon) score += 10;
    if (s.googleAnalyticsId) score += 10;
    if (s.robotsTxt && s.robotsTxt.length > 10) score += 10;
    if (s.openGraph?.image) score += 10;
    return score;
  }, [localSettings.globalSettings]);

  const filteredTabs = TABS.filter(tab => 
    tab.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
    tab.desc.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col font-sans antialiased relative">
      
      {/* CMS Toolbar */}
      <header className="sticky top-0 z-40 bg-slate-900/80 backdrop-blur-md border-b border-slate-800 px-4 lg:px-8 py-4 flex flex-col md:flex-row justify-between items-center gap-4">
        <div>
          <div className="flex items-center gap-3">
            <Badge className="bg-gradient-to-r from-cyan-400 via-pink-400 to-emerald-400 text-slate-950 font-black tracking-wider uppercase text-[10px]">
              CMS v2.0
            </Badge>
            <h1 className="text-xl font-bold bg-gradient-to-r from-cyan-200 via-pink-200 to-emerald-200 bg-clip-text text-transparent">
              Website Control Center
            </h1>
          </div>
          <p className="text-xs text-slate-400 mt-1">Configure layout themes, delivery slots, popups, and SEO variables dynamically</p>
        </div>

        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          {/* History Controls */}
          <div className="flex items-center gap-1 bg-slate-800 p-1 rounded-xl">
            <Button
              variant="ghost"
              size="icon"
              disabled={historyIndex <= 0}
              onClick={handleUndo}
              className="h-8 w-8 text-slate-300 hover:text-white"
              title="Undo last change"
            >
              <Undo className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              disabled={historyIndex >= historyStack.length - 1}
              onClick={handleRedo}
              className="h-8 w-8 text-slate-300 hover:text-white"
              title="Redo change"
            >
              <Redo className="h-4 w-4" />
            </Button>
          </div>

          {/* Configuration utility buttons */}
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleExportJson}
              className="border-slate-700 text-slate-300 hover:bg-slate-800"
              title="Download settings backup JSON"
            >
              <Download className="h-4 w-4 mr-1.5" />
              Backup
            </Button>
            
            <label className="cursor-pointer bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center transition-colors">
              <UploadCloud className="h-4 w-4 mr-1.5" />
              Restore
              <input
                type="file"
                accept="application/json"
                className="hidden"
                onChange={handleImportJson}
              />
            </label>
          </div>

          <div className="flex items-center gap-2 bg-slate-800/60 px-3 py-1.5 rounded-xl border border-slate-700/50">
            <Switch
              id="autosave"
              checked={autosave}
              onCheckedChange={handleAutosaveToggle}
            />
            <Label htmlFor="autosave" className="text-xs font-bold text-slate-300 cursor-pointer">
              Autosave
            </Label>
          </div>
        </div>
      </header>

      {/* Main CMS Split Workspace */}
      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden pb-24">
        
        {/* Left Control Center Panel */}
        <div className="w-full lg:w-[58%] border-r border-slate-800 flex flex-col overflow-y-auto max-h-[calc(100vh-80px)] p-4 lg:p-6 space-y-6">
          
          {/* Tab Filter Search Bar */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 h-4 w-4" />
            <Input
              type="text"
              placeholder="Search sections, settings parameters, customizers..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-slate-800/40 border-slate-700 pl-10 focus:border-cyan-500 rounded-xl"
            />
          </div>

          {/* Quick tab grid selectors */}
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
            {filteredTabs.map(tab => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={cn(
                    "flex flex-col items-center justify-center p-3 rounded-xl border text-center transition-all duration-300 gap-1.5",
                    activeTab === tab.id
                      ? "bg-slate-800 border-cyan-500/80 text-cyan-300 shadow-md shadow-cyan-950/20"
                      : "bg-slate-900/40 border-slate-800/80 text-slate-400 hover:text-slate-200 hover:border-slate-700"
                  )}
                >
                  <Icon className="h-4 w-4" />
                  <span className="text-[10px] font-bold tracking-tight">{tab.label}</span>
                </button>
              );
            })}
          </div>

          <Separator className="bg-slate-800" />

          {/* CONFIG EDITOR MODULES */}
          <div className="flex-1">
            {loading ? (
              <div className="flex flex-col items-center justify-center py-20 gap-3">
                <RefreshCw className="h-8 w-8 animate-spin text-cyan-400" />
                <p className="text-sm text-slate-400">Syncing settings state...</p>
              </div>
            ) : (
              <>
                {/* 1. HERO SLIDES */}
                {activeTab === "hero-slides" && (
                  <div className="space-y-6">
                    <div className="flex justify-between items-center">
                      <div>
                        <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2">
                          <ImageIcon className="h-5 w-5 text-cyan-400" />
                          Hero Carousel Configuration
                        </h2>
                        <p className="text-xs text-slate-400">Desktop & Mobile carousel slides scheduler</p>
                      </div>
                      <Button
                        size="sm"
                        onClick={() => {
                          const list = [...(localSettings.heroSlides || [])];
                          const maxId = list.reduce((max, s) => Math.max(max, s.id || 0), 0);
                          list.push({
                            id: maxId + 1,
                            title: "New Fresh Slideshow",
                            subtitle: "Select flower banner CTA link",
                            image: "https://placehold.co/800x400?text=New+Arrangement",
                            mobileImage: "",
                            ctaText: "Shop Now",
                            ctaLink: "/shop",
                            enabled: true,
                            order: list.length,
                            textColor: "#ffffff",
                            overlayOpacity: 0.4
                          });
                          updateSettingsState({ ...localSettings, heroSlides: list });
                        }}
                        className="bg-cyan-600 hover:bg-cyan-700 text-white font-bold"
                      >
                        <Plus className="h-4 w-4 mr-1" /> Add Slide
                      </Button>
                    </div>

                    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={(e) => {
                      const { active, over } = e;
                      if (active.id !== over?.id) {
                        const items = [...(localSettings.heroSlides || [])];
                        const oldIdx = items.findIndex(s => String(s.id) === active.id);
                        const newIdx = items.findIndex(s => String(s.id) === over?.id);
                        const reordered = arrayMove(items, oldIdx, newIdx).map((item, idx) => ({ ...item, order: idx }));
                        updateSettingsState({ ...localSettings, heroSlides: reordered });
                      }
                    }}>
                      <SortableContext items={(localSettings.heroSlides || []).map((s: any) => String(s.id))} strategy={verticalListSortingStrategy}>
                        <div className="space-y-4">
                          {(localSettings.heroSlides || []).map((slide: any) => (
                            <SortableItem key={slide.id} id={String(slide.id)}>
                              <Card className="bg-slate-800/40 border-slate-800 overflow-hidden shadow-md">
                                <CardContent className="p-4 space-y-4">
                                  <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                      <SortableHandle>
                                        <GripVertical className="h-5 w-5 text-slate-500 cursor-grab active:cursor-grabbing" />
                                      </SortableHandle>
                                      <Badge className="bg-slate-700 text-slate-300 font-bold">Slide #{slide.id}</Badge>
                                    </div>
                                    <div className="flex items-center gap-3">
                                      <Switch
                                        checked={slide.enabled}
                                        onCheckedChange={(checked) => {
                                          const copy = localSettings.heroSlides.map((s: any) => 
                                            s.id === slide.id ? { ...s, enabled: checked } : s
                                          );
                                          updateSettingsState({ ...localSettings, heroSlides: copy });
                                        }}
                                      />
                                      <Button
                                        variant="ghost"
                                        size="icon"
                                        onClick={() => {
                                          const copy = localSettings.heroSlides.filter((s: any) => s.id !== slide.id);
                                          updateSettingsState({ ...localSettings, heroSlides: copy });
                                        }}
                                        className="text-red-400 hover:text-red-300 h-8 w-8"
                                      >
                                        <Trash2 className="h-4 w-4" />
                                      </Button>
                                    </div>
                                  </div>

                                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {/* Desktop & Mobile image uploaders */}
                                    <div className="grid grid-cols-2 gap-4">
                                      <div className="space-y-1.5">
                                        <Label className="text-xs text-slate-300 font-bold">Desktop Slide Banner</Label>
                                        <ImageUpload
                                          currentImage={slide.image}
                                          onImageUpload={async (file) => {
                                            await handleImageUpload(file, "hero", `hero-desktop-${slide.id}`, (url) => {
                                              const copy = localSettings.heroSlides.map((s: any) => 
                                                s.id === slide.id ? { ...s, image: url } : s
                                              );
                                              updateSettingsState({ ...localSettings, heroSlides: copy });
                                            });
                                          }}
                                          isUploading={uploadingImage === `hero-desktop-${slide.id}`}
                                          aspectRatio="landscape"
                                          placeholder="Upload Desktop Banner"
                                        />
                                      </div>
                                      <div className="space-y-1.5">
                                        <Label className="text-xs text-slate-300 font-bold">Mobile Slide Banner (Optional)</Label>
                                        <ImageUpload
                                          currentImage={slide.mobileImage}
                                          onImageUpload={async (file) => {
                                            await handleImageUpload(file, "hero", `hero-mobile-${slide.id}`, (url) => {
                                              const copy = localSettings.heroSlides.map((s: any) => 
                                                s.id === slide.id ? { ...s, mobileImage: url } : s
                                              );
                                              updateSettingsState({ ...localSettings, heroSlides: copy });
                                            });
                                          }}
                                          isUploading={uploadingImage === `hero-mobile-${slide.id}`}
                                          aspectRatio="portrait"
                                          placeholder="Upload Mobile Banner"
                                        />
                                      </div>
                                    </div>

                                    {/* Content editor */}
                                    <div className="space-y-3">
                                      <div>
                                        <div className="flex justify-between items-center">
                                          <Label className="text-xs text-slate-300 font-bold">Title</Label>
                                          <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => triggerAiSuggestions("hero-title", "title", slide.id)}
                                            className="h-5 px-1.5 text-[10px] text-cyan-400 hover:text-cyan-300"
                                          >
                                            <Sparkles className="h-3 w-3 mr-0.5" /> AI Suggest
                                          </Button>
                                        </div>
                                        <Input
                                          value={slide.title}
                                          onChange={(e) => {
                                            const copy = localSettings.heroSlides.map((s: any) => 
                                              s.id === slide.id ? { ...s, title: e.target.value } : s
                                            );
                                            updateSettingsState({ ...localSettings, heroSlides: copy });
                                          }}
                                          className="bg-slate-900 border-slate-700 text-slate-200 mt-1"
                                        />
                                      </div>
                                      <div>
                                        <div className="flex justify-between items-center">
                                          <Label className="text-xs text-slate-300 font-bold">Subtitle</Label>
                                          <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => triggerAiSuggestions("hero-subtitle", "subtitle", slide.id)}
                                            className="h-5 px-1.5 text-[10px] text-cyan-400 hover:text-cyan-300"
                                          >
                                            <Sparkles className="h-3 w-3 mr-0.5" /> AI Suggest
                                          </Button>
                                        </div>
                                        <Textarea
                                          value={slide.subtitle}
                                          onChange={(e) => {
                                            const copy = localSettings.heroSlides.map((s: any) => 
                                              s.id === slide.id ? { ...s, subtitle: e.target.value } : s
                                            );
                                            updateSettingsState({ ...localSettings, heroSlides: copy });
                                          }}
                                          rows={2}
                                          className="bg-slate-900 border-slate-700 text-slate-200 mt-1 resize-none"
                                        />
                                      </div>
                                    </div>
                                  </div>

                                  {/* Overlay & styling controllers */}
                                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 pt-2 border-t border-slate-800/50">
                                    <div>
                                      <Label className="text-[11px] text-slate-400 font-bold">Button CTA</Label>
                                      <Input
                                        value={slide.ctaText}
                                        onChange={(e) => {
                                          const copy = localSettings.heroSlides.map((s: any) => 
                                            s.id === slide.id ? { ...s, ctaText: e.target.value } : s
                                          );
                                          updateSettingsState({ ...localSettings, heroSlides: copy });
                                        }}
                                        className="bg-slate-900 border-slate-700 text-slate-200 text-xs mt-1"
                                      />
                                    </div>
                                    <div>
                                      <Label className="text-[11px] text-slate-400 font-bold">CTA Link</Label>
                                      <Input
                                        value={slide.ctaLink}
                                        onChange={(e) => {
                                          const copy = localSettings.heroSlides.map((s: any) => 
                                            s.id === slide.id ? { ...s, ctaLink: e.target.value } : s
                                          );
                                          updateSettingsState({ ...localSettings, heroSlides: copy });
                                        }}
                                        className="bg-slate-900 border-slate-700 text-slate-200 text-xs mt-1"
                                      />
                                    </div>
                                    <div>
                                      <Label className="text-[11px] text-slate-400 font-bold">Text Color Hex</Label>
                                      <div className="flex items-center gap-2 mt-1">
                                        <Input
                                          type="color"
                                          value={slide.textColor || "#ffffff"}
                                          onChange={(e) => {
                                            const copy = localSettings.heroSlides.map((s: any) => 
                                              s.id === slide.id ? { ...s, textColor: e.target.value } : s
                                            );
                                            updateSettingsState({ ...localSettings, heroSlides: copy });
                                          }}
                                          className="w-8 h-8 p-0 border-0 bg-transparent cursor-pointer"
                                        />
                                        <span className="text-xs font-mono">{slide.textColor || "#ffffff"}</span>
                                      </div>
                                    </div>
                                    <div>
                                      <Label className="text-[11px] text-slate-400 font-bold">Overlay Opacity</Label>
                                      <Input
                                        type="number"
                                        min="0"
                                        max="1"
                                        step="0.1"
                                        value={slide.overlayOpacity !== undefined ? slide.overlayOpacity : 0.4}
                                        onChange={(e) => {
                                          const copy = localSettings.heroSlides.map((s: any) => 
                                            s.id === slide.id ? { ...s, overlayOpacity: parseFloat(e.target.value) } : s
                                          );
                                          updateSettingsState({ ...localSettings, heroSlides: copy });
                                        }}
                                        className="bg-slate-900 border-slate-700 text-slate-200 text-xs mt-1"
                                      />
                                    </div>
                                  </div>
                                </CardContent>
                              </Card>
                            </SortableItem>
                          ))}
                        </div>
                      </SortableContext>
                    </DndContext>
                  </div>
                )}

                {/* 2. SECTION BUILDER */}
                {activeTab === "sections" && (
                  <div className="space-y-6">
                    <div className="flex justify-between items-center">
                      <div>
                        <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2">
                          <Layers className="h-5 w-5 text-cyan-400" />
                          Website Section Builder
                        </h2>
                        <p className="text-xs text-slate-400">Drag & drop modules to create custom page structures</p>
                      </div>
                      <Button
                        size="sm"
                        onClick={() => {
                          const list = [...(localSettings.homeSections || [])];
                          list.push({
                            id: `custom_section_${Date.now()}`,
                            type: "custom",
                            title: "Seasonal Offers Banner",
                            subtitle: "Select collection layouts to place below categories",
                            enabled: true,
                            order: list.length,
                            visibility: { desktop: true, tablet: true, mobile: true },
                            styling: { background: "", padding: "py-12", spacing: "mb-0", animation: "slide-in" }
                          });
                          updateSettingsState({ ...localSettings, homeSections: list });
                        }}
                        className="bg-cyan-600 hover:bg-cyan-700 text-white font-bold"
                      >
                        <Plus className="h-4 w-4 mr-1" /> Add Section
                      </Button>
                    </div>

                    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={(e) => {
                      const { active, over } = e;
                      if (active.id !== over?.id) {
                        const items = [...(localSettings.homeSections || [])];
                        const oldIdx = items.findIndex(s => s.id === active.id);
                        const newIdx = items.findIndex(s => s.id === over?.id);
                        const reordered = arrayMove(items, oldIdx, newIdx).map((item, idx) => ({ ...item, order: idx }));
                        updateSettingsState({ ...localSettings, homeSections: reordered });
                      }
                    }}>
                      <SortableContext items={(localSettings.homeSections || []).map((s: any) => s.id)} strategy={verticalListSortingStrategy}>
                        <div className="space-y-4">
                          {(localSettings.homeSections || []).map((sec: any) => (
                            <SortableItem key={sec.id} id={sec.id}>
                              <Card className="bg-slate-800/40 border-slate-800">
                                <CardContent className="p-4 space-y-4">
                                  <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                      <SortableHandle>
                                        <GripVertical className="h-5 w-5 text-slate-500 cursor-grab" />
                                      </SortableHandle>
                                      <Badge className="bg-slate-700 text-cyan-300 font-bold capitalize">{sec.type}</Badge>
                                      <span className="text-xs text-slate-400 font-mono select-all">{sec.id}</span>
                                    </div>
                                    <div className="flex items-center gap-3">
                                      <Switch
                                        checked={sec.enabled}
                                        onCheckedChange={(checked) => {
                                          const copy = localSettings.homeSections.map((s: any) => 
                                            s.id === sec.id ? { ...s, enabled: checked } : s
                                          );
                                          updateSettingsState({ ...localSettings, homeSections: copy });
                                        }}
                                      />
                                      <Button
                                        variant="ghost"
                                        size="icon"
                                        onClick={() => {
                                          const copy = localSettings.homeSections.filter((s: any) => s.id !== sec.id);
                                          updateSettingsState({ ...localSettings, homeSections: copy });
                                        }}
                                        className="text-red-400 hover:text-red-300 h-8 w-8"
                                      >
                                        <Trash2 className="h-4 w-4" />
                                      </Button>
                                    </div>
                                  </div>

                                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                      <Label className="text-xs text-slate-300">Section Header Title</Label>
                                      <Input
                                        value={sec.title || ""}
                                        onChange={(e) => {
                                          const copy = localSettings.homeSections.map((s: any) => 
                                            s.id === sec.id ? { ...s, title: e.target.value } : s
                                          );
                                          updateSettingsState({ ...localSettings, homeSections: copy });
                                        }}
                                        className="bg-slate-900 border-slate-700 text-slate-200 mt-1"
                                      />
                                    </div>
                                    <div>
                                      <Label className="text-xs text-slate-300">Section Subtitle / Description</Label>
                                      <Input
                                        value={sec.subtitle || ""}
                                        onChange={(e) => {
                                          const copy = localSettings.homeSections.map((s: any) => 
                                            s.id === sec.id ? { ...s, subtitle: e.target.value } : s
                                          );
                                          updateSettingsState({ ...localSettings, homeSections: copy });
                                        }}
                                        className="bg-slate-900 border-slate-700 text-slate-200 mt-1"
                                      />
                                    </div>
                                  </div>

                                  {/* Custom styling variables */}
                                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 pt-2 border-t border-slate-800/50">
                                    <div>
                                      <Label className="text-[10px] text-slate-400 font-bold">Device Visibility</Label>
                                      <div className="flex gap-2 mt-1">
                                        {["desktop", "tablet", "mobile"].map(d => (
                                          <button
                                            key={d}
                                            onClick={() => {
                                              const vis = { ...(sec.visibility || { desktop: true, tablet: true, mobile: true }) };
                                              vis[d] = !vis[d];
                                              const copy = localSettings.homeSections.map((s: any) => 
                                                s.id === sec.id ? { ...s, visibility: vis } : s
                                              );
                                              updateSettingsState({ ...localSettings, homeSections: copy });
                                            }}
                                            className={cn(
                                              "px-2 py-1 rounded text-[10px] font-bold border",
                                              (sec.visibility?.[d] !== false)
                                                ? "bg-cyan-900/40 text-cyan-300 border-cyan-800"
                                                : "bg-slate-900 text-slate-600 border-slate-800"
                                            )}
                                          >
                                            {d}
                                          </button>
                                        ))}
                                      </div>
                                    </div>

                                    <div>
                                      <Label className="text-[10px] text-slate-400 font-bold">Bg (Hex/Tailwind)</Label>
                                      <Input
                                        value={sec.styling?.background || ""}
                                        onChange={(e) => {
                                          const sty = { ...(sec.styling || {}), background: e.target.value };
                                          const copy = localSettings.homeSections.map((s: any) => 
                                            s.id === sec.id ? { ...s, styling: sty } : s
                                          );
                                          updateSettingsState({ ...localSettings, homeSections: copy });
                                        }}
                                        className="bg-slate-900 border-slate-700 text-slate-200 text-xs mt-1"
                                      />
                                    </div>

                                    <div>
                                      <Label className="text-[10px] text-slate-400 font-bold">Padding spacing</Label>
                                      <Input
                                        value={sec.styling?.padding || "py-16"}
                                        onChange={(e) => {
                                          const sty = { ...(sec.styling || {}), padding: e.target.value };
                                          const copy = localSettings.homeSections.map((s: any) => 
                                            s.id === sec.id ? { ...s, styling: sty } : s
                                          );
                                          updateSettingsState({ ...localSettings, homeSections: copy });
                                        }}
                                        className="bg-slate-900 border-slate-700 text-slate-200 text-xs mt-1"
                                      />
                                    </div>

                                    <div>
                                      <Label className="text-[10px] text-slate-400 font-bold">Animations</Label>
                                      <Input
                                        value={sec.styling?.animation || "fadeIn"}
                                        onChange={(e) => {
                                          const sty = { ...(sec.styling || {}), animation: e.target.value };
                                          const copy = localSettings.homeSections.map((s: any) => 
                                            s.id === sec.id ? { ...s, styling: sty } : s
                                          );
                                          updateSettingsState({ ...localSettings, homeSections: copy });
                                        }}
                                        className="bg-slate-900 border-slate-700 text-slate-200 text-xs mt-1"
                                      />
                                    </div>
                                  </div>
                                </CardContent>
                              </Card>
                            </SortableItem>
                          ))}
                        </div>
                      </SortableContext>
                    </DndContext>
                  </div>
                )}

                {/* 3. CATEGORIES MANAGEMENT */}
                {activeTab === "categories" && (
                  <div className="space-y-6">
                    <div className="flex justify-between items-center">
                      <div>
                        <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2">
                          <LayoutGrid className="h-5 w-5 text-cyan-400" />
                          Category Management
                        </h2>
                        <p className="text-xs text-slate-400">Configure catalog slugs, SEO, parent-child levels</p>
                      </div>
                      <Button
                        size="sm"
                        onClick={() => {
                          const list = [...(localSettings.categories || [])];
                          list.push({
                            id: `category_${Date.now()}`,
                            name: "New Flower Bouquets",
                            description: "Fresh selection",
                            image: "/images/placeholder.jpg",
                            link: "/shop/new-category",
                            enabled: true,
                            order: list.length,
                            slug: "new-category",
                            priority: list.length,
                            featured: false
                          });
                          updateSettingsState({ ...localSettings, categories: list });
                        }}
                        className="bg-cyan-600 hover:bg-cyan-700 text-white font-bold"
                      >
                        <Plus className="h-4 w-4 mr-1" /> Add Category
                      </Button>
                    </div>

                    <div className="space-y-4">
                      {(localSettings.categories || []).map((cat: any) => (
                        <Card key={cat.id} className="bg-slate-800/40 border-slate-800">
                          <CardContent className="p-4 space-y-4">
                            <div className="flex items-center justify-between">
                              <Badge className="bg-slate-700 text-cyan-300">{cat.name}</Badge>
                              <div className="flex items-center gap-3">
                                <Switch
                                  checked={cat.enabled}
                                  onCheckedChange={(checked) => {
                                    const copy = localSettings.categories.map((c: any) => 
                                      c.id === cat.id ? { ...c, enabled: checked } : c
                                    );
                                    updateSettingsState({ ...localSettings, categories: copy });
                                  }}
                                />
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => {
                                    const copy = localSettings.categories.filter((c: any) => c.id !== cat.id);
                                    updateSettingsState({ ...localSettings, categories: copy });
                                  }}
                                  className="text-red-400 hover:text-red-300 h-8 w-8"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div>
                                <Label className="text-xs text-slate-300">Name</Label>
                                <Input
                                  value={cat.name}
                                  onChange={(e) => {
                                    const copy = localSettings.categories.map((c: any) => 
                                      c.id === cat.id ? { ...c, name: e.target.value } : c
                                    );
                                    updateSettingsState({ ...localSettings, categories: copy });
                                  }}
                                  className="bg-slate-900 border-slate-700 text-slate-200 mt-1"
                                />
                              </div>
                              <div>
                                <Label className="text-xs text-slate-300">SEO Slug</Label>
                                <Input
                                  value={cat.slug || ""}
                                  onChange={(e) => {
                                    const copy = localSettings.categories.map((c: any) => 
                                      c.id === cat.id ? { ...c, slug: e.target.value } : c
                                    );
                                    updateSettingsState({ ...localSettings, categories: copy });
                                  }}
                                  className="bg-slate-900 border-slate-700 text-slate-200 mt-1"
                                />
                              </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div className="space-y-1.5">
                                <Label className="text-xs text-slate-300 font-bold">Category Image</Label>
                                <ImageUpload
                                  currentImage={cat.image}
                                  onImageUpload={async (file) => {
                                    await handleImageUpload(file, "category", `category-${cat.id}`, (url) => {
                                      const copy = localSettings.categories.map((c: any) => 
                                        c.id === cat.id ? { ...c, image: url } : c
                                      );
                                      updateSettingsState({ ...localSettings, categories: copy });
                                    });
                                  }}
                                  isUploading={uploadingImage === `category-${cat.id}`}
                                  aspectRatio="square"
                                  placeholder="Upload Category Image"
                                />
                              </div>
                              <div className="space-y-3">
                                <div>
                                  <Label className="text-xs text-slate-300">Description</Label>
                                  <Input
                                    value={cat.description || ""}
                                    onChange={(e) => {
                                      const copy = localSettings.categories.map((c: any) => 
                                        c.id === cat.id ? { ...c, description: e.target.value } : c
                                      );
                                      updateSettingsState({ ...localSettings, categories: copy });
                                    }}
                                    className="bg-slate-900 border-slate-700 text-slate-200 mt-1"
                                  />
                                </div>
                                <div>
                                  <Label className="text-xs text-slate-300">Link URL</Label>
                                  <Input
                                    value={cat.link || ""}
                                    onChange={(e) => {
                                      const copy = localSettings.categories.map((c: any) => 
                                        c.id === cat.id ? { ...c, link: e.target.value } : c
                                      );
                                      updateSettingsState({ ...localSettings, categories: copy });
                                    }}
                                    className="bg-slate-900 border-slate-700 text-slate-200 mt-1"
                                  />
                                </div>
                              </div>
                            </div>

                            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 pt-2 border-t border-slate-800/50">
                              <div>
                                <Label className="text-[10px] text-slate-400 font-bold">Featured Catalog</Label>
                                <div className="mt-1">
                                  <Switch
                                    checked={cat.featured || false}
                                    onCheckedChange={(checked) => {
                                      const copy = localSettings.categories.map((c: any) => 
                                        c.id === cat.id ? { ...c, featured: checked } : c
                                      );
                                      updateSettingsState({ ...localSettings, categories: copy });
                                    }}
                                  />
                                </div>
                              </div>
                              <div>
                                <Label className="text-[10px] text-slate-400 font-bold">Display Priority</Label>
                                <Input
                                  type="number"
                                  value={cat.priority || 0}
                                  onChange={(e) => {
                                    const copy = localSettings.categories.map((c: any) => 
                                      c.id === cat.id ? { ...c, priority: parseInt(e.target.value) } : c
                                    );
                                    updateSettingsState({ ...localSettings, categories: copy });
                                  }}
                                  className="bg-slate-900 border-slate-700 text-slate-200 text-xs mt-1"
                                />
                              </div>
                              <div>
                                <Label className="text-[10px] text-slate-400 font-bold">Color Theme Hex</Label>
                                <Input
                                  value={cat.colorTheme || ""}
                                  onChange={(e) => {
                                    const copy = localSettings.categories.map((c: any) => 
                                      c.id === cat.id ? { ...c, colorTheme: e.target.value } : c
                                    );
                                    updateSettingsState({ ...localSettings, categories: copy });
                                  }}
                                  className="bg-slate-900 border-slate-700 text-slate-200 text-xs mt-1"
                                />
                              </div>
                              <div>
                                <Label className="text-[10px] text-slate-400 font-bold">Parent Category ID</Label>
                                <Input
                                  value={cat.parentId || ""}
                                  onChange={(e) => {
                                    const copy = localSettings.categories.map((c: any) => 
                                      c.id === cat.id ? { ...c, parentId: e.target.value || null } : c
                                    );
                                    updateSettingsState({ ...localSettings, categories: copy });
                                  }}
                                  className="bg-slate-900 border-slate-700 text-slate-200 text-xs mt-1"
                                  placeholder="Sub-category parent id"
                                />
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </div>
                )}

                {/* 3b. SHOP CATEGORIES MANAGEMENT */}
                {activeTab === "shop-categories" && (
                  <div className="space-y-6">
                    <div className="flex justify-between items-center">
                      <div>
                        <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2">
                          <LayoutGrid className="h-5 w-5 text-cyan-400" />
                          Shop Category Management
                        </h2>
                        <p className="text-xs text-slate-400">Configure catalog slugs, priority themes, and parent-child levels for shop catalog</p>
                      </div>
                      <Button
                        size="sm"
                        onClick={() => {
                          const list = [...(localSettings.shopCategories || [])];
                          const maxId = list.reduce((max, s) => Math.max(max, s.id || 0), 0);
                          list.push({
                            id: `shop_category_${Date.now()}`,
                            name: "New Shop Category",
                            description: "Catalog selection",
                            image: "/images/placeholder.jpg",
                            link: "/shop/new-category",
                            enabled: true,
                            order: list.length,
                            slug: "new-category",
                            priority: list.length,
                            featured: false
                          });
                          updateSettingsState({ ...localSettings, shopCategories: list });
                        }}
                        className="bg-cyan-600 hover:bg-cyan-700 text-white font-bold"
                      >
                        <Plus className="h-4 w-4 mr-1" /> Add Shop Category
                      </Button>
                    </div>

                    <div className="space-y-4">
                      {(localSettings.shopCategories || []).map((cat: any) => (
                        <Card key={cat.id} className="bg-slate-800/40 border-slate-800">
                          <CardContent className="p-4 space-y-4">
                            <div className="flex items-center justify-between">
                              <Badge className="bg-slate-700 text-cyan-300">{cat.name}</Badge>
                              <div className="flex items-center gap-3">
                                <Switch
                                  checked={cat.enabled}
                                  onCheckedChange={(checked) => {
                                    const copy = localSettings.shopCategories.map((c: any) => 
                                      c.id === cat.id ? { ...c, enabled: checked } : c
                                    );
                                    updateSettingsState({ ...localSettings, shopCategories: copy });
                                  }}
                                />
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => {
                                    const copy = localSettings.shopCategories.filter((c: any) => c.id !== cat.id);
                                    updateSettingsState({ ...localSettings, shopCategories: copy });
                                  }}
                                  className="text-red-400 hover:text-red-300 h-8 w-8"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div>
                                <Label className="text-xs text-slate-300">Name</Label>
                                <Input
                                  value={cat.name}
                                  onChange={(e) => {
                                    const copy = localSettings.shopCategories.map((c: any) => 
                                      c.id === cat.id ? { ...c, name: e.target.value } : c
                                    );
                                    updateSettingsState({ ...localSettings, shopCategories: copy });
                                  }}
                                  className="bg-slate-900 border-slate-700 text-slate-200 mt-1"
                                />
                              </div>
                              <div>
                                <Label className="text-xs text-slate-300">SEO Slug</Label>
                                <Input
                                  value={cat.slug || ""}
                                  onChange={(e) => {
                                    const copy = localSettings.shopCategories.map((c: any) => 
                                      c.id === cat.id ? { ...c, slug: e.target.value } : c
                                    );
                                    updateSettingsState({ ...localSettings, shopCategories: copy });
                                  }}
                                  className="bg-slate-900 border-slate-700 text-slate-200 mt-1"
                                />
                              </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div className="space-y-1.5">
                                <Label className="text-xs text-slate-300 font-bold">Category Image</Label>
                                <ImageUpload
                                  currentImage={cat.image}
                                  onImageUpload={async (file) => {
                                    await handleImageUpload(file, "category", `shop-category-${cat.id}`, (url) => {
                                      const copy = localSettings.shopCategories.map((c: any) => 
                                        c.id === cat.id ? { ...c, image: url } : c
                                      );
                                      updateSettingsState({ ...localSettings, shopCategories: copy });
                                    });
                                  }}
                                  isUploading={uploadingImage === `shop-category-${cat.id}`}
                                  aspectRatio="square"
                                  placeholder="Upload Category Image"
                                />
                              </div>
                              <div className="space-y-3">
                                <div>
                                  <Label className="text-xs text-slate-300">Description</Label>
                                  <Input
                                    value={cat.description || ""}
                                    onChange={(e) => {
                                      const copy = localSettings.shopCategories.map((c: any) => 
                                        c.id === cat.id ? { ...c, description: e.target.value } : c
                                      );
                                      updateSettingsState({ ...localSettings, shopCategories: copy });
                                    }}
                                    className="bg-slate-900 border-slate-700 text-slate-200 mt-1"
                                  />
                                </div>
                                <div>
                                  <Label className="text-xs text-slate-300">Link URL</Label>
                                  <Input
                                    value={cat.link || ""}
                                    onChange={(e) => {
                                      const copy = localSettings.shopCategories.map((c: any) => 
                                        c.id === cat.id ? { ...c, link: e.target.value } : c
                                      );
                                      updateSettingsState({ ...localSettings, shopCategories: copy });
                                    }}
                                    className="bg-slate-900 border-slate-700 text-slate-200 mt-1"
                                  />
                                </div>
                              </div>
                            </div>

                            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 pt-2 border-t border-slate-800/50">
                              <div>
                                <Label className="text-[10px] text-slate-400 font-bold">Featured Catalog</Label>
                                <div className="mt-1">
                                  <Switch
                                    checked={cat.featured || false}
                                    onCheckedChange={(checked) => {
                                      const copy = localSettings.shopCategories.map((c: any) => 
                                        c.id === cat.id ? { ...c, featured: checked } : c
                                      );
                                      updateSettingsState({ ...localSettings, shopCategories: copy });
                                    }}
                                  />
                                </div>
                              </div>
                              <div>
                                <Label className="text-[10px] text-slate-400 font-bold">Display Priority</Label>
                                <Input
                                  type="number"
                                  value={cat.priority || 0}
                                  onChange={(e) => {
                                    const copy = localSettings.shopCategories.map((c: any) => 
                                      c.id === cat.id ? { ...c, priority: parseInt(e.target.value) } : c
                                    );
                                    updateSettingsState({ ...localSettings, shopCategories: copy });
                                  }}
                                  className="bg-slate-900 border-slate-700 text-slate-200 text-xs mt-1"
                                />
                              </div>
                              <div>
                                <Label className="text-[10px] text-slate-400 font-bold">Color Theme Hex</Label>
                                <Input
                                  value={cat.colorTheme || ""}
                                  onChange={(e) => {
                                    const copy = localSettings.shopCategories.map((c: any) => 
                                      c.id === cat.id ? { ...c, colorTheme: e.target.value } : c
                                    );
                                    updateSettingsState({ ...localSettings, shopCategories: copy });
                                  }}
                                  className="bg-slate-900 border-slate-700 text-slate-200 text-xs mt-1"
                                />
                              </div>
                              <div>
                                <Label className="text-[10px] text-slate-400 font-bold">Parent Category ID</Label>
                                <Input
                                  value={cat.parentId || ""}
                                  onChange={(e) => {
                                    const copy = localSettings.shopCategories.map((c: any) => 
                                      c.id === cat.id ? { ...c, parentId: e.target.value || null } : c
                                    );
                                    updateSettingsState({ ...localSettings, shopCategories: copy });
                                  }}
                                  className="bg-slate-900 border-slate-700 text-slate-200 text-xs mt-1"
                                  placeholder="Sub-category parent id"
                                />
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </div>
                )}

                {/* 4. HEADER MANAGEMENT */}
                {activeTab === "header" && (
                  <div className="space-y-6">
                    <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2">
                      <Settings className="h-5 w-5 text-cyan-400" />
                      Dynamic Header Builder
                    </h2>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <Label className="text-xs text-slate-300 font-bold">Logo Image</Label>
                        <ImageUpload
                          currentImage={localSettings.headerSettings?.logo}
                          onImageUpload={async (file) => {
                            await handleImageUpload(file, "logo", "logo", (url) => {
                              const copy = { ...localSettings.headerSettings, logo: url };
                              updateSettingsState({ ...localSettings, headerSettings: copy });
                            });
                          }}
                          isUploading={uploadingImage === "logo"}
                          aspectRatio="landscape"
                          placeholder="Upload Brand Logo"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <Label className="text-xs text-slate-300 font-bold">Sticky Navigation Logo</Label>
                        <ImageUpload
                          currentImage={localSettings.headerSettings?.stickyLogo}
                          onImageUpload={async (file) => {
                            await handleImageUpload(file, "logo", "stickyLogo", (url) => {
                              const copy = { ...localSettings.headerSettings, stickyLogo: url };
                              updateSettingsState({ ...localSettings, headerSettings: copy });
                            });
                          }}
                          isUploading={uploadingImage === "stickyLogo"}
                          aspectRatio="landscape"
                          placeholder="Upload Sticky Logo"
                        />
                      </div>
                    </div>

                    <Separator className="bg-slate-800" />

                    <div className="space-y-4">
                      <h3 className="text-sm font-bold text-slate-200">Announcement Ticker</h3>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="flex items-center gap-2">
                          <Switch
                            id="header-announce-toggle"
                            checked={localSettings.headerSettings?.announcementBar?.enabled ?? true}
                            onCheckedChange={(checked) => {
                              const bar = { ...(localSettings.headerSettings?.announcementBar || {}), enabled: checked };
                              const copy = { ...localSettings.headerSettings, announcementBar: bar };
                              updateSettingsState({ ...localSettings, headerSettings: copy });
                            }}
                          />
                          <Label htmlFor="header-announce-toggle" className="text-xs text-slate-300 cursor-pointer">Enable Announcement Bar</Label>
                        </div>
                        <div>
                          <Label className="text-xs text-slate-400">Bar Background Color</Label>
                          <Input
                            value={localSettings.headerSettings?.announcementBar?.bgColor || ""}
                            onChange={(e) => {
                              const bar = { ...(localSettings.headerSettings?.announcementBar || {}), bgColor: e.target.value };
                              const copy = { ...localSettings.headerSettings, announcementBar: bar };
                              updateSettingsState({ ...localSettings, headerSettings: copy });
                            }}
                            className="bg-slate-900 border-slate-700 text-slate-200 text-xs mt-1"
                          />
                        </div>
                        <div>
                          <Label className="text-xs text-slate-400">Text Color</Label>
                          <Input
                            value={localSettings.headerSettings?.announcementBar?.textColor || ""}
                            onChange={(e) => {
                              const bar = { ...(localSettings.headerSettings?.announcementBar || {}), textColor: e.target.value };
                              const copy = { ...localSettings.headerSettings, announcementBar: bar };
                              updateSettingsState({ ...localSettings, headerSettings: copy });
                            }}
                            className="bg-slate-900 border-slate-700 text-slate-200 text-xs mt-1"
                          />
                        </div>
                      </div>

                      <div>
                        <Label className="text-xs text-slate-300">Announcement Bar Text</Label>
                        <Input
                          value={localSettings.headerSettings?.announcementBar?.text || ""}
                          onChange={(e) => {
                            const bar = { ...(localSettings.headerSettings?.announcementBar || {}), text: e.target.value };
                            const copy = { ...localSettings.headerSettings, announcementBar: bar };
                            updateSettingsState({ ...localSettings, headerSettings: copy });
                          }}
                          className="bg-slate-900 border-slate-700 text-slate-200 mt-1"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* 5. FOOTER BUILDER */}
                {activeTab === "footer" && (
                  <div className="space-y-6">
                    <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2">
                      <Sliders className="h-5 w-5 text-cyan-400" />
                      Footer Layout Builder
                    </h2>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label className="text-xs text-slate-300">Company Name</Label>
                        <Input
                          value={localSettings.footerSettings?.companyName || ""}
                          onChange={(e) => {
                            const copy = { ...localSettings.footerSettings, companyName: e.target.value };
                            updateSettingsState({ ...localSettings, footerSettings: copy });
                          }}
                          className="bg-slate-900 border-slate-700 text-slate-200 mt-1"
                        />
                      </div>
                      <div>
                        <Label className="text-xs text-slate-300">SEO Footer Text</Label>
                        <Input
                          value={localSettings.footerSettings?.seoFooterText || ""}
                          onChange={(e) => {
                            const copy = { ...localSettings.footerSettings, seoFooterText: e.target.value };
                            updateSettingsState({ ...localSettings, footerSettings: copy });
                          }}
                          className="bg-slate-900 border-slate-700 text-slate-200 mt-1"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* 6. FLOATING WIDGETS & POPUPS */}
                {activeTab === "notifications" && (
                  <div className="space-y-6">
                    <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2">
                      <Bell className="h-5 w-5 text-cyan-400" />
                      App Popups & Floating Widgets
                    </h2>

                    <Card className="bg-slate-800/40 border-slate-800">
                      <CardContent className="p-4 space-y-4">
                        <h3 className="text-sm font-bold text-slate-200">WhatsApp Floating Message</h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div className="flex items-center gap-2">
                            <Switch
                              id="whatsapp-toggle"
                              checked={localSettings.notificationsSettings?.whatsappFloating?.enabled ?? true}
                              onCheckedChange={(checked) => {
                                const wa = { ...(localSettings.notificationsSettings?.whatsappFloating || {}), enabled: checked };
                                const copy = { ...localSettings.notificationsSettings, whatsappFloating: wa };
                                updateSettingsState({ ...localSettings, notificationsSettings: copy });
                              }}
                            />
                            <Label htmlFor="whatsapp-toggle" className="text-xs text-slate-300 cursor-pointer">Enable Floating Icon</Label>
                          </div>
                          <div>
                            <Label className="text-xs text-slate-400">Phone Number (+91)</Label>
                            <Input
                              value={localSettings.notificationsSettings?.whatsappFloating?.phoneNumber || "9949683222"}
                              onChange={(e) => {
                                const wa = { ...(localSettings.notificationsSettings?.whatsappFloating || {}), phoneNumber: e.target.value };
                                const copy = { ...localSettings.notificationsSettings, whatsappFloating: wa };
                                updateSettingsState({ ...localSettings, notificationsSettings: copy });
                              }}
                              className="bg-slate-900 border-slate-700 text-slate-200 text-xs mt-1"
                            />
                          </div>
                          <div>
                            <Label className="text-xs text-slate-400">Initial Message text</Label>
                            <Input
                              value={localSettings.notificationsSettings?.whatsappFloating?.message || ""}
                              onChange={(e) => {
                                const wa = { ...(localSettings.notificationsSettings?.whatsappFloating || {}), message: e.target.value };
                                const copy = { ...localSettings.notificationsSettings, whatsappFloating: wa };
                                updateSettingsState({ ...localSettings, notificationsSettings: copy });
                              }}
                              className="bg-slate-900 border-slate-700 text-slate-200 text-xs mt-1"
                            />
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="bg-slate-800/40 border-slate-800">
                      <CardContent className="p-4 space-y-4">
                        <h3 className="text-sm font-bold text-slate-200">Exit-Intent Promotion Popup</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="flex items-center gap-2">
                            <Switch
                              id="exit-popup-toggle"
                              checked={localSettings.notificationsSettings?.exitIntentPopup?.enabled ?? false}
                              onCheckedChange={(checked) => {
                                const popup = { ...(localSettings.notificationsSettings?.exitIntentPopup || {}), enabled: checked };
                                const copy = { ...localSettings.notificationsSettings, exitIntentPopup: popup };
                                updateSettingsState({ ...localSettings, notificationsSettings: copy });
                              }}
                            />
                            <Label htmlFor="exit-popup-toggle" className="text-xs text-slate-300 cursor-pointer">Enable Exit Popup</Label>
                          </div>
                          <div>
                            <Label className="text-xs text-slate-400">Discount Code Target</Label>
                            <Input
                              value={localSettings.notificationsSettings?.exitIntentPopup?.discountCode || "EXIT10"}
                              onChange={(e) => {
                                const popup = { ...(localSettings.notificationsSettings?.exitIntentPopup || {}), discountCode: e.target.value };
                                const copy = { ...localSettings.notificationsSettings, exitIntentPopup: popup };
                                updateSettingsState({ ...localSettings, notificationsSettings: copy });
                              }}
                              className="bg-slate-900 border-slate-700 text-slate-200 text-xs mt-1"
                            />
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                )}

                {/* 7. DELIVERY RULES */}
                {activeTab === "delivery" && (
                  <div className="space-y-6">
                    <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2">
                      <ShoppingBag className="h-5 w-5 text-cyan-400" />
                      Shipping Zones & Delivery Rules
                    </h2>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="flex items-center gap-2 bg-slate-800/40 p-4 rounded-xl border border-slate-800">
                        <Switch
                          id="first-free-toggle"
                          checked={localSettings.deliverySettings?.firstOrderFree ?? true}
                          onCheckedChange={(checked) => {
                            const copy = { ...localSettings.deliverySettings, firstOrderFree: checked };
                            updateSettingsState({ ...localSettings, deliverySettings: copy });
                          }}
                        />
                        <Label htmlFor="first-free-toggle" className="text-xs text-slate-300 cursor-pointer">First Order Free Delivery</Label>
                      </div>

                      <div className="flex flex-col bg-slate-800/40 p-4 rounded-xl border border-slate-800">
                        <Label className="text-xs text-slate-300">Marquee Message Ticker</Label>
                        <Input
                          value={localSettings.deliverySettings?.tickerMessage || ""}
                          onChange={(e) => {
                            const copy = { ...localSettings.deliverySettings, tickerMessage: e.target.value };
                            updateSettingsState({ ...localSettings, deliverySettings: copy });
                          }}
                          className="bg-slate-900 border-slate-700 text-slate-200 mt-1"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* 8. GLOBAL SEO SETTINGS */}
                {activeTab === "global" && (
                  <div className="space-y-6">
                    <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2">
                      <FileText className="h-5 w-5 text-cyan-400" />
                      Global SEO & Integrations
                    </h2>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label className="text-xs text-slate-300">Website Tab Title</Label>
                        <Input
                          value={localSettings.globalSettings?.websiteTitle || ""}
                          onChange={(e) => {
                            const copy = { ...localSettings.globalSettings, websiteTitle: e.target.value };
                            updateSettingsState({ ...localSettings, globalSettings: copy });
                          }}
                          className="bg-slate-900 border-slate-700 text-slate-200 mt-1"
                        />
                      </div>
                      <div>
                        <Label className="text-xs text-slate-300">Robots.txt Content</Label>
                        <Textarea
                          value={localSettings.globalSettings?.robotsTxt || ""}
                          onChange={(e) => {
                            const copy = { ...localSettings.globalSettings, robotsTxt: e.target.value };
                            updateSettingsState({ ...localSettings, globalSettings: copy });
                          }}
                          rows={3}
                          className="bg-slate-900 border-slate-700 text-slate-200 mt-1 resize-none"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* 9. THEME CUSTOMIZER */}
                {activeTab === "theme" && (
                  <div className="space-y-6">
                    <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2">
                      <Wand2 className="h-5 w-5 text-cyan-400" />
                      Theme Engine & Color Palette Customizer
                    </h2>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="bg-slate-800/40 p-4 rounded-xl border border-slate-800">
                        <Label className="text-xs text-slate-300">Primary Color Override</Label>
                        <div className="flex items-center gap-2 mt-2">
                          <Input
                            type="color"
                            value={localSettings.themeSettings?.palette?.primaryHex || "#7dd3fc"}
                            onChange={(e) => {
                              const pal = { ...(localSettings.themeSettings?.palette || {}), primaryHex: e.target.value };
                              const theme = { ...localSettings.themeSettings, palette: pal, primaryColor: e.target.value };
                              updateSettingsState({ ...localSettings, themeSettings: theme });
                            }}
                            className="w-10 h-10 p-0 border-0 bg-transparent cursor-pointer"
                          />
                          <span className="text-xs font-mono">{localSettings.themeSettings?.palette?.primaryHex || "#7dd3fc"}</span>
                        </div>
                      </div>

                      <div className="bg-slate-800/40 p-4 rounded-xl border border-slate-800">
                        <Label className="text-xs text-slate-300">Secondary Color Override</Label>
                        <div className="flex items-center gap-2 mt-2">
                          <Input
                            type="color"
                            value={localSettings.themeSettings?.palette?.secondaryHex || "#f9a8d4"}
                            onChange={(e) => {
                              const pal = { ...(localSettings.themeSettings?.palette || {}), secondaryHex: e.target.value };
                              const theme = { ...localSettings.themeSettings, palette: pal, secondaryColor: e.target.value };
                              updateSettingsState({ ...localSettings, themeSettings: theme });
                            }}
                            className="w-10 h-10 p-0 border-0 bg-transparent cursor-pointer"
                          />
                          <span className="text-xs font-mono">{localSettings.themeSettings?.palette?.secondaryHex || "#f9a8d4"}</span>
                        </div>
                      </div>

                      <div className="bg-slate-800/40 p-4 rounded-xl border border-slate-800">
                        <Label className="text-xs text-slate-300">Global Border Radius (rem)</Label>
                        <Input
                          type="number"
                          step="0.05"
                          min="0"
                          max="2"
                          value={localSettings.themeSettings?.borderRadius ?? 0.75}
                          onChange={(e) => {
                            const theme = { ...localSettings.themeSettings, borderRadius: parseFloat(e.target.value) };
                            updateSettingsState({ ...localSettings, themeSettings: theme });
                          }}
                          className="bg-slate-900 border-slate-700 text-slate-200 mt-2"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* 10. PRODUCT DISPLAY */}
                {activeTab === "product-display" && (
                  <div className="space-y-6">
                    <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2">
                      <Edit className="h-5 w-5 text-cyan-400" />
                      Product Grid Display Variables
                    </h2>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <Label className="text-xs text-slate-300">Product Card Layout Style</Label>
                        <select
                          value={localSettings.productDisplaySettings?.cardLayout || "standard"}
                          onChange={(e) => {
                            const copy = { ...localSettings.productDisplaySettings, cardLayout: e.target.value };
                            updateSettingsState({ ...localSettings, productDisplaySettings: copy });
                          }}
                          className="w-full bg-slate-950 border border-slate-700 text-slate-200 rounded-lg p-2.5 mt-1 text-sm focus:border-cyan-500 focus:outline-none"
                        >
                          <option value="standard">Standard Grid Layout</option>
                          <option value="minimal">Minimal Flat Design</option>
                          <option value="modern">Modern Glassmorphic Border</option>
                        </select>
                      </div>

                      <div>
                        <Label className="text-xs text-slate-300">Grid Desktop Columns</Label>
                        <Input
                          type="number"
                          min="2"
                          max="6"
                          value={localSettings.productDisplaySettings?.gridColumnsDesktop ?? 4}
                          onChange={(e) => {
                            const copy = { ...localSettings.productDisplaySettings, gridColumnsDesktop: parseInt(e.target.value) };
                            updateSettingsState({ ...localSettings, productDisplaySettings: copy });
                          }}
                          className="bg-slate-900 border-slate-700 text-slate-200 mt-1"
                        />
                      </div>

                      <div className="flex items-center gap-4 bg-slate-800/40 p-4 rounded-xl border border-slate-800">
                        <Switch
                          id="wishlist-toggle"
                          checked={localSettings.productDisplaySettings?.wishlistToggle ?? true}
                          onCheckedChange={(checked) => {
                            const copy = { ...localSettings.productDisplaySettings, wishlistToggle: checked };
                            updateSettingsState({ ...localSettings, productDisplaySettings: copy });
                          }}
                        />
                        <Label htmlFor="wishlist-toggle" className="text-xs text-slate-300 cursor-pointer">Enable Wishlist Icon</Label>
                      </div>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>

        {/* Right Live Preview Engine Panel */}
        <div className="w-full lg:w-[42%] bg-slate-950 flex flex-col p-4 space-y-4 max-h-[calc(100vh-80px)]">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className={cn(
                "h-2 w-2 rounded-full",
                syncStatus === "syncing" ? "bg-amber-400 animate-pulse" : "bg-green-400"
              )} />
              <span className="text-xs text-slate-300 font-bold uppercase tracking-wider">
                {syncStatus === "syncing" ? "Syncing..." : "Live Preview Connected"}
              </span>
            </div>

            {/* Viewport switching */}
            <div className="flex items-center bg-slate-800 p-1 rounded-xl gap-1">
              <Button
                variant={viewport === "desktop" ? "secondary" : "ghost"}
                size="icon"
                onClick={() => setViewport("desktop")}
                className="h-8 w-8 text-slate-300 hover:text-white"
                title="Desktop view"
              >
                <Monitor className="h-4 w-4" />
              </Button>
              <Button
                variant={viewport === "tablet" ? "secondary" : "ghost"}
                size="icon"
                onClick={() => setViewport("tablet")}
                className="h-8 w-8 text-slate-300 hover:text-white"
                title="Tablet view"
              >
                <Tablet className="h-4 w-4" />
              </Button>
              <Button
                variant={viewport === "mobile" ? "secondary" : "ghost"}
                size="icon"
                onClick={() => setViewport("mobile")}
                className="h-8 w-8 text-slate-300 hover:text-white"
                title="Mobile view"
              >
                <Smartphone className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Embedded live browser iframe */}
          <div className="flex-1 bg-slate-900 rounded-2xl border border-slate-850 flex flex-col overflow-hidden relative group">
            
            {/* Viewport browser bar */}
            <div className="bg-slate-950/70 px-4 py-2 border-b border-slate-800/80 flex items-center gap-3">
              <div className="flex gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-red-500/80" />
                <span className="w-2.5 h-2.5 rounded-full bg-yellow-500/80" />
                <span className="w-2.5 h-2.5 rounded-full bg-green-500/80" />
              </div>
              <div className="flex-1 bg-slate-900 border border-slate-800 rounded-lg py-1 px-3 text-[10px] text-slate-400 font-mono truncate select-all">
                {previewUrl}/
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIframeKey(k => k + 1)}
                className="h-6 w-6 text-slate-400 hover:text-white"
              >
                <RefreshCw className="h-3.5 w-3.5" />
              </Button>
            </div>

            {/* Configurable Viewport container */}
            <div className="flex-1 flex justify-center items-center bg-slate-950/40 p-4 overflow-hidden">
              <div 
                className="h-full bg-white transition-all duration-300 shadow-2xl relative rounded-xl overflow-hidden border-2 border-slate-800"
                style={{
                  width: viewport === "mobile" ? "375px" : viewport === "tablet" ? "768px" : "100%"
                }}
              >
                <iframe
                  key={iframeKey}
                  ref={iframeRef}
                  src={previewUrl}
                  className="w-full h-full border-none select-none"
                  title="Live Website Sandbox"
                  onLoad={() => {
                    // Send current editing payload immediately when frame updates
                    setTimeout(() => postPreviewData(localSettings), 500);
                  }}
                />
              </div>
            </div>
          </div>

          {/* Dynamic SEO Audit widget */}
          <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-4 flex flex-col md:flex-row items-center gap-4 justify-between">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-400 font-bold uppercase tracking-wider">SEO Compliance Score</span>
                <Badge className={cn(
                  "font-bold text-xs",
                  seoAuditScore > 80 ? "bg-green-600" : seoAuditScore > 50 ? "bg-amber-600" : "bg-red-600"
                )}>
                  {seoAuditScore}/100
                </Badge>
              </div>
              <p className="text-[10px] text-slate-400">Calculated automatically based on meta configurations, analytics integration, and sitemaps</p>
            </div>
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                toast({
                  title: "SEO Recommendations",
                  description: seoAuditScore > 80 
                    ? "Fantastic! Titles, description tag lengths, sitemaps, and robots.txt comply with best indexing practices."
                    : "Improvement areas: Add OpenGraph preview images and configure a Google Analytics tracking code to improve visibility.",
                });
              }}
              className="border-slate-800 hover:bg-slate-800 text-xs text-slate-300 font-bold"
            >
              Run Detailed Audit
            </Button>
          </div>
        </div>
      </div>

      {/* Floating Bottom Save Bar */}
      {hasChanges && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-slate-900/95 backdrop-blur-md border border-cyan-500/40 px-6 py-4 rounded-2xl flex items-center gap-4 shadow-xl z-50">
          <div className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-cyan-400 animate-pulse" />
            <span className="text-xs font-bold text-slate-200">You have unsaved changes</span>
          </div>

          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant="ghost"
              onClick={discardDraftSettings}
              className="text-slate-400 hover:text-white"
            >
              Discard
            </Button>
            
            <Button
              size="sm"
              variant="outline"
              onClick={() => saveSettingsToDatabase(localSettings, true)}
              className="border-slate-800 hover:bg-slate-800 text-slate-200"
              disabled={saving}
            >
              Save Draft
            </Button>

            <Button
              size="sm"
              onClick={() => saveSettingsToDatabase(localSettings, false)}
              className="bg-cyan-600 hover:bg-cyan-700 text-white font-bold"
              disabled={saving}
            >
              {saving ? <RefreshCw className="h-4 w-4 animate-spin mr-1" /> : <Save className="h-4 w-4 mr-1" />}
              Publish Changes
            </Button>
          </div>
        </div>
      )}

      {/* AI SUGGESTIONS WRITER DIALOG */}
      {showAiModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-[100] flex justify-center items-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md p-6 space-y-6">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-lg font-bold text-slate-100 flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-cyan-400" />
                  AI Copywriter Suggestions
                </h3>
                <p className="text-xs text-slate-400">Generate copies using selected tone filters</p>
              </div>
              <Button variant="ghost" size="icon" onClick={() => setShowAiModal(false)} className="text-slate-400 hover:text-white">
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>

            <div className="space-y-4">
              <div>
                <Label className="text-xs text-slate-400">Select Copywriting Tone</Label>
                <div className="grid grid-cols-2 gap-2 mt-1">
                  {TONES.map(t => (
                    <button
                      key={t}
                      onClick={() => setAiTone(t)}
                      className={cn(
                        "py-1.5 px-3 rounded-lg text-xs font-semibold border transition-all text-center",
                        aiTone === t
                          ? "bg-cyan-900/40 text-cyan-300 border-cyan-800"
                          : "bg-slate-950/40 border-slate-800 text-slate-400 hover:text-slate-200"
                      )}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>

              <Button
                onClick={generateAiCopy}
                disabled={aiLoading}
                className="w-full bg-gradient-to-r from-cyan-600 to-emerald-600 text-white font-bold h-10"
              >
                {aiLoading ? <RefreshCw className="h-4 w-4 animate-spin mr-1" /> : <Sparkles className="h-4 w-4 mr-1" />}
                Generate Copy Alternatives
              </Button>

              <Separator className="bg-slate-800" />

              <div className="space-y-2">
                <Label className="text-xs text-slate-400">Copy Recommendations</Label>
                <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                  {aiResult.map((text, idx) => (
                    <div
                      key={idx}
                      onClick={() => applyAiCopy(text)}
                      className="p-3 bg-slate-950/40 hover:bg-slate-800 border border-slate-850 rounded-xl cursor-pointer transition-colors text-xs text-slate-300 leading-relaxed"
                    >
                      {text}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminSettingsPage;
