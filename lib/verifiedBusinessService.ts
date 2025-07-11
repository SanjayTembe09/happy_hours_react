import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Business, SpreadsheetRow, VerificationData } from '@/types';

interface StorageInterface {
  getItem: (key: string) => Promise<string | null>;
  setItem: (key: string, value: string) => Promise<void>;
  removeItem: (key: string) => Promise<void>;
  clear: () => Promise<void>;
}

export class VerifiedBusinessService {
  private static readonly VERIFIED_BUSINESSES_KEY = 'happy_arz_verified_businesses';
  private static readonly UPLOAD_HISTORY_KEY = 'happy_arz_upload_history';

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

  static async getVerifiedBusinesses(): Promise<Business[]> {
    try {
      const storage = await this.getStorage();
      const businesses = await storage.getItem(this.VERIFIED_BUSINESSES_KEY);
      return businesses ? JSON.parse(businesses) : [];
    } catch (error) {
      console.error('Error getting verified businesses:', error);
      return [];
    }
  }

  static async saveVerifiedBusinesses(businesses: Business[]): Promise<void> {
    try {
      const storage = await this.getStorage();
      await storage.setItem(this.VERIFIED_BUSINESSES_KEY, JSON.stringify(businesses));
    } catch (error) {
      console.error('Error saving verified businesses:', error);
    }
  }

  static async processSpreadsheetData(csvData: string): Promise<{
    businesses: Business[];
    errors: string[];
    summary: {
      total: number;
      processed: number;
      errors: number;
    };
  }> {
    try {
      // Parse CSV/TSV data with better handling
      const lines = csvData.split('\n').filter(line => line.trim());
      
      // Handle both comma and tab separated values
      const rows = lines.map(line => {
        // Try tab-separated first, then comma-separated
        if (line.includes('\t')) {
          return line.split('\t');
        } else {
          return line.split(',');
        }
      });
      
      return await this.processSpreadsheetRows(rows);
    } catch (error) {
      console.error('Error processing spreadsheet data:', error);
      return {
        businesses: [],
        errors: [error instanceof Error ? error.message : 'Failed to process spreadsheet data'],
        summary: {
          total: 0,
          processed: 0,
          errors: 1,
        },
      };
    }
  }

  private static async processSpreadsheetRows(rows: string[][]): Promise<{
    businesses: Business[];
    errors: string[];
    summary: {
      total: number;
      processed: number;
      errors: number;
    };
  }> {
    const errors: string[] = [];
    const businesses: Business[] = [];
    
    if (rows.length === 0) {
      return {
        businesses: [],
        errors: ['No data found'],
        summary: { total: 0, processed: 0, errors: 1 },
      };
    }

    // Skip header row
    const dataRows = rows.slice(1);
    console.log('Processing', dataRows.length, 'data rows');

    for (let i = 0; i < dataRows.length; i++) {
      try {
        const row = dataRows[i];
        
        // Skip completely empty rows
        if (!row || row.length === 0 || row.every(cell => !cell || cell.trim() === '')) {
          console.log(`Skipping empty row ${i + 2}`);
          continue;
        }

        console.log(`Processing row ${i + 2}:`, row);

        // Map columns based on your spreadsheet structure
        // Handle variable number of columns gracefully
        const [
          name = '',
          description = '',
          address = '',
          googleMarker = '',
          picture = '',
          logo = '',
          openHours = '',
          happyHourStart = '',
          happyHourEnd = '',
          telephone = '',
          remark = '',
          update = ''
        ] = row.map(cell => (cell || '').trim());

        // Enhanced validation - check for meaningful content
        const hasValidName = name && name.length > 2 && !name.toLowerCase().includes('update');
        const hasValidAddress = address && address.length > 5 && !address.toLowerCase().includes('update');

        // Skip rows that don't have valid business data
        if (!hasValidName && !hasValidAddress) {
          console.log(`Skipping row ${i + 2}: No valid name or address found`);
          continue;
        }

        // If we have a name but no address, try to extract address from description or other fields
        let finalName = name;
        let finalAddress = address;
        let finalDescription = description;

        if (hasValidName && !hasValidAddress) {
          // Try to find address-like content in other fields
          const possibleAddress = [description, googleMarker, remark].find(field => 
            field && field.length > 10 && (
              field.includes('Road') || 
              field.includes('Street') || 
              field.includes('Mumbai') || 
              field.includes('Bandra') ||
              field.includes('Lower Parel') ||
              field.includes('Andheri') ||
              field.includes(',')
            )
          );
          
          if (possibleAddress) {
            finalAddress = possibleAddress;
            finalDescription = description || `${finalName} - Popular venue in Mumbai`;
          } else {
            // Use a generic Mumbai address
            finalAddress = 'Mumbai, Maharashtra, India';
            finalDescription = description || `${finalName} - Popular venue in Mumbai`;
          }
        }

        // If we have address but no name, try to extract name from description
        if (!hasValidName && hasValidAddress) {
          if (description && description.length > 2) {
            finalName = description.split(',')[0].trim() || 'Mumbai Venue';
          } else {
            finalName = 'Mumbai Venue';
          }
          finalDescription = `Popular venue located at ${finalAddress}`;
        }

        // Final validation
        if (!finalName || finalName.length < 2 || !finalAddress || finalAddress.length < 5) {
          errors.push(`Row ${i + 2}: Unable to extract valid name and address`);
          continue;
        }

        // Generate coordinates for Mumbai area
        const coordinates = this.generateMumbaiCoordinates();
        
        // Determine category from name and description
        const category = this.determineCategory(finalName, finalDescription);
        
        // Create discount from happy hour data
        const discount = this.createDiscountFromHappyHour(
          happyHourStart,
          happyHourEnd,
          finalDescription,
          finalName
        );

        // Generate business ID from name
        const businessId = `verified_${finalName.toLowerCase().replace(/[^a-z0-9]/g, '_')}_${Date.now()}_${i}`;

        const business: Business = {
          id: businessId,
          name: finalName,
          description: finalDescription,
          image: picture || this.getDefaultImageForCategory(category),
          location: {
            latitude: coordinates.latitude,
            longitude: coordinates.longitude,
            address: finalAddress,
          },
          category,
          rating: 4.2 + Math.random() * 0.8, // 4.2 to 5.0 for verified places
          currentDiscount: discount,
          isActive: true,
          isVerified: true,
          verificationData: {
            source: 'spreadsheet',
            verifiedAt: new Date().toISOString(),
            verifiedBy: 'admin',
            originalData: {
              name,
              description,
              address,
              googleMarker,
              picture,
              logo,
              openHours,
              happyHourStart,
              happyHourEnd,
              telephone,
              remark,
              update,
            },
            googleMarker: googleMarker || undefined,
            logo: logo || undefined,
            telephone: telephone || undefined,
            website: googleMarker || undefined,
            remarks: remark || undefined,
            lastUpdate: update || undefined,
          },
        };

        businesses.push(business);
        console.log(`Successfully processed row ${i + 2}: ${finalName}`);
      } catch (error) {
        const errorMsg = `Row ${i + 2}: ${error instanceof Error ? error.message : 'Unknown error'}`;
        errors.push(errorMsg);
        console.error(errorMsg);
      }
    }

    // Save upload history
    await this.saveUploadHistory({
      timestamp: new Date().toISOString(),
      totalRows: dataRows.length,
      processedRows: businesses.length,
      errors: errors.length,
      businesses: businesses.map(b => ({ id: b.id, name: b.name })),
    });

    console.log(`Processing complete: ${businesses.length} businesses created, ${errors.length} errors`);

    return {
      businesses,
      errors,
      summary: {
        total: dataRows.length,
        processed: businesses.length,
        errors: errors.length,
      },
    };
  }

  private static generateMumbaiCoordinates(): { latitude: number; longitude: number } {
    // Mumbai bounds
    const mumbaiBounds = {
      north: 19.2700,
      south: 18.8900,
      east: 72.9800,
      west: 72.7700,
    };

    // Generate coordinates within Mumbai
    const latitude = mumbaiBounds.south + Math.random() * (mumbaiBounds.north - mumbaiBounds.south);
    const longitude = mumbaiBounds.west + Math.random() * (mumbaiBounds.east - mumbaiBounds.west);

    return { latitude, longitude };
  }

  private static determineCategory(name: string, description: string): string {
    const text = `${name} ${description}`.toLowerCase();
    
    if (text.includes('spa') || text.includes('massage') || text.includes('wellness')) {
      return 'Spa & Wellness';
    }
    if (text.includes('rooftop') || text.includes('bar') || text.includes('cocktail') || text.includes('lounge') || text.includes('pub')) {
      return 'Bar & Restaurant';
    }
    if (text.includes('cafe') || text.includes('coffee')) {
      return 'Cafe';
    }
    if (text.includes('restaurant') || text.includes('dining') || text.includes('kitchen') || text.includes('food')) {
      return 'Restaurant';
    }
    
    return 'Bar & Restaurant'; // Default for bars/restaurants
  }

  private static createDiscountFromHappyHour(
    startTime?: string,
    endTime?: string,
    description?: string,
    businessName?: string
  ) {
    // Parse time strings (e.g., "5:00 PM", "17:00", "12:00 PM")
    const parseTime = (timeStr: string): string => {
      if (!timeStr || timeStr.trim() === '') return '';
      
      // Handle formats like "5:00 PM", "12:00 PM", "17:00"
      const cleanTime = timeStr.trim().toLowerCase();
      
      if (cleanTime.includes('pm') || cleanTime.includes('am')) {
        // Convert 12-hour to 24-hour format
        const match = cleanTime.match(/(\d{1,2}):?(\d{0,2})\s*(am|pm)/);
        if (match) {
          const [, hoursStr, minutesStr = '00', period] = match;
          let hours = parseInt(hoursStr);
          const minutes = parseInt(minutesStr) || 0;
          
          if (period === 'pm' && hours !== 12) hours += 12;
          if (period === 'am' && hours === 12) hours = 0;
          
          return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
        }
      }
      
      // Handle 24-hour format or just numbers
      const match = cleanTime.match(/(\d{1,2}):?(\d{0,2})/);
      if (match) {
        const [, hoursStr, minutesStr = '00'] = match;
        const hours = parseInt(hoursStr);
        const minutes = parseInt(minutesStr) || 0;
        
        if (hours >= 0 && hours <= 23) {
          return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
        }
      }
      
      return '';
    };

    const validFrom = parseTime(startTime || '') || '17:00';
    const validTo = parseTime(endTime || '') || '20:00';

    // Determine discount based on business type and description
    let percentage = 25; // Default
    let title = 'Happy Hour Special';
    let discountDescription = 'Special pricing during happy hours';

    if (description) {
      const desc = description.toLowerCase();
      if (desc.includes('2+1') || desc.includes('buy 2 get 1')) {
        percentage = 33;
        title = 'Buy 2 Get 1 Free';
        discountDescription = 'Buy 2 drinks and get 1 free during happy hour';
      } else if (desc.includes('50%') || desc.includes('half price')) {
        percentage = 50;
        title = 'Half Price Happy Hour';
        discountDescription = '50% off selected drinks and food';
      } else if (desc.includes('30%')) {
        percentage = 30;
        title = '30% Off Happy Hour';
        discountDescription = '30% discount on selected items';
      }
    }

    // Adjust based on business name
    if (businessName) {
      const name = businessName.toLowerCase();
      if (name.includes('rooftop')) {
        title = 'Rooftop Happy Hour';
        discountDescription = 'Elevated drinks with stunning city views';
      } else if (name.includes('bar') || name.includes('pub')) {
        title = 'Bar Happy Hour';
        discountDescription = 'Discounted drinks and appetizers';
      } else if (name.includes('restaurant')) {
        title = 'Restaurant Happy Hour';
        discountDescription = 'Special prices on food and beverages';
      }
    }

    return {
      id: `discount_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      businessId: '',
      title,
      description: discountDescription,
      percentage,
      validFrom,
      validTo,
      isActive: true,
    };
  }

  private static getDefaultImageForCategory(category: string): string {
    // Using WebP format with optimized parameters for smaller file sizes
    const imageMap = {
      'Restaurant': 'https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg?auto=compress&cs=tinysrgb&w=600&h=400&fit=crop&fm=webp&q=80',
      'Bar & Restaurant': 'https://images.pexels.com/photos/1581384/pexels-photo-1581384.jpeg?auto=compress&cs=tinysrgb&w=600&h=400&fit=crop&fm=webp&q=80',
      'Cafe': 'https://images.pexels.com/photos/302899/pexels-photo-302899.jpeg?auto=compress&cs=tinysrgb&w=600&h=400&fit=crop&fm=webp&q=80',
      'Spa & Wellness': 'https://images.pexels.com/photos/3757942/pexels-photo-3757942.jpeg?auto=compress&cs=tinysrgb&w=600&h=400&fit=crop&fm=webp&q=80',
    };

    return imageMap[category as keyof typeof imageMap] || imageMap['Bar & Restaurant'];
  }

  private static async saveUploadHistory(historyEntry: {
    timestamp: string;
    totalRows: number;
    processedRows: number;
    errors: number;
    businesses: Array<{ id: string; name: string }>;
  }): Promise<void> {
    try {
      const storage = await this.getStorage();
      const existingHistory = await storage.getItem(this.UPLOAD_HISTORY_KEY);
      const history = existingHistory ? JSON.parse(existingHistory) : [];
      
      history.unshift(historyEntry); // Add to beginning
      
      // Keep only last 10 entries
      if (history.length > 10) {
        history.splice(10);
      }
      
      await storage.setItem(this.UPLOAD_HISTORY_KEY, JSON.stringify(history));
    } catch (error) {
      console.error('Error saving upload history:', error);
    }
  }

  static async getUploadHistory(): Promise<Array<{
    timestamp: string;
    totalRows: number;
    processedRows: number;
    errors: number;
    businesses: Array<{ id: string; name: string }>;
  }>> {
    try {
      const storage = await this.getStorage();
      const history = await storage.getItem(this.UPLOAD_HISTORY_KEY);
      return history ? JSON.parse(history) : [];
    } catch (error) {
      console.error('Error getting upload history:', error);
      return [];
    }
  }

  static async addVerifiedBusiness(business: Business): Promise<void> {
    try {
      const businesses = await this.getVerifiedBusinesses();
      const existingIndex = businesses.findIndex(b => b.id === business.id);
      
      if (existingIndex >= 0) {
        businesses[existingIndex] = business;
      } else {
        businesses.push(business);
      }
      
      await this.saveVerifiedBusinesses(businesses);
    } catch (error) {
      console.error('Error adding verified business:', error);
    }
  }

  static async removeVerifiedBusiness(businessId: string): Promise<void> {
    try {
      const businesses = await this.getVerifiedBusinesses();
      const filteredBusinesses = businesses.filter(b => b.id !== businessId);
      await this.saveVerifiedBusinesses(filteredBusinesses);
    } catch (error) {
      console.error('Error removing verified business:', error);
    }
  }

  static async clearAllData(): Promise<void> {
    try {
      const storage = await this.getStorage();
      await storage.removeItem(this.VERIFIED_BUSINESSES_KEY);
      await storage.removeItem(this.UPLOAD_HISTORY_KEY);
    } catch (error) {
      console.error('Error clearing verified business data:', error);
    }
  }
}