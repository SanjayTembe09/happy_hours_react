import { LocationOption } from '@/types';

export class LocationService {
  static readonly POPULAR_LOCATIONS: LocationOption[] = [
    // Asia-Pacific Popular
    {
      id: 'bangkok',
      name: 'Bangkok',
      country: 'Thailand',
      coordinates: { latitude: 13.7563, longitude: 100.5018 },
      timezone: 'Asia/Bangkok',
      isPopular: true,
    },
    {
      id: 'mumbai',
      name: 'Mumbai',
      country: 'India',
      coordinates: { latitude: 19.0760, longitude: 72.8777 },
      timezone: 'Asia/Kolkata',
      isPopular: true,
    },
    {
      id: 'tokyo',
      name: 'Tokyo',
      country: 'Japan',
      coordinates: { latitude: 35.6762, longitude: 139.6503 },
      timezone: 'Asia/Tokyo',
      isPopular: true,
    },
    {
      id: 'singapore',
      name: 'Singapore',
      country: 'Singapore',
      coordinates: { latitude: 1.3521, longitude: 103.8198 },
      timezone: 'Asia/Singapore',
      isPopular: true,
    },
    {
      id: 'sydney',
      name: 'Sydney',
      country: 'Australia',
      coordinates: { latitude: -33.8688, longitude: 151.2093 },
      timezone: 'Australia/Sydney',
      isPopular: true,
    },
    
    // Europe Popular
    {
      id: 'london',
      name: 'London',
      country: 'UK',
      coordinates: { latitude: 51.5074, longitude: -0.1278 },
      timezone: 'Europe/London',
      isPopular: true,
    },
    {
      id: 'paris',
      name: 'Paris',
      country: 'France',
      coordinates: { latitude: 48.8566, longitude: 2.3522 },
      timezone: 'Europe/Paris',
      isPopular: true,
    },
    {
      id: 'amsterdam',
      name: 'Amsterdam',
      country: 'Netherlands',
      coordinates: { latitude: 52.3676, longitude: 4.9041 },
      timezone: 'Europe/Amsterdam',
      isPopular: true,
    },
    
    // Americas Popular
    {
      id: 'new-york',
      name: 'New York',
      country: 'USA',
      coordinates: { latitude: 40.7128, longitude: -74.0060 },
      timezone: 'America/New_York',
      isPopular: true,
    },
    {
      id: 'los-angeles',
      name: 'Los Angeles',
      country: 'USA',
      coordinates: { latitude: 34.0522, longitude: -118.2437 },
      timezone: 'America/Los_Angeles',
      isPopular: true,
    },
    
    // Middle East Popular
    {
      id: 'dubai',
      name: 'Dubai',
      country: 'UAE',
      coordinates: { latitude: 25.2048, longitude: 55.2708 },
      timezone: 'Asia/Dubai',
      isPopular: true,
    },

    // Additional Major Cities
    
    // More Indian Cities
    {
      id: 'delhi',
      name: 'Delhi',
      country: 'India',
      coordinates: { latitude: 28.7041, longitude: 77.1025 },
      timezone: 'Asia/Kolkata',
      isPopular: false,
    },
    {
      id: 'bangalore',
      name: 'Bangalore',
      country: 'India',
      coordinates: { latitude: 12.9716, longitude: 77.5946 },
      timezone: 'Asia/Kolkata',
      isPopular: false,
    },
    {
      id: 'pune',
      name: 'Pune',
      country: 'India',
      coordinates: { latitude: 18.5204, longitude: 73.8567 },
      timezone: 'Asia/Kolkata',
      isPopular: false,
    },
    {
      id: 'hyderabad',
      name: 'Hyderabad',
      country: 'India',
      coordinates: { latitude: 17.3850, longitude: 78.4867 },
      timezone: 'Asia/Kolkata',
      isPopular: false,
    },
    {
      id: 'chennai',
      name: 'Chennai',
      country: 'India',
      coordinates: { latitude: 13.0827, longitude: 80.2707 },
      timezone: 'Asia/Kolkata',
      isPopular: false,
    },
    {
      id: 'kolkata',
      name: 'Kolkata',
      country: 'India',
      coordinates: { latitude: 22.5726, longitude: 88.3639 },
      timezone: 'Asia/Kolkata',
      isPopular: false,
    },
    {
      id: 'goa',
      name: 'Goa',
      country: 'India',
      coordinates: { latitude: 15.2993, longitude: 74.1240 },
      timezone: 'Asia/Kolkata',
      isPopular: false,
    },

    // More Asian Cities
    {
      id: 'pattaya',
      name: 'Pattaya',
      country: 'Thailand',
      coordinates: { latitude: 12.9236, longitude: 100.8825 },
      timezone: 'Asia/Bangkok',
      isPopular: false,
    },
    {
      id: 'hong-kong',
      name: 'Hong Kong',
      country: 'Hong Kong',
      coordinates: { latitude: 22.3193, longitude: 114.1694 },
      timezone: 'Asia/Hong_Kong',
      isPopular: false,
    },
    {
      id: 'kuala-lumpur',
      name: 'Kuala Lumpur',
      country: 'Malaysia',
      coordinates: { latitude: 3.1390, longitude: 101.6869 },
      timezone: 'Asia/Kuala_Lumpur',
      isPopular: false,
    },
    {
      id: 'jakarta',
      name: 'Jakarta',
      country: 'Indonesia',
      coordinates: { latitude: -6.2088, longitude: 106.8456 },
      timezone: 'Asia/Jakarta',
      isPopular: false,
    },
    {
      id: 'manila',
      name: 'Manila',
      country: 'Philippines',
      coordinates: { latitude: 14.5995, longitude: 120.9842 },
      timezone: 'Asia/Manila',
      isPopular: false,
    },
    {
      id: 'seoul',
      name: 'Seoul',
      country: 'South Korea',
      coordinates: { latitude: 37.5665, longitude: 126.9780 },
      timezone: 'Asia/Seoul',
      isPopular: false,
    },
    {
      id: 'taipei',
      name: 'Taipei',
      country: 'Taiwan',
      coordinates: { latitude: 25.0330, longitude: 121.5654 },
      timezone: 'Asia/Taipei',
      isPopular: false,
    },
    {
      id: 'ho-chi-minh',
      name: 'Ho Chi Minh City',
      country: 'Vietnam',
      coordinates: { latitude: 10.8231, longitude: 106.6297 },
      timezone: 'Asia/Ho_Chi_Minh',
      isPopular: false,
    },

    // More European Cities
    {
      id: 'berlin',
      name: 'Berlin',
      country: 'Germany',
      coordinates: { latitude: 52.5200, longitude: 13.4050 },
      timezone: 'Europe/Berlin',
      isPopular: false,
    },
    {
      id: 'barcelona',
      name: 'Barcelona',
      country: 'Spain',
      coordinates: { latitude: 41.3851, longitude: 2.1734 },
      timezone: 'Europe/Madrid',
      isPopular: false,
    },
    {
      id: 'rome',
      name: 'Rome',
      country: 'Italy',
      coordinates: { latitude: 41.9028, longitude: 12.4964 },
      timezone: 'Europe/Rome',
      isPopular: false,
    },
    {
      id: 'madrid',
      name: 'Madrid',
      country: 'Spain',
      coordinates: { latitude: 40.4168, longitude: -3.7038 },
      timezone: 'Europe/Madrid',
      isPopular: false,
    },
    {
      id: 'vienna',
      name: 'Vienna',
      country: 'Austria',
      coordinates: { latitude: 48.2082, longitude: 16.3738 },
      timezone: 'Europe/Vienna',
      isPopular: false,
    },
    {
      id: 'prague',
      name: 'Prague',
      country: 'Czech Republic',
      coordinates: { latitude: 50.0755, longitude: 14.4378 },
      timezone: 'Europe/Prague',
      isPopular: false,
    },
    {
      id: 'budapest',
      name: 'Budapest',
      country: 'Hungary',
      coordinates: { latitude: 47.4979, longitude: 19.0402 },
      timezone: 'Europe/Budapest',
      isPopular: false,
    },
    {
      id: 'zurich',
      name: 'Zurich',
      country: 'Switzerland',
      coordinates: { latitude: 47.3769, longitude: 8.5417 },
      timezone: 'Europe/Zurich',
      isPopular: false,
    },
    {
      id: 'stockholm',
      name: 'Stockholm',
      country: 'Sweden',
      coordinates: { latitude: 59.3293, longitude: 18.0686 },
      timezone: 'Europe/Stockholm',
      isPopular: false,
    },
    {
      id: 'copenhagen',
      name: 'Copenhagen',
      country: 'Denmark',
      coordinates: { latitude: 55.6761, longitude: 12.5683 },
      timezone: 'Europe/Copenhagen',
      isPopular: false,
    },

    // More American Cities
    {
      id: 'chicago',
      name: 'Chicago',
      country: 'USA',
      coordinates: { latitude: 41.8781, longitude: -87.6298 },
      timezone: 'America/Chicago',
      isPopular: false,
    },
    {
      id: 'san-francisco',
      name: 'San Francisco',
      country: 'USA',
      coordinates: { latitude: 37.7749, longitude: -122.4194 },
      timezone: 'America/Los_Angeles',
      isPopular: false,
    },
    {
      id: 'miami',
      name: 'Miami',
      country: 'USA',
      coordinates: { latitude: 25.7617, longitude: -80.1918 },
      timezone: 'America/New_York',
      isPopular: false,
    },
    {
      id: 'las-vegas',
      name: 'Las Vegas',
      country: 'USA',
      coordinates: { latitude: 36.1699, longitude: -115.1398 },
      timezone: 'America/Los_Angeles',
      isPopular: false,
    },
    {
      id: 'toronto',
      name: 'Toronto',
      country: 'Canada',
      coordinates: { latitude: 43.6532, longitude: -79.3832 },
      timezone: 'America/Toronto',
      isPopular: false,
    },
    {
      id: 'vancouver',
      name: 'Vancouver',
      country: 'Canada',
      coordinates: { latitude: 49.2827, longitude: -123.1207 },
      timezone: 'America/Vancouver',
      isPopular: false,
    },
    {
      id: 'mexico-city',
      name: 'Mexico City',
      country: 'Mexico',
      coordinates: { latitude: 19.4326, longitude: -99.1332 },
      timezone: 'America/Mexico_City',
      isPopular: false,
    },
    {
      id: 'sao-paulo',
      name: 'São Paulo',
      country: 'Brazil',
      coordinates: { latitude: -23.5505, longitude: -46.6333 },
      timezone: 'America/Sao_Paulo',
      isPopular: false,
    },
    {
      id: 'rio-de-janeiro',
      name: 'Rio de Janeiro',
      country: 'Brazil',
      coordinates: { latitude: -22.9068, longitude: -43.1729 },
      timezone: 'America/Sao_Paulo',
      isPopular: false,
    },
    {
      id: 'buenos-aires',
      name: 'Buenos Aires',
      country: 'Argentina',
      coordinates: { latitude: -34.6118, longitude: -58.3960 },
      timezone: 'America/Argentina/Buenos_Aires',
      isPopular: false,
    },

    // More Middle East & Africa
    {
      id: 'doha',
      name: 'Doha',
      country: 'Qatar',
      coordinates: { latitude: 25.2854, longitude: 51.5310 },
      timezone: 'Asia/Qatar',
      isPopular: false,
    },
    {
      id: 'riyadh',
      name: 'Riyadh',
      country: 'Saudi Arabia',
      coordinates: { latitude: 24.7136, longitude: 46.6753 },
      timezone: 'Asia/Riyadh',
      isPopular: false,
    },
    {
      id: 'tel-aviv',
      name: 'Tel Aviv',
      country: 'Israel',
      coordinates: { latitude: 32.0853, longitude: 34.7818 },
      timezone: 'Asia/Jerusalem',
      isPopular: false,
    },
    {
      id: 'istanbul',
      name: 'Istanbul',
      country: 'Turkey',
      coordinates: { latitude: 41.0082, longitude: 28.9784 },
      timezone: 'Europe/Istanbul',
      isPopular: false,
    },
    {
      id: 'cairo',
      name: 'Cairo',
      country: 'Egypt',
      coordinates: { latitude: 30.0444, longitude: 31.2357 },
      timezone: 'Africa/Cairo',
      isPopular: false,
    },
    {
      id: 'cape-town',
      name: 'Cape Town',
      country: 'South Africa',
      coordinates: { latitude: -33.9249, longitude: 18.4241 },
      timezone: 'Africa/Johannesburg',
      isPopular: false,
    },

    // More Oceania
    {
      id: 'melbourne',
      name: 'Melbourne',
      country: 'Australia',
      coordinates: { latitude: -37.8136, longitude: 144.9631 },
      timezone: 'Australia/Melbourne',
      isPopular: false,
    },
    {
      id: 'auckland',
      name: 'Auckland',
      country: 'New Zealand',
      coordinates: { latitude: -36.8485, longitude: 174.7633 },
      timezone: 'Pacific/Auckland',
      isPopular: false,
    },
  ];

  static getPopularLocations(): LocationOption[] {
    return this.POPULAR_LOCATIONS.filter(location => location.isPopular);
  }

  static getAllLocations(): LocationOption[] {
    return this.POPULAR_LOCATIONS;
  }

  static searchLocations(query: string): LocationOption[] {
    const lowercaseQuery = query.toLowerCase();
    return this.POPULAR_LOCATIONS.filter(location =>
      location.name.toLowerCase().includes(lowercaseQuery) ||
      location.country.toLowerCase().includes(lowercaseQuery)
    );
  }

  static getLocationById(id: string): LocationOption | null {
    return this.POPULAR_LOCATIONS.find(location => location.id === id) || null;
  }

  static getCurrentTimeInLocation(location: LocationOption): string {
    try {
      const now = new Date();
      return now.toLocaleTimeString('en-US', {
        timeZone: location.timezone,
        hour: '2-digit',
        minute: '2-digit',
        hour12: true,
      });
    } catch (error) {
      return new Date().toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true,
      });
    }
  }

  static getLocationDisplayName(location: LocationOption): string {
    return `${location.name}, ${location.country}`;
  }
}