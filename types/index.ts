export interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  role: 'customer' | 'business' | 'admin';
  businessId?: string;
}

export interface Business {
  id: string;
  name: string;
  description: string;
  image: string;
  location: {
    latitude: number;
    longitude: number;
    address: string;
  };
  category: string;
  rating: number;
  currentDiscount?: Discount;
  isActive: boolean;
}

export interface Discount {
  id: string;
  businessId: string;
  title: string;
  description: string;
  percentage: number;
  validFrom: string;
  validTo: string;
  isActive: boolean;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  error: string | null;
}

export interface AppState {
  businesses: Business[];
  discounts: Discount[];
  userLocation: {
    latitude: number;
    longitude: number;
  } | null;
  isLoading: boolean;
  error: string | null;
}