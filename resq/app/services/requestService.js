// app/services/requestService.js

import {
  addDoc,
  collection,
  doc,
  getDoc,
  updateDoc,
} from "firebase/firestore";
import { firestore } from "../../firebase/firebaseConfig";
import * as Location from "expo-location";

export async function createServiceRequest(userId, serviceType, opts = {}) {
  // Ask for location permission
  const { status } = await Location.requestForegroundPermissionsAsync();
  if (status !== "granted") {
    throw new Error("Location permission not granted");
  }

  // Get user's live GPS location
  const pos = await Location.getCurrentPositionAsync({});
  const lat = pos.coords.latitude;
  const lng = pos.coords.longitude;

  // Fetch vehicle details
  let vehicleDetails = null;
  try {
    const vRef = doc(firestore, "vehicle", userId);
    const vSnap = await getDoc(vRef);
    if (vSnap.exists()) {
      vehicleDetails = vSnap.data();
    }
  } catch (err) {
    console.log("Vehicle fetch error:", err);
  }

  // Optional Video Assistance room ID
  let roomId = opts.roomId || null;
  if (serviceType === "Video Assistance" && !roomId) {
    roomId = `room_${userId}_${Date.now()}`;
  }

  // Amount
  const amount = opts.amount ?? 0;

  // Create service request
  const requestRef = await addDoc(collection(firestore, "serviceRequests"), {
    userId,
    service: serviceType,
    amount,
    location: { lat, lng },

    status: "pending",
    acceptedBy: null,
    rejectedBy: [],

    vehicle: vehicleDetails || null,
    roomId,
    createdAt: Date.now(),
  });

  const requestId = requestRef.id;
  console.log("Service Request Created:", requestId);

  // Mark this as the user's active request
  await updateDoc(doc(firestore, "users", userId), {
    activeRequestId: requestId,
  });

  return requestId;
}
