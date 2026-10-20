import React, { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { format } from 'date-fns';
import { 
  CalendarIcon, Plus, Trash2, Power, Edit3, 
  BarChart3, Eye, Smartphone, Monitor, Sparkles, 
  Copy, Check, Gift, Heart, Flame, Snowflake, 
  Tag, Clock, Truck, Award, ShieldCheck, Flower2,
  AlertTriangle, TrendingUp, Info, X,
  Loader2, Upload, Cake, ShoppingBag, ArrowRight, Image as ImageIcon
} from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import api from '@/services/api';
import { ImageUpload } from '@/components/ui/ImageUpload';
import { uploadImage as uploadImageService } from '@/services/uploadService';

interface Variant {
  _id?: string;
  title: string;
  description: string;
  imageUrl?: string;
  mobileImageUrl?: string;
  discountPercent: number;
  code: string;
  buttonText: string;
  buttonLink: string;
  background: string;
  textColor: string;
  badgeText: string;
  theme: string;
  impressions?: number;
  closes?: number;
  ctaClicks?: number;
  couponCopies?: number;
  conversions?: number;
}

interface Offer {
  _id: string;
  title: string;
  description: string;
  subtitle?: string;
  imageUrl?: string;
  mobileImageUrl?: string;
  background: string;
  textColor: string;
  buttonText: string;
  buttonLink: string;
  secondaryCtaText?: string;
  secondaryCtaLink?: string;
  startDate: string;
  endDate: string;
  isActive: boolean;
  showOnlyOnce: boolean;
  showCountdown: boolean;
  discountPercent: number;
  code?: string;
  badgeText?: string;
  theme: 'festive' | 'sale' | 'holiday' | 'general' | 'rakhi' | 'valentines' | 'mothersday' | 'fathersday' | 'diwali' | 'christmas' | 'newyear';
  triggerType: 'timeDelay' | 'scroll' | 'exitIntent' | 'immediately' | 'combined';
  triggerDelay: number;
  triggerScrollPercent: number;
  frequencyCap: 'always' | 'oncePerSession' | 'oncePerDay' | 'oncePerWeek' | 'oncePerMonth' | 'onceEver';
  deviceTargeting: 'desktop' | 'mobile' | 'both';
  isABTesting: boolean;
  variants: Variant[];
  impressions: number;
  closes: number;
  ctaClicks: number;
  couponCopies: number;
  conversions: number;
}

const gradientOptions = [
  { name: 'Sunrise (Crimson/Gold)', value: 'linear-gradient(to right, #ff9966, #ff5e62)' },
  { name: 'Ocean (Teal/Blue)', value: 'linear-gradient(to right, #43cea2, #185a9d)' },
  { name: 'Peachy (Coral)', value: 'linear-gradient(to right, #ffecd2, #fcb69f)' },
  { name: 'Royal Plum (Purple/Crimson)', value: 'linear-gradient(135deg, rgba(88, 28, 135, 0.95) 0%, rgba(180, 83, 9, 0.9) 100%)' },
  { name: 'Sweet Heart (Rose/Pink)', value: 'linear-gradient(135deg, rgba(144, 12, 63, 0.95) 0%, rgba(225, 29, 72, 0.85) 100%)' },
  { name: 'Midnight Glow (Navy/Gold)', value: 'linear-gradient(135deg, rgba(30, 27, 75, 0.95) 0%, rgba(146, 64, 14, 0.85) 100%)' },
  { name: 'Forest Emerald (Green/Gold)', value: 'linear-gradient(135deg, rgba(20, 83, 45, 0.95) 0%, rgba(16, 185, 129, 0.85) 100%)' },
  { name: 'General Gold (Carbon/Amber)', value: 'linear-gradient(135deg, rgba(15, 23, 42, 0.95) 0%, rgba(225, 29, 72, 0.8) 100%)' },
  { name: 'Pure White (Glassmorphism)', value: '#ffffff' }
];

const festivalTemplates = {
  cakes_launch: {
    title: 'Introducing Our New Artisanal Cakes 🎂',
    subtitle: 'Freshly Baked • Decadent Flavors Just Arrived',
    description: 'Explore our latest collection of oven-fresh gourmet celebration cakes, velvety cheesecakes, and custom confectioneries, hand-baked daily with premium ingredients.',
    discountPercent: 0,
    code: '',
    theme: 'general',
    badgeText: 'New Cake Launch 🎂',
    background: 'linear-gradient(135deg, rgba(88, 28, 135, 0.95) 0%, rgba(225, 29, 72, 0.85) 100%)',
    textColor: '#ffffff',
    buttonText: 'Explore New Cakes',
    buttonLink: '/category/cakes',
    secondaryCtaText: 'Maybe Later',
    showCountdown: false
  },
  combos_launch: {
    title: 'Newly Launched Combos & Hampers 🎁',
    subtitle: 'Flowers, Fresh Cakes & Gourmet Delights',
    description: 'Celebrate your special moments with our newly launched luxury combos — artisanal cakes paired with fresh hand-tied bouquets, chocolates, and personalized gifts.',
    discountPercent: 0,
    code: '',
    theme: 'general',
    badgeText: 'New Combos Launch ✨',
    background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.95) 0%, rgba(217, 119, 6, 0.85) 100%)',
    textColor: '#ffffff',
    buttonText: 'Explore New Combos',
    buttonLink: '/category/combos',
    secondaryCtaText: 'Remind Me Later',
    showCountdown: false
  },
  cakes_combos_launch: {
    title: 'New Launches: Gourmet Cakes & Combos ✨',
    subtitle: 'Exquisite Flavors & Floral Celebrations',
    description: 'Be the first to experience our newly unveiled handcrafted cakes and signature celebration combo boxes. Delivered same-day across Hyderabad.',
    discountPercent: 0,
    code: '',
    theme: 'general',
    badgeText: 'New Launches 🎂🎁',
    background: 'linear-gradient(135deg, rgba(30, 27, 75, 0.95) 0%, rgba(146, 64, 14, 0.85) 100%)',
    textColor: '#ffffff',
    buttonText: 'Discover New Launches',
    buttonLink: '/category/cakes',
    secondaryCtaText: 'Close',
    showCountdown: false
  },
  rakhi: {
    title: 'Happy Raksha Bandhan',
    subtitle: 'Celebrate the bond of love',
    description: 'Enjoy FLAT 10% OFF on all Rakhi special bouquets, rakhi combos, and sweets. Send love today.',
    discountPercent: 10,
    code: 'RAKHI10',
    theme: 'rakhi',
    badgeText: 'Seasonal Special',
    background: 'linear-gradient(135deg, rgba(88, 28, 135, 0.95) 0%, rgba(180, 83, 9, 0.9) 100%)',
    textColor: '#ffffff',
    buttonText: 'Explore Rakhi Collection',
    buttonLink: '/category/rakhi',
    secondaryCtaText: 'Remind Me Later',
    showCountdown: true
  },
  valentines: {
    title: 'Happy Valentine\'s Day',
    subtitle: 'Express your love with blooms',
    description: 'FLAT 15% OFF on premium Red Rose arrangements, heart chocolate boxes, and romantic hampers.',
    discountPercent: 15,
    code: 'VALENTINE15',
    theme: 'valentines',
    badgeText: 'Limited Time Offer',
    background: 'linear-gradient(135deg, rgba(144, 12, 63, 0.95) 0%, rgba(225, 29, 72, 0.85) 100%)',
    textColor: '#ffffff',
    buttonText: 'Send Love Today',
    buttonLink: '/category/valentines',
    secondaryCtaText: 'Remind Me Later',
    showCountdown: true
  },
  diwali: {
    title: 'Diwali Festive Lights',
    subtitle: 'Share the glow of premium hampers',
    description: 'Enjoy FLAT 12% OFF on all gourmet hampers, dry fruit arrangements, and marigold combinations.',
    discountPercent: 12,
    code: 'DIWALI12',
    theme: 'diwali',
    badgeText: 'Exclusive Discount',
    background: 'linear-gradient(135deg, rgba(30, 27, 75, 0.95) 0%, rgba(146, 64, 14, 0.85) 100%)',
    textColor: '#ffffff',
    buttonText: 'Explore Diwali Hampers',
    buttonLink: '/category/diwali',
    secondaryCtaText: 'Skip for Now',
    showCountdown: true
  },
  christmas: {
    title: 'Merry Christmas Specials',
    subtitle: 'Spread holiday cheer and warmth',
    description: 'Get FLAT 10% OFF on Christmas pine wreathes, plum cakes, and holiday table setups.',
    discountPercent: 10,
    code: 'XMAS10',
    theme: 'christmas',
    badgeText: 'Holiday Special',
    background: 'linear-gradient(135deg, rgba(20, 83, 45, 0.95) 0%, rgba(185, 28, 28, 0.85) 100%)',
    textColor: '#ffffff',
    buttonText: 'Shop Christmas Gifts',
    buttonLink: '/category/christmas',
    secondaryCtaText: 'Close',
    showCountdown: true
  },
  newyear: {
    title: 'Happy New Year 2027',
    subtitle: 'Fresh blossoms for fresh beginnings',
    description: 'Enjoy FLAT 15% OFF sitewide on fresh bouquets and floral baskets to kick off a bright new year.',
    discountPercent: 15,
    code: 'NEWYEAR15',
    theme: 'newyear',
    badgeText: 'New Year Special',
    background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.95) 0%, rgba(30, 41, 59, 0.9) 100%)',
    textColor: '#ffffff',
    buttonText: 'Explore New Collections',
    buttonLink: '/shop',
    secondaryCtaText: 'Remind Me Later',
    showCountdown: true
  },
  mothersday: {
    title: 'Happy Mother\'s Day',
    subtitle: 'For the queen of your heart',
    description: 'Save 10% on Mother\'s Day Carnations, Lilies, and personalized greeting cards.',
    discountPercent: 10,
    code: 'MOTHERS10',
    theme: 'mothersday',
    badgeText: 'Celebrate Mom',
    background: 'linear-gradient(135deg, rgba(109, 40, 217, 0.85) 0%, rgba(219, 39, 119, 0.8) 100%)',
    textColor: '#ffffff',
    buttonText: 'Send Flowers to Mom',
    buttonLink: '/category/mothersday',
    secondaryCtaText: 'Remind Me Later',
    showCountdown: true
  }
};

const festivalThemes: Record<string, { gradient: string }> = {
  valentines: { gradient: 'linear-gradient(135deg, rgba(144, 12, 63, 0.9) 0%, rgba(225, 29, 72, 0.8) 100%)' },
  rakhi: { gradient: 'linear-gradient(135deg, rgba(88, 28, 135, 0.9) 0%, rgba(180, 83, 9, 0.8) 100%)' },
  diwali: { gradient: 'linear-gradient(135deg, rgba(30, 27, 75, 0.9) 0%, rgba(146, 64, 14, 0.8) 100%)' },
  christmas: { gradient: 'linear-gradient(135deg, rgba(20, 83, 45, 0.9) 0%, rgba(185, 28, 28, 0.8) 100%)' },
  newyear: { gradient: 'linear-gradient(135deg, rgba(15, 23, 42, 0.95) 0%, rgba(30, 41, 59, 0.9) 100%)' },
  mothersday: { gradient: 'linear-gradient(135deg, rgba(109, 40, 217, 0.85) 0%, rgba(219, 39, 119, 0.8) 100%)' },
  fathersday: { gradient: 'linear-gradient(135deg, rgba(15, 23, 42, 0.9) 0%, rgba(29, 78, 216, 0.85) 100%)' },
  sale: { gradient: 'linear-gradient(135deg, rgba(49, 46, 129, 0.9) 0%, rgba(109, 40, 217, 0.8) 100%)' },
  holiday: { gradient: 'linear-gradient(135deg, rgba(6, 78, 59, 0.9) 0%, rgba(16, 185, 129, 0.8) 100%)' },
  general: { gradient: 'linear-gradient(135deg, rgba(15, 23, 42, 0.9) 0%, rgba(225, 29, 72, 0.75) 100%)' }
};

const OffersManager = () => {
  const { toast } = useToast();
  const [offers, setOffers] = useState<Offer[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [activeTab, setActiveTab] = useState<'general' | 'design' | 'triggers' | 'ab'>('general');
  const [previewDevice, setPreviewDevice] = useState<'desktop' | 'mobile'>('desktop');
  const [previewCopied, setPreviewCopied] = useState(false);
  const [previewDismissed, setPreviewDismissed] = useState(false);
  const [selectedOfferForAnalytics, setSelectedOfferForAnalytics] = useState<Offer | null>(null);

  // Form states
  const [currentOffer, setCurrentOffer] = useState<Partial<Offer>>({
    theme: 'general',
    background: 'linear-gradient(135deg, rgba(88, 28, 135, 0.95) 0%, rgba(225, 29, 72, 0.85) 100%)',
    textColor: '#ffffff',
    buttonText: 'Explore New Cakes',
    buttonLink: '/category/cakes',
    secondaryCtaText: 'Maybe Later',
    showOnlyOnce: false,
    showCountdown: false,
    discountPercent: 0,
    badgeText: 'New Launch 🎂',
    triggerType: 'combined',
    triggerDelay: 4,
    triggerScrollPercent: 25,
    frequencyCap: 'oncePerSession',
    deviceTargeting: 'both',
    isABTesting: false,
    variants: []
  });
  
  const [desktopFile, setDesktopFile] = useState<File | null>(null);
  const [mobileFile, setMobileFile] = useState<File | null>(null);
  const [isUploadingDesktop, setIsUploadingDesktop] = useState(false);
  const [isUploadingMobile, setIsUploadingMobile] = useState(false);
  const [isUploadingVariantDesktop, setIsUploadingVariantDesktop] = useState(false);
  const [isUploadingVariantMobile, setIsUploadingVariantMobile] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [popupPurpose, setPopupPurpose] = useState<'launch' | 'discount'>('launch');

  // A/B test editing states
  const [editingVariantIndex, setEditingVariantIndex] = useState<number | null>(null);
  const [variantForm, setVariantForm] = useState<Variant>({
    title: '',
    description: '',
    discountPercent: 0,
    code: '',
    buttonText: 'Explore Collection',
    buttonLink: '/category/cakes',
    background: 'linear-gradient(135deg, rgba(88, 28, 135, 0.95) 0%, rgba(225, 29, 72, 0.85) 100%)',
    textColor: '#ffffff',
    badgeText: 'New Launch Special',
    theme: 'general'
  });
  const [variantDesktopFile, setVariantDesktopFile] = useState<File | null>(null);
  const [variantMobileFile, setVariantMobileFile] = useState<File | null>(null);

  const fetchOffers = async () => {
    try {
      setIsLoading(true);
      const { data } = await api.get('/offers/all');
      setOffers(data);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to fetch offers',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchOffers();
  }, []);

  // Pre-fill template
  const handleApplyTemplate = (tempKey: keyof typeof festivalTemplates) => {
    const template = festivalTemplates[tempKey];
    if (template) {
      const isLaunch = tempKey.includes('launch') || template.discountPercent === 0;
      setPopupPurpose(isLaunch ? 'launch' : 'discount');
      setCurrentOffer(prev => ({
        ...prev,
        ...(template as any)
      }));
      toast({
        title: 'Template Applied',
        description: `Applied ${tempKey.replace(/_/g, ' ').toUpperCase()} preset values`
      });
    }
  };

  // Immediate reactive upload helper
  const handleUploadImage = async (file: File, target: 'desktop' | 'mobile' | 'variantDesktop' | 'variantMobile') => {
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast({
        title: 'Invalid File',
        description: 'Please select a valid image file (JPEG, PNG, WebP)',
        variant: 'destructive'
      });
      return;
    }

    if (file.size > 25 * 1024 * 1024) {
      toast({
        title: 'File Too Large',
        description: 'Image file size must be less than 25MB',
        variant: 'destructive'
      });
      return;
    }

    const localPreview = URL.createObjectURL(file);

    if (target === 'desktop') {
      setIsUploadingDesktop(true);
      setCurrentOffer(prev => ({ ...prev, imageUrl: localPreview, image: localPreview }));
    } else if (target === 'mobile') {
      setIsUploadingMobile(true);
      setCurrentOffer(prev => ({ ...prev, mobileImageUrl: localPreview }));
    } else if (target === 'variantDesktop') {
      setIsUploadingVariantDesktop(true);
      setVariantForm(prev => ({ ...prev, imageUrl: localPreview }));
    } else if (target === 'variantMobile') {
      setIsUploadingVariantMobile(true);
      setVariantForm(prev => ({ ...prev, mobileImageUrl: localPreview }));
    }

    try {
      const formData = new FormData();
      formData.append('image', file);
      const res = await uploadImageService(formData, 'offer');

      if (res && res.imageUrl) {
        if (target === 'desktop') {
          setCurrentOffer(prev => ({ ...prev, imageUrl: res.imageUrl, image: res.imageUrl }));
          setDesktopFile(null);
        } else if (target === 'mobile') {
          setCurrentOffer(prev => ({ ...prev, mobileImageUrl: res.imageUrl }));
          setMobileFile(null);
        } else if (target === 'variantDesktop') {
          setVariantForm(prev => ({ ...prev, imageUrl: res.imageUrl }));
          setVariantDesktopFile(null);
        } else if (target === 'variantMobile') {
          setVariantForm(prev => ({ ...prev, mobileImageUrl: res.imageUrl }));
          setVariantMobileFile(null);
        }

        toast({
          title: 'Image Uploaded',
          description: 'Image uploaded and synchronized with live preview!'
        });
      } else {
        throw new Error('Upload response did not include an image URL');
      }
    } catch (error: any) {
      console.error('Image upload failed:', error);
      toast({
        title: 'Upload Failed',
        description: error.response?.data?.message || error.message || 'Failed to upload image. You can also paste an image URL directly.',
        variant: 'destructive'
      });
    } finally {
      if (target === 'desktop') setIsUploadingDesktop(false);
      else if (target === 'mobile') setIsUploadingMobile(false);
      else if (target === 'variantDesktop') setIsUploadingVariantDesktop(false);
      else if (target === 'variantMobile') setIsUploadingVariantMobile(false);
    }
  };

  // Submit Handler
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentOffer.title?.trim() || !currentOffer.description?.trim()) {
      toast({
        title: 'Missing Required Fields',
        description: 'Please provide both Campaign Title and Description',
        variant: 'destructive'
      });
      return;
    }

    setIsSaving(true);
    try {
      let imageUrl = currentOffer.imageUrl;
      let mobileImageUrl = currentOffer.mobileImageUrl;

      // Handle any pending file upload fallback
      if (desktopFile && (!imageUrl || imageUrl.startsWith('blob:'))) {
        const formData = new FormData();
        formData.append('image', desktopFile);
        const res = await uploadImageService(formData, 'offer');
        imageUrl = res.imageUrl;
      }
      if (mobileFile && (!mobileImageUrl || mobileImageUrl.startsWith('blob:'))) {
        const formData = new FormData();
        formData.append('image', mobileFile);
        const res = await uploadImageService(formData, 'offer');
        mobileImageUrl = res.imageUrl;
      }

      // Default dates if missing
      const startDate = currentOffer.startDate || new Date().toISOString();
      const endDate = currentOffer.endDate || new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString();

      const offerData = {
        ...currentOffer,
        title: currentOffer.title.trim(),
        description: currentOffer.description.trim(),
        subtitle: currentOffer.subtitle?.trim() || null,
        startDate,
        endDate,
        imageUrl: imageUrl || null,
        mobileImageUrl: mobileImageUrl || null,
        discountPercent: currentOffer.discountPercent !== undefined && currentOffer.discountPercent !== null 
          ? Number(currentOffer.discountPercent) 
          : 0,
        code: currentOffer.code ? currentOffer.code.trim().toUpperCase() : null,
        badgeText: currentOffer.badgeText?.trim() || (currentOffer.discountPercent && currentOffer.discountPercent > 0 ? `${currentOffer.discountPercent}% OFF` : 'NEW LAUNCH 🎂'),
        buttonText: currentOffer.buttonText?.trim() || 'Explore Collection',
        buttonLink: currentOffer.buttonLink?.trim() || '/category/cakes',
      };

      if (isEditing && currentOffer._id) {
        await api.put(`/offers/${currentOffer._id}`, offerData);
      } else {
        await api.post('/offers', offerData);
      }

      toast({
        title: 'Success',
        description: `Campaign popup ${isEditing ? 'updated' : 'created'} successfully`
      });

      // Clear Form states
      resetForm();
      fetchOffers();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to save campaign popup',
        variant: 'destructive'
      });
    } finally {
      setIsSaving(false);
    }
  };

  const resetForm = () => {
    setCurrentOffer({
      theme: 'general',
      background: 'linear-gradient(135deg, rgba(88, 28, 135, 0.95) 0%, rgba(225, 29, 72, 0.85) 100%)',
      textColor: '#ffffff',
      buttonText: 'Explore New Cakes',
      buttonLink: '/category/cakes',
      secondaryCtaText: 'Maybe Later',
      showOnlyOnce: false,
      showCountdown: false,
      discountPercent: 0,
      badgeText: 'New Launch 🎂',
      triggerType: 'combined',
      triggerDelay: 4,
      triggerScrollPercent: 25,
      frequencyCap: 'oncePerSession',
      deviceTargeting: 'both',
      isABTesting: false,
      variants: []
    });
    setDesktopFile(null);
    setMobileFile(null);
    setIsUploadingDesktop(false);
    setIsUploadingMobile(false);
    setIsUploadingVariantDesktop(false);
    setIsUploadingVariantMobile(false);
    setIsSaving(false);
    setPopupPurpose('launch');
    setIsEditing(false);
    setShowForm(false);
    setActiveTab('general');
  };

  // Toggle Offer Status
  const toggleOfferStatus = async (offerId: string) => {
    try {
      await api.patch(`/offers/${offerId}/toggle`);
      fetchOffers();
      toast({
        title: 'Success',
        description: 'Popup campaign status updated'
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update campaign status',
        variant: 'destructive'
      });
    }
  };

  // Delete Offer
  const deleteOffer = async (offerId: string) => {
    if (!window.confirm('Are you sure you want to delete this premium campaign? All analytics data will be lost.')) return;

    try {
      await api.delete(`/offers/${offerId}`);
      fetchOffers();
      if (selectedOfferForAnalytics?._id === offerId) {
        setSelectedOfferForAnalytics(null);
      }
      toast({
        title: 'Success',
        description: 'Popup campaign deleted successfully'
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to delete campaign',
        variant: 'destructive'
      });
    }
  };

  // Add / Save A/B testing Variant in Form local state
  const handleSaveVariant = async (e: React.MouseEvent) => {
    e.preventDefault();
    if (!variantForm.title || !variantForm.description || !variantForm.buttonLink) {
      toast({
        title: 'Warning',
        description: 'Please prefill Title, Description, and Link fields for the variant',
        variant: 'destructive'
      });
      return;
    }

    try {
      let imageUrl = variantForm.imageUrl;
      let mobileImageUrl = variantForm.mobileImageUrl;

      if (variantDesktopFile) {
        imageUrl = await uploadImageHelper(variantDesktopFile);
      }
      if (variantMobileFile) {
        mobileImageUrl = await uploadImageHelper(variantMobileFile);
      }

      const updatedVariant: Variant = {
        ...variantForm,
        imageUrl,
        mobileImageUrl
      };

      const currentVariants = [...(currentOffer.variants || [])];
      
      if (editingVariantIndex !== null) {
        currentVariants[editingVariantIndex] = updatedVariant;
        setEditingVariantIndex(null);
      } else {
        currentVariants.push(updatedVariant);
      }

      setCurrentOffer(prev => ({
        ...prev,
        variants: currentVariants
      }));

      // Reset variant form
      setVariantForm({
        title: '',
        description: '',
        discountPercent: 10,
        code: '',
        buttonText: 'Claim Offer',
        buttonLink: '/shop',
        background: 'linear-gradient(to right, #ff9966, #ff5e62)',
        textColor: '#ffffff',
        badgeText: 'Variant Special',
        theme: 'general'
      });
      setVariantDesktopFile(null);
      setVariantMobileFile(null);

      toast({
        title: 'Success',
        description: 'A/B testing variant added'
      });
    } catch (err) {
      toast({
        title: 'Error',
        description: 'Failed to upload variant images',
        variant: 'destructive'
      });
    }
  };

  const handleEditVariant = (idx: number) => {
    const variant = (currentOffer.variants || [])[idx];
    if (variant) {
      setVariantForm(variant);
      setEditingVariantIndex(idx);
    }
  };

  const handleDeleteVariant = (idx: number) => {
    const currentVariants = [...(currentOffer.variants || [])];
    currentVariants.splice(idx, 1);
    setCurrentOffer(prev => ({
      ...prev,
      variants: currentVariants
    }));
    if (editingVariantIndex === idx) {
      setEditingVariantIndex(null);
    }
  };

  // Pre-calculate CTR / Conversion Rate
  const calcRate = (num: number, denom: number) => {
    if (!denom || denom === 0) return '0.0%';
    return `${((num / denom) * 100).toFixed(1)}%`;
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-8 min-h-screen text-slate-100 bg-[#0b0f19]">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 pb-6 border-b border-slate-800">
        <div>
          <h1 className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-yellow-200">
            Campaign Popup Manager
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Redesign, deploy, test, and analyze luxury promotional overlays.
          </p>
        </div>

        <div className="flex gap-3">
          {selectedOfferForAnalytics && (
            <Button
              variant="outline"
              onClick={() => setSelectedOfferForAnalytics(null)}
              className="border-slate-800 text-slate-300 bg-slate-900/50 hover:bg-slate-800"
            >
              Back to List
            </Button>
          )}

          {!showForm && !selectedOfferForAnalytics && (
            <Button 
              onClick={() => {
                setIsEditing(false);
                setShowForm(true);
                setPopupPurpose('launch');
                setCurrentOffer({
                  theme: 'general',
                  background: 'linear-gradient(135deg, rgba(88, 28, 135, 0.95) 0%, rgba(225, 29, 72, 0.85) 100%)',
                  textColor: '#ffffff',
                  buttonText: 'Explore New Cakes',
                  buttonLink: '/category/cakes',
                  secondaryCtaText: 'Maybe Later',
                  showOnlyOnce: false,
                  showCountdown: false,
                  discountPercent: 0,
                  badgeText: 'New Launch 🎂',
                  triggerType: 'combined',
                  triggerDelay: 4,
                  triggerScrollPercent: 25,
                  frequencyCap: 'oncePerSession',
                  deviceTargeting: 'both',
                  isABTesting: false,
                  variants: []
                });
              }}
              className="bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold transition-all px-5 py-2.5 rounded-xl shadow-[0_4px_20px_rgba(245,158,11,0.2)]"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Campaign Popup
            </Button>
          )}
        </div>
      </div>

      {/* Analytics Dashboard Panel */}
      {selectedOfferForAnalytics && (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
          <div className="bg-slate-900/50 border border-slate-800 rounded-[24px] p-6 backdrop-blur-md">
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-amber-400" />
              Campaign Performance Analytics: <span className="text-amber-400">"{selectedOfferForAnalytics.title}"</span>
            </h2>

            {/* Overall Cards Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
              {[
                { label: 'Impressions', val: selectedOfferForAnalytics.impressions, color: 'text-blue-400', desc: 'Total popups triggered' },
                { label: 'Closes', val: selectedOfferForAnalytics.closes, color: 'text-slate-400', desc: 'Manually closed' },
                { label: 'CTA Clicks', val: selectedOfferForAnalytics.ctaClicks, color: 'text-amber-400', desc: 'Primary CTA clicks' },
                { label: 'Coupon Copies', val: selectedOfferForAnalytics.couponCopies, color: 'text-purple-400', desc: 'Code copy events' },
                { label: 'Conversions', val: selectedOfferForAnalytics.conversions, color: 'text-emerald-400', desc: 'Completed Checkouts' }
              ].map((card, idx) => (
                <div key={idx} className="bg-slate-950/40 border border-slate-800/80 rounded-2xl p-4 flex flex-col justify-between">
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">{card.label}</span>
                  <span className={`text-2xl font-black mt-2 ${card.color}`}>
                    {card.val?.toLocaleString() || 0}
                  </span>
                  <span className="text-[10px] text-slate-500 mt-2">{card.desc}</span>
                </div>
              ))}
            </div>

            {/* Main Stats Summary */}
            <div className="grid md:grid-cols-3 gap-6 bg-slate-950/60 p-5 rounded-2xl border border-slate-800/80 mb-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-amber-500/10 rounded-full text-amber-400">
                  <TrendingUp className="h-5 w-5" />
                </div>
                <div>
                  <span className="block text-xs text-slate-400">Click-Through Rate (CTR)</span>
                  <span className="text-xl font-bold text-slate-100">
                    {calcRate(selectedOfferForAnalytics.ctaClicks, selectedOfferForAnalytics.impressions)}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="p-3 bg-emerald-500/10 rounded-full text-emerald-400">
                  <TrendingUp className="h-5 w-5" />
                </div>
                <div>
                  <span className="block text-xs text-slate-400">Checkout Conversion Rate</span>
                  <span className="text-xl font-bold text-slate-100">
                    {calcRate(selectedOfferForAnalytics.conversions, selectedOfferForAnalytics.impressions)}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="p-3 bg-purple-500/10 rounded-full text-purple-400">
                  <Copy className="h-5 w-5" />
                </div>
                <div>
                  <span className="block text-xs text-slate-400">Coupon Claim Rate</span>
                  <span className="text-xl font-bold text-slate-100">
                    {calcRate(selectedOfferForAnalytics.couponCopies, selectedOfferForAnalytics.impressions)}
                  </span>
                </div>
              </div>
            </div>

            {/* A/B Testing Breakdown */}
            {selectedOfferForAnalytics.isABTesting && selectedOfferForAnalytics.variants && selectedOfferForAnalytics.variants.length > 0 ? (
              <div className="space-y-4">
                <h3 className="text-md font-bold text-amber-300 flex items-center gap-2">
                  <Sparkles className="h-4 w-4" />
                  A/B Testing Variants Performance Comparison
                </h3>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm border-collapse">
                    <thead>
                      <tr className="border-b border-slate-800 text-slate-400 font-bold uppercase tracking-wider text-xs">
                        <th className="py-3 px-4">Variant</th>
                        <th className="py-3 px-4">Impressions</th>
                        <th className="py-3 px-4">CTA Clicks</th>
                        <th className="py-3 px-4">CTR %</th>
                        <th className="py-3 px-4">Copies</th>
                        <th className="py-3 px-4">Conversions</th>
                        <th className="py-3 px-4">CVR %</th>
                        <th className="py-3 px-4">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800">
                      {/* Main Campaign (treated as control / baseline if A/B testing) */}
                      <tr className="hover:bg-slate-800/20 bg-slate-900/10">
                        <td className="py-4 px-4 font-semibold text-amber-200">
                          Original Campaign (Control)
                        </td>
                        <td className="py-4 px-4">{selectedOfferForAnalytics.impressions}</td>
                        <td className="py-4 px-4">{selectedOfferForAnalytics.ctaClicks}</td>
                        <td className="py-4 px-4 text-amber-400">
                          {calcRate(selectedOfferForAnalytics.ctaClicks, selectedOfferForAnalytics.impressions)}
                        </td>
                        <td className="py-4 px-4">{selectedOfferForAnalytics.couponCopies}</td>
                        <td className="py-4 px-4">{selectedOfferForAnalytics.conversions}</td>
                        <td className="py-4 px-4 text-emerald-400">
                          {calcRate(selectedOfferForAnalytics.conversions, selectedOfferForAnalytics.impressions)}
                        </td>
                        <td className="py-4 px-4 text-slate-500 italic">Baseline</td>
                      </tr>

                      {/* Other Variants */}
                      {selectedOfferForAnalytics.variants.map((v, index) => {
                        const originalCVR = (selectedOfferForAnalytics.conversions / (selectedOfferForAnalytics.impressions || 1));
                        const variantCVR = ((v.conversions || 0) / ((v.impressions || 0) || 1));
                        const isWinner = variantCVR > originalCVR && (v.conversions || 0) > 0;

                        return (
                          <tr key={index} className="hover:bg-slate-800/20">
                            <td className="py-4 px-4 font-semibold text-slate-200">
                              {v.title}
                            </td>
                            <td className="py-4 px-4">{v.impressions || 0}</td>
                            <td className="py-4 px-4">{v.ctaClicks || 0}</td>
                            <td className="py-4 px-4 text-amber-400">
                              {calcRate(v.ctaClicks || 0, v.impressions || 0)}
                            </td>
                            <td className="py-4 px-4">{v.couponCopies || 0}</td>
                            <td className="py-4 px-4">{v.conversions || 0}</td>
                            <td className="py-4 px-4 text-emerald-400 font-bold">
                              {calcRate(v.conversions || 0, v.impressions || 0)}
                            </td>
                            <td className="py-4 px-4">
                              {isWinner ? (
                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-900/50 text-emerald-300 border border-emerald-800">
                                  👑 Outperforming
                                </span>
                              ) : (
                                <span className="text-slate-500 text-xs">Running...</span>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            ) : (
              <div className="text-xs text-slate-500 flex items-center gap-1.5 pt-2">
                <Info className="h-4 w-4" />
                This campaign is running without A/B variant split testing. Set up variants in the campaign builder to perform split testing.
              </div>
            )}
          </div>
        </div>
      )}

      {/* Editor & Creation Form Container */}
      {showForm && (
        <div className="grid lg:grid-cols-12 gap-8 items-start animate-in fade-in zoom-in-95 duration-300">
          
          {/* Left panel Form Editor (7 Cols) */}
          <form onSubmit={handleSubmit} className="lg:col-span-7 bg-slate-900/40 border border-slate-800/80 rounded-[28px] overflow-hidden p-6 sm:p-8 space-y-6">
            <div className="flex justify-between items-center pb-4 border-b border-slate-800">
              <h2 className="text-xl font-bold text-slate-200">
                {isEditing ? 'Modify Campaign Popup' : 'Design Campaign Popup'}
              </h2>

              <div className="flex gap-2">
                {/* Save Changes Button */}
                <Button 
                  type="submit" 
                  disabled={isSaving || isUploadingDesktop || isUploadingMobile}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl px-4 py-2 flex items-center shadow-md"
                >
                  {isSaving ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    'Save & Publish'
                  )}
                </Button>
                
                {/* Cancel Button */}
                <Button type="button" variant="outline" onClick={resetForm} className="border-slate-800 text-slate-400 bg-slate-950/20 hover:bg-slate-800">
                  Discard
                </Button>
              </div>
            </div>

            {/* Presets & Launch Templates Selector Panel */}
            <div className="bg-slate-950/40 border border-slate-800/80 rounded-2xl p-4 space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                <span className="block text-xs font-bold text-amber-300 uppercase tracking-widest flex items-center gap-1.5">
                  <Sparkles className="h-3.5 w-3.5 text-amber-400" />
                  Quick Presets & Templates
                </span>
                <span className="text-[11px] text-slate-400">Click any preset to prefill form</span>
              </div>

              {/* New Launch presets highlight */}
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5 flex items-center gap-1">
                  <Cake className="h-3 w-3 text-amber-400" />
                  New Product Launches (No Special Discount)
                </span>
                <div className="flex flex-wrap gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => handleApplyTemplate('cakes_launch')}
                    className="border-amber-500/40 text-xs font-bold capitalize text-amber-300 hover:bg-amber-500/10 bg-amber-950/30"
                  >
                    <Cake className="h-3.5 w-3.5 mr-1 text-amber-400" />
                    New Cakes Launch 🎂
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => handleApplyTemplate('combos_launch')}
                    className="border-amber-500/40 text-xs font-bold capitalize text-amber-300 hover:bg-amber-500/10 bg-amber-950/30"
                  >
                    <Gift className="h-3.5 w-3.5 mr-1 text-yellow-400" />
                    New Combos Launch 🎁
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => handleApplyTemplate('cakes_combos_launch')}
                    className="border-amber-500/60 text-xs font-bold capitalize text-yellow-200 hover:bg-amber-500/20 bg-amber-900/40 shadow-sm"
                  >
                    <Sparkles className="h-3.5 w-3.5 mr-1 text-yellow-300" />
                    Cakes & Combos Launch ✨
                  </Button>
                </div>
              </div>

              {/* Seasonal Festivals */}
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5">
                  🎉 Seasonal Festival Specials
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {(['rakhi', 'valentines', 'diwali', 'christmas', 'newyear', 'mothersday'] as const).map(key => (
                    <Button
                      key={key}
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => handleApplyTemplate(key)}
                      className="border-slate-800 text-xs font-semibold capitalize text-slate-300 hover:bg-slate-800 bg-slate-900/40 h-7"
                    >
                      {key} Template
                    </Button>
                  ))}
                </div>
              </div>
            </div>

            {/* Popup Purpose Selector */}
            <div className="bg-slate-950/60 border border-slate-800/80 rounded-2xl p-4">
              <span className="block text-xs font-bold text-slate-300 uppercase tracking-widest mb-2.5">
                🎯 Popup Purpose & Mode
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setPopupPurpose('launch');
                    setCurrentOffer(prev => ({
                      ...prev,
                      discountPercent: 0,
                      code: '',
                      showCountdown: false,
                      badgeText: prev.badgeText || 'New Launch 🎂'
                    }));
                  }}
                  className={`p-3.5 rounded-xl border text-left transition-all flex items-start gap-3 ${
                    popupPurpose === 'launch'
                      ? 'border-amber-400 bg-amber-500/10 text-white shadow-md'
                      : 'border-slate-800 bg-slate-900/30 text-slate-400 hover:border-slate-700'
                  }`}
                >
                  <Cake className={`h-5 w-5 shrink-0 mt-0.5 ${popupPurpose === 'launch' ? 'text-amber-400' : 'text-slate-500'}`} />
                  <div>
                    <div className="text-sm font-bold text-slate-200 flex items-center gap-1.5">
                      New Product Launch / Showcase
                      {popupPurpose === 'launch' && <Check className="h-3.5 w-3.5 text-amber-400" />}
                    </div>
                    <p className="text-[11px] text-slate-400 mt-0.5 leading-snug">
                      Announce new cakes, combos, or collections without requiring special checkout discounts.
                    </p>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setPopupPurpose('discount');
                    setCurrentOffer(prev => ({
                      ...prev,
                      discountPercent: prev.discountPercent && prev.discountPercent > 0 ? prev.discountPercent : 10,
                      showCountdown: true,
                      badgeText: prev.badgeText || 'Special Offer'
                    }));
                  }}
                  className={`p-3.5 rounded-xl border text-left transition-all flex items-start gap-3 ${
                    popupPurpose === 'discount'
                      ? 'border-amber-400 bg-amber-500/10 text-white shadow-md'
                      : 'border-slate-800 bg-slate-900/30 text-slate-400 hover:border-slate-700'
                  }`}
                >
                  <Tag className={`h-5 w-5 shrink-0 mt-0.5 ${popupPurpose === 'discount' ? 'text-amber-400' : 'text-slate-500'}`} />
                  <div>
                    <div className="text-sm font-bold text-slate-200 flex items-center gap-1.5">
                      Promotional Discount Offer
                      {popupPurpose === 'discount' && <Check className="h-3.5 w-3.5 text-amber-400" />}
                    </div>
                    <p className="text-[11px] text-slate-400 mt-0.5 leading-snug">
                      Provide percentage savings and promo codes that auto-sync with checkout.
                    </p>
                  </div>
                </button>
              </div>
            </div>

            {/* Form tabs */}
            <div className="flex border-b border-slate-800 gap-2">
              {[
                { id: 'general', label: 'General Info' },
                { id: 'design', label: 'Visual Layout' },
                { id: 'triggers', label: 'Smart Triggers' },
                { id: 'ab', label: 'A/B Testing' }
              ].map(tab => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`pb-3 px-4 text-xs font-bold uppercase tracking-wider transition-colors border-b-2 
                    ${activeTab === tab.id 
                      ? 'border-amber-400 text-amber-400' 
                      : 'border-transparent text-slate-400 hover:text-slate-200'
                    }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Tab content 1: General */}
            {activeTab === 'general' && (
              <div className="space-y-5 animate-in fade-in duration-200">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="title" className="text-xs text-slate-400">Campaign Title *</Label>
                    <Input
                      id="title"
                      value={currentOffer.title || ''}
                      onChange={(e) => setCurrentOffer({ ...currentOffer, title: e.target.value })}
                      required
                      placeholder="e.g. Introducing Our New Artisanal Cakes 🎂"
                      className="bg-slate-950/60 border-slate-800/80 rounded-xl"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="subtitle" className="text-xs text-slate-400">Subtitle (Optional)</Label>
                    <Input
                      id="subtitle"
                      value={currentOffer.subtitle || ''}
                      onChange={(e) => setCurrentOffer({ ...currentOffer, subtitle: e.target.value })}
                      placeholder="e.g. Freshly Baked • Decadent Flavors"
                      className="bg-slate-950/60 border-slate-800/80 rounded-xl"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description" className="text-xs text-slate-400">Description Message *</Label>
                  <textarea
                    id="description"
                    value={currentOffer.description || ''}
                    onChange={(e) => setCurrentOffer({ ...currentOffer, description: e.target.value })}
                    required
                    rows={3}
                    placeholder="Enter details about your newly launched cakes, combos, or celebration arrangements..."
                    className="w-full bg-slate-950/60 border border-slate-800/80 rounded-xl p-3 text-sm focus:outline-none focus:border-amber-400/50"
                  />
                </div>

                {/* Display Image Upload Box directly in General Tab */}
                <div className="space-y-3 bg-slate-950/50 p-4 rounded-2xl border border-slate-800/80">
                  <div className="flex justify-between items-center">
                    <div>
                      <Label className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                        <ImageIcon className="h-4 w-4 text-amber-400" />
                        Campaign Display Banner Image
                      </Label>
                      <p className="text-[11px] text-slate-400 mt-0.5">
                        Upload banner visual. Instant preview and Cloudinary sync.
                      </p>
                    </div>
                    {currentOffer.imageUrl && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => setCurrentOffer({ ...currentOffer, imageUrl: '', image: '' })}
                        className="text-xs text-red-400 hover:text-red-300 hover:bg-red-950/30 h-7 px-2.5 rounded-lg"
                      >
                        <Trash2 className="h-3.5 w-3.5 mr-1" />
                        Remove
                      </Button>
                    )}
                  </div>

                  <ImageUpload
                    currentImage={currentOffer.imageUrl}
                    onImageUpload={(file) => handleUploadImage(file, 'desktop')}
                    isUploading={isUploadingDesktop}
                    placeholder="Click or drag image to upload"
                  />

                  <div className="space-y-1 pt-1">
                    <Label className="text-[10px] text-slate-400">Or paste image URL directly:</Label>
                    <Input
                      value={currentOffer.imageUrl || ''}
                      onChange={(e) => setCurrentOffer({ ...currentOffer, imageUrl: e.target.value, image: e.target.value })}
                      placeholder="https://images.unsplash.com/... or https://res.cloudinary.com/..."
                      className="bg-slate-950/80 border-slate-800 text-xs text-slate-300 rounded-xl font-mono"
                    />
                  </div>
                </div>

                {/* CTA Destination & Category Shortcuts */}
                <div className="space-y-3 bg-slate-950/50 p-4 rounded-2xl border border-slate-800/80">
                  <span className="block text-xs font-bold text-slate-300 uppercase tracking-widest">
                    🔗 CTA Button & Quick Category Destination
                  </span>
                  
                  {/* Quick Category Buttons */}
                  <div>
                    <span className="text-[10px] text-slate-400 block mb-1.5">Quick fill link destination:</span>
                    <div className="flex flex-wrap gap-2">
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        onClick={() => setCurrentOffer(prev => ({ ...prev, buttonText: 'Explore New Cakes', buttonLink: '/category/cakes' }))}
                        className="border-slate-800 bg-slate-900/60 hover:bg-slate-800 text-xs text-amber-300"
                      >
                        <Cake className="h-3.5 w-3.5 mr-1 text-amber-400" />
                        Cakes (/category/cakes)
                      </Button>

                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        onClick={() => setCurrentOffer(prev => ({ ...prev, buttonText: 'Explore New Combos', buttonLink: '/category/combos' }))}
                        className="border-slate-800 bg-slate-900/60 hover:bg-slate-800 text-xs text-amber-300"
                      >
                        <Gift className="h-3.5 w-3.5 mr-1 text-yellow-400" />
                        Combos (/category/combos)
                      </Button>

                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        onClick={() => setCurrentOffer(prev => ({ ...prev, buttonText: 'Shop New Arrivals', buttonLink: '/shop' }))}
                        className="border-slate-800 bg-slate-900/60 hover:bg-slate-800 text-xs text-slate-300"
                      >
                        <ShoppingBag className="h-3.5 w-3.5 mr-1 text-slate-400" />
                        All Shop (/shop)
                      </Button>

                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        onClick={() => setCurrentOffer(prev => ({ ...prev, buttonText: 'Send Flowers Today', buttonLink: '/category/flowers' }))}
                        className="border-slate-800 bg-slate-900/60 hover:bg-slate-800 text-xs text-slate-300"
                      >
                        <Flower2 className="h-3.5 w-3.5 mr-1 text-rose-400" />
                        Flowers (/category/flowers)
                      </Button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
                    <div className="space-y-1.5">
                      <Label htmlFor="buttonText_general" className="text-xs text-slate-400">Button Text</Label>
                      <Input
                        id="buttonText_general"
                        value={currentOffer.buttonText || ''}
                        onChange={(e) => setCurrentOffer({ ...currentOffer, buttonText: e.target.value })}
                        placeholder="e.g. Explore New Cakes"
                        className="bg-slate-950/60 border-slate-800/80 rounded-xl"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <Label htmlFor="buttonLink_general" className="text-xs text-slate-400">Button Link</Label>
                      <Input
                        id="buttonLink_general"
                        value={currentOffer.buttonLink || ''}
                        onChange={(e) => setCurrentOffer({ ...currentOffer, buttonLink: e.target.value })}
                        placeholder="e.g. /category/cakes"
                        className="bg-slate-950/60 border-slate-800/80 rounded-xl font-mono text-xs"
                      />
                    </div>
                  </div>
                </div>

                {/* Promo Code & Discount Block */}
                {popupPurpose === 'launch' ? (
                  <div className="p-3.5 bg-emerald-950/30 border border-emerald-500/30 rounded-xl flex items-start gap-2.5 text-xs text-emerald-300">
                    <Check className="h-4.5 w-4.5 shrink-0 mt-0.5 text-emerald-400" />
                    <div>
                      <span className="font-bold">No Discount Required:</span> New launch announcement mode is active. Customers clicking the popup will be taken straight to your new collection without requiring checkout coupons.
                    </div>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-xl flex items-start gap-2.5 text-xs text-amber-300">
                      <Sparkles className="h-4.5 w-4.5 shrink-0 mt-0.5 text-amber-400 animate-pulse" />
                      <div>
                        <span className="font-bold">Checkout Promo Code Auto-Sync:</span> Entering a promo code here (e.g. <span className="font-mono text-yellow-200 uppercase font-black px-1 py-0.5 bg-black/40 rounded">BFF20</span>) automatically activates it for customer checkout!
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="code_general" className="text-xs text-slate-400">Promo Coupon Code</Label>
                        <Input
                          id="code_general"
                          value={currentOffer.code || ''}
                          onChange={(e) => setCurrentOffer({ ...currentOffer, code: e.target.value.toUpperCase() })}
                          placeholder="e.g. CAKES10 or COMBOS15"
                          className="bg-slate-950/60 border-slate-800/80 rounded-xl font-mono uppercase text-amber-300 font-bold tracking-wider"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="discountPercent_general" className="text-xs text-slate-400">Discount Percentage (%)</Label>
                        <Input
                          id="discountPercent_general"
                          type="number"
                          min={0}
                          max={100}
                          value={currentOffer.discountPercent ?? 0}
                          onChange={(e) => setCurrentOffer({ ...currentOffer, discountPercent: parseInt(e.target.value, 10) || 0 })}
                          className="bg-slate-950/60 border-slate-800/80 rounded-xl text-yellow-300 font-bold"
                        />
                      </div>
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="badgeText" className="text-xs text-slate-400">Badge Banner Text</Label>
                    <Input
                      id="badgeText"
                      value={currentOffer.badgeText || ''}
                      onChange={(e) => setCurrentOffer({ ...currentOffer, badgeText: e.target.value })}
                      placeholder="e.g. New Launch 🎂 or Fresh Arrivals ✨"
                      className="bg-slate-950/60 border-slate-800/80 rounded-xl"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="theme" className="text-xs text-slate-400">Icon Theme Style</Label>
                    <Select
                      value={currentOffer.theme}
                      onValueChange={(value: any) => setCurrentOffer({ ...currentOffer, theme: value })}
                    >
                      <SelectTrigger className="bg-slate-950/60 border-slate-800/80 rounded-xl">
                        <SelectValue placeholder="Select theme icon preset" />
                      </SelectTrigger>
                      <SelectContent className="bg-slate-900 border-slate-800 text-slate-200">
                        <SelectItem value="general">General Preset (Sparkles)</SelectItem>
                        <SelectItem value="rakhi">Rakhi (Petals/Gold)</SelectItem>
                        <SelectItem value="valentines">Valentine's (Hearts/Rose)</SelectItem>
                        <SelectItem value="diwali">Diwali (Sparks/Flame)</SelectItem>
                        <SelectItem value="christmas">Christmas (Snowflake/Forest)</SelectItem>
                        <SelectItem value="newyear">New Year (Gold Glitter)</SelectItem>
                        <SelectItem value="mothersday">Mother's Day (Lavender/Pink)</SelectItem>
                        <SelectItem value="fathersday">Father's Day (Classic Royal)</SelectItem>
                        <SelectItem value="sale">Sale Preset (Tag/Indigo)</SelectItem>
                        <SelectItem value="holiday">Holiday Preset (Calendar/Emerald)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-xs text-slate-400">Schedule Start Date</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button variant="outline" className="w-full justify-start text-left font-normal bg-slate-950/60 border-slate-800/80 rounded-xl hover:bg-slate-900 text-slate-300">
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {currentOffer.startDate ? format(new Date(currentOffer.startDate), 'PPP') : 'Pick a date'}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent side="bottom" align="start" className="w-auto p-0 bg-slate-900 border border-slate-800">
                        <Calendar
                          mode="single"
                          selected={currentOffer.startDate ? new Date(currentOffer.startDate) : undefined}
                          onSelect={(date) => setCurrentOffer({ ...currentOffer, startDate: date?.toISOString() })}
                        />
                      </PopoverContent>
                    </Popover>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-xs text-slate-400">Schedule End Date (Expiry)</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button variant="outline" className="w-full justify-start text-left font-normal bg-slate-950/60 border-slate-800/80 rounded-xl hover:bg-slate-900 text-slate-300">
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {currentOffer.endDate ? format(new Date(currentOffer.endDate), 'PPP') : 'Pick a date'}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent side="bottom" align="start" className="w-auto p-0 bg-slate-900 border border-slate-800">
                        <Calendar
                          mode="single"
                          selected={currentOffer.endDate ? new Date(currentOffer.endDate) : undefined}
                          onSelect={(date) => setCurrentOffer({ ...currentOffer, endDate: date?.toISOString() })}
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                </div>
              </div>
            )}

            {/* Tab content 2: Design */}
            {activeTab === 'design' && (
              <div className="space-y-5 animate-in fade-in duration-200">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <Label className="text-xs text-slate-300 font-semibold">Desktop Display Image</Label>
                      {currentOffer.imageUrl && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => setCurrentOffer({ ...currentOffer, imageUrl: '', image: '' })}
                          className="text-xs text-red-400 h-6 px-1.5"
                        >
                          Remove
                        </Button>
                      )}
                    </div>
                    <ImageUpload
                      currentImage={currentOffer.imageUrl}
                      onImageUpload={(file) => handleUploadImage(file, 'desktop')}
                      isUploading={isUploadingDesktop}
                      placeholder="Upload Desktop Image"
                    />
                    <Input
                      value={currentOffer.imageUrl || ''}
                      onChange={(e) => setCurrentOffer({ ...currentOffer, imageUrl: e.target.value, image: e.target.value })}
                      placeholder="Or paste direct image URL"
                      className="bg-slate-950/60 border-slate-800 text-xs text-slate-300 rounded-xl font-mono"
                    />
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <Label className="text-xs text-slate-300 font-semibold">Mobile-Specific Image (Optional)</Label>
                      {currentOffer.mobileImageUrl && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => setCurrentOffer({ ...currentOffer, mobileImageUrl: '' })}
                          className="text-xs text-red-400 h-6 px-1.5"
                        >
                          Remove
                        </Button>
                      )}
                    </div>
                    <ImageUpload
                      currentImage={currentOffer.mobileImageUrl}
                      onImageUpload={(file) => handleUploadImage(file, 'mobile')}
                      isUploading={isUploadingMobile}
                      placeholder="Upload Mobile Image"
                    />
                    <Input
                      value={currentOffer.mobileImageUrl || ''}
                      onChange={(e) => setCurrentOffer({ ...currentOffer, mobileImageUrl: e.target.value })}
                      placeholder="Or paste direct mobile image URL"
                      className="bg-slate-950/60 border-slate-800 text-xs text-slate-300 rounded-xl font-mono"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="background" className="text-xs text-slate-400">Card Backdrop Gradient</Label>
                    <div className="flex items-center gap-2">
                      <Select
                        value={currentOffer.background}
                        onValueChange={(value) => setCurrentOffer({ ...currentOffer, background: value })}
                      >
                        <SelectTrigger className="bg-slate-950/60 border-slate-800/80 rounded-xl">
                          <SelectValue placeholder="Select backdrop preset" />
                        </SelectTrigger>
                        <SelectContent className="bg-slate-900 border-slate-800 text-slate-200">
                          {gradientOptions.map(option => (
                            <SelectItem key={option.name} value={option.value}>
                              <div className="flex items-center gap-2">
                                <div
                                  className="w-4 h-4 rounded-full"
                                  style={{ background: option.value }}
                                />
                                {option.name}
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      
                      {currentOffer.background && !currentOffer.background.includes('gradient') && (
                        <Input
                          id="backgroundColorHex"
                          type="color"
                          value={currentOffer.background || '#ffffff'}
                          onChange={(e) => setCurrentOffer({ ...currentOffer, background: e.target.value })}
                          className="w-16 p-1 border-slate-850 bg-transparent rounded-xl"
                        />
                      )}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="textColor" className="text-xs text-slate-400">Card Text Color</Label>
                    <div className="flex gap-2">
                      <Input
                        id="textColor"
                        type="color"
                        value={currentOffer.textColor || '#ffffff'}
                        onChange={(e) => setCurrentOffer({ ...currentOffer, textColor: e.target.value })}
                        className="w-16 p-1 bg-transparent rounded-xl border-slate-850"
                      />
                      <Input
                        value={currentOffer.textColor || '#ffffff'}
                        onChange={(e) => setCurrentOffer({ ...currentOffer, textColor: e.target.value })}
                        className="bg-slate-950/60 border-slate-800/80 rounded-xl"
                      />
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-2 pt-2">
                  <Checkbox
                    id="showCountdown"
                    checked={currentOffer.showCountdown === true}
                    onCheckedChange={(checked) => setCurrentOffer({ ...currentOffer, showCountdown: checked as boolean })}
                    className="border-slate-700"
                  />
                  <Label htmlFor="showCountdown" className="text-xs text-slate-300">Show Expiry Countdown Timer</Label>
                </div>
              </div>
            )}

            {/* Tab content 3: Triggers */}
            {activeTab === 'triggers' && (
              <div className="space-y-4 animate-in fade-in duration-200">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="buttonText" className="text-xs text-slate-400">Primary CTA Text</Label>
                    <Input
                      id="buttonText"
                      value={currentOffer.buttonText || ''}
                      onChange={(e) => setCurrentOffer({ ...currentOffer, buttonText: e.target.value })}
                      required
                      placeholder="e.g. Explore New Cakes"
                      className="bg-slate-950/60 border-slate-800/80 rounded-xl"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="buttonLink" className="text-xs text-slate-400">Primary CTA Link</Label>
                    <Input
                      id="buttonLink"
                      value={currentOffer.buttonLink || ''}
                      onChange={(e) => setCurrentOffer({ ...currentOffer, buttonLink: e.target.value })}
                      required
                      placeholder="e.g. /category/cakes"
                      className="bg-slate-950/60 border-slate-800/80 rounded-xl font-mono text-xs"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="secondaryCtaText" className="text-xs text-slate-400">Secondary CTA Text</Label>
                    <Input
                      id="secondaryCtaText"
                      value={currentOffer.secondaryCtaText || ''}
                      onChange={(e) => setCurrentOffer({ ...currentOffer, secondaryCtaText: e.target.value })}
                      placeholder="e.g. Remind Me Later"
                      className="bg-slate-950/60 border-slate-800/80 rounded-xl"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="secondaryCtaLink" className="text-xs text-slate-400">Secondary CTA Link (Optional)</Label>
                    <Input
                      id="secondaryCtaLink"
                      value={currentOffer.secondaryCtaLink || ''}
                      onChange={(e) => setCurrentOffer({ ...currentOffer, secondaryCtaLink: e.target.value })}
                      placeholder="Redirect URL path or leave blank"
                      className="bg-slate-950/60 border-slate-800/80 rounded-xl"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="triggerType" className="text-xs text-slate-400">Trigger Conditions</Label>
                    <Select
                      value={currentOffer.triggerType}
                      onValueChange={(val: any) => setCurrentOffer({ ...currentOffer, triggerType: val })}
                    >
                      <SelectTrigger className="bg-slate-950/60 border-slate-800/80 rounded-xl">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-slate-900 border-slate-800 text-slate-200">
                        <SelectItem value="combined">Combined (Delay / Scroll / Exit)</SelectItem>
                        <SelectItem value="timeDelay">Time Delay Only</SelectItem>
                        <SelectItem value="scroll">Scroll Depth Only</SelectItem>
                        <SelectItem value="exitIntent">Exit Intent Only</SelectItem>
                        <SelectItem value="immediately">Immediately on Load</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="triggerDelay" className="text-xs text-slate-400">Trigger Delay (seconds)</Label>
                    <Input
                      id="triggerDelay"
                      type="number"
                      min={0}
                      value={currentOffer.triggerDelay ?? 8}
                      onChange={(e) => setCurrentOffer({ ...currentOffer, triggerDelay: parseInt(e.target.value, 10) })}
                      className="bg-slate-950/60 border-slate-800/80 rounded-xl"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="triggerScrollPercent" className="text-xs text-slate-400">Trigger Scroll Depth (%)</Label>
                    <Input
                      id="triggerScrollPercent"
                      type="number"
                      min={0}
                      max={100}
                      value={currentOffer.triggerScrollPercent ?? 30}
                      onChange={(e) => setCurrentOffer({ ...currentOffer, triggerScrollPercent: parseInt(e.target.value, 10) })}
                      className="bg-slate-950/60 border-slate-800/80 rounded-xl"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="frequencyCap" className="text-xs text-slate-400">Display Capping Frequency</Label>
                    <Select
                      value={currentOffer.frequencyCap}
                      onValueChange={(val: any) => setCurrentOffer({ ...currentOffer, frequencyCap: val })}
                    >
                      <SelectTrigger className="bg-slate-950/60 border-slate-800/80 rounded-xl">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-slate-900 border-slate-800 text-slate-200">
                        <SelectItem value="oncePerSession">Once per Browser Session</SelectItem>
                        <SelectItem value="always">Always Show on Visit</SelectItem>
                        <SelectItem value="oncePerDay">Max Once Per Day</SelectItem>
                        <SelectItem value="oncePerWeek">Max Once Per Week</SelectItem>
                        <SelectItem value="oncePerMonth">Max Once Per Month</SelectItem>
                        <SelectItem value="onceEver">Once Ever (Per Customer)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="deviceTargeting" className="text-xs text-slate-400">Target Devices</Label>
                    <Select
                      value={currentOffer.deviceTargeting}
                      onValueChange={(val: any) => setCurrentOffer({ ...currentOffer, deviceTargeting: val })}
                    >
                      <SelectTrigger className="bg-slate-950/60 border-slate-800/80 rounded-xl">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-slate-900 border-slate-800 text-slate-200">
                        <SelectItem value="both">Both (Desktop & Mobile)</SelectItem>
                        <SelectItem value="desktop">Desktop Only</SelectItem>
                        <SelectItem value="mobile">Mobile Devices Only</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            )}

            {/* Tab content 4: A/B Testing */}
            {activeTab === 'ab' && (
              <div className="space-y-6 animate-in fade-in duration-200">
                <div className="flex items-center space-x-2 bg-slate-950/30 p-4 rounded-xl border border-slate-800/50">
                  <Checkbox
                    id="isABTesting"
                    checked={currentOffer.isABTesting || false}
                    onCheckedChange={(checked) => setCurrentOffer({ ...currentOffer, isABTesting: checked as boolean })}
                    className="border-slate-700"
                  />
                  <Label htmlFor="isABTesting" className="text-xs text-slate-200 cursor-pointer">
                    Enable A/B testing splits for multiple layout variants
                  </Label>
                </div>

                {currentOffer.isABTesting && (
                  <div className="space-y-6">
                    {/* Add / Edit Variant Form */}
                    <div className="bg-slate-950/50 p-4 rounded-2xl border border-slate-800/80 space-y-4">
                      <h4 className="text-xs font-bold text-amber-300 uppercase tracking-widest flex items-center gap-1.5">
                        <Plus className="h-4 w-4" />
                        {editingVariantIndex !== null ? 'Modify Variant' : 'Define Variant (Variant B/C)'}
                      </h4>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label className="text-xs text-slate-400">Variant Title</Label>
                          <Input
                            value={variantForm.title}
                            onChange={e => setVariantForm({ ...variantForm, title: e.target.value })}
                            placeholder="e.g. Rakhi Gold Edition"
                            className="bg-slate-900 border-slate-800 rounded-xl"
                          />
                        </div>

                        <div className="space-y-2">
                          <Label className="text-xs text-slate-400">Badge Text</Label>
                          <Input
                            value={variantForm.badgeText}
                            onChange={e => setVariantForm({ ...variantForm, badgeText: e.target.value })}
                            placeholder="e.g. Midnight Special"
                            className="bg-slate-900 border-slate-800 rounded-xl"
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label className="text-xs text-slate-400">Variant Description</Label>
                        <Input
                          value={variantForm.description}
                          onChange={e => setVariantForm({ ...variantForm, description: e.target.value })}
                          placeholder="Variant specific promotion description message..."
                          className="bg-slate-900 border-slate-800 rounded-xl"
                        />
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="space-y-2">
                          <Label className="text-xs text-slate-400">Promo Code</Label>
                          <Input
                            value={variantForm.code}
                            onChange={e => setVariantForm({ ...variantForm, code: e.target.value.toUpperCase() })}
                            placeholder="e.g. RAKHIB"
                            className="bg-slate-900 border-slate-800 rounded-xl"
                          />
                        </div>

                        <div className="space-y-2">
                          <Label className="text-xs text-slate-400">Discount %</Label>
                          <Input
                            type="number"
                            value={variantForm.discountPercent}
                            onChange={e => setVariantForm({ ...variantForm, discountPercent: parseInt(e.target.value, 10) })}
                            className="bg-slate-900 border-slate-800 rounded-xl"
                          />
                        </div>

                        <div className="space-y-2">
                          <Label className="text-xs text-slate-400">Variant Theme Icon</Label>
                          <Select
                            value={variantForm.theme}
                            onValueChange={val => setVariantForm({ ...variantForm, theme: val })}
                          >
                            <SelectTrigger className="bg-slate-900 border-slate-800 rounded-xl text-slate-300">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent className="bg-slate-900 border-slate-800 text-slate-200">
                              <SelectItem value="rakhi">Rakhi Theme</SelectItem>
                              <SelectItem value="valentines">Valentine's Theme</SelectItem>
                              <SelectItem value="diwali">Diwali Theme</SelectItem>
                              <SelectItem value="christmas">Christmas Theme</SelectItem>
                              <SelectItem value="newyear">New Year Theme</SelectItem>
                              <SelectItem value="general">General Presets</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label className="text-xs text-slate-400">CTA Text</Label>
                          <Input
                            value={variantForm.buttonText}
                            onChange={e => setVariantForm({ ...variantForm, buttonText: e.target.value })}
                            placeholder="Claim Offer"
                            className="bg-slate-900 border-slate-800 rounded-xl"
                          />
                        </div>

                        <div className="space-y-2">
                          <Label className="text-xs text-slate-400">CTA Redirect Link</Label>
                          <Input
                            value={variantForm.buttonLink}
                            onChange={e => setVariantForm({ ...variantForm, buttonLink: e.target.value })}
                            placeholder="/shop"
                            className="bg-slate-900 border-slate-800 rounded-xl"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label className="text-xs text-slate-400">Backdrop style (Hex or Gradient)</Label>
                          <Input
                            value={variantForm.background}
                            onChange={e => setVariantForm({ ...variantForm, background: e.target.value })}
                            placeholder="linear-gradient(to right, #ff9966, #ff5e62)"
                            className="bg-slate-900 border-slate-800 rounded-xl"
                          />
                        </div>

                        <div className="space-y-2">
                          <Label className="text-xs text-slate-400">TextColor Hex</Label>
                          <Input
                            value={variantForm.textColor}
                            onChange={e => setVariantForm({ ...variantForm, textColor: e.target.value })}
                            placeholder="#ffffff"
                            className="bg-slate-900 border-slate-800 rounded-xl"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <div className="flex justify-between items-center">
                            <Label className="text-xs text-slate-400">Variant Desktop Image</Label>
                            {variantForm.imageUrl && (
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={() => setVariantForm(prev => ({ ...prev, imageUrl: '' }))}
                                className="text-xs text-red-400 h-6 px-1.5"
                              >
                                Remove
                              </Button>
                            )}
                          </div>
                          <ImageUpload
                            currentImage={variantForm.imageUrl}
                            onImageUpload={(file) => handleUploadImage(file, 'variantDesktop')}
                            isUploading={isUploadingVariantDesktop}
                            placeholder="Upload desktop variant image"
                          />
                          <Input
                            value={variantForm.imageUrl || ''}
                            onChange={(e) => setVariantForm(prev => ({ ...prev, imageUrl: e.target.value }))}
                            placeholder="Or paste direct image URL"
                            className="bg-slate-900 border-slate-800 text-xs text-slate-300 rounded-xl font-mono"
                          />
                        </div>

                        <div className="space-y-2">
                          <div className="flex justify-between items-center">
                            <Label className="text-xs text-slate-400">Variant Mobile Image</Label>
                            {variantForm.mobileImageUrl && (
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={() => setVariantForm(prev => ({ ...prev, mobileImageUrl: '' }))}
                                className="text-xs text-red-400 h-6 px-1.5"
                              >
                                Remove
                              </Button>
                            )}
                          </div>
                          <ImageUpload
                            currentImage={variantForm.mobileImageUrl}
                            onImageUpload={(file) => handleUploadImage(file, 'variantMobile')}
                            isUploading={isUploadingVariantMobile}
                            placeholder="Upload mobile variant image"
                          />
                          <Input
                            value={variantForm.mobileImageUrl || ''}
                            onChange={(e) => setVariantForm(prev => ({ ...prev, mobileImageUrl: e.target.value }))}
                            placeholder="Or paste direct mobile image URL"
                            className="bg-slate-900 border-slate-800 text-xs text-slate-300 rounded-xl font-mono"
                          />
                        </div>
                      </div>

                      <div className="flex gap-2 justify-end">
                        <Button 
                          onClick={handleSaveVariant} 
                          type="button" 
                          className="bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold rounded-xl"
                        >
                          {editingVariantIndex !== null ? 'Apply Edits' : 'Add to Variants list'}
                        </Button>
                        
                        {editingVariantIndex !== null && (
                          <Button 
                            onClick={() => {
                              setEditingVariantIndex(null);
                              setVariantForm({
                                title: '',
                                description: '',
                                discountPercent: 10,
                                code: '',
                                buttonText: 'Claim Offer',
                                buttonLink: '/shop',
                                background: 'linear-gradient(to right, #ff9966, #ff5e62)',
                                textColor: '#ffffff',
                                badgeText: 'Variant Special',
                                theme: 'general'
                              });
                            }} 
                            type="button" 
                            variant="outline"
                            className="border-slate-800 text-slate-400"
                          >
                            Cancel Edit
                          </Button>
                        )}
                      </div>
                    </div>

                    {/* Existing Variants list */}
                    <div className="space-y-2">
                      <span className="block text-xs font-bold text-slate-400 uppercase tracking-widest">
                        Created Variants ({currentOffer.variants?.length || 0})
                      </span>
                      
                      {(!currentOffer.variants || currentOffer.variants.length === 0) ? (
                        <div className="text-xs text-slate-500 italic p-3 text-center bg-slate-950/20 rounded-xl border border-dashed border-slate-800">
                          No variants defined yet. Define variants above to launch A/B splits.
                        </div>
                      ) : (
                        <div className="space-y-2">
                          {currentOffer.variants.map((v, idx) => (
                            <div key={idx} className="flex justify-between items-center p-3 rounded-xl border border-slate-800 bg-slate-950/20">
                              <div>
                                <span className="font-semibold text-sm block">{v.title}</span>
                                <span className="text-[10px] text-slate-500">
                                  Code: <span className="font-mono text-slate-400">{v.code || 'N/A'}</span> ({v.discountPercent}% OFF)
                                </span>
                              </div>
                              
                              <div className="flex gap-2">
                                <Button 
                                  onClick={() => handleEditVariant(idx)} 
                                  type="button" 
                                  variant="outline" 
                                  size="sm" 
                                  className="border-slate-800 text-slate-400 h-8"
                                >
                                  <Edit3 className="h-3.5 w-3.5" />
                                </Button>
                                <Button 
                                  onClick={() => handleDeleteVariant(idx)} 
                                  type="button" 
                                  variant="outline" 
                                  size="sm" 
                                  className="border-slate-800 text-red-400 hover:text-red-500 h-8"
                                >
                                  <Trash2 className="h-3.5 w-3.5" />
                                </Button>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}
          </form>

          {/* Right panel: Real-time Live Preview (5 Cols) */}
          <div className="lg:col-span-5 space-y-4 sticky top-6">
            <div className="flex justify-between items-center p-3 bg-slate-900/50 border border-slate-800 rounded-2xl">
              <span className="text-xs font-bold text-slate-300 uppercase tracking-widest flex items-center gap-1.5">
                <Eye className="h-4 w-4 text-amber-400" />
                Live interactive preview
              </span>
              
              <div className="flex gap-1 bg-slate-950/60 p-1 rounded-xl">
                <button
                  type="button"
                  onClick={() => setPreviewDevice('desktop')}
                  className={`p-1.5 rounded-lg transition-colors ${previewDevice === 'desktop' ? 'bg-amber-400 text-slate-950' : 'text-slate-400 hover:text-slate-200'}`}
                  title="Simulate desktop popup"
                >
                  <Monitor className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={() => setPreviewDevice('mobile')}
                  className={`p-1.5 rounded-lg transition-colors ${previewDevice === 'mobile' ? 'bg-amber-400 text-slate-950' : 'text-slate-400 hover:text-slate-200'}`}
                  title="Simulate mobile bottom sheet"
                >
                  <Smartphone className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* Simulating device screen frame */}
            <div className="bg-slate-950 rounded-[32px] border border-slate-800 p-4 h-[540px] flex items-center justify-center overflow-hidden relative shadow-inner">
              
              {previewDismissed ? (
                <div className="text-center space-y-3 p-6">
                  <div className="w-12 h-12 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center mx-auto text-amber-400">
                    <Eye className="h-6 w-6" />
                  </div>
                  <p className="text-xs font-semibold text-slate-400">Preview popup was dismissed</p>
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    className="border-slate-700 text-slate-200 hover:bg-slate-900 text-xs rounded-xl"
                    onClick={() => setPreviewDismissed(false)}
                  >
                    Re-open Live Preview
                  </Button>
                </div>
              ) : previewDevice === 'desktop' ? (
                /* Desktop layout popup simulator (2-column card with image) */
                <div
                  style={{
                    background: currentOffer.background || festivalThemes[currentOffer.theme || 'general']?.gradient || festivalThemes.general.gradient,
                    color: currentOffer.textColor || '#ffffff'
                  }}
                  className="w-full max-w-[460px] rounded-[24px] border border-white/15 shadow-2xl overflow-hidden flex flex-col sm:flex-row relative font-sans text-left transition-all duration-300 hover:shadow-amber-500/10"
                >
                  {/* Close button simulator */}
                  <button
                    type="button"
                    onClick={() => {
                      setPreviewDismissed(true);
                      toast({ title: "Preview Closed", description: "Click Re-open to restore live preview." });
                    }}
                    className="absolute right-3 top-3 z-30 rounded-full p-1.5 bg-black/30 hover:bg-black/50 text-white transition-all cursor-pointer"
                    title="Simulate close action"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>

                  {/* Desktop Preview Image Column */}
                  {(currentOffer.imageUrl || currentOffer.image || currentOffer.mobileImageUrl) ? (
                    <div className="w-full sm:w-5/12 h-36 sm:h-auto overflow-hidden relative shrink-0 bg-slate-900">
                      <img
                        src={currentOffer.imageUrl || currentOffer.image || currentOffer.mobileImageUrl}
                        alt="Offer Preview"
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.currentTarget.src = 'https://images.unsplash.com/photo-1563241527-3004b7be0ffd?w=600&auto=format&fit=crop&q=80';
                        }}
                      />
                      {currentOffer.badgeText && (
                        <span className="absolute top-2 left-2 z-10 px-2 py-0.5 text-[8px] font-black uppercase tracking-wider bg-white/90 text-slate-900 rounded-full shadow-sm">
                          ✨ {currentOffer.badgeText}
                        </span>
                      )}
                    </div>
                  ) : (
                    <div className="w-full sm:w-5/12 h-32 sm:h-auto bg-black/30 border-r border-white/10 flex flex-col items-center justify-center p-3 text-center shrink-0">
                      <Sparkles className="h-5 w-5 text-amber-400 mb-1 animate-pulse" />
                      <span className="text-[9px] font-bold text-white/70">Image Preview</span>
                      <span className="text-[8px] text-white/40 leading-snug">Upload file or paste link</span>
                    </div>
                  )}

                  {/* Desktop Preview Content Column */}
                  <div className="flex-1 p-4 flex flex-col justify-between relative z-10 min-w-0">
                    <div>
                      <div className="flex gap-1.5 items-center mb-1.5">
                        <span className="px-2 py-0.5 text-[8px] font-black uppercase tracking-wider bg-yellow-300 text-slate-950 rounded-full shadow-sm">
                          {currentOffer.discountPercent && currentOffer.discountPercent > 0 
                            ? `${currentOffer.discountPercent}% SPECIAL` 
                            : (currentOffer.badgeText || 'NEW LAUNCH 🎂')}
                        </span>
                      </div>

                      <h3 className="text-base font-extrabold tracking-tight leading-snug font-serif text-white mb-0.5 truncate">
                        {currentOffer.title || 'Special Floral Promotion'}
                      </h3>
                      {currentOffer.subtitle && (
                        <h4 className="text-[9px] font-bold text-yellow-200 uppercase tracking-wider mb-1.5 truncate">
                          {currentOffer.subtitle}
                        </h4>
                      )}

                      <p className="text-[11px] opacity-85 leading-relaxed mb-3 line-clamp-3">
                        {currentOffer.description || 'Provide a compelling description of the campaign discounts here.'}
                      </p>

                      {/* Coupon Pill */}
                      {currentOffer.code && (
                        <div className="mb-3 bg-black/40 rounded-xl p-1 flex items-center justify-between border border-white/15">
                          <span className="font-mono text-xs font-black tracking-widest text-yellow-300 uppercase pl-2 select-all">
                            {currentOffer.code}
                          </span>
                          <button
                            type="button"
                            onClick={() => {
                              navigator.clipboard.writeText(currentOffer.code || '');
                              setPreviewCopied(true);
                              toast({ title: "Code Copied!", description: `Simulated coupon copy: ${currentOffer.code}` });
                              setTimeout(() => setPreviewCopied(false), 2000);
                            }}
                            className={`text-[9px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                              previewCopied ? 'bg-emerald-500 text-white' : 'bg-white hover:bg-slate-100 text-slate-900'
                            }`}
                          >
                            {previewCopied ? 'Copied!' : 'Copy Code'}
                          </button>
                        </div>
                      )}
                    </div>

                    {/* Interactive CTA Button */}
                    <button
                      type="button"
                      onClick={() => {
                        toast({ title: "CTA Button Clicked", description: `Simulated navigation to ${currentOffer.buttonLink || '/shop'}` });
                      }}
                      className="w-full py-2.5 px-3 bg-gradient-to-r from-amber-400 to-yellow-400 hover:from-amber-300 hover:to-yellow-300 text-slate-950 text-xs font-black uppercase tracking-wider rounded-xl text-center shadow-md transition-all cursor-pointer hover:scale-[1.02] active:scale-95"
                    >
                      {currentOffer.buttonText || 'Explore Collection'}
                    </button>
                  </div>
                </div>
              ) : (
                /* Mobile bottom sheet layout popup simulator */
                <div className="w-[280px] h-[460px] bg-slate-900 rounded-[28px] border-4 border-slate-800 overflow-hidden relative flex flex-col justify-end shadow-2xl">
                  
                  {/* Bottom sheet */}
                  <div
                    style={{
                      background: currentOffer.background || festivalThemes[currentOffer.theme || 'general']?.gradient || festivalThemes.general.gradient,
                      color: currentOffer.textColor || '#ffffff'
                    }}
                    className="w-full rounded-t-[20px] p-3.5 text-left font-sans relative border-t border-white/10"
                  >
                    {/* Handle */}
                    <div className="w-8 h-1 bg-white/30 rounded-full mx-auto mb-2.5" />
                    
                    {/* Mobile Image Banner */}
                    {(currentOffer.mobileImageUrl || currentOffer.imageUrl || currentOffer.image) && (
                      <div className="w-full h-24 rounded-xl overflow-hidden mb-2.5 border border-white/10 shadow-inner">
                        <img
                          src={currentOffer.mobileImageUrl || currentOffer.imageUrl || currentOffer.image}
                          alt="Mobile Offer Preview"
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.currentTarget.src = 'https://images.unsplash.com/photo-1563241527-3004b7be0ffd?w=600&auto=format&fit=crop&q=80';
                          }}
                        />
                      </div>
                    )}

                    <div className="flex gap-1 items-center mb-1">
                      <span className="px-2 py-0.5 text-[8px] font-black uppercase tracking-wider bg-yellow-300 text-slate-950 rounded-full shadow-sm">
                        {currentOffer.discountPercent && currentOffer.discountPercent > 0 
                          ? `${currentOffer.discountPercent}% SPECIAL` 
                          : (currentOffer.badgeText || 'NEW LAUNCH 🎂')}
                      </span>
                    </div>

                    <h3 className="text-sm font-bold tracking-tight leading-tight font-serif text-white mb-1 truncate">
                      {currentOffer.title || 'Special Floral Promotion'}
                    </h3>
                    
                    <p className="text-[10px] opacity-85 leading-relaxed mb-2.5 line-clamp-2">
                      {currentOffer.description || 'Provide a compelling description of the discounts here.'}
                    </p>

                    {currentOffer.code && (
                      <div className="mb-2.5 bg-black/35 rounded-lg p-1 flex items-center justify-between border border-white/10">
                        <span className="font-mono text-[11px] font-bold text-yellow-300 uppercase pl-1.5">
                          {currentOffer.code}
                        </span>
                        <button
                          type="button"
                          onClick={() => {
                            navigator.clipboard.writeText(currentOffer.code || '');
                            setPreviewCopied(true);
                            toast({ title: "Code Copied!", description: `Simulated coupon copy: ${currentOffer.code}` });
                            setTimeout(() => setPreviewCopied(false), 2000);
                          }}
                          className={`text-[8px] font-bold uppercase tracking-wider px-2 py-1 rounded transition-all cursor-pointer ${
                            previewCopied ? 'bg-emerald-500 text-white' : 'bg-white text-slate-900'
                          }`}
                        >
                          {previewCopied ? 'Copied' : 'Copy'}
                        </button>
                      </div>
                    )}

                    <button
                      type="button"
                      onClick={() => {
                        toast({ title: "CTA Button Clicked", description: `Simulated navigation to ${currentOffer.buttonLink || '/shop'}` });
                      }}
                      className="w-full py-2 px-3 bg-amber-400 hover:bg-amber-300 text-slate-950 text-xs font-bold uppercase rounded-lg text-center font-sans shadow-md cursor-pointer transition-all active:scale-95"
                    >
                      {currentOffer.buttonText || 'Explore Collection'}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Campaigns lists (default view) */}
      {!showForm && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-bold">Active Campaigns</h2>
          </div>

          {isLoading ? (
            <div className="text-slate-400 italic">Loading popup campaigns data...</div>
          ) : offers.length === 0 ? (
            <div className="text-slate-500 italic p-12 text-center border border-dashed border-slate-800 rounded-3xl bg-slate-900/10">
              No seasonal popup campaigns found. Click "Add Campaign Popup" to design your first offer popup.
            </div>
          ) : (
            <div className="grid gap-4">
              {offers.map((offer) => (
                <div
                  key={offer._id}
                  className={`p-5 rounded-2xl border transition-all ${
                    offer.isActive 
                      ? 'bg-slate-900/60 border-slate-800/80 hover:border-slate-700' 
                      : 'bg-slate-950/20 border-slate-900/80 opacity-60'
                  }`}
                >
                  <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <h3 className="font-bold text-lg text-slate-200">{offer.title}</h3>
                        
                        {offer.isABTesting && (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium bg-purple-950/50 text-purple-300 border border-purple-800/60">
                            🧬 A/B Split Test
                          </span>
                        )}

                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                          offer.theme === 'rakhi' ? 'bg-amber-900/50 text-amber-200 border border-amber-800' :
                          offer.theme === 'valentines' ? 'bg-rose-900/50 text-rose-200 border border-rose-800' :
                          offer.theme === 'diwali' ? 'bg-yellow-900/50 text-yellow-200 border border-yellow-800' :
                          offer.theme === 'christmas' ? 'bg-emerald-900/50 text-emerald-200 border border-emerald-800' :
                          'bg-slate-800/60 text-slate-300'
                        }`}>
                          {offer.theme}
                        </span>
                      </div>
                      
                      <p className="text-sm text-slate-400 line-clamp-1">{offer.description}</p>
                      
                      <div className="flex flex-wrap gap-x-4 gap-y-1 pt-1 text-xs text-slate-500 font-medium">
                        <span className="flex items-center gap-1">
                          <CalendarIcon className="h-3.5 w-3.5 text-slate-400" />
                          {format(new Date(offer.startDate), 'PPP')} - {format(new Date(offer.endDate), 'PPP')}
                        </span>
                        
                        {offer.code && (
                          <span className="flex items-center gap-1">
                            <Tag className="h-3.5 w-3.5 text-slate-400" />
                            Coupon: <span className="font-mono text-slate-300 font-bold uppercase">{offer.code}</span>
                          </span>
                        )}

                        <span className="capitalize">Target: {offer.deviceTargeting} devices</span>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-2 w-full md:w-auto justify-end">
                      {/* View Performance Analytics */}
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setSelectedOfferForAnalytics(offer)}
                        className="border-slate-800 text-slate-300 bg-slate-900/50 hover:bg-slate-850 h-9 rounded-xl"
                      >
                        <BarChart3 className="h-4 w-4 mr-1.5 text-amber-400" />
                        Performance
                      </Button>

                      {/* Edit button */}
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setCurrentOffer(offer);
                          setPopupPurpose(offer.discountPercent && offer.discountPercent > 0 ? 'discount' : 'launch');
                          setIsEditing(true);
                          setShowForm(true);
                          setDesktopFile(null);
                          setMobileFile(null);
                        }}
                        className="border-slate-800 text-slate-300 bg-slate-900/50 hover:bg-slate-850 h-9 rounded-xl"
                      >
                        Edit Layout
                      </Button>

                      {/* Toggle status */}
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => toggleOfferStatus(offer._id)}
                        className={`h-9 rounded-xl border-slate-800 ${offer.isActive ? 'text-emerald-400 hover:text-emerald-500' : 'text-slate-500'}`}
                      >
                        <Power className="h-4 w-4" />
                      </Button>

                      {/* Delete */}
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => deleteOffer(offer._id)}
                        className="border-slate-800 text-red-400 hover:text-red-500 hover:bg-red-950/20 h-9 rounded-xl"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default OffersManager;
