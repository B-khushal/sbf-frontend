import { useState } from 'react';

export const useCurrentLocation = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getCurrentLocation = (): Promise<{ latitude: number; longitude: number }> => {
    return new Promise((resolve, reject) => {
      setLoading(true);
      setError(null);

      if (!navigator.geolocation) {
        const errorMsg = 'Geolocation is not supported by your browser.';
        setError(errorMsg);
        setLoading(false);
        reject(new Error(errorMsg));
        return;
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          const coords = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          };
          setLoading(false);
          resolve(coords);
        },
        (geoError) => {
          let errorMsg = 'Unable to retrieve location.';
          switch (geoError.code) {
            case geoError.PERMISSION_DENIED:
              errorMsg = 'Location permission denied. Please enable location permissions in your browser settings.';
              break;
            case geoError.POSITION_UNAVAILABLE:
              errorMsg = 'GPS location is unavailable. Please check your device location services or try searching your address.';
              break;
            case geoError.TIMEOUT:
              errorMsg = 'Location request timed out. Please try again or search manually.';
              break;
          }
          setError(errorMsg);
          setLoading(false);
          reject(new Error(errorMsg));
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0,
        }
      );
    });
  };

  return { getCurrentLocation, loading, error };
};
export default useCurrentLocation;
