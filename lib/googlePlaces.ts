import { Business } from '@/types';

export interface GooglePlace {
  place_id: string;
  name: string;
  formatted_address: string;
  geometry: {
    location: { lat: number; lng: number };
  };
  rating: number;
  price_level?: number;
  types: string[];
  photos?: Array<{ photo_reference: string }>;
  opening_hours?: {
    open_now: boolean;
    periods: Array<{
      open: { day: number; time: string };
      close: { day: number; time: string };
    }>;
  };
  business_status: string;
}

export class GooglePlacesService {
  private static baseUrl = '/api/places';

  static async searchPlaces(params: {
    query?: string;
    location?: string;
    radius?: number;
    type?: string;
  }): Promise<GooglePlace[]> {
    const searchParams = new URLSearchParams();
    
    if (params.query) searchParams.append('query', params.query);
    if (params.location) searchParams.append('location', params.location);
    if (params.radius) searchParams.append('radius', params.radius.toString());
    if (params.type) searchParams.append('type', params.type);

    try {
      const response = await fetch(`${this.baseUrl}?${searchParams}`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      return data.results || [];
    } catch (error) {
      console.error('Error fetching places:', error);
      return [];
    }
  }

  static async getPlacesByType(type: string, location?: string): Promise<GooglePlace[]> {
    return this.searchPlaces({ type, location });
  }

  static convertGooglePlaceToBusiness(place: GooglePlace): Business {
    // Generate a mock discount for demonstration
    const discountPercentages = [15, 20, 25, 30, 35, 40, 45, 50];
    const randomDiscount = discountPercentages[Math.floor(Math.random() * discountPercentages.length)];
    
    const discountTitles = [
      'Happy Hour Special',
      'Lunch Special',
      'Weekend Promotion',
      'Early Bird Discount',
      'Evening Special',
      'Wellness Package',
      'Spa Treatment Deal'
    ];
    
    const category = this.mapGoogleTypeToCategory(place.types);
    
    return {
      id: place.place_id,
      name: place.name,
      description: this.generateDescription(place.name, category),
      image: place.photos?.[0]?.photo_reference || this.getOptimizedDefaultImageForCategory(category),
      location: {
        latitude: place.geometry.location.lat,
        longitude: place.geometry.location.lng,
        address: place.formatted_address,
      },
      category,
      rating: place.rating || 4.0,
      currentDiscount: {
        id: `d-${place.place_id}`,
        businessId: place.place_id,
        title: discountTitles[Math.floor(Math.random() * discountTitles.length)],
        description: `${randomDiscount}% off selected items`,
        percentage: randomDiscount,
        validFrom: this.getRandomTimeSlot().start,
        validTo: this.getRandomTimeSlot().end,
        isActive: place.opening_hours?.open_now || Math.random() > 0.3,
      },
      isActive: place.business_status === 'OPERATIONAL',
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

  private static generateDescription(name: string, category: string): string {
    const descriptions = {
      'Spa & Wellness': [
        'Rejuvenating spa treatments in a tranquil environment',
        'Professional wellness services with expert therapists',
        'Traditional healing and modern spa techniques combined',
        'Luxury spa experience with premium amenities'
      ],
      'Restaurant': [
        'Authentic cuisine with fresh, high-quality ingredients',
        'Exceptional dining experience with innovative dishes',
        'Traditional flavors with a modern twist',
        'Fine dining in an elegant atmosphere'
      ],
      'Bar & Restaurant': [
        'Craft cocktails and gourmet dining experience',
        'Vibrant atmosphere with excellent food and drinks',
        'Perfect spot for dining and socializing',
        'Premium bar with exceptional culinary offerings'
      ],
      'Cafe': [
        'Artisanal coffee and fresh pastries daily',
        'Cozy atmosphere perfect for work or relaxation',
        'Specialty coffee with homemade treats',
        'Local favorite for coffee and light meals'
      ],
      'Street Food': [
        'Authentic local flavors and traditional recipes',
        'Fresh ingredients prepared with time-honored methods',
        'Local culinary experience at its finest',
        'Traditional street food with modern presentation'
      ]
    };

    const categoryDescriptions = descriptions[category as keyof typeof descriptions] || descriptions['Restaurant'];
    return categoryDescriptions[Math.floor(Math.random() * categoryDescriptions.length)];
  }

  private static getOptimizedDefaultImageForCategory(category: string): string {
    const defaultImages = {
      'Spa & Wellness': 'https://images.pexels.com/photos/3757942/pexels-photo-3757942.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&fit=crop&fm=webp',
      'Restaurant': 'https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&fit=crop&fm=webp',
      'Bar & Restaurant': 'https://images.pexels.com/photos/1581384/pexels-photo-1581384.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&fit=crop&fm=webp',
      'Cafe': 'https://images.pexels.com/photos/302899/pexels-photo-302899.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&fit=crop&fm=webp',
      'Street Food': 'https://images.pexels.com/photos/1267320/pexels-photo-1267320.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&fit=crop&fm=webp',
      'Massage Parlour': 'https://images.pexels.com/photos/3865676/pexels-photo-3865676.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&fit=crop&fm=webp'
    };

    return defaultImages[category as keyof typeof defaultImages] || defaultImages['Restaurant'];
  }

  private static getRandomTimeSlot(): { start: string; end: string } {
    const timeSlots = [
      { start: '09:00', end: '12:00' },
      { start: '11:00', end: '15:00' },
      { start: '14:00', end: '17:00' },
      { start: '17:00', end: '20:00' },
      { start: '18:00', end: '22:00' },
      { start: '19:00', end: '23:00' }
    ];

    return timeSlots[Math.floor(Math.random() * timeSlots.length)];
  }
}