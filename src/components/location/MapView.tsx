import React, { useEffect, useRef, useState } from 'react';
import { useMappls } from '@/hooks/useMappls';
import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface MapViewProps {
  latitude: number;
  longitude: number;
  onMarkerDragEnd: (lat: number, lng: number) => void;
  className?: string;
}

export const MapView: React.FC<MapViewProps> = ({
  latitude,
  longitude,
  onMarkerDragEnd,
  className,
}) => {
  const { isLoaded, isError } = useMappls();
  const [mapLoading, setMapLoading] = useState(true);
  const mapContainerRef = useRef<HTMLDivElement>(null);
  
  // Keep references to Mappls map and marker instances
  const mapRef = useRef<any>(null);
  const markerRef = useRef<any>(null);
  
  // Track if map has been initialized
  const initializedRef = useRef<boolean>(false);

  // Initialize Map
  useEffect(() => {
    if (!isLoaded || !mapContainerRef.current || initializedRef.current) return;

    try {
      setMapLoading(true);
      initializedRef.current = true;

      // Initialize map instance
      const mapInstance = new window.mappls.Map(mapContainerRef.current, {
        center: { lat: latitude, lng: longitude },
        zoom: 15,
        zoomControl: true,
        hybrid: false,
        traffic: false,
      });

      mapRef.current = mapInstance;

      mapInstance.on('load', () => {
        setMapLoading(false);

        // Add draggable marker
        const markerInstance = new window.mappls.Marker({
          map: mapInstance,
          position: { lat: latitude, lng: longitude },
          draggable: true,
          fitbounds: false,
        });

        markerRef.current = markerInstance;

        // Listen for marker drag event
        markerInstance.addListener('dragend', () => {
          const position = markerInstance.getPosition();
          if (position && typeof position.lat === 'number' && typeof position.lng === 'number') {
            onMarkerDragEnd(position.lat, position.lng);
          }
        });
      });
    } catch (error) {
      console.error('Error initializing Mappls Map:', error);
      setMapLoading(false);
    }

    return () => {
      // Cleanup map references if needed when unmounting
      if (mapRef.current) {
        try {
          // If the map SDK provides a destroy/remove method, we could use it:
          // mapRef.current.remove();
        } catch (e) {
          console.warn('Map cleanup error:', e);
        }
      }
      initializedRef.current = false;
      mapRef.current = null;
      markerRef.current = null;
    };
  }, [isLoaded]);

  // Sync external coordinates (geolocation or search autosuggest selection)
  useEffect(() => {
    if (!isLoaded || !mapRef.current || !markerRef.current) return;

    const currentCenter = mapRef.current.getCenter();
    // Check if new coords are significantly different from current center to avoid redundant panning
    const latDiff = Math.abs(currentCenter.lat - latitude);
    const lngDiff = Math.abs(currentCenter.lng - longitude);

    if (latDiff > 0.0001 || lngDiff > 0.0001) {
      try {
        mapRef.current.panTo({ lat: latitude, lng: longitude });
        markerRef.current.setPosition({ lat: latitude, lng: longitude });
      } catch (error) {
        console.error('Error updates map/marker positions:', error);
      }
    }
  }, [latitude, longitude, isLoaded]);

  return (
    <div className={cn("relative w-full h-full rounded-2xl overflow-hidden bg-slate-100 border border-slate-200 dark:border-slate-800 shadow-inner min-h-[300px]", className)}>
      <div 
        ref={mapContainerRef} 
        style={{ width: '100%', height: '100%', minHeight: '300px' }}
        className="w-full h-full"
      />

      {/* Loading Spinner */}
      {(!isLoaded || mapLoading) && !isError && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-55/60 dark:bg-slate-950/60 backdrop-blur-sm z-[999]">
          <Loader2 className="h-10 w-10 animate-spin text-emerald-500" />
          <p className="text-sm font-semibold text-slate-600 dark:text-slate-400 mt-3 tracking-wide">
            Loading Mappls Maps...
          </p>
        </div>
      )}

      {/* Error state */}
      {isError && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-50 dark:bg-slate-900 p-6 z-[999] text-center">
          <p className="text-rose-500 font-bold text-lg">Failed to Load Map</p>
          <p className="text-sm text-slate-500 mt-2 max-w-xs">
            Mappls Map SDK could not be initialized. Please check your internet connection or API Key.
          </p>
        </div>
      )}
    </div>
  );
};

export default MapView;
