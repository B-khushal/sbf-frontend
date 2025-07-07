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
import { uploadToCloudinary } from '@/lib/cloudinaryUpload';

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
  const [isConfirmed, setIsConfirmed] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

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

  const handlePhotoUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setIsUploading(true);
      try {
        const url = await uploadToCloudinary(file);
        setUploadedPhoto(url);
        setCustomizations(prev => ({
          ...prev,
          photo: url
        }));
      } catch (err) {
        alert('Failed to upload image. Please try again.');
      } finally {
        setIsUploading(false);
      }
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

  const handleConfirm = () => setIsConfirmed(true);

  const handleSubmit = () => {
    onAddToCart(customizations, totalPrice);
    onClose();
    setIsConfirmed(false); // Reset for next open
  };

  const getAddonTotal = (addons: (AddonOption & { quantity: number })[]) => {
    return addons.reduce((sum, addon) => sum + (addon.price * (addon.quantity || 1)), 0);
  };

  return (
    <TooltipProvider>
      <Dialog open={open} onOpenChange={onClose}>
        <DialogContent className="w-full max-w-full rounded-none bg-white shadow-none p-0 sm:rounded-lg sm:max-w-2xl md:max-w-4xl">
          <DialogHeader className="fixed top-0 left-0 w-full z-20 bg-white px-4 py-3 border-b flex justify-between items-center md:static md:rounded-t-lg md:shadow md:px-6 md:py-4">
            <span className="text-lg font-semibold text-gray-900 truncate">Customize {product.title}</span>
            <Button variant="ghost" size="icon" onClick={onClose} className="h-10 w-10">
              <X className="h-5 w-5" />
            </Button>
          </DialogHeader>
          <div className="pt-[56px] pb-0 px-3 md:pt-0 md:pb-0 md:px-6 flex flex-col gap-3 md:flex-row md:gap-6">
            <div className="flex-1 md:pr-6 overflow-y-auto overflow-x-hidden pb-6">
              <img src={product.images[0]} alt="Preview" className="w-24 h-24 mx-auto rounded mb-2 object-cover border border-gray-100" />
              <div className="space-y-3">
                {/* 📸 Photo Upload Section */}
                {product.customizationOptions.allowPhotoUpload && (
                  <Card className="border-2 border-blue-200 bg-blue-50/50 rounded-md p-3 mb-3">
                    <CardHeader className="pb-2">
                      <CardTitle className="flex items-center gap-2 text-blue-800 text-base font-medium">
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
                    <CardContent className="space-y-2">
                      {uploadedPhoto ? (
                        <div className="relative">
                          <img
                            src={uploadedPhoto}
                            alt="Uploaded photo"
                            className="w-full h-28 sm:h-40 object-cover rounded-md border-2 border-blue-300 mx-auto"
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
                            disabled={isUploading}
                            className="hidden h-11 text-base w-full mb-2"
                          />
                          {isUploading && <span className="text-sm text-blue-600">Uploading...</span>}
                          {uploadedPhoto && (
                            <div className="mt-2 flex flex-col items-center">
                              <img src={uploadedPhoto} alt="Uploaded" className="w-24 h-24 object-cover rounded border" />
                              <Button variant="ghost" size="sm" onClick={removePhoto} className="mt-1">Remove</Button>
                            </div>
                          )}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                )}

                {/* 🔢 Number Input Section */}
                {product.customizationOptions.allowNumberInput && (
                  <Card className="border-2 border-green-200 bg-green-50/50 rounded-md p-3 mb-3">
                    <CardHeader className="pb-2">
                      <CardTitle className="flex items-center gap-2 text-green-800 text-base font-medium">
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
                        className="h-11 text-base w-full mb-2 border-green-300 focus:border-green-500"
                      />
                    </CardContent>
                  </Card>
                )}

                {/* ✍ Message Card Section */}
                {product.customizationOptions.allowMessageCard && (
                  <Card className="border-2 border-yellow-200 bg-yellow-50/50 rounded-md p-3 mb-3">
                    <CardHeader className="pb-2">
                      <CardTitle className="flex items-center gap-2 text-yellow-800 text-base font-medium">
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
                        className="h-11 text-base w-full mb-2 border-yellow-300 focus:border-yellow-500 min-h-[100px]"
                      />
                    </CardContent>
                  </Card>
                )}

                {/* 🌸 Flower Add-ons Section */}
                {product.customizationOptions.addons.flowers.length > 0 && (
                  <Card className="border-2 border-pink-200 bg-pink-50/50 rounded-md p-3 mb-3">
                    <CardHeader className="pb-2">
                      <CardTitle className="flex items-center gap-2 text-pink-800 text-base font-medium">
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
                  <Card className="border-2 border-orange-200 bg-orange-50/50 rounded-md p-3 mb-3">
                    <CardHeader className="pb-2">
                      <CardTitle className="flex items-center gap-2 text-orange-800 text-base font-medium">
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
              <div className="block md:hidden mt-4">
                <Card className="border-2 border-purple-200 bg-purple-50/50 mb-3">
                  <CardHeader className="pb-2">
                    <CardTitle className="flex items-center gap-2 text-purple-800 text-base font-medium">
                      <IndianRupee className="h-5 w-5" /> Price Summary
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2 text-sm">
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
                  </CardContent>
                </Card>
                {!isConfirmed ? (
                  <Button onClick={handleConfirm} className="h-12 rounded bg-primary text-white w-full text-base font-semibold">Confirm</Button>
                ) : (
                  <Button onClick={handleSubmit} className="h-12 rounded bg-green-600 text-white w-full text-base font-semibold">Add to Cart</Button>
                )}
              </div>
            </div>
            {/* Right: Preview & Price Summary (Laptop/Desktop only) */}
            <div className="hidden md:block md:w-96 flex-shrink-0">
              <Card className="sticky top-24 border-2 border-primary/20 bg-white/90 shadow-lg rounded-lg">
                <CardHeader>
                  <CardTitle className="text-lg font-bold text-primary">Preview & Price Summary</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Large Preview Image */}
                  <div className="flex flex-col items-center">
                    <img
                      src={uploadedPhoto || product.images[0] || product.customizationOptions.previewImage}
                      alt="Product Preview"
                      className="w-48 h-48 object-cover rounded-lg border border-gray-200 mb-2"
                    />
                    <div className="text-center text-base font-semibold text-gray-800 mt-1">{product.title}</div>
                  </div>
                  {/* Customization Summary */}
                  <div className="space-y-2">
                    {customizations.number && (
                      <div className="flex items-center gap-2 text-sm text-gray-700">
                        <Hash className="w-4 h-4 text-primary" />
                        <span>Number: <span className="font-medium">{customizations.number}</span></span>
                      </div>
                    )}
                    {customizations.messageCard && (
                      <div className="flex items-center gap-2 text-sm text-gray-700">
                        <MessageSquare className="w-4 h-4 text-primary" />
                        <span>Message: <span className="font-medium">"{customizations.messageCard}"</span></span>
                      </div>
                    )}
                    {customizations.selectedFlowers.length > 0 && (
                      <div className="flex items-center gap-2 text-sm text-gray-700">
                        <Flower2 className="w-4 h-4 text-pink-500" />
                        <span>Flowers: {customizations.selectedFlowers.map(f => `${f.name} (x${f.quantity})`).join(', ')}</span>
                      </div>
                    )}
                    {customizations.selectedChocolates.length > 0 && (
                      <div className="flex items-center gap-2 text-sm text-gray-700">
                        <Gift className="w-4 h-4 text-yellow-600" />
                        <span>Chocolates: {customizations.selectedChocolates.map(c => `${c.name} (x${c.quantity})`).join(', ')}</span>
                      </div>
                    )}
                    {uploadedPhoto && (
                      <div className="flex items-center gap-2 text-sm text-gray-700">
                        <Camera className="w-4 h-4 text-blue-500" />
                        <span>Photo uploaded</span>
                      </div>
                    )}
                  </div>
                  <Separator />
                  {/* Price Summary */}
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Base Price</span>
                      <span className="font-semibold">₹{product.price}</span>
                    </div>
                    {customizations.selectedFlowers.length > 0 && (
                      <div className="flex justify-between text-sm">
                        <span>Flowers Add-ons</span>
                        <span>+ ₹{getAddonTotal(customizations.selectedFlowers)}</span>
                      </div>
                    )}
                    {customizations.selectedChocolates.length > 0 && (
                      <div className="flex justify-between text-sm">
                        <span>Chocolates Add-ons</span>
                        <span>+ ₹{getAddonTotal(customizations.selectedChocolates)}</span>
                      </div>
                    )}
                    {customizations.messageCard && product.customizationOptions.allowMessageCard && (
                      <div className="flex justify-between text-sm">
                        <span>Message Card</span>
                        <span>+ ₹{product.customizationOptions.messageCardPrice}</span>
                      </div>
                    )}
                    <Separator />
                    <div className="flex justify-between text-base font-bold text-primary">
                      <span>Total</span>
                      <span>₹{totalPrice}</span>
                    </div>
                  </div>
                  {/* Confirm/Add to Cart buttons for laptop view */}
                  {!isConfirmed ? (
                    <Button onClick={handleConfirm} className="mt-6 w-full h-12 rounded bg-primary text-white text-base font-semibold">Confirm</Button>
                  ) : (
                    <Button onClick={handleSubmit} className="mt-6 w-full h-12 rounded bg-green-600 text-white text-base font-semibold">Add to Cart</Button>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </TooltipProvider>
  );
} 