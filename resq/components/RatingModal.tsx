// components/RatingModal.tsx

import React, { useEffect, useState } from "react";
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { firestore, auth } from "../firebase/firebaseConfig";
import {
  doc,
  runTransaction,
} from "firebase/firestore";

interface RatingModalProps {
  visible: boolean;
  requestId: string;
  onClose: () => void;
}

export default function RatingModal({
  visible,
  requestId,
  onClose,
}: RatingModalProps) {
  const [rating, setRating] = useState<number>(0);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (visible) setRating(0);
  }, [visible]);

  // SUBMIT RATING 
  async function submitRating() {
    if (!requestId || rating === 0) return;

    const userId = auth.currentUser?.uid;
    if (!userId) return;

    try {
      setSaving(true);

      await runTransaction(firestore, async (tx) => {
        const reqRef = doc(firestore, "serviceRequests", requestId);
        const userRef = doc(firestore, "users", userId);

        const reqSnap = await tx.get(reqRef);
        if (!reqSnap.exists()) {
          throw new Error("Request not found");
        }

        const reqData = reqSnap.data();

        // prevent double rating
        if (reqData.status === "rated") {
          throw new Error("Already rated");
        }

        const mechanicId = reqData.acceptedBy;
        if (!mechanicId) {
          throw new Error("Mechanic not found");
        }

        const mechRef = doc(firestore, "mechanics", mechanicId);
        const mechSnap = await tx.get(mechRef);

        const prevTotal = mechSnap.exists()
          ? mechSnap.data().ratingTotal ?? 0
          : 0;

        const prevCount = mechSnap.exists()
          ? mechSnap.data().ratingCount ?? 0
          : 0;

        const newTotal = prevTotal + rating;
        const newCount = prevCount + 1;
        const newAvg = Number((newTotal / newCount).toFixed(1));

        tx.update(reqRef, {
          rating,
          status: "rated",
          ratedAt: Date.now(),
        });

        tx.set(
          mechRef,
          {
            ratingTotal: newTotal,
            ratingCount: newCount,
            ratingAvg: newAvg,
          },
          { merge: true }
        );

        tx.update(userRef, {
          activeRequestId: null,
        });

        // Update serviceHistory with the actual rating value
        const histRef = doc(firestore, "serviceHistory", requestId);
        tx.set(histRef, { rating, ratedAt: Date.now() }, { merge: true });
      });

      Alert.alert("Thank You ", "Your rating has been submitted");
      onClose();
    } catch (err: any) {
      Alert.alert("Rating Error", err.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <Modal transparent visible={visible} animationType="fade">
      <View style={styles.overlay}>
        <View style={styles.box}>
          <Text style={styles.title}>Rate Your Mechanic</Text>

          {/* STAR RATING */}
          <View style={styles.row}>
            {[1, 2, 3, 4, 5].map((star) => (
              <TouchableOpacity
                key={star}
                onPress={() => setRating(star)}
                disabled={saving}
              >
                <Ionicons
                  name={rating >= star ? "star" : "star-outline"}
                  size={32}
                  color="#FACC15"
                />
              </TouchableOpacity>
            ))}
          </View>

          {/* SUBMIT */}
          <TouchableOpacity
            style={[
              styles.btn,
              (rating === 0 || saving) && { opacity: 0.5 },
            ]}
            disabled={rating === 0 || saving}
            onPress={submitRating}
          >
            <Text style={styles.btnText}>
              {saving ? "Submitting..." : "Submit Rating"}
            </Text>
          </TouchableOpacity>

          {/* CLOSE */}
          <TouchableOpacity onPress={onClose} disabled={saving}>
            <Text style={styles.closeText}>Close</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.6)",
    justifyContent: "center",
    alignItems: "center",
  },
  box: {
    width: "85%",
    backgroundColor: "#1E293B",
    padding: 20,
    borderRadius: 16,
    alignItems: "center",
  },
  title: {
    color: "#fff",
    fontSize: 20,
    fontWeight: "700",
    marginBottom: 15,
  },
  row: {
    flexDirection: "row",
    marginBottom: 20,
  },
  btn: {
    backgroundColor: "#3B82F6",
    paddingVertical: 12,
    paddingHorizontal: 40,
    borderRadius: 10,
  },
  btnText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
  },
  closeText: {
    color: "#aaa",
    marginTop: 12,
  },
});
