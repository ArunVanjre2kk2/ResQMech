// app/services/fetchMechanics.js

import { firestore } from "../../firebase/firebaseConfig";
import { collection, onSnapshot } from "firebase/firestore";

export const listenToMechanics = (callback) => {
  const mechanicsRef = collection(firestore, "mechanics");

  return onSnapshot(mechanicsRef, (snapshot) => {
    const list = [];

    snapshot.forEach((doc) => {
      const data = doc.data();

      list.push({
        id: doc.id,
        lat: data.lat,
        lng: data.lng,
      });
    });

    callback(list);
  });
};
