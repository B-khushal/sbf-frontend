import React, { useState, useEffect, useRef } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  Wand2, 
  Camera, 
  Hash, 
  MessageSquare, 
  Flower2, 
  Gift, 
  IndianRupee, 
  Info, 
  X,
  Upload,
  Check,
  ShoppingCart,
  Plus,
  Minus
} from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

type AddonOption = {
  name: string;
  price: number;
  type: 'flower' | 'chocolate';
  quantity?: number;
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
  selectedFlowers: (AddonOption & { quantity: number })[];
  selectedChocolates: (AddonOption & { quantity: number })[];
};

interface CustomizeProductModalProps {
  open: boolean;
  onClose: () => void;
  product: {
    _id: string;
    title: string;
    price: number;
    images: string[];
    customizationOptions: CustomizationOptions;
  };
  onAddToCart: (customizations: CustomizationData, totalPrice: number) => void;
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
  const [uploadedPhoto, setUploadedPhoto] = useState<string | null>(null);

  useEffect(() => {
    // Calculate total price based on selections
    let total = product.price;

    // Add flower add-ons with quantities
    customizations.selectedFlowers.forEach(flower => {
      total += flower.price * (flower.quantity || 1);
    });

    // Add chocolate add-ons with quantities
    customizations.selectedChocolates.forEach(chocolate => {
      total += chocolate.price * (chocolate.quantity || 1);
    });

    // Add message card price if selected
    if (customizations.messageCard && product.customizationOptions.allowMessageCard) {
      total += product.customizationOptions.messageCardPrice;
    }

    setTotalPrice(total);
  }, [customizations, product.price, product.customizationOptions.messageCardPrice]);

  const handlePhotoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        setUploadedPhoto(result);
        setCustomizations(prev => ({
          ...prev,
          photo: result
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const removePhoto = () => {
    setUploadedPhoto(null);
    setCustomizations(prev => ({
      ...prev,
      photo: undefined
    }));
  };

  const toggleFlowerAddon = (addon: AddonOption) => {
    setCustomizations(prev => {
      const isSelected = prev.selectedFlowers.some(f => f.name === addon.name);
      return {
        ...prev,
        selectedFlowers: isSelected
          ? prev.selectedFlowers.filter(f => f.name !== addon.name)
          : [...prev.selectedFlowers, { ...addon, quantity: 1 }]
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
          : [...prev.selectedChocolates, { ...addon, quantity: 1 }]
      };
    });
  };

  const updateFlowerQuantity = (addonName: string, quantity: number) => {
    if (quantity < 1) return;
    setCustomizations(prev => ({
      ...prev,
      selectedFlowers: prev.selectedFlowers.map(f => 
        f.name === addonName ? { ...f, quantity } : f
      )
    }));
  };

  const updateChocolateQuantity = (addonName: string, quantity: number) => {
    if (quantity < 1) return;
    setCustomizations(prev => ({
      ...prev,
      selectedChocolates: prev.selectedChocolates.map(c => 
        c.name === addonName ? { ...c, quantity } : c
      )
    }));
  };

  const handleSubmit = () => {
    onAddToCart(customizations, totalPrice);
    onClose();
  };

  const getAddonTotal = (addons: (AddonOption & { quantity: number })[]) => {
    return addons.reduce((sum, addon) => sum + (addon.price * (addon.quantity || 1)), 0);
  };

  return (
    <TooltipProvider>
      <Dialog open={open} onOpenChange={onClose}>
        <DialogContent className="w-full max-w-[98vw] p-0 sm:p-0 rounded-lg overflow-hidden">
          <DialogHeader className="px-3 py-3 sm:px-6 sm:py-4 border-b bg-gradient-to-r from-purple-50 to-pink-50">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-purple-100">
                  <Wand2 className="h-5 w-5 text-purple-600" />
                </div>
                <div>
                  <DialogTitle className="text-xl font-bold text-gray-900">
                    Customize {product.title}
                  </DialogTitle>
                  <p className="text-sm text-gray-600">Personalize your product with unique touches</p>
                </div>
              </div>
              <Button variant="ghost" size="icon" onClick={onClose}>
                <X className="h-4 w-4" />
              </Button>
            </div>
          </DialogHeader>

          <div className="flex flex-col md:flex-row h-auto md:h-[calc(90vh-140px)]">
            {/* Left Side - Customization Options (and preview/summary on mobile) */}
            <ScrollArea className="flex-1 p-2 sm:p-6 max-h-[70vh] md:max-h-none overflow-y-auto">
              <div className="space-y-4 sm:space-y-8">
                {/* 📸 Photo Upload Section */}
                {product.customizationOptions.allowPhotoUpload && (
                  <Card className="border-2 border-blue-200 bg-blue-50/50 rounded-md p-2 sm:p-4">
                    <CardHeader className="pb-2 sm:pb-3">
                      <CardTitle className="flex items-center gap-2 text-blue-800 text-base sm:text-lg">
                        <Camera className="h-5 w-5" />
                        Upload Your Photo
                        <Tooltip>
                          <TooltipTrigger>
                            <Info className="h-4 w-4 text-blue-600" />
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Upload a personal photo to be included with your order</p>
                          </TooltipContent>
                        </Tooltip>
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2 sm:space-y-4">
                      {uploadedPhoto ? (
                        <div className="relative">
                          <img
                            src={uploadedPhoto}
                            alt="Uploaded photo"
                            className="w-full h-32 sm:h-48 object-cover rounded-lg border-2 border-blue-300"
                          />
                          <Button
                            variant="destructive"
                            size="icon"
                            className="absolute top-2 right-2 h-8 w-8"
                            onClick={removePhoto}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      ) : (
                        <div className="border-2 border-dashed border-blue-300 rounded-lg p-8 text-center hover:border-blue-400 transition-colors">
                          <Upload className="h-12 w-12 text-blue-400 mx-auto mb-4" />
                          <Label htmlFor="photo-upload" className="cursor-pointer">
                            <div className="text-blue-600 font-medium mb-2">Click to upload photo</div>
                            <div className="text-sm text-gray-500">JPG, PNG up to 5MB</div>
                          </Label>
                          <Input
                            id="photo-upload"
                            type="file"
                            accept="image/*"
                            onChange={handlePhotoUpload}
                            className="hidden"
                          />
                        </div>
                      )}
                    </CardContent>
                  </Card>
                )}

                {/* 🔢 Number Input Section */}
                {product.customizationOptions.allowNumberInput && (
                  <Card className="border-2 border-green-200 bg-green-50/50 rounded-md p-2 sm:p-4">
                    <CardHeader className="pb-2 sm:pb-3">
                      <CardTitle className="flex items-center gap-2 text-green-800 text-base sm:text-lg">
                        <Hash className="h-5 w-5" />
                        Add Custom Number
                        <Tooltip>
                          <TooltipTrigger>
                            <Info className="h-4 w-4 text-green-600" />
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Add a special number like age, quantity, or any meaningful number</p>
                          </TooltipContent>
                        </Tooltip>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <Input
                        type="text"
                        placeholder={product.customizationOptions.numberInputLabel}
                        value={customizations.number || ''}
                        onChange={(e) => setCustomizations(prev => ({
                          ...prev,
                          number: e.target.value
                        }))}
                        className="border-green-300 focus:border-green-500 h-10 text-base w-full"
                      />
                    </CardContent>
                  </Card>
                )}

                {/* ✍ Message Card Section */}
                {product.customizationOptions.allowMessageCard && (
                  <Card className="border-2 border-yellow-200 bg-yellow-50/50 rounded-md p-2 sm:p-4">
                    <CardHeader className="pb-2 sm:pb-3">
                      <CardTitle className="flex items-center gap-2 text-yellow-800 text-base sm:text-lg">
                        <MessageSquare className="h-5 w-5" />
                        Personal Message
                        <Tooltip>
                          <TooltipTrigger>
                            <Info className="h-4 w-4 text-yellow-600" />
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Add a personalized message card to your order</p>
                          </TooltipContent>
                        </Tooltip>
                      </CardTitle>
                      <div className="flex items-center gap-2 text-sm text-yellow-700">
                        <IndianRupee className="h-4 w-4" />
                        <span>+{product.customizationOptions.messageCardPrice} extra</span>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <Textarea
                        placeholder="Write your heartfelt message here..."
                        value={customizations.messageCard || ''}
                        onChange={(e) => setCustomizations(prev => ({
                          ...prev,
                          messageCard: e.target.value
                        }))}
                        className="border-yellow-300 focus:border-yellow-500 min-h-[100px] h-10 text-base w-full"
                      />
                    </CardContent>
                  </Card>
                )}

                {/* 🌸 Flower Add-ons Section */}
                {product.customizationOptions.addons.flowers.length > 0 && (
                  <Card className="border-2 border-pink-200 bg-pink-50/50 rounded-md p-2 sm:p-4">
                    <CardHeader className="pb-2 sm:pb-3">
                      <CardTitle className="flex items-center gap-2 text-pink-800 text-base sm:text-lg">
                        <Flower2 className="h-5 w-5" />
                        Choose Flower Add-ons
                        <Tooltip>
                          <TooltipTrigger>
                            <Info className="h-4 w-4 text-pink-600" />
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Select additional flowers to enhance your arrangement</p>
                          </TooltipContent>
                        </Tooltip>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 gap-3">
                        {product.customizationOptions.addons.flowers.map((flower, index) => {
                          const selectedFlower = customizations.selectedFlowers.find(f => f.name === flower.name);
                          const isSelected = !!selectedFlower;
                          const quantity = selectedFlower?.quantity || 0;
                          
                          return (
                            <div
                              key={index}
                              className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                                isSelected
                                  ? 'border-pink-400 bg-pink-100'
                                  : 'border-pink-200 bg-white hover:border-pink-300'
                              }`}
                              onClick={() => toggleFlowerAddon(flower)}
                            >
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                  <Checkbox
                                    checked={isSelected}
                                    className="data-[state=checked]:bg-pink-500 data-[state=checked]:border-pink-500"
                                  />
                                  <div>
                                    <div className="font-medium text-gray-900">{flower.name}</div>
                                    <div className="text-sm text-gray-500">Beautiful addition</div>
                                  </div>
                                </div>
                                <div className="flex items-center gap-3">
                                  <Badge variant="outline" className="border-pink-300 text-pink-700">
                                    +₹{flower.price}
                                  </Badge>
                                  
                                  {/* Quantity Controls */}
                                  {isSelected && (
                                    <div className="flex items-center gap-2 bg-white rounded-lg border border-pink-300 p-1">
                                      <Button
                                        type="button"
                                        variant="ghost"
                                        size="sm"
                                        className="h-6 w-6 p-0 hover:bg-pink-100"
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          updateFlowerQuantity(flower.name, Math.max(1, quantity - 1));
                                        }}
                                      >
                                        <Minus className="h-3 w-3" />
                                      </Button>
                                      <span className="text-sm font-medium text-gray-700 min-w-[20px] text-center">
                                        {quantity}
                                      </span>
                                      <Button
                                        type="button"
                                        variant="ghost"
                                        size="sm"
                                        className="h-6 w-6 p-0 hover:bg-pink-100"
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          updateFlowerQuantity(flower.name, quantity + 1);
                                        }}
                                      >
                                        <Plus className="h-3 w-3" />
                                      </Button>
                                    </div>
                                  )}
                                  
                                  {isSelected && <Check className="h-4 w-4 text-pink-600" />}
                                </div>
                              </div>
                              
                              {/* Quantity Summary */}
                              {isSelected && quantity > 1 && (
                                <div className="mt-2 text-xs text-pink-600">
                                  {quantity} × ₹{flower.price} = ₹{flower.price * quantity}
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* 🍫 Chocolate Add-ons Section */}
                {product.customizationOptions.addons.chocolates.length > 0 && (
                  <Card className="border-2 border-orange-200 bg-orange-50/50 rounded-md p-2 sm:p-4">
                    <CardHeader className="pb-2 sm:pb-3">
                      <CardTitle className="flex items-center gap-2 text-orange-800 text-base sm:text-lg">
                        <Gift className="h-5 w-5" />
                        Chocolates & Treats
                        <Tooltip>
                          <TooltipTrigger>
                            <Info className="h-4 w-4 text-orange-600" />
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Add delicious chocolates and treats to your order</p>
                          </TooltipContent>
                        </Tooltip>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 gap-3">
                        {product.customizationOptions.addons.chocolates.map((chocolate, index) => {
                          const selectedChocolate = customizations.selectedChocolates.find(c => c.name === chocolate.name);
                          const isSelected = !!selectedChocolate;
                          const quantity = selectedChocolate?.quantity || 0;
                          
                          return (
                            <div
                              key={index}
                              className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                                isSelected
                                  ? 'border-orange-400 bg-orange-100'
                                  : 'border-orange-200 bg-white hover:border-orange-300'
                              }`}
                              onClick={() => toggleChocolateAddon(chocolate)}
                            >
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                  <Checkbox
                                    checked={isSelected}
                                    className="data-[state=checked]:bg-orange-500 data-[state=checked]:border-orange-500"
                                  />
                                  <div>
                                    <div className="font-medium text-gray-900">{chocolate.name}</div>
                                    <div className="text-sm text-gray-500">Delicious treat</div>
                                  </div>
                                </div>
                                <div className="flex items-center gap-3">
                                  <Badge variant="outline" className="border-orange-300 text-orange-700">
                                    +₹{chocolate.price}
                                  </Badge>
                                  
                                  {/* Quantity Controls */}
                                  {isSelected && (
                                    <div className="flex items-center gap-2 bg-white rounded-lg border border-orange-300 p-1">
                                      <Button
                                        type="button"
                                        variant="ghost"
                                        size="sm"
                                        className="h-6 w-6 p-0 hover:bg-orange-100"
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          updateChocolateQuantity(chocolate.name, Math.max(1, quantity - 1));
                                        }}
                                      >
                                        <Minus className="h-3 w-3" />
                                      </Button>
                                      <span className="text-sm font-medium text-gray-700 min-w-[20px] text-center">
                                        {quantity}
                                      </span>
                                      <Button
                                        type="button"
                                        variant="ghost"
                                        size="sm"
                                        className="h-6 w-6 p-0 hover:bg-orange-100"
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          updateChocolateQuantity(chocolate.name, quantity + 1);
                                        }}
                                      >
                                        <Plus className="h-3 w-3" />
                                      </Button>
                                    </div>
                                  )}
                                  
                                  {isSelected && <Check className="h-4 w-4 text-orange-600" />}
                                </div>
                              </div>
                              
                              {/* Quantity Summary */}
                              {isSelected && quantity > 1 && (
                                <div className="mt-2 text-xs text-orange-600">
                                  {quantity} × ₹{chocolate.price} = ₹{chocolate.price * quantity}
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
              {/* Mobile: Live Preview & Price Summary */}
              <div className="block md:hidden mt-6 space-y-6">
                {/* Live Preview */}
                <Card className="border-2 border-dashed border-gray-300">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg font-semibold text-gray-800">Live Preview</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="aspect-square rounded-lg bg-white border-2 border-gray-200 flex items-center justify-center overflow-hidden">
                      {product.images.length > 0 ? (
                        <img
                          src={product.images[0]}
                          alt="Product preview"
                          className="max-w-full max-h-full object-contain"
                        />
                      ) : (
                        <div className="text-center text-gray-500 p-4">
                          <Wand2 className="h-12 w-12 mx-auto mb-2 text-gray-400" />
                          <p className="text-sm font-medium">Product Preview</p>
                          <p className="text-xs">No product image available</p>
                        </div>
                      )}
                    </div>
                    
                    {/* Selected Options Preview */}
                    {(customizations.photo || customizations.number || customizations.messageCard || 
                      customizations.selectedFlowers.length > 0 || customizations.selectedChocolates.length > 0) && (
                      <div className="mt-4 space-y-2">
                        <h4 className="text-sm font-medium text-gray-700">Selected Options:</h4>
                        <div className="space-y-1">
                          {customizations.photo && (
                            <div className="flex items-center gap-2 text-xs text-blue-600">
                              <Camera className="h-3 w-3" />
                              <span>Photo uploaded</span>
                            </div>
                          )}
                          {customizations.number && (
                            <div className="flex items-center gap-2 text-xs text-green-600">
                              <Hash className="h-3 w-3" />
                              <span>Number: {customizations.number}</span>
                            </div>
                          )}
                          {customizations.messageCard && (
                            <div className="flex items-center gap-2 text-xs text-yellow-600">
                              <MessageSquare className="h-3 w-3" />
                              <span>Message card added</span>
                            </div>
                          )}
                          {customizations.selectedFlowers.length > 0 && (
                            <div className="flex items-center gap-2 text-xs text-pink-600">
                              <Flower2 className="h-3 w-3" />
                              <span>
                                {customizations.selectedFlowers.reduce((total, f) => total + (f.quantity || 1), 0)} flower(s) selected
                                {customizations.selectedFlowers.some(f => (f.quantity || 1) > 1) && (
                                  <span className="ml-1">
                                    ({customizations.selectedFlowers.map(f => `${f.name}×${f.quantity || 1}`).join(', ')})
                                  </span>
                                )}
                              </span>
                            </div>
                          )}
                          {customizations.selectedChocolates.length > 0 && (
                            <div className="flex items-center gap-2 text-xs text-orange-600">
                              <Gift className="h-3 w-3" />
                              <span>
                                {customizations.selectedChocolates.reduce((total, c) => total + (c.quantity || 1), 0)} chocolate(s) selected
                                {customizations.selectedChocolates.some(c => (c.quantity || 1) > 1) && (
                                  <span className="ml-1">
                                    ({customizations.selectedChocolates.map(c => `${c.name}×${c.quantity || 1}`).join(', ')})
                                  </span>
                                )}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
                {/* Price Summary */}
                <Card className="border-2 border-purple-200 bg-purple-50/50">
                  <CardHeader className="pb-3">
                    <CardTitle className="flex items-center gap-2 text-purple-800">
                      <IndianRupee className="h-5 w-5" />
                      Price Summary
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">Base Price:</span>
                        <span className="font-medium">₹{product.price}</span>
                      </div>
                      
                      {customizations.selectedFlowers.length > 0 && (
                        <div className="flex justify-between items-center">
                          <span className="text-gray-600">Flower Add-ons:</span>
                          <span className="font-medium text-pink-600">+₹{getAddonTotal(customizations.selectedFlowers)}</span>
                        </div>
                      )}
                      
                      {customizations.selectedChocolates.length > 0 && (
                        <div className="flex justify-between items-center">
                          <span className="text-gray-600">Chocolate Add-ons:</span>
                          <span className="font-medium text-orange-600">+₹{getAddonTotal(customizations.selectedChocolates)}</span>
                        </div>
                      )}
                      
                      {customizations.messageCard && (
                        <div className="flex justify-between items-center">
                          <span className="text-gray-600">Message Card:</span>
                          <span className="font-medium text-yellow-600">+₹{product.customizationOptions.messageCardPrice}</span>
                        </div>
                      )}
                      
                      <Separator />
                      
                      <div className="flex justify-between items-center text-lg font-bold text-purple-800">
                        <span>Total Price:</span>
                        <span>₹{totalPrice}</span>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="space-y-3 pt-4">
                      <Button 
                        onClick={handleSubmit}
                        className="w-full bg-purple-600 hover:bg-purple-700 text-white font-semibold py-3 text-base md:text-lg"
                        size="lg"
                      >
                        <ShoppingCart className="mr-2 h-5 w-5" />
                        Add to Cart with Customizations
                      </Button>
                      <Button 
                        variant="outline" 
                        onClick={onClose}
                        className="w-full mt-2"
                      >
                        Cancel
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </ScrollArea>
            {/* Desktop: Right Side - Preview & Price Summary */}
            <div className="hidden md:block w-80 border-t md:border-t-0 md:border-l bg-gray-50 p-4 sm:p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
              <div className="space-y-6">
                {/* Live Preview */}
                <Card className="border-2 border-dashed border-gray-300">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg font-semibold text-gray-800">Live Preview</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="aspect-square rounded-lg bg-white border-2 border-gray-200 flex items-center justify-center overflow-hidden">
                      {product.images.length > 0 ? (
                        <img
                          src={product.images[0]}
                          alt="Product preview"
                          className="max-w-full max-h-full object-contain"
                        />
                      ) : (
                        <div className="text-center text-gray-500 p-4">
                          <Wand2 className="h-12 w-12 mx-auto mb-2 text-gray-400" />
                          <p className="text-sm font-medium">Product Preview</p>
                          <p className="text-xs">No product image available</p>
                        </div>
                      )}
                    </div>
                    
                    {/* Selected Options Preview */}
                    {(customizations.photo || customizations.number || customizations.messageCard || 
                      customizations.selectedFlowers.length > 0 || customizations.selectedChocolates.length > 0) && (
                      <div className="mt-4 space-y-2">
                        <h4 className="text-sm font-medium text-gray-700">Selected Options:</h4>
                        <div className="space-y-1">
                          {customizations.photo && (
                            <div className="flex items-center gap-2 text-xs text-blue-600">
                              <Camera className="h-3 w-3" />
                              <span>Photo uploaded</span>
                            </div>
                          )}
                          {customizations.number && (
                            <div className="flex items-center gap-2 text-xs text-green-600">
                              <Hash className="h-3 w-3" />
                              <span>Number: {customizations.number}</span>
                            </div>
                          )}
                          {customizations.messageCard && (
                            <div className="flex items-center gap-2 text-xs text-yellow-600">
                              <MessageSquare className="h-3 w-3" />
                              <span>Message card added</span>
                            </div>
                          )}
                          {customizations.selectedFlowers.length > 0 && (
                            <div className="flex items-center gap-2 text-xs text-pink-600">
                              <Flower2 className="h-3 w-3" />
                              <span>
                                {customizations.selectedFlowers.reduce((total, f) => total + (f.quantity || 1), 0)} flower(s) selected
                                {customizations.selectedFlowers.some(f => (f.quantity || 1) > 1) && (
                                  <span className="ml-1">
                                    ({customizations.selectedFlowers.map(f => `${f.name}×${f.quantity || 1}`).join(', ')})
                                  </span>
                                )}
                              </span>
                            </div>
                          )}
                          {customizations.selectedChocolates.length > 0 && (
                            <div className="flex items-center gap-2 text-xs text-orange-600">
                              <Gift className="h-3 w-3" />
                              <span>
                                {customizations.selectedChocolates.reduce((total, c) => total + (c.quantity || 1), 0)} chocolate(s) selected
                                {customizations.selectedChocolates.some(c => (c.quantity || 1) > 1) && (
                                  <span className="ml-1">
                                    ({customizations.selectedChocolates.map(c => `${c.name}×${c.quantity || 1}`).join(', ')})
                                  </span>
                                )}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
                {/* Price Summary */}
                <Card className="border-2 border-purple-200 bg-purple-50/50">
                  <CardHeader className="pb-3">
                    <CardTitle className="flex items-center gap-2 text-purple-800">
                      <IndianRupee className="h-5 w-5" />
                      Price Summary
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">Base Price:</span>
                        <span className="font-medium">₹{product.price}</span>
                      </div>
                      
                      {customizations.selectedFlowers.length > 0 && (
                        <div className="flex justify-between items-center">
                          <span className="text-gray-600">Flower Add-ons:</span>
                          <span className="font-medium text-pink-600">+₹{getAddonTotal(customizations.selectedFlowers)}</span>
                        </div>
                      )}
                      
                      {customizations.selectedChocolates.length > 0 && (
                        <div className="flex justify-between items-center">
                          <span className="text-gray-600">Chocolate Add-ons:</span>
                          <span className="font-medium text-orange-600">+₹{getAddonTotal(customizations.selectedChocolates)}</span>
                        </div>
                      )}
                      
                      {customizations.messageCard && (
                        <div className="flex justify-between items-center">
                          <span className="text-gray-600">Message Card:</span>
                          <span className="font-medium text-yellow-600">+₹{product.customizationOptions.messageCardPrice}</span>
                        </div>
                      )}
                      
                      <Separator />
                      
                      <div className="flex justify-between items-center text-lg font-bold text-purple-800">
                        <span>Total Price:</span>
                        <span>₹{totalPrice}</span>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="space-y-3 pt-4">
                      <Button 
                        onClick={handleSubmit}
                        className="w-full bg-purple-600 hover:bg-purple-700 text-white font-semibold py-3 text-base md:text-lg"
                        size="lg"
                      >
                        <ShoppingCart className="mr-2 h-5 w-5" />
                        Add to Cart with Customizations
                      </Button>
                      <Button 
                        variant="outline" 
                        onClick={onClose}
                        className="w-full mt-2"
                      >
                        Cancel
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </TooltipProvider>
  );
} 