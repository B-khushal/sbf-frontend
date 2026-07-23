import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Gift, Plus, X, Trash2, Package, ShoppingBasket } from 'lucide-react';
import type { ProductData } from '@/services/productService';

const HAMPER_ITEM_TYPES = [
  'Flowers', 'Cake', 'Chocolate', 'Dry Fruits', 'Sweets', 'Cookies',
  'Wine / Beverage', 'Soft Toy', 'Greeting Card', 'Candle', 'Perfume',
  'Skincare', 'Jewellery', 'Snacks', 'Fruits', 'Plant', 'Customized Item',
  'Photo Frame', 'Mug', 'Cushion', 'Gift Voucher', 'Other'
];

interface HamperFormSectionProps {
  formData: ProductData;
  setFormData: React.Dispatch<React.SetStateAction<ProductData>>;
}

const HamperFormSection: React.FC<HamperFormSectionProps> = ({ formData, setFormData }) => {
  const attrs = formData.hamperAttributes || {};
  const items = attrs.hamperItems || [];

  const [newItem, setNewItem] = useState({
    name: '',
    type: '',
    price: 0,
    image: '',
    quantity: 1,
  });

  const addItem = () => {
    if (!newItem.name.trim() || !newItem.type) return;
    setFormData(prev => ({
      ...prev,
      hamperAttributes: {
        ...prev.hamperAttributes,
        hamperItems: [
          ...(prev.hamperAttributes?.hamperItems || []),
          { ...newItem }
        ]
      }
    }));
    setNewItem({ name: '', type: '', price: 0, image: '', quantity: 1 });
  };

  const removeItem = (index: number) => {
    setFormData(prev => ({
      ...prev,
      hamperAttributes: {
        ...prev.hamperAttributes,
        hamperItems: (prev.hamperAttributes?.hamperItems || []).filter((_, i) => i !== index)
      }
    }));
  };

  const totalValue = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  return (
    <Card className="border-2 border-violet-200/80 bg-gradient-to-br from-violet-50/80 via-purple-50/40 to-fuchsia-50/20 shadow-lg rounded-2xl overflow-hidden">
      <CardHeader className="bg-gradient-to-r from-violet-100/60 to-purple-100/40 border-b border-violet-200/60 pb-5">
        <CardTitle className="flex items-center gap-3 text-violet-900">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 shadow-md">
            <Gift className="h-5.5 w-5.5 text-white" />
          </div>
          <div>
            <span className="text-lg font-bold tracking-tight">Hamper Contents</span>
            <p className="text-xs text-violet-700/80 font-normal mt-0.5">Add all items included in this gift hamper / basket</p>
          </div>
          {items.length > 0 && (
            <Badge className="ml-auto bg-violet-600 text-white text-xs py-1 px-3 rounded-lg shadow-sm">
              {items.length} item{items.length > 1 ? 's' : ''} · ₹{totalValue.toLocaleString('en-IN')}
            </Badge>
          )}
        </CardTitle>
      </CardHeader>

      <CardContent className="pt-6 space-y-6">
        {/* Add New Hamper Item */}
        <div className="rounded-xl border border-violet-200 bg-white p-5 space-y-4 shadow-sm">
          <h4 className="text-sm font-semibold text-violet-900 flex items-center gap-2">
            <Plus className="h-4 w-4 text-violet-600" /> Add Hamper Item
          </h4>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="space-y-1.5 md:col-span-2">
              <Label className="text-xs text-violet-800">Item Name *</Label>
              <Input
                value={newItem.name}
                onChange={(e) => setNewItem(prev => ({ ...prev, name: e.target.value }))}
                placeholder="e.g., Ferrero Rocher Box"
                className="h-9 text-sm border-violet-200 focus:ring-violet-400 rounded-xl bg-white"
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs text-violet-800">Item Type *</Label>
              <Select value={newItem.type} onValueChange={(v) => setNewItem(prev => ({ ...prev, type: v }))}>
                <SelectTrigger className="h-9 text-sm border-violet-200 focus:ring-violet-400 rounded-xl bg-white">
                  <SelectValue placeholder="Type..." />
                </SelectTrigger>
                <SelectContent className="max-h-60">
                  {HAMPER_ITEM_TYPES.map(t => (
                    <SelectItem key={t} value={t.toLowerCase()} className="text-sm">{t}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs text-violet-800">Price (₹)</Label>
              <Input
                type="number"
                value={newItem.price}
                onChange={(e) => setNewItem(prev => ({ ...prev, price: Number(e.target.value) }))}
                min="0"
                className="h-9 text-sm border-violet-200 focus:ring-violet-400 rounded-xl bg-white"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="space-y-1.5">
              <Label className="text-xs text-violet-800">Quantity</Label>
              <Input
                type="number"
                value={newItem.quantity}
                onChange={(e) => setNewItem(prev => ({ ...prev, quantity: Math.max(1, Number(e.target.value)) }))}
                min="1"
                className="h-9 text-sm border-violet-200 focus:ring-violet-400 rounded-xl bg-white"
              />
            </div>

            <div className="space-y-1.5 md:col-span-2">
              <Label className="text-xs text-violet-800">Image URL (optional)</Label>
              <Input
                value={newItem.image}
                onChange={(e) => setNewItem(prev => ({ ...prev, image: e.target.value }))}
                placeholder="https://..."
                className="h-9 text-sm border-violet-200 focus:ring-violet-400 rounded-xl bg-white"
              />
            </div>

            <div className="flex items-end">
              <Button
                type="button"
                onClick={addItem}
                disabled={!newItem.name.trim() || !newItem.type}
                className="w-full h-9 bg-violet-600 hover:bg-violet-700 text-white text-xs font-semibold rounded-xl gap-1.5 shadow-sm"
              >
                <Plus className="h-3.5 w-3.5" /> Add to Hamper
              </Button>
            </div>
          </div>
        </div>

        <Separator className="bg-violet-200/60" />

        {/* Existing Hamper Items List */}
        {items.length === 0 ? (
          <div className="text-center py-10 text-violet-500/60 text-sm">
            <ShoppingBasket className="h-10 w-10 mx-auto mb-3 text-violet-300" />
            <p className="font-semibold">No items added yet</p>
            <p className="text-xs mt-1">Add items above to build your gift hamper.</p>
          </div>
        ) : (
          <div className="space-y-3">
            <h4 className="text-sm font-semibold text-violet-900 flex items-center gap-2">
              <Package className="h-4 w-4 text-violet-600" /> Hamper Items ({items.length})
            </h4>
            {items.map((item, index) => (
              <div
                key={index}
                className="flex items-center justify-between rounded-xl border border-violet-200 bg-white p-3.5 shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  {item.image ? (
                    <img src={item.image} alt={item.name} className="h-10 w-10 object-cover rounded-lg border border-violet-200" />
                  ) : (
                    <div className="h-10 w-10 bg-violet-100 rounded-lg flex items-center justify-center">
                      <Gift className="h-4 w-4 text-violet-500" />
                    </div>
                  )}
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold text-sm text-violet-900 truncate">{item.name}</p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <Badge variant="outline" className="text-[10px] capitalize border-violet-300 text-violet-700 py-0 px-1.5">{item.type}</Badge>
                      <span className="text-[10px] text-violet-600">×{item.quantity}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  <span className="font-bold text-sm text-violet-800">₹{(item.price * item.quantity).toLocaleString('en-IN')}</span>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => removeItem(index)}
                    className="h-8 w-8 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
            ))}

            {/* Total Summary */}
            <div className="flex items-center justify-between rounded-xl bg-violet-100/60 border border-violet-200 p-4 mt-2">
              <span className="text-sm font-semibold text-violet-900">Total Hamper Value</span>
              <span className="text-lg font-bold text-violet-800">₹{totalValue.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default HamperFormSection;
