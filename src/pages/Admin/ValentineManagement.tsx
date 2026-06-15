import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Heart, Save, RefreshCw, BarChart3, Power, Settings, Palette, Clock, Calendar, Package, Tag, Gift, Truck, Image, Search as SearchIcon, Plus, Trash2, Edit, Eye, EyeOff, GripVertical, ChevronDown, ChevronUp } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import api from '@/services/api';
import type { ValentineSettings, ValentineOfferItem } from '@/types/valentine';

const ValentineManagement: React.FC = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [settings, setSettings] = useState<ValentineSettings | null>(null);
  const [offers, setOffers] = useState<ValentineOfferItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('general');

  // Fetch all settings
  const fetchSettings = useCallback(async () => {
    try {
      setLoading(true);
      const [settingsRes, offersRes] = await Promise.all([
        api.get('/valentine/settings'),
        api.get('/valentine/offers/all'),
      ]);
      setSettings(settingsRes.data);
      setOffers(offersRes.data?.offers || []);
    } catch (err) {
      console.error('Failed to fetch valentine settings:', err);
      toast({ variant: 'destructive', title: 'Error', description: 'Failed to load Valentine settings' });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => { fetchSettings(); }, [fetchSettings]);

  // Save settings
  const handleSave = async () => {
    if (!settings) return;
    try {
      setSaving(true);
      await api.put('/valentine/settings', settings);
      toast({ title: '✅ Saved', description: 'Valentine settings updated successfully' });
    } catch (err) {
      console.error('Failed to save:', err);
      toast({ variant: 'destructive', title: 'Error', description: 'Failed to save settings' });
    } finally {
      setSaving(false);
    }
  };

  // Toggle master switch
  const handleToggle = async () => {
    try {
      const res = await api.put('/valentine/toggle');
      if (settings) {
        setSettings({ ...settings, enabled: res.data.enabled });
      }
      toast({
        title: res.data.enabled ? '🌹 Valentine Mode ON' : '❌ Valentine Mode OFF',
        description: res.data.message,
      });
    } catch (err) {
      toast({ variant: 'destructive', title: 'Error', description: 'Failed to toggle' });
    }
  };

  // Update nested settings helper
  const updateSetting = (path: string, value: any) => {
    if (!settings) return;
    const keys = path.split('.');
    const updated = JSON.parse(JSON.stringify(settings));
    let ref: any = updated;
    for (let i = 0; i < keys.length - 1; i++) {
      ref = ref[keys[i]];
    }
    ref[keys[keys.length - 1]] = value;
    setSettings(updated);
  };

  // Offer CRUD
  const createOffer = async () => {
    try {
      const res = await api.post('/valentine/offers', {
        title: 'New Valentine Offer',
        description: 'Description here',
        type: 'flat_discount',
        discountValue: 100,
        isActive: true,
      });
      setOffers([...offers, res.data.offer]);
      toast({ title: 'Offer created' });
    } catch (err) {
      toast({ variant: 'destructive', title: 'Error', description: 'Failed to create offer' });
    }
  };

  const deleteOffer = async (id: string) => {
    try {
      await api.delete(`/valentine/offers/${id}`);
      setOffers(offers.filter(o => o._id !== id));
      toast({ title: 'Offer deleted' });
    } catch (err) {
      toast({ variant: 'destructive', title: 'Error', description: 'Failed to delete offer' });
    }
  };

  const updateOffer = async (id: string, data: Partial<ValentineOfferItem>) => {
    try {
      const res = await api.put(`/valentine/offers/${id}`, data);
      setOffers(offers.map(o => o._id === id ? { ...o, ...res.data.offer } : o));
    } catch (err) {
      toast({ variant: 'destructive', title: 'Error', description: 'Failed to update offer' });
    }
  };

  if (loading || !settings) {
    return (
      <div className="p-6 flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <Heart className="w-10 h-10 text-rose-400 mx-auto mb-3 animate-pulse" />
          <p className="text-muted-foreground">Loading Valentine's Management...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 space-y-6 max-w-7xl mx-auto">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold flex items-center gap-2">
            <Heart className="w-7 h-7 text-rose-500" fill="currentColor" />
            Valentine's Management
          </h1>
          <p className="text-muted-foreground mt-1">
            Manage your Valentine's Week seasonal campaign
          </p>
        </div>
        <div className="flex items-center gap-3">
          {/* Master Toggle */}
          <div className={`flex items-center gap-3 px-4 py-2.5 rounded-xl border ${
            settings.enabled
              ? 'bg-rose-50 border-rose-200 dark:bg-rose-950/30 dark:border-rose-800'
              : 'bg-gray-50 border-gray-200 dark:bg-gray-900 dark:border-gray-700'
          }`}>
            <Power className={`w-4 h-4 ${settings.enabled ? 'text-rose-500' : 'text-gray-400'}`} />
            <span className="text-sm font-medium">
              {settings.enabled ? 'Valentine Mode ON' : 'Valentine Mode OFF'}
            </span>
            <Switch
              checked={settings.enabled}
              onCheckedChange={handleToggle}
              className="data-[state=checked]:bg-rose-500"
            />
          </div>

          <Button onClick={() => navigate('/admin/valentine/analytics')} variant="outline" size="sm">
            <BarChart3 className="w-4 h-4 mr-1" /> Analytics
          </Button>

          <Button onClick={handleSave} disabled={saving} className="bg-rose-500 hover:bg-rose-600">
            <Save className="w-4 h-4 mr-1" />
            {saving ? 'Saving...' : 'Save All'}
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="flex flex-wrap gap-1 h-auto p-1 bg-muted/50">
          <TabsTrigger value="general" className="text-xs"><Settings className="w-3 h-3 mr-1" />General</TabsTrigger>
          <TabsTrigger value="theme" className="text-xs"><Palette className="w-3 h-3 mr-1" />Theme</TabsTrigger>
          <TabsTrigger value="countdown" className="text-xs"><Clock className="w-3 h-3 mr-1" />Countdown</TabsTrigger>
          <TabsTrigger value="timeline" className="text-xs"><Calendar className="w-3 h-3 mr-1" />Timeline</TabsTrigger>
          <TabsTrigger value="products" className="text-xs"><Package className="w-3 h-3 mr-1" />Products</TabsTrigger>
          <TabsTrigger value="offers" className="text-xs"><Tag className="w-3 h-3 mr-1" />Offers</TabsTrigger>
          <TabsTrigger value="giftbuilder" className="text-xs"><Gift className="w-3 h-3 mr-1" />Gift Builder</TabsTrigger>
          <TabsTrigger value="delivery" className="text-xs"><Truck className="w-3 h-3 mr-1" />Delivery</TabsTrigger>
          <TabsTrigger value="banners" className="text-xs"><Image className="w-3 h-3 mr-1" />Banners</TabsTrigger>
          <TabsTrigger value="seo" className="text-xs"><SearchIcon className="w-3 h-3 mr-1" />SEO</TabsTrigger>
          <TabsTrigger value="mobilenav" className="text-xs"><Settings className="w-3 h-3 mr-1" />Mobile Nav</TabsTrigger>
        </TabsList>

        {/* ============ GENERAL ============ */}
        <TabsContent value="general" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Campaign Settings</CardTitle>
              <CardDescription>Configure the Valentine's campaign details</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-1 block">Campaign Name</label>
                <Input
                  value={settings.general?.campaignName || ''}
                  onChange={(e) => updateSetting('general.campaignName', e.target.value)}
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium mb-1 block">Start Date</label>
                  <Input
                    type="datetime-local"
                    value={settings.general?.startDate ? new Date(settings.general.startDate).toISOString().slice(0, 16) : ''}
                    onChange={(e) => updateSetting('general.startDate', new Date(e.target.value).toISOString())}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-1 block">End Date</label>
                  <Input
                    type="datetime-local"
                    value={settings.general?.endDate ? new Date(settings.general.endDate).toISOString().slice(0, 16) : ''}
                    onChange={(e) => updateSetting('general.endDate', new Date(e.target.value).toISOString())}
                  />
                </div>
              </div>
              <div className="p-4 rounded-xl bg-rose-50 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-900">
                <h4 className="text-sm font-semibold text-rose-700 dark:text-rose-300 mb-2">Marketing Features</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {Object.entries({
                    exitIntentPopup: 'Exit Intent Popup',
                    limitedStockIndicators: 'Limited Stock Indicators',
                    trendingProducts: 'Trending Products',
                    bestSellerBadges: 'Best Seller Badges',
                    recentPurchaseNotifications: 'Recent Purchase Notifications',
                    socialProofWidgets: 'Social Proof Widgets',
                  }).map(([key, label]) => (
                    <div key={key} className="flex items-center justify-between p-2 rounded-lg bg-white dark:bg-gray-900">
                      <span className="text-sm">{label}</span>
                      <Switch
                        checked={(settings.marketing as any)?.[key] ?? false}
                        onCheckedChange={(v) => updateSetting(`marketing.${key}`, v)}
                      />
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ============ THEME ============ */}
        <TabsContent value="theme" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Theme Settings</CardTitle>
              <CardDescription>Customize the Valentine's visual experience</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {(['primaryColor', 'secondaryColor', 'accentColor'] as const).map(field => (
                  <div key={field}>
                    <label className="text-sm font-medium mb-1 block capitalize">{field.replace('Color', ' Color')}</label>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={settings.theme?.[field] || '#be123c'}
                        onChange={(e) => updateSetting(`theme.${field}`, e.target.value)}
                        className="w-10 h-10 rounded-lg border cursor-pointer"
                      />
                      <Input
                        value={settings.theme?.[field] || ''}
                        onChange={(e) => updateSetting(`theme.${field}`, e.target.value)}
                        className="flex-1"
                      />
                    </div>
                  </div>
                ))}
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">Hero Headline</label>
                <Input
                  value={settings.theme?.heroHeadline || ''}
                  onChange={(e) => updateSetting('theme.heroHeadline', e.target.value)}
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">Hero Subheadline</label>
                <Input
                  value={settings.theme?.heroSubheadline || ''}
                  onChange={(e) => updateSetting('theme.heroSubheadline', e.target.value)}
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium mb-1 block">CTA Button 1 Text</label>
                  <Input value={settings.theme?.ctaButton1Text || ''} onChange={(e) => updateSetting('theme.ctaButton1Text', e.target.value)} />
                </div>
                <div>
                  <label className="text-sm font-medium mb-1 block">CTA Button 2 Text</label>
                  <Input value={settings.theme?.ctaButton2Text || ''} onChange={(e) => updateSetting('theme.ctaButton2Text', e.target.value)} />
                </div>
              </div>
              <div className="flex flex-wrap gap-4">
                <div className="flex items-center gap-2">
                  <Switch checked={settings.theme?.floatingPetals ?? true} onCheckedChange={(v) => updateSetting('theme.floatingPetals', v)} />
                  <span className="text-sm">Floating Petals</span>
                </div>
                <div className="flex items-center gap-2">
                  <Switch checked={settings.theme?.heartAnimations ?? true} onCheckedChange={(v) => updateSetting('theme.heartAnimations', v)} />
                  <span className="text-sm">Heart Animations</span>
                </div>
                <div className="flex items-center gap-2">
                  <Switch checked={settings.theme?.confetti ?? false} onCheckedChange={(v) => updateSetting('theme.confetti', v)} />
                  <span className="text-sm">Confetti Effect</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ============ COUNTDOWN ============ */}
        <TabsContent value="countdown" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Countdown Timer</CardTitle>
              <CardDescription>Set the countdown target date displayed on the Valentine page</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-1 block">Countdown Target Date</label>
                <Input
                  type="datetime-local"
                  value={settings.general?.countdownTargetDate ? new Date(settings.general.countdownTargetDate).toISOString().slice(0, 16) : ''}
                  onChange={(e) => updateSetting('general.countdownTargetDate', new Date(e.target.value).toISOString())}
                />
                <p className="text-xs text-muted-foreground mt-1">
                  This is the date the countdown timer counts down to (typically Valentine's Day – Feb 14)
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ============ TIMELINE ============ */}
        <TabsContent value="timeline" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Valentine Week Timeline</CardTitle>
              <CardDescription>Manage the 8 date cards (Feb 8 – Feb 15)</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {settings.timeline?.map((card, index) => (
                  <div key={card.id} className="p-4 rounded-xl border bg-card space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">{card.icon}</span>
                        <div>
                          <h4 className="font-semibold">{card.title}</h4>
                          <p className="text-xs text-muted-foreground">
                            {new Date(card.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'long' })}
                          </p>
                        </div>
                      </div>
                      <Switch
                        checked={card.enabled}
                        onCheckedChange={(v) => {
                          const updated = [...settings.timeline];
                          updated[index] = { ...updated[index], enabled: v };
                          updateSetting('timeline', updated);
                        }}
                      />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div>
                        <label className="text-xs font-medium">Title</label>
                        <Input
                          value={card.title}
                          onChange={(e) => {
                            const updated = [...settings.timeline];
                            updated[index] = { ...updated[index], title: e.target.value };
                            updateSetting('timeline', updated);
                          }}
                        />
                      </div>
                      <div>
                        <label className="text-xs font-medium">Icon (emoji)</label>
                        <Input
                          value={card.icon}
                          onChange={(e) => {
                            const updated = [...settings.timeline];
                            updated[index] = { ...updated[index], icon: e.target.value };
                            updateSetting('timeline', updated);
                          }}
                        />
                      </div>
                    </div>
                    <div>
                      <label className="text-xs font-medium">Description</label>
                      <Input
                        value={card.description}
                        onChange={(e) => {
                          const updated = [...settings.timeline];
                          updated[index] = { ...updated[index], description: e.target.value };
                          updateSetting('timeline', updated);
                        }}
                      />
                    </div>
                    <div>
                      <label className="text-xs font-medium">Banner Image URL</label>
                      <Input
                        value={card.bannerImage}
                        onChange={(e) => {
                          const updated = [...settings.timeline];
                          updated[index] = { ...updated[index], bannerImage: e.target.value };
                          updateSetting('timeline', updated);
                        }}
                        placeholder="https://..."
                      />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ============ PRODUCTS ============ */}
        <TabsContent value="products" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Product Assignment</CardTitle>
              <CardDescription>Assign products to Valentine dates and categories from the Products page. Products with valentine fields will appear here.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <Package className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
                <p className="text-muted-foreground mb-4">
                  Go to Products → Edit a product → Set Valentine Date and Valentine Category fields.
                </p>
                <Button onClick={() => navigate('/admin/products')} variant="outline">
                  Go to Products
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ============ OFFERS ============ */}
        <TabsContent value="offers" className="space-y-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Valentine's Offers</CardTitle>
                <CardDescription>Create and manage special Valentine offers</CardDescription>
              </div>
              <Button onClick={createOffer} size="sm">
                <Plus className="w-4 h-4 mr-1" /> Add Offer
              </Button>
            </CardHeader>
            <CardContent>
              {offers.length === 0 ? (
                <div className="text-center py-8">
                  <Tag className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
                  <p className="text-muted-foreground">No offers yet. Create your first Valentine offer!</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {offers.map(offer => (
                    <div key={offer._id} className="p-4 rounded-xl border bg-card space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className={`w-2 h-2 rounded-full ${offer.isActive ? 'bg-emerald-500' : 'bg-gray-300'}`} />
                          <h4 className="font-semibold">{offer.title}</h4>
                          <span className="px-2 py-0.5 rounded-full text-[10px] bg-muted">{offer.type}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Switch
                            checked={offer.isActive}
                            onCheckedChange={(v) => updateOffer(offer._id, { isActive: v })}
                          />
                          <Button size="icon" variant="ghost" className="h-8 w-8 text-destructive" onClick={() => deleteOffer(offer._id)}>
                            <Trash2 className="w-3.5 h-3.5" />
                          </Button>
                        </div>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                        <Input
                          placeholder="Title"
                          value={offer.title}
                          onChange={(e) => updateOffer(offer._id, { title: e.target.value })}
                        />
                        <Input
                          placeholder="Discount Value"
                          type="number"
                          value={offer.discountValue}
                          onChange={(e) => updateOffer(offer._id, { discountValue: parseInt(e.target.value) || 0 })}
                        />
                        <Input
                          placeholder="Coupon Code"
                          value={offer.code || ''}
                          onChange={(e) => updateOffer(offer._id, { code: e.target.value })}
                        />
                      </div>
                      <Input
                        placeholder="Description"
                        value={offer.description}
                        onChange={(e) => updateOffer(offer._id, { description: e.target.value })}
                      />
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* ============ GIFT BUILDER ============ */}
        <TabsContent value="giftbuilder" className="space-y-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Gift Builder Items</CardTitle>
                <CardDescription>Manage items customers can pick to build their custom gift</CardDescription>
              </div>
              <Button
                size="sm"
                onClick={() => {
                  const items = [...(settings.giftBuilderItems || [])];
                  items.push({
                    id: `gb-${Date.now()}`,
                    category: 'flowers',
                    name: 'New Item',
                    description: '',
                    price: 0,
                    image: '',
                    enabled: true,
                    stock: 100,
                    order: items.length,
                  } as any);
                  updateSetting('giftBuilderItems', items);
                }}
              >
                <Plus className="w-4 h-4 mr-1" /> Add Item
              </Button>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {settings.giftBuilderItems?.map((item, index) => (
                  <div key={item.id} className="p-3 rounded-xl border bg-card">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium">{item.name}</span>
                      <div className="flex items-center gap-2">
                        <Switch
                          checked={item.enabled}
                          onCheckedChange={(v) => {
                            const items = [...settings.giftBuilderItems];
                            items[index] = { ...items[index], enabled: v };
                            updateSetting('giftBuilderItems', items);
                          }}
                        />
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-7 w-7 text-destructive"
                          onClick={() => {
                            const items = settings.giftBuilderItems.filter((_, i) => i !== index);
                            updateSetting('giftBuilderItems', items);
                          }}
                        >
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                      <Input
                        placeholder="Name"
                        value={item.name}
                        onChange={(e) => {
                          const items = [...settings.giftBuilderItems];
                          items[index] = { ...items[index], name: e.target.value };
                          updateSetting('giftBuilderItems', items);
                        }}
                      />
                      <select
                        value={item.category}
                        onChange={(e) => {
                          const items = [...settings.giftBuilderItems];
                          items[index] = { ...items[index], category: e.target.value as any };
                          updateSetting('giftBuilderItems', items);
                        }}
                        className="flex h-9 rounded-md border border-input bg-transparent px-3 py-1 text-sm"
                      >
                        {['flowers', 'chocolates', 'teddy', 'greeting_card', 'photo_frame', 'perfume', 'custom_message'].map(c => (
                          <option key={c} value={c}>{c.replace('_', ' ')}</option>
                        ))}
                      </select>
                      <Input
                        type="number"
                        placeholder="Price"
                        value={item.price}
                        onChange={(e) => {
                          const items = [...settings.giftBuilderItems];
                          items[index] = { ...items[index], price: parseInt(e.target.value) || 0 };
                          updateSetting('giftBuilderItems', items);
                        }}
                      />
                      <Input
                        type="number"
                        placeholder="Stock"
                        value={item.stock}
                        onChange={(e) => {
                          const items = [...settings.giftBuilderItems];
                          items[index] = { ...items[index], stock: parseInt(e.target.value) || 0 };
                          updateSetting('giftBuilderItems', items);
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ============ DELIVERY ============ */}
        <TabsContent value="delivery" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Valentine Delivery Settings</CardTitle>
              <CardDescription>Configure premium delivery options for Valentine's</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {[
                { key: 'sameDay', label: 'Same Day Delivery', icon: '🚚' },
                { key: 'midnight', label: 'Midnight Delivery', icon: '🌙' },
                { key: 'fixedTime', label: 'Fixed Time Delivery', icon: '⏰' },
                { key: 'surprise', label: 'Surprise Delivery', icon: '🎁' },
                { key: 'anonymous', label: 'Anonymous Delivery', icon: '🕵️' },
              ].map(opt => (
                <div key={opt.key} className="p-4 rounded-xl border bg-card">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <span className="text-xl">{opt.icon}</span>
                      <span className="font-medium">{opt.label}</span>
                    </div>
                    <Switch
                      checked={(settings.delivery as any)?.[`${opt.key}Enabled`] ?? false}
                      onCheckedChange={(v) => updateSetting(`delivery.${opt.key}Enabled`, v)}
                    />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs font-medium">Charge (₹)</label>
                      <Input
                        type="number"
                        value={(settings.delivery as any)?.[`${opt.key}Charge`] ?? 0}
                        onChange={(e) => updateSetting(`delivery.${opt.key}Charge`, parseInt(e.target.value) || 0)}
                      />
                    </div>
                    {['sameDay', 'midnight'].includes(opt.key) && (
                      <div>
                        <label className="text-xs font-medium">Cutoff Time</label>
                        <Input
                          type="time"
                          value={(settings.delivery as any)?.[`${opt.key}Cutoff`] ?? ''}
                          onChange={(e) => updateSetting(`delivery.${opt.key}Cutoff`, e.target.value)}
                        />
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        {/* ============ BANNERS ============ */}
        <TabsContent value="banners" className="space-y-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Valentine Banners</CardTitle>
                <CardDescription>Banners for homepage integration when Valentine mode is ON</CardDescription>
              </div>
              <Button
                size="sm"
                onClick={() => {
                  const banners = [...(settings.banners || [])];
                  banners.push({
                    id: `vb-${Date.now()}`,
                    title: 'New Banner',
                    subtitle: '',
                    image: '',
                    link: '/valentine-special',
                    position: 'hero',
                    enabled: true,
                    order: banners.length,
                  } as any);
                  updateSetting('banners', banners);
                }}
              >
                <Plus className="w-4 h-4 mr-1" /> Add Banner
              </Button>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {settings.banners?.map((banner, index) => (
                  <div key={banner.id} className="p-3 rounded-xl border bg-card space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">{banner.title}</span>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-muted">{banner.position}</span>
                        <Switch
                          checked={banner.enabled}
                          onCheckedChange={(v) => {
                            const banners = [...settings.banners];
                            banners[index] = { ...banners[index], enabled: v };
                            updateSetting('banners', banners);
                          }}
                        />
                        <Button size="icon" variant="ghost" className="h-7 w-7 text-destructive" onClick={() => {
                          updateSetting('banners', settings.banners.filter((_, i) => i !== index));
                        }}>
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                      <Input placeholder="Title" value={banner.title} onChange={(e) => {
                        const banners = [...settings.banners]; banners[index] = { ...banners[index], title: e.target.value }; updateSetting('banners', banners);
                      }} />
                      <Input placeholder="Subtitle" value={banner.subtitle} onChange={(e) => {
                        const banners = [...settings.banners]; banners[index] = { ...banners[index], subtitle: e.target.value }; updateSetting('banners', banners);
                      }} />
                      <Input placeholder="Link" value={banner.link} onChange={(e) => {
                        const banners = [...settings.banners]; banners[index] = { ...banners[index], link: e.target.value }; updateSetting('banners', banners);
                      }} />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ============ SEO ============ */}
        <TabsContent value="seo" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>SEO Settings</CardTitle>
              <CardDescription>Optimize the Valentine's page for search engines</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-1 block">Meta Title</label>
                <Input value={settings.seo?.metaTitle || ''} onChange={(e) => updateSetting('seo.metaTitle', e.target.value)} />
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">Meta Description</label>
                <textarea
                  className="flex w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                  rows={3}
                  value={settings.seo?.metaDescription || ''}
                  onChange={(e) => updateSetting('seo.metaDescription', e.target.value)}
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">Keywords (comma-separated)</label>
                <Input
                  value={settings.seo?.keywords?.join(', ') || ''}
                  onChange={(e) => updateSetting('seo.keywords', e.target.value.split(',').map(k => k.trim()))}
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">OG Image URL</label>
                <Input value={settings.seo?.ogImage || ''} onChange={(e) => updateSetting('seo.ogImage', e.target.value)} />
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">Canonical URL</label>
                <Input value={settings.seo?.canonicalUrl || ''} onChange={(e) => updateSetting('seo.canonicalUrl', e.target.value)} />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ============ MOBILE NAVIGATION ============ */}
        <TabsContent value="mobilenav" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Mobile Navigation Settings</CardTitle>
              <CardDescription>Configure the premium mobile bottom navigation layout and style</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* SBF Button Configuration */}
              <div className="p-4 rounded-xl border bg-card space-y-4">
                <h3 className="font-semibold text-base flex items-center gap-2">
                  <Settings className="w-4 h-4 text-primary" />
                  SBF Button Config
                </h3>
                <div className="flex items-center justify-between p-2 rounded-lg bg-muted/30">
                  <div className="space-y-0.5">
                    <span className="text-sm font-medium block">Show SBF Brand Button</span>
                    <span className="text-xs text-muted-foreground">Always visible brand monogram item at the start of navigation</span>
                  </div>
                  <Switch
                    checked={settings.mobileNavigation?.showSbfButton ?? true}
                    onCheckedChange={(v) => updateSetting('mobileNavigation.showSbfButton', v)}
                  />
                </div>
                {settings.mobileNavigation?.showSbfButton !== false && (
                  <div>
                    <label className="text-sm font-medium mb-1 block">SBF Button Label</label>
                    <Input
                      placeholder="SBF"
                      value={settings.mobileNavigation?.sbfLabel || ''}
                      onChange={(e) => updateSetting('mobileNavigation.sbfLabel', e.target.value)}
                    />
                  </div>
                )}
              </div>

              {/* Floating Valentine Center Button Configuration */}
              <div className="p-4 rounded-xl border bg-card space-y-4">
                <h3 className="font-semibold text-base flex items-center gap-2">
                  <Heart className="w-4 h-4 text-rose-500" fill="currentColor" />
                  Floating Valentine Button Config
                </h3>
                <div className="flex items-center justify-between p-2 rounded-lg bg-muted/30">
                  <div className="space-y-0.5">
                    <span className="text-sm font-medium block">Enable Floating Valentine Button</span>
                    <span className="text-xs text-muted-foreground">Display elevated floating campaign button in center slot</span>
                  </div>
                  <Switch
                    checked={settings.mobileNavigation?.enableValentineButton ?? true}
                    onCheckedChange={(v) => updateSetting('mobileNavigation.enableValentineButton', v)}
                  />
                </div>
                
                {settings.mobileNavigation?.enableValentineButton !== false && (
                  <div className="space-y-4 pt-2">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium mb-1.5 block">Valentine Center Icon</label>
                        <select
                          className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring text-foreground"
                          value={settings.mobileNavigation?.valentineIcon || 'heart'}
                          onChange={(e) => updateSetting('mobileNavigation.valentineIcon', e.target.value)}
                        >
                          <option value="heart" className="text-black bg-white">❤️ Heart</option>
                          <option value="rose" className="text-black bg-white">🌹 Rose</option>
                          <option value="gift" className="text-black bg-white">🎁 Gift</option>
                        </select>
                      </div>

                      <div>
                        <label className="text-sm font-medium mb-1.5 block">Button Main Color</label>
                        <div className="flex gap-2">
                          <Input
                            type="color"
                            className="w-10 h-9 p-1 cursor-pointer"
                            value={settings.mobileNavigation?.valentineButtonColor || '#FF2E78'}
                            onChange={(e) => updateSetting('mobileNavigation.valentineButtonColor', e.target.value)}
                          />
                          <Input
                            type="text"
                            placeholder="#FF2E78"
                            className="flex-1"
                            value={settings.mobileNavigation?.valentineButtonColor || ''}
                            onChange={(e) => updateSetting('mobileNavigation.valentineButtonColor', e.target.value)}
                          />
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium mb-1.5 block">Glow Intensity</label>
                        <select
                          className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring text-foreground"
                          value={settings.mobileNavigation?.glowIntensity || 'medium'}
                          onChange={(e) => updateSetting('mobileNavigation.glowIntensity', e.target.value)}
                        >
                          <option value="low" className="text-black bg-white">Low Glow</option>
                          <option value="medium" className="text-black bg-white">Medium Glow</option>
                          <option value="high" className="text-black bg-white">High Glow</option>
                        </select>
                      </div>

                      <div>
                        <label className="text-sm font-medium mb-1.5 block">Navbar Background Style</label>
                        <select
                          className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring text-foreground"
                          value={settings.mobileNavigation?.navbarBackgroundStyle || 'glassmorphism'}
                          onChange={(e) => updateSetting('mobileNavigation.navbarBackgroundStyle', e.target.value)}
                        >
                          <option value="glassmorphism" className="text-black bg-white">Frosted Glassmorphism</option>
                          <option value="solid" className="text-black bg-white">Solid Background</option>
                        </select>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
                      <div className="flex items-center justify-between p-2 rounded-lg border bg-muted/10">
                        <span className="text-xs font-medium">Floating Motion</span>
                        <Switch
                          checked={settings.mobileNavigation?.enableFloatingAnimation ?? true}
                          onCheckedChange={(v) => updateSetting('mobileNavigation.enableFloatingAnimation', v)}
                        />
                      </div>
                      <div className="flex items-center justify-between p-2 rounded-lg border bg-muted/10">
                        <span className="text-xs font-medium">Heart Particles</span>
                        <Switch
                          checked={settings.mobileNavigation?.enableHeartParticles ?? true}
                          onCheckedChange={(v) => updateSetting('mobileNavigation.enableHeartParticles', v)}
                        />
                      </div>
                      <div className="flex items-center justify-between p-2 rounded-lg border bg-muted/10">
                        <span className="text-xs font-medium">Seasonal Theme</span>
                        <Switch
                          checked={settings.mobileNavigation?.enableSeasonalTheme ?? true}
                          onCheckedChange={(v) => updateSetting('mobileNavigation.enableSeasonalTheme', v)}
                        />
                      </div>
                    </div>
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

export default ValentineManagement;
