// app/services/locationService.js

import * as Location from "expo-location";

/**
 * Get user's current location with proper error handling
 * @returns {Promise<{error: boolean, data?: {lat: number, lng: number}, message?: string}>}
 */
export async function getUserLocation() {
  try {
    // Request permission
    const { status } = await Location.requestForegroundPermissionsAsync();

    if (status !== "granted") {
      return {
        error: true,
        message: "Location permission denied. Please enable location access in your device settings to use this feature.",
      };
    }

    // Get current position
    try {
      const pos = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
        timeInterval: 5000,
        distanceInterval: 10,
      });

      return {
        error: false,
        data: {
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
        },
      };
    } catch (locationError) {
      console.error("Error getting current position:", locationError);

      return {
        error: true,
        message: "Unable to get your current location. Please make sure GPS is enabled and try again.",
      };
    }
  } catch (permissionError) {
    console.error("Error requesting location permission:", permissionError);

    return {
      error: true,
      message: "Failed to request location permission. Please check your device settings.",
    };
  }
}

/**
 * Check if location services are enabled on device
 * @returns {Promise<boolean>}
 */
export async function isLocationEnabled() {
  try {
    const enabled = await Location.hasServicesEnabledAsync();
    return enabled;
  } catch (error) {
    console.error("Error checking location services:", error);
    return false;
  }
}

/**
 * Get last known location (faster but potentially outdated)
 * @returns {Promise<{error: boolean, data?: {lat: number, lng: number}, message?: string}>}
 */
export async function getLastKnownLocation() {
  try {
    const { status } = await Location.getForegroundPermissionsAsync();

    if (status !== "granted") {
      return {
        error: true,
        message: "Location permission not granted.",
      };
    }

    const lastKnown = await Location.getLastKnownPositionAsync();

    if (!lastKnown) {
      return {
        error: true,
        message: "No last known location available.",
      };
    }

    return {
      error: false,
      data: {
        lat: lastKnown.coords.latitude,
        lng: lastKnown.coords.longitude,
      },
    };
  } catch (error) {
    console.error("Error getting last known location:", error);
    return {
      error: true,
      message: "Failed to get last known location.",
    };
  }
}