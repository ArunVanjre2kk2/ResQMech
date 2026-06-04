// app/services/mechanicLocationService.js

import * as Location from "expo-location";
import { doc, setDoc } from "firebase/firestore";
import { auth, firestore } from "../../firebase/firebaseConfig";

let trackingInterval = null;

export const updateMechanicLocation = async () => {
  try {
    // Ask permission
    const { status } = await Location.requestForegroundPermissionsAsync();

    if (status !== "granted") {
      console.log("Mechanic location permission NOT granted");
      return false; // IMPORTANT
    }

    // Get current GPS
    const loc = await Location.getCurrentPositionAsync({
      accuracy: Location.Accuracy.High,
    });

    const latitude = loc.coords.latitude;
    const longitude = loc.coords.longitude;

    if (!auth.currentUser) {
      console.log("Mechanic not logged in");
      return false;
    }

    // Save to Firestore
    await setDoc(
      doc(firestore, "mechanics", auth.currentUser.uid),
      {
        lat: latitude,
        lng: longitude,
        updatedAt: Date.now(),
      },
      { merge: true }
    );

    console.log("Mechanic Location Updated:", latitude, longitude);
    return true;
  } catch (err) {
    console.log("Mechanic Location Error:", err);
    return false;
  }
};


export const startMechanicTracking = async () => {
  if (trackingInterval) {
    console.log("Mechanic is already being tracked");
    return true;
  }

  // First update — asks permission
  const allowed = await updateMechanicLocation();

  if (!allowed) {
    console.log("Tracking FAILED — no permission");
    return false;
  }

  // Start interval tracking
  trackingInterval = setInterval(() => {
    updateMechanicLocation();
  }, 12000);

  console.log("Mechanic Location Tracking STARTED");
  return true;
};

export const stopMechanicTracking = () => {
  if (trackingInterval) {
    clearInterval(trackingInterval);
    trackingInterval = null;
    console.log("Mechanic Location Tracking STOPPED");
  }
};
