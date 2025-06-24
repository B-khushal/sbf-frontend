import React, { useState, useEffect } from 'react';
import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { format } from 'date-fns';
import { CalendarIcon, Plus, Trash2, Power } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import api from '@/services/api';

interface Offer {
  _id: string;
  title: string;
  description: string;
  imageUrl?: string;
  backgroundColor: string;
  textColor: string;
  buttonText: string;
  buttonLink: string;
  startDate: string;
  endDate: string;
  isActive: boolean;
  showOnlyOnce: boolean;
  theme: 'festive' | 'sale' | 'holiday' | 'general';
}

const OffersManager = () => {
  const { toast } = useToast();
  const [offers, setOffers] = useState<Offer[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [currentOffer, setCurrentOffer] = useState<Partial<Offer>>({
    theme: 'general',
    backgroundColor: '#ffffff',
    textColor: '#000000',
    buttonText: 'Shop Now',
    showOnlyOnce: false
  });

  // Fetch offers
  const fetchOffers = async () => {
    try {
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

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (isEditing) {
        await api.put(`/offers/${currentOffer._id}`, currentOffer);
      } else {
        await api.post('/offers', currentOffer);
      }

      toast({
        title: 'Success',
        description: `Offer ${isEditing ? 'updated' : 'created'} successfully`
      });

      setCurrentOffer({
        theme: 'general',
        backgroundColor: '#ffffff',
        textColor: '#000000',
        buttonText: 'Shop Now',
        showOnlyOnce: false
      });
      setIsEditing(false);
      setShowForm(false);
      fetchOffers();
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to save offer',
        variant: 'destructive'
      });
    }
  };

  // Toggle offer status
  const toggleOfferStatus = async (offerId: string) => {
    try {
      await api.patch(`/offers/${offerId}/toggle`);
      fetchOffers();
      toast({
        title: 'Success',
        description: 'Offer status updated'
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update offer status',
        variant: 'destructive'
      });
    }
  };

  // Delete offer
  const deleteOffer = async (offerId: string) => {
    if (!window.confirm('Are you sure you want to delete this offer?')) return;

    try {
      await api.delete(`/offers/${offerId}`);
      fetchOffers();
      toast({
        title: 'Success',
        description: 'Offer deleted successfully'
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to delete offer',
        variant: 'destructive'
      });
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Manage Offers</h1>
        <Button 
          onClick={() => {
            setIsEditing(false);
            setShowForm(true);
            setCurrentOffer({
              theme: 'general',
              backgroundColor: '#ffffff',
              textColor: '#000000',
              buttonText: 'Shop Now',
              showOnlyOnce: false
            });
          }}
          className="bg-pink-600 hover:bg-pink-700 text-white"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add New Offer
        </Button>
      </div>

      {/* Offer Form */}
      {showForm && (
      <form onSubmit={handleSubmit} className="space-y-6 bg-white p-6 rounded-xl shadow-sm mb-8">
        <h2 className="text-xl font-semibold mb-4">
          {isEditing ? 'Edit Offer' : 'Create New Offer'}
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              value={currentOffer.title || ''}
              onChange={(e) => setCurrentOffer({ ...currentOffer, title: e.target.value })}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="theme">Theme</Label>
            <Select
              value={currentOffer.theme}
              onValueChange={(value: any) => setCurrentOffer({ ...currentOffer, theme: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select theme" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="festive">Festive</SelectItem>
                <SelectItem value="sale">Sale</SelectItem>
                <SelectItem value="holiday">Holiday</SelectItem>
                <SelectItem value="general">General</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Input
              id="description"
              value={currentOffer.description || ''}
              onChange={(e) => setCurrentOffer({ ...currentOffer, description: e.target.value })}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="imageUrl">Image URL</Label>
            <Input
              id="imageUrl"
              value={currentOffer.imageUrl || ''}
              onChange={(e) => setCurrentOffer({ ...currentOffer, imageUrl: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="buttonText">Button Text</Label>
            <Input
              id="buttonText"
              value={currentOffer.buttonText || ''}
              onChange={(e) => setCurrentOffer({ ...currentOffer, buttonText: e.target.value })}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="buttonLink">Button Link</Label>
            <Input
              id="buttonLink"
              value={currentOffer.buttonLink || ''}
              onChange={(e) => setCurrentOffer({ ...currentOffer, buttonLink: e.target.value })}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="backgroundColor">Background Color</Label>
            <div className="flex gap-2">
              <Input
                id="backgroundColor"
                type="color"
                value={currentOffer.backgroundColor || '#ffffff'}
                onChange={(e) => setCurrentOffer({ ...currentOffer, backgroundColor: e.target.value })}
                className="w-16"
              />
              <Input
                value={currentOffer.backgroundColor || '#ffffff'}
                onChange={(e) => setCurrentOffer({ ...currentOffer, backgroundColor: e.target.value })}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="textColor">Text Color</Label>
            <div className="flex gap-2">
              <Input
                id="textColor"
                type="color"
                value={currentOffer.textColor || '#000000'}
                onChange={(e) => setCurrentOffer({ ...currentOffer, textColor: e.target.value })}
                className="w-16"
              />
              <Input
                value={currentOffer.textColor || '#000000'}
                onChange={(e) => setCurrentOffer({ ...currentOffer, textColor: e.target.value })}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Start Date</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="w-full justify-start text-left font-normal">
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {currentOffer.startDate ? format(new Date(currentOffer.startDate), 'PPP') : 'Pick a date'}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={currentOffer.startDate ? new Date(currentOffer.startDate) : undefined}
                  onSelect={(date) => setCurrentOffer({ ...currentOffer, startDate: date?.toISOString() })}
                />
              </PopoverContent>
            </Popover>
          </div>

          <div className="space-y-2">
            <Label>End Date</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="w-full justify-start text-left font-normal">
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {currentOffer.endDate ? format(new Date(currentOffer.endDate), 'PPP') : 'Pick a date'}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={currentOffer.endDate ? new Date(currentOffer.endDate) : undefined}
                  onSelect={(date) => setCurrentOffer({ ...currentOffer, endDate: date?.toISOString() })}
                />
              </PopoverContent>
            </Popover>
          </div>

          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="showOnlyOnce"
                checked={currentOffer.showOnlyOnce || false}
                onCheckedChange={(checked) => setCurrentOffer({ ...currentOffer, showOnlyOnce: checked as boolean })}
              />
              <Label htmlFor="showOnlyOnce">Show only once per session</Label>
            </div>
          </div>
        </div>

        <div className="flex gap-4">
          <Button type="submit" className="w-full">
            {isEditing ? 'Update Offer' : 'Create Offer'}
          </Button>
          {isEditing && (
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setIsEditing(false);
                setShowForm(false);
                setCurrentOffer({
                  theme: 'general',
                  backgroundColor: '#ffffff',
                  textColor: '#000000',
                  buttonText: 'Shop Now',
                  showOnlyOnce: false
                });
              }}
            >
              Cancel
            </Button>
          )}
        </div>
      </form>
      )}

      {/* Offers List */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Active Offers</h2>
        {isLoading ? (
          <div>Loading...</div>
        ) : offers.length === 0 ? (
          <div className="text-gray-500">No offers found</div>
        ) : (
          <div className="grid gap-4">
            {offers.map((offer) => (
              <div
                key={offer._id}
                className={`p-4 rounded-lg border ${
                  offer.isActive ? 'bg-white' : 'bg-gray-50'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold">{offer.title}</h3>
                    <p className="text-sm text-gray-600">{offer.description}</p>
                    <div className="text-xs text-gray-500 mt-1">
                      {format(new Date(offer.startDate), 'PP')} -{' '}
                      {format(new Date(offer.endDate), 'PP')}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setCurrentOffer(offer);
                        setIsEditing(true);
                        setShowForm(true);
                      }}
                    >
                      Edit
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => toggleOfferStatus(offer._id)}
                    >
                      <Power
                        className={`h-4 w-4 ${
                          offer.isActive ? 'text-green-500' : 'text-gray-500'
                        }`}
                      />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => deleteOffer(offer._id)}
                    >
                      <Trash2 className="h-4 w-4 text-red-500" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default OffersManager; 