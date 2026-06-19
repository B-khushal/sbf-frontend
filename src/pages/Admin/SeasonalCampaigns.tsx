import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { useCurrency } from '@/contexts/CurrencyContext';
import { useSeasonalCampaign } from '@/contexts/SeasonalCampaignContext';
import { Plus, Edit, BarChart3, Trash2, Calendar, Settings, AlertTriangle, X, Sparkles } from 'lucide-react';
import seasonalCampaignService from '@/services/seasonalCampaignService';
import { SeasonalCampaign } from '@/types/seasonalCampaign';

const SeasonalCampaigns: React.FC = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { formatPrice, convertPrice } = useCurrency();
  const { campaigns, loading, refetchAdmin, refetch } = useSeasonalCampaign();

  // Create new occasion modal states
  const [showAddModal, setShowAddModal] = useState(false);
  const [newCampaign, setNewCampaign] = useState({
    name: '',
    slug: '',
    icon: '🎉',
    primaryColor: '#4f46e5',
    startDate: '',
    endDate: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    refetchAdmin();
  }, [refetchAdmin]);

  const handleToggle = async (id: string, currentStatus: boolean) => {
    try {
      const res = await seasonalCampaignService.adminUpdateCampaign(id, { enabled: !currentStatus });
      if (res.success) {
        toast({
          title: "Success",
          description: `${res.campaign.name} campaign is now ${res.campaign.enabled ? 'ENABLED' : 'DISABLED'}.`,
        });
        refetchAdmin();
        refetch(); // Refetch public list
      }
    } catch (error: any) {
      console.error('Error toggling campaign status:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: error.response?.data?.message || "Failed to toggle campaign status",
      });
    }
  };

  const handleDelete = async (id: string, name: string) => {
    const confirmDelete = window.confirm(`Are you sure you want to delete the campaign "${name}"? This will also unassign all its products.`);
    if (!confirmDelete) return;

    try {
      const res = await seasonalCampaignService.adminDeleteCampaign(id);
      if (res.success) {
        toast({
          title: "Deleted",
          description: `Campaign "${name}" has been deleted.`,
        });
        refetchAdmin();
        refetch();
      }
    } catch (error: any) {
      console.error('Error deleting campaign:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to delete campaign",
      });
    }
  };

  const handleAddCampaign = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCampaign.name || !newCampaign.slug) {
      toast({
        variant: "destructive",
        title: "Missing Fields",
        description: "Occasion Name and URL Slug are required",
      });
      return;
    }

    try {
      setIsSubmitting(true);
      const payload: Partial<SeasonalCampaign> = {
        name: newCampaign.name,
        slug: newCampaign.slug,
        general: {
          campaignName: `${newCampaign.name} Specials`,
          startDate: newCampaign.startDate ? newCampaign.startDate : null,
          endDate: newCampaign.endDate ? newCampaign.endDate : null,
          countdownTargetDate: newCampaign.endDate ? newCampaign.endDate : null,
        },
        theme: {
          icon: newCampaign.icon,
          primaryColor: newCampaign.primaryColor,
          secondaryColor: `${newCampaign.primaryColor}30`, // default softer color
          accentColor: '#fbbf24',
          backgroundStyle: 'glassmorphism',
          backgroundGradient: `linear-gradient(135deg, ${newCampaign.primaryColor}10 0%, ${newCampaign.primaryColor}20 100%)`,
          animationStyle: 'none',
          typography: 'Inter',
          buttonStyle: 'rounded-xl',
          bannerStyle: 'premium'
        }
      };

      const res = await seasonalCampaignService.adminCreateCampaign(payload);
      if (res.success) {
        toast({
          title: "Created",
          description: `Occasion "${newCampaign.name}" added successfully.`,
        });
        setShowAddModal(false);
        setNewCampaign({
          name: '',
          slug: '',
          icon: '🎉',
          primaryColor: '#4f46e5',
          startDate: '',
          endDate: '',
        });
        refetchAdmin();
        refetch();
      }
    } catch (error: any) {
      console.error('Error creating campaign:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: error.response?.data?.message || "Failed to create occasion",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return 'Not set';
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Seasonal Campaigns</h1>
          <p className="text-muted-foreground">Manage centralized storefront configurations for all occasions (except Valentine's Week).</p>
        </div>
        <Button onClick={() => setShowAddModal(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Add New Occasion
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {campaigns.map((campaign) => {
          const hasDates = campaign.general?.startDate && campaign.general?.endDate;
          
          return (
            <Card key={campaign._id} className="overflow-hidden border border-gray-100 hover:shadow-lg transition-all duration-300">
              <CardHeader className="pb-4" style={{ borderTop: `4px solid ${campaign.theme?.primaryColor || '#4f46e5'}` }}>
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl" role="img" aria-label={campaign.name}>
                      {campaign.theme?.icon || '🎉'}
                    </span>
                    <div>
                      <CardTitle className="text-xl font-bold">{campaign.name}</CardTitle>
                      <CardDescription className="text-xs font-mono">/{campaign.slug}</CardDescription>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Switch
                      checked={campaign.enabled}
                      onCheckedChange={() => handleToggle(campaign._id!, campaign.enabled)}
                      className="data-[state=checked]:bg-emerald-600"
                    />
                    <Badge variant={campaign.enabled ? 'secondary' : 'outline'} className={campaign.enabled ? 'bg-emerald-50 text-emerald-700' : 'text-gray-400'}>
                      {campaign.enabled ? 'ON' : 'OFF'}
                    </Badge>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent className="space-y-4">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Calendar className="h-4 w-4 text-gray-400 flex-shrink-0" />
                  <span>
                    {hasDates 
                      ? `${formatDate(campaign.general.startDate)} – ${formatDate(campaign.general.endDate)}`
                      : 'Dates not configured'
                    }
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-4 py-2 border-y border-slate-50 text-center">
                  <div>
                    <span className="block text-xl font-bold text-gray-800">{campaign.productCount || 0}</span>
                    <span className="text-[10px] uppercase text-muted-foreground tracking-wider font-semibold">Products</span>
                  </div>
                  <div>
                    <span className="block text-xl font-bold text-gray-800">{campaign.ordersCount || 0}</span>
                    <span className="text-[10px] uppercase text-muted-foreground tracking-wider font-semibold">Orders</span>
                  </div>
                    <div>
                      <span className="block text-xl font-bold text-primary">
                        {formatPrice(convertPrice(campaign.revenue ?? campaign.analytics?.revenue ?? 0))}
                      </span>
                      <span className="text-[10px] uppercase text-muted-foreground tracking-wider font-semibold">Revenue</span>
                    </div>
                </div>

                <div className="flex justify-between items-center pt-2 gap-2">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="flex-1"
                    onClick={() => navigate(`/admin/seasonal-campaigns/edit/${campaign._id}`)}
                  >
                    <Settings className="mr-1 h-3.5 w-3.5" />
                    Configure
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-red-600 hover:text-red-700 border-red-100 hover:bg-red-50"
                    onClick={() => handleDelete(campaign._id!, campaign.name)}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Add New Occasion Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fadeIn">
          <Card className="w-full max-w-md border border-slate-100 shadow-2xl">
            <CardHeader className="bg-slate-50 border-b">
              <div className="flex justify-between items-center">
                <CardTitle className="text-xl flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-indigo-600" />
                  Add Seasonal Campaign
                </CardTitle>
                <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full" onClick={() => setShowAddModal(false)}>
                  <X className="h-4 w-4" />
                </Button>
              </div>
              <CardDescription>Create a separate, centralized campaign structure for a new occasion.</CardDescription>
            </CardHeader>
            <form onSubmit={handleAddCampaign}>
              <CardContent className="p-6 space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Occasion Name</Label>
                  <Input
                    id="name"
                    placeholder="e.g. Women's Day, Teacher's Day"
                    value={newCampaign.name}
                    onChange={(e) => {
                      const name = e.target.value;
                      const slug = name.trim().toLowerCase().replace(/[^a-z0-9-]/g, '-').replace(/-+/g, '-');
                      setNewCampaign(prev => ({ ...prev, name, slug }));
                    }}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="slug">URL Slug</Label>
                  <div className="flex items-center">
                    <span className="bg-slate-100 px-3 py-2 border border-r-0 rounded-l-md text-sm font-mono text-gray-500">/</span>
                    <Input
                      id="slug"
                      placeholder="e.g. womens-day"
                      value={newCampaign.slug}
                      onChange={(e) => setNewCampaign(prev => ({ ...prev, slug: e.target.value }))}
                      className="rounded-l-none font-mono"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="icon">Occasion Icon</Label>
                    <Input
                      id="icon"
                      placeholder="e.g. 🌸, 🪔, 🎄"
                      value={newCampaign.icon}
                      onChange={(e) => setNewCampaign(prev => ({ ...prev, icon: e.target.value }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="primaryColor">Theme Color</Label>
                    <div className="flex gap-2 items-center">
                      <Input
                        id="primaryColor"
                        type="color"
                        value={newCampaign.primaryColor}
                        onChange={(e) => setNewCampaign(prev => ({ ...prev, primaryColor: e.target.value }))}
                        className="h-10 w-12 p-1 cursor-pointer"
                      />
                      <Input
                        type="text"
                        value={newCampaign.primaryColor}
                        onChange={(e) => setNewCampaign(prev => ({ ...prev, primaryColor: e.target.value }))}
                        className="font-mono text-xs"
                      />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="startDate">Start Date</Label>
                    <Input
                      id="startDate"
                      type="date"
                      value={newCampaign.startDate}
                      onChange={(e) => setNewCampaign(prev => ({ ...prev, startDate: e.target.value }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="endDate">End Date</Label>
                    <Input
                      id="endDate"
                      type="date"
                      value={newCampaign.endDate}
                      onChange={(e) => setNewCampaign(prev => ({ ...prev, endDate: e.target.value }))}
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-2 border-t pt-4">
                  <Button variant="outline" type="button" onClick={() => setShowAddModal(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={isSubmitting} className="bg-indigo-600 hover:bg-indigo-700">
                    {isSubmitting ? 'Adding...' : 'Create Occasion'}
                  </Button>
                </div>
              </CardContent>
            </form>
          </Card>
        </div>
      )}
    </div>
  );
};

export default SeasonalCampaigns;
