// components/batterywindow.tsx

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

export default function BatteryWindow() {
  const router = useRouter();

  // SERVICE CONSTANTS
  const SERVICE_NAME = "Battery";
  const PRICE = 250;
  const IMAGE_URL =
    "https://www.mrtyre.com/wp-content/uploads/2023/01/Charging-Car-Battery-Mr-Tyre-scaled.jpg";

  // HANDLE REQUEST
  const handleRequest = async () => {
    try {
      if (!auth.currentUser) {
        alert("You must be logged in to request a service.");
        return;
      }

      const requestId = await createServiceRequest(
        auth.currentUser.uid,
        SERVICE_NAME,
        { amount: PRICE }
      );

      alert("Battery service requested successfully!");
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

          <Text style={styles.headerTitle}>{SERVICE_NAME} Issue</Text>
        </View>

        {/* IMAGE */}
        <Image source={{ uri: IMAGE_URL }} style={styles.bannerImage} />

        {/* ABOUT CARD */}
        <View style={styles.infoCard}>
          <Text style={styles.sectionTitle}>About the Service</Text>
          <Text style={styles.description}>
            Quick jumpstart, battery inspection, or full battery replacement 
            by nearby certified mechanics. Fast response & trusted service.
          </Text>
        </View>

        {/* PRICE CARD */}
        <View style={styles.priceCard}>
          <View>
            <Text style={styles.priceLabel}>Total Amount</Text>
            <Text style={styles.priceNote}>Includes mechanic visit</Text>
          </View>

          <View style={{ alignItems: "flex-end" }}>
            <Text style={styles.priceValue}>₹{PRICE}</Text>
          </View>
        </View>

        {/* REQUEST BUTTON */}
        <TouchableOpacity style={styles.continueBtn} onPress={handleRequest}>
          <Text style={styles.continueText}>Request Service</Text>
        </TouchableOpacity>

        <View style={{ height: 50 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#071424",
  },

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
    marginTop: 12,
    borderWidth: 1,
    borderColor: "#144d74",
  },

  infoCard: {
    backgroundColor: "#0E2339",
    marginHorizontal: 20,
    marginTop: 25,
    padding: 20,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#113A60",
  },

  sectionTitle: {
    color: "#E9F1FF",
    fontSize: 20,
    fontWeight: "700",
    marginBottom: 10,
  },

  description: {
    color: "#9CB4D4",
    fontSize: 15,
    lineHeight: 22,
  },

  priceCard: {
    backgroundColor: "#10263D",
    marginHorizontal: 20,
    marginTop: 20,
    padding: 18,
    borderRadius: 14,
    flexDirection: "row",
    justifyContent: "space-between",
    borderWidth: 1,
    borderColor: "#1E3D59",
  },

  priceLabel: {
    color: "#DCE7F5",
    fontSize: 18,
    fontWeight: "600",
  },

  priceNote: {
    color: "#7b9abd",
    fontSize: 13,
    marginTop: 4,
  },

  priceValue: {
    color: "#4DB7FF",
    fontSize: 28,
    fontWeight: "800",
  },

  continueBtn: {
    backgroundColor: "#1E90FF",
    marginHorizontal: 20,
    marginTop: 35,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
  },

  continueText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "700",
  },
});
