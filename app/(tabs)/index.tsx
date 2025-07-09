import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  ScrollView,
  Image,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  SafeAreaView,
  ActivityIndicator,
  Platform,
  RefreshControl,
} from 'react-native';
import { Search, MapPin, Clock, Star, Navigation } from 'lucide-react-native';
import { colors, typography, spacing, borderRadius, shadows } from '@/constants/theme';
import { mockBusinesses, categories } from '@/lib/data';
import { useGooglePlaces } from '@/hooks/useGooglePlaces';
import { useLocation } from '@/hooks/useLocation';
import { PlacesService } from '@/lib/placesService';
import { Business } from '@/types';
import { router } from 'expo-router';

export default function DiscoverScreen() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [realPlaces, setRealPlaces] = useState<Business[]>([]);
  const [loadingPlaces, setLoadingPlaces] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const scrollViewRef = useRef<ScrollView>(null);
  
  const { places, loading, error, searchPlaces, getPlacesByCategory } = useGooglePlaces();
  const { location, loading: locationLoading, error: locationError, getCurrentLocation } = useLocation();

  // Load places when location is available
  useEffect(() => {
    if (location) {
      loadNearbyPlaces();
    }
  }, [location, selectedCategory]);

  const loadNearbyPlaces = async () => {
    if (!location) return;

    setLoadingPlaces(true);
    try {
      const places = await PlacesService.searchNearbyPlaces({
        latitude: location.latitude,
        longitude: location.longitude,
        radius: 5000, // 5km radius
        category: selectedCategory !== 'All' ? selectedCategory : undefined,
      });
      setRealPlaces(places);
    } catch (error) {
      console.error('Error loading places:', error);
      // Fallback to mock data if API fails
      setRealPlaces(mockBusinesses.filter(business => 
        business.currentDiscount?.isActive === true && business.isActive
      ));
    } finally {
      setLoadingPlaces(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    if (location) {
      await loadNearbyPlaces();
    } else {
      await getCurrentLocation();
    }
    setRefreshing(false);
  };

  // CRITICAL: Filter to show ONLY businesses with ACTIVE discounts
  const filteredBusinesses = realPlaces.filter(business => {
    const matchesSearch = business.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         business.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || business.category === selectedCategory;
    
    // ONLY show businesses that have active discounts AND are active
    const hasActiveDiscount = business.currentDiscount?.isActive === true;
    
    return matchesSearch && matchesCategory && business.isActive && hasActiveDiscount;
  });

  const handleCategoryChange = async (category: string) => {
    setSelectedCategory(category);
    
    if (location) {
      await loadNearbyPlaces();
    }
  };

  const handleSearch = async (query: string) => {
    setSearchQuery(query);
    
    if (location && query.length > 2) {
      setLoadingPlaces(true);
      try {
        const places = await PlacesService.searchNearbyPlaces({
          latitude: location.latitude,
          longitude: location.longitude,
          radius: 5000,
          category: selectedCategory !== 'All' ? selectedCategory : undefined,
          query,
        });
        setRealPlaces(places);
      } catch (error) {
        console.error('Error searching places:', error);
      } finally {
        setLoadingPlaces(false);
      }
    }
  };

  const handleBusinessPress = (business: Business) => {
    // Navigate to business details screen
    router.push({
      pathname: '/business/[id]',
      params: { 
        id: business.id,
        name: business.name,
        description: business.description,
        image: business.image,
        address: business.location.address,
        rating: business.rating.toString(),
        category: business.category,
        discountTitle: business.currentDiscount?.title || '',
        discountPercentage: business.currentDiscount?.percentage?.toString() || '',
        discountDescription: business.currentDiscount?.description || '',
        validFrom: business.currentDiscount?.validFrom || '',
        validTo: business.currentDiscount?.validTo || '',
        isDiscountActive: business.currentDiscount?.isActive?.toString() || 'false'
      }
    });
  };

  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    const R = 6371; // Earth's radius in kilometers
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  };

  const renderBusinessCard = (business: Business) => {
    const distance = location ? calculateDistance(
      location.latitude,
      location.longitude,
      business.location.latitude,
      business.location.longitude
    ) : null;

    return (
      <TouchableOpacity 
        key={business.id} 
        style={styles.businessCard}
        onPress={() => handleBusinessPress(business)}
        activeOpacity={0.7}
      >
        <Image source={{ uri: business.image }} style={styles.businessImage} />
        <View style={styles.businessInfo}>
          <View style={styles.businessHeader}>
            <Text style={styles.businessName}>{business.name}</Text>
            <View style={styles.ratingContainer}>
              <Star size={16} color={colors.warning[500]} fill={colors.warning[500]} />
              <Text style={styles.rating}>{business.rating.toFixed(1)}</Text>
            </View>
          </View>
          <Text style={styles.businessDescription}>{business.description}</Text>
          <View style={styles.locationContainer}>
            <MapPin size={14} color={colors.secondary[500]} />
            <Text style={styles.locationText}>{business.location.address}</Text>
            {distance && (
              <Text style={styles.distanceText}>• {distance.toFixed(1)}km</Text>
            )}
          </View>
          {/* Always show discount since we only display businesses with active discounts */}
          {business.currentDiscount && (
            <View style={styles.discountContainer}>
              <View style={styles.discountBadge}>
                <Text style={styles.discountPercentage}>{business.currentDiscount.percentage}% OFF</Text>
              </View>
              <View style={styles.discountInfo}>
                <Text style={styles.discountTitle}>{business.currentDiscount.title}</Text>
                <View style={styles.timeContainer}>
                  <Clock size={12} color={colors.secondary[500]} />
                  <Text style={styles.timeText}>
                    {business.currentDiscount.validFrom} - {business.currentDiscount.validTo}
                  </Text>
                </View>
              </View>
            </View>
          )}
        </View>
      </TouchableOpacity>
    );
  };

  // Get location display name
  const getLocationDisplayName = () => {
    if (!location) return 'your area';
    
    // Extract city from location if available
    if (location.city) {
      return location.city;
    }
    
    // Fallback to coordinates-based city detection
    const lat = location.latitude;
    const lng = location.longitude;
    
    // Major city coordinate ranges (approximate)
    if (lat >= 40.4774 && lat <= 40.9176 && lng >= -74.2591 && lng <= -73.7004) return 'New York';
    if (lat >= 33.7037 && lat <= 34.3373 && lng >= -118.6681 && lng <= -118.1553) return 'Los Angeles';
    if (lat >= 51.2868 && lat <= 51.6918 && lng >= -0.5103 && lng <= 0.3340) return 'London';
    if (lat >= 48.8155 && lat <= 48.9021 && lng >= 2.2241 && lng <= 2.4699) return 'Paris';
    if (lat >= 35.5322 && lat <= 35.8986 && lng >= 139.3431 && lng <= 139.9194) return 'Tokyo';
    if (lat >= -34.1692 && lat <= -33.5781 && lng >= 150.5023 && lng <= 151.3430) return 'Sydney';
    if (lat >= 13.4980 && lat <= 14.0990 && lng >= 100.3273 && lng <= 100.9319) return 'Bangkok';
    if (lat >= 12.8000 && lat <= 13.0000 && lng >= 100.8000 && lng <= 101.0000) return 'Pattaya';
    
    return 'your area';
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <View style={styles.headerContent}>
            <Text style={styles.headerTitle}>Happy Hours</Text>
            <Text style={styles.headerSubtitle}>
              {location 
                ? `Active deals in ${getLocationDisplayName()}`
                : 'Find deals near you'
              }
            </Text>
          </View>
          <TouchableOpacity 
            style={styles.locationButton}
            onPress={getCurrentLocation}
            disabled={locationLoading}
          >
            {locationLoading ? (
              <ActivityIndicator size="small" color={colors.primary[500]} />
            ) : (
              <Navigation size={16} color={colors.primary[500]} />
            )}
          </TouchableOpacity>
        </View>
        
        {(error || locationError) && (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>
              {locationError || error} - Showing available deals
            </Text>
          </View>
        )}
      </View>

      <View style={styles.searchContainer}>
        <View style={styles.searchInputContainer}>
          <Search size={20} color={colors.secondary[400]} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search venues with deals..."
            value={searchQuery}
            onChangeText={handleSearch}
            placeholderTextColor={colors.secondary[400]}
          />
        </View>
      </View>

      {/* Categories Section */}
      <View style={styles.categoriesContainer}>
        <ScrollView 
          ref={scrollViewRef}
          horizontal 
          showsHorizontalScrollIndicator={false}
          style={styles.categoriesScrollView}
          contentContainerStyle={styles.categoriesContent}
          decelerationRate="fast"
          snapToInterval={120}
          snapToAlignment="start"
        >
          {categories.map((category, index) => (
            <TouchableOpacity
              key={`category-${index}`}
              style={[
                styles.categoryChip,
                selectedCategory === category && styles.categoryChipActive,
              ]}
              onPress={() => handleCategoryChange(category)}
            >
              <Text style={[
                styles.categoryText,
                selectedCategory === category && styles.categoryTextActive
              ]}>
                {category}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      <ScrollView 
        style={styles.businessList} 
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[colors.primary[500]]}
            tintColor={colors.primary[500]}
          />
        }
      >
        {(loadingPlaces || locationLoading) && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={colors.primary[500]} />
            <Text style={styles.loadingText}>
              {locationLoading ? 'Getting your location...' : 'Finding happy hours near you...'}
            </Text>
          </View>
        )}
        
        {!location && !locationLoading && (
          <View style={styles.emptyContainer}>
            <Navigation size={48} color={colors.secondary[400]} />
            <Text style={styles.emptyText}>Location needed</Text>
            <Text style={styles.emptySubtext}>
              We need your location to find happy hours near you
            </Text>
            <TouchableOpacity style={styles.locationPermissionButton} onPress={getCurrentLocation}>
              <Text style={styles.locationPermissionButtonText}>Enable Location</Text>
            </TouchableOpacity>
          </View>
        )}
        
        {filteredBusinesses.length === 0 && !loadingPlaces && !locationLoading && location ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No active deals found</Text>
            <Text style={styles.emptySubtext}>
              Try adjusting your search or category filter, or check back later for new deals in {getLocationDisplayName()}.
            </Text>
          </View>
        ) : (
          filteredBusinesses.map(renderBusinessCard)
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.white,
  },
  header: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    paddingBottom: spacing.md,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.sm,
  },
  headerContent: {
    flex: 1,
  },
  headerTitle: {
    fontSize: typography.fontSize['3xl'],
    fontFamily: typography.fontFamily.heading,
    color: colors.secondary[900],
    marginBottom: spacing.xs,
  },
  headerSubtitle: {
    fontSize: typography.fontSize.base,
    fontFamily: typography.fontFamily.regular,
    color: colors.secondary[600],
  },
  locationButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.primary[50],
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.primary[200],
  },
  errorContainer: {
    backgroundColor: colors.error[50],
    padding: spacing.sm,
    borderRadius: borderRadius.md,
    borderLeftWidth: 4,
    borderLeftColor: colors.error[500],
  },
  errorText: {
    fontSize: typography.fontSize.sm,
    fontFamily: typography.fontFamily.medium,
    color: colors.error[600],
  },
  searchContainer: {
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.md,
  },
  searchInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.secondary[50],
    borderRadius: borderRadius.lg,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  searchInput: {
    flex: 1,
    marginLeft: spacing.sm,
    fontSize: typography.fontSize.base,
    fontFamily: typography.fontFamily.regular,
    color: colors.secondary[900],
  },
  categoriesContainer: {
    marginBottom: spacing.lg,
    height: 50,
  },
  categoriesScrollView: {
    flex: 1,
  },
  categoriesContent: {
    paddingHorizontal: spacing.lg,
    alignItems: 'center',
    gap: spacing.sm,
  },
  categoryChip: {
    backgroundColor: colors.secondary[100],
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.full,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 100,
    height: 36,
  },
  categoryChipActive: {
    backgroundColor: colors.primary[500],
  },
  categoryText: {
    fontSize: typography.fontSize.sm,
    fontFamily: typography.fontFamily.medium,
    color: colors.secondary[700],
    textAlign: 'center',
  },
  categoryTextActive: {
    color: colors.white,
  },
  businessList: {
    flex: 1,
    paddingHorizontal: spacing.lg,
  },
  loadingContainer: {
    alignItems: 'center',
    paddingVertical: spacing.xl,
  },
  loadingText: {
    fontSize: typography.fontSize.base,
    fontFamily: typography.fontFamily.medium,
    color: colors.secondary[600],
    marginTop: spacing.md,
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: spacing.xl,
    paddingHorizontal: spacing.lg,
  },
  emptyText: {
    fontSize: typography.fontSize.lg,
    fontFamily: typography.fontFamily.semibold,
    color: colors.secondary[700],
    marginBottom: spacing.xs,
    marginTop: spacing.md,
  },
  emptySubtext: {
    fontSize: typography.fontSize.base,
    fontFamily: typography.fontFamily.regular,
    color: colors.secondary[500],
    textAlign: 'center',
    marginBottom: spacing.lg,
  },
  locationPermissionButton: {
    backgroundColor: colors.primary[500],
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.lg,
  },
  locationPermissionButtonText: {
    fontSize: typography.fontSize.base,
    fontFamily: typography.fontFamily.semibold,
    color: colors.white,
  },
  businessCard: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.xl,
    marginBottom: spacing.lg,
    ...shadows.md,
  },
  businessImage: {
    width: '100%',
    height: 200,
    borderTopLeftRadius: borderRadius.xl,
    borderTopRightRadius: borderRadius.xl,
  },
  businessInfo: {
    padding: spacing.md,
  },
  businessHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.sm,
  },
  businessName: {
    flex: 1,
    fontSize: typography.fontSize.lg,
    fontFamily: typography.fontFamily.bold,
    color: colors.secondary[900],
    marginRight: spacing.sm,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  rating: {
    marginLeft: spacing.xs,
    fontSize: typography.fontSize.sm,
    fontFamily: typography.fontFamily.medium,
    color: colors.secondary[700],
  },
  businessDescription: {
    fontSize: typography.fontSize.sm,
    fontFamily: typography.fontFamily.regular,
    color: colors.secondary[600],
    marginBottom: spacing.sm,
    lineHeight: typography.fontSize.sm * 1.4,
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  locationText: {
    marginLeft: spacing.xs,
    fontSize: typography.fontSize.sm,
    fontFamily: typography.fontFamily.regular,
    color: colors.secondary[500],
    flex: 1,
  },
  distanceText: {
    fontSize: typography.fontSize.sm,
    fontFamily: typography.fontFamily.medium,
    color: colors.primary[500],
    marginLeft: spacing.xs,
  },
  discountContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primary[50],
    borderRadius: borderRadius.lg,
    padding: spacing.sm,
  },
  discountBadge: {
    backgroundColor: colors.primary[500],
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.md,
    marginRight: spacing.sm,
  },
  discountPercentage: {
    fontSize: typography.fontSize.xs,
    fontFamily: typography.fontFamily.bold,
    color: colors.white,
  },
  discountInfo: {
    flex: 1,
  },
  discountTitle: {
    fontSize: typography.fontSize.sm,
    fontFamily: typography.fontFamily.semibold,
    color: colors.primary[700],
    marginBottom: spacing.xs,
  },
  timeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  timeText: {
    marginLeft: spacing.xs,
    fontSize: typography.fontSize.xs,
    fontFamily: typography.fontFamily.regular,
    color: colors.secondary[500],
  },
});