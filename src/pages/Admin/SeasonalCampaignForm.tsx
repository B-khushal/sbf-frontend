import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { useCurrency } from '@/contexts/CurrencyContext';
import { Badge } from '@/components/ui/badge';
import { 
  ArrowLeft, Save, Calendar, Image as ImageIcon, 
  Settings, Tags, Gift, Truck, Globe, BarChart3, Plus, Trash2, 
  Sparkles, CheckCircle2 
} from 'lucide-react';
import seasonalCampaignService from '@/services/seasonalCampaignService';
import { uploadImage } from '@/services/uploadService';
import { SeasonalCampaign, SeasonalCategory, SeasonalBanner, SeasonalOffer } from '@/types/seasonalCampaign';

const SeasonalCampaignForm: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { formatPrice, convertPrice } = useCurrency();

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [campaign, setCampaign] = useState<SeasonalCampaign | null>(null);

  // Lists for managers
  const [categories, setCategories] = useState<SeasonalCategory[]>([]);
  const [banners, setBanners] = useState<SeasonalBanner[]>([]);
  const [offers, setOffers] = useState<SeasonalOffer[]>([]);

  // Add managers temporary states
  const [newCat, setNewCat] = useState({ name: '', slug: '', description: '', image: '' });
  const [newBanner, setNewBanner] = useState({ title: '', subtitle: '', image: '', link: '', position: 'hero' as any });
  const [newOffer, setNewOffer] = useState({ title: '', code: '', type: 'discount' as any, value: 0, minOrderAmount: 0 });

  // Analytics states
  const [analytics, setAnalytics] = useState<any>(null);
  const [loadingAnalytics, setLoadingAnalytics] = useState(false);

  // Upload state & helper
  const [isUploading, setIsUploading] = useState<Record<string, boolean>>({});

  const handleImageUpload = async (
    e: React.ChangeEvent<HTMLInputElement>,
    targetField: 'banner' | 'category' | 'seo',
    callback: (url: string) => void
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const key = `${targetField}-${Date.now()}`;
    setIsUploading((prev) => ({ ...prev, [key]: true }));

    try {
      const formData = new FormData();
      formData.append('image', file);

      const res = await uploadImage(formData, targetField === 'banner' ? 'hero' : 'category');
      if (res && res.imageUrl) {
        callback(res.imageUrl);
        toast({
          title: "Success",
          description: "Image uploaded successfully!",
        });
      }
    } catch (err) {
      console.error("Failed to upload image:", err);
      toast({
        title: "Upload Failed",
        description: "Failed to upload image. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsUploading((prev) => ({ ...prev, [key]: false }));
    }
  };

  useEffect(() => {
    const fetchCampaign = async () => {
      try {
        setIsLoading(true);
        const res = await seasonalCampaignService.adminGetAllCampaigns();
        if (res.success) {
          const match = res.campaigns.find(c => c._id === id);
          if (match) {
            setCampaign(match);
            setCategories(match.categories || []);
            setBanners(match.banners || []);
            setOffers(match.offers || []);
            fetchAnalytics(match._id!);
          } else {
            toast({
              variant: "destructive",
              title: "Not Found",
              description: "Campaign not found",
            });
            navigate('/admin/seasonal-campaigns');
          }
        }
      } catch (error) {
        console.error('Error fetching campaign details:', error);
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to load campaign settings",
        });
      } finally {
        setIsLoading(false);
      }
    };

    if (id) {
      fetchCampaign();
    }
  }, [id, navigate, toast]);

  const fetchAnalytics = async (campaignId: string) => {
    try {
      setLoadingAnalytics(true);
      const res = await seasonalCampaignService.adminGetCampaignAnalytics(campaignId);
      if (res.success) {
        setAnalytics(res);
      }
    } catch (error) {
      console.error('Error fetching analytics:', error);
    } finally {
      setLoadingAnalytics(false);
    }
  };

  const handleSave = async () => {
    if (!campaign) return;

    try {
      setIsSaving(true);
      const payload: Partial<SeasonalCampaign> = {
        ...campaign,
        categories,
        banners,
        offers,
      };

      const res = await seasonalCampaignService.adminUpdateCampaign(campaign._id!, payload);
      if (res.success) {
        toast({
          title: "Settings Saved",
          description: `Settings for "${campaign.name}" updated successfully.`,
        });
      }
    } catch (error: any) {
      console.error('Error saving campaign settings:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: error.response?.data?.message || "Failed to save settings",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleFieldChange = (section: keyof SeasonalCampaign, field: string, value: any) => {
    if (!campaign) return;
    setCampaign((prev: any) => {
      const sectionObj = prev[section];
      if (typeof sectionObj === 'object' && sectionObj !== null) {
        return {
          ...prev,
          [section]: {
            ...sectionObj,
            [field]: value
          }
        };
      }
      return {
        ...prev,
        [field]: value
      };
    });
  };

  // Categories Handlers
  const handleAddCategory = () => {
    if (!newCat.name) return;
    const catSlug = newCat.slug || newCat.name.trim().toLowerCase().replace(/[^a-z0-9-]/g, '-');
    const newCategory: SeasonalCategory = {
      id: `cat-${Date.now()}`,
      name: newCat.name,
      slug: catSlug,
      description: newCat.description,
      image: newCat.image || '/images/placeholder.jpg',
      enabled: true,
      order: categories.length
    };
    setCategories([...categories, newCategory]);
    setNewCat({ name: '', slug: '', description: '', image: '' });
  };

  const handleDeleteCategory = (catId: string) => {
    setCategories(categories.filter(c => c.id !== catId));
  };

  // Banners Handlers
  const handleAddBanner = () => {
    const newB: SeasonalBanner = {
      id: `banner-${Date.now()}`,
      title: newBanner.title,
      subtitle: newBanner.subtitle,
      image: newBanner.image || '/images/placeholder.jpg',
      link: newBanner.link,
      position: newBanner.position,
      enabled: true,
      order: banners.length
    };
    setBanners([...banners, newB]);
    setNewBanner({ title: '', subtitle: '', image: '', link: '', position: 'hero' });
  };

  const handleDeleteBanner = (bannerId: string) => {
    setBanners(banners.filter(b => b.id !== bannerId));
  };

  // Offers Handlers
  const handleAddOffer = () => {
    if (!newOffer.title) return;
    const newOff: SeasonalOffer = {
      id: `offer-${Date.now()}`,
      title: newOffer.title,
      code: newOffer.code,
      type: newOffer.type,
      value: Number(newOffer.value),
      minOrderAmount: Number(newOffer.minOrderAmount),
      enabled: true,
      order: offers.length
    };
    setOffers([...offers, newOff]);
    setNewOffer({ title: '', code: '', type: 'discount', value: 0, minOrderAmount: 0 });
  };

  const handleDeleteOffer = (offerId: string) => {
    setOffers(offers.filter(o => o.id !== offerId));
  };

  if (isLoading || !campaign) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 border rounded-xl shadow-sm">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => navigate('/admin/seasonal-campaigns')}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <span className="text-2xl">{campaign.theme?.icon || '🎉'}</span>
              {campaign.name} Settings
            </h1>
            <p className="text-xs text-muted-foreground">Centralized occasion engine configuration panel.</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Switch
            checked={campaign.enabled}
            onCheckedChange={(checked) => setCampaign(prev => prev ? ({ ...prev, enabled: checked }) : null)}
            className="data-[state=checked]:bg-emerald-600"
          />
          <span className="text-sm font-semibold mr-4">
            {campaign.enabled ? 'Campaign ON' : 'Campaign OFF'}
          </span>
          <Button disabled={isSaving} onClick={handleSave} className="bg-indigo-600 hover:bg-indigo-700">
            <Save className="mr-2 h-4 w-4" />
            {isSaving ? 'Saving...' : 'Save Settings'}
          </Button>
        </div>
      </div>

      <Tabs defaultValue="general" className="w-full">
        <TabsList className="grid grid-cols-4 md:grid-cols-8 gap-2 bg-slate-100 p-1.5 rounded-xl h-auto">
          <TabsTrigger value="general" className="py-2.5 rounded-lg text-xs md:text-sm">General</TabsTrigger>
          <TabsTrigger value="theme" className="py-2.5 rounded-lg text-xs md:text-sm">Theme</TabsTrigger>
          <TabsTrigger value="banners" className="py-2.5 rounded-lg text-xs md:text-sm">Banners</TabsTrigger>
          <TabsTrigger value="categories" className="py-2.5 rounded-lg text-xs md:text-sm">Categories</TabsTrigger>
          <TabsTrigger value="offers" className="py-2.5 rounded-lg text-xs md:text-sm">Offers</TabsTrigger>
          <TabsTrigger value="delivery" className="py-2.5 rounded-lg text-xs md:text-sm">Delivery</TabsTrigger>
          <TabsTrigger value="seo" className="py-2.5 rounded-lg text-xs md:text-sm">SEO</TabsTrigger>
          <TabsTrigger value="analytics" className="py-2.5 rounded-lg text-xs md:text-sm">Analytics</TabsTrigger>
        </TabsList>

        {/* General Settings Tab */}
        <TabsContent value="general" className="space-y-4 pt-4">
          <Card>
            <CardHeader>
              <CardTitle>General Campaign Details</CardTitle>
              <CardDescription>Setup campaign dates, campaign headline details, and navigation displays.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Occasion Name</Label>
                  <Input 
                    value={campaign.name} 
                    onChange={(e) => setCampaign({ ...campaign, name: e.target.value })} 
                  />
                </div>
                <div className="space-y-2">
                  <Label>URL Slug</Label>
                  <Input 
                    value={campaign.slug} 
                    onChange={(e) => setCampaign({ ...campaign, slug: e.target.value })} 
                    className="font-mono"
                    disabled
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>Start Date</Label>
                  <Input 
                    type="datetime-local" 
                    value={campaign.general?.startDate ? new Date(campaign.general.startDate).toISOString().slice(0, 16) : ''} 
                    onChange={(e) => handleFieldChange('general', 'startDate', e.target.value)} 
                  />
                </div>
                <div className="space-y-2">
                  <Label>End Date</Label>
                  <Input 
                    type="datetime-local" 
                    value={campaign.general?.endDate ? new Date(campaign.general.endDate).toISOString().slice(0, 16) : ''} 
                    onChange={(e) => handleFieldChange('general', 'endDate', e.target.value)} 
                  />
                </div>
                <div className="space-y-2">
                  <Label>Countdown Timer Target Date</Label>
                  <Input 
                    type="datetime-local" 
                    value={campaign.general?.countdownTargetDate ? new Date(campaign.general.countdownTargetDate).toISOString().slice(0, 16) : ''} 
                    onChange={(e) => handleFieldChange('general', 'countdownTargetDate', e.target.value)} 
                  />
                </div>
              </div>

              <Separator className="my-4" />

              <div className="space-y-4">
                <h3 className="font-semibold text-sm">Custom Landing Page Texts</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Campaign Badge / Title Prefix</Label>
                    <Input 
                      value={campaign.general?.campaignName || ''} 
                      onChange={(e) => handleFieldChange('general', 'campaignName', e.target.value)} 
                      placeholder="e.g. Mother's Day Special Celebration"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>CTA Primary Button Text</Label>
                    <Input 
                      value={campaign.general?.exploreButtonText || 'Explore Collection'} 
                      onChange={(e) => handleFieldChange('general', 'exploreButtonText', e.target.value)} 
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>CTA Secondary Button Text</Label>
                    <Input 
                      value={campaign.general?.offersButtonText || 'View Offers'} 
                      onChange={(e) => handleFieldChange('general', 'offersButtonText', e.target.value)} 
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label>Countdown Timer Label</Label>
                    <Input 
                      value={campaign.general?.countdownLabel || 'Order Before Time Runs Out'} 
                      onChange={(e) => handleFieldChange('general', 'countdownLabel', e.target.value)} 
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Offers Section Label</Label>
                    <Input 
                      value={campaign.general?.offersLabel || 'Exclusive Deals'} 
                      onChange={(e) => handleFieldChange('general', 'offersLabel', e.target.value)} 
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Offers Section Title</Label>
                    <Input 
                      value={campaign.general?.offersTitle || 'Special Offers For You'} 
                      onChange={(e) => handleFieldChange('general', 'offersTitle', e.target.value)} 
                    />
                  </div>
                </div>
              </div>

              <Separator className="my-4" />

              <div className="space-y-4">
                <h3 className="font-semibold text-sm">Homepage Section & Card Settings</h3>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label>Homepage Section Badge</Label>
                    <Input 
                      value={campaign.general?.homepageSectionBadge || 'Seasonal Celebrations'} 
                      onChange={(e) => handleFieldChange('general', 'homepageSectionBadge', e.target.value)} 
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Homepage Section Title</Label>
                    <Input 
                      value={campaign.general?.homepageSectionTitle || 'Our Festive Specials'} 
                      onChange={(e) => handleFieldChange('general', 'homepageSectionTitle', e.target.value)} 
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Homepage Section Subtitle</Label>
                    <Input 
                      value={campaign.general?.homepageSectionSubtitle || 'Make every occasion unforgettable with our specially curated seasonal flower collections.'} 
                      onChange={(e) => handleFieldChange('general', 'homepageSectionSubtitle', e.target.value)} 
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Homepage Card Tag/Badge</Label>
                    <Input 
                      value={campaign.general?.cardTagText || 'Limited Campaign'} 
                      onChange={(e) => handleFieldChange('general', 'cardTagText', e.target.value)} 
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Homepage Card Button Text</Label>
                    <Input 
                      value={campaign.general?.cardButtonText || 'Shop Now'} 
                      onChange={(e) => handleFieldChange('general', 'cardButtonText', e.target.value)} 
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Homepage Card Custom Title</Label>
                    <Input 
                      value={campaign.general?.cardTitleText || ''} 
                      onChange={(e) => handleFieldChange('general', 'cardTitleText', e.target.value)} 
                      placeholder={`e.g. ${campaign.name} Special`}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Homepage Card Custom Description</Label>
                    <Input 
                      value={campaign.general?.cardDescriptionText || ''} 
                      onChange={(e) => handleFieldChange('general', 'cardDescriptionText', e.target.value)} 
                      placeholder="Leave blank to fallback to SEO description"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Homepage Card Custom Image (Upload file or enter URL)</Label>
                    <div className="flex gap-2">
                      <Input 
                        value={campaign.general?.cardImage || ''} 
                        onChange={(e) => handleFieldChange('general', 'cardImage', e.target.value)} 
                        placeholder="/uploads/... or https://..."
                        className="flex-1"
                      />
                      <div className="relative">
                        <Button 
                          type="button" 
                          variant="outline"
                          disabled={Object.values(isUploading).some(Boolean)}
                          onClick={() => document.getElementById('card-image-file-upload')?.click()}
                        >
                          {Object.values(isUploading).some(Boolean) ? "..." : "Upload"}
                        </Button>
                        <input
                          id="card-image-file-upload"
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => handleImageUpload(e, 'banner', (url) => handleFieldChange('general', 'cardImage', url))}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <Separator className="my-4" />

              <div>
                <h3 className="font-semibold text-sm mb-3">Campaign Navigation Visibility Settings</h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="flex items-center justify-between p-3 border rounded-lg bg-slate-50/50">
                    <div className="flex flex-col">
                      <span className="text-xs font-semibold">Homepage Banner Section</span>
                      <span className="text-[10px] text-muted-foreground">Render custom campaign grid on home.</span>
                    </div>
                    <Switch 
                      checked={campaign.navigation?.showInHomepage} 
                      onCheckedChange={(checked) => handleFieldChange('navigation', 'showInHomepage', checked)} 
                    />
                  </div>

                  <div className="flex items-center justify-between p-3 border rounded-lg bg-slate-50/50">
                    <div className="flex flex-col">
                      <span className="text-xs font-semibold">Header Desktop Menu Link</span>
                      <span className="text-[10px] text-muted-foreground">Add tab in header.</span>
                    </div>
                    <Switch 
                      checked={campaign.navigation?.showInNavigationMenu} 
                      onCheckedChange={(checked) => handleFieldChange('navigation', 'showInNavigationMenu', checked)} 
                    />
                  </div>

                  <div className="flex items-center justify-between p-3 border rounded-lg bg-slate-50/50">
                    <div className="flex flex-col">
                      <span className="text-xs font-semibold">Mobile Bottom Navigation Bar</span>
                      <span className="text-[10px] text-muted-foreground">Add button in mobile navbar.</span>
                    </div>
                    <Switch 
                      checked={campaign.navigation?.showInMobileNavbar} 
                      onCheckedChange={(checked) => handleFieldChange('navigation', 'showInMobileNavbar', checked)} 
                    />
                  </div>

                  <div className="flex items-center justify-between p-3 border rounded-lg bg-slate-50/50">
                    <div className="flex flex-col">
                      <span className="text-xs font-semibold">Announcement Bar Banner</span>
                      <span className="text-[10px] text-muted-foreground">Display header ticker text.</span>
                    </div>
                    <Switch 
                      checked={campaign.navigation?.showInAnnouncementBar} 
                      onCheckedChange={(checked) => handleFieldChange('navigation', 'showInAnnouncementBar', checked)} 
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Theme customization Tab */}
        <TabsContent value="theme" className="space-y-4 pt-4">
          <Card>
            <CardHeader>
              <CardTitle>Occasion Theme Manager</CardTitle>
              <CardDescription>Configure branding color scheme, typography, button style, and screen animations.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="space-y-2">
                  <Label>Occasion Emoji Icon</Label>
                  <Input 
                    value={campaign.theme?.icon} 
                    onChange={(e) => handleFieldChange('theme', 'icon', e.target.value)} 
                  />
                </div>
                <div className="space-y-2">
                  <Label>Primary Theme Color</Label>
                  <div className="flex gap-2">
                    <Input type="color" value={campaign.theme?.primaryColor || '#4f46e5'} onChange={(e) => handleFieldChange('theme', 'primaryColor', e.target.value)} className="h-10 w-12 p-1" />
                    <Input value={campaign.theme?.primaryColor || '#4f46e5'} onChange={(e) => handleFieldChange('theme', 'primaryColor', e.target.value)} className="font-mono text-xs" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Secondary Color</Label>
                  <div className="flex gap-2">
                    <Input type="color" value={campaign.theme?.secondaryColor || '#c7d2fe'} onChange={(e) => handleFieldChange('theme', 'secondaryColor', e.target.value)} className="h-10 w-12 p-1" />
                    <Input value={campaign.theme?.secondaryColor || '#c7d2fe'} onChange={(e) => handleFieldChange('theme', 'secondaryColor', e.target.value)} className="font-mono text-xs" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Accent Color</Label>
                  <div className="flex gap-2">
                    <Input type="color" value={campaign.theme?.accentColor || '#fbbf24'} onChange={(e) => handleFieldChange('theme', 'accentColor', e.target.value)} className="h-10 w-12 p-1" />
                    <Input value={campaign.theme?.accentColor || '#fbbf24'} onChange={(e) => handleFieldChange('theme', 'accentColor', e.target.value)} className="font-mono text-xs" />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>Background Layout Style</Label>
                  <Select value={campaign.theme?.backgroundStyle} onValueChange={(val) => handleFieldChange('theme', 'backgroundStyle', val)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select style" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="glassmorphism">Premium Glassmorphism</SelectItem>
                      <SelectItem value="solid">Minimal Solid Color</SelectItem>
                      <SelectItem value="gradient">vibrant Gradient Background</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Background Gradient String</Label>
                  <Input 
                    value={campaign.theme?.backgroundGradient} 
                    onChange={(e) => handleFieldChange('theme', 'backgroundGradient', e.target.value)} 
                    placeholder="linear-gradient(...)"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Screen Animation style</Label>
                  <Select value={campaign.theme?.animationStyle} onValueChange={(val) => handleFieldChange('theme', 'animationStyle', val)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select animation" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">None (Static)</SelectItem>
                      <SelectItem value="petals">Falling Flower Petals 🌸</SelectItem>
                      <SelectItem value="hearts">Floating Hearts 💕</SelectItem>
                      <SelectItem value="leaves">Floating Fall Leaves 🍂</SelectItem>
                      <SelectItem value="confetti">Floating Party Confetti 🎉</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>Fonts Family Typography</Label>
                  <Input 
                    value={campaign.theme?.typography} 
                    onChange={(e) => handleFieldChange('theme', 'typography', e.target.value)} 
                    placeholder="Inter, Outfit, Playfair Display"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Button Border Style</Label>
                  <Input 
                    value={campaign.theme?.buttonStyle} 
                    onChange={(e) => handleFieldChange('theme', 'buttonStyle', e.target.value)} 
                    placeholder="rounded-xl, rounded-full"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Banner Shape Style</Label>
                  <Input 
                    value={campaign.theme?.bannerStyle} 
                    onChange={(e) => handleFieldChange('theme', 'bannerStyle', e.target.value)} 
                    placeholder="premium, simple, modern"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Theme Page Text Color</Label>
                  <div className="flex gap-2">
                    <Input type="color" value={campaign.theme?.textColor || '#ffffff'} onChange={(e) => handleFieldChange('theme', 'textColor', e.target.value)} className="h-10 w-12 p-1" />
                    <Input value={campaign.theme?.textColor || '#ffffff'} onChange={(e) => handleFieldChange('theme', 'textColor', e.target.value)} className="font-mono text-xs" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Theme Page Subtext Color</Label>
                  <div className="flex gap-2">
                    <Input type="color" value={campaign.theme?.subtextColor || 'rgba(255, 255, 255, 0.8)'} onChange={(e) => handleFieldChange('theme', 'subtextColor', e.target.value)} className="h-10 w-12 p-1" />
                    <Input value={campaign.theme?.subtextColor || 'rgba(255, 255, 255, 0.8)'} onChange={(e) => handleFieldChange('theme', 'subtextColor', e.target.value)} className="font-mono text-xs" />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Banners Tab */}
        <TabsContent value="banners" className="space-y-4 pt-4">
          <Card>
            <CardHeader>
              <CardTitle>Occasion Banner Manager</CardTitle>
              <CardDescription>Setup desktop, mobile, popup, and promo banners specifically for this campaign.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Form to add a new banner */}
              <div className="p-4 border rounded-xl bg-slate-50/50 space-y-4">
                <h4 className="font-semibold text-sm">Add Campaign Banner</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-1">
                    <Label className="text-xs">Banner Title</Label>
                    <Input value={newBanner.title} onChange={(e) => setNewBanner({ ...newBanner, title: e.target.value })} />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">Banner Subtitle</Label>
                    <Input value={newBanner.subtitle} onChange={(e) => setNewBanner({ ...newBanner, subtitle: e.target.value })} />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">Placement Position</Label>
                    <Select value={newBanner.position} onValueChange={(val) => setNewBanner({ ...newBanner, position: val })}>
                      <SelectTrigger>
                        <SelectValue placeholder="Position" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="hero">Hero Background Banner</SelectItem>
                        <SelectItem value="announcement">Announcement Bar Text</SelectItem>
                        <SelectItem value="carousel">Mid-Page Carousel Slide</SelectItem>
                        <SelectItem value="popup">Overlay Dialog Popup</SelectItem>
                        <SelectItem value="offer">Promotion Offer Card</SelectItem>
                        <SelectItem value="countdown">Countdown Clock Banner</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <Label className="text-xs">Image (Upload file or enter URL)</Label>
                    <div className="flex gap-2">
                      <Input 
                        value={newBanner.image} 
                        onChange={(e) => setNewBanner({ ...newBanner, image: e.target.value })} 
                        placeholder="/uploads/... or https://..." 
                        className="flex-1"
                      />
                      <div className="relative">
                        <Button 
                          type="button" 
                          variant="outline"
                          disabled={Object.values(isUploading).some(Boolean)}
                          onClick={() => document.getElementById('banner-file-upload')?.click()}
                        >
                          {Object.values(isUploading).some(Boolean) ? "..." : "Upload"}
                        </Button>
                        <input
                          id="banner-file-upload"
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => handleImageUpload(e, 'banner', (url) => setNewBanner(prev => ({ ...prev, image: url })))}
                        />
                      </div>
                    </div>
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">CTA Link Destination URL</Label>
                    <Input value={newBanner.link} onChange={(e) => setNewBanner({ ...newBanner, link: e.target.value })} placeholder="/shop?category=..." />
                  </div>
                </div>

                <Button type="button" onClick={handleAddBanner} className="bg-indigo-600 hover:bg-indigo-700">
                  Add Banner Item
                </Button>
              </div>

              {/* Banners List */}
              <div className="space-y-3">
                <h4 className="font-semibold text-sm">Configured Banners</h4>
                {banners.length === 0 ? (
                  <p className="text-xs text-muted-foreground">No custom banners set up yet.</p>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {banners.map((b) => (
                      <div key={b.id} className="p-3 border rounded-lg bg-white flex justify-between gap-4 items-start shadow-sm">
                        <div className="flex gap-3">
                          <div className="w-12 h-12 bg-slate-100 border rounded flex items-center justify-center overflow-hidden">
                            {b.image ? <img src={b.image} className="w-full h-full object-cover" alt="" /> : <ImageIcon className="h-5 w-5 text-gray-400" />}
                          </div>
                          <div>
                            <div className="text-sm font-semibold">{b.title || 'Untitled Banner'}</div>
                            <div className="text-xs text-muted-foreground">{b.subtitle}</div>
                            <div className="mt-1">
                              <Badge variant="outline" className="capitalize text-[10px]">{b.position}</Badge>
                            </div>
                          </div>
                        </div>
                        <Button variant="ghost" size="icon" className="text-red-500 hover:bg-red-50 rounded-full" onClick={() => handleDeleteBanner(b.id)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Categories Tab */}
        <TabsContent value="categories" className="space-y-4 pt-4">
          <Card>
            <CardHeader>
              <CardTitle>Campaign Category Management</CardTitle>
              <CardDescription>Setup customized categories exclusively for this occasion page.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Form to add a new category */}
              <div className="p-4 border rounded-xl bg-slate-50/50 space-y-4">
                <h4 className="font-semibold text-sm">Add Campaign Category</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <Label className="text-xs">Category Name</Label>
                    <Input 
                      value={newCat.name} 
                      onChange={(e) => {
                        const name = e.target.value;
                        const slug = name.trim().toLowerCase().replace(/[^a-z0-9-]/g, '-').replace(/-+/g, '-');
                        setNewCat({ ...newCat, name, slug });
                      }} 
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">Category Slug</Label>
                    <Input value={newCat.slug} onChange={(e) => setNewCat({ ...newCat, slug: e.target.value })} className="font-mono" />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <Label className="text-xs">Category Description</Label>
                    <Input value={newCat.description} onChange={(e) => setNewCat({ ...newCat, description: e.target.value })} />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">Image (Upload file or enter URL)</Label>
                    <div className="flex gap-2">
                      <Input 
                        value={newCat.image} 
                        onChange={(e) => setNewCat({ ...newCat, image: e.target.value })} 
                        placeholder="/uploads/... or https://..."
                        className="flex-1"
                      />
                      <div className="relative">
                        <Button 
                          type="button" 
                          variant="outline"
                          disabled={Object.values(isUploading).some(Boolean)}
                          onClick={() => document.getElementById('category-file-upload')?.click()}
                        >
                          {Object.values(isUploading).some(Boolean) ? "..." : "Upload"}
                        </Button>
                        <input
                          id="category-file-upload"
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => handleImageUpload(e, 'category', (url) => setNewCat(prev => ({ ...prev, image: url })))}
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <Button type="button" onClick={handleAddCategory} className="bg-indigo-600 hover:bg-indigo-700">
                  Add Category
                </Button>
              </div>

              {/* Categories list */}
              <div className="space-y-3">
                <h4 className="font-semibold text-sm">Occasion Categories</h4>
                {categories.length === 0 ? (
                  <p className="text-xs text-muted-foreground">No custom categories set up yet.</p>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {categories.map((c) => (
                      <div key={c.id} className="p-3 border rounded-lg bg-white flex justify-between gap-4 items-start shadow-sm">
                        <div className="flex gap-3">
                          <div className="w-12 h-12 bg-slate-100 border rounded flex items-center justify-center overflow-hidden">
                            {c.image ? <img src={c.image} className="w-full h-full object-cover" alt="" /> : <Tags className="h-5 w-5 text-gray-400" />}
                          </div>
                          <div>
                            <div className="text-sm font-semibold">{c.name}</div>
                            <div className="text-xs font-mono text-muted-foreground">/{c.slug}</div>
                            <div className="text-xs text-gray-500 mt-1">{c.description}</div>
                          </div>
                        </div>
                        <Button variant="ghost" size="icon" className="text-red-500 hover:bg-red-50 rounded-full" onClick={() => handleDeleteCategory(c.id)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Offers Tab */}
        <TabsContent value="offers" className="space-y-4 pt-4">
          <Card>
            <CardHeader>
              <CardTitle>Occasion Offers Manager</CardTitle>
              <CardDescription>Setup discount codes, BOGO, or bundle promotions tailored for this campaign.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Form to add new offer */}
              <div className="p-4 border rounded-xl bg-slate-50/50 space-y-4">
                <h4 className="font-semibold text-sm">Add Campaign Offer</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-1">
                    <Label className="text-xs">Offer Display Title</Label>
                    <Input value={newOffer.title} onChange={(e) => setNewOffer({ ...newOffer, title: e.target.value })} placeholder="e.g. Save 15% on Blooms" />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">Promo Code</Label>
                    <Input value={newOffer.code} onChange={(e) => setNewOffer({ ...newOffer, code: e.target.value })} placeholder="e.g. MOM15" />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">Offer Type</Label>
                    <Select value={newOffer.type} onValueChange={(val) => setNewOffer({ ...newOffer, type: val })}>
                      <SelectTrigger>
                        <SelectValue placeholder="Offer Type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="discount">Percentage/Fixed Discount</SelectItem>
                        <SelectItem value="free-delivery">Free Delivery Coupon</SelectItem>
                        <SelectItem value="bogo">Buy One Get One (BOGO)</SelectItem>
                        <SelectItem value="gift">Free Gift Addon</SelectItem>
                        <SelectItem value="bundle">Special Combo Bundle Discount</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <Label className="text-xs">Discount Value (Percentage / Flat Amt)</Label>
                    <Input type="number" value={newOffer.value} onChange={(e) => setNewOffer({ ...newOffer, value: Number(e.target.value) })} />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">Minimum Order Amount Required (INR)</Label>
                    <Input type="number" value={newOffer.minOrderAmount} onChange={(e) => setNewOffer({ ...newOffer, minOrderAmount: Number(e.target.value) })} />
                  </div>
                </div>

                <Button type="button" onClick={handleAddOffer} className="bg-indigo-600 hover:bg-indigo-700">
                  Add Offer Item
                </Button>
              </div>

              {/* Offers list */}
              <div className="space-y-3">
                <h4 className="font-semibold text-sm">Configured Campaign Offers</h4>
                {offers.length === 0 ? (
                  <p className="text-xs text-muted-foreground">No custom offers configured yet.</p>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {offers.map((o) => (
                      <div key={o.id} className="p-3 border rounded-lg bg-white flex justify-between gap-4 items-start shadow-sm">
                        <div className="flex gap-3">
                          <div className="w-10 h-10 bg-indigo-50 border border-indigo-100 rounded-full flex items-center justify-center">
                            <Gift className="h-5 w-5 text-indigo-600" />
                          </div>
                          <div>
                            <div className="text-sm font-semibold">{o.title}</div>
                            {o.code && <div className="text-xs font-mono font-bold text-indigo-700 mt-0.5">Code: {o.code}</div>}
                            <div className="flex gap-1.5 mt-1">
                              <Badge variant="outline" className="text-[9px] capitalize">{o.type}</Badge>
                              {o.value > 0 && <Badge variant="secondary" className="text-[9px]">{o.value}% Off</Badge>}
                              {o.minOrderAmount > 0 && <Badge variant="outline" className="text-[9px]">Min: ₹{o.minOrderAmount}</Badge>}
                            </div>
                          </div>
                        </div>
                        <Button variant="ghost" size="icon" className="text-red-500 hover:bg-red-50 rounded-full" onClick={() => handleDeleteOffer(o.id)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Delivery Tab */}
        <TabsContent value="delivery" className="space-y-4 pt-4">
          <Card>
            <CardHeader>
              <CardTitle>Delivery Rules & Charges</CardTitle>
              <CardDescription>Setup delivery surcharges, timing cutoffs, and slot restrictions for the campaign.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Same Day Section */}
                <div className="p-4 border rounded-xl space-y-3 bg-slate-50/30">
                  <div className="flex items-center justify-between">
                    <h4 className="font-semibold text-sm">Same-Day Delivery</h4>
                    <Switch
                      checked={campaign.delivery?.sameDayEnabled}
                      onCheckedChange={(checked) => handleFieldChange('delivery', 'sameDayEnabled', checked)}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <Label className="text-xs">Same-Day Surcharge (INR)</Label>
                      <Input 
                        type="number" 
                        value={campaign.delivery?.sameDayCharge || 0} 
                        onChange={(e) => handleFieldChange('delivery', 'sameDayCharge', Number(e.target.value))} 
                      />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs">Same-Day Order Cutoff Time</Label>
                      <Input 
                        type="text" 
                        value={campaign.delivery?.sameDayCutoff || '18:00'} 
                        onChange={(e) => handleFieldChange('delivery', 'sameDayCutoff', e.target.value)} 
                        placeholder="18:00"
                      />
                    </div>
                  </div>
                </div>

                {/* Midnight Section */}
                <div className="p-4 border rounded-xl space-y-3 bg-slate-50/30">
                  <div className="flex items-center justify-between">
                    <h4 className="font-semibold text-sm">Midnight Delivery</h4>
                    <Switch
                      checked={campaign.delivery?.midnightEnabled}
                      onCheckedChange={(checked) => handleFieldChange('delivery', 'midnightEnabled', checked)}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <Label className="text-xs">Midnight Surcharge (INR)</Label>
                      <Input 
                        type="number" 
                        value={campaign.delivery?.midnightCharge || 150} 
                        onChange={(e) => handleFieldChange('delivery', 'midnightCharge', Number(e.target.value))} 
                      />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs">Midnight Order Cutoff Time</Label>
                      <Input 
                        type="text" 
                        value={campaign.delivery?.midnightCutoff || '20:00'} 
                        onChange={(e) => handleFieldChange('delivery', 'midnightCutoff', e.target.value)} 
                        placeholder="20:00"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* SEO Settings Tab */}
        <TabsContent value="seo" className="space-y-4 pt-4">
          <Card>
            <CardHeader>
              <CardTitle>SEO Settings & Metadata</CardTitle>
              <CardDescription>Setup search ranking tags, meta titles, descriptions, and keywords to rank on Google.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Google Meta Title</Label>
                  <Input 
                    value={campaign.seo?.metaTitle} 
                    onChange={(e) => handleFieldChange('seo', 'metaTitle', e.target.value)} 
                    placeholder="e.g. Best Mother's Day Flowers | Same Day Delivery"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Canonical URL Link</Label>
                  <Input 
                    value={campaign.seo?.canonicalUrl} 
                    onChange={(e) => handleFieldChange('seo', 'canonicalUrl', e.target.value)} 
                    placeholder="https://..."
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Google Meta Description</Label>
                <Input 
                  value={campaign.seo?.metaDescription} 
                  onChange={(e) => handleFieldChange('seo', 'metaDescription', e.target.value)} 
                  placeholder="Summarize the occasion products for google search snippets..."
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Keywords (comma-separated list)</Label>
                  <Input 
                    value={campaign.seo?.keywords?.join(', ')} 
                    onChange={(e) => handleFieldChange('seo', 'keywords', e.target.value.split(',').map(s => s.trim()))} 
                    placeholder="mothers day flowers, gifts for mom"
                  />
                </div>
                <div className="space-y-2">
                  <Label>ogImage Social Image (Upload file or enter URL)</Label>
                  <div className="flex gap-2">
                    <Input 
                      value={campaign.seo?.ogImage || ''} 
                      onChange={(e) => handleFieldChange('seo', 'ogImage', e.target.value)} 
                      placeholder="https://..."
                      className="flex-1"
                    />
                    <div className="relative">
                      <Button 
                        type="button" 
                        variant="outline"
                        disabled={Object.values(isUploading).some(Boolean)}
                        onClick={() => document.getElementById('seo-file-upload')?.click()}
                      >
                        {Object.values(isUploading).some(Boolean) ? "..." : "Upload"}
                      </Button>
                      <input
                        id="seo-file-upload"
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => handleImageUpload(e, 'seo', (url) => handleFieldChange('seo', 'ogImage', url))}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Analytics Tab */}
        <TabsContent value="analytics" className="space-y-4 pt-4">
          <Card>
            <CardHeader>
              <CardTitle>Occasion Performance Metrics</CardTitle>
              <CardDescription>Track orders, revenue generation, and conversion percentages generated through campaign items.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {loadingAnalytics || !analytics ? (
                <div className="flex h-32 items-center justify-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="p-4 border rounded-xl text-center bg-slate-50/50">
                      <span className="block text-2xl font-bold text-gray-800">{analytics.summary?.pageViews || 0}</span>
                      <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Page Views</span>
                    </div>
                    <div className="p-4 border rounded-xl text-center bg-slate-50/50">
                      <span className="block text-2xl font-bold text-gray-800">{analytics.summary?.totalOrders || 0}</span>
                      <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Orders</span>
                    </div>
                    <div className="p-4 border rounded-xl text-center bg-slate-50/50">
                      <span className="block text-2xl font-bold text-emerald-600">
                        {formatPrice(convertPrice(analytics.summary?.totalRevenue || 0))}
                      </span>
                      <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Total Revenue</span>
                    </div>
                    <div className="p-4 border rounded-xl text-center bg-slate-50/50">
                      <span className="block text-2xl font-bold text-indigo-600">{analytics.summary?.conversionRate || 0}%</span>
                      <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Conversion Rate</span>
                    </div>
                  </div>

                  <Separator />

                  <div className="space-y-2">
                    <h3 className="font-semibold text-sm">Top-Performing Products</h3>
                    {analytics.topProducts?.length === 0 ? (
                      <p className="text-xs text-muted-foreground">No orders recorded for campaign products in this range.</p>
                    ) : (
                      <div className="border rounded-xl overflow-hidden">
                        <table className="w-full text-left border-collapse text-sm">
                          <thead>
                            <tr className="bg-slate-50 border-b">
                              <th className="p-3 font-semibold text-gray-600">Product Title</th>
                              <th className="p-3 font-semibold text-gray-600 text-right">Unit Price</th>
                              <th className="p-3 font-semibold text-gray-600 text-center">Units Sold</th>
                              <th className="p-3 font-semibold text-gray-600 text-right">Total Revenue</th>
                            </tr>
                          </thead>
                          <tbody>
                            {analytics.topProducts?.map((p: any) => (
                              <tr key={p._id} className="border-b hover:bg-slate-50/50">
                                <td className="p-3 font-medium text-gray-800">{p.title}</td>
                                <td className="p-3 text-right">{formatPrice(convertPrice(p.price))}</td>
                                <td className="p-3 text-center font-semibold text-gray-800">{p.unitsSold}</td>
                                <td className="p-3 text-right font-bold text-primary">{formatPrice(convertPrice(p.revenue))}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default SeasonalCampaignForm;
