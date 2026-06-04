// app/mechlayout/mhome.tsx

import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { startMechanicTracking, stopMechanicTracking } from "../services/mechanicLocationService";
import MapComponent from "../../components/MapComponent";
import { firestore, auth } from "../../firebase/firebaseConfig";
import {
  onSnapshot,
  doc,
  collection,
  query,
  where,
} from "firebase/firestore";

interface ServiceHistoryItem {
  service: string;
  userId: string;
  requestId: string;
  completedAt: number;
  mechanicId?: string;
  vehicle?: any;
}

export default function MechHome() {
  const router = useRouter();
  const mechanicId = auth.currentUser?.uid;

  const [loading, setLoading] = useState(true);
  const [trackingStarted, setTrackingStarted] = useState(false);
  const [mechanicLocation, setMechanicLocation] =
    useState<{ lat: number; lng: number } | null>(null);

  const [requests, setRequests] = useState(0);
  const [completed, setCompleted] = useState(0);

  const [history, setHistory] = useState<ServiceHistoryItem[]>([]);

  // RATING STATE
  const [avgRating, setAvgRating] = useState<number>(0);
  const [ratingCount, setRatingCount] = useState<number>(0);

  // FILTER
  const [filter, setFilter] = useState<"today" | "week" | "all">("all");

  // FILTER HISTORY
  function getFilteredHistory() {
    const now = new Date();

    if (filter === "today") {
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      return history.filter((i) => i.completedAt >= today.getTime());
    }

    if (filter === "week") {
      const weekStart = new Date(now);
      weekStart.setDate(now.getDate() - ((now.getDay() + 6) % 7));
      weekStart.setHours(0, 0, 0, 0);
      return history.filter((i) => i.completedAt >= weekStart.getTime());
    }

    return history;
  }

  useEffect(() => {
    async function enableTracking() {
      const allowed = await startMechanicTracking();
      setTrackingStarted(allowed);
      setLoading(false);
    }
    enableTracking();
    return () => stopMechanicTracking();
  }, []);

  useEffect(() => {
    if (!mechanicId) return;

    const unsub = onSnapshot(
      doc(firestore, "mechanics", mechanicId),
      (snap) => {
        if (!snap.exists()) return;

        const data = snap.data();

        setMechanicLocation({ lat: data.lat, lng: data.lng });
        setRequests(data.requests ?? 0);
        setCompleted(data.completed ?? 0);

        setAvgRating(data.ratingAvg ?? 0);
        setRatingCount(data.ratingCount ?? 0);
      }
    );

    return () => unsub();
  }, [mechanicId]);

  // SERVICE HISTORY
  useEffect(() => {
    if (!mechanicId) return;

    const q = query(
      collection(firestore, "serviceHistory"),
      where("mechanicId", "==", mechanicId)
    );

    const unsub = onSnapshot(q, (snap) => {
      const list: ServiceHistoryItem[] = snap.docs.map(
        (d) => d.data() as ServiceHistoryItem
      );
      setHistory([...list].reverse());
    });

    return () => unsub();
  }, [mechanicId]);

  if (loading) {
    return (
      <SafeAreaView style={styles.center}>
        <ActivityIndicator size="large" color="#60A5FA" />
        <Text style={{ color: "#ccc", marginTop: 10 }}>
          Preparing mechanic location...
        </Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <Text style={styles.title}>Hello, Mechanic 👨‍🔧</Text>
        <Text style={styles.subtitle}>Your live location is being tracked</Text>

        {/* STATUS */}
        <View style={styles.statusCard}>
          <Ionicons
            name={trackingStarted ? "location" : "alert-circle"}
            size={35}
            color={trackingStarted ? "#4ADE80" : "#F87171"}
          />
          <View>
            <Text style={styles.statusLabel}>Live Tracking</Text>
            <Text
              style={[
                styles.statusValue,
                { color: trackingStarted ? "#4ADE80" : "#F87171" },
              ]}
            >
              {trackingStarted ? "ACTIVE" : "WAITING"}
            </Text>
          </View>
        </View>

        {/* MAP */}
        <Text style={styles.mapTitle}>Your Location</Text>
        <View style={styles.mapContainer}>
          {mechanicLocation ? (
            <MapComponent
              user={{
                lat: mechanicLocation.lat,
                lng: mechanicLocation.lng,
              }}
              mechanics={[]}
            />
          ) : (
            <Text style={styles.mapLoadingText}>
              Loading your live location...
            </Text>
          )}
        </View>

        {/* STATS */}
        <View style={styles.gridRow}>
          <View style={styles.statCard}>
            <Ionicons name="list-outline" size={30} color="#4ADE80" />
            <Text style={styles.statLabel}>Requests</Text>
            <Text style={styles.statValue}>{requests}</Text>
          </View>

          <View style={styles.statCard}>
            <Ionicons name="checkmark-done-outline" size={30} color="#60A5FA" />
            <Text style={styles.statLabel}>Completed</Text>
            <Text style={styles.statValue}>{completed}</Text>
          </View>
        </View>

        <View style={styles.gridRow}>
          <View style={styles.statCard}>
            <Ionicons name="star" size={30} color="#FACC15" />
            <Text style={styles.statLabel}>Rating</Text>
            <Text style={styles.statValue}>
              {avgRating > 0 ? avgRating.toFixed(1) : "0"}
            </Text>
            <Text style={{ color: "#94A3B8", fontSize: 12 }}>
              ({ratingCount} ratings)
            </Text>
          </View>

          <TouchableOpacity
            style={styles.statCard}
            onPress={() => router.push("/mechlayout/mrequest")}
          >
            <Ionicons name="open-outline" size={30} color="#A78BFA" />
            <Text style={styles.statLabel}>Incoming</Text>
            <Text style={[styles.statValue, { fontSize: 18 }]}>View</Text>
          </TouchableOpacity>
        </View>

        {/* FILTER */}
        <View style={styles.filterRow}>
          {["today", "week", "all"].map((f) => (
            <TouchableOpacity
              key={f}
              style={[
                styles.filterBtn,
                filter === f && styles.filterActive,
              ]}
              onPress={() => setFilter(f as any)}
            >
              <Text style={styles.filterText}>
                {f === "today" ? "Today" : f === "week" ? "This Week" : "All"}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* HISTORY */}
        <Text style={[styles.mapTitle, { marginTop: 25 }]}>
          Service History
        </Text>

        {getFilteredHistory().length === 0 ? (
          <Text style={{ color: "#64748B", marginTop: 10 }}>
            No history found.
          </Text>
        ) : (
          getFilteredHistory().map((item, index) => (
            <View key={index} style={styles.historyCard}>
              <Text style={styles.histService}>{item.service}</Text>
              <Text style={styles.histSmall}>User: {item.userId}</Text>
              <Text style={styles.histSmall}>
                Completed: {new Date(item.completedAt).toLocaleString()}
              </Text>
            </View>
          ))
        )}

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#0B1120",
    paddingTop: 15,
    paddingHorizontal: 22,
  },
  center: {
    flex: 1,
    backgroundColor: "#0B1120",
    justifyContent: "center",
    alignItems: "center",
  },
  title: { color: "#E2E8F0", fontSize: 26, fontWeight: "700", marginTop: 10 },
  subtitle: { color: "#64748B", fontSize: 14, marginTop: 5 },

  statusCard: {
    backgroundColor: "#111827",
    marginTop: 25,
    padding: 18,
    borderRadius: 14,
    flexDirection: "row",
    alignItems: "center",
    gap: 20,
  },
  statusLabel: { color: "#64748B", fontSize: 14 },
  statusValue: { fontSize: 22, fontWeight: "700", marginTop: 4 },

  mapTitle: { color: "#fff", fontSize: 20, marginTop: 25, marginBottom: 10 },

  mapContainer: {
    height: 300,
    borderRadius: 15,
    overflow: "hidden",
    backgroundColor: "#1B2536",
  },
  mapLoadingText: { color: "#8AA4C2", textAlign: "center", marginTop: 20 },

  gridRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 25,
  },
  statCard: {
    backgroundColor: "#111827",
    width: "48%",
    paddingVertical: 18,
    borderRadius: 14,
    alignItems: "center",
  },
  statLabel: { color: "#94A3B8", fontSize: 14 },
  statValue: {
    color: "#F1F5F9",
    fontSize: 26,
    fontWeight: "800",
    marginTop: 5,
  },

  filterRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 25,
  },
  filterBtn: {
    width: "32%",
    backgroundColor: "#1E293B",
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: "center",
  },
  filterActive: { backgroundColor: "#2563EB" },
  filterText: { color: "#fff", fontWeight: "700" },

  historyCard: {
    backgroundColor: "#1E293B",
    padding: 14,
    borderRadius: 12,
    marginBottom: 12,
  },
  histService: { color: "#E2E8F0", fontSize: 18, fontWeight: "700" },
  histSmall: { color: "#94A3B8", fontSize: 13, marginTop: 3 },
});
