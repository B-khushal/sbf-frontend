import React, { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import { useToast } from '@/hooks/use-toast';
import { API_BASE_URL } from '@/config';
import { Truck, RefreshCw, Navigation, MapPin, Clock } from 'lucide-react';
import { PageHeader } from '@/components/dashboard/PageHeader';
import { SoftButton } from '@/components/dashboard/SoftButton';
import { StatusBadge } from '@/components/dashboard/StatusBadge';

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
        setActive(res.data.active || []);
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
      html: `<div style="background-color: #e11d48; color: white; width: 36px; height: 36px; border-radius: 50%; border: 3px solid white; display: flex; align-items: center; justify-content: center; font-size: 15px; box-shadow: 0 4px 10px rgba(225,29,72,0.4);">🌸</div>`,
      iconSize: [36, 36],
      iconAnchor: [18, 18]
    });

    // Store Marker
    const storeMarker = window.L.marker(storeCoords, { icon: storeIcon })
      .bindPopup('<strong>Spring Blossoms Florist Hub</strong><br>Mehdipatnam Flagship')
      .addTo(mapRef.current);
    markersRef.current.push(storeMarker);

    // Courier markers
    active.forEach(item => {
      if (item.partnerId && item.partnerId.currentLatitude && item.partnerId.currentLongitude) {
        const partnerIcon = window.L.divIcon({
          className: 'partner-map-icon',
          html: `<div style="background-color: #059669; color: white; width: 32px; height: 32px; border-radius: 50%; border: 2.5px solid white; display: flex; align-items: center; justify-content: center; font-size: 13px; box-shadow: 0 4px 8px rgba(5,150,105,0.35);">🛵</div>`,
          iconSize: [32, 32],
          iconAnchor: [16, 16]
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
    <div className="space-y-6 w-full max-w-7xl 2xl:max-w-9xl 3xl:max-w-11xl 4xl:max-w-qhd mx-auto">
      {/* Neumorphic Header */}
      <PageHeader
        breadcrumbs={[
          { label: 'Admin', href: '/admin' },
          { label: 'Logistics', href: '/admin/delivery/analytics' },
          { label: 'Live Tracking' },
        ]}
        title="Active Deliveries & Fleet Radar"
        description="Real-time courier GPS coordinates, active transit routes, customer destination tracking, and live ETA calculations."
        liveStatus={{ label: `${active.length} Couriers en Route`, ping: true }}
        actions={
          <SoftButton
            variant="default"
            size="sm"
            icon={RefreshCw}
            onClick={fetchActiveDeliveries}
          >
            Refresh Radar
          </SoftButton>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Map View */}
        <div className="lg:col-span-2">
          <div className="rounded-2xl border border-white/80 dark:border-slate-800 shadow-[6px_6px_18px_rgba(163,177,198,0.22),-6px_-6px_18px_rgba(255,255,255,0.8)] bg-[#f4f7fb] dark:bg-slate-900 overflow-hidden h-[620px] flex flex-col">
            <div className="flex-1 w-full bg-[#edf1f7]/50" ref={mapContainerRef} style={{ minHeight: '100%' }}>
              {!isMapLoaded && (
                <div className="w-full h-full flex items-center justify-center text-xs text-muted-foreground animate-pulse font-medium">
                  Initializing Live Tracking Telemetry...
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Dispatch Log Sidebar */}
        <div className="lg:col-span-1">
          <div className="rounded-2xl border border-white/80 dark:border-slate-800 shadow-[6px_6px_18px_rgba(163,177,198,0.22),-6px_-6px_18px_rgba(255,255,255,0.8)] bg-[#f4f7fb] dark:bg-slate-900 h-[620px] flex flex-col overflow-hidden">
            <div className="bg-[#edf1f7] dark:bg-slate-800/60 border-b border-slate-200/80 dark:border-slate-800 p-4">
              <h2 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <Truck className="h-4 w-4 text-rose-600" /> Active Dispatches
              </h2>
              <p className="text-[11px] text-muted-foreground mt-0.5">
                Shipments out on transit across Hyderabad / Secunderabad.
              </p>
            </div>

            <div className="flex-1 overflow-y-auto p-3 space-y-3">
              {loading ? (
                <div className="p-8 text-center text-xs text-muted-foreground animate-pulse">
                  Scanning delivery routes...
                </div>
              ) : active.length === 0 ? (
                <div className="p-8 text-center text-xs text-muted-foreground">
                  No active delivery shipments currently out on routes.
                </div>
              ) : (
                active.map((item) => (
                  <div
                    key={item._id}
                    className="p-3.5 rounded-xl border border-white/80 dark:border-slate-800 bg-white/70 dark:bg-slate-800/60 shadow-[3px_3px_8px_rgba(163,177,198,0.18),-3px_-3px_8px_rgba(255,255,255,0.7)] hover:shadow-md transition-all space-y-2.5"
                  >
                    <div className="flex justify-between items-start gap-2">
                      <div>
                        <div className="font-bold text-xs text-slate-900 dark:text-slate-100">
                          Order #{item.orderId?.orderNumber}
                        </div>
                        <div className="text-[11px] text-muted-foreground mt-0.5">
                          To: {item.orderId?.shippingDetails?.fullName}
                        </div>
                        <div className="text-[10px] text-muted-foreground truncate max-w-[190px] font-medium">
                          {item.orderId?.shippingDetails?.address}
                        </div>
                      </div>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 dark:bg-blue-950/50 dark:text-blue-300 capitalize shrink-0">
                        {item.status.replace(/_/g, ' ')}
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-xs border-t border-slate-100 dark:border-slate-800 pt-2 text-[11px]">
                      <div className="flex items-center gap-1.5 font-semibold text-slate-800 dark:text-slate-200">
                        <Navigation className="h-3 w-3 text-rose-500" />
                        {item.partnerId ? item.partnerId.name : 'Unassigned'}
                      </div>
                      <div className="text-muted-foreground text-[10px] flex items-center gap-1">
                        <Clock className="h-3 w-3 text-emerald-600" />
                        {item.distance} km • <strong className="text-emerald-600 font-bold">{item.eta}m ETA</strong>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ActiveDeliveries;
