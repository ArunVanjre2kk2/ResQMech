// components/flattyrewindow.tsx

import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  ScrollView,
  StyleSheet,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { createServiceRequest } from "../app/services/requestService.js";
import { auth } from "../firebase/firebaseConfig";

export default function FlatTyreWindow() {
  const router = useRouter();

  // CONSTANTS
  const SERVICE_NAME = "Flat Tyre";
  const PRICE = 199;

  // HANDLE REQUEST
  const handleRequest = async () => {
    try {
      if (!auth.currentUser) {
        alert("You must be logged in to request a service.");
        return;
      }

      await createServiceRequest(auth.currentUser.uid, SERVICE_NAME, {
        amount: PRICE,
      });

      alert("Flat tyre service requested successfully!");
      router.replace("/userlayout/home");
    } catch (error) {
      console.log("Request Error:", error);
      alert("Failed to request service. Try again.");
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView showsVerticalScrollIndicator={false}>
        
        {/* HEADER */}
        <View style={styles.headerRow}>
          <TouchableOpacity onPress={() => router.replace("/userlayout/services")}>
            <Ionicons name="arrow-back" size={26} color="#9CC4FF" />
          </TouchableOpacity>

          <Text style={styles.headerTitle}>Flat Tyre</Text>
        </View>

        {/* IMAGE */}
        <Image
          source={{
            uri:
              "https://media.istockphoto.com/id/1163670202/photo/selective-focus-flat-tire-of-old-car-park-on-the-street-waiting-for-repair-copy-space.jpg?s=612x612&w=0&k=20&c=UH1v2y4Xkogfxw8tk_JOogDdrRh0Of2O__g8LHtwg9g=",
          }}
          style={styles.bannerImage}
        />

        {/* INFO CARD */}
        <View style={styles.infoCard}>
          <Text style={styles.sectionTitle}>Service Details</Text>

          <Text style={styles.description}>
            Quick tyre replacement or patching service delivered straight to your
            breakdown location. Suitable for puncture, low air, or completely flat tyres.
          </Text>
        </View>

        {/* HIGHLIGHTS */}
        <View style={styles.highlightBox}>
          <Ionicons name="car-outline" size={28} color="#4DB7FF" />
          <View style={{ marginLeft: 12 }}>
            <Text style={styles.highlightTitle}>What’s Included</Text>
            <Text style={styles.highlightText}>• Tyre inspection</Text>
            <Text style={styles.highlightText}>• Air refill / puncture fix</Text>
            <Text style={styles.highlightText}>• Replacement if required</Text>
          </View>
        </View>

        {/* PRICE CARD */}
        <View style={styles.priceCard}>
          <Text style={styles.priceLabel}>Service Charge</Text>

          <View style={{ alignItems: "flex-end" }}>
            <Text style={styles.priceValue}>₹{PRICE}</Text>
          </View>
        </View>

        {/* REQUEST BUTTON */}
        <TouchableOpacity style={styles.requestBtn} onPress={handleRequest}>
          <Text style={styles.requestText}>Request Service</Text>
        </TouchableOpacity>

        <View style={{ height: 60 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#071424" },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 10,
  },
  headerTitle: {
    marginLeft: 15,
    fontSize: 24,
    fontWeight: "700",
    color: "#E9F1FF",
  },
  bannerImage: {
    width: "90%",
    height: 220,
    borderRadius: 16,
    alignSelf: "center",
    marginTop: 10,
    borderWidth: 1,
    borderColor: "#123A5C",
  },
  infoCard: {
    backgroundColor: "#0E2339",
    marginHorizontal: 20,
    marginTop: 25,
    padding: 20,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#113A60",
  },
  sectionTitle: {
    color: "#E9F1FF",
    fontSize: 20,
    fontWeight: "700",
    marginBottom: 10,
  },
  description: { color: "#9CB4D4", fontSize: 15, lineHeight: 22 },
  highlightBox: {
    backgroundColor: "#10263D",
    marginHorizontal: 20,
    marginTop: 20,
    padding: 16,
    borderRadius: 16,
    flexDirection: "row",
    borderWidth: 1,
    borderColor: "#2E4A6B",
  },
  highlightTitle: {
    color: "#4DB7FF",
    fontSize: 16,
    fontWeight: "700",
    marginBottom: 4,
  },
  highlightText: { color: "#CFD9E6", fontSize: 14, lineHeight: 20 },
  priceCard: {
    backgroundColor: "#10263D",
    marginHorizontal: 20,
    marginTop: 25,
    padding: 18,
    borderRadius: 16,
    flexDirection: "row",
    justifyContent: "space-between",
    borderWidth: 1,
    borderColor: "#1E3D59",
  },
  priceLabel: { color: "#DCE7F5", fontSize: 18, fontWeight: "600" },
  priceValue: { color: "#4DB7FF", fontSize: 28, fontWeight: "800" },
  requestBtn: {
    backgroundColor: "#1E90FF",
    marginHorizontal: 20,
    marginTop: 35,
    paddingVertical: 15,
    borderRadius: 14,
    alignItems: "center",
  },
  requestText: { color: "#fff", fontSize: 18, fontWeight: "700" },
});
