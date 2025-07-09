import { useState, useEffect } from 'react';
import { GooglePlacesService, GooglePlace } from '@/lib/googlePlaces';
import { Business } from '@/types';

export function useGooglePlaces() {
  const [places, setPlaces] = useState<Business[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const searchPlaces = async (params: {
    query?: string;
    location?: string;
    radius?: number;
    type?: string;
  }) => {
    setLoading(true);
    setError(null);

    try {
      const googlePlaces = await GooglePlacesService.searchPlaces(params);
      const businesses = googlePlaces.map(place => 
        GooglePlacesService.convertGooglePlaceToBusiness(place)
      );
      setPlaces(businesses);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch places');
      setPlaces([]);
    } finally {
      setLoading(false);
    }
  };

  const getPlacesByCategory = async (category: string, location?: string) => {
    const typeMap: Record<string, string> = {
      'Restaurant': 'restaurant',
      'Bar & Restaurant': 'bar',
      'Cafe': 'cafe',
      'Spa & Wellness': 'spa',
      'Massage Parlour': 'spa',
      'Street Food': 'restaurant'
    };

    const googleType = typeMap[category] || 'establishment';
    await searchPlaces({ type: googleType, location });
  };

  return {
    places,
    loading,
    error,
    searchPlaces,
    getPlacesByCategory,
  };
}