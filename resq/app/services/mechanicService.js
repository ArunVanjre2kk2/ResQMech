// app/services/mechanicService.js

import { collection, onSnapshot } from "firebase/firestore";
import { firestore } from "../../firebase/firebaseConfig";

//  Listen to mechanics live from Firestore
export function listenToMechanics(callback) {
  const mechanicsRef = collection(firestore, "mechanics");

  // Realtime updates
  return onSnapshot(mechanicsRef, (snapshot) => {
    const mechanics = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    callback(mechanics);
  });
}
