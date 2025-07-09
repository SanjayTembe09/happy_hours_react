import { Business } from '@/types';

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

  // Global city-specific business templates
  private static readonly GLOBAL_BUSINESS_TEMPLATES = {
    // Major US Cities
    'New York': {
      restaurants: ['The Smith', 'Katz\'s Delicatessen', 'Joe\'s Pizza', 'Shake Shack', 'Blue Hill'],
      bars: ['Please Don\'t Tell', 'Death & Co', 'Employees Only', 'Angel\'s Share', 'Attaboy'],
      cafes: ['Blue Bottle Coffee', 'Stumptown Coffee', 'Joe Coffee', 'Irving Farm', 'Gregorys Coffee'],
      spas: ['Aire Ancient Baths', 'The Spa at Mandarin Oriental', 'Great Jones Spa', 'Bliss Spa']
    },
    'Los Angeles': {
      restaurants: ['Guelaguetza', 'Night + Market', 'Republique', 'Bestia', 'Providence'],
      bars: ['The Varnish', 'Seven Grand', 'Harvard & Stone', 'No Vacancy', 'Clifton\'s'],
      cafes: ['Intelligentsia Coffee', 'Blue Bottle Coffee', 'Verve Coffee', 'Alfred Coffee', 'Go Get Em Tiger'],
      spas: ['The Spa at Beverly Hills Hotel', 'Burke Williams', 'Tomoko Spa', 'The NOW']
    },
    'London': {
      restaurants: ['Dishoom', 'Sketch', 'Duck & Waffle', 'Hawksmoor', 'The Ivy'],
      bars: ['Nightjar', 'Connaught Bar', 'American Bar', 'Zuma Bar', 'Callooh Callay'],
      cafes: ['Monmouth Coffee', 'Workshop Coffee', 'Ozone Coffee', 'Prufrock Coffee', 'Fernandez & Wells'],
      spas: ['ESPA at Corinthia', 'Akasha Holistic Wellbeing', 'The Ned Spa', 'Cowshed Spa']
    },
    'Tokyo': {
      restaurants: ['Sukiyabashi Jiro', 'Narisawa', 'Den', 'Florilège', 'L\'Effervescence'],
      bars: ['Bar High Five', 'Tender Bar', 'Bar Benfiddich', 'Cocktail Works', 'Bar Trench'],
      cafes: ['Blue Seal Coffee', 'Streamer Coffee', 'Fuglen Tokyo', 'Little Nap Coffee', 'Onibus Coffee'],
      spas: ['Aman Spa Tokyo', 'The Ritz-Carlton Spa', 'Mandarin Oriental Spa', 'Conrad Tokyo Spa']
    },
    'Paris': {
      restaurants: ['L\'Ami Jean', 'Le Comptoir du Relais', 'Breizh Café', 'L\'As du Fallafel', 'Pierre Hermé'],
      bars: ['Hemingway Bar', 'Little Red Door', 'Candelaria', 'Le Mary Celeste', 'Experimental Cocktail Club'],
      cafes: ['Café de Flore', 'Les Deux Abeilles', 'Boot Café', 'Telescope Café', 'Loustic'],
      spas: ['La Mer Spa', 'Spa My Blend by Clarins', 'Four Seasons Spa', 'Mandarin Oriental Spa']
    },
    'Sydney': {
      restaurants: ['Quay', 'Bennelong', 'Tetsuya\'s', 'Momofuku Seiobo', 'Rockpool Bar & Grill'],
      bars: ['Baxter Inn', 'Eau de Vie', 'Palmer & Co', 'The Baxter Inn', 'Maybe Sammy'],
      cafes: ['Single O', 'Reuben Hills', 'The Grounds of Alexandria', 'Campos Coffee', 'Toby\'s Estate'],
      spas: ['Aurora Spa & Pool', 'Endota Spa', 'The Langham Spa', 'Shangri La Spa']
    },
    'Bangkok': {
      restaurants: ['Gaggan Progressive Indian', 'Sorn Southern Thai', 'Le Du Modern Thai', 'Paste Bangkok', 'Blue Elephant Restaurant'],
      bars: ['Sky Bar Bangkok', 'Rooftop Lounge 64', 'The Deck by Arun', 'Vertigo Moon Bar', 'Above Eleven'],
      cafes: ['Dean & DeLuca', 'Roast Coffee & Eatery', 'Gallery Drip Coffee', 'Rocket Coffeebar', 'Casa Lapin'],
      spas: ['Health Land Spa', 'Let\'s Relax Spa', 'Divana Virtue Spa', 'Asia Herb Association', 'Wat Pho Thai Massage']
    },
    // Pattaya/Bang Lamung specific businesses
    'Pattaya': {
      restaurants: ['Mantra Restaurant & Bar', 'The Glass House', 'Horizon Rooftop Restaurant', 'Moom Aroi Restaurant', 'Surf Kitchen'],
      bars: ['Hilton Rooftop Bar', 'Sky Gallery Pattaya', 'Mixx Discotheque', 'Insomnia Discotheque', 'Red Sky Rooftop Bar'],
      cafes: ['Coffee Club Pattaya', 'Dean & DeLuca Central Festival', 'Starbucks Beach Road', 'Amazon Café', 'True Coffee'],
      spas: ['Let\'s Relax Spa Pattaya', 'Health Land Spa & Massage', 'Oasis Spa Pattaya', 'Asia Herb Association', 'Sabai Sabai Thai Massage']
    },
    // Default template for unknown cities
    'default': {
      restaurants: ['Local Bistro', 'City Grill', 'Corner Kitchen', 'Main Street Eatery', 'Downtown Dining'],
      bars: ['The Local Pub', 'City Bar & Grill', 'Corner Tavern', 'Downtown Lounge', 'Neighborhood Bar'],
      cafes: ['Local Coffee Co.', 'City Roasters', 'Corner Cafe', 'Main Street Coffee', 'Downtown Brew'],
      spas: ['City Spa & Wellness', 'Local Massage Studio', 'Downtown Wellness Center', 'Corner Spa', 'Neighborhood Wellness']
    }
  };

  static async searchNearbyPlaces(params: PlaceSearchParams): Promise<Business[]> {
    try {
      // For demo purposes, we'll use location-based mock data
      // In production, you would use the Google Places API
      return this.getMockPlacesForLocation(params);
    } catch (error) {
      console.error('Error searching places:', error);
      return this.getMockPlacesForLocation(params);
    }
  }

  private static async getMockPlacesForLocation(params: PlaceSearchParams): Promise<Business[]> {
    const { latitude, longitude, category } = params;
    
    // Determine city/region based on coordinates
    const cityInfo = this.getCityFromCoordinates(latitude, longitude);
    const businessTemplates = this.GLOBAL_BUSINESS_TEMPLATES[cityInfo.name] || this.GLOBAL_BUSINESS_TEMPLATES['default'];
    
    const places: Business[] = [];
    const numPlaces = 12 + Math.floor(Math.random() * 8); // 12-20 places

    // Generate places around the user's location
    for (let i = 0; i < numPlaces; i++) {
      const categoryType = this.selectCategoryType(category, businessTemplates);
      
      // Skip if category filter doesn't match
      if (category && category !== 'All' && !this.categoryMatches(category, categoryType)) {
        continue;
      }

      // Generate coordinates within radius
      const radiusInDegrees = (params.radius || 5000) / 111000; // Convert meters to degrees
      const randomLat = latitude + (Math.random() - 0.5) * radiusInDegrees * 2;
      const randomLng = longitude + (Math.random() - 0.5) * radiusInDegrees * 2;

      const businessName = this.getBusinessName(categoryType, businessTemplates, cityInfo.name);
      const discount = this.generateDiscount(`place_${i}_${Date.now()}`);

      const place: Business = {
        id: `place_${i}_${Date.now()}`,
        name: businessName,
        description: this.generateDescription(categoryType, cityInfo.name),
        image: this.getImageForCategory(categoryType),
        location: {
          latitude: randomLat,
          longitude: randomLng,
          address: this.generateAddress(randomLat, randomLng, cityInfo),
        },
        category: categoryType,
        rating: 3.8 + Math.random() * 1.2, // 3.8 to 5.0
        currentDiscount: discount,
        isActive: Math.random() > 0.05, // 95% active
      };

      // CRITICAL: Only add places that have active discounts for happy hour app
      if (discount.isActive) {
        places.push(place);
      }
    }

    return places.sort((a, b) => {
      // Sort by distance from user location
      const distA = this.calculateDistance(latitude, longitude, a.location.latitude, a.location.longitude);
      const distB = this.calculateDistance(latitude, longitude, b.location.latitude, b.location.longitude);
      return distA - distB;
    });
  }

  private static getCityFromCoordinates(lat: number, lng: number): { name: string; country: string; timezone: string; region?: string } {
    // Major city coordinate ranges (approximate)
    const cityRanges = [
      { name: 'New York', country: 'USA', timezone: 'America/New_York', lat: [40.4774, 40.9176], lng: [-74.2591, -73.7004] },
      { name: 'Los Angeles', country: 'USA', timezone: 'America/Los_Angeles', lat: [33.7037, 34.3373], lng: [-118.6681, -118.1553] },
      { name: 'London', country: 'UK', timezone: 'Europe/London', lat: [51.2868, 51.6918], lng: [-0.5103, 0.3340] },
      { name: 'Paris', country: 'France', timezone: 'Europe/Paris', lat: [48.8155, 48.9021], lng: [2.2241, 2.4699] },
      { name: 'Tokyo', country: 'Japan', timezone: 'Asia/Tokyo', lat: [35.5322, 35.8986], lng: [139.3431, 139.9194] },
      { name: 'Sydney', country: 'Australia', timezone: 'Australia/Sydney', lat: [-34.1692, -33.5781], lng: [150.5023, 151.3430] },
      { name: 'Bangkok', country: 'Thailand', timezone: 'Asia/Bangkok', lat: [13.4980, 14.0990], lng: [100.3273, 100.9319] },
      // Pattaya/Bang Lamung area (Chonburi Province, Thailand)
      { name: 'Pattaya', country: 'Thailand', timezone: 'Asia/Bangkok', region: 'Chonburi', lat: [12.8000, 13.0000], lng: [100.8000, 101.0000] },
      { name: 'Singapore', country: 'Singapore', timezone: 'Asia/Singapore', lat: [1.1304, 1.4784], lng: [103.6920, 104.0120] },
      { name: 'Dubai', country: 'UAE', timezone: 'Asia/Dubai', lat: [24.7136, 25.4052], lng: [54.8896, 55.5136] },
      { name: 'Berlin', country: 'Germany', timezone: 'Europe/Berlin', lat: [52.3382, 52.6755], lng: [13.0883, 13.7611] },
    ];

    for (const city of cityRanges) {
      if (lat >= city.lat[0] && lat <= city.lat[1] && lng >= city.lng[0] && lng <= city.lng[1]) {
        return { name: city.name, country: city.country, timezone: city.timezone, region: city.region };
      }
    }

    // Default to generic city
    return { name: 'default', country: 'Unknown', timezone: 'UTC' };
  }

  private static selectCategoryType(category: string | undefined, templates: any): string {
    const categoryMap = {
      'Restaurant': 'restaurants',
      'Bar & Restaurant': 'bars',
      'Cafe': 'cafes',
      'Spa & Wellness': 'spas',
      'Massage Parlour': 'spas',
      'Street Food': 'restaurants'
    };

    if (category && category !== 'All') {
      const templateKey = categoryMap[category as keyof typeof categoryMap] || 'restaurants';
      return category;
    }

    // Random category
    const categories = ['Restaurant', 'Bar & Restaurant', 'Cafe', 'Spa & Wellness'];
    return categories[Math.floor(Math.random() * categories.length)];
  }

  private static categoryMatches(filterCategory: string, businessCategory: string): boolean {
    if (filterCategory === 'All') return true;
    if (filterCategory === businessCategory) return true;
    if (filterCategory === 'Spa & Wellness' && businessCategory === 'Massage Parlour') return true;
    if (filterCategory === 'Massage Parlour' && businessCategory === 'Spa & Wellness') return true;
    return false;
  }

  private static getBusinessName(categoryType: string, templates: any, cityName: string): string {
    const categoryMap = {
      'Restaurant': 'restaurants',
      'Bar & Restaurant': 'bars',
      'Cafe': 'cafes',
      'Spa & Wellness': 'spas',
      'Massage Parlour': 'spas',
      'Street Food': 'restaurants'
    };

    const templateKey = categoryMap[categoryType as keyof typeof categoryMap] || 'restaurants';
    const names = templates[templateKey] || templates.restaurants;
    
    return names[Math.floor(Math.random() * names.length)];
  }

  private static generateDescription(categoryType: string, cityName: string): string {
    const descriptions = {
      'Restaurant': [
        `Exceptional dining experience featuring ${cityName === 'default' ? 'local' : this.getCuisineType(cityName)} cuisine with fresh, high-quality ingredients`,
        `Award-winning restaurant showcasing the best of ${cityName === 'default' ? 'regional' : cityName} culinary traditions`,
        `Contemporary dining with innovative dishes and locally-sourced ingredients`,
        `Fine dining establishment offering an unforgettable gastronomic journey`
      ],
      'Bar & Restaurant': [
        `Sophisticated bar and restaurant with craft cocktails and gourmet dining`,
        `Vibrant atmosphere perfect for drinks and dining with friends`,
        `Premium cocktail lounge with exceptional food and city views`,
        `Trendy spot combining innovative mixology with delicious cuisine`
      ],
      'Cafe': [
        `Artisanal coffee roasted daily with fresh pastries and light meals`,
        `Cozy neighborhood cafe perfect for work or relaxation`,
        `Specialty coffee house with locally-sourced beans and homemade treats`,
        `Popular local spot for premium coffee and healthy breakfast options`
      ],
      'Spa & Wellness': [
        `Luxurious spa offering rejuvenating treatments and wellness services`,
        `Tranquil wellness center with professional therapists and premium amenities`,
        `Full-service spa combining traditional techniques with modern facilities`,
        `Peaceful retreat for relaxation and therapeutic treatments`
      ],
      'Massage Parlour': [
        `Professional massage therapy center with certified therapists`,
        `Therapeutic massage studio specializing in wellness and relaxation`,
        `Expert massage services in a clean, professional environment`,
        `Healing touch massage center with various treatment options`
      ],
      'Street Food': [
        `Authentic local street food with traditional recipes and fresh ingredients`,
        `Popular food stall known for delicious, affordable local specialties`,
        `Local favorite serving traditional dishes with modern presentation`,
        `Vibrant food experience showcasing regional flavors and culture`
      ]
    };

    const categoryDescriptions = descriptions[categoryType as keyof typeof descriptions] || descriptions['Restaurant'];
    return categoryDescriptions[Math.floor(Math.random() * categoryDescriptions.length)];
  }

  private static getCuisineType(cityName: string): string {
    const cuisineMap: { [key: string]: string } = {
      'New York': 'American',
      'Los Angeles': 'Californian',
      'London': 'British',
      'Paris': 'French',
      'Tokyo': 'Japanese',
      'Sydney': 'Australian',
      'Bangkok': 'Thai',
      'Pattaya': 'Thai',
      'Singapore': 'Singaporean',
      'Dubai': 'Middle Eastern',
      'Berlin': 'German'
    };
    return cuisineMap[cityName] || 'international';
  }

  private static generateAddress(lat: number, lng: number, cityInfo: { name: string; country: string; region?: string }): string {
    const streetNumbers = [123, 456, 789, 101, 234, 567, 890, 321, 654, 987];
    
    const streetNamesByCity: { [key: string]: string[] } = {
      'New York': ['Broadway', 'Madison Ave', 'Park Ave', 'Fifth Ave', 'Wall Street', 'Houston St'],
      'Los Angeles': ['Sunset Blvd', 'Hollywood Blvd', 'Melrose Ave', 'Santa Monica Blvd', 'Wilshire Blvd'],
      'London': ['Oxford Street', 'Regent Street', 'Bond Street', 'Piccadilly', 'King\'s Road', 'High Street'],
      'Paris': ['Champs-Élysées', 'Rue de Rivoli', 'Boulevard Saint-Germain', 'Rue du Faubourg', 'Avenue Montaigne'],
      'Tokyo': ['Shibuya', 'Ginza', 'Harajuku', 'Shinjuku', 'Roppongi', 'Akasaka'],
      'Sydney': ['George Street', 'Pitt Street', 'Elizabeth Street', 'Castlereagh Street', 'York Street'],
      'Bangkok': ['Silom Road', 'Sukhumvit Road', 'Sathorn Road', 'Ploenchit Road', 'Ratchadamri Road'],
      // Authentic Pattaya/Bang Lamung street names
      'Pattaya': [
        'Beach Road', 'Second Road', 'Third Road', 'Pattaya Klang Road', 'Pattaya Tai Road',
        'Sukhumvit Road', 'Jomtien Beach Road', 'Thappraya Road', 'Naklua Road', 'Soi Buakhao',
        'Central Pattaya Road', 'North Pattaya Road', 'South Pattaya Road', 'Soi LK Metro',
        'Soi Yensabai', 'Soi Honey Inn', 'Soi Diana Inn', 'Soi Yamato', 'Soi Chaiyapoon'
      ],
      'default': ['Main Street', 'Oak Avenue', 'Park Road', 'First Street', 'Central Boulevard', 'Market Street']
    };

    // Sub-districts for Pattaya area
    const pattayaSubDistricts = [
      'Bang Lamung', 'Nong Prue', 'Huai Yai', 'Pong', 'Takhian Tia',
      'Central Pattaya', 'North Pattaya', 'South Pattaya', 'Jomtien', 'Naklua'
    ];

    const streetNumber = streetNumbers[Math.floor(Math.random() * streetNumbers.length)];
    const streets = streetNamesByCity[cityInfo.name] || streetNamesByCity['default'];
    const streetName = streets[Math.floor(Math.random() * streets.length)];
    
    let cityName = cityInfo.name === 'default' ? 'Downtown' : cityInfo.name;
    let fullAddress = '';

    if (cityInfo.name === 'Pattaya') {
      // Generate authentic Thai address format for Pattaya
      const subDistrict = pattayaSubDistricts[Math.floor(Math.random() * pattayaSubDistricts.length)];
      const postalCodes = ['20150', '20260', '20250'];
      const postalCode = postalCodes[Math.floor(Math.random() * postalCodes.length)];
      
      fullAddress = `${streetNumber} ${streetName}, ${subDistrict}, Bang Lamung District, Chonburi ${postalCode}, Thailand`;
    } else {
      const country = cityInfo.country === 'Unknown' ? '' : `, ${cityInfo.country}`;
      fullAddress = `${streetNumber} ${streetName}, ${cityName}${country}`;
    }
    
    return fullAddress;
  }

  private static generateDiscount(businessId: string) {
    const discountTypes = [
      { title: 'Happy Hour Special', percentage: 25, description: 'Discounted drinks and appetizers' },
      { title: 'Lunch Deal', percentage: 20, description: 'Special pricing on lunch menu' },
      { title: 'Early Bird Special', percentage: 30, description: 'Morning discount for early customers' },
      { title: 'Weekend Promotion', percentage: 35, description: 'Weekend-only special offers' },
      { title: 'Student Discount', percentage: 15, description: 'Special rates for students with ID' },
      { title: 'Local Resident Deal', percentage: 40, description: 'Exclusive discount for local residents' },
      { title: 'First-Time Visitor', percentage: 50, description: 'Welcome offer for new customers' },
      { title: 'Spa Package Deal', percentage: 45, description: 'Combo treatment discounts' },
      { title: 'Coffee & Pastry Combo', percentage: 20, description: 'Save on coffee and food combinations' },
      { title: 'Sunset Special', percentage: 30, description: 'Sunset hour promotions' },
      { title: 'After Work Special', percentage: 25, description: 'Perfect for unwinding after work' },
      { title: 'Date Night Deal', percentage: 35, description: 'Special pricing for couples' },
    ];

    const timeSlots = [
      { from: '09:00', to: '12:00' },
      { from: '11:00', to: '15:00' },
      { from: '14:00', to: '17:00' },
      { from: '17:00', to: '20:00' },
      { from: '18:00', to: '22:00' },
      { from: '19:00', to: '23:00' },
      { from: '16:00', to: '19:00' }, // Classic happy hour
      { from: '15:00', to: '18:00' }, // Afternoon special
    ];

    const discount = discountTypes[Math.floor(Math.random() * discountTypes.length)];
    const timeSlot = timeSlots[Math.floor(Math.random() * timeSlots.length)];

    return {
      id: `discount_${businessId}`,
      businessId,
      title: discount.title,
      description: discount.description,
      percentage: discount.percentage,
      validFrom: timeSlot.from,
      validTo: timeSlot.to,
      isActive: Math.random() > 0.15, // 85% chance of being active (high for happy hour app)
    };
  }

  private static getImageForCategory(category: string): string {
    const imageMap = {
      'Restaurant': [
        'https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg',
        'https://images.pexels.com/photos/958545/pexels-photo-958545.jpeg',
        'https://images.pexels.com/photos/262978/pexels-photo-262978.jpeg',
        'https://images.pexels.com/photos/1581384/pexels-photo-1581384.jpeg',
      ],
      'Bar & Restaurant': [
        'https://images.pexels.com/photos/1581384/pexels-photo-1581384.jpeg',
        'https://images.pexels.com/photos/274192/pexels-photo-274192.jpeg',
        'https://images.pexels.com/photos/1267320/pexels-photo-1267320.jpeg',
        'https://images.pexels.com/photos/941861/pexels-photo-941861.jpeg',
      ],
      'Cafe': [
        'https://images.pexels.com/photos/302899/pexels-photo-302899.jpeg',
        'https://images.pexels.com/photos/1307698/pexels-photo-1307698.jpeg',
        'https://images.pexels.com/photos/1833586/pexels-photo-1833586.jpeg',
        'https://images.pexels.com/photos/1002543/pexels-photo-1002543.jpeg',
      ],
      'Spa & Wellness': [
        'https://images.pexels.com/photos/3757942/pexels-photo-3757942.jpeg',
        'https://images.pexels.com/photos/3865711/pexels-photo-3865711.jpeg',
        'https://images.pexels.com/photos/3865674/pexels-photo-3865674.jpeg',
        'https://images.pexels.com/photos/3865678/pexels-photo-3865678.jpeg',
      ],
      'Massage Parlour': [
        'https://images.pexels.com/photos/3865676/pexels-photo-3865676.jpeg',
        'https://images.pexels.com/photos/3865675/pexels-photo-3865675.jpeg',
        'https://images.pexels.com/photos/3865677/pexels-photo-3865677.jpeg',
        'https://images.pexels.com/photos/3865679/pexels-photo-3865679.jpeg',
      ],
      'Street Food': [
        'https://images.pexels.com/photos/1267320/pexels-photo-1267320.jpeg',
        'https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg',
        'https://images.pexels.com/photos/958545/pexels-photo-958545.jpeg',
        'https://images.pexels.com/photos/1199957/pexels-photo-1199957.jpeg',
      ],
    };

    const categoryImages = imageMap[category as keyof typeof imageMap] || imageMap['Restaurant'];
    return categoryImages[Math.floor(Math.random() * categoryImages.length)];
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
    // In production, this would fetch detailed place information
    // For now, return mock data
    return {
      place_id: placeId,
      formatted_phone_number: '+66-38-123-456', // Thai phone format
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