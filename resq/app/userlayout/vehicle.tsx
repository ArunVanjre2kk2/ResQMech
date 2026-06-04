// app/userlayout/vehicle.tsx

import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { firestore, auth } from "../../firebase/firebaseConfig";
import { doc, getDoc, setDoc } from "firebase/firestore";

export default function VehicleScreen() {
  const [brand, setBrand] = useState("");
  const [model, setModel] = useState("");
  const [fuelType, setFuelType] = useState("");
  const [carNumber, setCarNumber] = useState("");
  const [transmission, setTransmission] = useState("");
  const [loading, setLoading] = useState(false);

  const loadVehicle = async () => {
    try {
      const user = auth.currentUser;
      if (!user) return;

      const snap = await getDoc(doc(firestore, "vehicle", user.uid));
      if (snap.exists()) {
        const data = snap.data();

        setBrand(data.brand || "");
        setModel(data.model || "");
        setFuelType(data.fuelType || "");
        setCarNumber(data.carNumber || "");
        setTransmission(data.transmission || "");
      }
    } catch (err) {
      console.log("Error loading vehicle:", err);
    }
  };

  useEffect(() => {
    loadVehicle();
  }, []);

  // Save vehicle details
  const saveVehicle = async () => {
    if (!brand || !model || !fuelType || !carNumber || !transmission) {
      return Alert.alert("Missing Fields", "Please fill all details.");
    }

    try {
      setLoading(true);
      const user = auth.currentUser;
      if (!user) return;

      await setDoc(doc(firestore, "vehicle", user.uid), {
        userId: user.uid,
        brand,
        model,
        fuelType,
        carNumber,
        transmission,
      });

      Alert.alert("Success", "Vehicle details saved!");

    } catch (err) {
      console.log(err);
      Alert.alert("Error", "Could not save details.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView showsVerticalScrollIndicator={false}>
        
        {/* HEADER */}
        <View style={styles.header}>
          <Text style={styles.headerText}>Vehicle Details</Text>
          <Text style={styles.headerSubtitle}>Enter your car information</Text>
        </View>

        {/* FORM */}
        <View style={styles.formContainer}>
          
          <Text style={styles.label}>Car Brand</Text>
          <TextInput
            placeholder="e.g., Toyota"
            placeholderTextColor="#8AA4C2"
            value={brand}
            onChangeText={setBrand}
            style={styles.input}
          />

          <Text style={styles.label}>Car Model</Text>
          <TextInput
            placeholder="e.g., Creta, Swift"
            placeholderTextColor="#8AA4C2"
            value={model}
            onChangeText={setModel}
            style={styles.input}
          />

          <Text style={styles.label}>Fuel Type</Text>
          <TextInput
            placeholder="Petrol / Diesel / CNG / EV"
            placeholderTextColor="#8AA4C2"
            value={fuelType}
            onChangeText={setFuelType}
            style={styles.input}
          />

          <Text style={styles.label}>Car Number</Text>
          <TextInput
            placeholder="KA 00 AA 1111"
            placeholderTextColor="#8AA4C2"
            value={carNumber}
            onChangeText={setCarNumber}
            autoCapitalize="characters"
            style={[styles.input, { textTransform: "uppercase" }]}
          />

          <Text style={styles.label}>Transmission</Text>
          <TextInput
            placeholder="Manual / Automatic"
            placeholderTextColor="#8AA4C2"
            value={transmission}
            onChangeText={setTransmission}
            style={styles.input}
          />
        </View>

        {/* SAVE BUTTON */}
        <TouchableOpacity
          style={styles.saveButton}
          onPress={saveVehicle}
          disabled={loading}
        >
          <Text style={styles.saveButtonText}>
            {loading ? "Saving..." : "Save / Update Details"}
          </Text>
        </TouchableOpacity>

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

  headerSubtitle: {
    color: "#8AA4C2",
    fontSize: 15,
    marginTop: 4,
  },

  formContainer: {
    paddingHorizontal: 20,
    marginTop: 10,
  },

  label: {
    color: "#8AA4C2",
    marginBottom: 6,
    fontSize: 15,
  },

  input: {
    backgroundColor: "#1B2536",
    color: "#fff",
    padding: 14,
    borderRadius: 14,
    marginBottom: 20,
    fontSize: 16,
    borderWidth: 1,
    borderColor: "#23304d",
  },

  saveButton: {
    backgroundColor: "#0066FF",
    marginHorizontal: 20,
    marginTop: 15,
    paddingVertical: 15,
    borderRadius: 14,
    alignItems: "center",
  },

  saveButtonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "700",
  },
});
