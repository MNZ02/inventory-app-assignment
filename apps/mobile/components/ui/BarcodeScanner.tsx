import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, Modal, TouchableOpacity, SafeAreaView, Dimensions } from 'react-native';
import { CameraView, useCameraPermissions, type BarcodeScanningResult } from 'expo-camera';
import { Ionicons } from '@expo/vector-icons';
import { Button } from './Button';

interface BarcodeScannerProps {
  isVisible: boolean;
  onClose: () => void;
  onScanned: (barcode: string) => void;
}

export function BarcodeScanner({ isVisible, onClose, onScanned }: BarcodeScannerProps) {
  const [permission, requestPermission] = useCameraPermissions();
  const [scanned, setScanned] = useState(false);

  useEffect(() => {
    if (isVisible) {
      setScanned(false);
      if (!permission?.granted) {
        requestPermission();
      }
    }
  }, [isVisible, permission, requestPermission]);

  const handleBarcodeScanned = (result: BarcodeScanningResult) => {
    if (scanned) return;
    setScanned(true);
    onScanned(result.data);
    onClose();
  };

  if (!permission) {
    return null;
  }

  return (
    <Modal
      animationType="slide"
      transparent={false}
      visible={isVisible}
      onRequestClose={onClose}
    >
      <SafeAreaView className="flex-1 bg-black">
        <View className="flex-1">
          {!permission.granted ? (
            <View className="flex-1 justify-center items-center px-6">
              <Ionicons name="camera-outline" size={64} color="white" />
              <Text className="text-white text-xl font-bold mt-4 text-center">
                Camera Permission Needed
              </Text>
              <Text className="text-gray-400 mt-2 text-center mb-8">
                We need your permission to show the camera for scanning barcodes.
              </Text>
              <Button title="Grant Permission" onPress={requestPermission} />
              <TouchableOpacity onPress={onClose} className="mt-4">
                <Text className="text-white font-medium">Cancel</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View className="flex-1">
              <CameraView
                style={StyleSheet.absoluteFillObject}
                onBarcodeScanned={scanned ? undefined : handleBarcodeScanned}
                barcodeScannerSettings={{
                  barcodeTypes: ['ean13', 'ean8', 'upc_a', 'upc_e', 'code128'],
                }}
              />
              
              {/* Overlay */}
              <View style={styles.overlay}>
                <View style={styles.unfocusedContainer}></View>
                <View className="flex-row">
                  <View style={styles.unfocusedContainer}></View>
                  <View style={styles.focusedContainer}>
                    {/* Corner markers */}
                    <View style={[styles.corner, styles.topLeft]} />
                    <View style={[styles.corner, styles.topRight]} />
                    <View style={[styles.corner, styles.bottomLeft]} />
                    <View style={[styles.corner, styles.bottomRight]} />
                  </View>
                  <View style={styles.unfocusedContainer}></View>
                </View>
                <View style={styles.unfocusedContainer}>
                  <Text className="text-white text-center mt-10 px-10 text-lg font-medium">
                    Center the barcode within the frame to scan
                  </Text>
                </View>
              </View>

              {/* Close Button */}
              <TouchableOpacity
                onPress={onClose}
                className="absolute top-12 right-6 bg-black/50 p-2 rounded-full"
              >
                <Ionicons name="close" size={28} color="white" />
              </TouchableOpacity>
            </View>
          )}
        </View>
      </SafeAreaView>
    </Modal>
  );
}

const { width } = Dimensions.get('window');
const scannerSize = width * 0.7;

const styles = StyleSheet.create({
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  unfocusedContainer: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
  },
  focusedContainer: {
    width: scannerSize,
    height: scannerSize * 0.6,
    borderRadius: 12,
  },
  corner: {
    position: 'absolute',
    width: 30,
    height: 30,
    borderColor: '#A78BFA',
  },
  topLeft: {
    top: 0,
    left: 0,
    borderTopWidth: 4,
    borderLeftWidth: 4,
    borderTopLeftRadius: 12,
  },
  topRight: {
    top: 0,
    right: 0,
    borderTopWidth: 4,
    borderRightWidth: 4,
    borderTopRightRadius: 12,
  },
  bottomLeft: {
    bottom: 0,
    left: 0,
    borderBottomWidth: 4,
    borderLeftWidth: 4,
    borderBottomLeftRadius: 12,
  },
  bottomRight: {
    bottom: 0,
    right: 0,
    borderBottomWidth: 4,
    borderRightWidth: 4,
    borderBottomRightRadius: 12,
  },
});
