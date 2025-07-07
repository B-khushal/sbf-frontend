import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ImageUpload } from '@/components/ui/ImageUpload';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';

type AddonOption = {
  name: string;
  price: number;
  type: 'flower' | 'chocolate';
};

type CustomizationOptions = {
  allowPhotoUpload: boolean;
  allowNumberInput: boolean;
  numberInputLabel: string;
  allowMessageCard: boolean;
  messageCardPrice: number;
  addons: {
    flowers: AddonOption[];
    chocolates: AddonOption[];
  };
  previewImage: string;
};

type CustomizationData = {
  photo?: string;
  number?: string;
  messageCard?: string;
  selectedFlowers: AddonOption[];
  selectedChocolates: AddonOption[];
};

interface CustomizeProductModalProps {
  open: boolean;
  onClose: () => void;
  product: {
    _id: string;
    title: string;
    price: number;
    customizationOptions: CustomizationOptions;
  };
  onAddToCart: (customizations: CustomizationData) => void;
}

export function CustomizeProductModal({
  open,
  onClose,
  product,
  onAddToCart,
}: CustomizeProductModalProps) {
  const [customizations, setCustomizations] = useState<CustomizationData>({
    selectedFlowers: [],
    selectedChocolates: [],
  });

  const [totalPrice, setTotalPrice] = useState(product.price);

  useEffect(() => {
    // Calculate total price based on selections
    let total = product.price;

    // Add flower add-ons
    customizations.selectedFlowers.forEach(flower => {
      total += flower.price;
    });

    // Add chocolate add-ons
    customizations.selectedChocolates.forEach(chocolate => {
      total += chocolate.price;
    });

    // Add message card price if selected
    if (customizations.messageCard && product.customizationOptions.allowMessageCard) {
      total += product.customizationOptions.messageCardPrice;
    }

    setTotalPrice(total);
  }, [customizations, product.price, product.customizationOptions.messageCardPrice]);

  const handlePhotoUpload = (url: string) => {
    setCustomizations(prev => ({
      ...prev,
      photo: url
    }));
  };

  const toggleFlowerAddon = (addon: AddonOption) => {
    setCustomizations(prev => {
      const isSelected = prev.selectedFlowers.some(f => f.name === addon.name);
      return {
        ...prev,
        selectedFlowers: isSelected
          ? prev.selectedFlowers.filter(f => f.name !== addon.name)
          : [...prev.selectedFlowers, addon]
      };
    });
  };

  const toggleChocolateAddon = (addon: AddonOption) => {
    setCustomizations(prev => {
      const isSelected = prev.selectedChocolates.some(c => c.name === addon.name);
      return {
        ...prev,
        selectedChocolates: isSelected
          ? prev.selectedChocolates.filter(c => c.name !== addon.name)
          : [...prev.selectedChocolates, addon]
      };
    });
  };

  const handleSubmit = () => {
    onAddToCart(customizations);
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Customize {product.title}</DialogTitle>
        </DialogHeader>

        <ScrollArea className="max-h-[80vh] px-1">
          <div className="space-y-6 py-4">
            {/* Left side - Customization options */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-6">
                {/* Photo Upload */}
                {product.customizationOptions.allowPhotoUpload && (
                  <div className="space-y-2">
                    <Label>Upload Photo</Label>
                    <ImageUpload
                      onUpload={handlePhotoUpload}
                      value={customizations.photo}
                    />
                  </div>
                )}

                {/* Number Input */}
                {product.customizationOptions.allowNumberInput && (
                  <div className="space-y-2">
                    <Label>{product.customizationOptions.numberInputLabel}</Label>
                    <Input
                      type="text"
                      value={customizations.number || ''}
                      onChange={(e) => setCustomizations(prev => ({
                        ...prev,
                        number: e.target.value
                      }))}
                    />
                  </div>
                )}

                {/* Message Card */}
                {product.customizationOptions.allowMessageCard && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label>Add Message Card</Label>
                      <span className="text-sm text-gray-500">
                        +₹{product.customizationOptions.messageCardPrice}
                      </span>
                    </div>
                    <Textarea
                      placeholder="Enter your message..."
                      value={customizations.messageCard || ''}
                      onChange={(e) => setCustomizations(prev => ({
                        ...prev,
                        messageCard: e.target.value
                      }))}
                    />
                  </div>
                )}

                {/* Flower Add-ons */}
                {product.customizationOptions.addons.flowers.length > 0 && (
                  <div className="space-y-2">
                    <Label>Flower Add-ons</Label>
                    <div className="grid grid-cols-1 gap-2">
                      {product.customizationOptions.addons.flowers.map((flower, index) => (
                        <Card key={index} className="p-3">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-2">
                              <Checkbox
                                checked={customizations.selectedFlowers.some(f => f.name === flower.name)}
                                onCheckedChange={() => toggleFlowerAddon(flower)}
                              />
                              <span>{flower.name}</span>
                            </div>
                            <span className="text-sm text-gray-500">+₹{flower.price}</span>
                          </div>
                        </Card>
                      ))}
                    </div>
                  </div>
                )}

                {/* Chocolate Add-ons */}
                {product.customizationOptions.addons.chocolates.length > 0 && (
                  <div className="space-y-2">
                    <Label>Chocolate Add-ons</Label>
                    <div className="grid grid-cols-1 gap-2">
                      {product.customizationOptions.addons.chocolates.map((chocolate, index) => (
                        <Card key={index} className="p-3">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-2">
                              <Checkbox
                                checked={customizations.selectedChocolates.some(c => c.name === chocolate.name)}
                                onCheckedChange={() => toggleChocolateAddon(chocolate)}
                              />
                              <span>{chocolate.name}</span>
                            </div>
                            <span className="text-sm text-gray-500">+₹{chocolate.price}</span>
                          </div>
                        </Card>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Right side - Preview */}
              <div className="space-y-4">
                <div className="aspect-square rounded-lg border-2 border-dashed border-gray-200 flex items-center justify-center">
                  {product.customizationOptions.previewImage ? (
                    <img
                      src={product.customizationOptions.previewImage}
                      alt="Preview"
                      className="max-w-full max-h-full object-contain"
                    />
                  ) : (
                    <div className="text-center text-gray-500">
                      <p>Preview</p>
                      <p className="text-sm">Customization preview will appear here</p>
                    </div>
                  )}
                </div>

                {/* Price Summary */}
                <Card className="p-4">
                  <h3 className="font-semibold mb-2">Price Summary</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Base Price:</span>
                      <span>₹{product.price}</span>
                    </div>
                    
                    {customizations.selectedFlowers.length > 0 && (
                      <div className="flex justify-between">
                        <span>Flower Add-ons:</span>
                        <span>+₹{customizations.selectedFlowers.reduce((sum, f) => sum + f.price, 0)}</span>
                      </div>
                    )}
                    
                    {customizations.selectedChocolates.length > 0 && (
                      <div className="flex justify-between">
                        <span>Chocolate Add-ons:</span>
                        <span>+₹{customizations.selectedChocolates.reduce((sum, c) => sum + c.price, 0)}</span>
                      </div>
                    )}
                    
                    {customizations.messageCard && (
                      <div className="flex justify-between">
                        <span>Message Card:</span>
                        <span>+₹{product.customizationOptions.messageCardPrice}</span>
                      </div>
                    )}
                    
                    <div className="border-t pt-2 font-semibold flex justify-between">
                      <span>Total Price:</span>
                      <span>₹{totalPrice}</span>
                    </div>
                  </div>
                </Card>
              </div>
            </div>
          </div>
        </ScrollArea>

        <div className="flex justify-end space-x-2 mt-4">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSubmit}>
            Add to Cart (₹{totalPrice})
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
} 