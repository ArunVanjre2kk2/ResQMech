// app/services/serviceActions.js

import { auth, firestore } from "../../firebase/firebaseConfig";
import {
  doc,
  getDoc,
  updateDoc,
  runTransaction,
  arrayUnion,
  collection,
  getDocs,
} from "firebase/firestore";

// MECHANIC ACCEPT REQUEST
export async function acceptRequestByMechanic(requestId) {
  const mechUid = auth.currentUser?.uid;
  if (!mechUid) throw new Error("Mechanic not logged in.");

  const reqRef = doc(firestore, "serviceRequests", requestId);

  return runTransaction(firestore, async (tx) => {
    const snap = await tx.get(reqRef);
    if (!snap.exists()) throw new Error("Request not found.");

    const data = snap.data();

    if (data.status === "accepted") {
      throw new Error("Another mechanic has already accepted this request.");
    }

    if (data.status === "cancelled") {
      throw new Error("Request already cancelled.");
    }

    tx.update(reqRef, {
      status: "accepted",
      acceptedBy: mechUid,
      acceptedAt: Date.now(),
    });
  });
}

// MECHANIC REJECT REQUEST
export async function rejectRequestByMechanic(requestId) {
  const mechUid = auth.currentUser?.uid;
  if (!mechUid) throw new Error("Mechanic not logged in.");

  const reqRef = doc(firestore, "serviceRequests", requestId);

  // Add mechanic to rejectedBy array
  await updateDoc(reqRef, {
    rejectedBy: arrayUnion(mechUid),
    lastRejectedAt: Date.now(),
  });

  // Get total mechanics
  const mechanicsSnap = await getDocs(collection(firestore, "mechanics"));
  const totalMechanics = mechanicsSnap.size;

  // Refetch request
  const latest = await getDoc(reqRef);
  const data = latest.data();

  const rejectedBy = Array.isArray(data.rejectedBy) ? data.rejectedBy : [];

  // If ALL mechanics rejected → cancel request
  if (totalMechanics > 0 && rejectedBy.length >= totalMechanics) {
    await updateDoc(reqRef, {
      status: "cancelled",
      cancelledAt: Date.now(),
    });
    return { cancelled: true };
  }

  return { cancelled: false };
}
