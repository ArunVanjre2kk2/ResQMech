// app/services/nearbyRequestsService.js

import { collection, onSnapshot, query, where } from "firebase/firestore";
import { firestore } from "../../firebase/firebaseConfig";

// Haversine formula → Calculate distance between 2 coordinates
function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371; // Earth radius in km
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);

  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1 * (Math.PI / 180)) *
      Math.cos(lat2 * (Math.PI / 180)) *
      Math.sin(dLon / 2) ** 2;

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c; // km
}

export const listenToNearbyRequests = (
  mechanicId,
  mechanicLat,
  mechanicLng,
  callback
) => {
  const q = query(
    collection(firestore, "serviceRequests"),
    where("status", "==", "pending")
  );

  return onSnapshot(q, (snapshot) => {
    const nearby = [];

    snapshot.forEach((docSnap) => {
      const req = docSnap.data();

      if (!req.location) return;

      if (req.rejectedBy?.includes(mechanicId)) return;

      const distance = calculateDistance(
        mechanicLat,
        mechanicLng,
        req.location.lat,
        req.location.lng
      );

      // Only within 10 KM radius
      if (distance <= 10) {
        nearby.push({
          id: docSnap.id,
          distance: distance.toFixed(2),
          ...req,
        });
      }
    });

    callback(nearby);
  });
};
