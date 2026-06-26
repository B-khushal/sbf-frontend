import React, { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { API_BASE_URL } from '@/config';
import { Truck, RefreshCw, Navigation, MapPin } from 'lucide-react';

interface ActiveDelivery {
  _id: string;
  orderId: {
    _id: string;
    orderNumber: string;
    shippingDetails: {
      fullName: string;
      address: string;
      city: string;
    };
  };
  partnerId: {
    _id: string;
    name: string;
    phone: string;
    vehicleType: string;
    currentLatitude: number;
    currentLongitude: number;
  };
  status: string;
  distance: number;
  eta: number;
}

declare global {
  interface Window {
    L: any;
  }
}

const ActiveDeliveries: React.FC = () => {
  const [active, setActive] = useState<ActiveDelivery[]>([]);
  const [loading, setLoading] = useState(true);
  const [isMapLoaded, setIsMapLoaded] = useState(false);
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<any>(null);
  const markersRef = useRef<any[]>([]);
  const { toast } = useToast();

  const fetchActiveDeliveries = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get(`${API_BASE_URL}/api/delivery/admin/active`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.data.success) {
        setActive(res.data.active);
      }
    } catch (err: any) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: err.response?.data?.message || 'Failed to fetch active deliveries'
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchActiveDeliveries();
    
    // Poll updates every 10 seconds
    const interval = setInterval(fetchActiveDeliveries, 10000);
    return () => clearInterval(interval);
  }, []);

  // Dynamically Load Leaflet from unpkg
  useEffect(() => {
    if (window.L) {
      setIsMapLoaded(true);
      return;
    }

    const cssLink = document.createElement('link');
    cssLink.rel = 'stylesheet';
    cssLink.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
    document.head.appendChild(cssLink);

    const script = document.createElement('script');
    script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
    script.onload = () => {
      setIsMapLoaded(true);
    };
    document.head.appendChild(script);

    return () => {
      // Keep Leaflet in global window to avoid duplicate script appending
    };
  }, []);

  // Initialize Map
  useEffect(() => {
    if (!isMapLoaded || !mapContainerRef.current) return;

    const storeCoords: [number, number] = [17.3912, 78.4326]; // Mehdipatnam store

    // Initialize Leaflet Map if not already initialized
    if (!mapRef.current) {
      mapRef.current = window.L.map(mapContainerRef.current).setView(storeCoords, 13);
      
      window.L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
        attribution: '&copy; OpenStreetMap contributors'
      }).addTo(mapRef.current);
    }

    // Clear existing markers
    markersRef.current.forEach(marker => marker.remove());
    markersRef.current = [];

    // Store marker icon custom styling
    const storeIcon = window.L.divIcon({
      className: 'store-map-icon',
      html: `<div style="background-color: #064e3b; color: white; width: 34px; height: 34px; border-radius: 50%; border: 3px solid white; display: flex; align-items: center; justify-content: center; font-size: 14px; box-shadow: 0 4px 6px rgba(0,0,0,0.15);">🌸</div>`,
      iconSize: [34, 34],
      iconAnchor: [17, 17]
    });

    // Store Marker
    const storeMarker = window.L.marker(storeCoords, { icon: storeIcon })
      .bindPopup('<strong>Spring Blossoms Florist Store</strong><br>Mehdipatnam Hub')
      .addTo(mapRef.current);
    markersRef.current.push(storeMarker);

    // Courier markers
    active.forEach(item => {
      if (item.partnerId && item.partnerId.currentLatitude && item.partnerId.currentLongitude) {
        const partnerIcon = window.L.divIcon({
          className: 'partner-map-icon',
          html: `<div style="background-color: #0284c7; color: white; width: 30px; height: 30px; border-radius: 50%; border: 2.5px solid white; display: flex; align-items: center; justify-content: center; font-size: 12px; box-shadow: 0 3px 5px rgba(0,0,0,0.15);">🛵</div>`,
          iconSize: [30, 30],
          iconAnchor: [15, 15]
        });

        const marker = window.L.marker([item.partnerId.currentLatitude, item.partnerId.currentLongitude], { icon: partnerIcon })
          .bindPopup(`
            <strong>Courier: ${item.partnerId.name}</strong><br>
            Order: #${item.orderId?.orderNumber}<br>
            Status: ${item.status.replace(/_/g, ' ').toUpperCase()}<br>
            ETA: ${item.eta} mins (${item.distance} km)
          `)
          .addTo(mapRef.current);
        markersRef.current.push(marker);
      }
    });

    // Fit map bounds to show store and couriers
    if (markersRef.current.length > 1) {
      const group = window.L.featureGroup(markersRef.current);
      mapRef.current.fitBounds(group.getBounds().pad(0.15));
    }
  }, [isMapLoaded, active]);

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-emerald-900">Active Deliveries</h1>
          <p className="text-muted-foreground">Monitor ongoing courier coordinates, transit states, and live routing.</p>
        </div>
        <Button onClick={fetchActiveDeliveries} className="bg-emerald-700 hover:bg-emerald-800 text-white gap-2">
          <RefreshCw className="h-4 w-4" /> Refresh Map
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Map View */}
        <div className="lg:col-span-2">
          <Card className="border-emerald-100 shadow-sm bg-white overflow-hidden h-[600px] flex flex-col">
            <div className="flex-1 w-full bg-emerald-50/20" ref={mapContainerRef} style={{ minHeight: '100%' }}>
              {!isMapLoaded && (
                <div className="w-full h-full flex items-center justify-center text-muted-foreground animate-pulse">
                  Initializing Live Tracking Map...
                </div>
              )}
            </div>
          </Card>
        </div>

        {/* Dispatch Log Sidebar */}
        <div className="lg:col-span-1 space-y-4">
          <Card className="border-emerald-100 shadow-sm bg-white h-[600px] flex flex-col">
            <CardHeader className="bg-emerald-50/55 border-b border-emerald-100 p-4">
              <CardTitle className="text-emerald-900 text-lg flex items-center gap-2">
                <Truck className="h-5 w-5 text-emerald-700" /> Active Dispatch Log
              </CardTitle>
              <CardDescription>Live list of shipments currently out on routes.</CardDescription>
            </CardHeader>
            <CardContent className="flex-1 overflow-y-auto p-0 divide-y divide-emerald-50">
              {loading ? (
                <div className="p-6 text-center text-muted-foreground animate-pulse">Loading transit orders...</div>
              ) : active.length === 0 ? (
                <div className="p-6 text-center text-muted-foreground">No active dispatches right now.</div>
              ) : (
                active.map(item => (
                  <div key={item._id} className="p-4 hover:bg-emerald-50/20 transition-colors">
                    <div className="flex justify-between items-start gap-2">
                      <div>
                        <div className="font-semibold text-emerald-950">Order #{item.orderId?.orderNumber}</div>
                        <div className="text-xs text-muted-foreground mt-0.5">
                          To: {item.orderId?.shippingDetails?.fullName}
                        </div>
                        <div className="text-xs text-muted-foreground truncate max-w-[200px]">
                          {item.orderId?.shippingDetails?.address}
                        </div>
                      </div>
                      <span className="bg-sky-50 text-sky-700 text-[10px] px-2 py-0.5 rounded font-bold capitalize whitespace-nowrap">
                        {item.status.replace(/_/g, ' ')}
                      </span>
                    </div>

                    <div className="mt-3 flex items-center justify-between text-xs border-t border-dashed border-emerald-100 pt-2.5">
                      <div className="flex items-center gap-1.5 font-medium text-emerald-950">
                        <Navigation className="h-3.5 w-3.5 text-emerald-700" />
                        {item.partnerId ? item.partnerId.name : 'Unassigned'}
                      </div>
                      <div className="text-muted-foreground">
                        {item.distance} km • <strong className="text-emerald-800">{item.eta} mins</strong>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default ActiveDeliveries;
