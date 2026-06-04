// app/mechlayout/requestDetails.tsx

import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
  Linking,
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { firestore, auth } from "../../firebase/firebaseConfig";
import {
  doc,
  getDoc,
  onSnapshot,
  runTransaction,
  updateDoc,
  arrayUnion,
  increment,
  setDoc,
} from "firebase/firestore";
import RequestStatusBar from "../../components/RequestStatusBar";
import { sendPushNotification } from "../services/notificationService";

interface RequestData {
  id: string;
  service?: string;
  userId?: string;
  amount?: number;
  status:
    | "pending"
    | "accepted"
    | "on_the_way"
    | "arrived"
    | "completed"
    | "paid"
    | "rated";
  acceptedBy?: string | null;
  rejectedBy?: string[];
  location?: { lat?: number; lng?: number };
  vehicle?: any;
}

interface VehicleData {
  brand?: string;
  model?: string;
  fuelType?: string;
  carNumber?: string;
  transmission?: string;
}

export default function RequestDetails() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const requestId = String(id);
  const mechanicId = auth.currentUser?.uid ?? "";

  const [loading, setLoading] = useState(true);
  const [reqData, setReqData] = useState<RequestData | null>(null);
  const [vehicle, setVehicle] = useState<VehicleData | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const ref = doc(firestore, "serviceRequests", requestId);

    const unsub = onSnapshot(ref, async (snap) => {
      if (!snap.exists()) {
        setLoading(false);
        return;
      }

      const data = snap.data() as RequestData;
      setReqData({ ...data, id: snap.id });

      if (data.userId) {
        const vSnap = await getDoc(doc(firestore, "vehicle", data.userId));
        setVehicle(vSnap.exists() ? (vSnap.data() as VehicleData) : null);
      }

      setLoading(false);
    });

    return () => unsub();
  }, [requestId]);

  // ACCEPT
  async function handleAccept() {
    if (!reqData) return;

    setSaving(true);
    try {
      await runTransaction(firestore, async (tx) => {
        const ref = doc(firestore, "serviceRequests", requestId);
        const snap = await tx.get(ref);

        if (!snap.exists()) throw new Error("Request not found");
        if (snap.data()?.status !== "pending")
          throw new Error("Already processed");

        tx.update(ref, {
          status: "accepted",
          acceptedBy: mechanicId,
          acceptedAt: Date.now(),
        });
      });

      Alert.alert("Accepted", "Request accepted successfully");

      // Notify the user via push notification
      try {
        if (reqData.userId) {
          const userSnap = await getDoc(doc(firestore, "users", reqData.userId));
          const pushToken = userSnap.data()?.pushToken;
          if (pushToken) {
            await sendPushNotification(
              pushToken,
              "Request Accepted ✅",
              "A mechanic has accepted your roadside assistance request!"
            );
          }
        }
      } catch (notifErr) {
        console.log("Push notification failed (non-critical):", notifErr);
      }
    } catch (e: any) {
      Alert.alert("Error", e.message);
    }
    setSaving(false);
  }

  // START TRAVEL
  async function handleStartTravel() {
    if (!reqData || reqData.acceptedBy !== mechanicId) return;

    setSaving(true);
    try {
      await updateDoc(doc(firestore, "serviceRequests", requestId), {
        status: "on_the_way",
        onTheWayAt: Date.now(),
      });

      const { lat, lng } = reqData.location || {};
      if (lat && lng) {
        const url =
          Platform.OS === "ios"
            ? `http://maps.apple.com/?daddr=${lat},${lng}`
            : `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`;

        Linking.openURL(url);
      }

      Alert.alert("Started", "Navigation started");
    } catch (e: any) {
      Alert.alert("Error", e.message);
    }
    setSaving(false);
  }

  // ARRIVED 
  async function handleArrived() {
    if (!reqData || reqData.acceptedBy !== mechanicId) return;

    setSaving(true);
    try {
      await updateDoc(doc(firestore, "serviceRequests", requestId), {
        status: "arrived",
        arrivedAt: Date.now(),
      });

      Alert.alert("Arrived", "Marked as arrived");
    } catch (e: any) {
      Alert.alert("Error", e.message);
    }
    setSaving(false);
  }

  // COMPLETE 
  async function handleComplete() {
    if (!reqData || reqData.acceptedBy !== mechanicId) return;

    setSaving(true);
    try {
      await updateDoc(doc(firestore, "serviceRequests", requestId), {
        status: "completed",
        paymentStatus: "pending",
        completedAt: Date.now(),
        nextAction: "payment",
      });

      await updateDoc(doc(firestore, "mechanics", mechanicId), {
        completed: increment(1),
      });

      await setDoc(doc(firestore, "serviceHistory", requestId), {
        requestId,
        mechanicId,
        userId: reqData.userId,
        service: reqData.service,
        vehicle,
        amount: reqData.amount ?? 0,
        completedAt: Date.now(),
        rating: null,
      });

      Alert.alert("Completed", "Service completed successfully");
      router.replace("/mechlayout/mrequest");
    } catch (e: any) {
      Alert.alert("Error", e.message);
    }
    setSaving(false);
  }

  // REJECT  
  async function handleReject() {
    setSaving(true);
    try {
      await updateDoc(doc(firestore, "serviceRequests", requestId), {
        rejectedBy: arrayUnion(mechanicId),
      });

      router.replace("/mechlayout/mrequest");
    } catch {
      Alert.alert("Error", "Reject failed");
    }
    setSaving(false);
  }

  if (loading || !reqData) {
    return (
      <SafeAreaView style={styles.center}>
        <ActivityIndicator size="large" />
      </SafeAreaView>
    );
  }

  const isMine = reqData.acceptedBy === mechanicId;

  return (
    <SafeAreaView style={styles.safe}>
      <TouchableOpacity onPress={() => router.back()}>
        <Ionicons name="arrow-back" size={26} color="#93C5FD" />
      </TouchableOpacity>

      <Text style={styles.title}>Request Details</Text>

      {/* STATUS BAR */}
      <RequestStatusBar status={reqData.status} />

      {/* SERVICE INFO */}
      <View style={styles.card}>
        <Text style={styles.label}>Service Type</Text>
        <Text style={styles.value}>{reqData.service ?? "N/A"}</Text>

        <Text style={styles.label}>Service Amount</Text>
        <Text style={styles.amount}>₹ {reqData.amount ?? 0}</Text>

        <Text style={styles.label}>Current Status</Text>
        <Text style={styles.value}>{reqData.status}</Text>
      </View>

      {/* VEHICLE INFO */}
      <View style={styles.card}>
        <Text style={styles.subTitle}>Vehicle Details</Text>

        {vehicle ? (
          <>
            <Text style={styles.value}>Brand: {vehicle.brand}</Text>
            <Text style={styles.value}>Model: {vehicle.model}</Text>
            <Text style={styles.value}>Fuel: {vehicle.fuelType}</Text>
            <Text style={styles.value}>Car No: {vehicle.carNumber}</Text>
            <Text style={styles.value}>
              Transmission: {vehicle.transmission}
            </Text>
          </>
        ) : (
          <Text style={styles.muted}>No vehicle details found</Text>
        )}
      </View>

      {/* ACTION BUTTONS */}
      {reqData.status === "pending" && (
        <>
          <TouchableOpacity style={styles.acceptBtn} onPress={handleAccept}>
            <Text style={styles.btnText}>Accept</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.rejectBtn} onPress={handleReject}>
            <Text style={styles.btnText}>Reject</Text>
          </TouchableOpacity>
        </>
      )}

      {reqData.status === "accepted" && isMine && (
        <TouchableOpacity style={styles.primaryBtn} onPress={handleStartTravel}>
          <Text style={styles.btnText}>Start Travel</Text>
        </TouchableOpacity>
      )}

      {reqData.status === "on_the_way" && isMine && (
        <TouchableOpacity style={styles.primaryBtn} onPress={handleArrived}>
          <Text style={styles.btnText}>Mark Arrived</Text>
        </TouchableOpacity>
      )}

      {reqData.status === "arrived" && isMine && (
        <TouchableOpacity style={styles.completeBtn} onPress={handleComplete}>
          <Text style={styles.btnText}>Complete Service</Text>
        </TouchableOpacity>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#0B1120", padding: 20 },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#0B1120",
  },
  title: { fontSize: 26, fontWeight: "700", color: "#fff", marginVertical: 20 },

  card: {
    backgroundColor: "#1E293B",
    padding: 16,
    borderRadius: 14,
    marginBottom: 20,
  },

  subTitle: {
    color: "#38BDF8",
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 10,
  },

  label: { color: "#94A3B8", marginTop: 6 },
  value: { color: "#fff", fontSize: 16, fontWeight: "600" },
  amount: { color: "#22C55E", fontSize: 22, fontWeight: "800" },
  muted: { color: "#94A3B8" },

  acceptBtn: {
    backgroundColor: "#22C55E",
    padding: 14,
    borderRadius: 12,
    marginBottom: 10,
    alignItems: "center",
  },
  rejectBtn: {
    backgroundColor: "#EF4444",
    padding: 14,
    borderRadius: 12,
    alignItems: "center",
  },
  primaryBtn: {
    backgroundColor: "#2563EB",
    padding: 14,
    borderRadius: 12,
    marginBottom: 10,
    alignItems: "center",
  },
  completeBtn: {
    backgroundColor: "#0EA5A0",
    padding: 14,
    borderRadius: 12,
    alignItems: "center",
  },
  btnText: { color: "#fff", fontWeight: "700", fontSize: 16 },
});
