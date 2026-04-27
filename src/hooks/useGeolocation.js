// Hook: useGeolocation
// Wraps the browser Geolocation API with loading and error states

import { useState, useCallback } from 'react';

/**
 * @returns {{
 *   coords: { lat: number, lng: number } | null,
 *   loading: boolean,
 *   error: string | null,
 *   getLocation: () => void
 * }}
 */
export function useGeolocation() {
  const [coords,  setCoords]  = useState(null);
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState(null);

  const getLocation = useCallback(() => {
    if (!navigator.geolocation) {
      setError('Geolocation is not supported by your browser.');
      return;
    }

    setLoading(true);
    setError(null);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setCoords({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        });
        setLoading(false);
      },
      (err) => {
        let message = 'Unable to retrieve your location.';
        if (err.code === err.PERMISSION_DENIED)   message = 'Location access denied. Please enable it in browser settings.';
        if (err.code === err.POSITION_UNAVAILABLE) message = 'Location information is unavailable.';
        if (err.code === err.TIMEOUT)              message = 'Location request timed out.';
        setError(message);
        setLoading(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 60000,
      }
    );
  }, []);

  return { coords, loading, error, getLocation };
}
