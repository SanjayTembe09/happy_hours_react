import { Business } from '@/types';
import { VerifiedBusinessService } from './verifiedBusinessService';

export interface PlaceSearchParams {
  latitude: number;
  longitude: number;
  radius?: number;
  category?: string;
  query?: string;
}

export interface RealPlace {
  place_id: string;
  name: string;
  vicinity: string;
  geometry: {
    location: { lat: number; lng: number };
  };
  rating?: number;
  price_level?: number;
  types: string[];
  photos?: Array<{ photo_reference: string }>;
  opening_hours?: {
    open_now: boolean;
  };
  business_status?: string;
}

export class PlacesService {
  private static readonly GOOGLE_PLACES_API_KEY = process.env.EXPO_PUBLIC_GOOGLE_PLACES_API_KEY;
  private static readonly PLACES_API_URL = 'https://maps.googleapis.com/maps/api/place';

  static async searchNearbyPlaces(params: PlaceSearchParams): Promise<Business[]> {
    try {
      console.log('PlacesService: Searching with params:', params);
      
      // Get verified businesses from spreadsheet uploads
      const verifiedBusinesses = await VerifiedBusinessService.getVerifiedBusinesses();
      console.log('PlacesService: Found verified businesses:', verifiedBusinesses.length);
      
      // Filter verified businesses by location and category
      const filteredVerified = verifiedBusinesses.filter(business => {
        const distance = this.calculateDistance(
          params.latitude,
          params.longitude,
          business.location.latitude,
          business.location.longitude
        );
        
        const withinRadius = distance <= (params.radius || 50000) / 1000; // Convert to km
        const matchesCategory = !params.category || params.category === 'All' || business.category === params.category;
        const matchesQuery = !params.query || 
          business.name.toLowerCase().includes(params.query.toLowerCase()) ||
          business.description.toLowerCase().includes(params.query.toLowerCase());
        
        return withinRadius && matchesCategory && matchesQuery && business.isActive;
      });

      console.log('PlacesService: Filtered verified businesses:', filteredVerified.length);

      // Try to get additional places from Google Places API if available
      let apiPlaces: Business[] = [];
      if (this.GOOGLE_PLACES_API_KEY) {
        try {
          console.log('PlacesService: Fetching from Google Places API...');
          apiPlaces = await this.getGooglePlaces(params);
          console.log('PlacesService: Google API returned:', apiPlaces.length, 'places');
        } catch (error) {
          console.warn('Google Places API error:', error);
        }
      } else {
        console.log('PlacesService: No Google Places API key configured');
      }

      // Combine only verified and API places - NO DEMO DATA
      const allPlaces = [...filteredVerified, ...apiPlaces];
      
      // Remove duplicates and limit results
      const uniquePlaces = allPlaces.filter((place, index, self) =>
        index === self.findIndex(p => 
          p.name.toLowerCase() === place.name.toLowerCase() &&
          Math.abs(p.location.latitude - place.location.latitude) < 0.001 &&
          Math.abs(p.location.longitude - place.location.longitude) < 0.001
        )
      ).slice(0, 30);

      console.log(`PlacesService: Returning ${uniquePlaces.length} places (${filteredVerified.length} verified, ${apiPlaces.length} API)`);

      return uniquePlaces.sort((a, b) => {
        // Sort verified businesses first, then by distance
        if (a.isVerified && !b.isVerified) return -1;
        if (!a.isVerified && b.isVerified) return 1;
        
        const distA = this.calculateDistance(params.latitude, params.longitude, a.location.latitude, a.location.longitude);
        const distB = this.calculateDistance(params.latitude, params.longitude, b.location.latitude, b.location.longitude);
        return distA - distB;
      });
    } catch (error) {
      console.error('Error searching places:', error);
      throw new Error('Unable to search for places. Please check your internet connection.');
    }
  }

  private static async getGooglePlaces(params: PlaceSearchParams): Promise<Business[]> {
    if (!this.GOOGLE_PLACES_API_KEY) {
      throw new Error('Google Places API key not configured');
    }

    const url = new URL(`${this.PLACES_API_URL}/nearbysearch/json`);
    url.searchParams.append('location', `${params.latitude},${params.longitude}`);
    url.searchParams.append('radius', (params.radius || 50000).toString());
    url.searchParams.append('key', this.GOOGLE_PLACES_API_KEY);

    if (params.category && params.category !== 'All') {
      const typeMap: Record<string, string> = {
        'Restaurant': 'restaurant',
        'Bar & Restaurant': 'bar',
        'Cafe': 'cafe',
        'Spa & Wellness': 'spa',
        'Massage Parlour': 'spa',
        'Street Food': 'restaurant'
      };
      const googleType = typeMap[params.category] || 'establishment';
      url.searchParams.append('type', googleType);
    }

    if (params.query) {
      url.searchParams.append('keyword', params.query);
    }

    const response = await fetch(url.toString());
    if (!response.ok) {
      throw new Error(`Google Places API error: ${response.status}`);
    }

    const data = await response.json();
    if (data.status !== 'OK') {
      throw new Error(`Google Places API error: ${data.status}`);
    }

    return data.results.map((place: any) => this.convertGooglePlaceToBusiness(place));
  }

  private static convertGooglePlaceToBusiness(place: any): Business {
    const category = this.mapGoogleTypeToCategory(place.types);
    
    return {
      id: place.place_id,
      name: place.name,
      description: `${place.name} - ${category} in the area`,
      image: this.getOptimizedImageForCategory(category),
      location: {
        latitude: place.geometry.location.lat,
        longitude: place.geometry.location.lng,
        address: place.vicinity || place.formatted_address || '',
      },
      category,
      rating: place.rating || 4.0,
      currentDiscount: undefined, // Real Google Places don't have discount data
      isActive: place.business_status === 'OPERATIONAL',
      isVerified: false, // API places are not verified
    };
  }

  private static mapGoogleTypeToCategory(types: string[]): string {
    if (types.includes('spa') || types.includes('health')) return 'Spa & Wellness';
    if (types.includes('restaurant')) return 'Restaurant';
    if (types.includes('bar')) return 'Bar & Restaurant';
    if (types.includes('cafe')) return 'Cafe';
    if (types.includes('tourist_attraction')) return 'Street Food';
    return 'Restaurant';
  }

  private static getOptimizedImageForCategory(category: string): string {
    // Using WebP format for better compression and quality
    const defaultImages = {
      'Spa & Wellness': 'https://images.pexels.com/photos/3757942/pexels-photo-3757942.jpeg?auto=compress&cs=tinysrgb&w=600&h=400&fit=crop&fm=webp&q=80',
      'Restaurant': 'https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg?auto=compress&cs=tinysrgb&w=600&h=400&fit=crop&fm=webp&q=80',
      'Bar & Restaurant': 'https://images.pexels.com/photos/1581384/pexels-photo-1581384.jpeg?auto=compress&cs=tinysrgb&w=600&h=400&fit=crop&fm=webp&q=80',
      'Cafe': 'https://images.pexels.com/photos/302899/pexels-photo-302899.jpeg?auto=compress&cs=tinysrgb&w=600&h=400&fit=crop&fm=webp&q=80',
      'Street Food': 'https://images.pexels.com/photos/1267320/pexels-photo-1267320.jpeg?auto=compress&cs=tinysrgb&w=600&h=400&fit=crop&fm=webp&q=80',
      'Massage Parlour': 'https://images.pexels.com/photos/3865676/pexels-photo-3865676.jpeg?auto=compress&cs=tinysrgb&w=600&h=400&fit=crop&fm=webp&q=80'
    };

    return defaultImages[category as keyof typeof defaultImages] || defaultImages['Restaurant'];
  }

  private static calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371; // Earth's radius in kilometers
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  }

  static async getPlaceDetails(placeId: string): Promise<any> {
    // In production, this would fetch detailed place information from Google Places API
    return {
      place_id: placeId,
      formatted_phone_number: '+1-555-123-4567',
      website: 'https://example.com',
      opening_hours: {
        open_now: true,
        weekday_text: [
          'Monday: 9:00 AM – 10:00 PM',
          'Tuesday: 9:00 AM – 10:00 PM',
          'Wednesday: 9:00 AM – 10:00 PM',
          'Thursday: 9:00 AM – 10:00 PM',
          'Friday: 9:00 AM – 11:00 PM',
          'Saturday: 10:00 AM – 11:00 PM',
          'Sunday: 10:00 AM – 9:00 PM',
        ],
      },
    };
  }
}