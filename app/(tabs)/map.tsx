import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  Alert,
  Platform,
  ScrollView,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { MapPin, Navigation, Star, Clock } from 'lucide-react-native';
import { colors, typography, spacing, borderRadius, shadows } from '@/constants/theme';
import { mockBusinesses } from '@/lib/data';
import { useLocation } from '@/hooks/useLocation';
import { PlacesService } from '@/lib/placesService';
import { Business } from '@/types';
import { router } from 'expo-router';

export default function MapScreen() {
  const [selectedBusiness, setSelectedBusiness] = useState<any>(null);
  const [nearbyPlaces, setNearbyPlaces] = useState<Business[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  
  const { location, loading: locationLoading, getCurrentLocation } = useLocation();

  useEffect(() => {
    if (location) {
      loadNearbyPlaces();
    }
  }, [location]);

  const loadNearbyPlaces = async () => {
    if (!location) return;

    setLoading(true);
    try {
      const places = await PlacesService.searchNearbyPlaces({
        latitude: location.latitude,
        longitude: location.longitude,
        radius: 10000, // 10km radius for map view
      });
      setNearbyPlaces(places);
    } catch (error) {
      console.error('Error loading places:', error);
      // Fallback to mock data if API fails
      setNearbyPlaces(mockBusinesses.filter(business => 
        business.currentDiscount?.isActive === true && business.isActive
      ));
    } finally {
      setLoading(false);
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

  // CRITICAL: Filter to show ONLY businesses with ACTIVE discounts
  const businessesWithActiveDiscounts = nearbyPlaces.filter(business => 
    business.currentDiscount?.isActive === true && business.isActive
  );

  const businessesWithDistance = location 
    ? businessesWithActiveDiscounts.map(business => ({
        ...business,
        distance: calculateDistance(
          location.latitude,
          location.longitude,
          business.location.latitude,
          business.location.longitude
        )
      })).sort((a, b) => a.distance - b.distance)
    : businessesWithActiveDiscounts;

  const handleBusinessPress = (business: Business) => {
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
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>Happy Hour Map</Text>
          <Text style={styles.headerSubtitle}>
            {location 
              ? `${businessesWithDistance.length} active deals in ${getLocationDisplayName()}`
              : 'Active deals nearby'
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
            <Navigation size={20} color={colors.primary[500]} />
          )}
        </TouchableOpacity>
      </View>

      <View style={styles.mapPlaceholder}>
        <MapPin size={48} color={colors.primary[500]} />
        <Text style={styles.mapPlaceholderText}>Interactive Map View</Text>
        <Text style={styles.mapPlaceholderSubtext}>
          {location 
            ? `Your location: ${getLocationDisplayName()}`
            : locationLoading 
              ? 'Getting your location...'
              : 'Location not available'
          }
        </Text>
        {location && (
          <Text style={styles.coordinatesText}>
            {location.latitude.toFixed(4)}, {location.longitude.toFixed(4)}
          </Text>
        )}
      </View>

      <View style={styles.businessList}>
        <Text style={styles.listTitle}>
          Active Happy Hours {location && `(${businessesWithDistance.length})`}
        </Text>
        
        <ScrollView 
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
          {loading && (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={colors.primary[500]} />
              <Text style={styles.loadingText}>Loading active deals...</Text>
            </View>
          )}

          {!location && !locationLoading && (
            <View style={styles.emptyContainer}>
              <Navigation size={32} color={colors.secondary[400]} />
              <Text style={styles.emptyText}>Location needed</Text>
              <Text style={styles.emptySubtext}>
                Enable location to see happy hours near you
              </Text>
              <TouchableOpacity style={styles.enableLocationButton} onPress={getCurrentLocation}>
                <Text style={styles.enableLocationButtonText}>Enable Location</Text>
              </TouchableOpacity>
            </View>
          )}

          {businessesWithDistance.length === 0 && !loading && location && (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>No active deals found</Text>
              <Text style={styles.emptySubtext}>
                Check back later for new happy hour deals in {getLocationDisplayName()}
              </Text>
            </View>
          )}

          {businessesWithDistance.map((business) => (
            <TouchableOpacity
              key={business.id}
              style={[
                styles.businessItem,
                selectedBusiness?.id === business.id && styles.businessItemSelected
              ]}
              onPress={() => {
                setSelectedBusiness(business);
                handleBusinessPress(business);
              }}
            >
              <View style={styles.businessInfo}>
                <Text style={styles.businessName}>{business.name}</Text>
                <Text style={styles.businessCategory}>{business.category}</Text>
                <View style={styles.businessMeta}>
                  <View style={styles.ratingContainer}>
                    <Star size={14} color={colors.warning[500]} fill={colors.warning[500]} />
                    <Text style={styles.rating}>{business.rating.toFixed(1)}</Text>
                  </View>
                  {location && (
                    <Text style={styles.distance}>
                      {business.distance.toFixed(1)} km away
                    </Text>
                  )}
                </View>
                {/* Always show discount since we only display businesses with active discounts */}
                {business.currentDiscount && (
                  <View style={styles.discountContainer}>
                    <View style={styles.discountBadge}>
                      <Text style={styles.discountText}>
                        {business.currentDiscount.percentage}% OFF
                      </Text>
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
              <MapPin size={24} color={colors.primary[500]} />
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.white,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    paddingBottom: spacing.md,
  },
  headerContent: {
    flex: 1,
  },
  headerTitle: {
    fontSize: typography.fontSize['3xl'],
    fontFamily: typography.fontFamily.heading,
    color: colors.secondary[900],
  },
  headerSubtitle: {
    fontSize: typography.fontSize.base,
    fontFamily: typography.fontFamily.regular,
    color: colors.secondary[600],
    marginTop: spacing.xs,
  },
  locationButton: {
    padding: spacing.sm,
    backgroundColor: colors.primary[50],
    borderRadius: borderRadius.full,
    borderWidth: 1,
    borderColor: colors.primary[200],
  },
  mapPlaceholder: {
    height: 250,
    backgroundColor: colors.secondary[50],
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: spacing.lg,
    borderRadius: borderRadius.xl,
    marginBottom: spacing.lg,
    borderWidth: 2,
    borderColor: colors.secondary[200],
    borderStyle: 'dashed',
  },
  mapPlaceholderText: {
    fontSize: typography.fontSize.lg,
    fontFamily: typography.fontFamily.semibold,
    color: colors.secondary[700],
    marginTop: spacing.sm,
  },
  mapPlaceholderSubtext: {
    fontSize: typography.fontSize.sm,
    fontFamily: typography.fontFamily.regular,
    color: colors.secondary[500],
    marginTop: spacing.xs,
    textAlign: 'center',
  },
  coordinatesText: {
    fontSize: typography.fontSize.xs,
    fontFamily: typography.fontFamily.regular,
    color: colors.secondary[400],
    marginTop: spacing.xs,
  },
  businessList: {
    flex: 1,
    paddingHorizontal: spacing.lg,
  },
  listTitle: {
    fontSize: typography.fontSize.xl,
    fontFamily: typography.fontFamily.bold,
    color: colors.secondary[900],
    marginBottom: spacing.md,
  },
  loadingContainer: {
    alignItems: 'center',
    paddingVertical: spacing.lg,
  },
  loadingText: {
    fontSize: typography.fontSize.base,
    fontFamily: typography.fontFamily.medium,
    color: colors.secondary[600],
    marginTop: spacing.sm,
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: spacing.xl,
  },
  emptyText: {
    fontSize: typography.fontSize.lg,
    fontFamily: typography.fontFamily.semibold,
    color: colors.secondary[700],
    marginTop: spacing.sm,
    marginBottom: spacing.xs,
  },
  emptySubtext: {
    fontSize: typography.fontSize.base,
    fontFamily: typography.fontFamily.regular,
    color: colors.secondary[500],
    textAlign: 'center',
    marginBottom: spacing.lg,
  },
  enableLocationButton: {
    backgroundColor: colors.primary[500],
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.lg,
  },
  enableLocationButtonText: {
    fontSize: typography.fontSize.base,
    fontFamily: typography.fontFamily.semibold,
    color: colors.white,
  },
  businessItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    padding: spacing.md,
    borderRadius: borderRadius.lg,
    marginBottom: spacing.sm,
    ...shadows.sm,
  },
  businessItemSelected: {
    backgroundColor: colors.primary[50],
    borderWidth: 2,
    borderColor: colors.primary[200],
  },
  businessInfo: {
    flex: 1,
    marginRight: spacing.md,
  },
  businessName: {
    fontSize: typography.fontSize.base,
    fontFamily: typography.fontFamily.semibold,
    color: colors.secondary[900],
    marginBottom: spacing.xs,
  },
  businessCategory: {
    fontSize: typography.fontSize.sm,
    fontFamily: typography.fontFamily.regular,
    color: colors.secondary[600],
    marginBottom: spacing.xs,
  },
  businessMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.xs,
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
  distance: {
    fontSize: typography.fontSize.sm,
    fontFamily: typography.fontFamily.medium,
    color: colors.primary[500],
  },
  discountContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing.xs,
  },
  discountBadge: {
    backgroundColor: colors.primary[500],
    paddingHorizontal: spacing.xs,
    paddingVertical: 2,
    borderRadius: borderRadius.sm,
    marginRight: spacing.xs,
  },
  discountText: {
    fontSize: typography.fontSize.xs,
    fontFamily: typography.fontFamily.bold,
    color: colors.white,
  },
  discountInfo: {
    flex: 1,
  },
  discountTitle: {
    fontSize: typography.fontSize.xs,
    fontFamily: typography.fontFamily.semibold,
    color: colors.primary[700],
    marginBottom: 2,
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