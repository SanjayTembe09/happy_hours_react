import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  Alert,
  Platform,
  Image,
} from 'react-native';
import { Camera, Image as ImageIcon, Zap, CircleCheck as CheckCircle } from 'lucide-react-native';
import { colors, typography, spacing, borderRadius, shadows } from '@/constants/theme';
import { CameraView, CameraType, useCameraPermissions } from 'expo-camera';
import * as ImagePicker from 'expo-image-picker';

export default function ScannerScreen() {
  const [facing, setFacing] = useState<CameraType>('back');
  const [permission, requestPermission] = useCameraPermissions();
  const [showCamera, setShowCamera] = useState(false);
  const [scannedImage, setScannedImage] = useState<string | null>(null);
  const [scanResult, setScanResult] = useState<any>(null);
  const [isScanning, setIsScanning] = useState(false);

  const simulateScan = async (imageUri: string) => {
    setIsScanning(true);
    setScannedImage(imageUri);
    
    // Simulate AI processing delay
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Mock scan result
    const mockResult = {
      items: [
        { name: 'Pad Thai', price: 180, discount: 25 },
        { name: 'Tom Yum Soup', price: 120, discount: 30 },
        { name: 'Green Curry', price: 200, discount: 20 },
        { name: 'Mango Sticky Rice', price: 80, discount: 15 },
      ],
      restaurant: 'Thai Fusion Kitchen',
      totalSavings: 145,
    };
    
    setScanResult(mockResult);
    setIsScanning(false);
  };

  const takePicture = async () => {
    if (Platform.OS === 'web') {
      Alert.alert('Camera not available', 'Camera functionality is not available on web. Please use the gallery option.');
      return;
    }

    // For demo purposes, simulate taking a picture
    const mockImageUri = 'https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg';
    setShowCamera(false);
    simulateScan(mockImageUri);
  };

  const pickImage = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 1,
      });

      if (!result.canceled && result.assets[0]) {
        simulateScan(result.assets[0].uri);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to pick image from gallery');
    }
  };

  const resetScanner = () => {
    setScannedImage(null);
    setScanResult(null);
    setIsScanning(false);
    setShowCamera(false);
  };

  if (showCamera) {
    if (!permission) {
      return <View style={styles.container} />;
    }

    if (!permission.granted) {
      return (
        <SafeAreaView style={styles.container}>
          <View style={styles.permissionContainer}>
            <Camera size={64} color={colors.secondary[400]} />
            <Text style={styles.permissionTitle}>Camera Permission Required</Text>
            <Text style={styles.permissionText}>
              We need access to your camera to scan menus and find discounts
            </Text>
            <TouchableOpacity style={styles.permissionButton} onPress={requestPermission}>
              <Text style={styles.permissionButtonText}>Grant Permission</Text>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      );
    }

    return (
      <View style={styles.container}>
        <CameraView style={styles.camera} facing={facing}>
          <View style={styles.cameraOverlay}>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setShowCamera(false)}
            >
              <Text style={styles.closeButtonText}>✕</Text>
            </TouchableOpacity>
            
            <View style={styles.scanFrame} />
            
            <View style={styles.cameraControls}>
              <TouchableOpacity style={styles.captureButton} onPress={takePicture}>
                <View style={styles.captureButtonInner} />
              </TouchableOpacity>
            </View>
          </View>
        </CameraView>
      </View>
    );
  }

  if (scanResult) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Scan Results</Text>
          <TouchableOpacity onPress={resetScanner}>
            <Text style={styles.resetText}>Scan Again</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.resultContainer}>
          <View style={styles.successHeader}>
            <CheckCircle size={32} color={colors.success[500]} />
            <Text style={styles.successTitle}>Menu Scanned Successfully!</Text>
            <Text style={styles.restaurantName}>{scanResult.restaurant}</Text>
          </View>

          {scannedImage && (
            <Image source={{ uri: scannedImage }} style={styles.scannedImage} />
          )}

          <View style={styles.savingsCard}>
            <Text style={styles.savingsTitle}>Total Potential Savings</Text>
            <Text style={styles.savingsAmount}>฿{scanResult.totalSavings}</Text>
          </View>

          <View style={styles.itemsList}>
            <Text style={styles.itemsTitle}>Discounted Items Found</Text>
            {scanResult.items.map((item: any, index: number) => (
              <View key={index} style={styles.itemCard}>
                <View style={styles.itemInfo}>
                  <Text style={styles.itemName}>{item.name}</Text>
                  <Text style={styles.itemPrice}>฿{item.price}</Text>
                </View>
                <View style={styles.discountBadge}>
                  <Text style={styles.discountText}>{item.discount}% OFF</Text>
                </View>
              </View>
            ))}
          </View>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Menu Scanner</Text>
        <Text style={styles.headerSubtitle}>Scan menus to find hidden discounts</Text>
      </View>

      {isScanning ? (
        <View style={styles.scanningContainer}>
          <Zap size={64} color={colors.primary[500]} />
          <Text style={styles.scanningTitle}>Analyzing Menu...</Text>
          <Text style={styles.scanningText}>Our AI is finding the best discounts for you</Text>
          {scannedImage && (
            <Image source={{ uri: scannedImage }} style={styles.processingImage} />
          )}
        </View>
      ) : (
        <View style={styles.scannerOptions}>
          <TouchableOpacity
            style={styles.scanOption}
            onPress={() => setShowCamera(true)}
          >
            <Camera size={48} color={colors.primary[500]} />
            <Text style={styles.scanOptionTitle}>Take Photo</Text>
            <Text style={styles.scanOptionText}>
              Point your camera at a menu to scan for discounts
            </Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.scanOption} onPress={pickImage}>
            <ImageIcon size={48} color={colors.primary[500]} />
            <Text style={styles.scanOptionTitle}>Choose from Gallery</Text>
            <Text style={styles.scanOptionText}>
              Select a menu photo from your device
            </Text>
          </TouchableOpacity>
        </View>
      )}

      <View style={styles.infoSection}>
        <Text style={styles.infoTitle}>How it works</Text>
        <View style={styles.infoSteps}>
          <View style={styles.infoStep}>
            <Text style={styles.stepNumber}>1</Text>
            <Text style={styles.stepText}>Scan or upload a menu photo</Text>
          </View>
          <View style={styles.infoStep}>
            <Text style={styles.stepNumber}>2</Text>
            <Text style={styles.stepText}>AI analyzes items and prices</Text>
          </View>
          <View style={styles.infoStep}>
            <Text style={styles.stepNumber}>3</Text>
            <Text style={styles.stepText}>Get personalized discount recommendations</Text>
          </View>
        </View>
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
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    paddingBottom: spacing.md,
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
  resetText: {
    fontSize: typography.fontSize.base,
    fontFamily: typography.fontFamily.medium,
    color: colors.primary[500],
  },
  scannerOptions: {
    flex: 1,
    paddingHorizontal: spacing.lg,
    justifyContent: 'center',
  },
  scanOption: {
    backgroundColor: colors.white,
    padding: spacing.xl,
    borderRadius: borderRadius.xl,
    alignItems: 'center',
    marginBottom: spacing.lg,
    ...shadows.md,
  },
  scanOptionTitle: {
    fontSize: typography.fontSize.xl,
    fontFamily: typography.fontFamily.bold,
    color: colors.secondary[900],
    marginTop: spacing.md,
    marginBottom: spacing.sm,
  },
  scanOptionText: {
    fontSize: typography.fontSize.base,
    fontFamily: typography.fontFamily.regular,
    color: colors.secondary[600],
    textAlign: 'center',
    lineHeight: typography.fontSize.base * 1.4,
  },
  camera: {
    flex: 1,
  },
  cameraOverlay: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  closeButton: {
    position: 'absolute',
    top: 50,
    right: 20,
    backgroundColor: 'rgba(0,0,0,0.5)',
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1,
  },
  closeButtonText: {
    color: colors.white,
    fontSize: 20,
    fontFamily: typography.fontFamily.bold,
  },
  scanFrame: {
    position: 'absolute',
    top: '30%',
    left: '10%',
    right: '10%',
    height: 200,
    borderWidth: 2,
    borderColor: colors.primary[500],
    borderRadius: borderRadius.lg,
    backgroundColor: 'transparent',
  },
  cameraControls: {
    position: 'absolute',
    bottom: 50,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  captureButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.white,
    justifyContent: 'center',
    alignItems: 'center',
  },
  captureButtonInner: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: colors.primary[500],
  },
  permissionContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
  },
  permissionTitle: {
    fontSize: typography.fontSize.xl,
    fontFamily: typography.fontFamily.bold,
    color: colors.secondary[900],
    marginTop: spacing.lg,
    marginBottom: spacing.sm,
    textAlign: 'center',
  },
  permissionText: {
    fontSize: typography.fontSize.base,
    fontFamily: typography.fontFamily.regular,
    color: colors.secondary[600],
    textAlign: 'center',
    lineHeight: typography.fontSize.base * 1.4,
    marginBottom: spacing.xl,
  },
  permissionButton: {
    backgroundColor: colors.primary[500],
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.lg,
  },
  permissionButtonText: {
    fontSize: typography.fontSize.base,
    fontFamily: typography.fontFamily.semibold,
    color: colors.white,
  },
  scanningContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
  },
  scanningTitle: {
    fontSize: typography.fontSize.xl,
    fontFamily: typography.fontFamily.bold,
    color: colors.secondary[900],
    marginTop: spacing.lg,
    marginBottom: spacing.sm,
  },
  scanningText: {
    fontSize: typography.fontSize.base,
    fontFamily: typography.fontFamily.regular,
    color: colors.secondary[600],
    textAlign: 'center',
    marginBottom: spacing.lg,
  },
  processingImage: {
    width: 200,
    height: 150,
    borderRadius: borderRadius.lg,
  },
  resultContainer: {
    flex: 1,
    paddingHorizontal: spacing.lg,
  },
  successHeader: {
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  successTitle: {
    fontSize: typography.fontSize.xl,
    fontFamily: typography.fontFamily.bold,
    color: colors.success[600],
    marginTop: spacing.sm,
    marginBottom: spacing.xs,
  },
  restaurantName: {
    fontSize: typography.fontSize.base,
    fontFamily: typography.fontFamily.medium,
    color: colors.secondary[700],
  },
  scannedImage: {
    width: '100%',
    height: 150,
    borderRadius: borderRadius.lg,
    marginBottom: spacing.lg,
  },
  savingsCard: {
    backgroundColor: colors.success[50],
    padding: spacing.lg,
    borderRadius: borderRadius.xl,
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  savingsTitle: {
    fontSize: typography.fontSize.base,
    fontFamily: typography.fontFamily.medium,
    color: colors.success[700],
    marginBottom: spacing.xs,
  },
  savingsAmount: {
    fontSize: typography.fontSize['3xl'],
    fontFamily: typography.fontFamily.bold,
    color: colors.success[600],
  },
  itemsList: {
    flex: 1,
  },
  itemsTitle: {
    fontSize: typography.fontSize.lg,
    fontFamily: typography.fontFamily.bold,
    color: colors.secondary[900],
    marginBottom: spacing.md,
  },
  itemCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: colors.white,
    padding: spacing.md,
    borderRadius: borderRadius.lg,
    marginBottom: spacing.sm,
    ...shadows.sm,
  },
  itemInfo: {
    flex: 1,
  },
  itemName: {
    fontSize: typography.fontSize.base,
    fontFamily: typography.fontFamily.semibold,
    color: colors.secondary[900],
    marginBottom: spacing.xs,
  },
  itemPrice: {
    fontSize: typography.fontSize.sm,
    fontFamily: typography.fontFamily.regular,
    color: colors.secondary[600],
  },
  discountBadge: {
    backgroundColor: colors.primary[500],
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.md,
  },
  discountText: {
    fontSize: typography.fontSize.xs,
    fontFamily: typography.fontFamily.bold,
    color: colors.white,
  },
  infoSection: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.lg,
    backgroundColor: colors.secondary[50],
  },
  infoTitle: {
    fontSize: typography.fontSize.lg,
    fontFamily: typography.fontFamily.bold,
    color: colors.secondary[900],
    marginBottom: spacing.md,
  },
  infoSteps: {
    gap: spacing.md,
  },
  infoStep: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  stepNumber: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: colors.primary[500],
    color: colors.white,
    fontSize: typography.fontSize.sm,
    fontFamily: typography.fontFamily.bold,
    textAlign: 'center',
    lineHeight: 24,
    marginRight: spacing.sm,
  },
  stepText: {
    flex: 1,
    fontSize: typography.fontSize.base,
    fontFamily: typography.fontFamily.regular,
    color: colors.secondary[700],
  },
});