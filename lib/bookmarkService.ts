import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface StorageInterface {
  getItem: (key: string) => Promise<string | null>;
  setItem: (key: string, value: string) => Promise<void>;
  removeItem: (key: string) => Promise<void>;
  clear: () => Promise<void>;
}

export class BookmarkService {
  private static readonly BOOKMARKS_KEY = 'happy_arz_bookmarks';
  private static readonly PREFERENCES_KEY = 'happy_arz_preferences';

  // Create a robust storage wrapper that works on all platforms
  private static async getStorage(): Promise<StorageInterface> {
    if (Platform.OS === 'web') {
      // Web implementation using localStorage
      return {
        getItem: async (key: string) => {
          try {
            return localStorage.getItem(key);
          } catch (error) {
            console.warn('localStorage getItem error:', error);
            return null;
          }
        },
        setItem: async (key: string, value: string) => {
          try {
            localStorage.setItem(key, value);
          } catch (error) {
            console.warn('localStorage setItem error:', error);
          }
        },
        removeItem: async (key: string) => {
          try {
            localStorage.removeItem(key);
          } catch (error) {
            console.warn('localStorage removeItem error:', error);
          }
        },
        clear: async () => {
          try {
            if (typeof localStorage !== 'undefined' && typeof localStorage.clear === 'function') {
              localStorage.clear();
            } else {
              console.warn('localStorage.clear is not available');
            }
          } catch (error) {
            console.warn('localStorage clear error:', error);
          }
        },
      };
    }
    
    // Native implementation using AsyncStorage
    return {
      getItem: async (key: string) => {
        try {
          return await AsyncStorage.getItem(key);
        } catch (error) {
          console.warn('AsyncStorage getItem error:', error);
          return null;
        }
      },
      setItem: async (key: string, value: string) => {
        try {
          await AsyncStorage.setItem(key, value);
        } catch (error) {
          console.warn('AsyncStorage setItem error:', error);
        }
      },
      removeItem: async (key: string) => {
        try {
          await AsyncStorage.removeItem(key);
        } catch (error) {
          console.warn('AsyncStorage removeItem error:', error);
        }
      },
      clear: async () => {
        try {
          if (AsyncStorage && typeof AsyncStorage.clear === 'function') {
            await AsyncStorage.clear();
          } else {
            console.warn('AsyncStorage.clear is not available');
          }
        } catch (error) {
          console.warn('AsyncStorage clear error:', error);
        }
      },
    };
  }

  static async getBookmarkedPlaces(): Promise<string[]> {
    try {
      const storage = await this.getStorage();
      const bookmarks = await storage.getItem(this.BOOKMARKS_KEY);
      return bookmarks ? JSON.parse(bookmarks) : [];
    } catch (error) {
      console.error('Error getting bookmarks:', error);
      return [];
    }
  }

  static async addBookmark(placeId: string): Promise<void> {
    try {
      const storage = await this.getStorage();
      const bookmarks = await this.getBookmarkedPlaces();
      if (!bookmarks.includes(placeId)) {
        bookmarks.push(placeId);
        await storage.setItem(this.BOOKMARKS_KEY, JSON.stringify(bookmarks));
      }
    } catch (error) {
      console.error('Error adding bookmark:', error);
    }
  }

  static async removeBookmark(placeId: string): Promise<void> {
    try {
      const storage = await this.getStorage();
      const bookmarks = await this.getBookmarkedPlaces();
      const updatedBookmarks = bookmarks.filter(id => id !== placeId);
      await storage.setItem(this.BOOKMARKS_KEY, JSON.stringify(updatedBookmarks));
    } catch (error) {
      console.error('Error removing bookmark:', error);
    }
  }

  static async isBookmarked(placeId: string): Promise<boolean> {
    const bookmarks = await this.getBookmarkedPlaces();
    return bookmarks.includes(placeId);
  }

  static async toggleBookmark(placeId: string): Promise<boolean> {
    const isCurrentlyBookmarked = await this.isBookmarked(placeId);
    if (isCurrentlyBookmarked) {
      await this.removeBookmark(placeId);
      return false;
    } else {
      await this.addBookmark(placeId);
      return true;
    }
  }

  static async saveSelectedLocation(locationId: string): Promise<void> {
    try {
      const storage = await this.getStorage();
      const preferences = await this.getUserPreferences();
      preferences.selectedLocationId = locationId;
      await storage.setItem(this.PREFERENCES_KEY, JSON.stringify(preferences));
    } catch (error) {
      console.error('Error saving selected location:', error);
    }
  }

  static async getUserPreferences(): Promise<{
    selectedLocationId?: string;
    favoriteCategories: string[];
  }> {
    try {
      const storage = await this.getStorage();
      const preferences = await storage.getItem(this.PREFERENCES_KEY);
      return preferences ? JSON.parse(preferences) : { favoriteCategories: [] };
    } catch (error) {
      console.error('Error getting user preferences:', error);
      return { favoriteCategories: [] };
    }
  }

  static async saveUserPreferences(preferences: {
    selectedLocationId?: string;
    favoriteCategories: string[];
  }): Promise<void> {
    try {
      const storage = await this.getStorage();
      await storage.setItem(this.PREFERENCES_KEY, JSON.stringify(preferences));
    } catch (error) {
      console.error('Error saving user preferences:', error);
    }
  }

  static async clearAllData(): Promise<void> {
    try {
      const storage = await this.getStorage();
      await storage.removeItem(this.BOOKMARKS_KEY);
      await storage.removeItem(this.PREFERENCES_KEY);
    } catch (error) {
      console.error('Error clearing data:', error);
    }
  }
}