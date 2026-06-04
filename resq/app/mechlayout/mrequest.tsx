// app/mechlayout/mrequest.tsx

import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { firestore, auth } from "../../firebase/firebaseConfig";
import { collection, onSnapshot, doc } from "firebase/firestore";

interface RequestItem {
  id: string;
  service: string;
  userId: string;
  distance: string;
}

// DISTANCE
function calculateDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): string {
  const R = 6371;
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);

  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1 * (Math.PI / 180)) *
      Math.cos(lat2 * (Math.PI / 180)) *
      Math.sin(dLon / 2) ** 2;

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return (R * c).toFixed(2);
}

export default function IncomingRequests() {
  const router = useRouter();
  const mechId = auth.currentUser?.uid;

  const [requests, setRequests] = useState<RequestItem[]>([]);
  const [mechanicLocation, setMechanicLocation] = useState<{
    lat: number;
    lng: number;
  } | null>(null);

  // FETCH MECHANIC LOCATION
  useEffect(() => {
    if (!mechId) return;

    const unsub = onSnapshot(doc(firestore, "mechanics", mechId), snap => {
      if (snap.exists()) {
        const data = snap.data();
        if (data?.lat && data?.lng) {
          setMechanicLocation({
            lat: data.lat,
            lng: data.lng,
          });
        }
      }
    });

    return () => unsub();
  }, [mechId]);

  // FETCHING PENDING REQUESTS
  useEffect(() => {
    if (!mechanicLocation || !mechId) return;

    const unsub = onSnapshot(
      collection(firestore, "serviceRequests"),
      snapshot => {
        const temp: RequestItem[] = [];

        snapshot.forEach(docSnap => {
          const req = docSnap.data();

          if (req.status !== "pending") return;

          if (Array.isArray(req.rejectedBy) && req.rejectedBy.includes(mechId)) {
            return;
          }

          if (!req.location?.lat || !req.location?.lng) return;

          const distance =
            calculateDistance(
              mechanicLocation.lat,
              mechanicLocation.lng,
              req.location.lat,
              req.location.lng
            ) + " km";

          temp.push({
            id: docSnap.id,
            service: req.service ?? "Unknown Service",
            userId: req.userId ?? "Unknown User",
            distance,
          });
        });

        setRequests(temp);
      }
    );

    return () => unsub();
  }, [mechanicLocation, mechId]);

  const renderItem = ({ item }: { item: RequestItem }) => (
    <View style={styles.card}>
      <View style={styles.row}>
        <View style={styles.iconBox}>
          <Ionicons name="car-outline" size={32} color="#4ADE80" />
        </View>

        <View style={{ marginLeft: 14 }}>
          <Text style={styles.userName}>User ID: {item.userId}</Text>
          <Text style={styles.service}>{item.service}</Text>
          <Text style={styles.distance}>📍 {item.distance}</Text>
        </View>
      </View>

      <TouchableOpacity
        style={styles.btn}
        onPress={() =>
          router.push({
            pathname: "/mechlayout/requestDetails",
            params: { id: item.id },
          })
        }
      >
        <Text style={styles.btnText}>View Details</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <Text style={styles.title}>Incoming Requests</Text>
      <Text style={styles.subtitle}>Requests available for you</Text>

      <FlatList
        data={requests}
        renderItem={renderItem}
        keyExtractor={item => item.id}
        contentContainerStyle={{ paddingBottom: 40 }}
        ListEmptyComponent={
          <Text style={styles.emptyText}>
            No new requests right now
          </Text>
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#0B1120", padding: 20 },
  title: { fontSize: 26, fontWeight: "700", color: "#E2E8F0" },
  subtitle: { fontSize: 14, color: "#64748B", marginBottom: 20 },

  card: {
    backgroundColor: "#111827",
    padding: 18,
    borderRadius: 16,
    marginBottom: 16,
  },
  row: { flexDirection: "row", alignItems: "center" },
  iconBox: { backgroundColor: "#1E293B", padding: 16, borderRadius: 14 },

  userName: { fontSize: 16, fontWeight: "700", color: "#F1F5F9" },
  service: { fontSize: 14, color: "#93C5FD", marginTop: 3 },
  distance: { fontSize: 14, color: "#FACC15", marginTop: 3 },

  btn: {
    marginTop: 18,
    backgroundColor: "#2563EB",
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: "center",
  },
  btnText: { color: "#fff", fontSize: 15, fontWeight: "700" },

  emptyText: {
    color: "#64748B",
    textAlign: "center",
    marginTop: 40,
  },
});
