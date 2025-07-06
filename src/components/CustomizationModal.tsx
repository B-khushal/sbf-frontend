import React, { useState, useRef } from 'react';
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
  Image as ImageIcon
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
  selectedFlowers: string[];
  selectedChocolates: string[];
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
  
  const [customization, setCustomization] = useState<CustomizationData>({
    uploadedPhoto: undefined,
    customNumber: undefined,
    selectedFlowers: [],
    selectedChocolates: [],
    messageCard: '',
    includeMessageCard: false,
  });

  const [previewUrl, setPreviewUrl] = useState<string>('');

  // Calculate total price including customizations
  const calculateTotalPrice = () => {
    let total = product.price;
    
    // Add flower addon prices
    customization.selectedFlowers.forEach(flowerName => {
      const flower = product.customizationOptions.flowerAddons.find(f => f.name === flowerName);
      if (flower) total += flower.price;
    });

    // Add chocolate addon prices
    customization.selectedChocolates.forEach(chocolateName => {
      const chocolate = product.customizationOptions.chocolateAddons.find(c => c.name === chocolateName);
      if (chocolate) total += chocolate.price;
    });

    // Add message card price
    if (customization.includeMessageCard) {
      total += product.customizationOptions.messageCardPrice;
    }

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

  // Handle flower selection
  const handleFlowerToggle = (flowerName: string) => {
    setCustomization(prev => ({
      ...prev,
      selectedFlowers: prev.selectedFlowers.includes(flowerName)
        ? prev.selectedFlowers.filter(f => f !== flowerName)
        : [...prev.selectedFlowers, flowerName]
    }));
  };

  // Handle chocolate selection
  const handleChocolateToggle = (chocolateName: string) => {
    setCustomization(prev => ({
      ...prev,
      selectedChocolates: prev.selectedChocolates.includes(chocolateName)
        ? prev.selectedChocolates.filter(c => c !== chocolateName)
        : [...prev.selectedChocolates, chocolateName]
    }));
  };

  // Handle add to cart
  const handleAddToCart = () => {
    const customizedProduct = {
      ...product,
      price: calculateTotalPrice(),
      customization: {
        ...customization,
        totalPrice: calculateTotalPrice(),
        basePrice: product.price,
        customizations: {
          photo: customization.uploadedPhoto ? 'Photo uploaded' : null,
          number: customization.customNumber ? `${product.customizationOptions.customNumberLabel}: ${customization.customNumber}` : null,
          flowers: customization.selectedFlowers,
          chocolates: customization.selectedChocolates,
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
      selectedFlowers: [],
      selectedChocolates: [],
      messageCard: '',
      includeMessageCard: false,
    });
    setPreviewUrl('');
    
    toast.success('Customized product added to cart!');
  };

  const totalPrice = calculateTotalPrice();

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-center">
            Customize Your {product.title}
          </DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-full">
          {/* Left Column - Customization Options */}
          <ScrollArea className="h-[70vh] pr-4">
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
                    {product.customizationOptions.flowerAddons.map((flower) => (
                      <div key={flower.name} className="flex items-center space-x-3 p-3 border rounded-lg">
                        <Checkbox
                          id={`flower-${flower.name}`}
                          checked={customization.selectedFlowers.includes(flower.name)}
                          onCheckedChange={() => handleFlowerToggle(flower.name)}
                        />
                        <div className="flex-1">
                          <Label htmlFor={`flower-${flower.name}`} className="font-medium">
                            {flower.name}
                          </Label>
                          <p className="text-sm text-gray-600">{flower.description}</p>
                        </div>
                        <Badge variant="secondary">
                          +{formatPrice(convertPrice(flower.price))}
                        </Badge>
                      </div>
                    ))}
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
                    {product.customizationOptions.chocolateAddons.map((chocolate) => (
                      <div key={chocolate.name} className="flex items-center space-x-3 p-3 border rounded-lg">
                        <Checkbox
                          id={`chocolate-${chocolate.name}`}
                          checked={customization.selectedChocolates.includes(chocolate.name)}
                          onCheckedChange={() => handleChocolateToggle(chocolate.name)}
                        />
                        <div className="flex-1">
                          <Label htmlFor={`chocolate-${chocolate.name}`} className="font-medium">
                            {chocolate.name}
                          </Label>
                          <p className="text-sm text-gray-600">{chocolate.description}</p>
                        </div>
                        <Badge variant="secondary">
                          +{formatPrice(convertPrice(chocolate.price))}
                        </Badge>
                      </div>
                    ))}
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
                {customization.selectedFlowers.length > 0 && (
                  <div className="flex justify-between">
                    <span>Flower Addons</span>
                    <Badge variant="outline">{customization.selectedFlowers.length} selected</Badge>
                  </div>
                )}
                {customization.selectedChocolates.length > 0 && (
                  <div className="flex justify-between">
                    <span>Chocolate Addons</span>
                    <Badge variant="outline">{customization.selectedChocolates.length} selected</Badge>
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
                <div className="flex justify-between">
                  <span>Base Price</span>
                  <span>{formatPrice(convertPrice(product.price))}</span>
                </div>
                {totalPrice > product.price && (
                  <>
                    <Separator />
                    <div className="flex justify-between font-semibold text-lg">
                      <span>Total</span>
                      <span className="text-primary">{formatPrice(convertPrice(totalPrice))}</span>
                    </div>
                  </>
                )}
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