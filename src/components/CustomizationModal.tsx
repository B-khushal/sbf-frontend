import React, { useState, useRef, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { useCurrency } from '@/contexts/CurrencyContext';
import { toast } from 'sonner';
import { 
  Upload, 
  X, 
  Camera, 
  Hash, 
  Flower2, 
  Gift, 
  MessageSquare, 
  Plus, 
  Minus,
  Image as ImageIcon,
  AlertTriangle
} from 'lucide-react';
import { getImageUrl } from '@/config';

interface CustomizationOption {
  name: string;
  price: number;
  description: string;
  image: string;
}

interface CustomizationOptions {
  allowPhotoUpload: boolean;
  allowCustomNumber: boolean;
  customNumberLabel: string;
  allowFlowerAddons: boolean;
  flowerAddons: CustomizationOption[];
  allowChocolateAddons: boolean;
  chocolateAddons: CustomizationOption[];
  allowMessageCard: boolean;
  messageCardPrice: number;
  baseLayoutImage: string;
}

interface Product {
  _id: string;
  title: string;
  price: number;
  images: string[];
  isCustomizable: boolean;
  customizationOptions: CustomizationOptions;
  discount?: number;
  category: string;
  description: string;
}

interface CustomizationModalProps {
  product: Product;
  isOpen: boolean;
  onClose: () => void;
  onAddToCart: (customizedProduct: any) => void;
}

interface CustomizationData {
  uploadedPhoto?: File;
  customNumber?: number;
  flowerAddonQuantities: Record<string, number>; // { [flowerName]: quantity }
  chocolateAddonQuantities: Record<string, number>; // { [chocolateName]: quantity }
  messageCard: string;
  includeMessageCard: boolean;
}

const CustomizationModal: React.FC<CustomizationModalProps> = ({
  product,
  isOpen,
  onClose,
  onAddToCart
}) => {
  const { formatPrice, convertPrice } = useCurrency();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const modalRef = useRef<HTMLDivElement>(null);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  
  const [customization, setCustomization] = useState<CustomizationData>({
    uploadedPhoto: undefined,
    customNumber: undefined,
    flowerAddonQuantities: {},
    chocolateAddonQuantities: {},
    messageCard: '',
    includeMessageCard: false,
  });

  const [previewUrl, setPreviewUrl] = useState<string>('');
  const [showScrollCaution, setShowScrollCaution] = useState(false);
  const [hasScrolledToTop, setHasScrolledToTop] = useState(false);

  // Auto-scroll to top of page when modal opens
  useEffect(() => {
    if (isOpen) {
      // Set flag to indicate we're scrolling to top
      setHasScrolledToTop(true);
      
      // Scroll to top of page to ensure modal is visible
      window.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
      
      // Also scroll the modal content to top if needed
      setTimeout(() => {
        if (scrollAreaRef.current) {
          scrollAreaRef.current.scrollTop = 0;
        }
        
        // Focus on the modal for better accessibility
        if (modalRef.current) {
          const focusableElement = modalRef.current.querySelector('button, input, textarea, select') as HTMLElement;
          if (focusableElement) {
            focusableElement.focus();
          }
        }
        
        // Reset the flag after a short delay
        setTimeout(() => setHasScrolledToTop(false), 1000);
      }, 300);
    } else {
      // Reset flag when modal closes
      setHasScrolledToTop(false);
    }
  }, [isOpen]);

  // Check if content is scrollable and show caution
  useEffect(() => {
    if (isOpen && scrollAreaRef.current) {
      const checkScrollable = () => {
        const scrollElement = scrollAreaRef.current;
        if (scrollElement) {
          const isScrollable = scrollElement.scrollHeight > scrollElement.clientHeight;
          setShowScrollCaution(isScrollable);
        }
      };

      // Check after a short delay to ensure content is rendered
      setTimeout(checkScrollable, 200);
      
      // Also check on window resize
      window.addEventListener('resize', checkScrollable);
      return () => window.removeEventListener('resize', checkScrollable);
    }
  }, [isOpen, customization]);

  // Calculate total price including customizations
  const calculateTotalPrice = () => {
    // Use discounted price as base if discount exists
    const basePrice = product.discount && product.discount > 0 
      ? product.price * (1 - product.discount / 100)
      : product.price;
    
    let total = basePrice;
    
    // Add flower addon prices (quantity * price)
    Object.entries(customization.flowerAddonQuantities).forEach(([flowerName, qty]) => {
      const flower = product.customizationOptions.flowerAddons.find(f => f.name === flowerName);
      if (flower && qty > 0) {
        total += flower.price * qty;
        console.log(`🌹 Added ${flowerName} x${qty} = ${flower.price * qty}`);
      }
    });

    // Add chocolate addon prices (quantity * price)
    Object.entries(customization.chocolateAddonQuantities).forEach(([chocolateName, qty]) => {
      const chocolate = product.customizationOptions.chocolateAddons.find(c => c.name === chocolateName);
      if (chocolate && qty > 0) {
        total += chocolate.price * qty;
        console.log(`🍫 Added ${chocolateName} x${qty} = ${chocolate.price * qty}`);
      }
    });

    // Add message card price
    if (customization.includeMessageCard) {
      total += product.customizationOptions.messageCardPrice;
      console.log(`💌 Added message card = ${product.customizationOptions.messageCardPrice}`);
    }

    console.log(`💰 Total price calculation: Base ${basePrice} (discounted) + customizations = ${total}`);
    return total;
  };

  // Handle photo upload
  const handlePhotoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        toast.error('Photo size should be less than 5MB');
        return;
      }
      
      setCustomization(prev => ({ ...prev, uploadedPhoto: file }));
      
      // Create preview URL
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    }
  };

  // Handle flower quantity change
  const handleFlowerQuantityChange = (flowerName: string, delta: number) => {
    console.log(`🌹 Changing ${flowerName} quantity by ${delta}`);
    setCustomization(prev => {
      const current = prev.flowerAddonQuantities[flowerName] || 0;
      const next = Math.max(0, current + delta);
      console.log(`🌹 ${flowerName}: ${current} -> ${next}`);
      return {
        ...prev,
        flowerAddonQuantities: {
          ...prev.flowerAddonQuantities,
          [flowerName]: next
        }
      };
    });
  };

  // Handle chocolate quantity change
  const handleChocolateQuantityChange = (chocolateName: string, delta: number) => {
    console.log(`🍫 Changing ${chocolateName} quantity by ${delta}`);
    setCustomization(prev => {
      const current = prev.chocolateAddonQuantities[chocolateName] || 0;
      const next = Math.max(0, current + delta);
      console.log(`🍫 ${chocolateName}: ${current} -> ${next}`);
      return {
        ...prev,
        chocolateAddonQuantities: {
          ...prev.chocolateAddonQuantities,
          [chocolateName]: next
        }
      };
    });
  };

  // Handle add to cart
  const handleAddToCart = () => {
    const basePrice = product.discount && product.discount > 0 
      ? product.price * (1 - product.discount / 100)
      : product.price;
    
    const customizedProduct = {
      _id: product._id,
      title: product.title,
      price: calculateTotalPrice(),
      images: product.images,
      quantity: 1,
      discount: product.discount || 0,
      category: product.category,
      description: product.description,
      originalPrice: product.price, // Original price before discount
      basePrice: basePrice, // Price after discount (used for customizations)
      customization: {
        uploadedPhoto: customization.uploadedPhoto,
        customNumber: customization.customNumber,
        flowerAddonQuantities: customization.flowerAddonQuantities,
        chocolateAddonQuantities: customization.chocolateAddonQuantities,
        messageCard: customization.messageCard,
        includeMessageCard: customization.includeMessageCard,
        totalPrice: calculateTotalPrice(),
        basePrice: basePrice,
        customizations: {
          photo: customization.uploadedPhoto ? 'Photo uploaded' : null,
          number: customization.customNumber ? `${product.customizationOptions.customNumberLabel}: ${customization.customNumber}` : null,
          flowers: Object.entries(customization.flowerAddonQuantities).filter(([_, qty]) => qty > 0).map(([name, qty]) => ({ name, qty })),
          chocolates: Object.entries(customization.chocolateAddonQuantities).filter(([_, qty]) => qty > 0).map(([name, qty]) => ({ name, qty })),
          messageCard: customization.includeMessageCard ? customization.messageCard : null,
        }
      }
    };

    onAddToCart(customizedProduct);
    onClose();
    
    // Reset form
    setCustomization({
      uploadedPhoto: undefined,
      customNumber: undefined,
      flowerAddonQuantities: {},
      chocolateAddonQuantities: {},
      messageCard: '',
      includeMessageCard: false,
    });
    setPreviewUrl('');
    
    toast.success('Customized product added to cart!');
  };

  const totalPrice = calculateTotalPrice();

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh]" ref={modalRef}>
        <DialogHeader>
          <DialogTitle className={`text-2xl font-bold text-center transition-all duration-500 ${hasScrolledToTop ? 'animate-pulse bg-gradient-to-r from-blue-50 to-purple-50 p-4 rounded-lg border-2 border-blue-200' : ''}`}>
            {hasScrolledToTop && (
              <div className="flex items-center justify-center gap-2 mb-2 text-blue-600">
                <span className="text-sm">📱</span>
                <span className="text-sm font-medium">Modal opened at top of page</span>
                <span className="text-sm">📱</span>
              </div>
            )}
            Customize Your {product.title}
          </DialogTitle>
          
          {/* Scroll Caution Message */}
          {showScrollCaution && (
            <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-lg">
              <div className="flex items-center gap-2 text-amber-700">
                <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                <span className="text-sm font-medium">
                  ⚠️ Scroll down to view all customization options
                </span>
              </div>
            </div>
          )}
        </DialogHeader>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-full">
          {/* Left Column - Customization Options */}
          <ScrollArea className="h-[70vh] pr-4" ref={scrollAreaRef}>
            <div className="space-y-6">
              {/* Photo Upload */}
              {product.customizationOptions.allowPhotoUpload && (
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Camera className="w-5 h-5 text-primary" />
                    <Label className="text-lg font-semibold">Upload Personal Photo</Label>
                  </div>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
                    {previewUrl ? (
                      <div className="space-y-2">
                        <img 
                          src={previewUrl} 
                          alt="Preview" 
                          className="w-32 h-32 object-cover rounded-lg mx-auto"
                        />
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setCustomization(prev => ({ ...prev, uploadedPhoto: undefined }));
                            setPreviewUrl('');
                          }}
                        >
                          <X className="w-4 h-4 mr-2" />
                          Remove Photo
                        </Button>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <ImageIcon className="w-12 h-12 text-gray-400 mx-auto" />
                        <p className="text-sm text-gray-600">Upload a personal photo</p>
                        <Button
                          variant="outline"
                          onClick={() => fileInputRef.current?.click()}
                        >
                          <Upload className="w-4 h-4 mr-2" />
                          Choose Photo
                        </Button>
                      </div>
                    )}
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handlePhotoUpload}
                      className="hidden"
                    />
                  </div>
                </div>
              )}

              {/* Custom Number */}
              {product.customizationOptions.allowCustomNumber && (
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Hash className="w-5 h-5 text-primary" />
                    <Label className="text-lg font-semibold">
                      {product.customizationOptions.customNumberLabel}
                    </Label>
                  </div>
                  <Input
                    type="number"
                    placeholder={`Enter ${product.customizationOptions.customNumberLabel.toLowerCase()}`}
                    value={customization.customNumber || ''}
                    onChange={(e) => setCustomization(prev => ({ 
                      ...prev, 
                      customNumber: e.target.value ? parseInt(e.target.value) : undefined 
                    }))}
                    min="1"
                    max="999"
                  />
                </div>
              )}

              {/* Flower Addons */}
              {product.customizationOptions.allowFlowerAddons && product.customizationOptions.flowerAddons.length > 0 && (
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Flower2 className="w-5 h-5 text-primary" />
                    <Label className="text-lg font-semibold">Add More Flowers</Label>
                  </div>
                  <div className="space-y-2">
                    {product.customizationOptions.flowerAddons.map((flower) => {
                      const qty = customization.flowerAddonQuantities[flower.name] || 0;
                      return (
                        <div key={flower.name} className="flex items-center space-x-3 p-3 border rounded-lg">
                          <div className="flex-1">
                            <Label className="font-medium">{flower.name}</Label>
                            <p className="text-sm text-gray-600">{flower.description}</p>
                          </div>
                          <div className="flex items-center gap-2">
                            <Button size="icon" variant="outline" onClick={() => handleFlowerQuantityChange(flower.name, -1)} disabled={qty === 0}><Minus size={16} /></Button>
                            <span className="w-6 text-center">{qty}</span>
                            <Button size="icon" variant="outline" onClick={() => handleFlowerQuantityChange(flower.name, 1)}><Plus size={16} /></Button>
                          </div>
                          <Badge variant="secondary">
                            +{formatPrice(convertPrice(flower.price))} each
                          </Badge>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Chocolate Addons */}
              {product.customizationOptions.allowChocolateAddons && product.customizationOptions.chocolateAddons.length > 0 && (
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Gift className="w-5 h-5 text-primary" />
                    <Label className="text-lg font-semibold">Add More Chocolates</Label>
                  </div>
                  <div className="space-y-2">
                    {product.customizationOptions.chocolateAddons.map((chocolate) => {
                      const qty = customization.chocolateAddonQuantities[chocolate.name] || 0;
                      return (
                        <div key={chocolate.name} className="flex items-center space-x-3 p-3 border rounded-lg">
                          <div className="flex-1">
                            <Label className="font-medium">{chocolate.name}</Label>
                            <p className="text-sm text-gray-600">{chocolate.description}</p>
                          </div>
                          <div className="flex items-center gap-2">
                            <Button size="icon" variant="outline" onClick={() => handleChocolateQuantityChange(chocolate.name, -1)} disabled={qty === 0}><Minus size={16} /></Button>
                            <span className="w-6 text-center">{qty}</span>
                            <Button size="icon" variant="outline" onClick={() => handleChocolateQuantityChange(chocolate.name, 1)}><Plus size={16} /></Button>
                          </div>
                          <Badge variant="secondary">
                            +{formatPrice(convertPrice(chocolate.price))} each
                          </Badge>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Message Card */}
              {product.customizationOptions.allowMessageCard && (
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <MessageSquare className="w-5 h-5 text-primary" />
                    <Label className="text-lg font-semibold">Add Message Card</Label>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center space-x-3">
                      <Checkbox
                        id="message-card"
                        checked={customization.includeMessageCard}
                        onCheckedChange={(checked) => setCustomization(prev => ({ 
                          ...prev, 
                          includeMessageCard: checked as boolean 
                        }))}
                      />
                      <Label htmlFor="message-card">Include message card</Label>
                      {product.customizationOptions.messageCardPrice > 0 && (
                        <Badge variant="secondary">
                          +{formatPrice(convertPrice(product.customizationOptions.messageCardPrice))}
                        </Badge>
                      )}
                    </div>
                    {customization.includeMessageCard && (
                      <Textarea
                        placeholder="Write your personal message here..."
                        value={customization.messageCard}
                        onChange={(e) => setCustomization(prev => ({ 
                          ...prev, 
                          messageCard: e.target.value 
                        }))}
                        rows={4}
                        maxLength={200}
                      />
                    )}
                  </div>
                </div>
              )}
            </div>
          </ScrollArea>

          {/* Right Column - Preview and Summary */}
          <div className="space-y-4">
            {/* Product Preview */}
            <div className="border rounded-lg p-4">
              <h3 className="font-semibold mb-3">Product Preview</h3>
              <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden">
                <img
                  src={getImageUrl(product.images[0])}
                  alt={product.title}
                  className="w-full h-full object-cover"
                />
              </div>
              <h4 className="font-medium mt-2">{product.title}</h4>
            </div>

            {/* Customization Summary */}
            <div className="border rounded-lg p-4">
              <h3 className="font-semibold mb-3">Customization Summary</h3>
              <div className="space-y-2 text-sm">
                {customization.uploadedPhoto && (
                  <div className="flex justify-between">
                    <span>Personal Photo</span>
                    <Badge variant="outline">Added</Badge>
                  </div>
                )}
                {customization.customNumber && (
                  <div className="flex justify-between">
                    <span>{product.customizationOptions.customNumberLabel}</span>
                    <Badge variant="outline">{customization.customNumber}</Badge>
                  </div>
                )}
                {Object.entries(customization.flowerAddonQuantities).filter(([_, qty]) => qty > 0).length > 0 && (
                  <div className="flex justify-between">
                    <span>Flower Addons</span>
                    <span>
                      {Object.entries(customization.flowerAddonQuantities)
                        .filter(([_, qty]) => qty > 0)
                        .map(([name, qty]) => `${name} x${qty}`)
                        .join(', ')}
                    </span>
                  </div>
                )}
                {Object.entries(customization.chocolateAddonQuantities).filter(([_, qty]) => qty > 0).length > 0 && (
                  <div className="flex justify-between">
                    <span>Chocolate Addons</span>
                    <span>
                      {Object.entries(customization.chocolateAddonQuantities)
                        .filter(([_, qty]) => qty > 0)
                        .map(([name, qty]) => `${name} x${qty}`)
                        .join(', ')}
                    </span>
                  </div>
                )}
                {customization.includeMessageCard && (
                  <div className="flex justify-between">
                    <span>Message Card</span>
                    <Badge variant="outline">Added</Badge>
                  </div>
                )}
              </div>
            </div>

            {/* Price Summary */}
            <div className="border rounded-lg p-4">
              <h3 className="font-semibold mb-3">Price Summary</h3>
              <div className="space-y-2">
                {/* Base Price with Discount */}
                <div className="flex justify-between items-center">
                  <span>Base Price</span>
                  <div className="text-right">
                    {product.discount && product.discount > 0 ? (
                      <>
                        <div className="text-sm text-gray-500 line-through">
                          {formatPrice(convertPrice(product.price))}
                        </div>
                        <div className="font-medium text-primary">
                          {formatPrice(convertPrice(product.price * (1 - product.discount / 100)))}
                          <span className="text-xs text-red-500 ml-1">({product.discount}% OFF)</span>
                        </div>
                      </>
                    ) : (
                  <span>{formatPrice(convertPrice(product.price))}</span>
                    )}
                  </div>
                </div>

                {/* Customization Costs */}
                {(() => {
                  const basePrice = product.discount && product.discount > 0 
                    ? product.price * (1 - product.discount / 100)
                    : product.price;
                  const customizationCost = totalPrice - basePrice;
                  
                  if (customizationCost > 0) {
                    return (
                      <>
                        <Separator />
                        <div className="space-y-1">
                          <div className="flex justify-between text-sm">
                            <span>Customizations:</span>
                            <span>{formatPrice(convertPrice(customizationCost))}</span>
                          </div>
                          {Object.entries(customization.flowerAddonQuantities).filter(([_, qty]) => qty > 0).length > 0 && (
                            <div className="text-xs text-gray-600 pl-2">
                              {Object.entries(customization.flowerAddonQuantities)
                                .filter(([_, qty]) => qty > 0)
                                .map(([name, qty]) => {
                                  const flower = product.customizationOptions.flowerAddons.find(f => f.name === name);
                                  return flower ? `${name} x${qty} = ${formatPrice(convertPrice(flower.price * qty))}` : '';
                                })
                                .filter(Boolean)
                                .join(', ')}
                            </div>
                          )}
                          {Object.entries(customization.chocolateAddonQuantities).filter(([_, qty]) => qty > 0).length > 0 && (
                            <div className="text-xs text-gray-600 pl-2">
                              {Object.entries(customization.chocolateAddonQuantities)
                                .filter(([_, qty]) => qty > 0)
                                .map(([name, qty]) => {
                                  const chocolate = product.customizationOptions.chocolateAddons.find(c => c.name === name);
                                  return chocolate ? `${name} x${qty} = ${formatPrice(convertPrice(chocolate.price * qty))}` : '';
                                })
                                .filter(Boolean)
                                .join(', ')}
                            </div>
                          )}
                          {customization.includeMessageCard && (
                            <div className="text-xs text-gray-600 pl-2">
                              Message card: {formatPrice(convertPrice(product.customizationOptions.messageCardPrice))}
                            </div>
                          )}
                        </div>
                      </>
                    );
                  }
                  return null;
                })()}

                    <Separator />
                    <div className="flex justify-between font-semibold text-lg">
                      <span>Total</span>
                      <span className="text-primary">{formatPrice(convertPrice(totalPrice))}</span>
                    </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={onClose}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                onClick={handleAddToCart}
                className="flex-1 bg-gradient-to-r from-primary to-secondary"
              >
                Add to Cart - {formatPrice(convertPrice(totalPrice))}
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CustomizationModal; 