// app/userlayout/services.tsx

import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Image,
  ScrollView,
  StyleSheet,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";

export default function ServicesScreen() {
  const router = useRouter();
  const [searchText, setSearchText] = useState("");

  const breakdownServices = [
    { id: 1, title: "Flat Tyre", icon: require("../../assets/services/tyre.png") },
    { id: 2, title: "Puncture Fix", icon: require("../../assets/services/puncture.png") },
    { id: 3, title: "Battery Issue", icon: require("../../assets/services/battery.png") },
    { id: 4, title: "Key Recovery", icon: require("../../assets/services/key.png") },
    { id: 5, title: "Fuel Delivery", icon: require("../../assets/services/fuel.jpg") },
    { id: 6, title: "Minor Repair", icon: require("../../assets/services/repair.jpg") },
    { id: 7, title: "Brake Issue", icon: require("../../assets/services/brake.jpg") },
    { id: 8, title: "Starting Trouble", icon: require("../../assets/services/start.jpg") },
    { id: 9, title: "Engine Issue", icon: require("../../assets/services/engine.jpg") },
    { id: 10, title: "Towing Service", icon: require("../../assets/services/tow.jpg") },
  ];

  const filteredServices = breakdownServices.filter((item) =>
    item.title.toLowerCase().includes(searchText.toLowerCase())
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView showsVerticalScrollIndicator={false}>
        
        {/* HEADER */}
        <View style={styles.header}>
          <Text style={styles.headerText}>Services</Text>
          <Text style={styles.headerSubText}>Choose the service you need</Text>
        </View>

        {/* SEARCH BAR */}
        <View style={styles.searchContainer}>
          <Ionicons name="search-outline" size={22} color="#8AA4C2" />
          <TextInput
            placeholder="Search service..."
            placeholderTextColor="#7b8aaa"
            value={searchText}
            onChangeText={setSearchText}
            style={styles.searchInput}
          />
        </View>

        {/* CATEGORY TITLE */}
        <Text style={styles.categoryTitle}>Available Services</Text>

        {/* SERVICE GRID */}
        <View style={styles.grid}>
          {filteredServices.length === 0 ? (
            <Text style={styles.noResultsText}>No services found...</Text>
          ) : (
            filteredServices.map((item) => (
              <TouchableOpacity
                key={item.id}
                style={styles.serviceCard}
                onPress={() => router.push(`/servicewindow/${item.id}`)}
              >
                <Image
                  source={item.icon}
                  resizeMode="contain"
                  style={styles.serviceIcon}
                />
                <Text style={styles.serviceName}>{item.title}</Text>
              </TouchableOpacity>
            ))
          )}
        </View>

        {/* ⭐ HORIZONTAL VIDEO CALL BUTTON */}
        {/* <TouchableOpacity
          style={styles.videoCallButton}
          onPress={() => router.push("../servicewindow/11")}
        >
          <Ionicons name="videocam-outline" size={28} color="#4DB7FF" />

          <View style={{ marginLeft: 12 }}>
            <Text style={styles.videoCallTitle}>Video Call Assistance</Text>
            <Text style={styles.videoCallSubtitle}>
              Connect live with a mechanic
            </Text>
          </View>
        </TouchableOpacity> */}

        {/* EMERGENCY CARD */}
        <View style={styles.emergencyCard}>
          <Text style={styles.emergencyTitle}>Emergency Contacts</Text>

          <View style={styles.emergencyRow}>
            <Ionicons name="call-outline" size={22} color="#ff4444" />
            <Text style={styles.emergencyText}>Police: 100</Text>
          </View>

          <View style={styles.emergencyRow}>
            <Ionicons name="medical-outline" size={22} color="#ff4444" />
            <Text style={styles.emergencyText}>Ambulance: 102 / 108</Text>
          </View>

          <View style={styles.emergencyRow}>
            <Ionicons name="flame-outline" size={22} color="#ff4444" />
            <Text style={styles.emergencyText}>Fire: 101</Text>
          </View>
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#0E1627",
    paddingTop: 10,
  },

  header: {
    paddingHorizontal: 20,
    marginBottom: 10,
  },

  headerText: {
    color: "#fff",
    fontSize: 26,
    fontWeight: "700",
  },

  headerSubText: {
    color: "#8AA4C2",
    fontSize: 15,
    marginTop: 4,
  },

  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#1B2536",
    marginHorizontal: 20,
    paddingHorizontal: 15,
    paddingVertical: 12,
    borderRadius: 14,
    marginTop: 20,
  },

  searchInput: {
    flex: 1,
    marginLeft: 10,
    fontSize: 16,
    color: "#fff",
  },

  categoryTitle: {
    color: "#fff",
    fontSize: 20,
    fontWeight: "600",
    paddingHorizontal: 20,
    marginVertical: 18,
  },

  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    paddingHorizontal: 20,
  },

  serviceCard: {
    width: "47%",
    backgroundColor: "#1B2536",
    borderRadius: 14,
    paddingVertical: 22,
    alignItems: "center",
    marginBottom: 16,
  },

  serviceIcon: {
    width: 55,
    height: 55,
    marginBottom: 12,
  },

  serviceName: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },

  noResultsText: {
    color: "#8AA4C2",
    textAlign: "center",
    width: "100%",
    marginTop: 20,
    fontSize: 16,
  },

  videoCallButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#1B2536",
    marginHorizontal: 20,
    padding: 16,
    borderRadius: 16,
    marginTop: 10,
    borderWidth: 1,
    borderColor: "#243859",
  },

  videoCallTitle: {
    color: "#fff",
    fontSize: 17,
    fontWeight: "700",
  },

  videoCallSubtitle: {
    color: "#9CB4D4",
    fontSize: 13,
    marginTop: 2,
  },

  emergencyCard: {
    backgroundColor: "#1B2536",
    marginHorizontal: 20,
    padding: 20,
    borderRadius: 16,
    marginTop: 30,
  },

  emergencyTitle: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 14,
  },

  emergencyRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },

  emergencyText: {
    color: "#fff",
    marginLeft: 10,
    fontSize: 16,
  },
});