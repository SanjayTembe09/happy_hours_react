import { useState, useEffect, useRef } from 'react';
import * as Location from 'expo-location';
import { Platform } from 'react-native';

export interface LocationData {
  latitude: number;
  longitude: number;
  address?: string;
  city?: string;
  country?: string;
}

export function useLocation() {
  const [location, setLocation] = useState<LocationData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const mountedRef = useRef(false);

  const getCurrentLocation = async () => {
    if (!mountedRef.current) return;
    
    setLoading(true);
    setError(null);

    try {
      if (Platform.OS === 'web') {
        // Use browser geolocation API for web
        if (navigator.geolocation) {
          navigator.geolocation.getCurrentPosition(
            async (position) => {
              if (!mountedRef.current) return;
              
              const coords = {
                latitude: position.coords.latitude,
                longitude: position.coords.longitude,
              };
              
              // Get address from coordinates
              const address = await reverseGeocode(coords.latitude, coords.longitude);
              if (mountedRef.current) {
                setLocation({ ...coords, ...address });
                setLoading(false);
              }
            },
            (error) => {
              if (!mountedRef.current) return;
              
              console.error('Geolocation error:', error);
              setError('Unable to get your location');
              setLoading(false);
            },
            { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 }
          );
        } else {
          if (mountedRef.current) {
            setError('Geolocation is not supported by this browser');
            setLoading(false);
          }
        }
      } else {
        // Use Expo Location for mobile
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (!mountedRef.current) return;
        
        if (status !== 'granted') {
          setError('Location permission denied');
          setLoading(false);
          return;
        }

        const position = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.High,
        });

        if (!mountedRef.current) return;

        const coords = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        };

        // Get address from coordinates
        const address = await reverseGeocode(coords.latitude, coords.longitude);
        if (mountedRef.current) {
          setLocation({ ...coords, ...address });
          setLoading(false);
        }
      }
    } catch (err) {
      if (!mountedRef.current) return;
      
      console.error('Location error:', err);
      setError('Failed to get location');
      setLoading(false);
    }
  };

  const reverseGeocode = async (lat: number, lng: number) => {
    try {
      if (Platform.OS !== 'web') {
        // Use Expo Location reverse geocoding for mobile
        const result = await Location.reverseGeocodeAsync({ latitude: lat, longitude: lng });
        if (result.length > 0) {
          const location = result[0];
          return {
            address: `${location.street || ''} ${location.streetNumber || ''}`.trim(),
            city: location.city || location.subregion || '',
            country: location.country || '',
          };
        }
      } else {
        // Use a geocoding service for web (you can replace with your preferred service)
        // For demo, we'll use a simple approach
        const response = await fetch(
          `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lng}&localityLanguage=en`
        );
        const data = await response.json();
        
        return {
          address: data.locality || '',
          city: data.city || data.principalSubdivision || '',
          country: data.countryName || '',
        };
      }
    } catch (error) {
      console.error('Reverse geocoding error:', error);
      return {};
    }
    return {};
  };

  useEffect(() => {
    mountedRef.current = true;
    getCurrentLocation();

    return () => {
      mountedRef.current = false;
    };
  }, []);

  return {
    location,
    loading,
    error,
    getCurrentLocation,
  };
}