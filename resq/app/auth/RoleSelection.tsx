// app/auth/RoleSelection.tsx

import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Image,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

export default function RoleSelection() {
  const router = useRouter();

  const chooseRole = (role: "user" | "mechanic") => {
    router.push({
      pathname: "/auth/SignupScreen",
      params: { role },
    } as any);
  };

  return (
    <SafeAreaView style={styles.container}>
      <Image
        source={require("../../assets/services/icon.png")} 
        style={styles.topImage}
        resizeMode="contain"
      />

      <Text style={styles.title}>Select Your Role</Text>

      {/* USER CARD */}
      <TouchableOpacity
        style={styles.card}
        onPress={() => chooseRole("user")}
      >
        <View style={styles.iconCircle}>
          <Ionicons name="person-outline" size={40} color="#00BFFF" />
        </View>

        <Text style={styles.cardTitle}>User</Text>
        <Text style={styles.cardSubtitle}>
          Get roadside assistance quickly
        </Text>
      </TouchableOpacity>

      {/* MECHANIC CARD */}
      <TouchableOpacity
        style={styles.card}
        onPress={() => chooseRole("mechanic")}
      >
        <View style={styles.iconCircle}>
          <Ionicons name="construct-outline" size={40} color="#FFD700" />
        </View>

        <Text style={styles.cardTitle}>Mechanic</Text>
        <Text style={styles.cardSubtitle}>
          Provide on-spot repair services
        </Text>
      </TouchableOpacity>

    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#07080cff",
    alignItems: "center",
    paddingTop: 40,
  },

  topImage: {
    width: 180,
    height: 180,
    marginBottom: 30,
  },

  title: {
    color: "#fff",
    fontSize: 28,
    fontWeight: "700",
    marginVertical: 15,
  },

  card: {
    width: "85%",
    backgroundColor: "#1B2536",
    paddingVertical: 30,
    borderRadius: 18,
    alignItems: "center",
    marginVertical: 15,
    borderWidth: 1,
    borderColor: "#233044",
  },

  iconCircle: {
    width: 75,
    height: 75,
    borderRadius: 40,
    backgroundColor: "#0E1627",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#233044",
    marginBottom: 15,
  },

  cardTitle: {
    fontSize: 22,
    fontWeight: "700",
    color: "#fff",
  },

  cardSubtitle: {
    marginTop: 6,
    fontSize: 14,
    color: "#8AA4C2",
  },
});
