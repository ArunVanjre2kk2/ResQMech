// app/userlayout/home.tsx

import React, { useEffect, useState, useRef } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";

import { auth, firestore } from "../../firebase/firebaseConfig";
import {
  collection,
  query,
  where,
  onSnapshot,
} from "firebase/firestore";
import MapComponent from "../../components/MapComponent";
import RatingModal from "../../components/RatingModal";
// Services
import { getUserLocation } from "../services/locationService.js";
import { listenToMechanics } from "../services/fetchMechanics.js";

export default function HomeScreen() {
  const router = useRouter();

  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [mechanicList, setMechanicList] = useState<any[]>([]);

  const [showRating, setShowRating] = useState(false);
  const [ratingRequestId, setRatingRequestId] = useState<string | null>(null);
  const handledRequest = useRef<string | null>(null);
  const recentActivity: any[] = [];

// USER LOCATION
useEffect(() => {
  (async () => {
    const result = await getUserLocation();
    
    if (result.error) {
      console.log("Location Error:", result.message);
      Alert.alert(
        "Location Access Required",
        result.message || "Unable to get your location",
        [{ text: "OK" }]
      );
    } else {
      setUserLocation(result.data || null);
    }
  })();
}, []);

  // MECHANIC LISTENER
  useEffect(() => {
    const unsubscribe = listenToMechanics(setMechanicList);
    return () => unsubscribe();
  }, []);

  // PAYMENT & RATING FLOW 
  useEffect(() => {
    if (!auth.currentUser) return;

    const q = query(
      collection(firestore, "serviceRequests"),
      where("userId", "==", auth.currentUser.uid),
      where("status", "==", "completed")
    );

    const unsubscribe = onSnapshot(q, (snap) => {
      snap.forEach((docSnap) => {
        const data = docSnap.data();

        if (handledRequest.current === docSnap.id) return;

        // STEP 1: PAYMENT
        if (data.paymentStatus === "pending" && data.nextAction === "payment") {
          handledRequest.current = docSnap.id;

          router.replace({
            pathname: "/userlayout/payment",
            params: {
              requestId: docSnap.id,
              amount: data.amount,
            },
          });
        }

        // STEP 2: RATING
        if (data.paymentStatus === "paid" && data.nextAction === "rating") {
          handledRequest.current = docSnap.id;
          setRatingRequestId(docSnap.id);
          setShowRating(true);
        }
      });
    });

    return () => unsubscribe();
  }, []);

  // Rating is now handled internally by RatingModal component

  return (
    <SafeAreaView style={styles.safeArea}>
      <FlatList
        data={recentActivity}
        keyExtractor={(_, index) => index.toString()}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={
          <>
            <View style={styles.headerBox}>
              <Text style={styles.headerTitle}>Welcome Back 👋</Text>
              <Text style={styles.headerSubtitle}>
                How can we assist you today?
              </Text>
            </View>

            <View style={styles.helpCard}>
              <Ionicons
                name="alert-circle-outline"
                size={44}
                color="#38bdf8"
                style={{ marginBottom: 10 }}
              />

              <Text style={styles.helpTitle}>Emergency Help?</Text>
              <Text style={styles.helpSubtitle}>
                Get quick roadside assistance anytime, anywhere.
              </Text>

              <TouchableOpacity
                style={styles.primaryBtn}
                onPress={() => router.push("/userlayout/services")}
              >
                <Text style={styles.primaryBtnText}>Request Assistance</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.secondaryBtn}
                onPress={() => router.push("/userlayout/vehicle")}
              >
                <Text style={styles.secondaryBtnText}>
                  Update Vehicle Details
                </Text>
              </TouchableOpacity>
            </View>

            <Text style={styles.mapTitle}>Your Location</Text>

            <View style={styles.mapContainer}>
              {userLocation ? (
                <MapComponent user={userLocation} mechanics={mechanicList} />
              ) : (
                <Text style={{ color: "#8AA4C2", textAlign: "center" }}>
                  Fetching your location...
                </Text>
              )}
            </View>

            <Text style={styles.sectionTitle}>Recent Activity</Text>

            {recentActivity.length === 0 && (
              <Text style={styles.emptyActivity}>
                No recent activity to show.
              </Text>
            )}
          </>
        }
        renderItem={() => null}
      />

      {/* RATING MODAL */}
      <RatingModal
        visible={showRating}
        requestId={ratingRequestId ?? ""}
        onClose={() => {
          setShowRating(false);
          setRatingRequestId(null);
          handledRequest.current = null;
        }}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#0E1627",
    paddingTop: 10,
  },
  headerBox: {
    paddingHorizontal: 20,
    paddingTop: 10,
    marginBottom: 20,
  },
  headerTitle: {
    color: "#fff",
    fontSize: 26,
    fontWeight: "700",
  },
  headerSubtitle: {
    color: "#8AA4C2",
    fontSize: 15,
    marginTop: 4,
  },
  helpCard: {
    backgroundColor: "#1B2536",
    marginHorizontal: 20,
    padding: 22,
    borderRadius: 18,
    alignItems: "center",
    marginBottom: 30,
  },
  helpTitle: {
    color: "#fff",
    fontSize: 22,
    fontWeight: "700",
    marginBottom: 6,
  },
  helpSubtitle: {
    color: "#8AA4C2",
    fontSize: 14,
    textAlign: "center",
    marginBottom: 18,
  },
  primaryBtn: {
    backgroundColor: "#0284c7",
    width: "90%",
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: "center",
    marginBottom: 10,
  },
  primaryBtnText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
  },
  secondaryBtn: {
    backgroundColor: "#1e3a8a",
    width: "90%",
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: "center",
  },
  secondaryBtnText: {
    color: "#38bdf8",
    fontSize: 15,
    fontWeight: "600",
  },
  mapTitle: {
    color: "#fff",
    fontSize: 20,
    fontWeight: "600",
    paddingHorizontal: 20,
    marginBottom: 10,
  },
  mapContainer: {
    height: 300,
    marginHorizontal: 20,
    marginBottom: 25,
    borderRadius: 18,
    overflow: "hidden",
    backgroundColor: "#1B2536",
  },
  sectionTitle: {
    color: "#fff",
    fontSize: 20,
    fontWeight: "600",
    paddingHorizontal: 20,
    marginBottom: 10,
  },
  emptyActivity: {
    color: "#8AA4C2",
    paddingHorizontal: 20,
    fontSize: 15,
    marginTop: 5,
  },
});
