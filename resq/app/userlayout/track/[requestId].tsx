// app/userlayout/track/[requestId].tsx

import React, { useEffect, useState, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
  Linking,
  ScrollView,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import MapComponent from "../../../components/MapComponent";
import RatingModal from "../../../components/RatingModal";
import { firestore, auth } from "../../../firebase/firebaseConfig";
import { doc, getDoc, onSnapshot } from "firebase/firestore";

interface LatLng {
  lat: number;
  lng: number;
}

interface MechanicInfo {
  name?: string;
  phone?: string;
}

interface RequestData {
  location: LatLng;
  acceptedBy: string;
  amount?: number;
  status:
    | "pending"
    | "accepted"
    | "on_the_way"
    | "arrived"
    | "completed"
    | "paid"
    | "rated";
}

export default function TrackMechanic() {
  const router = useRouter();
  const { requestId } = useLocalSearchParams<{ requestId: string }>();

  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState<RequestData["status"]>("pending");

  const [userLocation, setUserLocation] = useState<LatLng | null>(null);
  const [mechanicLocation, setMechanicLocation] = useState<LatLng | null>(null);
  const [mechanicInfo, setMechanicInfo] = useState<MechanicInfo | null>(null);

  const [showRating, setShowRating] = useState(false);

  // Use refs to track unsubscribe functions
  const unsubscribeReqRef = useRef<(() => void) | null>(null);
  const unsubscribeMechRef = useRef<(() => void) | null>(null);

  // STATUS TEXT
  const getStatusText = () => {
    switch (status) {
      case "pending":
        return "Waiting for mechanic to accept ⏳";
      case "accepted":
        return "Mechanic accepted your request ✅";
      case "on_the_way":
        return "Mechanic is on the way 🚗";
      case "arrived":
        return "Mechanic has arrived 📍";
      case "completed":
        return "Service completed 🎉";
      case "paid":
        return "Payment successful 💳";
      case "rated":
        return "Thank you for your feedback ⭐";
      default:
        return "Tracking service";
    }
  };

  // LIVE REQUEST LISTENER
  useEffect(() => {
    if (!requestId || !auth.currentUser) {
      setLoading(false);
      return;
    }

    const uid = auth.currentUser.uid;
    const userRef = doc(firestore, "users", uid);
    const reqRef = doc(firestore, "serviceRequests", requestId);

    unsubscribeReqRef.current = onSnapshot(
      reqRef,
      async (snap) => {
        if (!snap.exists()) {
          console.log("Request not found, redirecting home");
          router.replace("/userlayout/home");
          return;
        }

        const req = snap.data() as RequestData;

        // GUARD: Check activeRequestId
        try {
          const userSnap = await getDoc(userRef);
          const activeRequestId = userSnap.data()?.activeRequestId;

          if (activeRequestId !== requestId || req.status === "rated") {
            console.log("Request no longer active, redirecting home");
            router.replace("/userlayout/home");
            return;
          }
        } catch (err) {
          console.error("Error checking active request:", err);
        }

        setStatus(req.status);
        setUserLocation(req.location);

        // PAYMENT REDIRECT
        if (req.status === "completed") {
          router.replace({
            pathname: "/userlayout/payment",
            params: {
              requestId,
              amount: req.amount?.toString() ?? "0",
            },
          });
          return;
        }

        // SHOW RATING
        if (req.status === "paid") {
          setShowRating(true);
        }

        // TRACK MECHANIC
        if (req.status === "on_the_way" && req.acceptedBy) {
          // Clean up previous mechanic listener if exists
          if (unsubscribeMechRef.current) {
            unsubscribeMechRef.current();
            unsubscribeMechRef.current = null;
          }

          const mechRef = doc(firestore, "mechanics", req.acceptedBy);
          unsubscribeMechRef.current = onSnapshot(
            mechRef,
            (mSnap) => {
              if (mSnap.exists()) {
                const d = mSnap.data();
                if (d?.lat && d?.lng) {
                  setMechanicLocation({ lat: d.lat, lng: d.lng });
                }
              }
            },
            (error) => {
              console.error("Error tracking mechanic location:", error);
            }
          );
        } else {
          // Not tracking anymore, clean up
          setMechanicLocation(null);
          if (unsubscribeMechRef.current) {
            unsubscribeMechRef.current();
            unsubscribeMechRef.current = null;
          }
        }

        // Load mechanic info once
        if (!mechanicInfo && req.acceptedBy) {
          try {
            const mechSnap = await getDoc(
              doc(firestore, "users", req.acceptedBy)
            );
            if (mechSnap.exists()) {
              setMechanicInfo(mechSnap.data() as MechanicInfo);
            }
          } catch (err) {
            console.error("Error loading mechanic info:", err);
          }
        }

        setLoading(false);
      },
      (error) => {
        console.error("Error listening to request:", error);
        setLoading(false);
      }
    );

    // Cleanup function
    return () => {
      if (unsubscribeReqRef.current) {
        unsubscribeReqRef.current();
        unsubscribeReqRef.current = null;
      }
      if (unsubscribeMechRef.current) {
        unsubscribeMechRef.current();
        unsubscribeMechRef.current = null;
      }
    };
  }, [requestId]);

  if (loading || !userLocation) {
    return (
      <SafeAreaView style={styles.center}>
        <ActivityIndicator size="large" color="#60A5FA" />
        <Text style={{ color: "#ccc", marginTop: 10 }}>
          Loading tracking...
        </Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={{ paddingBottom: 80 }}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={26} color="#93C5FD" />
        </TouchableOpacity>

        <Text style={styles.title}>Track Your Mechanic</Text>

        <View style={styles.statusBox}>
          <Text style={styles.statusText}>{getStatusText()}</Text>
        </View>

        {status === "on_the_way" && (
          <View style={styles.mapBox}>
            <MapComponent
              user={userLocation}
              mechanics={mechanicLocation ? [mechanicLocation] : []}
            />
          </View>
        )}

        {mechanicInfo && (
          <View>
            <Text style={styles.label}>Mechanic:</Text>
            <Text style={styles.value}>{mechanicInfo.name || "N/A"}</Text>

            {mechanicInfo.phone && (
              <TouchableOpacity
                style={styles.callBtn}
                onPress={() => {
                  const phoneNumber = mechanicInfo.phone;
                  if (phoneNumber) {
                    Linking.openURL(`tel:${phoneNumber}`).catch((err) =>
                      console.error("Error opening phone dialer:", err)
                    );
                  }
                }}
              >
                <Ionicons name="call" size={20} color="#fff" />
                <Text style={styles.callText}>Call Mechanic</Text>
              </TouchableOpacity>
            )}
          </View>
        )}
      </ScrollView>

      {/* RATING MODAL */}
      <RatingModal
        visible={showRating}
        requestId={requestId}
        onClose={() => setShowRating(false)}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#0B1120", padding: 15 },
  center: {
    flex: 1,
    backgroundColor: "#0B1120",
    justifyContent: "center",
    alignItems: "center",
  },
  title: { color: "#fff", fontSize: 22, fontWeight: "700", marginVertical: 15 },
  statusBox: {
    backgroundColor: "#1E3A8A",
    padding: 12,
    borderRadius: 10,
    marginBottom: 15,
  },
  statusText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
    textAlign: "center",
  },
  mapBox: {
    height: 350,
    borderRadius: 16,
    overflow: "hidden",
    marginBottom: 20,
  },
  label: { color: "#93C5FD", fontSize: 14 },
  value: { color: "#fff", fontSize: 18, fontWeight: "700", marginBottom: 8 },
  callBtn: {
    marginTop: 20,
    backgroundColor: "#2563EB",
    padding: 14,
    borderRadius: 12,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
  callText: { color: "#fff", fontSize: 16, fontWeight: "700", marginLeft: 10 },
});