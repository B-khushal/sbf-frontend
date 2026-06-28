import React, { useEffect, useState, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { API_BASE_URL } from '@/config';
import { Truck, Clock, MapPin, ArrowLeft, RefreshCw, Star, CheckCircle } from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';

interface TrackingData {
  orderStatus: string;
  trackingHistory: {
    status: string;
    timestamp: string;
    message: string;
  }[];
  assignment: {
    status: string;
    eta: number;
    distance: number;
    pickupTime?: string;
    deliveryTime?: string;
    partner?: {
      name: string;
      profilePhoto: string;
      vehicleType: string;
      currentLatitude: number;
      currentLongitude: number;
    };
  } | null;
}

const TrackOrderPage: React.FC = () => {
  const { user } = useAuth();
  const hasInternalAccess = user && [
    'platform_admin', 'store_owner', 'store_manager', 'delivery_manager', 
    'support_staff', 'inventory_staff', 'finance_staff', 'admin', 'delivery_partner'
  ].includes(user.role);

  const { orderNumber } = useParams<{ orderNumber: string }>();
  const [data, setData] = useState<TrackingData | null>(null);
  const [loading, setLoading] = useState(true);
  const [isMapLoaded, setIsMapLoaded] = useState(false);
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<any>(null);
  const markersRef = useRef<any[]>([]);

  const fetchTracking = async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/api/delivery/track/${orderNumber}`);
      if (res.data.success) {
        setData(res.data);
      }
    } catch (err) {
      console.log('Error fetching tracking data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTracking();
    const interval = setInterval(fetchTracking, 10000);
    return () => clearInterval(interval);
  }, [orderNumber]);

  // Dynamically Load Leaflet from unpkg
  useEffect(() => {
    if (!hasInternalAccess) return;
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
    script.onload = () => setIsMapLoaded(true);
    document.head.appendChild(script);
  }, [hasInternalAccess]);

  // Update Map
  useEffect(() => {
    if (!hasInternalAccess || !isMapLoaded || !mapContainerRef.current || !data) return;

    const storeCoords: [number, number] = [17.3912, 78.4326]; // Mehdipatnam store
    const customerCoords: [number, number] = [17.3850, 78.4867]; // Approximate customer location in central Hyderabad if coordinates not saved

    if (!mapRef.current) {
      mapRef.current = window.L.map(mapContainerRef.current).setView(storeCoords, 13);
      
      window.L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
        attribution: '&copy; OpenStreetMap contributors'
      }).addTo(mapRef.current);
    }

    // Clear markers
    markersRef.current.forEach(m => m.remove());
    markersRef.current = [];

    // Store marker
    const storeIcon = window.L.divIcon({
      className: 'store-icon-track',
      html: `<div style="background-color: #064e3b; color: white; width: 32px; height: 32px; border-radius: 50%; border: 3.5px solid white; display: flex; align-items: center; justify-content: center; font-size: 13px; box-shadow: 0 4px 6px rgba(0,0,0,0.15);">🌸</div>`,
      iconSize: [32, 32],
      iconAnchor: [16, 16]
    });
    const storeMarker = window.L.marker(storeCoords, { icon: storeIcon })
      .bindPopup('Spring Blossoms Florist Hub')
      .addTo(mapRef.current);
    markersRef.current.push(storeMarker);

    // Customer marker
    const customerIcon = window.L.divIcon({
      className: 'customer-icon-track',
      html: `<div style="background-color: #9d174d; color: white; width: 30px; height: 30px; border-radius: 50%; border: 2.5px solid white; display: flex; align-items: center; justify-content: center; font-size: 12px; box-shadow: 0 3px 5px rgba(0,0,0,0.15);">🏠</div>`,
      iconSize: [30, 30],
      iconAnchor: [15, 15]
    });
    const customerMarker = window.L.marker(customerCoords, { icon: customerIcon })
      .bindPopup('Delivery Destination')
      .addTo(mapRef.current);
    markersRef.current.push(customerMarker);

    // Partner/Driver marker if assignment exists
    if (data.assignment?.partner?.currentLatitude) {
      const partnerIcon = window.L.divIcon({
        className: 'partner-icon-track',
        html: `<div style="background-color: #0284c7; color: white; width: 30px; height: 30px; border-radius: 50%; border: 2.5px solid white; display: flex; align-items: center; justify-content: center; font-size: 12px; box-shadow: 0 3px 5px rgba(0,0,0,0.15);">🛵</div>`,
        iconSize: [30, 30],
        iconAnchor: [15, 15]
      });
      const partnerMarker = window.L.marker(
        [data.assignment.partner.currentLatitude, data.assignment.partner.currentLongitude],
        { icon: partnerIcon }
      )
        .bindPopup(`Delivery Partner: ${data.assignment.partner.name}`)
        .addTo(mapRef.current);
      markersRef.current.push(partnerMarker);
    }

    // Auto fit
    if (markersRef.current.length > 1) {
      const group = window.L.featureGroup(markersRef.current);
      mapRef.current.fitBounds(group.getBounds().pad(0.2));
    }
  }, [isMapLoaded, data, hasInternalAccess]);

  const getStepStatus = (stepStatus: string) => {
    if (!data) return 'pending';
    const states = ['order_placed', 'received', 'being_made', 'out_for_delivery', 'delivered'];
    const currentIdx = states.indexOf(data.orderStatus);
    const stepIdx = states.indexOf(stepStatus);

    if (stepIdx < currentIdx) return 'completed';
    if (stepIdx === currentIdx) return 'current';
    return 'pending';
  };

  const getCustomerStepStatus = (stepKey: string) => {
    if (!data) return 'pending';
    
    // Map orderStatus to one of the 4 steps
    let currentStepKey = 'confirmed';
    if (data.orderStatus === 'being_made') {
      currentStepKey = 'preparing';
    } else if (data.orderStatus === 'out_for_delivery') {
      currentStepKey = 'ready';
    } else if (data.orderStatus === 'delivered') {
      currentStepKey = 'completed';
    }

    const stepOrder = ['confirmed', 'preparing', 'ready', 'completed'];
    const currentIdx = stepOrder.indexOf(currentStepKey);
    const stepIdx = stepOrder.indexOf(stepKey);

    if (stepIdx < currentIdx) return 'completed';
    if (stepIdx === currentIdx) return 'current';
    return 'pending';
  };

  const steps = [
    { status: 'order_placed', label: 'Placed', desc: 'Order submitted' },
    { status: 'received', label: 'Accepted', desc: 'Order received by store' },
    { status: 'being_made', label: 'Prepared', desc: 'Floral arrangement design' },
    { status: 'out_for_delivery', label: 'On the way', desc: 'Out for delivery' },
    { status: 'delivered', label: 'Delivered', desc: 'Arrived at destination' }
  ];

  const customerSteps = [
    { status: 'confirmed', label: 'Order Confirmed', desc: 'Your order is confirmed' },
    { status: 'preparing', label: 'Preparing', desc: 'Your bouquet is being prepared' },
    { status: 'ready', label: 'Ready', desc: 'Your order is ready' },
    { status: 'completed', label: 'Completed', desc: 'Order completed' }
  ];

  return (
    <div className="min-h-screen bg-neutral-50 py-12 px-4 md:px-8">
      <div className="max-w-4xl mx-auto space-y-6">
        <Link to="/" className="inline-flex items-center gap-2 text-sm text-emerald-800 font-bold hover:underline mb-2">
          <ArrowLeft className="h-4 w-4" /> Back to Home
        </Link>

        {loading ? (
          <div className="p-12 text-center text-muted-foreground animate-pulse">Loading tracking details...</div>
        ) : !data ? (
          <Card className="p-6 text-center text-muted-foreground border-emerald-100 bg-white">
            No active order tracking found. Please check your order number.
          </Card>
        ) : hasInternalAccess ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Tracking Map & Driver Info */}
            <div className="md:col-span-2 space-y-6">
              <Card className="border-emerald-100 shadow-sm bg-white overflow-hidden h-[400px]">
                <div ref={mapContainerRef} className="w-full h-full bg-emerald-50/20">
                  {!isMapLoaded && (
                    <div className="w-full h-full flex items-center justify-center text-muted-foreground animate-pulse">
                      Loading tracking map...
                    </div>
                  )}
                </div>
              </Card>

              {data.assignment?.partner && (
                <Card className="border-emerald-100 shadow-sm bg-white overflow-hidden">
                  <CardContent className="p-6 flex items-center gap-6">
                    <img
                      src={data.assignment.partner.profilePhoto}
                      alt={data.assignment.partner.name}
                      className="w-16 h-16 rounded-full object-cover border border-emerald-100 shadow-sm"
                    />
                    <div className="flex-1">
                      <div className="text-xs font-bold text-emerald-700 tracking-wider uppercase">Your Delivery Partner</div>
                      <h3 className="text-lg font-bold text-emerald-950 mt-0.5">{data.assignment.partner.name}</h3>
                      <div className="text-xs text-muted-foreground mt-0.5 capitalize">
                        Vehicle: {data.assignment.partner.vehicleType}
                      </div>
                    </div>
                    <div className="text-right">
                      <Badge className="bg-emerald-50 text-emerald-700 font-semibold text-xs border border-emerald-100 gap-1 px-3 py-1">
                        <Clock className="h-3.5 w-3.5" /> {data.assignment.eta} mins
                      </Badge>
                      <div className="text-xs text-muted-foreground mt-1">Distance: {data.assignment.distance} km</div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Timeline Progress */}
            <div className="md:col-span-1">
              <Card className="border-emerald-100 shadow-sm bg-white h-full">
                <CardHeader className="bg-emerald-50/20 border-b border-emerald-50 pb-4">
                  <CardTitle className="text-emerald-900 text-base">Timeline Details</CardTitle>
                  <CardDescription>Track status updates in real-time.</CardDescription>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="relative border-l border-emerald-100 ml-3 space-y-6">
                    {steps.map((step, idx) => {
                      const state = getStepStatus(step.status);
                      return (
                        <div key={idx} className="relative pl-6">
                          <div className={`absolute -left-2 top-0.5 w-4 h-4 rounded-full border-2 border-white shadow-sm ${
                            state === 'completed' ? 'bg-emerald-600' : state === 'current' ? 'bg-emerald-700 animate-ping' : 'bg-neutral-200'
                          }`} />
                          <div className={`absolute -left-2 top-0.5 w-4 h-4 rounded-full border-2 border-white ${
                            state === 'completed' ? 'bg-emerald-600' : state === 'current' ? 'bg-emerald-700' : 'bg-neutral-200'
                          }`} />
                          
                          <div>
                            <h4 className={`text-sm font-bold ${state === 'current' ? 'text-emerald-800' : 'text-neutral-700'}`}>
                              {step.label}
                            </h4>
                            <p className="text-xs text-muted-foreground mt-0.5">{step.desc}</p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        ) : (
          <div className="max-w-xl mx-auto">
            {/* Customer view: Centered simplified timeline details */}
            <Card className="border-emerald-100 shadow-sm bg-white">
              <CardHeader className="bg-emerald-50/20 border-b border-emerald-50 pb-4">
                <CardTitle className="text-emerald-900 text-base">Order Progress</CardTitle>
                <CardDescription>Follow your order's updates.</CardDescription>
              </CardHeader>
              <CardContent className="p-6">
                <div className="relative border-l border-emerald-100 ml-3 space-y-6">
                  {customerSteps.map((step, idx) => {
                    const state = getCustomerStepStatus(step.status);
                    return (
                      <div key={idx} className="relative pl-6">
                        <div className={`absolute -left-2 top-0.5 w-4 h-4 rounded-full border-2 border-white shadow-sm ${
                          state === 'completed' ? 'bg-emerald-600' : state === 'current' ? 'bg-emerald-700 animate-ping' : 'bg-neutral-200'
                        }`} />
                        <div className={`absolute -left-2 top-0.5 w-4 h-4 rounded-full border-2 border-white ${
                          state === 'completed' ? 'bg-emerald-600' : state === 'current' ? 'bg-emerald-700' : 'bg-neutral-200'
                        }`} />
                        
                        <div>
                          <h4 className={`text-sm font-bold ${state === 'current' ? 'text-emerald-800' : 'text-neutral-700'}`}>
                            {step.label}
                          </h4>
                          <p className="text-xs text-muted-foreground mt-0.5">{step.desc}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
};

export default TrackOrderPage;
